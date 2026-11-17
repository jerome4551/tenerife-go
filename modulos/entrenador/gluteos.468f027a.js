/* modulos/entrenador/gluteos.<huella>.js — Jérôme, el entrenador: las coreografías de «gluteos» (43 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/79-gluteos.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('gluteos', function (N) {
    var ALTO_MUN = N.ALTO_MUN, BRAZO = N.BRAZO, C = N.C, COREO = N.COREO, D = N.D, EN_SUELO = N.EN_SUELO, LADOS = N.LADOS, PIE = N.PIE,
        PLANA_PARED = N.PLANA_PARED, PRONO = N.PRONO, PUNO = N.PUNO, RAD = N.RAD, SUELTA = N.SUELTA, SUPINO_SUELO = N.SUPINO_SUELO, V = N.V,
        aLosLados = N.aLosLados, aUnBrazo = N.aUnBrazo, abre = N.abre, aplicar = N.aplicar, apoyada = N.apoyada, arco = N.arco,
        bajaSube = N.bajaSube, bajoZapa = N.bajoZapa, baseDe = N.baseDe, baseEjes = N.baseEjes, busca = N.busca, colgando = N.colgando,
        conAgarre = N.conAgarre, cuelga = N.cuelga, deLado = N.deLado, deTalon = N.deTalon, el = N.el, enPunta = N.enPunta,
        enSusMuslos = N.enSusMuslos, entre = N.entre, girar = N.girar, giroY = N.giroY, inclinado = N.inclinado, largo = N.largo, linea = N.linea,
        mas = N.mas, menos = N.menos, plano = N.plano, por = N.por, punto = N.punto, refleja = N.refleja, reflejo = N.reflejo, resolver = N.resolver,
        sinParte = N.sinParte, sobre = N.sobre, unidad = N.unidad;
  /* ───────────────────────── las coreografías: GLÚTEOS (bloque 10) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: tumbado de lado (la abducción, la aducción y la almeja), de pie con apoyo en la
     pared, a cuatro patas y boca abajo, las poleas (con la tobillera y con la cuerda), la pesa rusa, el puente y el hip thrust,
     las zancadas (en el sitio, al frente, atrás, de lado, cruzada y andando; sin peso, con mancuernas y con barra), la búlgara,
     el escalón de lado, el peso muerto sumo, los estiramientos, las planchas de Copenhague y los saltos. */
  (function () {
    var T2 = ['ti', 'td'], NADA = [];

    /* ══════════════════════════════ TUMBADO DE LADO ══════════════════════════════
       Sobre el lado derecho (la cabeza hacia −Z, de cara a −X), con la cadera y los hombros uno encima del otro. «La cabeza sobre el
       brazo de abajo»: ese brazo va por el suelo hacia arriba, con el codo doblado y el antebrazo por delante de la cara, y la cabeza
       descansa en él. «La mano de arriba en la cadera»: en la cintura, por encima del pliegue de la cadera (más abajo, el muslo que sube
       se le echaría encima). Del otro lado, lo mismo reflejado: se da la vuelta rodando sobre la espalda. */
    var X_LADO = -12, EN_SUELO_PIERNA = -2.3, EN_CINTURA = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };
    function deLado(extra) { return sobre({ pel: [X_LADO, 21.5, 0], giro: [-90, 0, -84], cab: [0, 0, -14], bi: EN_CINTURA, mi: SUELTA }, extra || {}); }
    /* el brazo de abajo, de almohada: el codo, en el suelo (a 5,8 cm: lo que mide apoyado) y justo por encima de la cabeza; el antebrazo,
       tendido hacia delante, con la mano de plano en el suelo */
    function almohada(P) {
      var S = resolver(P).d.hom, dy = S[1] - 5.8, codo = [S[0] - 2, 5.8, S[2] - Math.sqrt(D.brazo * D.brazo - 4 - dy * dy)];
      return sobre(P, { bd: { a: [codo[0] - 23.7, ALTO_MUN, codo[2] - 2.6], polo: menos(codo, S) }, md: apoyada([-1, 0, -0.1]) });
    }
    /* la pierna del lado k con el tobillo en «tob» y la rodilla girada «ang» grados alrededor de la línea de la cadera al tobillo: 0, hacia
       delante del cuerpo (−X); 90, hacia arriba */
    function piernaCon(P, k, tob, ang) {
      var c = resolver(P)[k].cad, eje = unidad(menos(tob, c)), f = unidad(sinParte([-1, 0, 0], eje)), u = unidad(sinParte([0, 1, 0], eje));
      return { a: tob, polo: mas(por(f, Math.cos(ang * RAD)), por(u, Math.sin(ang * RAD))) };
    }
    /* las piernas, estiradas y juntas: la de abajo, en el suelo (la rodilla, apenas doblada hacia delante: así el pie mira al frente; su
       tobillo sube lo justo para que la zapatilla, de lado, descanse sin hundirse) y la de arriba, sobre ella (su tobillo, 11 cm por
       encima). adelante: cuánto se adelanta el tobillo de abajo (la aducción) */
    function piernaAbajo(P, adelante, sube) {
      var c = resolver(P).d.cad, d = 77.6, x = -2 - (adelante || 0);
      var con = function (y) { return sobre(P, { pd: { a: [c[0] + x, y, c[2] + Math.sqrt(d * d - x * x - (c[1] - y) * (c[1] - y))], polo: [-1, 0, 0] }, td: { tob: 8 } }); };
      var y0 = busca(function (y) { return bajoZapa(resolver(con(y)).d, 'd'); }, -0.3, 3, 11);
      return con(y0 + (sube || 0));
    }
    /* la de arriba, a «ang» grados por encima de la de abajo (0, sobre ella), con la rodilla recta y mirando al frente */
    function piernaArriba(P, ang) {
      var E = resolver(P), ci = E.i.cad, t = resolver(piernaAbajo(P)).d.tob, u0 = unidad(menos([t[0], t[1] + 11, t[2] + 1], ci));
      return sobre(P, { pi: { a: mas(ci, por(girar(u0, [-1, 0, 0], ang), 77.8)), polo: [-1, 0, 0] }, ti: { tob: 8 } });
    }

    /* DARSE LA VUELTA. Del lado derecho al izquierdo, rodando sobre la espalda: suelta la cabeza y recoge el brazo de abajo ante el pecho
       (q); a medio rodar (as: el cuerpo, girado 45° sobre su eje); boca arriba, con las manos sobre el abdomen (s); y lo mismo, reflejado,
       hasta el otro lado. dobladas: con las rodillas dobladas (la almeja); si no, con las piernas estiradas. Añade a «P» las posturas
       (con el prefijo «pre») y devuelve los tramos, de «de» a su reflejo («de» + '2', que pone quien llama) */
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
      /* antes de rodar, la cabeza se levanta del brazo, que viene hacia delante del pecho: el codo resbala por el suelo y el antebrazo se
         levanta (de ahí al pecho ya no pasa por debajo de nada) */
      var S = resolver(A).d.hom, cq = mas(S, por(unidad([-0.96, (5.85 - S[1]) / D.brazo, 0.27]), D.brazo));
      P[pre + 'q'] = sobre(A, { cab: [0, 0, -3], bd: { a: mas(cq, por(unidad([0.35, 0.8, 0.49]), D.antebrazo)), polo: menos(cq, S) }, md: { tipo: 'suelta', prono: 40 } });
      P[pre + 'as'] = medioRodar(1, dobladas); P[pre + 'sa'] = medioRodar(-1, dobladas);
      P[pre + 's'] = sobre(SUPINO_SUELO, { pel: [0, 11.5, 0], p: dobladas ? { suelo: [11, 45], abre: 4, polo: [0.1, 1, 0.2] } : { e: EN_SUELO_PIERNA, z: 0, c: 0 }, t: { tob: 8 },
        b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } });
      P[pre + 'q2'] = refleja(P[pre + 'q']);
      return [[pre + 'q', 0.42 * k, 'suave'], [pre + 'as', 0.34 * k, 'entra'], [pre + 's', 0.32 * k, 'lineal'], [pre + 'sa', 0.32 * k, 'lineal'], [pre + 'q2', 0.34 * k, 'sale'], [de + '2', 0.46 * k, 'suave']];
    }

    /* la abducción: de lado, con las piernas estiradas y juntas; sube despacio la pierna de arriba, con la rodilla recta y mirando al
       frente, sin pasar de unos 45 grados (sube 38); la baja despacio y, al terminar, cambia de lado */
    COREO['abduccion-tumbado-lado'] = (function () {
      var base = almohada(deLado()), a = piernaArriba(piernaAbajo(base), 0), b = piernaArriba(piernaAbajo(base), 38), P = { a: a, b: b };
      P.a2 = refleja(a);
      var vuelta = darLaVuelta(P, 'v', 'a');
      return {
        vista: [[-90, 12], [-48, 30]], rastro: 'ti', esfuerzo: [3],
        posturas: P, inicio: 'b', encuadra: ['a', 'b', 'a2', 'vs'],
        rep: [['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.3], ['b', 1.7, 'suave']],
        pasos: ['a', { sec: [['b', 2.2, 'suave']], desde: 'a' }, 'rep', { sec: [['b', 0.15], ['a', 1.5, 'freno']].concat(vuelta), desde: 'b' }]
      };
    })();

    /* la aducción: de lado, con las piernas estiradas; lleva la pierna de abajo hacia delante hasta que queda delante de la de arriba, con
       los dos pies en el suelo (la de arriba se levanta un momento para dejarla pasar y se posa detrás); levanta despacio la de abajo, con
       la rodilla recta, y la baja con control; y cambia de lado */
    COREO['aduccion-tumbado-lado'] = (function () {
      var base = almohada(deLado()), a = piernaArriba(piernaAbajo(base), 0), P = { a: a };
      /* la de arriba, posada detrás: su tobillo baja hasta que la zapatilla, de lado, toca el suelo */
      var ci = resolver(base).i.cad, posada = function (Q, y) { var x = 3, d = 77.7; return sobre(Q, { pi: { a: [ci[0] + x, y, ci[2] + Math.sqrt(d * d - x * x - (ci[1] - y) * (ci[1] - y))], polo: [-1, 0, 0] }, ti: { tob: 8 } }); };
      var ADELANTE = 27, delante = piernaAbajo(base, ADELANTE), yp = busca(function (y) { return bajoZapa(resolver(posada(delante, y)).i, 'i'); }, -0.3, 3, 14);
      P.c1 = piernaArriba(piernaAbajo(base), 15);
      P.c2 = sobre(piernaAbajo(base, ADELANTE), { pi: P.c1.pi, ti: P.c1.ti });
      P.c = posada(delante, yp);
      P.d = posada(piernaAbajo(base, ADELANTE, 17), yp);
      P.a2 = refleja(a);
      var vuelta = darLaVuelta(P, 'v', 'a');
      return {
        vista: [[-66, 14], [-28, 28]], rastro: 'td',
        posturas: P, inicio: 'a', encuadra: ['a', 'd', 'a2', 'vs'],
        pasos: ['a', { sec: [['c1', 0.7, 'suave'], ['c2', 1.0, 'suave'], ['c', 1.0, 'suave']], desde: 'a' },
                { sec: [['d', 1.5, 'suave'], ['d', 0.45], ['c', 1.8, 'freno'], ['c', 0.2], ['c2', 0.5, 'suave'], ['c1', 0.6, 'suave'], ['a', 0.5, 'suave']].concat(vuelta), desde: 'c' }]
      };
    })();

    /* ── con las rodillas dobladas (la almeja): la cadera, doblada unos 45° y las rodillas, a 90; los pies, juntos, en línea con la
       espalda. La pierna de abajo descansa en el suelo (la rodilla, a 6,4 cm; el tobillo, lo justo para que la zapatilla no se hunda). La
       de arriba, sobre ella; para abrirla, la rodilla gira hacia arriba alrededor de la línea de la cadera al tobillo: los pies no se separan ── */
    function almejaEn(base, abre) {
      var E = resolver(base), cd = E.d.cad, Q, y = 5.6, ang = -5, i;
      var abajo = function (yy, g) { return sobre(base, { pd: piernaCon(base, 'd', [cd[0] - 1.5, yy, cd[2] + 55], g), td: { tob: 8 } }); };
      for (i = 0; i < 3; i++) {
        ang = busca(function (g) { return resolver(abajo(y, g)).d.rod[1]; }, 6.4, -40, 20);
        y = busca(function (yy) { return bajoZapa(resolver(abajo(yy, ang)).d, 'd'); }, -0.3, 3, 11);
      }
      Q = abajo(y, ang);
      var Ed = resolver(Q).d, tob = [Ed.tob[0], Ed.tob[1] + 10.5, Ed.tob[2]];
      var arriba = function (g) { return sobre(Q, { pi: piernaCon(Q, 'i', tob, g), ti: { tob: 8 } }); };
      var cerrada = busca(function (g) { return resolver(arriba(g)).i.rod[1]; }, Ed.rod[1] + 11.5, -40, 40);
      return arriba(cerrada + (abre || 0));
    }

    /* la almeja: de lado, con las rodillas dobladas y los pies juntos; abre la rodilla de arriba tanto como puede sin que la pelvis ruede
       (no se mueve); y baja despacio. Al terminar, cambia de lado */
    COREO.almeja = (function () {
      var base = almohada(deLado()), a = almejaEn(base, 0), b = almejaEn(base, 42), P = { a: a, b: b };
      P.a2 = refleja(a);
      var vuelta = darLaVuelta(P, 'v', 'a', true);
      return {
        vista: [[-40, 18], [-78, 16]], rastro: 'ri', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        posturas: P, encuadra: ['a', 'b', 'a2', 'vs'],
        rep: [['b', 1.3, 'suave'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { sec: [['a', 1.3, 'freno', T2]].concat(vuelta.map(function (t) { return t.concat([NADA]); })), desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ DE LADO, SOBRE EL ANTEBRAZO ══════════════════════════════
       El codo de abajo, en el suelo y justo bajo el hombro (el hombro, a un brazo del suelo); el antebrazo, tendido hacia delante. Con la
       cadera en el suelo (recostado), el tronco se dobla de lado lo que eso pide; con la cadera en el aire (en línea), va recto del
       hombro a los pies, como en una plancha lateral. El hombro de abajo no se mueve de su sitio */
    var Y_CODO = 5.8, Y_HOMBRO = Y_CODO + D.brazo, AL_REC = 74;
    function recostado(extra) {
      var P = function (L) { return sobre({ pel: [X_LADO, 11.55 + D.caderaX * Math.sin(AL_REC * RAD), 0], giro: [-90, 0, -AL_REC], col: [0, L, 0], cab: [0, 0, -L * 0.35], bi: EN_CINTURA, mi: SUELTA }, extra || {}); };
      return P(busca(function (L) { return resolver(P(L)).d.hom[1]; }, Y_HOMBRO, 0, 80));
    }
    /* el tronco, recto, a «beta» grados del suelo y con el hombro de abajo en S */
    function enLinea(beta, S, extra) {
      var g = [-90, 0, -(90 - beta)];
      return sobre({ pel: menos(S, aplicar(baseDe(g), [-D.hombroX, D.lumbar + D.torax + D.hombroY, 0])), giro: g, bi: EN_CINTURA, mi: SUELTA }, extra || {});
    }
    function antebrazoEn(S) { return { bd: { a: [S[0] - 23.8, ALTO_MUN, S[2]], polo: [0, -1, 0] }, md: apoyada([-1, 0, 0]) }; }
    var SIN_CLAVOS = function (t) { return t.concat([NADA]); };

    /* la almeja en plancha lateral: de lado, con el codo bajo el hombro, las caderas una sobre otra y las rodillas dobladas, la de abajo en
       el suelo; sube a una plancha lateral apoyándose en esa rodilla (que no se mueve, ni su espinilla) y abre a la vez la de arriba; baja
       despacio, cerrándola, hasta rozar el suelo con la cadera; y cambia de lado.
       Arriba, el tronco va recto del hombro a la rodilla, con el hombro justo sobre el codo. Abajo, la cadera se posa a un muslo de esa
       misma rodilla, y el tronco se dobla de lado lo que hace falta para que el hombro siga a un brazo del codo (queda algo por detrás de él) */
    COREO['almeja-plancha-lateral'] = (function () {
      var C = [X_LADO, Y_CODO, -48.3], brazo = function (P) { return sobre(P, { bd: { a: [C[0] - 23.8, ALTO_MUN, C[2]], polo: menos(C, resolver(P).d.hom) }, md: apoyada([-1, 0, 0]) }); };
      var b0 = brazo(enLinea(24, [C[0], Y_HOMBRO, C[2]])), cb = resolver(b0).d.cad, dyb = cb[1] - 6.4;
      var K = [cb[0] - 6, 6.4, cb[2] + Math.sqrt(D.muslo * D.muslo - 36 - dyb * dyb)];
      /* abajo: la cadera de abajo, a 11,55 cm del suelo y a un muslo de la rodilla */
      var rec = function (L, z) { return { pel: [X_LADO, 11.55 + D.caderaX * Math.sin(AL_REC * RAD), z], giro: [-90, 0, -AL_REC], col: [0, L, 0], cab: [0, 0, -L * 0.35], bi: EN_CINTURA, mi: SUELTA }; };
      var z0 = K[2] - Math.sqrt(D.muslo * D.muslo - 36 - 5.15 * 5.15) - resolver(rec(0, 0)).d.cad[2];
      var a0 = brazo(rec(busca(function (L) { return largo(menos(resolver(rec(L, z0)).d.hom, C)); }, D.brazo, 5, 45), z0));
      var tobAbajo = function (y) { return [K[0] + 32, y, K[2] + Math.sqrt(D.pierna * D.pierna - 1024 - (K[1] - y) * (K[1] - y))]; };
      var conAbajo = function (P, y) { return sobre(P, { pd: { a: tobAbajo(y), polo: menos(K, resolver(P).d.cad) }, td: { tob: 8 } }); };
      var yA = busca(function (y) { return bajoZapa(resolver(conAbajo(a0, y)).d, 'd'); }, -0.3, 3, 11), A = tobAbajo(yA), A2 = [A[0], A[1] + 10.5, A[2]];
      /* el pie de abajo, de lado en el suelo, no cambia: dicho en el mundo (suelto, seguiría al muslo, que sube, y la punta se hundiría) */
      var Ep = resolver(conAbajo(a0, yA)).d, PIE_ABAJO = { punta: Ep.punta, arriba: Ep.arriba };
      var piernas = function (P, abre) {
        var Q = sobre(conAbajo(P, yA), { td: PIE_ABAJO }), arr = function (g) { return sobre(Q, { pi: piernaCon(Q, 'i', A2, g), ti: { tob: 8 } }); };
        return arr(busca(function (g) { return resolver(arr(g)).i.rod[1]; }, resolver(Q).d.rod[1] + 11.5, -70, 70) + abre);
      };
      var P = { a: piernas(a0, 0), b: piernas(b0, 36) }, K3 = ['md', 'ti', 'td'];
      P.a2 = refleja(P.a);
      var vuelta = darLaVuelta(P, 'v', 'a', true);
      /* antes de rodar, los pies se despegan del suelo: si no, la zapatilla de abajo, al girar, lo cortaría */
      P.vq = sobre(P.vq, { pd: { a: [A[0], A[1] + 6, A[2]], polo: P.a.pd.polo }, pi: { a: [A2[0], A2[1] + 6, A2[2]], polo: P.a.pi.polo } }); P.vq2 = refleja(P.vq);
      return {
        vista: [[-66, 14], [-22, 26]], rastro: 'pel', esfuerzo: [0, 1], clavos: K3,
        posturas: P, encuadra: ['a', 'b', 'a2', 'vs'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.7], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { sec: [['a', 1.6, 'freno', K3], ['a', 0.3, null, K3]].concat(vuelta.map(SIN_CLAVOS)), desde: 'b' }]
      };
    })();

    /* la aducción Copenhague con la rodilla apoyada: de lado sobre el antebrazo, con la cara interna de la rodilla de arriba sobre el canto
       de un banco bajo (30 cm) y esa espinilla tendida a lo largo de él; aprieta la pierna contra el banco, despega la cadera del suelo y
       mantiene, con el cuerpo en línea; y, para progresar, levanta también la pierna de abajo hasta juntar las rodillas (sube, estirada,
       por delante del canto del banco) */
    COREO['copenhague-rodilla'] = (function () {
      var H = 30, a0 = recostado(), S = resolver(a0).d.hom, AB = antebrazoEn(S), ci = resolver(a0).i.cad, dy = H + 6.3 - ci[1];
      var K = [ci[0] - 2, H + 6.3, ci[2] + Math.sqrt(D.muslo * D.muslo - 4 - dy * dy)], TA = [K[0] + 36.8, H + 5.4, K[2] + 9];
      /* el pie de arriba, tendido de lado sobre el banco, no cambia: se dice en el mundo */
      var arriba0 = function (P) { return sobre(P, { pi: { a: TA, polo: menos(K, resolver(P).i.cad) }, ti: { tob: 8 } }); }, Ep = resolver(arriba0(a0)).i, PIE_ARRIBA = { punta: Ep.punta, arriba: Ep.arriba };
      var arriba = function (P) { return sobre(arriba0(P), { ti: PIE_ARRIBA }); };
      var linea = function (x) { return enLinea(x, S, AB); }, beta = busca(function (x) { return largo(menos(resolver(linea(x)).i.cad, K)); }, D.muslo, 2, 45);
      var a = arriba(piernaAbajo(sobre(a0, AB), 6)), b = arriba(piernaAbajo(linea(beta), 6));
      /* la de abajo, estirada desde su cadera hasta pasar con la rodilla justo por debajo y por delante de la otra */
      var cdb = resolver(b).d.cad, u = unidad(menos([K[0] - 9.5, K[1] - 11, K[2]], cdb)), c = sobre(b, { pd: { a: mas(cdb, por(u, 77.7)), polo: [-1, 0, 0] }, td: { tob: 8 } });
      return {
        vista: [[-62, 14], [-18, 26]], isometrico: 'b', clavos: ['md', 'ti'],
        material: [['banco', { rumbo: 90, en: [K[0] - 3 + 45, K[2] + 4], largo: 90, alto: H }]],
        posturas: { a: a, b: b, c: c }, inicio: 'a', encuadra: ['a', 'b', 'c'],
        pasos: ['a', { sec: [['b', 1.6, 'suave']], desde: 'a' }, { sec: [['c', 1.5, 'suave']], desde: 'b' }]
      };
    })();

    /* la aducción Copenhague: de lado, con el codo justo debajo del hombro; apoya la cara interna del tobillo de la pierna de arriba sobre un
       banco (la recoge, la levanta y la tiende sobre él: así el pie no atraviesa la tapa); y sube la cadera hasta que el cuerpo queda en
       línea recta, sin que la pierna de abajo toque el suelo (cuelga bajo la otra, por debajo de la tapa del banco) */
    COREO.copenhague = (function () {
      var H = 44, a0 = recostado(), S = resolver(a0).d.hom, AB = antebrazoEn(S), ci = resolver(a0).i.cad, dy = H + 5.4 - ci[1];
      var TA = [ci[0] + 1, H + 5.4, ci[2] + Math.sqrt(77.8 * 77.8 - 1 - dy * dy)];
      var a = piernaArriba(piernaAbajo(sobre(a0, AB)), 0), enBanco = { pi: { a: TA, polo: [-1, 0, 0] }, ti: { tob: 8 } };
      /* recogida (la rodilla doblada, el pie aún bajo) y levantada (el pie ya por encima de la tapa, sin llegar a ella) */
      var m1 = sobre(a, { pi: { a: [ci[0] - 3, 24, ci[2] + 50], polo: [-1, 0.5, 0] }, ti: { tob: 8 } }), m2 = sobre(a, { pi: { a: [ci[0] - 1, H + 14, ci[2] + 51], polo: [-1, 0.4, 0] }, ti: { tob: 8 } });
      var b = sobre(a, enBanco);
      var linea = function (x) { return enLinea(x, S, AB); }, beta = busca(function (x) { return largo(menos(resolver(linea(x)).i.cad, TA)); }, 77.8, 0, 40);
      var c0 = sobre(linea(beta), enBanco), cdc = resolver(c0).d.cad, yT = 26, dyc = cdc[1] - yT;
      var c = sobre(c0, { pd: { a: [cdc[0] - 2, yT, cdc[2] + Math.sqrt(77.6 * 77.6 - 4 - dyc * dyc)], polo: [-1, 0, 0] }, td: { tob: 8 } });
      return {
        vista: [[-62, 14], [-18, 26]], isometrico: 'c', clavos: ['md'], clavosEn: { b: ['md', 'ti'], c: ['md', 'ti'] },
        material: [['banco', { rumbo: 90, en: [X_LADO + 6, TA[2] + 2], largo: 110, alto: H }]],
        posturas: { a: a, m1: m1, m2: m2, b: b, c: c }, inicio: 'a', encuadra: ['a', 'm2', 'c'],
        pasos: ['a', { sec: [['m1', 0.6, 'suave'], ['m2', 0.7, 'suave'], ['b', 0.7, 'suave']], desde: 'a' }, { sec: [['c', 1.7, 'suave', ['md', 'ti']]], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ A CUATRO PATAS ══════════════════════════════
       Las manos, bajo los hombros (de plano, con los dedos hacia delante) y las rodillas, bajo la cadera (a 7 cm del suelo), con los
       empeines apoyados. Los brazos, estirados: se busca la inclinación del tronco que deja el hombro a un brazo justo de la mano */
    var ZR4 = -34, EMPEINE = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
    function aCuatro(extra, x) {
      var P = function (w) { return function (cab) { return sobre({ pel: [x || 0, 47, ZR4], giro: [0, cab, 0], cab: [-10, 0, 0], pi: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, pd: { a: [-10, 7, ZR4 - 38], polo: [0, -1, 0.3] },
        t: EMPEINE, b: { a: w, polo: [0.4, 0.2, -1] }, m: EN_SUELO }, extra || {}); }; };
      var W0 = [19, ALTO_MUN, ZR4 + 43], W = [19, ALTO_MUN, resolver(aUnBrazo(P(W0), W0, 55, 89)).i.hom[2]];
      return aUnBrazo(P(W), W, 55, 89);
    }
    var K4 = ['mi', 'md', 'ti', 'td'];

    /* la patada de glúteo: a cuatro patas; empuja un pie hacia atrás hasta estirar la pierna por completo (queda en línea con el tronco, a la
       altura de la cadera); mantiene un segundo, vuelve y alterna las piernas. El peso va un poco hacia la rodilla que apoya */
    COREO['patada-gluteo-cuadrupedia'] = (function () {
      var a = aCuatro(), PIE_ATRAS = { punta: [0, -0.77, -0.64], arriba: [0, -0.64, 0.77] };
      var b = sobre(aCuatro({}, 2), { pd: { a: [-10, 46, ZR4 - 77.6], polo: [0, -1, 0] }, td: PIE_ATRAS }), KI = ['mi', 'md', 'ti'], KD = ['mi', 'md', 'td'];
      return {
        vista: [[-78, 12], [-142, 22]], rastro: 'td', esfuerzo: [0, 1, 4, 5], clavos: K4,
        posturas: { a: a, b: b, b2: refleja(b) },
        rep: [['b', 1.3, 'empuje', KI], ['b', 1.0, null, KI], ['a', 1.3, 'freno', KI], ['a', 0.3, null, K4], ['b2', 1.3, 'empuje', KD], ['b2', 1.0, null, KD], ['a', 1.3, 'freno', KD], ['a', 0.3, null, K4]],
        pasos: ['a', { sec: [['b', 1.3, 'empuje', KI]], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* la patada lateral: a cuatro patas; levanta una pierna hacia el lado, con la rodilla doblada, hasta que el muslo queda casi paralelo al
       suelo (75° de abducción: la pierna entera gira sobre el eje que va de la cadera hacia delante, y la espinilla sigue mirando atrás);
       estira la rodilla (la pierna, recta hacia el lado) y la dobla; y la deja otra vez bajo la cadera */
    COREO['patada-lateral-cuadrupedia'] = (function () {
      var a = aCuatro(), base = aCuatro({}, 2.5), cd = resolver(base).d.cad, G = 75, u = [-Math.sin(G * RAD), -Math.cos(G * RAD), 0], KI = ['mi', 'md', 'ti'];
      var rod = mas(cd, por(u, D.muslo));
      var h = sobre(base, { pd: { a: mas(rod, [0, 0, -D.pierna]), polo: u }, td: { punta: [-0.33, -0.09, -0.94], arriba: [-0.908, -0.243, 0.342] } });
      var e = sobre(base, { pd: { a: mas(cd, por(u, 77.6)), polo: [0, 0, 1] }, td: { punta: [-0.48, -0.13, 0.87], arriba: [0.84, 0.22, 0.5] } });
      return {
        vista: [[-152, 24], [-72, 14]], rastro: 'td', clavos: K4,
        posturas: { a: a, h: h, e: e }, inicio: 'a', encuadra: ['h', 'e'],
        pasos: ['a', { sec: [['h', 1.5, 'empuje', KI]], desde: 'a' }, { sec: [['h', 0.3, null, KI], ['e', 0.9, 'suave', KI], ['e', 0.35, null, KI], ['h', 0.9, 'suave', KI], ['a', 1.2, 'freno', KI]], desde: 'h' }]
      };
    })();

    /* el estiramiento de la rana: a cuatro patas; separa las rodillas hacia los lados y se apoya sobre los codos; y, sin mover codos ni
       rodillas, se balancea adelante y atrás, intentando acercar los glúteos a los pies. Las rodillas, a 38 cm del centro; las espinillas,
       hacia atrás, con los pies girados hacia fuera (su canto de dentro, en el suelo). La cadera va por el arco que le deja el muslo y el
       hombro, por el que le deja el brazo: se busca la inclinación del tronco */
    COREO['estiramiento-rana'] = (function () {
      var XK = 38, R2 = D.muslo * D.muslo - (XK - D.caderaX) * (XK - D.caderaX), ZC = 47.5, C = [19, Y_CODO, ZC];
      var PIE = { punta: [0.966, 0, -0.259], arriba: [0.2, 0.63, 0.75] };
      var con = function (z, cab, yT) { return { pel: [0, 6.4 + Math.sqrt(R2 - z * z), z], giro: [0, cab, 0], cab: [-22, 0, 0], p: { a: [XK + 4, yT, -37.8], polo: [1, -0.2, 1] }, t: PIE,
        b: { a: [17, ALTO_MUN, ZC + 23.7], polo: [0.2, -1, -0.6] }, m: EN_SUELO }; };
      var yT = busca(function (y) { return bajoZapa(resolver(con(4, 92, y)).i, 'i'); }, -0.3, 3, 12);
      var en = function (z) { return con(z, busca(function (cab) { return largo(menos(resolver(con(z, cab, yT)).i.hom, C)); }, D.brazo, 80, 115), yT); };
      var a0 = aCuatro(), f = en(4), r = en(-13);
      /* a medio abrir: todavía sobre las manos, que resbalan hacia delante, con las rodillas a medio camino */
      var m = sobre(a0, { pel: [0, 43, ZR4 + 20], pi: { a: [(10 + XK + 4) / 2, 6.6, -38 + (ZR4 + 20) * 0.4], polo: [0.5, -0.6, 1] }, pd: { a: [-(10 + XK + 4) / 2, 6.6, -38 + (ZR4 + 20) * 0.4], polo: [-0.5, -0.6, 1] },
        b: { a: [19, ALTO_MUN, 58], polo: [0.4, 0.2, -1] } });
      return {
        vista: [[-28, 26], [-100, 16]], rastro: 'pel', clavos: K4, material: [['esterilla', { en: [0, 14], med: [112, 1.6, 150] }]],
        posturas: { a0: a0, m: m, f: f, r: r }, inicio: 'f', encuadra: ['a0', 'r'],
        rep: [['r', 1.6, 'suave'], ['r', 0.7], ['f', 1.6, 'suave'], ['f', 0.4]],
        pasos: [{ sec: [['a0', 0.6, null, K4], ['m', 0.9, 'suave', K4], ['f', 1.3, 'suave', K4]], desde: 'a0' }, 'rep']
      };
    })();

    /* ══════════════════════════════ BOCA ABAJO ══════════════════════════════ */
    /* la rana boca abajo: tumbado boca abajo (la frente, sobre las manos), con las rodillas dobladas a 90 grados, separadas unos 30
       centímetros, y los talones juntos; aprieta los glúteos y sube los pies hacia el techo hasta que los muslos se despegan del suelo;
       una pausa arriba, y baja despacio */
    COREO['rana-boca-abajo'] = (function () {
      var Z0 = -22, base = { pel: [0, 11.5, Z0], giro: [0, 90, 0], cab: [-10, 0, 0], b: { a: [8.5, ALTO_MUN, Z0 + 66], polo: [1, 0.3, -0.1] }, m: apoyada([-0.94, 0, 0.34]) };
      var cad = resolver(base).i.cad, PIE = { punta: [0, 0.3, -0.954], arriba: [0, -0.954, -0.3] };
      var con = function (yk) {
        var dy = cad[1] - yk, K = [15, yk, cad[2] - Math.sqrt(D.muslo * D.muslo - 25 - dy * dy)], T = [4.4, K[1] + Math.sqrt(D.pierna * D.pierna - 10.6 * 10.6 - 1), K[2] - 1];
        return sobre(base, { p: { a: T, polo: menos(K, cad) }, t: PIE });
      };
      return {
        vista: [[-66, 16], [-150, 26]], rastro: 'pies', esfuerzo: [0, 1], clavos: ['mi', 'md'],
        posturas: { a: con(6.6), b: con(14) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.8], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* ══════════════════════════════ DE PIE, CON LAS MANOS EN LA PARED ══════════════════════════════
       De cara a una pared (el apoyo firme), a un paso de ella: las dos manos, de plano, a la altura del pecho (las muñecas, a ALTO_MUN de
       su cara). La mano que llega se pone primero ante la pared, ya de plano, y después la toca. El tronco no se inclina: el peso va un
       poco hacia la pierna que apoya */
    var ZW = 43.5, PARED_DELANTE = ['pared', { z: ZW + ALTO_MUN, normal: [0, 0, -1], ancho: 130 }];
    var EN_PARED = { b: { a: [17, 118, ZW], polo: [0.7, -1, -0.5] }, m: PLANA_PARED }, ANTE_PARED = { b: { a: [17, 114, ZW - 9], polo: [0.7, -1, -0.5] }, m: PLANA_PARED };
    var PIES_PARED = { suelo: [10, 0], abre: 5 }, K_PARED = ['mi', 'md', 'ti', 'td'];
    function aLaPared() { return [['a0', 0.5, null, T2], ['h', 0.9, 'entra', T2], ['a', 0.3, 'sale', T2]]; }
    /* la pierna izquierda, recta desde su cadera: «lado» grados hacia fuera y «atras» grados hacia atrás */
    function piernaRecta(P, lado, atras) {
      var c = resolver(P).i.cad, a = lado * RAD, b = atras * RAD;
      return { a: mas(c, por([Math.sin(a) * Math.cos(b), -Math.cos(a) * Math.cos(b), -Math.sin(b)], 77.8)), polo: [0, 0, 1] };
    }

    /* la elevación lateral de pierna: de pie, con las manos en la pared; eleva una pierna hacia el lado (34°), con la espalda y la cadera
       rectas y sin inclinar el cuerpo; vuelve y repite con la otra */
    COREO['elevacion-lateral-pierna-pie'] = (function () {
      var a0 = { p: PIES_PARED, b: aLosLados(10), m: SUELTA }, h = sobre(ANTE_PARED, { p: PIES_PARED }), a = sobre(EN_PARED, { p: PIES_PARED });
      var B = sobre(EN_PARED, { pel: [-3, PIE - 0.3, 0], pd: reflejo(PIES_PARED) }), b = sobre(B, { pi: piernaRecta(B, 34, 0), ti: { tob: 6 } });
      var KD = ['mi', 'md', 'td'], KI = ['mi', 'md', 'ti'];
      return {
        vista: [[166, 10], [118, 12]], rastro: 'ti', esfuerzo: [0, 1], clavos: K_PARED, clavosEn: { a0: T2 }, material: [PARED_DELANTE],
        posturas: { a0: a0, h: h, a: a, b: b, b2: refleja(b) }, inicio: 'a', encuadra: ['a0', 'b', 'b2'],
        rep: [['b', 1.5, 'suave', KD], ['b', 0.5, null, KD], ['a', 1.6, 'freno', KD], ['a', 0.4, null, K_PARED]],
        pasos: [{ sec: aLaPared(), desde: 'a0' }, 'rep', { sec: [['a', 1.2, 'freno', KD], ['a', 0.25, null, K_PARED], ['b2', 1.5, 'suave', KI]], desde: 'b' }]
      };
    })();

    /* la extensión de cadera: de pie, con las manos en la pared; con el tronco erguido, eleva una pierna recta hacia atrás (26°), sin
       arquear la espalda; mantiene arriba, baja despacio y repite con la otra. El pie se despega primero un poco, plano (m): girando desde
       el suelo con la pierna recta, la punta lo cortaría */
    COREO['extension-cadera-de-pie'] = (function () {
      var a0 = { p: PIES_PARED, b: aLosLados(10), m: SUELTA }, h = sobre(ANTE_PARED, { p: PIES_PARED }), a = sobre(EN_PARED, { p: PIES_PARED });
      var B = sobre(EN_PARED, { pel: [-2.5, PIE - 0.3, 0], pd: reflejo(PIES_PARED) });
      var m = sobre(B, { pel: [-1.5, PIE - 0.3, 0], pi: { a: [10, 14, -9], polo: [0, 0, 1] }, ti: { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] } });
      var b = sobre(B, { pi: piernaRecta(B, 0, 26), ti: { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] } });
      var KD = ['mi', 'md', 'td'], KI = ['mi', 'md', 'ti'];
      var sube = function (r, K) { return [['m' + r, 0.45, 'entra', K], ['b' + r, 1.25, 'sale', K]]; }, baja = function (r, K) { return [['m' + r, 1.2, 'entra', K], ['a', 0.4, 'sale', K]]; };
      return {
        vista: [[104, 10], [150, 12]], isometrico: 'b', clavos: K_PARED, clavosEn: { a0: T2, b: KD, b2: KI }, material: [PARED_DELANTE],
        posturas: { a0: a0, h: h, a: a, m: m, b: b, m2: refleja(m), b2: refleja(b) }, inicio: 'a', encuadra: ['a0', 'b'],
        pasos: [{ sec: aLaPared(), desde: 'a0' }, { sec: sube('', KD), desde: 'a' },
                { sec: [['b', 1.6, null, KD]].concat(baja('', KD), [['a', 0.2, null, K_PARED]], sube('2', KI)), desde: 'b' }]
      };
    })();

    /* el empuje isométrico contra la pared: de pie, de lado junto a una pared (a su izquierda); dobla la cadera y la rodilla de la pierna
       más cercana a ella hasta 90 grados (el muslo, horizontal y hacia delante; la espinilla, a plomo), con el lado de fuera de la rodilla
       contra la pared; y empuja el suelo con el pie de apoyo mientras aprieta esa pierna contra la pared, sin moverse */
    COREO['empuje-isometrico-pared'] = (function () {
      var XW = 30, pies = { suelo: [10, 0], abre: 4 };
      /* la mano de ese lado, de plano en la pared, a la altura del pecho (colgando, se quedaría a tres dedos de ella, sin tocarla) */
      var brazos = { bd: aLosLados(12), md: SUELTA, bi: { a: [XW - ALTO_MUN, 116, 13], polo: [-0.5, -1, -0.5] }, mi: apoyada([0, 1, 0], [1, 0, 0]) };
      var a = sobre(brazos, { p: pies });
      /* el pie se despega por la punta (a1) y sube con la rodilla (m); arriba, la rodilla queda a 6,5 cm de la pared, que es lo que abulta */
      var a1 = sobre(brazos, { pel: [-1, PIE - 0.3, 0], pd: reflejo(pies), pi: enPunta(10, 30) });
      var m = sobre(brazos, { pel: [-2, PIE - 0.4, 0], pd: reflejo(pies), pi: { a: [14, 30, 10], polo: [0.2, 0.3, 1] }, ti: { tob: 14 } });
      var arriba = function (x) { return sobre(brazos, { pel: [x, PIE - 0.5, 0], pd: reflejo(pies), pi: { a: [XW - 9, PIE - 2 - D.pierna, 39.2], polo: [0.35, 0.2, 1] }, ti: { tob: 10 } }); };
      var bx = busca(function (x) { return resolver(arriba(x)).i.rod[0]; }, XW - 6.5, -8, 4), b = arriba(bx), c = sobre(arriba(bx + 0.5), { hom: [-0.6, 0] });
      return {
        vista: [[-26, 10], [-150, 12]], isometrico: 'c', clavos: ['td', 'mi'], clavosEn: { a: ['ti', 'td', 'mi'] },
        material: [['pared', { x: XW, z: 6, normal: [-1, 0, 0], ancho: 150 }]],
        posturas: { a: a, a1: a1, m: m, b: b, c: c }, inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['a1', 0.35, 'entra', ['ti', 'td', 'mi']], ['m', 0.6, 'lineal'], ['b', 0.9, 'sale']], desde: 'a' }, { sec: [['c', 0.9, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ EL PUENTE ══════════════════════════════
       Como el del bloque 1: boca arriba (la cabeza hacia −Z), con las rodillas dobladas y las manos apoyadas junto a la cadera. Arriba, los
       hombros no se levantan del suelo (siguen en z = −23,5) y el tronco sube desde ellos «ang» grados */
    var PIES_PUENTE = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, MANOS_PUENTE = { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] };
    function enPuente(ang, extra) {
      var P = ang ? { pel: [0, 10 + 43.5 * Math.sin(ang * RAD), -23.5 + 43.5 * Math.cos(ang * RAD)], giro: [0, -90 - ang, 0], cab: [ang * 1.6, 0, 0] } : { pel: [0, 11.5, 20], giro: [0, -90, 0] };
      return sobre(P, extra || {});
    }

    /* con extensión alterna de piernas: sube la cadera en puente; sin bajarla, pasa el peso a una pierna y estira la otra (queda en línea
       con el otro muslo: las rodillas, a la misma altura); y alterna, con la cadera arriba todo el rato */
    COREO['puente-gluteos-extension-pierna'] = (function () {
      var base = { p: PIES_PUENTE, b: MANOS_PUENTE, m: EN_SUELO }, a = enPuente(0, base), b = enPuente(22, base);
      var Eb = resolver(b), u = unidad(menos(Eb.i.rod, Eb.i.cad)), B = sobre(b, { pel: [1.2, b.pel[1], b.pel[2]] }), cd = resolver(B).d.cad;
      var e = sobre(B, { pi: PIES_PUENTE, pd: { a: mas(cd, por([-u[0], u[1], u[2]], 77.6)), polo: [0, 1, 0] }, td: { tob: 4 } });
      var KI = ['mi', 'md', 'ti'], KD = ['mi', 'md', 'td'];
      return {
        vista: [[72, 16], [28, 30]], rastro: 'pel', esfuerzo: [0, 1, 4, 5], clavos: K4,
        posturas: { a: a, b: b, e: e, e2: refleja(e) }, inicio: 'b', encuadra: ['a', 'e'],
        rep: [['e', 1.2, 'suave', KI], ['e', 0.8, null, KI], ['b', 1.1, 'suave', KI], ['b', 0.3, null, K4], ['e2', 1.2, 'suave', KD], ['e2', 0.8, null, KD], ['b', 1.1, 'suave', KD], ['b', 0.3, null, K4]],
        pasos: [{ sec: [['a', 0.6, null, K4], ['b', 1.3, 'empuje', K4]], desde: 'a' }, 'rep', 'rep']
      };
    })();

    /* a una pierna: boca arriba, con las rodillas dobladas; levanta una pierna y sujeta el muslo con las dos manos (por detrás, cerca de la
       rodilla) para acercarla al pecho; apretando el talón del pie apoyado, sube la cadera, sin tanto que se arquee la zona lumbar (15°: el
       de dos piernas sube 22); baja despacio y cambia de pierna */
    COREO['puente-gluteos-una-pierna'] = (function () {
      var a0 = enPuente(0, { p: PIES_PUENTE, b: MANOS_PUENTE, m: EN_SUELO }), RODILLA = { e: 112, z: 0, c: 108 };
      var sujeta = function (P) {
        var L = resolver(P).d, u = unidad(menos(L.rod, L.cad)), c = mas(L.cad, mas(por(u, 29), por(L.frenteMuslo, -8)));
        var Q = conAgarre(sobre(P, { m: { tipo: 'puno', prono: 0 } }), [c[0] + 5.5, c[1], c[2]], [1, -0.5, 0.2], 'bi');
        return conAgarre(Q, [c[0] - 5.5, c[1], c[2]], [-1, -0.5, 0.2], 'bd');
      };
      var con = function (ang) { return sujeta(enPuente(ang, { pi: PIES_PUENTE, pd: RODILLA, td: { tob: 10 } })); }, k = con(0), b = con(15);
      /* de las manos en el suelo a las manos en el muslo (y al revés) se pasa por las manos en alto, sobre el abdomen: en línea recta, el
         antebrazo cortaría el suelo */
      var a1 = sobre(k, { b: { a: [15, 6, 21], en: 'torax', polo: [1, -0.5, -0.2] }, m: SUELTA });
      return {
        vista: [[72, 16], [28, 30]], rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti'], clavosEn: { a0: K4, k2: ['td'], b2: ['td'] },
        posturas: { a0: a0, a1: a1, k: k, b: b, a12: refleja(a1), k2: refleja(k), b2: refleja(b) }, inicio: 'k', encuadra: ['a0', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['k', 1.7, 'freno'], ['k', 0.4]],
        pasos: [{ sec: [['a0', 0.5, null, K4], ['a1', 0.8, 'suave', ['ti']], ['k', 0.8, 'suave', ['ti']]], desde: 'a0' }, 'rep',
                { sec: [['k', 1.4, 'freno', ['ti']], ['a1', 0.5, 'suave', ['ti']], ['a0', 0.6, 'suave', ['ti']], ['a12', 0.6, 'suave', ['td']], ['k2', 0.7, 'suave', ['td']], ['b2', 1.2, 'empuje', ['td']]], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ EL HIP THRUST ══════════════════════════════
       Como el del bloque 1: la parte alta de la espalda, contra el canto de un banco atravesado; el tronco gira sobre ese canto (los
       hombros no se mueven de [z = −24, y = 48,5]) y los pies no se mueven. enBanco(y): con la cadera a «y» del suelo (11,8, sentado en él;
       49, arriba: las rodillas, la cadera y los hombros, en línea, y los pies justo debajo de las rodillas) */
    var PIES_HT = { suelo: [17, 60], abre: 6, polo: [0.15, 1, 0.3] }, BANCO_HT = ['banco', { rumbo: 90, en: [0, -36], largo: 110 }], EJE_HT = [-24, 48.5];
    function enBanco(y, extra) {
      var dy = EJE_HT[1] - y, dz = Math.sqrt(43.5 * 43.5 - dy * dy);
      return sobre({ pel: [0, y, EJE_HT[0] + dz], giro: [0, -Math.atan2(dz, dy) / RAD, 0], cab: [12, 0, 0], p: PIES_HT }, extra || {});
    }
    /* dónde descansa lo que se lleva en la ingle (la barra con su almohadilla, una mancuerna): en el hueco entre el abdomen y los muslos, a
       «r» de los dos (en la bisectriz del ángulo que forman el tronco y los muslos); x, a un lado */
    function enIngle(P, r, x) {
      var E = resolver(P), Y = aplicar(E.Bp, [0, 1, 0]), u = unidad(mas(unidad(menos(E.i.rod, E.i.cad)), unidad(menos(E.d.rod, E.d.cad))));
      var bis = unidad(mas(mas(Y, u), por(aplicar(E.Bp, [0, 0, 1]), 0.03))), sm = Math.sqrt(Math.max(0, (1 - punto(Y, u)) / 2));
      return mas(E.pel, mas(por(bis, r / Math.max(sm, 0.55)), [x || 0, 0, 0]));
    }

    /* con barra: sentado en el suelo, con la parte alta de la espalda contra el banco y las rodillas dobladas (la barra espera en el suelo,
       pasados los pies); para colocarla estira las piernas, se echa hacia delante, la coge y la hace rodar sobre las piernas hasta la
       parte alta de los muslos, junto a la cadera (lleva su almohadilla); recoge los pies bajo las rodillas y empuja la cadera hacia
       arriba hasta la línea recta de rodillas a hombros; y baja el coxis hacia el suelo con control */
    COREO['hip-thrust-barra'] = (function () {
      var G = 27, RB = 12, ZR = 82, R = [0, 21, ZR], MANO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, -0.3] }, PIE_E = { punta: [0, 0.57, 0.82], arriba: [0, 0.82, -0.57] };
      var conBarra = function (P, c) { c = c || enIngle(P, RB); return conAgarre(sobre(P, { m: MANO }), [G, c[1], c[2]], [1, -0.3, -0.5]); };
      var recto = function (P, y) { var c = resolver(P).i.cad, d = 77.6; return sobre(P, { p: { a: [11, y, c[2] + Math.sqrt(d * d - 1 - (c[1] - y) * (c[1] - y))], polo: [0, 1, 0] }, t: PIE_E }); };
      var yT = busca(function (y) { return bajoZapa(resolver(recto(enBanco(11.8), y)).i, 'i'); }, -0.3, 4, 16), pz = enBanco(11.8).pel[2];
      var echado = function (x) { return recto(sobre(enBanco(11.8), { giro: [0, x, 0], col: [x * 0.4, 0, 0], cab: [-x * 0.5, 0, 0] }), yT); };
      var xg = busca(function (x) { return largo(menos(resolver(echado(x)).i.hom, [G, R[1], ZR])); }, BRAZO - 1, 0, 75);
      var P = {
        s: enSusMuslos(enBanco(11.8)), e: enSusMuslos(recto(enBanco(11.8), yT)),
        g: conBarra(echado(xg), R), r1: conBarra(echado(xg * 0.3), [0, 23.5, pz + 34]), r: conBarra(recto(enBanco(11.8), yT)),
        k: conBarra(enBanco(11.8)), a: conBarra(enBanco(17)), b: conBarra(enBanco(49, { cab: [14, 0, 0] }))
      };
      return {
        vista: [[40, 22], [80, 14]], rastro: 'pel', esfuerzo: [3], clavos: T2, reposo: ['s', 'e'],
        material: [BANCO_HT, ['barra', { almohadilla: true, reposo: R }]],
        posturas: P, inicio: 'b', encuadra: ['s', 'g', 'b'],
        rep: [['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.4], ['b', 1.2, 'empuje']],
        pasos: ['s', { sec: [['e', 0.8, 'suave', T2], ['g', 1.0, 'suave', T2], ['g', 0.2, null, T2], ['r1', 0.8, 'entra', K4], ['r', 0.6, 'sale', K4]], desde: 's' },
                { sec: [['k', 0.9, 'suave', T2], ['b', 1.3, 'empuje', T2], ['b', 0.6, null, T2], ['a', 1.8, 'freno', T2], ['a', 0.3, null, T2], ['b', 1.3, 'empuje', T2]], desde: 'r' }, 'rep']
      };
    })();

    /* con mancuernas: la parte alta de la espalda y los hombros, de través sobre el banco, con los pies a la anchura de la cadera (arriba:
       las mancuernas esperan en el banco, junto a los hombros); las coge, una en cada mano, y las apoya sobre la cadera; baja despacio el
       coxis hacia el suelo sin soltarlas; y, para subir, empuja el suelo con los pies */
    COREO['hip-thrust-mancuernas'] = (function () {
      var RD = 6.6, XM = 13.5, r = 10.2 + RD - 1.2, RM = [46, 44 + RD + 0.3, -36], pies = { suelo: [10, 60], abre: 4, polo: [0.1, 1, 0.3] };
      var con = function (P) { var c = enIngle(P, r); return conAgarre(sobre(P, { m: { tipo: 'puno', barra: [1, 0, 0], palma: aplicar(resolver(P).Bp, [0, 0, -1]) } }), [XM, c[1], c[2]], [1, -0.4, -0.4]); };
      var arriba = enBanco(49, { cab: [14, 0, 0], p: pies }), b0 = sobre(arriba, { b: { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, m: SUELTA });
      var g = conAgarre(sobre(arriba, { m: { tipo: 'puno', barra: [0, 0, 1], palma: [0, -1, 0] } }), RM, [0.5, -0.3, 1]);
      return {
        vista: [[40, 22], [80, 14]], rastro: 'pel', esfuerzo: [0], clavos: T2, reposo: ['b0'],
        material: [BANCO_HT, ['mancuernas', { reposo: { i: RM, d: [-RM[0], RM[1], RM[2]] }, ejeReposo: [0, 0, 1] }]],
        posturas: { b0: b0, g: g, h: con(arriba), a: con(enBanco(17, { p: pies })) }, inicio: 'a', encuadra: ['b0', 'g'],
        rep: [['h', 1.2, 'empuje'], ['h', 0.6], ['a', 1.8, 'freno'], ['a', 0.5]],
        pasos: ['b0', { sec: [['g', 0.9, 'suave'], ['g', 0.2], ['h', 1.3, 'suave']], desde: 'b0' }, { sec: [['a', 2.0, 'freno']], desde: 'h' }, 'rep']
      };
    })();

    /* a una pierna: la parte alta de la espalda, en el banco, con los pies en el suelo y las rodillas dobladas (las manos, en la cintura);
       levanta una pierna del suelo; empuja con el pie apoyado y extiende la cadera hasta alinear rodilla, cadera y hombros; baja y cambia
       de pierna */
    COREO['hip-thrust-una-pierna'] = (function () {
      var brazos = { b: { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, m: SUELTA }, LIBRE = { e: 68, z: 0, c: 84 };
      var con = function (y, cab) { return enBanco(y, sobre(brazos, { cab: [cab, 0, 0], pi: PIES_HT, pd: LIBRE, td: { tob: 8 } })); };
      var a = enBanco(22, brazos), l = con(22, 12), b = con(49, 14), KI = ['ti'], KD = ['td'];
      return {
        vista: [[72, 16], [30, 24]], rastro: 'pel', clavos: KI, clavosEn: { a: T2, l2: KD, b2: KD }, material: [BANCO_HT],
        posturas: { a: a, l: l, b: b, l2: refleja(l), b2: refleja(b) }, inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['l', 1.2, 'suave', KI]], desde: 'a' },
                { sec: [['b', 1.2, 'empuje', KI], ['b', 0.5, null, KI], ['l', 1.6, 'freno', KI], ['a', 0.7, 'suave', KI], ['l2', 0.8, 'suave', KD], ['b2', 1.2, 'empuje', KD]], desde: 'l' }]
      };
    })();

    /* ══════════════════════════════ AYUDAS PARA ESTAR DE PIE ══════════════════════════════ */
    /* lo más alto que puede ir la cadera con un tobillo a «d» cm (en planta) de la vertical de su cadera: la pierna, a 0,2 cm de estirarse del todo */
    function altoCon(d) { return D.tobillo + Math.sqrt(77.8 * 77.8 - d * d); }
    /* un pie en el aire, mirando «g» grados hacia fuera y con la punta algo caída (el izquierdo; el derecho, con −g) */
    function alAire(g, cae) { var c = cae == null ? 0.14 : cae, k = Math.sqrt(1 - c * c), t = g * RAD; return { punta: [k * Math.sin(t), -c, k * Math.cos(t)], arriba: [c * Math.sin(t), k, c * Math.cos(t)] }; }

    /* ══════════════════════════════ LAS POLEAS ══════════════════════════════
       La polea, en lo más bajo (a 16 cm del suelo). Con la tobillera, el cable va a una banda que rodea la pierna justo encima del tobillo */

    /* la patada de glúteo: de cara a la máquina, con la tobillera en un tobillo (el izquierdo); se agarra a la columna con las dos manos (a
       la altura del pecho), dobla un poco las rodillas y, con el tronco erguido, lleva la pierna hacia atrás y hacia arriba (32°, recta); y
       vuelve despacio. El pie se despega primero un poco, plano (m): girando desde el suelo con la pierna recta, la punta lo cortaría */
    COREO['patada-gluteo-polea'] = (function () {
      var ZC = 52, YP = PIE - 3, pies = { suelo: [9, 0], abre: 5 }, MANO_COL = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };
      var agarrado = function (P) { return conAgarre(sobre(P, { m: MANO_COL }), [6.6, 112, ZC - 1.5], [0.7, -1, -0.4]); };
      var s = { p: pies, b: aLosLados(10), m: SUELTA }, a = agarrado({ pel: [0, YP, 0], p: pies });
      var B = { pel: [-2.5, YP, 0], pd: reflejo(pies) };
      var m = agarrado(sobre(B, { pel: [-1.5, YP, 0], pi: { a: [9, 13, -8], polo: [0, 0, 1] }, ti: { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] } }));
      var b = agarrado(sobre(B, { pi: piernaRecta(B, 0, 32), ti: { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] } }));
      var KD = ['mi', 'md', 'td'];
      return {
        vista: [[104, 10], [150, 12]], rastro: 'ti', esfuerzo: [0, 1], clavos: K4, clavosEn: { s: T2 },
        material: [['polea', { en: [0, ZC], alto: 16, a: 'tobillo-i', tobillera: true, encuadre: 150 }]],
        posturas: { s: s, a: a, m: m, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['m', 0.4, 'entra', KD], ['b', 1.2, 'sale', KD], ['b', 0.5, null, KD], ['m', 1.5, 'entra', KD], ['a', 0.4, 'sale', KD], ['a', 0.3, null, K4]],
        pasos: ['s', { sec: [['a', 1.3, 'suave', T2]], desde: 's' }, { sec: [['m', 0.45, 'entra', KD], ['b', 1.25, 'sale', KD]], desde: 'a' }, { rep: 1.6 }]
      };
    })();

    /* la aducción de cadera: la tobillera, justo encima del tobillo derecho, y la máquina, a su derecha; se aleja tres pasos hacia la
       izquierda (de lado: abre el pie izquierdo y le junta el derecho), con la espalda recta y la rodilla izquierda algo doblada (la
       pierna derecha queda abierta hacia la máquina, que tira de ella); lleva el pie derecho hacia el centro hasta que queda delante del
       izquierdo, para un segundo y lo deja volver despacio hacia el lado, sin inclinar ni girar el tronco (las manos, en la cintura).
       Los dos tobillos van clavados a su camino: el pie que viaja no roza el suelo */
    COREO['aduccion-cadera-polea'] = (function () {
      var XM = 135, PASO = 28, N = 3, X0 = -PASO * N, P = {}, sec = [], k;
      var sueltos = { b: aLosLados(10), m: SUELTA }, pie = function (x) { return { suelo: [x, 0], abre: 5 }; };
      var deLadoEn = function (X, f) {
        if (f === 0) return sobre(sueltos, { pel: [X, PIE - 0.3, 0], pi: pie(X + 9), pd: pie(X - 9) });
        if (f === 1) return sobre(sueltos, { pel: [X - 3, PIE - 0.8, 0], pi: { a: [X + 9 + PASO / 2, D.tobillo + 5, 1], polo: [0.2, 0.1, 1] }, ti: alAire(5), pd: pie(X - 9) });
        if (f === 2) return sobre(sueltos, { pel: [X + PASO / 2, altoCon(PASO / 2 - 1) - 0.3, 0], pi: pie(X + 9 + PASO), pd: pie(X - 9) });
        return sobre(sueltos, { pel: [X + PASO + 3, PIE - 0.8, 0], pi: pie(X + 9 + PASO), pd: { a: [X - 9 + PASO / 2, D.tobillo + 5, 1], polo: [-0.2, 0.1, 1] }, td: alAire(-5) });
      };
      P.s = deLadoEn(X0, 0);
      for (k = 0; k < N; k++) {
        var X = X0 + k * PASO;
        P['l' + k + '1'] = deLadoEn(X, 1); P['l' + k + '2'] = deLadoEn(X, 2); P['l' + k + '3'] = deLadoEn(X, 3); P['l' + k + '4'] = deLadoEn(X + PASO, 0);
        sec.push(['l' + k + '1', 0.26, 'entra', T2], ['l' + k + '2', 0.24, 'sale', T2], ['l' + k + '3', 0.26, 'entra', T2], ['l' + k + '4', 0.24, 'sale', T2]);
      }
      /* en su sitio: el peso, sobre la pierna izquierda (la rodilla, algo doblada); la derecha, recta y abierta 28° hacia la máquina */
      var YP = PIE - 3, base = { pel: [4, YP, 0], pi: { suelo: [9, 0], abre: 5, polo: [0.15, 0.1, 1] }, b: EN_CINTURA, m: SUELTA }, cd = resolver(base).d.cad, G = 28 * RAD;
      var PIE_D = { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] };
      P.o = sobre(base, { pd: { a: mas(cd, por([-Math.sin(G), -Math.cos(G), 0], 77.6)), polo: [-0.2, 0.1, 1] }, td: PIE_D });
      P.m = sobre(base, { pd: { a: [-3, 11.5, 11], polo: [-0.2, 0.1, 1] }, td: PIE_D });
      P.c = sobre(base, { pd: { a: [9, 12, 23], polo: [-0.3, 0.1, 1] }, td: PIE_D });
      return {
        vista: [[-24, 12], [-66, 14]], rastro: 'td', esfuerzo: [0, 1], clavos: T2,
        material: [['polea', { en: [-XM, 0], rumbo: -90, alto: 16, a: 'tobillo-d', tobillera: true, encuadre: 150 }]],
        posturas: P, inicio: 'o', encuadra: ['s', 'o', 'c'],
        rep: [['m', 0.7, 'entra', T2], ['c', 0.7, 'sale', T2], ['c', 1.0, null, T2], ['m', 1.0, 'entra', T2], ['o', 1.0, 'sale', T2], ['o', 0.4, null, T2]],
        pasos: ['s', { sec: [['s', 0.5, null, T2]].concat(sec, [['o', 0.9, 'suave', T2]]), desde: 's' }, 'rep', { rep: 2.4 }]
      };
    })();

    /* el pull-through: de espaldas a la máquina, con la cuerda (enganchada a la polea más baja) entre las piernas, sujeta con las dos
       manos por delante; da dos pasos hacia delante para tensarla (las pesas suben); con la espalda plana y las rodillas algo flexionadas,
       lleva la cadera atrás (las manos van entre las piernas, hacia la polea); y vuelve a ponerse de pie adelantando la cadera. Los pies, algo
       más abiertos que los hombros y con las rodillas hacia fuera: así las manos y la cuerda caben entre los muslos */
    COREO['pull-through-polea'] = (function () {
      var ZC = 105, Z0 = -60, X = 21, G = 3.6, NEUTRA = { tipo: 'puno', prono: 0 }, P = {};
      var pie = function (z) { return { suelo: [X, z], abre: 12, polo: [0.5, 0.1, 1] }; }, pieD = function (z) { return reflejo(pie(z)); };
      /* de pie: los puños, juntos por delante de la cadera, con los brazos estirados */
      var dePie = function (c) { var Q = sobre({ m: NEUTRA }, c), h = resolver(Q).i.hom; return conAgarre(Q, [G, h[1] - 57, Q.pel[2] + 9.5], [1, 0.1, -0.6]); };
      var ya = altoCon(X - D.caderaX), yp = altoCon(Math.sqrt((X - D.caderaX) * (X - D.caderaX) + 225)) - 0.4;
      P.s = dePie({ pel: [0, ya, Z0], pi: pie(Z0), pd: pieD(Z0) });
      /* los pasos: el izquierdo (30 cm), el derecho (60) y el izquierdo, que se le junta; cada uno, por el aire */
      P.w1 = dePie({ pel: [-2.5, ya - 0.8, Z0 + 5], pi: { a: [X, D.tobillo + 5, Z0 + 15], polo: [0.1, 0.1, 1] }, ti: alAire(6), pd: pieD(Z0) });
      P.w2 = dePie({ pel: [0, yp, Z0 + 15], pi: pie(Z0 + 30), pd: pieD(Z0) });
      P.w3 = dePie({ pel: [2.5, ya - 0.8, Z0 + 30], pi: pie(Z0 + 30), pd: { a: [-X, D.tobillo + 5, Z0 + 30], polo: [-0.1, 0.1, 1] }, td: alAire(-6) });
      P.w4 = dePie({ pel: [0, yp, Z0 + 45], pi: pie(Z0 + 30), pd: pieD(0) });
      P.w5 = dePie({ pel: [-2.5, ya - 0.8, -3], pi: { a: [X, D.tobillo + 5, -14], polo: [0.1, 0.1, 1] }, ti: alAire(6), pd: pieD(0) });
      P.a = dePie({ pel: [0, ya, 0], p: pie(0) });
      /* la bisagra: la cadera, atrás; el tronco, 58° hacia delante; los brazos, estirados hacia abajo y atrás, entre las piernas */
      var B = { pel: [0, 80, -24], giro: [0, 60, 0], cab: [-31, 0, 0], p: pie(0), m: NEUTRA }, hb = resolver(B).i.hom;
      P.b = conAgarre(B, [G, hb[1] - 49, hb[2] - 31], [1, 0.3, -0.2]);
      return {
        vista: [[72, 12], [120, 14]], rastro: 'pel', esfuerzo: [0], clavos: T2,
        material: [['polea', { en: [0, -ZC], rumbo: 180, alto: 16, a: 'manos', agarre: 'cuerda', encuadre: 150 }]],
        posturas: P, inicio: 'b', encuadra: ['s', 'a', 'b'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.6], ['b', 1.9, 'freno'], ['b', 0.4]],
        pasos: [{ sec: [['s', 0.8, null, T2], ['w1', 0.3, 'entra', T2], ['w2', 0.3, 'sale', T2], ['w3', 0.34, 'entra', T2], ['w4', 0.34, 'sale', T2], ['w5', 0.3, 'entra', T2], ['a', 0.3, 'sale', T2]], desde: 's' },
                { sec: [['b', 2.0, 'freno']], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════════════════════════ LA PESA RUSA ══════════════════════════════
       Cogida por el asa con las dos manos juntas (las palmas hacia él), en el centro del cuerpo */
    var ASA_PESA = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, -1] }, G_PESA = 4;

    /* el peso muerto sumo: los pies, más separados que los hombros y con las puntas hacia fuera (35°); la pesa cuelga de las dos manos, con
       los brazos estirados; con la espalda recta, los hombros atrás y el pecho alto, baja doblando rodillas y cadera (las rodillas, hacia
       donde miran las puntas) hasta que la pesa queda a unos 10 cm del suelo; y sube hasta quedar de pie. Los brazos, a plomo todo el rato */
    COREO['peso-muerto-sumo-kettlebell'] = (function () {
      var pies = { suelo: [30, 0], abre: 35, polo: [0.7, 0.1, 0.85] };
      var colgada = function (P, dz) { var Q = sobre(P, { hom: [0, -1.5], m: ASA_PESA }), h = resolver(Q).i.hom; return conAgarre(Q, [G_PESA, h[1] - 58.4, h[2] + dz], [1, 0.2, -0.5]); };
      var a = colgada({ pel: [0, altoCon(20), 0], p: pies }, 11);
      var b = colgada({ pel: [0, 59, -24], giro: [0, 48, 0], col: [-3, 0, 0], cab: [-40, 0, 0], p: pies }, 2);
      return {
        vista: [[36, 12], [84, 12]], rastro: 'manos', esfuerzo: [2], clavos: T2, material: [['kettlebell', { cuelga: true }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.4, 0.5]),
        pasos: ['a', { sec: [['b', 2.0, 'freno']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* el swing: de pie, con los pies a la anchura de los hombros y las rodillas algo dobladas, la pesa cogida con las dos manos; con la
       espalda recta, la cadera va atrás y la pesa pasa entre las piernas (los brazos, estirados hacia abajo y atrás); saca pecho y adelanta
       la cadera con rapidez, y la pesa sube hasta el pecho con los brazos estirados (no tiran los hombros: los brazos van sueltos y es la
       cadera la que la lanza); la guía de vuelta entre las piernas y encadena la siguiente */
    COREO['swing-kettlebell'] = (function () {
      var pies = { suelo: [18, 0], abre: 10, polo: [0.42, 0.1, 1] };
      var haciaDe = function (P, dir) { var Q = sobre(P, { m: ASA_PESA }), h = resolver(Q).i.hom, u = unidad(dir); return conAgarre(Q, [G_PESA, h[1] + u[1] * 58.4, h[2] + u[2] * 58.4], [1, -0.2, -0.4]); };
      var a = haciaDe({ pel: [0, 82, 0], p: pies }, [0, -1, 0.17]);
      var b = haciaDe({ pel: [0, 72, -24], giro: [0, 55, 0], cab: [-30, 0, 0], p: pies }, [0, -0.8, -0.6]);
      var c = haciaDe({ pel: [0, altoCon(8) - 0.3, 1], giro: [0, -3, 0], hom: [0, -1.5], p: pies }, [0, -0.12, 1]);
      return {
        vista: [[70, 12], [28, 14]], rastro: 'manos', esfuerzo: [0], clavos: T2, material: [['kettlebell']],
        posturas: { a: a, b: b, c: c }, inicio: 'b', encuadra: ['a', 'c'],
        rep: [['c', 0.55, 'sale'], ['c', 0.15], ['b', 0.7, 'entra'], ['b', 0.12]],
        pasos: ['a', { sec: [['b', 1.3, 'suave']], desde: 'a' }, 'rep', { rep: 0.55 }]
      };
    })();

    /* ══════════════════════════════ LAS ZANCADAS ══════════════════════════════
       Como la del bloque 1: abajo, el pie de delante (el izquierdo), plano, con la rodilla sobre el tobillo y el muslo paralelo al suelo (la
       cadera, a 47 cm del suelo y 36 por detrás de ese tobillo); el de atrás, 70 cm más atrás, apoyado en su parte delantera, con la
       rodilla a cuatro dedos del suelo. Arriba (en zancada, sin bajar), la cadera a 77,5 cm. Los dos tobillos van siempre clavados a su camino: el
       pie que apoya no se mueve y el que viaja no roza el suelo.
       zancadas(x, carga, xa): las posturas, con el pie de delante a «x» del centro y el de atrás a «xa» (si no se dice, igual); z es
       siempre dónde pisa (o va a pisar) el tobillo de delante. Con la otra pierna, reflejadas. carga(P): los brazos y lo que llevan */
    var Z_LARGO = 70, PUNTA_ABAJO = { punta: [0, -0.5, 0.866], arriba: [0, 0.866, 0.5] }, PUNTA_ARRIBA = { punta: [0, 0.26, 0.966], arriba: [0, 0.966, -0.26] };
    /* el talón, al pisar (la punta, 20° hacia arriba): a qué altura queda el tobillo y cuánto por detrás de donde quedará con el pie plano */
    var K20 = Math.cos(20 * RAD), S20 = Math.sin(20 * RAD), DE_TALON = { punta: [0, S20, K20], arriba: [0, K20, -S20] }, Y_TALON = D.tobillo * K20 + D.talon * S20 + 0.3, Z_TALON = D.talon - D.talon * K20 + D.tobillo * S20;
    var SUELTOS = function (P) { return sobre({ b: aLosLados(12), m: SUELTA }, P); };
    function zancadas(x, carga, xa) {
      xa = xa == null ? x : xa;
      var del = function (z) { return { suelo: [x, z], abre: 2, polo: [0.1, 0.1, 1] }; };
      var det = function (z, t, polo) { return { suelo: [-xa, z], abre: 2, talon: t, polo: polo || [0, -1, 0.4] }; };
      return {
        con: carga || SUELTOS,
        /* de pie, con los dos pies en z */
        pie: function (z) { return { pel: [0, altoCon(Math.abs(xa - D.caderaX)) - 0.2, z], pi: { suelo: [xa, z], abre: 2 }, pd: { suelo: [-xa, z], abre: 2 } }; },
        baja: function (z) { return { pel: [0, 47, z - 36], giro: [0, 5, 0], pi: del(z), pd: det(z - Z_LARGO, 62) }; },
        alta: function (z) { return { pel: [0, 77.5, z - 31], pi: del(z), pd: det(z - Z_LARGO, 30) }; },
        /* el paso al frente: el pie viaja por el aire con la punta hacia arriba (va) y apoya primero el talón (talon); el de atrás va
           levantando el suyo */
        va: function (z) { return { pel: [0, 84.3, z - 63], pi: { a: [(x + xa) / 2, 17, z - 36], polo: [0, 0.3, 1] }, ti: PUNTA_ARRIBA, pd: det(z - Z_LARGO, 10, [0, 0.1, 1]) }; },
        talon: function (z) { return { pel: [0, 76, z - 42], pi: { a: [x, Y_TALON, z - Z_TALON], polo: [0, 0.2, 1] }, ti: DE_TALON, pd: det(z - Z_LARGO, 20, [0, -0.3, 1]) }; },
        /* la vuelta de un paso al frente: empuja con la pierna de delante (el pie, aún apoyado) y ese pie vuelve por el aire */
        empuja: function (z) { return { pel: [0, 68, z - 48], giro: [0, 4, 0], pi: del(z), pd: det(z - Z_LARGO, 45) }; },
        vuelve: function (z) { return { pel: [0, 77, z - 59], pi: { a: [(x + xa) / 2, 18, z - 30], polo: [0, 0.3, 1] }, ti: alAire(0, 0.2), pd: det(z - Z_LARGO, 26, [0, -0.3, 1]) }; },
        /* el paso atrás: el pie de atrás viaja por el aire, con la punta caída; hacia la zancada alta (atras) o saliendo de la baja (sube) */
        atras: function (z) { return { pel: [0, 82.5, z - 14], pi: del(z), pd: { a: [-xa, 20, z - 34], polo: [0, -0.3, 1] }, td: PUNTA_ABAJO }; },
        sube: function (z) { return { pel: [0, 66, z - 17], giro: [0, 3, 0], pi: del(z), pd: { a: [-xa - 1, 24, z - 31], polo: [0, -0.6, 1] }, td: PUNTA_ABAJO }; },
        /* andando: desde abajo se levanta sobre la pierna de delante (alza: el pie de atrás deja el suelo) y pasa (a la pata coja, con el
           otro pie pasando a su lado, camino del paso siguiente) */
        alza: function (z) { return { pel: [0, 66, z - 20], giro: [0, 6, 0], pi: del(z), pd: { a: [-xa, 25, z - 46], polo: [0, -0.6, 1] }, td: PUNTA_ABAJO }; },
        pasa: function (z) { return { pel: [1.5, altoCon(Math.abs(x - D.caderaX - 1.5) + 3.5) - 0.3, z + 3.5], pi: { suelo: [x, z], abre: 2 }, pd: { a: [-xa + 1, 16.5, z - 5], polo: [0, 0.1, 1] }, td: { punta: [0, -0.14, 0.99], arriba: [0, 0.99, 0.14] } }; }
      };
    }
    /* con una mancuerna en cada mano: cuelgan a plomo junto a los muslos, con las palmas enfrentadas (cada puño, 8 cm más afuera que su
       hombro). Vale con el cuerpo mirando a cualquier lado (a la vuelta de un paseo) */
    var NEUTRA = { tipo: 'puno', prono: 0 };
    function conMancuernas(P) {
      var Q = sobre(P, { m: NEUTRA }), E = resolver(Q), c = {};
      LADOS.forEach(function (k) {
        var sg = k === 'i' ? 1 : -1, h = E[k].hom, lado = aplicar(E.Bp, [sg, 0, 0]), atras = aplicar(E.Bp, [0, 0, -1]), u = unidad(menos([h[0] + lado[0] * 8, h[1] - BRAZO, h[2] + lado[2] * 8], h));
        c['b' + k] = { a: mas(h, por(u, BRAZO - D.mano - 0.3)), polo: mas(lado, mas([0, 0.2, 0], por(atras, 0.6))) };
      });
      return sobre(Q, c);
    }
    /* con la barra a la espalda (como en los bloques 1 y 9): pegada a la parte alta de la espalda, con las manos algo más abiertas que los hombros */
    var ESPALDA = ['barra', { ancla: 'torax', en: [0, 23, -9.5], discos: 17 }], A_LA_BARRA = { hom: [0, -1.5], b: { a: [34, 21, -9], en: 'torax', polo: [0.6, -1, -0.5] }, m: PRONO };
    function conBarra(P) { return sobre(P, A_LA_BARRA); }
    function enBarra(n) { return ['mi@' + n + ':34', 'md@' + n + ':-34']; }

    /* la zancada estática: un pie adelantado y el otro atrás (da el paso atrás desde de pie), separados de lado más o menos como los
       hombros; baja despacio doblando las dos rodillas hasta que la de delante forma casi un ángulo recto, sin pasar de la punta del pie; y
       sube empujando con la pierna de delante, sin mover los pies */
    COREO['zancada-estatica'] = (function () {
      var Z = zancadas(17), P = { a0: Z.con(Z.pie(0)), p: Z.con(Z.atras(0)), a: Z.con(Z.alta(0)), b: Z.con(Z.baja(0)) };
      return {
        vista: [[62, 14], [118, 12]], rastro: 'pel', esfuerzo: [2], clavos: T2,
        posturas: P, inicio: 'a', encuadra: ['a0', 'a'],
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.3, 0.5]),
        pasos: [{ sec: [['a0', 0.6, null, T2], ['p', 0.6, 'entra', T2], ['a', 0.6, 'sale', T2]], desde: 'a0' }, { sec: [['b', 2.0, 'freno']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* la zancada hacia delante: de pie, con los pies juntos, lleva los omóplatos abajo y atrás; da un paso al frente apoyando primero el
       talón y pasa el peso al pie de delante; deja caer la cadera hasta que el muslo de delante queda paralelo al suelo; y empuja con la
       pierna de delante para volver a la posición inicial */
    COREO['zancada-frontal'] = (function () {
      var firme = function (P) { return sobre({ b: aLosLados(12), m: SUELTA, hom: [-2, -1.5] }, P); }, Z = zancadas(9, firme, 6), L = Z_LARGO, P = {};
      P.a0 = SUELTOS(Z.pie(0)); P.a = Z.con(Z.pie(0));
      ['va', 'talon', 'alta', 'baja', 'empuja', 'vuelve'].forEach(function (n) { P[n] = Z.con(Z[n](L)); });
      return {
        vista: [[66, 12], [112, 12]], rastro: 'pel', clavos: T2,
        posturas: P, inicio: 'a0', encuadra: ['a0', 'baja'],
        pasos: [{ sec: [['a0', 0.7, null, T2], ['a', 1.2, 'suave', T2]], desde: 'a0' },
                { sec: [['va', 0.4, 'entra', T2], ['talon', 0.3, 'lineal', T2], ['alta', 0.55, 'sale', T2]], desde: 'a' },
                { sec: [['baja', 1.6, 'freno', T2]], desde: 'alta' },
                { sec: [['empuja', 0.45, 'empuje', T2], ['vuelve', 0.3, 'lineal', T2], ['a', 0.4, 'sale', T2]], desde: 'baja' }]
      };
    })();

    /* con mancuernas: una en cada mano, con los pies separados unos 20 cm y las puntas al frente; da un paso largo al frente, con el tronco
       recto; baja hasta que la rodilla de atrás queda justo por encima del suelo y la de delante, en ángulo recto; aguanta un momento y vuelve */
    COREO['zancada-mancuernas'] = (function () {
      var Z = zancadas(10, conMancuernas), L = Z_LARGO, P = { a: Z.con(Z.pie(0)) };
      ['va', 'talon', 'alta', 'baja', 'empuja', 'vuelve'].forEach(function (n) { P[n] = Z.con(Z[n](L)); });
      return {
        vista: [[66, 12], [112, 12]], rastro: 'pel', clavos: T2, material: [['mancuernas']],
        posturas: P, inicio: 'a', encuadra: ['a', 'baja'],
        pasos: ['a', { sec: [['va', 0.45, 'entra', T2], ['talon', 0.3, 'lineal', T2], ['alta', 0.55, 'sale', T2]], desde: 'a' },
                { sec: [['baja', 1.5, 'freno', T2], ['baja', 0.7, null, T2], ['empuja', 0.5, 'empuje', T2], ['vuelve', 0.3, 'lineal', T2], ['a', 0.4, 'sale', T2]], desde: 'alta' }]
      };
    })();

    /* con barra: la barra, sobre la parte alta de la espalda, con un agarre algo más abierto que los hombros; da un paso largo al frente con
       el tronco recto; baja hasta que la rodilla de atrás queda justo encima del suelo, sin tocarlo, aguanta un momento y vuelve; y repite
       con la otra pierna */
    COREO['zancada-barra'] = (function () {
      var Z = zancadas(10, conBarra), L = Z_LARGO, P = { a: Z.con(Z.pie(0)) }, K = T2.concat(enBarra(0)), N = ['va', 'talon', 'alta', 'baja', 'empuja', 'vuelve'];
      N.forEach(function (n) { P[n] = Z.con(Z[n](L)); P[n + '2'] = refleja(P[n]); });
      var una = function (r) { return [['va' + r, 0.4, 'entra', K], ['talon' + r, 0.3, 'lineal', K], ['alta' + r, 0.5, 'sale', K], ['baja' + r, 1.4, 'freno', K], ['baja' + r, 0.6, null, K],
        ['empuja' + r, 0.5, 'empuje', K], ['vuelve' + r, 0.3, 'lineal', K], ['a', 0.4, 'sale', K], ['a', 0.35, null, K]]; };
      return {
        vista: [[66, 12], [112, 12]], rastro: 'pel', esfuerzo: [5, 14], clavos: K, material: [ESPALDA],
        posturas: P, inicio: 'a', encuadra: ['a', 'baja'],
        rep: una('').concat(una('2')),
        pasos: ['a', { sec: una('').slice(0, 3), desde: 'a' }, { rep: 1.2 }]
      };
    })();

    /* hacia atrás, con mancuernas: una en cada mano, con los pies separados unos 20 cm y las puntas al frente; da un paso atrás despacio
       con una pierna; con el tronco recto, baja hasta que la rodilla de atrás casi toca el suelo, aguanta un momento y vuelve */
    COREO['zancada-atras-mancuernas'] = (function () {
      var Z = zancadas(10, conMancuernas), P = { a: Z.con(Z.pie(0)), p: Z.con(Z.atras(0)), f: Z.con(Z.alta(0)), b: Z.con(Z.baja(0)), s: Z.con(Z.sube(0)) };
      return {
        vista: [[62, 14], [118, 12]], rastro: 'pel', clavos: T2, material: [['mancuernas']],
        posturas: P, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['p', 0.7, 'entra', T2], ['f', 0.8, 'sale', T2]], desde: 'a' },
                { sec: [['b', 1.6, 'freno', T2], ['b', 0.7, null, T2], ['s', 0.6, 'empuje', T2], ['a', 0.6, 'sale', T2]], desde: 'f' }]
      };
    })();

    /* hacia atrás, con barra: saca la barra de un soporte a la altura del pecho y la apoya sobre los hombros, con las manos algo más
       abiertas que ellos (el soporte queda delante: al dar el paso atrás se aleja de sus postes); con los pies separados unos 20 cm y las
       puntas al frente, da un paso atrás despacio; con el tronco recto, baja hasta que la rodilla de atrás casi toca el suelo, aguanta un
       momento y vuelve */
    COREO['zancada-atras-barra'] = (function () {
      var Z = zancadas(10, conBarra), K = T2.concat(enBarra(1));
      var P = { a: Z.con(Z.pie(0)), p: Z.con(Z.atras(0)), f: Z.con(Z.alta(0)), b: Z.con(Z.baja(0)), s: Z.con(Z.sube(0)) };
      P.sop = sobre(P.a, { pel: [0, 82, 0], hom: [0, 0] });
      return {
        vista: [[62, 14], [118, 12]], rastro: 'pel', clavos: K,
        material: [['soporte', { z: -6, alto: 128.5, ancho: 56, haciaAtras: true }], ESPALDA],
        posturas: P, inicio: 'a', encuadra: ['sop', 'a', 'b'],
        pasos: [{ sec: [['sop', 0.8, null, K], ['a', 1.0, 'suave', K]], desde: 'sop' },
                { sec: [['p', 0.7, 'entra', K], ['f', 0.8, 'sale', K]], desde: 'a' },
                { sec: [['b', 1.6, 'freno', K], ['b', 0.7, null, K], ['s', 0.6, 'empuje', K], ['a', 0.6, 'sale', K]], desde: 'f' }]
      };
    })();

    /* ── ANDANDO ── Anda de verdad (como los paseos del bloque 8): dos zancadas hacia delante, se pone de pie, da media vuelta y vuelve con
       otras dos. La vuelta son las mismas posturas, giradas 180° alrededor del centro del tramo (enMarco); cada media vuelta, tres giros
       de 60° con los pies planos. juntando: entre zancada y zancada se pone de pie con los pies juntos; si no, la pierna de atrás pasa
       derecha hacia delante sin pararse */
    function enMarco(P, r) {
      var B = giroY(r), R = {}, k;
      var pto = function (a) { var q = aplicar(B, [a[0], 0, a[2]]); return [q[0], a[1], q[2]]; }, vec = function (a) { return aplicar(B, a); };
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
    function andando(x, carga, juntando) {
      var Z = zancadas(x), L = Z_LARGO, I = {}, P = {}, n;
      I.e0 = Z.pie(-L);
      I.v1 = Z.va(0); I.t1 = Z.talon(0); I.f1 = Z.alta(0); I.b1 = Z.baja(0); I.u1 = Z.alza(0);
      if (juntando) { I.e1 = Z.pie(0); I.v2 = refleja(Z.va(L)); } else I.w1 = Z.pasa(0);
      I.t2 = refleja(Z.talon(L)); I.f2 = refleja(Z.alta(L)); I.b2 = refleja(Z.baja(L)); I.u2 = refleja(Z.alza(L)); I.e2 = Z.pie(L);
      for (n in I) { P[n] = carga(I[n]); P[n + 'r'] = carga(enMarco(I[n], 180)); }
      var ye = I.e0.pel[1] - 0.3;
      [['g', 0, L], ['h', 180, -L]].forEach(function (q) {
        [60, 120].forEach(function (g, i) {
          var t = (q[1] + g) * RAD, c = Math.cos(t), sn = Math.sin(t);
          P[q[0] + (i + 1)] = carga({ pel: [0, ye, q[2]], giro: [q[1] + g, 0, 0], pi: { suelo: [x * c, q[2] - x * sn], abre: 2 }, pd: { suelo: [-x * c, q[2] + x * sn], abre: 2 } });
        });
      });
      var T = function (m, sg, c) { return [m, sg, c, T2]; };
      var pasada = function (r) {
        var l = [T('v1' + r, 0.35, 'entra'), T('t1' + r, 0.25, 'lineal'), T('f1' + r, 0.25, 'sale'), T('b1' + r, 1.0, 'freno'), T('b1' + r, 0.45)];
        if (juntando) l.push(T('u1' + r, 0.5, 'empuje'), T('e1' + r, 0.5, 'sale'), T('e1' + r, 0.25), T('v2' + r, 0.35, 'entra'), T('t2' + r, 0.25, 'lineal'));
        else l.push(T('u1' + r, 0.45, 'empuje'), T('w1' + r, 0.4, 'lineal'), T('t2' + r, 0.3, 'lineal'));
        l.push(T('f2' + r, 0.25, 'sale'), T('b2' + r, 1.0, 'freno'), T('b2' + r, 0.45), T('u2' + r, 0.5, 'empuje'), T('e2' + r, 0.5, 'sale'), T('e2' + r, 0.2));
        return l;
      };
      var media = function (pre, llega) { return [T(pre + '1', 0.5, 'entra'), T(pre + '2', 0.3, 'lineal'), T(llega, 0.5, 'sale'), T(llega, 0.25)]; };
      var ida = pasada('');
      /* cuánto lleva la repetición al acabar el tramo que llega a «m» por vez primera */
      var hasta = function (m) { var t = 0, i; for (i = 0; i < ida.length; i++) { t += ida[i][1]; if (ida[i][0] === m) break; } return t; };
      return { P: P, ida: ida, rep: ida.concat(media('g', 'e0r'), pasada('r'), media('h', 'e0')), hasta: hasta };
    }

    /* la zancada caminando: de pie, con los pies a la anchura de los hombros, da un paso largo al frente y baja hasta que el muslo de
       delante queda paralelo al suelo; una pausa y, sin mover la pierna de delante, lleva la de atrás hacia delante apoyando talón y punta;
       baja en la siguiente zancada y sigue alternando las piernas sin parar */
    COREO['zancada-caminando'] = (function () {
      var W = andando(17, SUELTOS, false);
      return {
        vista: [[76, 12], [118, 14]], rastro: 'pel', clavos: T2,
        posturas: W.P, inicio: 'e0', encuadra: ['e0', 'e2', 'b1', 'b2'],
        rep: W.rep,
        pasos: [{ sec: [['e0', 0.5, null, T2]].concat(W.ida.slice(0, 4)), desde: 'e0' },
                { sec: [['b1', 0.7, null, T2]].concat(W.ida.slice(5, 9)), desde: 'b1' },
                { rep: W.hasta('f2') }]
      };
    })();

    /* caminando, con mancuernas: una en cada mano, de pie con los pies a la anchura de los hombros; da un paso largo, hasta que la rodilla de
       delante forma más o menos un ángulo recto y la de atrás queda cerca del suelo, sin tocarlo; completa el paso poniéndose de pie (junta
       el pie de atrás al de delante) y sigue con la otra pierna */
    COREO['zancada-caminando-mancuernas'] = (function () {
      var W = andando(17, conMancuernas, true);
      return {
        vista: [[76, 12], [118, 14]], rastro: 'pel', clavos: T2, material: [['mancuernas']],
        posturas: W.P, inicio: 'e0', encuadra: ['e0', 'e2', 'b1', 'b2'],
        rep: W.rep,
        pasos: ['e0', { sec: W.ida.slice(0, 4), desde: 'e0' }, { rep: W.hasta('b1') }]
      };
    })();

    /* la zancada cruzada: de pie, con los pies bien separados; cruza una pierna por detrás de la otra (el pie viaja por el aire y se posa
       en su parte delantera, detrás y por fuera del otro) y baja, con la rodilla de delante sobre el talón (la espinilla, a plomo); empuja
       para volver a la posición abierta y alterna las piernas */
    COREO['zancada-cruzada'] = (function () {
      var X = 26, pies = { suelo: [X, 0], abre: 6 }, a = SUELTOS({ pel: [0, altoCon(X - D.caderaX), 0], p: pies });
      var del = { suelo: [X, 0], abre: 6, polo: [0.1, 0.1, 1] };
      var m = SUELTOS({ pel: [6, 71, -17], giro: [0, 4, 0], pi: del, pd: { a: [6, 23, -38], polo: [0.2, -0.6, 1] }, td: PUNTA_ABAJO });
      var c = SUELTOS({ pel: [12, 48, -37], giro: [0, 8, 0], cab: [-6, 0, 0], pi: del, pd: { suelo: [X + 12, -66], abre: 0, talon: 62, polo: [0.3, -1, 0.5] } });
      var una = function (r) { return [['m' + r, 0.5, 'entra', T2], ['c' + r, 0.9, 'sale', T2], ['c' + r, 0.45, null, T2], ['m' + r, 0.55, 'empuje', T2], ['a', 0.5, 'sale', T2], ['a', 0.3, null, T2]]; };
      return {
        vista: [[38, 14], [104, 12]], rastro: 'pel', esfuerzo: [3, 9], clavos: T2,
        posturas: { a: a, m: m, c: c, m2: refleja(m), c2: refleja(c) }, inicio: 'a', encuadra: ['a', 'c', 'c2'],
        rep: una('').concat(una('2')),
        pasos: ['a', { sec: una('').slice(0, 2), desde: 'a' }, { rep: 1.4 }]
      };
    })();

    /* ── DE LADO ── El pie que da el paso (el derecho) va 64 cm hacia su lado, por el aire, y se posa paralelo al otro, con la punta al
       frente. Abajo, la cadera va atrás y hacia ese pie: su espinilla queda a plomo vista de frente (se busca hacia dónde tiene que ir la
       rodilla), con la rodilla adelantada sobre el pie; la otra pierna, casi recta, y los dos pies, planos */
    function lateral(carga, abajo) {
      var R = 74, izq = { suelo: [10, 0], abre: 0 }, der = function (px) { return { suelo: [-R, 0], abre: 0, polo: [px, 0.1, 1] }; }, P = {};
      P.a = carga({ pel: [0, PIE - 0.2, 0], pi: izq, pd: { suelo: [-10, 0], abre: 0 } });
      P.l = carga({ pel: [-8, 84.3, 0], pi: izq, pd: { a: [-42, 16, 2], polo: [-0.2, 0.1, 1] }, td: alAire(0) });
      P.w = carga({ pel: [-32, 78.4, 0], pi: izq, pd: der(-0.2) });
      P.h = carga({ pel: [-46, 68, -12], giro: [0, 18, 0], cab: [-14, 0, 0], pi: sobre(izq, { polo: [0.3, 0.3, 1] }), pd: der(-0.3) });
      var B = function (px) { return { pel: [-60, 51, -24], giro: [0, abajo || 38, 0], col: [3, 0, 0], cab: [-(abajo || 38) * 0.8, 0, 0], pi: sobre(izq, { polo: [0.3, 0.3, 1] }), pd: der(px) }; };
      P.b = B(busca(function (q) { return resolver(B(q)).d.rod[0]; }, -R, -0.9, 0.3));
      return P;
    }

    /* la zancada lateral: de pie, con los pies paralelos a la anchura de la cadera; da un paso a la derecha con los dos pies mirando al
       frente y, ya apoyado, lleva la cadera atrás pasando el peso al pie derecho; baja hasta que la espinilla derecha queda vertical y la
       rodilla sobre el pie, con la pierna izquierda casi recta y los talones en el suelo; empuja con la pierna derecha para volver, y repite
       hacia el otro lado */
    COREO['zancada-lateral'] = (function () {
      var P = lateral(SUELTOS);
      P.b = SUELTOS(P.b);
      ['l', 'w', 'h', 'b'].forEach(function (q) { P[q + '2'] = refleja(P[q]); });
      var una = function (r) { return [['l' + r, 0.4, 'entra', T2], ['w' + r, 0.4, 'sale', T2], ['h' + r, 0.6, 'suave', T2], ['b' + r, 1.2, 'freno', T2], ['b' + r, 0.4, null, T2],
        ['h' + r, 0.6, 'empuje', T2], ['l' + r, 0.45, 'lineal', T2], ['a', 0.4, 'sale', T2], ['a', 0.3, null, T2]]; };
      return {
        vista: [[24, 14], [-62, 12]], rastro: 'pel', esfuerzo: [5, 14], clavos: T2,
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: una('').concat(una('2')),
        pasos: ['a', { sec: una('').slice(0, 3), desde: 'a' }, { sec: [['b', 1.4, 'freno', T2]], desde: 'h' }, { rep: 2.6 }]
      };
    })();

    /* lateral, con mancuernas: una en cada mano, con las palmas enfrentadas y los pies a la anchura de la cadera; da un paso a la derecha
       con el pie mirando al frente, paralelo al otro; lleva la cadera derecha atrás y baja las manos a los dos lados de la pierna derecha
       (una mancuerna por fuera de la espinilla y la otra por dentro); y empuja el suelo con el pie derecho para volver al centro */
    COREO['zancada-lateral-mancuernas'] = (function () {
      var P = lateral(conMancuernas, 44), E = resolver(sobre(P.b, { m: NEUTRA })), tob = E.d.tob;
      var a = function (k, x) { var h = E[k].hom, q = [tob[0] + x, 28, tob[2] + 9], u = unidad(menos(q, h)); return { a: mas(h, por(u, Math.min(BRAZO - 0.4, largo(menos(q, h))) - D.mano)), polo: [x < 0 ? -1 : 1, 0.3, -0.5] }; };
      P.b = sobre(P.b, { m: NEUTRA, bd: a('d', -14), bi: a('i', 13.5) });
      return {
        vista: [[24, 14], [-62, 12]], rastro: 'pel', clavos: T2, material: [['mancuernas']],
        posturas: P, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['l', 0.45, 'entra', T2], ['w', 0.45, 'sale', T2]], desde: 'a' }, { sec: [['h', 0.7, 'suave', T2], ['b', 1.3, 'freno', T2]], desde: 'w' },
                { sec: [['h', 0.7, 'empuje', T2], ['l', 0.45, 'lineal', T2], ['a', 0.45, 'sale', T2]], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ LOS SALTOS ══════════════════════════════
       En el aire no hay nada clavado. Se despega por las puntas (el pie rueda antes sobre su parte delantera) y se cae primero sobre la
       parte delantera del pie. Los brazos, como al correr: delante, el contrario a la pierna adelantada (corre(f): de atrás, f = −1, a
       delante, f = 1, con el codo siempre doblado; como en el bloque 9) */
    function corre(f) {
      var t = (2.5 + 37.5 * f) * RAD, c = t + (75 + 15 * f) * RAD, x = 19 - 5 * f;
      return { a: [x + 2, D.hombroY - D.brazo * Math.cos(t) - D.antebrazo * Math.cos(c), D.brazo * Math.sin(t) + D.antebrazo * Math.sin(c)], en: 'torax', polo: [0.3, -0.2, -1] };
    }
    function corriendo(i, d) { return { bi: corre(i), bd: reflejo(corre(d)), m: SUELTA }; }

    /* la zancada hacia atrás con salto: con los pies a la anchura de la cadera, lleva la pierna derecha atrás y toca el suelo con la parte
       delantera del pie, adelantando el brazo derecho; se impulsa hacia arriba con un salto, subiendo la rodilla derecha al frente y
       estirando el brazo izquierdo por encima de la cabeza; y, para hacerlo más difícil, baja a una zancada completa antes de saltar */
    COREO['zancada-atras-salto'] = (function () {
      var X = 10, q = deTalon(46), q2 = deTalon(20), apoyo = function (t) { return { suelo: [X, 0], abre: 3, talon: t || 0, polo: [0.1, 0.1, 1] }; };
      /* el brazo izquierdo sube por partes (a medio impulso ya va por delante, a la altura del hombro): de un tirón, la mano daría un salto */
      var arriba = function (e, d) { return { bi: { e: e, z: 0, g: 0, c: 8 }, bd: reflejo(corre(d)), m: SUELTA }; };
      var P = {};
      P.a = SUELTOS({ pel: [0, PIE - 0.2, 0], pi: apoyo(), pd: reflejo(apoyo()) });
      P.p = sobre(corriendo(-0.3, 0.4), { pel: [0, 80, -10], giro: [0, 4, 0], pi: apoyo(), pd: { a: [-X, 20, -30], polo: [0, -0.3, 1] }, td: PUNTA_ABAJO });
      /* toca atrás con la parte delantera del pie (t); y la zancada completa (b) */
      P.t = sobre(corriendo(-0.8, 1), { pel: [0, 72, -22], giro: [0, 8, 0], cab: [-6, 0, 0], pi: apoyo(), pd: { suelo: [-X, -58], abre: 2, talon: 55, polo: [0, -1, 0.4] } });
      P.b = sobre(corriendo(-0.9, 1), { pel: [0, 47, -36], giro: [0, 7, 0], cab: [-5, 0, 0], pi: apoyo(), pd: { suelo: [-X, -70], abre: 2, talon: 62, polo: [0, -1, 0.4] } });
      /* el impulso: la pierna de apoyo se estira y su pie rueda (m), hasta quedar de puntillas (d), con la rodilla derecha ya arriba */
      P.m = sobre(arriba(78, 0.55), { pel: [0, 82, -5], giro: [0, 5, 0], pi: apoyo(22), pd: { e: 36, z: 0, c: 92 }, td: { tob: 16 } });
      P.d = sobre(arriba(138, -0.25), { pel: [0, PIE + q[1] - 0.6, q[0]], pi: apoyo(46), pd: { e: 84, z: 0, c: 96 }, td: { tob: 10 } });
      P.s = sobre(arriba(172, -0.9), { pel: [0, PIE + 17, q[0] + 1], pi: { e: 2, z: 0, c: 5 }, ti: { tob: 44 }, pd: { e: 88, z: 0, c: 100 }, td: { tob: 10 } });
      /* desde la zancada completa: antes de impulsarse, el pie de atrás deja el suelo (n) */
      P.n = sobre(corriendo(-0.2, 0.5), { pel: [0, 66, -19], giro: [0, 8, 0], pi: apoyo(), pd: { a: [-X, 26, -44], polo: [0, -0.6, 1] }, td: PUNTA_ABAJO });
      P.c = sobre(corriendo(0.5, -0.4), { pel: [0, PIE + q2[1] - 3.5, q2[0] - 2], giro: [0, 5, 0], pi: apoyo(20), pd: { e: 46, z: 0, c: 72 }, td: { tob: 10 } });
      P.l = sobre(corriendo(-0.5, 0.7), { pel: [0, 77, -9], giro: [0, 7, 0], pi: apoyo(), pd: { a: [-X, 19, -30], polo: [0, -0.4, 1] }, td: PUNTA_ABAJO });
      var KI = ['ti'], salto = [['m', 0.18, 'entra', KI], ['d', 0.1, 'lineal', KI], ['s', 0.24, 'sale', NADA], ['c', 0.24, 'entra', NADA], ['l', 0.2, 'sale', KI]];
      return {
        vista: [[64, 12], [112, 12]], rastro: 'pel', esfuerzo: [0, 1], zoom: 0.94,
        posturas: P, inicio: 't', encuadra: ['a', 's', 'b'],
        rep: salto.concat([['t', 0.45, 'suave', T2], ['t', 0.4, null, T2]]),
        pasos: [{ sec: [['a', 0.5, null, T2], ['p', 0.45, 'entra', T2], ['t', 0.55, 'sale', T2]], desde: 'a' }, 'rep',
                { sec: [['b', 0.9, 'freno', T2], ['b', 0.35, null, T2], ['n', 0.2, 'entra', T2], ['m', 0.16, 'lineal', KI]].concat(salto.slice(1), [['b', 0.9, 'freno', T2]]), desde: 't' }]
      };
    })();

    /* la zancada con salto alterno: con una pierna delante y otra detrás y el tronco algo inclinado desde la cadera; baja rápido y salta
       empujando el suelo con los dos pies, estirando tobillos, rodillas y cadera; en el aire cambia de pierna y mueve los brazos al revés
       que las piernas; y cae suave sobre la mitad del pie, llevando la cadera atrás y abajo para amortiguar, sin bloquear las rodillas */
    COREO['zancada-salto'] = (function () {
      var X = 12, L = Z_LARGO, del = function (t) { return { suelo: [X, 0], abre: 2, talon: t || 0, polo: [0.1, 0.1, 1] }; }, det = function (t) { return { suelo: [-X, -L], abre: 2, talon: t, polo: [0, -1, 0.4] }; };
      var P = {};
      P.e = sobre(corriendo(-0.7, 0.8), { pel: [0, 74, -31], giro: [0, 14, 0], cab: [-11, 0, 0], pi: del(), pd: det(34) });
      P.b = sobre(corriendo(-1, 1), { pel: [0, 53, -34], giro: [0, 17, 0], cab: [-13, 0, 0], pi: del(), pd: det(58) });
      P.m = sobre(corriendo(-0.4, 0.4), { pel: [0, 73, -30], giro: [0, 11, 0], cab: [-8, 0, 0], pi: del(25), pd: det(64) });
      P.d = sobre(corriendo(0, 0), { pel: [0, 84, -22], giro: [0, 6, 0], cab: [-4, 0, 0], pi: del(50), pd: det(70) });
      /* en el aire: aún con la izquierda delante (s), las piernas, a medio cambiar (x) y ya con la derecha delante (s2, el reflejo de s) */
      P.s = sobre(corriendo(0.3, -0.3), { pel: [0, 95, -22], giro: [0, 6, 0], cab: [-4, 0, 0], pi: { e: 20, z: 0, c: 12 }, ti: { tob: 18 }, pd: { e: -20, z: 0, c: 22 }, td: { tob: 40 } });
      P.x = sobre(corriendo(0, 0), { pel: [0, 100, -22], giro: [0, 6, 0], cab: [-4, 0, 0], pi: { e: 2, z: 0, c: 16 }, ti: { tob: 36 }, pd: { e: 2, z: 0, c: 16 }, td: { tob: 36 } });
      /* al tocar: el pie de delante, casi plano (cae sobre su mitad); el de atrás, en su parte delantera */
      P.k = sobre(corriendo(-0.8, 0.8), { pel: [0, 77, -29], giro: [0, 11, 0], cab: [-8, 0, 0], pi: del(10), pd: det(50) });
      ['e', 'b', 'm', 'd', 's', 'k'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var salto = function (r, o) {
        return [['m' + r, 0.13, 'entra', T2], ['d' + r, 0.08, 'lineal', T2], ['s' + r, 0.12, 'sale', NADA], ['x', 0.13, 'lineal', NADA], ['s' + o, 0.13, 'lineal', NADA], ['k' + o, 0.11, 'entra', NADA],
                ['b' + o, 0.3, 'sale', T2], ['b' + o, 0.12, null, T2]];
      };
      return {
        vista: [[66, 12], [114, 12]], rastro: 'pel', esfuerzo: [0, 1, 8, 9], zoom: 0.94,
        posturas: P, inicio: 'b', encuadra: ['e', 'x'],
        rep: salto('', '2').concat(salto('2', '')),
        pasos: ['e', 'rep', { rep: 0.21 }, { rep: 0.59 }]
      };
    })();

    /* el salto lateral con aterrizaje a un pie: de pie, con los pies juntos; salta hacia la derecha balanceando los brazos hacia delante y
       aterriza sobre el pie derecho; junta el pie izquierdo al derecho y repite el salto. Para repetirlo sin salirse, da media vuelta donde
       ha caído y salta otra vez hacia su derecha (las mismas posturas, giradas) */
    COREO['salto-lateral-un-pie'] = (function () {
      var XS = 33, S = 6, I = {}, P = {}, n, ya = altoCon(D.caderaX - S) - 0.2;
      var izq = function (t) { return { suelo: [XS + S, 0], abre: 3, talon: t || 0, polo: [0.15, 0.1, 1] }; }, der = function (x, t) { return { suelo: [x - S, 0], abre: 3, talon: t || 0, polo: [-0.15, 0.1, 1] }; };
      var atras = { b: { e: 32, z: 178, g: 0, c: 8 }, m: SUELTA }, delante = function (e) { return { b: { e: e, z: 6, g: 0, c: 18 }, m: SUELTA }; };
      I.a = SUELTOS({ pel: [XS, ya, 0], pi: izq(), pd: der(XS) });
      I.b = sobre(atras, { pel: [XS - 2, 70, -13], giro: [0, 24, 0], cab: [-19, 0, 0], pi: izq(), pd: der(XS) });
      /* de lado, la cadera va a paso constante (V) desde el impulso hasta que el pie pisa: lo que recorre en cada tramo es lo que dura el
         tramo, el impulso acaba a esa velocidad y la caída empieza casi a ella. Si en el aire frenara y volviera a acelerar, el tupé, que va
         un instante detrás de la cabeza, daría un latigazo (medido: 11,3° con los tramos «sale» y «entra» de un salto en el sitio) */
      var XC = -XS + 6.4, V = (XS - 2 - XC) / 0.595, XM = XS - 2 - 0.075 * V, XD = XM - 0.12 * V, XV = XD - 0.2 * V;
      I.m = sobre(delante(12), { pel: [XM, 78, -5], giro: [0, 14, 0], cab: [-11, 0, 0], pi: izq(26), pd: { a: [XM - 11, 15, 3], polo: [-0.2, 0.1, 1] }, td: alAire(-3) });
      I.d = sobre(delante(64), { pel: [XD, 84, 1], giro: [0, 6, 0], cab: [-4, 0, 0], pi: izq(50), pd: { a: [XD - 27, 24, 4], polo: [-0.3, 0.1, 1] }, td: alAire(-3) });
      I.v = sobre(delante(84), { pel: [XV, 92, 1], giro: [0, 6, 0], cab: [-4, 0, 0], pi: { a: [XV + 22, 30, -6], polo: [0.2, 0.1, 1] }, ti: alAire(3, 0.5), pd: { a: [XV - 23, 25, 4], polo: [-0.2, 0.1, 1] }, td: alAire(-3, 0.3) });
      I.c = sobre(delante(60), { pel: [XC, 82, -2], giro: [0, 10, 0], cab: [-8, 0, 0], pd: der(-XS, 20), pi: { a: [XC + 22, 27, -8], polo: [0.2, 0.1, 1] }, ti: alAire(3, 0.4) });
      I.l = sobre(delante(34), { pel: [XC - 0.1 * V, 68, -13], giro: [0, 24, 0], cab: [-19, 0, 0], pd: der(-XS), pi: { a: [XC + 9, 17, -10], polo: [0.2, 0.1, 1] }, ti: alAire(3, 0.3) });
      I.j = SUELTOS({ pel: [-XS, ya, 0], pi: { suelo: [-XS + S, 0], abre: 3 }, pd: der(-XS) });
      for (n in I) { P[n] = I[n]; P[n + 'r'] = enMarco(I[n], 180); }
      /* las dos medias vueltas, en tres giros de 60° con los pies planos: donde cae (de 0 a 180) y donde empezó (de 180 a 360) */
      [['g', 0, -XS], ['h', 180, XS]].forEach(function (q) {
        [60, 120].forEach(function (g, i) {
          var t = (q[1] + g) * RAD, c = Math.cos(t), sn = Math.sin(t);
          P[q[0] + (i + 1)] = SUELTOS({ pel: [q[2], ya - 0.3, 0], giro: [q[1] + g, 0, 0], pi: { suelo: [q[2] + S * c, -S * sn], abre: 3 }, pd: { suelo: [q[2] - S * c, S * sn], abre: 3 } });
        });
      });
      var salto = function (r, ki, kd) {
        return [['b' + r, 0.45, 'suave', T2], ['b' + r, 0.1, null, T2], ['m' + r, 0.15, 'entra', ki], ['d' + r, 0.12, 'lineal', ki], ['v' + r, 0.2, 'lineal', NADA], ['c' + r, 0.2, 'lineal', NADA], ['l' + r, 0.26, 'sale', kd],
                ['j' + r, 0.6, 'suave', T2], ['j' + r, 0.3, null, T2]];
      };
      var media = function (pre, llega) { return [[pre + '1', 0.5, 'entra', T2], [pre + '2', 0.3, 'lineal', T2], [llega, 0.5, 'sale', T2], [llega, 0.25, null, T2]]; };
      return {
        vista: [[18, 14], [-64, 12]], rastro: 'pel', esfuerzo: [2, 3, 15, 16], zoom: 0.96,
        posturas: P, inicio: 'a', encuadra: ['a', 'j', 'v'],
        rep: salto('', ['ti'], ['td']).concat(media('g', 'ar'), salto('r', ['ti'], ['td']), media('h', 'a')),
        pasos: ['a', 'rep', { rep: 1.48 }]
      };
    })();

    /* ══════════════════════════════ LA BÚLGARA ══════════════════════════════
       Como la del bloque 1: el empeine del pie de atrás, sobre un banco atravesado (44 cm: «a la altura de la rodilla», «de 30 a 45 cm»), y
       el de delante, en el suelo, 62 cm por delante de su borde. El pie sube al banco por el aire: recogido ante el canto (m1), por encima
       de la tapa (m2) y posado. Con el pie derecho atrás; el otro lado, reflejado */
    var PIE_BANCO = { punta: [0, -0.3, -0.95], arriba: [0, -0.95, 0.3] }, PIE_SUBE = { punta: [0, -0.8, -0.6], arriba: [0, -0.6, 0.8] };
    function bulgara(carga) {
      var del = { suelo: [10, 0], abre: 4, polo: [0, 0.1, 1] }, enBanco = { a: [-10, 50, -66], polo: [0, -1, 0.25] }, P = {};
      P.a0 = carga({ pel: [0, PIE - 0.2, 0], pi: { suelo: [10, 0], abre: 4 }, pd: { suelo: [-10, 0], abre: 4 } });
      P.m1 = carga({ pel: [1.5, PIE - 1.5, -6], giro: [0, 3, 0], pi: del, pd: { a: [-10, 48, -36], polo: [0, -0.5, 1] }, td: PIE_SUBE });
      P.m2 = carga({ pel: [1, 82, -18], giro: [0, 6, 0], pi: del, pd: { a: [-10, 63, -60], polo: [0, -0.9, 0.6] }, td: PIE_BANCO });
      P.a = carga({ pel: [0, 80, -26], giro: [0, 8, 0], pi: del, pd: enBanco, td: PIE_BANCO });
      P.b = carga({ pel: [0, 50, -30], giro: [0, 14, 0], cab: [-10, 0, 0], pi: del, pd: enBanco, td: PIE_BANCO });
      return P;
    }

    /* con barra: un banco detrás y la barra sobre los hombros; pone un pie sobre el banco, con el otro bien apoyado en el suelo, 62 cm por
       delante; baja despacio doblando la rodilla y la cadera de delante hasta donde puede controlar; una pausa, sube despacio y cambia de
       pierna (posa el pie en el suelo y sube el otro al banco) */
    COREO['sentadilla-bulgara-barra'] = (function () {
      var P = bulgara(conBarra), K = T2.concat(enBarra(1));
      ['m1', 'm2', 'a'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var T = function (n, sg, c) { return [n, sg, c, K]; };
      return {
        vista: [[68, 14], [116, 12]], rastro: 'pel', clavos: K,
        material: [['banco', { rumbo: 90, en: [0, -76], largo: 110 }], ESPALDA],
        posturas: P, inicio: 'a0', encuadra: ['a0', 'b'],
        pasos: ['a0', { sec: [T('m1', 0.6, 'entra'), T('m2', 0.5, 'lineal'), T('a', 0.6, 'sale')], desde: 'a0' }, { sec: [T('b', 2.0, 'freno')], desde: 'a' },
                { sec: [T('b', 0.45), T('a', 1.4, 'suave'), T('m2', 0.35, 'entra'), T('m1', 0.3, 'lineal'), T('a0', 0.4, 'sale'), T('m12', 0.4, 'entra'), T('m22', 0.35, 'lineal'), T('a2', 0.4, 'sale')], desde: 'b' }]
      };
    })();

    /* con mancuerna: el pie derecho, delante, y el empeine del izquierdo, apoyado detrás en un banco a la altura de la rodilla; una
       mancuerna, en vertical delante del pecho, sujeta con las dos manos y con los codos pegados a las costillas; con la espalda recta, baja
       la rodilla izquierda hacia el suelo; y, antes de que lo toque, empuja con el pie derecho para subir */
    COREO['sentadilla-bulgara-mancuerna'] = (function () {
      var copa = { b: { a: [6, 14, 17], en: 'torax', polo: [0.3, -1, 0.05] }, m: PUNO }, Q = bulgara(function (P) { return sobre(P, copa); });
      var a = refleja(Q.a), b = refleja(Q.b);
      return {
        vista: [[-68, 14], [-116, 12]], rastro: 'pel', esfuerzo: [2], clavos: T2,
        material: [['banco', { rumbo: 90, en: [0, -76], largo: 110 }], ['mancuernas', { lado: 'i', dos: true, ejeDos: [0, 1, 0] }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [1.8, 0.3, 1.3, 0.5]),
        pasos: ['a', 'a', { sec: [['b', 1.9, 'freno']], desde: 'a' }, { rep: 1.8 }]
      };
    })();

    /* ══════════════════════════════ EL ESCALÓN, DE LADO ══════════════════════════════ */
    /* la subida lateral: de lado junto a un escalón (20 cm; a su izquierda), con el pie izquierdo encima y el derecho en el suelo, un poco
       por detrás; con los brazos doblados a 90 grados, sube empujando con la pierna de arriba (el pie del suelo se despega sin impulsar y
       queda colgando junto al escalón, a su altura); y baja despacio */
    COREO['subida-lateral-escalon'] = (function () {
      var H = 20, arriba = { suelo: [24, 2], abre: 4, alto: H, polo: [0.3, 0.1, 1] }, abajo = { suelo: [-4, -8], abre: 4 };
      var doblados = { b: aLosLados(90), m: PUNO }, cd;
      var a0 = SUELTOS({ pel: [4, 85.4, -3], pi: arriba, pd: abajo }), a = sobre(a0, doblados);
      var B = { pel: [14, altoCon(0) + H - 0.2, 1], pi: arriba };
      cd = resolver(B).d.cad;
      var b = sobre(doblados, sobre(B, { pd: { a: [cd[0] - 1, cd[1] - 77.4, cd[2] - 6], polo: [-0.1, 0.1, 1] }, td: alAire(-4, 0.1) }));
      return {
        vista: [[22, 14], [-58, 12]], rastro: 'pel', esfuerzo: [0], clavos: T2,
        material: [['escalon', { med: [50, H, 44], en: [37, 2] }]],
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 0.8, 'suave'], ['a', 0.2], ['b', 1.3, 'empuje']], desde: 'a0' }, { rep: 1.3 }]
      };
    })();

    /* ══════════════════════════════ EL PESO MUERTO SUMO ══════════════════════════════ */
    /* ABRIR LOS PIES (como en el bloque 9). De pie, de un apoyo (de: [x, abre]) a otro más abierto (a: [x, abre]): primero el pie izquierdo y
       después el derecho, cada uno por el aire y girando ya hacia donde va a apuntar, con el peso en el otro. Añade las posturas (pre0 a
       pre3; «fin» la pone quien llama) y devuelve los tramos, con los dos tobillos clavados a su camino */
    function abrirPies(posturas, pre, base, de, a, fin, seg) {
      var pie = function (q, polo) { return { suelo: [q[0], 0], abre: q[1], polo: polo }; }, m = [(de[0] + a[0]) / 2, (de[1] + a[1]) / 2], d = (seg || 2.2) / 4;
      var y0 = Math.min(PIE, altoCon(de[0] - D.caderaX)), y1 = altoCon(a[0] - D.caderaX + 2);
      posturas[pre + '0'] = sobre(base, { pel: [0, y0, 0], p: pie(de) });
      posturas[pre + '1'] = sobre(base, { pel: [-3.5, y0 - 0.8, 0], pi: { a: [m[0], D.tobillo + 5, 1], polo: [0.2, 0.1, 1] }, ti: alAire(m[1]), pd: reflejo(pie(de)) });
      posturas[pre + '2'] = sobre(base, { pel: [(a[0] - de[0]) / 2, y1, 0], pi: pie(a), pd: reflejo(pie(de)) });
      posturas[pre + '3'] = sobre(base, { pel: [(a[0] - de[0]) / 2 + 3.5, y1 - 0.8, 0], pi: pie(a), pd: { a: [-m[0], D.tobillo + 5, 1], polo: [-0.2, 0.1, 1] }, td: alAire(-m[1]) });
      return [[pre + '1', d, 'entra', T2], [pre + '2', d, 'sale', T2], [pre + '3', d, 'entra', T2], [fin, d, 'sale', T2]];
    }

    /* con la barra cargada en el suelo, se acerca (un paso) hasta que cruza la mitad de los pies y separa mucho los pies, cerca de los
       discos, con las puntas hacia fuera; dobla la cadera para agarrarla con los brazos por dentro de las piernas, justo debajo de los
       hombros (se busca cuánto se agacha para llegar con los brazos estirados); y la levanta estirando cadera y rodillas hasta quedar de
       pie. La barra sube y baja a plomo, pegada a las piernas */
    COREO['peso-muerto-sumo'] = (function () {
      var DE = [10, 5], A = [44, 40], ZB = 10, RD = 21, G = 19, pies = { suelo: [A[0], 0], abre: A[1], polo: [0.8, 0.1, 0.72] }, P = {}, sueltos = { b: aLosLados(10), m: SUELTA };
      var MANO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.3, -1] };
      /* se acerca: estaba un paso (28 cm) por detrás */
      var cerca = function (z) { return { suelo: [DE[0], z], abre: DE[1] }; }, AT = -28;
      P.s0 = sobre(sueltos, { pel: [0, PIE - 0.2, AT], pi: cerca(AT), pd: reflejo(cerca(AT)) });
      P.w1 = sobre(sueltos, { pel: [-2.5, PIE - 0.8, AT + 5], pi: { a: [DE[0], D.tobillo + 5, AT / 2], polo: [0.1, 0.1, 1] }, ti: alAire(5), pd: reflejo(cerca(AT)) });
      P.w2 = sobre(sueltos, { pel: [0, altoCon(14) - 0.3, AT / 2], pi: cerca(0), pd: reflejo(cerca(AT)) });
      P.w3 = sobre(sueltos, { pel: [2.5, PIE - 0.8, -5], pi: cerca(0), pd: { a: [-DE[0], D.tobillo + 5, AT / 2], polo: [-0.1, 0.1, 1] }, td: alAire(-5) });
      P.s = sobre(sueltos, { pel: [0, altoCon(A[0] - D.caderaX), 0], p: pies });
      var abre = abrirPies(P, 'o', sueltos, DE, A, 's', 1.9);
      /* a cogerla: la cadera baja y va atrás, y el tronco se inclina hasta que los hombros quedan sobre la barra */
      var Pg = function (x) { return { pel: [0, 78 - x, -0.62 * x], giro: [0, 14 + 1.15 * x, 0], cab: [-(10 + 0.9 * x), 0, 0], p: pies, m: MANO }; };
      var xg = busca(function (q) { return largo(menos(resolver(Pg(q)).i.hom, [G, RD, ZB])); }, BRAZO - 0.5, 8, 45);
      P.g = conAgarre(Pg(xg), [G, RD, ZB], [1, 0.2, -0.6]);
      /* de pie, con la barra colgando de los brazos estirados, por delante de los muslos */
      var arr = { pel: [0, altoCon(A[0] - D.caderaX), 0], hom: [0, -1.6], p: pies, m: MANO }, h = resolver(arr).i.hom;
      P.b = conAgarre(arr, [G, h[1] - BRAZO + 0.5, 12], [1, 0.2, -0.6]);
      return {
        vista: [[38, 14], [88, 12]], rastro: 'manos', esfuerzo: [0], clavos: T2, reposo: ['s0', 'w1', 'w2', 'w3', 'o0', 'o1', 'o2', 'o3', 's'],
        material: [['barra', { reposo: [0, RD, ZB] }]],
        posturas: P, inicio: 'g', encuadra: ['s0', 'g', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.6], ['g', 2.0, 'freno'], ['g', 0.5]],
        pasos: [{ sec: [['s0', 0.5, null, T2], ['w1', 0.3, 'entra', T2], ['w2', 0.3, 'sale', T2], ['w3', 0.3, 'entra', T2], ['o0', 0.3, 'sale', T2], ['o0', 0.2, null, T2]].concat(abre), desde: 's0' },
                { sec: [['g', 1.7, 'suave', T2]], desde: 's' }, 'rep']
      };
    })();

    /* ══════════════════════════════ LOS ESTIRAMIENTOS ══════════════════════════════ */
    /* el glúteo, tumbado: boca arriba (parte con las rodillas dobladas, los pies apoyados y las manos sobre el abdomen), lleva las dos rodillas hacia el pecho; cruza
       una pierna sobre el muslo contrario (el tobillo derecho descansa sobre el muslo izquierdo, junto a la rodilla, con la rodilla derecha
       abierta hacia fuera); sujeta con las dos manos la parte de atrás del muslo de abajo (la izquierda llega por fuera y la derecha, por el
       hueco entre las piernas; para alcanzarlo despega un momento la cabeza y los hombros) y lo acerca al pecho; mantiene, y cambia de lado */
    COREO['estiramiento-gluteo-tumbado'] = (function () {
      /* las manos descansan sobre el abdomen (como al darse la vuelta, más arriba): de ahí van al muslo sin cruzarse con nada */
      var SOBRE_ABDOMEN = { b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } };
      var s = sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, { p: PIES_PUENTE }));
      var k = sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, { p: { e: 110, z: 0, c: 114 }, t: { tob: 8 } }));
      /* cruzada: el muslo izquierdo, a «e» grados del suelo (90, a plomo; más, hacia el pecho); el tobillo derecho, sobre él */
      var cruzada = function (e, extra) {
        var Q = sobre(SUPINO_SUELO, sobre(extra, { pi: { e: e, z: 0, c: 96 }, ti: { tob: 8 }, pd: { e: 100, z: 0, c: 100 }, td: { tob: 8 } })), L = resolver(Q).i, u = unidad(menos(L.rod, L.cad));
        return sobre(Q, { pd: { a: mas(L.cad, mas(por(u, 31), mas(por(L.frenteMuslo, 11.8), [1.5, 0, 0]))), polo: [-1, 0.15, 0.3] } });
      };
      /* las manos, juntas detrás del muslo izquierdo (a 27 cm de la cadera, por su cara de atrás) */
      var sujeta = function (P) {
        var L = resolver(P).i, u = unidad(menos(L.rod, L.cad)), c = mas(L.cad, mas(por(u, 27), por(L.frenteMuslo, -8.6)));
        var Q = conAgarre(sobre(P, { m: { tipo: 'puno', prono: 0 } }), [c[0] + 4.4, c[1], c[2]], [1, 0.1, 0.3], 'bi');
        return conAgarre(Q, [c[0] - 4.4, c[1], c[2]], [-1, 0.5, -0.1], 'bd');
      };
      var x = cruzada(98, SOBRE_ABDOMEN);
      var g = sujeta(cruzada(104, { col: [16, 0, 0], cab: [8, 0, 0] })), e = sujeta(cruzada(118, { col: [3, 0, 0] }));
      /* de camino (h): la mano izquierda, por fuera de su muslo; la derecha, en el hueco entre los dos muslos y por debajo de la espinilla
         cruzada (en línea recta desde el abdomen se metería en el muslo derecho) */
      var h0 = sobre(cruzada(101, { col: [10, 0, 0], cab: [5, 0, 0] }), { m: { tipo: 'suelta', prono: 0 } });
      var h = conAgarre(conAgarre(h0, [23, 30, 16], [1, 0.1, 0.3], 'bi'), [-2, 30, 12], [-1, 0.5, -0.1], 'bd');
      var P = { s: s, k: k, x: x, h: h, g: g, e: e, x2: refleja(x), h2: refleja(h), g2: refleja(g), e2: refleja(e) };
      return {
        vista: [[62, 20], [20, 32]], isometrico: 'e', clavos: NADA, clavosEn: { s: T2 },
        posturas: P, inicio: 's', encuadra: ['s', 'e'],
        pasos: [{ sec: [['s', 0.5, null, T2], ['k', 1.5, 'suave']], desde: 's' }, { sec: [['x', 1.4, 'suave']], desde: 'k' },
                { sec: [['h', 0.55, 'entra'], ['g', 0.45, 'sale'], ['e', 0.9, 'suave'], ['e', 0.9], ['g', 0.4, 'suave'], ['h', 0.4, 'entra'], ['x', 0.45, 'sale'], ['k', 0.5, 'suave'], ['x2', 0.6, 'suave'],
                        ['h2', 0.5, 'entra'], ['g2', 0.45, 'sale'], ['e2', 0.8, 'suave']], desde: 'x' }]
      };
    })();

    /* los aductores, en mariposa: sentado en el suelo con la espalda recta y las rodillas dobladas (las manos, sobre ellas); junta las
       plantas de los pies (los pies ruedan sobre su canto de fuera: se levantan un momento para no cortar el suelo) y los sujeta con las
       manos; y baja con suavidad las rodillas hacia el suelo y mantiene */
    COREO['estiramiento-mariposa'] = (function () {
      var YS = 11.8, ZF = 27, base = { pel: [0, YS, 0], giro: [0, 8, 0], cab: [-6, 0, 0] };
      var s0 = sobre(base, { giro: [0, 3, 0], cab: [-2, 0, 0], p: { suelo: [12, 42], abre: 6, polo: [0.15, 1, 0.3] } }), Es = resolver(s0).i;
      var s = sobre(s0, { b: { a: [Es.rod[0] + 1.5, Es.rod[1] + 8.3, Es.rod[2] - 1], polo: [1, -0.5, -0.5] }, m: { tipo: 'suelta', prono: 90 } });
      /* las plantas, juntas: el pie, de canto (su planta mira al otro pie); la rodilla, abierta «ang» grados sobre el suelo */
      var CANTO = { punta: [0, -0.12, 0.993], arriba: [1, 0, 0] };
      var con = function (ang, y, extra) { return sobre(base, sobre({ p: { a: [8, y, ZF], polo: [Math.cos(ang * RAD), Math.sin(ang * RAD), 0.2] }, t: CANTO }, extra || {})); };
      var ya = busca(function (y) { return bajoZapa(resolver(con(45, y)).i, 'i'); }, -0.3, 3, 12);
      var manos = { b: { a: [12.5, ya + 7.5, ZF + 3], polo: [1, 0.2, -0.6] }, m: { tipo: 'suelta', palma: [-1, -0.3, 0] } };
      var m = sobre(base, { giro: [0, 5, 0], p: { a: [10.5, 13, 34], polo: [0.75, 0.75, 0.25] }, t: { punta: [0, -0.08, 0.997], arriba: [0.7, 0.714, 0] }, b: { a: [14, 24, 28], polo: [1, -0.2, -0.6] }, m: { tipo: 'suelta', prono: 60 } });
      var x = con(46, ya, manos), e = con(20, ya, manos);
      return {
        vista: [[28, 22], [80, 14]], isometrico: 'e', clavos: T2,
        posturas: { s: s, m: m, x: x, e: e }, inicio: 's', encuadra: ['s', 'e'],
        pasos: ['s', { sec: [['m', 0.8, 'entra', T2], ['x', 0.9, 'sale', T2]], desde: 's' }, { sec: [['e', 1.8, 'suave', T2]], desde: 'x' }]
      };
    })();
  })();
    return {"abduccion-tumbado-lado": "1389c93a56aa", "aduccion-tumbado-lado": "8e7963758620", "almeja": "6bbafb43da49", "almeja-plancha-lateral": "f4f6f7923ce5", "copenhague-rodilla": "188964946062", "copenhague": "727eea2da3b5", "patada-gluteo-cuadrupedia": "780cab940a15", "patada-lateral-cuadrupedia": "31b9a175e016", "estiramiento-rana": "942d71268f9f", "rana-boca-abajo": "33fc493e3d35", "elevacion-lateral-pierna-pie": "05f2a9379f4e", "extension-cadera-de-pie": "a86379c74018", "empuje-isometrico-pared": "d126da8ffbf1", "puente-gluteos-extension-pierna": "4098c5db60f8", "puente-gluteos-una-pierna": "a58aa22a14c6", "hip-thrust-barra": "b820d3c57dbe", "hip-thrust-mancuernas": "dc2300bd1c9e", "hip-thrust-una-pierna": "bab34ea1f9d2", "patada-gluteo-polea": "30233c1dc776", "aduccion-cadera-polea": "5f4dd1d91a74", "pull-through-polea": "737dc89ec005", "peso-muerto-sumo-kettlebell": "92ef44693600", "swing-kettlebell": "edc767424f23", "zancada-estatica": "33341610b063", "zancada-frontal": "2e2f1b4d1866", "zancada-mancuernas": "6a603fde9f37", "zancada-barra": "171dfbff963e", "zancada-atras-mancuernas": "1785df0c481b", "zancada-atras-barra": "7b848f7ec56c", "zancada-caminando": "87d2cc23982c", "zancada-caminando-mancuernas": "57cca78a8534", "zancada-cruzada": "1ff3227a1b50", "zancada-lateral": "a176c84b9ff1", "zancada-lateral-mancuernas": "081ac4ae5810", "zancada-atras-salto": "a674f5372a55", "zancada-salto": "074217004d93", "salto-lateral-un-pie": "e3bc61ac3ec1", "sentadilla-bulgara-barra": "72bf07fa78ed", "sentadilla-bulgara-mancuerna": "cc49849e5800", "subida-lateral-escalon": "fe073c27cf0c", "peso-muerto-sumo": "b51d13e45e2d", "estiramiento-gluteo-tumbado": "2e5135c553f1", "estiramiento-mariposa": "a7dcc2f44374"};
  });
})();
