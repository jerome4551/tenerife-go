/* modulos/entrenador/isquiotibiales.<huella>.js — Jérôme, el entrenador: las coreografías de «isquiotibiales» (22 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/7a-isquiotibiales.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('isquiotibiales', function (N) {
    var ALTO_MUN = N.ALTO_MUN, COREO = N.COREO, D = N.D, EN_SUELO = N.EN_SUELO, PIE = N.PIE, PRONO = N.PRONO, RAD = N.RAD, SUELTA = N.SUELTA,
        SUPINO_SUELO = N.SUPINO_SUELO, aLosLados = N.aLosLados, abre = N.abre, agarreDe = N.agarreDe, apoyada = N.apoyada, bajaSube = N.bajaSube,
        bajoZapa = N.bajoZapa, busca = N.busca, colgando = N.colgando, conAgarre = N.conAgarre, cuelga = N.cuelga, deTalon = N.deTalon, el = N.el,
        enSusMuslos = N.enSusMuslos, entre = N.entre, estirado = N.estirado, inclinado = N.inclinado, largo = N.largo, mas = N.mas, menos = N.menos,
        plano = N.plano, por = N.por, porArco = N.porArco, refleja = N.refleja, reflejo = N.reflejo, resolver = N.resolver, sobre = N.sobre,
        unidad = N.unidad;
  /* ───────────────────────── las coreografías: ISQUIOTIBIALES (bloque 11) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: la bisagra de cadera sobre los dos pies (el peso muerto rumano en polea, los
     buenos días y los pesos muertos con las piernas rectas y con apoyo escalonado), el peso muerto a una pierna (sin peso,
     con pesa rusa, con mancuerna, en polea y con salto), los curls (de pie, en polea, tumbado sobre una toalla y el
     nórdico), boca abajo en el banco, el balanceo de pierna, los estiramientos y el isométrico sentado. */
  (function () {
    var T2 = ['ti', 'td'], NADA = [];

    /* ══════════════════════════════ AYUDAS (cada trozo lleva las suyas: son las de los bloques 9 y 10) ══════════════════════════════ */
    /* lo más alto que puede ir la cadera con un tobillo a «d» cm (en planta) de la vertical de su cadera: la pierna, a 0,2 cm de estirarse del todo */
    function altoCon(d) { return D.tobillo + Math.sqrt(77.8 * 77.8 - d * d); }
    /* un pie en el aire, mirando «g» grados hacia fuera y con la punta algo caída (el izquierdo; el derecho, con −g) */
    function alAire(g, cae) { var c = cae == null ? 0.14 : cae, k = Math.sqrt(1 - c * c), t = g * RAD; return { punta: [k * Math.sin(t), -c, k * Math.cos(t)], arriba: [c * Math.sin(t), k, c * Math.cos(t)] }; }
    /* las manos detrás de la cabeza y en la cintura (como en los bloques 9 y 10) */
    var NUCA = { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, 0.15] }, EN_CINTURA = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };
    /* ABRIR LOS PIES. De pie, de un apoyo (de: [x, abre]) a otro más abierto (a: [x, abre]): primero el pie izquierdo y después el derecho,
       cada uno por el aire y girando ya hacia donde va a apuntar, con el peso en el otro. Añade las posturas (pre0 a pre3; «fin» la pone
       quien llama) y devuelve los tramos, con los dos tobillos clavados a su camino */
    function abrirPies(posturas, pre, base, de, a, fin, seg) {
      var pie = function (q, polo) { return { suelo: [q[0], 0], abre: q[1], polo: polo }; }, m = [(de[0] + a[0]) / 2, (de[1] + a[1]) / 2], d = (seg || 2.2) / 4;
      var y0 = Math.min(PIE, altoCon(de[0] - D.caderaX)), y1 = altoCon(a[0] - D.caderaX + 2);
      posturas[pre + '0'] = sobre(base, { pel: [0, y0, 0], p: pie(de) });
      posturas[pre + '1'] = sobre(base, { pel: [-3.5, y0 - 0.8, 0], pi: { a: [m[0], D.tobillo + 5, 1], polo: [0.2, 0.1, 1] }, ti: alAire(m[1]), pd: reflejo(pie(de)) });
      posturas[pre + '2'] = sobre(base, { pel: [(a[0] - de[0]) / 2, y1, 0], pi: pie(a), pd: reflejo(pie(de)) });
      posturas[pre + '3'] = sobre(base, { pel: [(a[0] - de[0]) / 2 + 3.5, y1 - 0.8, 0], pi: pie(a), pd: { a: [-m[0], D.tobillo + 5, 1], polo: [-0.2, 0.1, 1] }, td: alAire(-m[1]) });
      return [[pre + '1', d, 'entra', T2], [pre + '2', d, 'sale', T2], [pre + '3', d, 'entra', T2], [fin, d, 'sale', T2]];
    }
    /* la barra, sobre los hombros (pegada al tórax), y las manos en ella, a 34 cm del centro */
    var ESPALDA = ['barra', { ancla: 'torax', en: [0, 23, -9.5], discos: 17 }], A_LA_BARRA = { hom: [0, -1.5], b: { a: [34, 21, -9], en: 'torax', polo: [0.6, -1, -0.5] }, m: PRONO };
    function conBarra(P) { return sobre(P, A_LA_BARRA); }
    function enBarra(n) { return ['mi@' + n + ':34', 'md@' + n + ':-34']; }

    /* ══════════════════════════════ LA BISAGRA DE CADERA, SOBRE LOS DOS PIES ══════════════════════════════
       Como el peso muerto rumano del bloque 1: la cadera va atrás, el tronco se inclina con la espalda recta y lo que llevan las manos
       baja a plomo de los hombros, pegado a las piernas */
    var BISAGRA = { pel: [0, 79, -27], giro: [0, 82, 0], cab: [-22, 0, 0] };

    /* el peso muerto rumano en polea: un cable en cada mano (la máquina, delante, con las dos poleas en lo más bajo), los pies a la
       anchura de los hombros y las rodillas algo dobladas; se inclina doblando la cadera y los cables llevan despacio las manos hacia los
       pies; y extiende la cadera para volver arriba, con la espalda recta todo el rato */
    COREO['peso-muerto-rumano-polea'] = (function () {
      var pies = { suelo: [15, 0], abre: 6 }, ZC = 72;
      var a = { pel: [0, PIE - 2.5, -2], p: pies, b: { cuelga: [-1, 10], largo: 50 }, m: PRONO };
      var b = sobre(BISAGRA, { p: pies, b: { cuelga: [-1, -5], largo: 50 }, m: PRONO });
      return {
        vista: [[62, 12], [112, 12]], rastro: 'manos', esfuerzo: [2], clavos: T2,
        material: [['polea', { en: [13, ZC], alto: 16, a: 'i', agarre: 'asa', encuadre: 150 }], ['polea', { en: [-13, ZC], alto: 16, a: 'd', agarre: 'asa', encuadre: 150 }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [1.9, 0.35, 1.3, 0.5]),
        pasos: ['a', { sec: [['b', 2.0, 'freno']], desde: 'a' }, { rep: 2.25 }]
      };
    })();

    /* los buenos días con barra: la barra, sobre los hombros; con la cabeza alta y la espalda recta, se inclina desde la cintura hasta que
       la espalda queda paralela al suelo (la cadera va atrás y las rodillas ceden un poco); y vuelve */
    COREO['buenos-dias-barra'] = (function () {
      var pies = { suelo: [13, 0], abre: 7 }, K = T2.concat(enBarra(0));
      var a = conBarra({ p: pies });
      var b = conBarra({ pel: [0, PIE - 5.6, -27.5], giro: [0, 88, 0], cab: [-46, 0, 0], p: pies });
      return {
        vista: [[66, 12], [114, 14]], rastro: 'hombros', esfuerzo: [2], clavos: K, material: [ESPALDA],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [2.0, 0.35, 1.5, 0.5]),
        pasos: ['a', { sec: [['b', 2.1, 'freno']], desde: 'a' }, { rep: 2.35 }]
      };
    })();

    /* los buenos días con las piernas abiertas: de pie, separa los pies más que los hombros, con las puntas un poco hacia fuera, y lleva
       las manos detrás de la cabeza; inclina el tronco hacia el suelo doblando la cadera, con la espalda recta y el pecho abierto (los
       codos, hacia los lados); y vuelve a subir despacio */
    COREO['buenos-dias-piernas-abiertas'] = (function () {
      var DE = [10, 5], A = [33, 14], P = {}, sueltos = { b: aLosLados(10), m: SUELTA }, pies = { suelo: [A[0], 0], abre: A[1] };
      P.s = sobre(sueltos, { pel: [0, altoCon(A[0] - D.caderaX), 0], p: pies });
      var abre = abrirPies(P, 'o', sueltos, DE, A, 's', 1.8);
      P.a = { pel: [0, altoCon(A[0] - D.caderaX), 0], hom: [0, -1.5], p: pies, b: NUCA, m: SUELTA };
      P.b = { pel: [0, altoCon(Math.sqrt((A[0] - D.caderaX) * (A[0] - D.caderaX) + 16 * 16)) - 0.5, -16], giro: [0, 74, 0], cab: [-20, 0, 0], hom: [0, -1.5], p: pies, b: NUCA, m: SUELTA };
      return {
        vista: [[58, 12], [108, 14]], rastro: 'cab', esfuerzo: [2], clavos: T2,
        posturas: P, inicio: 'a', encuadra: ['o0', 'b'],
        rep: bajaSube('b', 'a', [1.7, 0.3, 1.9, 0.5]),
        pasos: [{ sec: [['o0', 0.4, null, T2]].concat(abre, [['a', 1.1, 'suave', T2]]), desde: 'o0' }, { sec: [['b', 1.9, 'freno']], desde: 'a' }, { rep: 2.0 }]
      };
    })();

    /* el peso muerto con las piernas rígidas: de pie, con los pies a la anchura de los hombros y la barra cogida por encima, con las manos
       a esa misma anchura; con las piernas y la espalda rectas, se inclina desde la cadera y baja la barra hacia el empeine; y vuelve
       arriba extendiendo la cadera (abajo, los hombros se van un poco hacia delante; al final los lleva atrás) */
    COREO['peso-muerto-piernas-rigidas'] = (function () {
      var pies = { suelo: [16, 0], abre: 5 }, ZA = -19;
      var recta = function (d) { return D.tobillo + Math.sqrt(77.95 * 77.95 - d * d); };      /* a 0,05 cm de estirarse del todo: con medio centímetro de menos, la rodilla ya se dobla 13° */
      var a = { pel: [0, recta(6), 0], hom: [0, -1.5], p: pies, b: { cuelga: [0, 10], largo: 50 }, m: PRONO };
      var b = { pel: [0, recta(Math.sqrt(36 + ZA * ZA)), ZA], giro: [0, 86, 0], cab: [-24, 0, 0], hom: [0, 1.6], p: pies, b: { cuelga: [0, -6], largo: 50 }, m: PRONO };
      return {
        vista: [[66, 12], [112, 14]], rastro: 'manos', esfuerzo: [2], clavos: T2, material: [['barra', { discos: 17 }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [2.0, 0.35, 1.4, 0.6]),
        pasos: ['a', { sec: [['b', 2.1, 'freno']], desde: 'a' }, { rep: 2.35 }]
      };
    })();

    /* el peso muerto rumano con apoyo escalonado: la barra, delante de los muslos; un pie (el derecho) va un poco por detrás del otro y
       apoya solo la punta, para equilibrarse; con casi todo el peso en la pierna de delante, la cadera va atrás con la espalda recta y la
       barra baja como en el peso muerto rumano; vuelve arriba extendiendo la cadera y, al terminar, cambia de pierna (junta los pies y
       retrasa el otro) */
    COREO['peso-muerto-rumano-escalonado'] = (function () {
      var ZT = -24, barra = { b: { cuelga: [1, 10], largo: 50 }, m: PRONO }, bajo = { b: { cuelga: [1, -4], largo: 50 }, m: PRONO };
      var del = { suelo: [10, 0], abre: 5 }, atras = { suelo: [-10, ZT], abre: 4, talon: 50, polo: [0, -0.2, 1] }, P = {};
      P.n = sobre(barra, { pel: [0, PIE - 0.3, 0], pi: del, pd: reflejo(del) });
      /* el pie que se retrasa va por el aire (e) y se posa sobre la punta */
      P.e = sobre(barra, { pel: [2, PIE - 0.6, -1], pi: del, pd: { a: [-10, D.tobillo + 6.5, ZT / 2 - 2], polo: [0, 0.1, 1] }, td: alAire(-3, 0.22) });
      P.a = sobre(barra, { pel: [1.5, PIE - 1, -2], pi: del, pd: atras });
      P.b = sobre(BISAGRA, sobre(bajo, { pel: [1.5, 78, -27], pi: del, pd: atras }));
      P.e2 = refleja(P.e); P.a2 = refleja(P.a); P.b2 = refleja(P.b);
      var T = function (n, sg, c) { return [n, sg, c, T2]; };
      return {
        vista: [[64, 12], [112, 14]], rastro: 'manos', esfuerzo: [], clavos: T2, material: [['barra', { discos: 17 }]],
        posturas: P, inicio: 'n', encuadra: ['n', 'b'],
        pasos: [{ sec: [T('n', 0.5), T('e', 0.45, 'entra'), T('a', 0.5, 'sale')], desde: 'n' }, { sec: [T('b', 2.0, 'freno')], desde: 'a' },
                { sec: [T('a', 1.2, 'empuje'), T('e', 0.3, 'entra'), T('n', 0.3, 'sale'), T('e2', 0.3, 'entra'), T('a2', 0.35, 'sale'), T('b2', 1.7, 'freno')], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ EL PESO MUERTO A UNA PIERNA ══════════════════════════════
       Se escribe con el apoyo en la pierna izquierda (su pie no se mueve: en x = 9): la derecha va atrás, recta y en línea con el tronco,
       y lo que se lleva va en la mano derecha, la contraria al apoyo. El otro lado, reflejado. El pie que deja el suelo se despega
       primero un poco, plano y por detrás (despegado): girando desde el suelo con la pierna recta, la punta lo cortaría. Mientras el pie
       libre se despega y se va atrás (y al volver), los dos tobillos van clavados a su camino (el del pie libre va en línea recta de
       una postura a otra: suelto, la pierna se estiraría antes de irse atrás y la zapatilla cortaría el suelo); mientras se mantiene
       una postura, solo el de apoyo. Y (22-11-2026) entre las dos posturas inclinadas (c y b), también solo el de apoyo: ahí la
       pierna libre va recta y en línea con el tronco en las dos, y gira con él; clavada a la línea recta entre sus dos tobillos (medio
       metro de cuerda), se doblaba de paso de 19° a 33° y, en el vídeo, la rodilla cambiaba de lado de golpe (27 cm en un cuadro, con
       la pesa rusa) */
    var APOYO = { suelo: [9, 0], abre: 4, polo: [0.05, 0.1, 1] }, NEUTRA = { tipo: 'puno', prono: 0 };
    function dePie(extra) { return sobre({ pel: [0, PIE - 2, 0], pi: APOYO, pd: reflejo(APOYO) }, extra || {}); }
    function despegado(extra) {
      return sobre({ pel: [3, PIE - 2.5, -1.5], giro: [0, 7, 0], cab: [-2, 0, 0], pi: APOYO, pd: { a: [-9, D.tobillo + 6, -17], polo: [0, 0.1, 1] }, td: { punta: [0, -0.24, 0.971], arriba: [0, 0.971, 0.24] } }, extra || {});
    }
    /* inclinado «ang» grados sobre la pierna izquierda, con la rodilla algo doblada (la cadera va atrás y baja un poco); la pierna libre,
       en línea con el tronco o, si se dice, a «pierna» grados de la vertical (90, horizontal: el pie, a la altura de la cadera) */
    function enUna(ang, extra, tob, pierna) {
      var k = Math.sin(ang * RAD), a = (pierna == null ? ang : pierna) * RAD;
      var P = sobre({ pel: [3, PIE - 3 - 3.5 * k, -15 * k], giro: [0, ang, 0], cab: [-ang * 0.3, 0, 0], pi: APOYO }, extra || {}), c = resolver(P).d.cad;
      return sobre(P, { pd: { a: mas(c, por([0, -Math.cos(a), -Math.sin(a)], 77.8)), polo: [0, -Math.sin(a), Math.cos(a)] }, td: { tob: tob == null ? 24 : tob } });
    }
    /* el puño derecho, colgando del hombro: a «x» del centro y «dz» por delante del hombro, con el brazo estirado */
    function cuelgaD(P, x, dz, polo) { var h = resolver(P).d.hom; return conAgarre(P, [x, h[1] - Math.sqrt(58.5 * 58.5 - (x - h[0]) * (x - h[0]) - dz * dz), h[2] + dz], polo || [-1, 0.2, -0.5], 'bd'); }

    /* sin peso: de pie, con los pies a la anchura de la cadera y las rodillas algo dobladas; la cadera va atrás y el pie izquierdo se
       levanta, con esa pierna estirándose hacia atrás y la espalda recta; se inclina hasta una distancia cómoda (72°; los brazos cuelgan);
       vuelve arriba y, al terminar, cambia de pierna */
    COREO['peso-muerto-una-pierna'] = (function () {
      var cuelgan = { b: { cuelga: [-2, 3], largo: 50 }, m: SUELTA }, I = {}, P = {}, n;
      I.a = dePie({ b: aLosLados(10), m: SUELTA });
      I.m = despegado(cuelgan); I.c = enUna(46, cuelgan); I.b = enUna(72, cuelgan);
      /* la ficha pide primero el apoyo en la pierna derecha: es lo reflejado; el otro lado lleva un «2» */
      for (n in I) { P[n] = refleja(I[n]); if (n !== 'a') P[n + '2'] = I[n]; }
      var KD = ['td'], KI = ['ti'];
      return {
        vista: [[-64, 12], [-114, 14]], rastro: 'pel', esfuerzo: [], clavos: T2, clavosEn: { c: KD, b: KD, b2: KI },
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        pasos: ['a', { sec: [['m', 0.6, 'entra'], ['c', 1.3, 'sale']], desde: 'a' }, { sec: [['b', 1.8, 'suave', KD]], desde: 'c' },
                { sec: [['c', 0.7, 'entra', KD], ['m', 0.5, 'lineal'], ['a', 0.45, 'sale'], ['a', 0.2], ['m2', 0.45, 'entra'], ['c2', 0.6, 'lineal'], ['b2', 0.9, 'sale', KI]], desde: 'b' }]
      };
    })();

    /* con pesa rusa: la pesa, en una mano (la derecha: cuelga junto al muslo), y el peso, sobre una sola pierna (la izquierda: el otro pie
       se despega un poco); se inclina hacia delante desde la cadera hasta tocar el suelo con la pesa (el asa queda a 22,9 cm: la pesa
       cuelga 13,5 y mide 9,2 de radio); y vuelve a ponerse de pie extendiendo la cadera */
    COREO['peso-muerto-una-pierna-kettlebell'] = (function () {
      var XK = -27.5, otro = { bi: aLosLados(14), mi: SUELTA, md: NEUTRA }, KI = ['ti'];
      var a0 = cuelgaD(dePie(otro), XK, 1), a = cuelgaD(despegado(otro), XK, 1);
      var ang = busca(function (x) { return agarreDe(cuelgaD(enUna(x, otro), XK, 1), 'd')[1]; }, 22.9, 60, 100), b = cuelgaD(enUna(ang, sobre(otro, { cab: [-28, 0, 0] })), XK, 1), c = cuelgaD(enUna(ang * 0.55, otro), XK, 1);
      return {
        vista: [[-58, 12], [-112, 14]], rastro: 'md', esfuerzo: [3], clavos: T2, clavosEn: { a: KI, c: KI, b: KI }, material: [['kettlebell', { lado: 'd', cuelga: true }]],
        posturas: { a0: a0, a: a, c: c, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['c', 0.9, 'entra'], ['b', 1.0, 'sale', KI], ['b', 0.35], ['c', 0.6, 'entra', KI], ['a', 0.8, 'sale'], ['a', 0.5]],
        pasos: [{ sec: [['a0', 0.6], ['a', 0.9, 'suave']], desde: 'a0' }, { sec: [['c', 0.95, 'entra'], ['b', 1.05, 'sale', KI]], desde: 'a' }, { rep: 2.25 }]
      };
    })();

    /* con mancuerna: sobre la pierna izquierda, con la mancuerna en la mano derecha (delante del muslo), la rodilla izquierda algo doblada y
       la espalda recta; se inclina desde la cadera izquierda llevando la pierna derecha atrás, recta y con la punta del pie estirada; con
       el brazo derecho estirado, la mancuerna baja en vertical por delante de la pierna de apoyo; empuja el suelo para subir, bajando la
       pierna derecha, y hace una pausa en equilibrio antes de repetir */
    COREO['peso-muerto-una-pierna-mancuerna'] = (function () {
      var XM = -7, otro = { bi: aLosLados(14), mi: SUELTA, md: PRONO }, KI = ['ti'];
      var a = cuelgaD(despegado(otro), XM - 3, 16.5), c = cuelgaD(enUna(48, otro, 52), XM, -2), b = cuelgaD(enUna(80, sobre(otro, { cab: [-26, 0, 0] }), 52), XM, -9);
      return {
        vista: [[-58, 12], [-112, 14]], rastro: 'md', esfuerzo: [2], clavos: T2, clavosEn: { a: KI, c: KI, b: KI }, material: [['mancuernas', { lado: 'd' }]],
        posturas: { a: a, c: c, b: b }, inicio: 'a', encuadra: ['b'],
        rep: [['c', 0.9, 'entra'], ['b', 1.0, 'sale', KI], ['b', 0.3], ['c', 0.6, 'entra', KI], ['a', 0.8, 'sale'], ['a', 1.0]],
        pasos: ['a', { sec: [['c', 1.5, 'suave']], desde: 'a' }, { sec: [['b', 1.5, 'suave', KI]], desde: 'c' }, { rep: 2.2 }]
      };
    })();

    /* en polea: la polea, en lo más bajo y con un asa, y él, de cara a la máquina; carga el peso en la pierna derecha y coge el asa con la
       mano izquierda (se agacha a por ella), con ese brazo estirado, la rodilla derecha algo doblada y la espalda recta; se inclina desde
       la cadera derecha llevando el brazo izquierdo, estirado, hacia delante (hacia la polea, que tira de él); y empuja con el pie derecho
       para volver arriba, bajando la pierna izquierda mientras tira del asa hacia la cadera. (Escrito del otro lado y reflejado) */
    COREO['peso-muerto-una-pierna-polea'] = (function () {
      var ZC = 78, XC = -10, R = [XC, 24, ZC - 24], POLEA = [XC, 16, ZC - 3], otro = { bi: aLosLados(14), mi: SUELTA, md: NEUTRA }, I = {}, P = {}, n;
      /* el puño, en la línea del hombro a la polea, con el brazo estirado */
      var haciaPolea = function (Q) { var h = resolver(Q).d.hom, u = unidad(menos(POLEA, h)); return conAgarre(Q, mas(h, por(u, 58.5)), [-1, 0.3, -0.4], 'bd'); };
      I.s = dePie({ b: aLosLados(10), m: SUELTA });
      I.g = conAgarre(sobre(otro, { pel: [0, 64, -19], giro: [0, 72, 0], cab: [-34, 0, 0], pi: APOYO, pd: reflejo(APOYO) }), R, [-1, 0.3, -0.4], 'bd');
      I.a = haciaPolea(despegado(otro));
      I.c = haciaPolea(enUna(46, otro)); I.b = haciaPolea(enUna(74, sobre(otro, { cab: [-34, 0, 0] })));
      /* arriba: el pie libre, bajo y un poco por detrás (como al despegarse), y el puño, junto a la cadera, con el codo atrás */
      I.t = conAgarre(despegado(otro), [-19.5, PIE + 1, -1], [-0.5, 0.1, -1], 'bd');
      for (n in I) P[n] = refleja(I[n]);
      var KD = ['td'];
      return {
        vista: [[-62, 12], [-114, 14]], rastro: 'mi', esfuerzo: [2], clavos: T2, clavosEn: { a: KD, c: KD, b: KD, t: KD }, reposo: ['s'],
        material: [['polea', { en: [-XC, ZC], alto: 16, a: 'i', agarre: 'asa', reposo: [-R[0], R[1], R[2]], encuadre: 150 }]],
        posturas: P, inicio: 't', encuadra: ['s', 'b'],
        rep: [['c', 0.8, 'entra'], ['b', 1.0, 'sale', KD], ['b', 0.3], ['c', 0.6, 'entra', KD], ['t', 0.9, 'sale'], ['t', 0.6]],
        pasos: ['s', { sec: [['g', 1.2, 'suave'], ['g', 0.25], ['a', 1.3, 'suave']], desde: 's' }, { sec: [['c', 0.75, 'entra'], ['b', 0.95, 'sale', KD]], desde: 'a' }, { rep: 2.1 }]
      };
    })();

    /* con salto: de pie, lleva el pie derecho atrás y lo mantiene en el aire; baja el tronco hasta casi la horizontal, con la mano derecha
       hacia el suelo y el pie derecho a la altura de la cadera; sube y salta con fuerza, llevando la rodilla derecha arriba y el brazo
       izquierdo por encima de la cabeza (el brazo sube por partes: de un tirón, la mano daría un salto); cae sobre el mismo pie y vuelve
       a bajar. Un lado: la ficha pide terminarlo antes de cambiar */
    var PUNTA_ABAJO = { punta: [0, -0.5, 0.866], arriba: [0, 0.866, 0.5] };
    function corre(f) {
      var t = (2.5 + 37.5 * f) * RAD, c = t + (75 + 15 * f) * RAD, x = 19 - 5 * f;
      return { a: [x + 2, D.hombroY - D.brazo * Math.cos(t) - D.antebrazo * Math.cos(c), D.brazo * Math.sin(t) + D.antebrazo * Math.sin(c)], en: 'torax', polo: [0.3, -0.2, -1] };
    }
    COREO['peso-muerto-una-pierna-salto'] = (function () {
      var q = deTalon(46), q2 = deTalon(20), apoyo = function (t) { return { suelo: [9, 0], abre: 4, talon: t || 0, polo: [0.05, 0.1, 1] }; }, P = {};
      var arriba = function (e, d) { return { bi: { e: e, z: 0, g: 0, c: 8 }, bd: reflejo(corre(d)), m: SUELTA }; };
      P.a0 = dePie({ b: aLosLados(12), m: SUELTA });
      P.a = despegado({ b: aLosLados(14), m: SUELTA });
      /* abajo: el tronco, a 80°; la mano derecha cuelga hacia el suelo y el brazo izquierdo queda atrás, doblado */
      P.b = enUna(80, { cab: [-28, 0, 0], bd: { cuelga: [-2, 4], largo: 51 }, md: { tipo: 'abierta', prono: 0 }, bi: corre(-0.5), mi: SUELTA }, 20, 88);
      /* subiendo: el tronco, a medio camino, y la pierna derecha, que viene hacia delante con la rodilla doblada */
      P.u = sobre(arriba(30, 0.1), { pel: [3, 82, -8], giro: [0, 36, 0], cab: [-12, 0, 0], pi: apoyo(), pd: { a: [-9, 32, -30], polo: [0, -0.3, 1] }, td: PUNTA_ABAJO });
      P.m = sobre(arriba(78, 0.55), { pel: [2, 83, -4], giro: [0, 6, 0], pi: apoyo(22), pd: { e: 36, z: 0, c: 92 }, td: { tob: 16 } });
      P.d = sobre(arriba(138, -0.25), { pel: [1, PIE + q[1] - 0.6, q[0]], pi: apoyo(46), pd: { e: 84, z: 0, c: 96 }, td: { tob: 10 } });
      P.s = sobre(arriba(172, -0.9), { pel: [1, PIE + 17, q[0] + 1], pi: { e: 2, z: 0, c: 5 }, ti: { tob: 44 }, pd: { e: 88, z: 0, c: 100 }, td: { tob: 10 } });
      P.c = sobre({ bi: corre(0.5), bd: reflejo(corre(-0.4)), m: SUELTA }, { pel: [2, PIE + q2[1] - 3.5, q2[0] - 2], giro: [0, 5, 0], pi: apoyo(20), pd: { e: 46, z: 0, c: 72 }, td: { tob: 10 } });
      P.l = sobre({ bi: corre(-0.3), bd: reflejo(corre(0.5)), m: SUELTA }, { pel: [3, 78, -7], giro: [0, 10, 0], pi: apoyo(), pd: { a: [-9, 20, -28], polo: [0, -0.4, 1] }, td: PUNTA_ABAJO });
      var KI = ['ti'];
      return {
        vista: [[64, 12], [112, 12]], rastro: 'pel', esfuerzo: [0, 1, 2], clavos: KI, clavosEn: { a0: T2 }, zoom: 0.94,
        posturas: P, inicio: 'b', encuadra: ['a0', 's', 'b'],
        rep: [['u', 0.34, 'entra', T2], ['m', 0.2, 'lineal', KI], ['d', 0.1, 'lineal', KI], ['s', 0.24, 'sale', NADA], ['c', 0.24, 'entra', NADA], ['l', 0.2, 'sale', KI], ['b', 1.1, 'freno', T2], ['b', 0.4, null, KI]],
        pasos: [{ sec: [['a0', 0.6, null, T2], ['a', 0.9, 'suave', T2]], desde: 'a0' }, { sec: [['b', 1.7, 'freno', T2]], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════════════════════════ LOS CURLS ══════════════════════════════ */
    /* la pierna izquierda con la rodilla doblada «g» grados y el muslo a plomo, pegado al otro («las rodillas alineadas»): el talón va
       hacia el glúteo */
    function talonAlGluteo(P, g) {
      var c = resolver(P).i.cad, t = g * RAD;
      return { a: [c[0], c[1] - D.muslo - D.pierna * Math.cos(t), c[2] - D.pierna * Math.sin(t)], polo: [0, -0.2, 1] };
    }
    var PIE_PLANO = { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] };

    /* el curl femoral de pie, sin peso: de pie, con el cuerpo erguido (los brazos, a los lados: la ficha no pide apoyo); dobla una rodilla
       y lleva el talón hacia el glúteo, con las rodillas alineadas; vuelve despacio y repite con la otra pierna, manteniendo arriba un
       segundo (la versión difícil). El pie se despega primero un poco, plano (m) */
    COREO['curl-femoral-de-pie-sin-peso'] = (function () {
      var pies = { suelo: [10, 0], abre: 4 }, brazos = { b: aLosLados(12), m: SUELTA };
      var a = sobre(brazos, { pel: [0, PIE - 0.3, 0], p: pies }), B = sobre(brazos, { pel: [-2.5, PIE - 0.3, 0], pd: reflejo(pies) });
      var m = sobre(B, { pel: [-1.5, PIE - 0.3, 0], pi: { a: [10, 13, -8], polo: [0, 0, 1] }, ti: PIE_PLANO });
      var b = sobre(B, { pi: talonAlGluteo(B, 112), ti: { tob: 26 } });
      var KD = ['td'], KI = ['ti'];
      var una = function (r, K) { return [['m' + r, 0.35, 'entra', K], ['b' + r, 0.95, 'sale', K], ['b' + r, 1.0, null, K], ['m' + r, 1.2, 'entra', K], ['a', 0.4, 'sale', K], ['a', 0.25, null, T2]]; };
      return {
        vista: [[72, 12], [118, 12]], rastro: 'ti', esfuerzo: [1, 2, 7, 8], clavos: T2, clavosEn: { b: KD, b2: KI },
        posturas: { a: a, m: m, b: b, m2: refleja(m), b2: refleja(b) }, inicio: 'a', encuadra: ['b'],
        rep: una('', KD).concat(una('2', KI)),
        pasos: ['a', { sec: [['m', 0.4, 'entra', KD], ['b', 1.0, 'sale', KD]], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* en polea: la polea, en lo más bajo, y la tobillera, justo encima del tobillo izquierdo; de cara a la máquina, carga el peso en el
       pie derecho y se agarra a la columna; levanta el pie izquierdo y lleva el talón hacia el glúteo, hace una pausa arriba y lo baja
       despacio */
    COREO['curl-femoral-de-pie-polea'] = (function () {
      var ZC = 52, YP = PIE - 1.5, pies = { suelo: [9, 0], abre: 5 }, MANO_COL = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };
      var agarrado = function (P) { return conAgarre(sobre(P, { m: MANO_COL }), [6.6, 112, ZC - 1.5], [0.7, -1, -0.4]); };
      var s = { p: pies, b: aLosLados(10), m: SUELTA }, B = { pel: [-2.5, YP, 0], pd: reflejo(pies) }, a = agarrado(sobre(B, { pi: pies }));
      var m = agarrado(sobre(B, { pi: { a: [9, 13, -8], polo: [0, 0, 1] }, ti: PIE_PLANO }));
      var b = agarrado(sobre(B, { pi: talonAlGluteo(B, 108), ti: { tob: 22 } }));
      var KD = ['mi', 'md', 'td'], K4 = ['mi', 'md', 'ti', 'td'];
      return {
        vista: [[104, 10], [150, 12]], rastro: 'ti', esfuerzo: [0, 1, 2], clavos: K4, clavosEn: { s: T2 },
        material: [['polea', { en: [0, ZC], alto: 16, a: 'tobillo-i', tobillera: true, encuadre: 150 }]],
        posturas: { s: s, a: a, m: m, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['m', 0.4, 'entra', KD], ['b', 1.1, 'sale', KD], ['b', 0.8, null, KD], ['m', 1.7, 'entra', KD], ['a', 0.4, 'sale', KD], ['a', 0.3, null, K4]],
        pasos: ['s', { sec: [['a', 1.4, 'suave', T2]], desde: 's' }, 'rep']
      };
    })();

    /* deslizando los talones: boca arriba (la cabeza hacia −Z), con las rodillas dobladas y los pies a la anchura de la cadera, apoyados
       sobre una toalla; sube los glúteos hasta que la cadera queda en línea con las rodillas; desliza los talones para estirar las rodillas
       (la toalla va con ellos, 35 cm; los pies quedan sobre los talones, con las puntas hacia arriba, y la cadera baja casi hasta el suelo); y
       vuelve despacio a la posición inicial */
    COREO['curl-isquios-toalla'] = (function () {
      var GT = 1.2, ZP = 62, manos = { b: { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] }, m: EN_SUELO }, pies = { suelo: [10, ZP], abre: 3, alto: GT, polo: [0.1, 1, 0.2] };
      var enPuente = function (ang) { return ang ? { pel: [0, 10 + 43.5 * Math.sin(ang * RAD), -23.5 + 43.5 * Math.cos(ang * RAD)], giro: [0, -90 - ang, 0], cab: [ang * 1.6, 0, 0] } : { pel: [0, 11.5, 20], giro: [0, -90, 0] }; };
      var a = sobre(enPuente(0), sobre(manos, { p: pies })), b = sobre(enPuente(22), sobre(manos, { p: pies }));
      /* estiradas: el talón, sobre la toalla y la punta, 40° hacia arriba; la rodilla, sin estirar del todo */
      var K40 = Math.cos(40 * RAD), S40 = Math.sin(40 * RAD), YT = GT + D.tobillo * K40 + D.talon * S40 + 0.25;
      var e = sobre(enPuente(7), sobre(manos, { cab: [20, 0, 0], p: { a: [10, YT, ZP + 35], polo: [0.1, 1, 0.2] }, t: { punta: [0, S40, K40], arriba: [0, K40, -S40] } }));
      var K4 = ['mi', 'md', 'ti', 'td'];
      return {
        vista: [[70, 16], [26, 30]], rastro: 'ti', esfuerzo: [0, 1, 2, 3], clavos: K4,
        material: [['toalla', { bajo: 'talones', dz: 4, med: [46, GT, 34], franjas: true }]],
        posturas: { a: a, b: b, e: e }, inicio: 'b', encuadra: ['a', 'e'],
        rep: [['e', 1.7, 'suave'], ['e', 0.3], ['a', 2.1, 'freno'], ['a', 0.4], ['b', 1.2, 'empuje'], ['b', 0.3]],
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, 'rep']
      };
    })();

    /* ── DE RODILLAS (como en el bloque 9): las rodillas, en el suelo (en z = 0, a 5,5 cm de él) y los empeines también, con los dedos hacia
       atrás. De una postura a otra la cadera gira sobre las rodillas (porArco, en 70-coreografias.js) ── */
    var DE_RODILLAS = { p: { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] } }, K_ROD = [5.5, 0];
    /* para caer hacia delante, el tobillo va justo a una pierna (38 cm) de la rodilla: con la pierna casi recta, medio centímetro de menos
       dejaba la rodilla 3 cm por debajo de su sitio */
    var DE_RODILLAS_F = sobre(DE_RODILLAS, { p: { a: [10, 3.6, -Math.sqrt(D.pierna * D.pierna - 1.9 * 1.9)], polo: [0.1, -1, 0.6] } });

    /* el curl nórdico: de rodillas sobre una esterilla, con el tronco erguido y una línea recta de la oreja a la rodilla; los tobillos,
       enganchados bajo un apoyo fijo (una barra cargada, en el suelo, sobre ellos); con el tronco y la pelvis firmes, deja que las
       rodillas se estiren y cae hacia delante despacio; cerca del suelo apoya las manos para frenar el final y para a unos 5 centímetros;
       empuja con las manos, como en una flexión, y tira con los isquiotibiales para volver arriba */
    COREO['curl-nordico'] = (function () {
      var YM = ALTO_MUN, P = {}, K4 = ['mi', 'md', 'ti', 'td'];
      /* inclinado «g» grados hacia delante, recto de las rodillas a la cabeza */
      var en = function (g, extra) { return sobre(DE_RODILLAS_F, sobre({ pel: [0, 5.5 + 40 * Math.cos(g * RAD), 40 * Math.sin(g * RAD)], giro: [0, g, 0] }, extra || {})); };
      /* las manos, preparadas ante el pecho, con las palmas hacia delante (hacia el suelo, según cae) */
      var listas = { b: { a: [17, 6, 20], en: 'torax', polo: [1, -0.8, -0.2] }, m: { tipo: 'abierta', prono: 90, mun: -40 } };
      P.k = en(0, { b: aLosLados(12), m: SUELTA });
      P.f = en(58, listas);
      /* abajo: las manos, en la esterilla, bajo los hombros y algo abiertas; los codos, doblados hacia atrás */
      var ZM = 76, W = [24, YM, ZM], apoyo = { b: { a: W, polo: [0.7, 0.5, -1] }, m: EN_SUELO };
      P.s = en(75.2, sobre(apoyo, { cab: [-14, 0, 0] }));
      /* el empujón: los brazos se estiran (se busca hasta dónde) y el cuerpo, rígido, sube girando sobre las rodillas */
      var gp = busca(function (g) { return largo(menos(resolver(en(g, apoyo)).i.hom, W)); }, D.brazo + D.antebrazo - 0.35, 40, 78);
      P.p = en(gp, sobre(apoyo, { cab: [-8, 0, 0] }));
      var cae = porArco(P, 'kf', P.k, P.f, 'f', 2, 4.4, K_ROD, T2), llega = porArco(P, 'fs', P.f, P.s, 's', 1, 1.9, K_ROD, T2);
      var empuja = porArco(P, 'sp', P.s, P.p, 'p', 1, 1.1, K_ROD, K4), sube = porArco(P, 'pk', P.p, P.k, 'k', 2, 2.3, K_ROD, T2);
      return {
        vista: [[84, 12], [36, 16]], rastro: 'hombros', esfuerzo: [], clavos: T2, clavosEn: { s: K4 },
        material: [['esterilla', { en: [0, 20], med: [66, 1.6, 172] }], ['barra', { ancla: 'mundo', en: [0, 11, -27], discos: 11 }]],
        posturas: P, inicio: 'k', encuadra: ['k', 's'],
        pasos: ['k', { sec: cae, desde: 'k' }, { sec: llega, desde: 'f' }, { sec: empuja.concat(sube), desde: 's' }]
      };
    })();

    /* ══════════════════════════════ BOCA ABAJO EN EL BANCO ══════════════════════════════
       Tumbado boca abajo a lo largo de un banco (la cabeza hacia +Z), con la cadera en su borde (el banco empieza en z = 0) y las manos
       agarradas a sus cantos, ante los hombros. Las piernas cuelgan por detrás: el banco mide 44 cm, así que no llegan a plomo; bajan en
       diagonal, con las rodillas algo dobladas y los pies sin tocar el suelo */
    var BANCO_BOCA_ABAJO = ['banco', { en: [0, 51], largo: 102 }], CANTO_BANCO = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };
    function enBanco(extra) {
      var P = sobre({ pel: [0, 55.5, 2], giro: [0, 90, 0], cab: [-12, 0, 0], m: CANTO_BANCO }, extra || {});
      return conAgarre(P, [15.6, 41.5, 66], [1, -0.5, -0.3]);
    }
    /* la pierna izquierda: el muslo, «m» grados por debajo de la horizontal (negativo, por encima) y la rodilla doblada «c»; a «x» del centro */
    function colgada(P, x, m, c) {
      var cd = resolver(P).i.cad, a = m * RAD, b = (m - c) * RAD;
      return { a: [x, cd[1] - D.muslo * Math.sin(a) - D.pierna * Math.sin(b), cd[2] - D.muslo * Math.cos(a) - D.pierna * Math.cos(b)], polo: [0, -1, 0.15] };
    }
    var K_MANOS = ['mi', 'md'];

    /* las patadas alternas: boca abajo en el banco, con la cadera en el borde, agarrado a él y con las piernas y los pies colgando; mete el
       abdomen y aprieta glúteos e isquiotibiales; lleva una pierna hacia atrás y hacia arriba sin despegar la cadera del banco, y alterna */
    COREO['patadas-alternas-banco'] = (function () {
      var B = enBanco(), baja = colgada(B, 10, 40, 26), sube = colgada(B, 10, -9, 4);
      var h = sobre(B, { p: baja, t: { tob: 34 } }), u = sobre(h, { pi: sube, ti: { tob: 30 } });
      return {
        vista: [[78, 12], [124, 16]], rastro: 'ti', esfuerzo: [0, 1, 4, 5], clavos: K_MANOS,
        material: [BANCO_BOCA_ABAJO], posturas: { h: h, u: u, u2: refleja(u) }, inicio: 'h', encuadra: ['u'],
        rep: [['u', 0.9, 'suave'], ['u', 0.3], ['h', 1.0, 'suave'], ['h', 0.15], ['u2', 0.9, 'suave'], ['u2', 0.3], ['h', 1.0, 'suave'], ['h', 0.15]],
        pasos: ['h', 'h', 'rep']
      };
    })();

    /* la hiperextensión inversa: boca abajo sobre el banco, con la cadera en el borde y las piernas colgando, agarrado a él; con las
       rodillas juntas, sube las piernas hasta que forman una línea recta con el tronco; y las baja despacio */
    COREO['hiperextension-inversa-banco'] = (function () {
      var B = enBanco(), h = sobre(B, { p: colgada(B, 6.5, 40, 26), t: { tob: 34 } }), u = sobre(B, { p: colgada(B, 6.5, 0, 1), t: { tob: 30 } });
      return {
        vista: [[78, 12], [124, 16]], rastro: 'pies', esfuerzo: [0, 1], clavos: K_MANOS,
        material: [BANCO_BOCA_ABAJO], posturas: { h: h, u: u }, inicio: 'h', encuadra: ['u'],
        rep: [['u', 1.4, 'empuje'], ['u', 0.4], ['h', 2.1, 'freno'], ['h', 0.4]],
        pasos: ['h', { sec: [['u', 1.5, 'empuje']], desde: 'h' }, { rep: 1.8 }]
      };
    })();

    /* ══════════════════════════════ EL BALANCEO DE PIERNA ══════════════════════════════ */
    /* de pie junto a una pared (a su derecha), con esa mano apoyada en ella desde el principio; balancea una pierna (la de fuera, la izquierda) adelante y
       atrás de forma controlada, con el tronco erguido; y, al terminar, cambia de pierna (la de dentro: la mano sigue en la pared). La
       pierna pasa bajo la cadera con la rodilla algo doblada: recta, la zapatilla rozaría el suelo */
    COREO['balanceo-pierna'] = (function () {
      var XW = 30, pies = { suelo: [10, 0], abre: 4 }, P = {};
      var libre = { bi: aLosLados(12), mi: SUELTA }, enPared = sobre(libre, { bd: { a: [-(XW - ALTO_MUN), 116, 13], polo: [0.5, -1, -0.5] }, md: apoyada([0, 1, 0], [-1, 0, 0]) });
      P.a = sobre(enPared, { p: pies });
      var B = sobre(enPared, { pel: [-2.5, PIE - 0.3, 0], pd: reflejo(pies) }), cd = resolver(B).i.cad;
      P.m = sobre(B, { pi: { a: [cd[0], D.tobillo + 2.6, cd[2] - 1], polo: [0, 0, 1] }, ti: { punta: [0, 0.07, 0.998], arriba: [0, 0.998, -0.07] } });
      P.f = sobre(B, { pi: { e: 37, z: 0, c: 8 }, ti: { tob: 6 } });
      P.t = sobre(B, { pi: { a: mas(cd, por([0, -Math.cos(21 * RAD), -Math.sin(21 * RAD)], 76.8)), polo: [0, 0, 1] }, ti: { punta: [0, -0.3, 0.954], arriba: [0, 0.954, 0.3] } });
      /* la otra pierna: lo mismo reflejado, con la mano que apoya donde estaba */
      ['m', 'f', 't'].forEach(function (n) { var R = refleja(P[n]); P[n + '2'] = sobre(enPared, { pel: R.pel, pi: R.pi, pd: R.pd, ti: R.ti, td: R.td }); });
      var K3 = ['md', 'ti', 'td'], KD = K3, KI = K3;      /* el pie que se balancea también va clavado a su camino: de una postura a otra, en línea recta */
      var vaiven = function (r, K) { return [['m' + r, 0.36, 'entra', K], ['f' + r, 0.42, 'sale', K], ['m' + r, 0.42, 'entra', K], ['t' + r, 0.4, 'sale', K]]; };
      return {
        vista: [[62, 12], [112, 12]], rastro: 'ti', esfuerzo: [], clavos: K3,
        material: [['pared', { x: -XW, z: 6, normal: [1, 0, 0], ancho: 150 }]],
        posturas: P, inicio: 't', encuadra: ['a', 'f', 't', 'f2'],
        rep: vaiven('', KD),
        pasos: ['a', 'rep',
                { sec: [['m', 0.35, 'entra', KD], ['a', 0.4, 'sale', KD], ['a', 0.15, null, K3]].concat(vaiven('2', KI), vaiven('2', KI).slice(0, 3), [['a', 0.4, 'sale', KI]]), desde: 't' }]
      };
    })();

    /* ══════════════════════════════ LOS ESTIRAMIENTOS ══════════════════════════════ */
    /* el talón apoyado y la punta hacia arriba (el pie izquierdo), con la pierna que llega a él bajando «caida» grados desde la
       horizontal y la punta «fuera» grados hacia fuera: los vectores del pie y a qué altura queda el tobillo sobre lo que pisa */
    function sobreElTalon(caida, fuera) {
      var a = caida * RAD, g = (fuera || 0) * RAD, s = Math.sin(a), c = Math.cos(a);
      return { t: { punta: [Math.sin(g), c * Math.cos(g), s * Math.cos(g)], arriba: [0, s, -c] }, y: D.tobillo * s + D.talon * c * Math.cos(g) + 0.3 };
    }

    /* con el pie en un escalón: de pie, con el cuerpo erguido, apoya el pie de una pierna (el talón, con la pierna estirada) en un escalón
       que tiene delante; con la espalda recta se inclina despacio desde la cadera; mantiene, y cambia de pierna. Las manos, en la cintura */
    COREO['estiramiento-isquios-escalon'] = (function () {
      var H = 20, ZT = 47, pies = { suelo: [9, 0], abre: 4 }, cint = { b: EN_CINTURA, m: SUELTA }, P = {};
      var caida = Math.asin((PIE - 1 - H - 9) / 77.6) / RAD, T = sobreElTalon(caida, 0), tob = [10, H + T.y, ZT];
      P.a0 = sobre(cint, { pel: [0, PIE - 0.3, 0], p: pies });
      /* el pie sube por el aire, por delante del canto del escalón */
      P.u = sobre(cint, { pel: [-2.5, PIE - 0.5, -1], pd: reflejo(pies), pi: { a: [10, H + 15, 20], polo: [0.05, 0.1, 1] }, ti: { punta: [0, 0.2, 0.98], arriba: [0, 0.98, -0.2] } });
      /* con la pierna de delante estirada: se busca a qué altura queda la cadera */
      var con = function (z, inc, extra) {
        var Q = function (y) { return sobre(cint, sobre({ pel: [-2, y, z], giro: [0, inc, 0], cab: [-inc * 0.35, 0, 0], pd: reflejo(pies), pi: { a: tob, polo: [0.05, 0.3, 1] }, ti: T.t }, extra || {})); };
        return Q(busca(function (y) { var E = resolver(Q(y)).i; return largo(menos(E.cad, E.tob)); }, 77.5, 70, PIE));
      };
      P.a = con(-1, 0); P.b = con(-7, 40);
      P.u2 = refleja(P.u); P.a2 = refleja(P.a); P.b2 = refleja(P.b);
      return {
        vista: [[70, 12], [116, 12]], isometrico: 'b', clavos: T2,
        material: [['escalon', { med: [64, H, 30], en: [0, ZT + 4] }]],
        posturas: P, inicio: 'a0', encuadra: ['a0', 'b'],
        pasos: [{ sec: [['a0', 0.5], ['u', 0.6, 'entra'], ['a', 0.6, 'sale']], desde: 'a0' }, { sec: [['b', 2.5, 'suave']], desde: 'a' },
                { sec: [['b', 0.4], ['a', 0.7, 'suave'], ['u', 0.42, 'entra'], ['a0', 0.42, 'sale'], ['u2', 0.42, 'entra'], ['a2', 0.42, 'sale'], ['b2', 0.9, 'suave']], desde: 'b' }]
      };
    })();

    /* sentado en el suelo: una pierna estirada al frente (el talón en el suelo) y la otra doblada hacia él (la planta, contra el muslo de la
       estirada, y la rodilla abierta hacia el suelo); alarga la espalda, gira un poco el tronco hacia la pierna estirada y se inclina con
       suavidad hacia delante, con las manos hacia los dedos del pie; mantiene, y cambia de lado (las piernas se cambian deslizando los pies) */
    COREO['estiramiento-isquios-sentado'] = (function () {
      var YS = 11.8, T = sobreElTalon(2.5, 0), CANTO = { punta: [0, -0.12, 0.993], arriba: [-1, 0, 0] }, P = {};
      var doblada = function (y) { return { a: [-3.5, y, 29], polo: [-Math.cos(24 * RAD), Math.sin(24 * RAD), 0.25] }; };
      var piernas = function (y) { return { pi: { a: [11, T.y, 77.4], polo: [0, 1, 0] }, ti: T.t, pd: doblada(y), td: CANTO }; };
      var yd = busca(function (y) { return bajoZapa(resolver(sobre({ pel: [0, YS, 0], giro: [0, 4, 0] }, piernas(y))).d, 'd'); }, -0.3, 3, 14), L = piernas(yd);
      /* erguido, con las manos sobre los muslos; e inclinado, con las manos hacia la punta del pie */
      var s0 = sobre({ pel: [0, YS, 0], giro: [0, 4, 0], cab: [-3, 0, 0] }, L), Es = resolver(s0);
      P.s = sobre(s0, { bi: { a: [Es.i.rod[0] + 3, Es.i.rod[1] + 9.2, Es.i.rod[2] - 12], polo: [1, -0.4, -0.6] }, bd: { a: [Es.d.rod[0] + 4, Es.d.rod[1] + 9, Es.d.rod[2] - 9], polo: [-1, -0.4, -0.6] }, m: { tipo: 'suelta', prono: 90 } });
      var haciaElPie = { bi: { a: [16, T.y + 14, 60], polo: [1, 0.3, -0.5] }, bd: { a: [5, T.y + 15, 59], polo: [-1, 0.5, -0.4] }, m: { tipo: 'abierta', prono: 90 } };
      P.e = sobre({ pel: [0, YS, 0], giro: [7, 40, 0], col: [18, 0, 0], cab: [-22, 0, 0] }, sobre(L, haciaElPie));
      P.s2 = refleja(P.s); P.e2 = refleja(P.e);
      return {
        vista: [[52, 20], [96, 14]], isometrico: 'e', clavos: T2,
        posturas: P, inicio: 's', encuadra: ['s', 'e', 'e2'],
        pasos: ['s', { sec: [['e', 2.0, 'suave']], desde: 's' }, { sec: [['e', 0.4], ['s', 0.9, 'suave'], ['s2', 1.2, 'suave'], ['e2', 1.3, 'suave']], desde: 'e' }]
      };
    })();

    /* ── SENTADO EN EL BORDE DE UN BANCO (atravesado, como el de sentarse y levantarse del bloque 9: su tapa, a 44 cm; la cadera, a 55) ── */
    var BANCO_SENTADO = ['banco', { rumbo: 90, en: [0, -6], largo: 100 }], PIES_SENTADO = { suelo: [10, 33], abre: 4, polo: [0.1, 0.6, 1] };

    /* en silla o banco: sentado en el borde, con una pierna doblada y la otra estirada, el talón apoyado y el pie algo hacia fuera; con la
       espalda recta se inclina desde la cadera hacia la pierna estirada; mantiene, y cambia de pierna (el pie vuelve por el aire, a ras de
       suelo). Las manos, sobre los muslos */
    COREO['estiramiento-isquios-silla'] = (function () {
      var caida = Math.asin((55 - 9.9) / 77.6) / RAD, T = sobreElTalon(caida, 14), P = {};
      var est = { a: [12, T.y, 1 + 77.6 * Math.cos(caida * RAD)], polo: [0.1, 1, 0.3] };
      var con = function (inc, rumbo, piernas) { return enSusMuslos(sobre({ pel: [0, 55, 1], giro: [rumbo, inc, 0], cab: [-inc * 0.4, 0, 0] }, piernas)); };
      var dos = { p: PIES_SENTADO }, una = { pi: est, ti: T.t, pd: reflejo(PIES_SENTADO) }, medio = { pi: { a: [11, 12.5, 49], polo: [0.1, 1, 0.5] }, ti: { punta: [0, 0.35, 0.937], arriba: [0, 0.937, -0.35] }, pd: reflejo(PIES_SENTADO) };
      P.s = con(2, 0, dos); P.h = con(2, 0, medio); P.a = con(2, 0, una); P.b = con(32, 5, una);
      P.h2 = refleja(P.h); P.a2 = refleja(P.a); P.b2 = refleja(P.b);
      var K4M = T2.concat(['mi', 'md']);
      return {
        vista: [[58, 12], [108, 14]], isometrico: 'b', clavos: T2, material: [BANCO_SENTADO],
        posturas: P, inicio: 's', encuadra: ['s', 'b'],
        /* al inclinarse, las manos se quedan donde descansan (clavadas a su sitio en el muslo, que no se mueve): sueltas, al resbalar
           unos milímetros pisaban el bajo del pantalón y daban un saltito (2 cm) */
        pasos: [{ sec: [['s', 0.5], ['h', 0.5, 'entra'], ['a', 0.55, 'sale']], desde: 's' }, { sec: [['b', 1.8, 'suave', K4M]], desde: 'a' },
                { sec: [['b', 0.4, null, K4M], ['a', 0.7, 'suave', K4M], ['h', 0.4, 'entra'], ['s', 0.4, 'sale'], ['h2', 0.4, 'entra'], ['a2', 0.4, 'sale'], ['b2', 0.9, 'suave', K4M]], desde: 'b' }]
      };
    })();

    /* tumbado: boca arriba, con las rodillas dobladas y los pies apoyados (las manos, sobre el abdomen); levanta una pierna y la sujeta con
       las dos manos por debajo de la rodilla (por detrás del muslo: para alcanzarlo despega un momento la cabeza y los hombros); con la
       otra rodilla doblada y el pie en el suelo, la acerca hacia él manteniéndola recta; mantiene, y cambia de lado */
    COREO['estiramiento-isquios-tumbado'] = (function () {
      var SOBRE_ABDOMEN = { b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } };
      var PIES = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, P = {};
      /* la pierna izquierda, levantada «e» grados (90, a plomo) y con la rodilla doblada «c»; la derecha, doblada y con el pie en el suelo */
      var levanta = function (e, c, extra) { return sobre(SUPINO_SUELO, sobre(extra || {}, { pi: { e: e, z: 0, c: c }, ti: { tob: 6 }, pd: reflejo(PIES) })); };
      /* las manos, detrás del muslo izquierdo, cerca de la rodilla (a 30 cm de la cadera, por su cara de atrás) */
      var sujeta = function (Q) {
        var L = resolver(Q).i, u = unidad(menos(L.rod, L.cad)), c = mas(L.cad, mas(por(u, 30), por(L.frenteMuslo, -8.6)));
        var R = conAgarre(sobre(Q, { m: { tipo: 'puno', prono: 0 } }), [c[0] + 4.4, c[1], c[2]], [1, 0.1, 0.3], 'bi');
        return conAgarre(R, [c[0] - 4.4, c[1], c[2]], [-1, 0.5, -0.1], 'bd');
      };
      P.s = sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, { p: PIES }));
      P.k = levanta(98, 80, SOBRE_ABDOMEN);
      /* de camino: las manos, a los lados del muslo */
      var h0 = sobre(levanta(96, 40, { col: [12, 0, 0], cab: [6, 0, 0] }), { m: { tipo: 'suelta', prono: 0 } });
      P.h = conAgarre(conAgarre(h0, [23, 34, 23], [1, 0.1, 0.3], 'bi'), [-3, 31, 25], [-1, 0.5, -0.1], 'bd');
      P.x = sujeta(levanta(88, 5, { col: [14, 0, 0], cab: [7, 0, 0] }));
      P.e = sujeta(levanta(106, 4, { col: [2, 0, 0] }));
      ['k', 'h', 'x', 'e'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var KD = ['td'], KI = ['ti'];
      return {
        vista: [[62, 20], [20, 32]], isometrico: 'e', clavos: KD, clavosEn: { s: T2 },
        posturas: P, inicio: 's', encuadra: ['s', 'x', 'e'],
        pasos: [{ sec: [['s', 0.5, null, T2], ['k', 0.9, 'suave', KD], ['h', 0.5, 'entra', KD], ['x', 0.7, 'sale', KD]], desde: 's' }, { sec: [['e', 1.7, 'suave', KD]], desde: 'x' },
                { sec: [['e', 0.35, null, KD], ['x', 0.4, 'suave', KD], ['h', 0.35, 'entra', KD], ['k', 0.35, 'lineal', KD], ['s', 0.45, 'sale', KD], ['k2', 0.5, 'entra', KI], ['h2', 0.35, 'lineal', KI], ['x2', 0.45, 'sale', KI], ['e2', 0.8, 'suave', KI]], desde: 'e' }]
      };
    })();

    /* el isométrico sentado: en un banco, con los pies apoyados en el suelo (las manos, sobre los muslos); adelanta un poco un talón (el
       pie queda sobre él, con la punta algo levantada) y lo empuja hacia abajo y hacia el banco, sin que el pie se mueva; mantiene, relaja
       (el pie vuelve a su sitio) y repite con la otra pierna */
    COREO['isometrico-isquios-sentado'] = (function () {
      var K20 = Math.cos(20 * RAD), S20 = Math.sin(20 * RAD), YT = D.tobillo * K20 + D.talon * S20 + 0.3, P = {};
      var con = function (piernas) { return enSusMuslos(sobre({ pel: [0, 55, 1], giro: [0, 3, 0], cab: [-2, 0, 0] }, piernas)); };
      P.s = con({ p: PIES_SENTADO });
      P.a = con({ pi: { a: [10, YT, 47], polo: [0.1, 0.6, 1] }, ti: { punta: [0, S20, K20], arriba: [0, K20, -S20] }, pd: reflejo(PIES_SENTADO) });
      P.a2 = refleja(P.a);
      return {
        vista: [[60, 12], [108, 14]], isometrico: 'a', clavos: T2, material: [BANCO_SENTADO],
        posturas: P, inicio: 's', encuadra: ['a'],
        pasos: ['s', { sec: [['a', 1.3, 'suave']], desde: 's' }, { sec: [['a', 1.5], ['s', 0.9, 'suave'], ['a2', 1.3, 'suave']], desde: 'a' }]
      };
    })();
  })();
    return {"peso-muerto-rumano-polea": "e7290c9eee7d", "buenos-dias-barra": "7e15c0637bb4", "buenos-dias-piernas-abiertas": "852c2d9ab85f", "peso-muerto-piernas-rigidas": "f2f26dbbc56c", "peso-muerto-rumano-escalonado": "7f24e7261faa", "peso-muerto-una-pierna": "3dfc9c5857d1", "peso-muerto-una-pierna-kettlebell": "d5b535f7a860", "peso-muerto-una-pierna-mancuerna": "869f24f47081", "peso-muerto-una-pierna-polea": "85c68206040c", "peso-muerto-una-pierna-salto": "ebbcb6f4d9f4", "curl-femoral-de-pie-sin-peso": "0ed64f49e30d", "curl-femoral-de-pie-polea": "89e1ca5a13a9", "curl-isquios-toalla": "b73b53d69d1d", "curl-nordico": "15c86fc6aae6", "patadas-alternas-banco": "aff921462584", "hiperextension-inversa-banco": "f29e72cba645", "balanceo-pierna": "b992a0cb70f1", "estiramiento-isquios-escalon": "15f58676ac64", "estiramiento-isquios-sentado": "f1bb98d0d73c", "estiramiento-isquios-silla": "210e81eb53f4", "estiramiento-isquios-tumbado": "9f970d4c68ea", "isometrico-isquios-sentado": "53847639d18a"};
  });
})();
