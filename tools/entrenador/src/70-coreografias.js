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
  /* la mano apoyada de plano (en el suelo, en una pared): se dice en el mundo hacia dónde mira la palma y hacia dónde van los dedos, y
     queda así haga lo que haga el antebrazo (10-esqueleto.js, manoDe). Apoya de verdad con el centro de la muñeca a ALTO_MUN de la
     superficie: el talón de la mano la toca y los dedos quedan tendidos en ella (medido con el dibujo: manoAPlano da 0,0) */
  var ALTO_MUN = 2.7;
  function apoyada(dedos, palma, tipo) { return { tipo: tipo || 'abierta', palma: palma || [0, -1, 0], dedos: dedos || [0, 0, 1] }; }
  var EN_SUELO = apoyada([0, 0, 1]);
  /* de canto (la palma mira a un lado y apoya el lado del meñique), la muñeca va a ALTO_CANTO; con el dorso apoyado, a ALTO_MUN */
  var ALTO_CANTO = 5.1;
  /* en una pared que queda delante (su cara, en z = zp): la palma hacia ella y los dedos hacia arriba; la muñeca, a ALTO_MUN de la pared */
  var PLANA_PARED = apoyada([0, 1, 0], [0, 0, 1]);
  function tabla(ang, extra) {
    var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
    return sobre({ pel: [0, TOB_PUNTA + 78 * s, -100 + 78 * c], giro: [0, 90 - ang, 0], cab: [-16, 0, 0], p: { e: 0, z: 0, c: 0 }, t: PIES_PUNTA, m: EN_SUELO }, extra || {});
  }
  /* la tabla con los brazos estirados sobre las muñecas w (apoyadas): se busca el ángulo que deja el hombro a un brazo justo */
  function tablaAlta(w, polo, extra) { return aUnBrazo(function (x) { return tabla(x, sobre({ b: { a: w, polo: polo } }, extra || {})); }, w, 6, 36); }
  /* lo mismo con las dos manos en sitios distintos (wi, wd): manda el brazo que más pide; el otro queda algo doblado */
  function aDosBrazos(P, wi, wd, lo, hi) {
    var L = D.brazo + D.antebrazo - 0.35;
    return P(busca(function (x) { var E = resolver(P(x)); return Math.max(largo(menos(E.i.hom, wi)), largo(menos(E.d.hom, wd))); }, L, lo, hi));
  }
  /* colgado de la barra de dominadas (a 225 cm) */
  /* la mano en una barra atravesada (la de dominadas, la del jalón): se dice a lo largo de qué va la barra y de qué lado queda la
     palma (hacia delante, o hacia él en las supinas), y el antebrazo gira lo que haga falta, esté el codo donde esté */
  var EN_BARRA = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] }, EN_BARRA_SUP = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };
  var COLGADO = { p: { e: 6, z: 0, c: 16 }, t: { tob: 28 }, m: EN_BARRA };

  /* ══════════ ayudas para cualquier bloque (nacieron en el 3, con el dorsal) ══════════ */
  function une(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in (b || {})) r[k] = b[k]; return r; }
  var BRAZO = D.brazo + D.antebrazo + D.mano;      /* del hombro al centro del agarre, con el brazo estirado: 59 */
  /* ── colgado de la barra de dominadas (a 225 cm) ── */
  var ALTO_BARRA = 225;
  function barraD(o) { return ['barra_dominadas', une({ alto: ALTO_BARRA, ancho: 62 }, o)]; }
  /* a qué altura queda la cadera con los brazos estirados: cuanto más abiertas las manos (G, a cada lado), más arriba */
  function yColgado(G, hom) { var dx = G - D.hombroX; return ALTO_BARRA - Math.sqrt((BRAZO - 0.3) * (BRAZO - 0.3) - dx * dx) - 43.5 - (hom || 0); }
  /* colgado, suelto (los hombros suben hacia las orejas) y con los omóplatos abajo y atrás */
  function cuelga(G, extra) { return sobre(COLGADO, sobre({ pel: [0, yColgado(G, 3.5), -2], hom: [3.5, 0], b: { a: [G, ALTO_BARRA - 8, 0], polo: [1, -0.2, 0.5] } }, extra || {})); }
  function activo(G, extra) { return sobre(COLGADO, sobre({ pel: [0, yColgado(G, -2), -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [G, ALTO_BARRA - 8, 0], polo: [1, -0.3, 0.4] } }, extra || {})); }
  function clavosB(G, G2) { return ['mi@0:' + G, 'md@0:' + (-(G2 == null ? G : G2))]; }
  /* ── dos ayudas para colocar las manos ──
     conAgarre: la postura P con el centro del puño izquierdo en g (el derecho, en su reflejo) y el codo hacia «polo»: la muñeca
     queda a una mano de g, en la línea del antebrazo. k: 'b' (los dos brazos), 'bi' o 'bd' (uno solo; g es entonces el de ese lado) */
  function conAgarre(P, g, polo, k) {
    k = k || 'b';
    var w = [g[0], g[1] - D.mano, g[2]], i, E, c = {};
    for (i = 0; i < 5; i++) {
      c[k] = { a: w, polo: polo };
      E = resolver(sobre(P, c));
      w = menos(g, por(unidad(menos(g, E[k === 'bd' ? 'd' : 'i'].cod)), D.mano));
    }
    c[k] = { a: w, polo: polo };
    return sobre(P, c);
  }
  /* estirado: el brazo, estirado desde el hombro de la postura P hacia el punto q (a «flojo» cm de estirarse del todo); el puño
     queda en esa línea. k, como arriba; si es 'b', q es el de la mano izquierda */
  function estirado(P, q, k, flojo, polo) {
    k = k || 'b';
    var E = resolver(P), h = E[k === 'bd' ? 'd' : 'i'].hom, u = unidad(menos(q, h)), c = {};
    c[k] = { a: mas(h, por(u, BRAZO - D.mano - (flojo == null ? 0.25 : flojo))), polo: polo || [k === 'bd' ? -1 : 1, -0.3, -0.3] };
    return sobre(P, c);
  }
  /* dónde queda el puño de una postura */
  function agarreDe(P, k) { return resolver(P)[k || 'i'].agarre; }
  /* inclinado(ang): de pie, el tronco a «ang» grados de la vertical (90, paralelo al suelo), la cadera hacia atrás y las rodillas algo
     flexionadas; los pies no se mueven */
  function inclinado(ang, extra) {
    var k = Math.sin(ang * RAD);
    return sobre({ pel: [0, PIE - 2 - 5.5 * k, -27.5 * k], giro: [0, ang, 0], cab: [-ang * 0.3, 0, 0], p: { suelo: [11, 0], abre: 7 } }, extra || {});
  }
  var DE_PIE = { p: { suelo: [11, 0], abre: 7 } };
  /* el punto del cuerpo ante el que acaba la barra o la mancuerna: a «arriba» cm de la cadera a lo largo del tronco y a «fuera» de su
     eje hacia delante (hacia el suelo, si está inclinado) */
  function anteTronco(P, arriba_, fuera, x) { var E = resolver(P); return mas(E.pel, mas(aplicar(E.Bp, [0, arriba_, 0]), mas(aplicar(E.Bl, [0, 0, fuera]), [x || 0, 0, 0]))); }
  /* colgando: el puño, en la vertical del hombro (más «dz» hacia delante), con el brazo estirado */
  function colgando(P, G, dz) { var h = resolver(P).i.hom; return estirado(P, [G, h[1] - BRAZO, h[2] + (dz || 0)], 'b', 0.3, [1, 0.2, -0.6]); }
  /* busca, entre lo y hi, el valor de x con el que f(x) vale «meta» (f, monótona): para dejar un hombro a un brazo justo de una mano apoyada */
  function busca(f, meta, lo, hi) {
    var crece = f(hi) > f(lo), i, x;
    for (i = 0; i < 40; i++) { x = (lo + hi) / 2; if ((f(x) > meta) === crece) hi = x; else lo = x; }
    return (lo + hi) / 2;
  }
  /* la postura P(x) con el hombro izquierdo a un brazo estirado de la muñeca w (que está apoyada y no se mueve) */
  function aUnBrazo(P, w, lo, hi) {
    var L = D.brazo + D.antebrazo - 0.35;
    return P(busca(function (x) { return largo(menos(resolver(P(x)).i.hom, w)); }, L, lo, hi));
  }
  /* ── de rodillas ── De una postura a otra, la cadera no va en línea recta: gira sobre las rodillas, que no se mueven del suelo (en línea
     recta la cadera se acercaría a ellas y la rodilla, que es lo que cede, se hundiría en el suelo). arcoRodillas(A, B, u, K): la postura
     intermedia, a «u» del camino (de 0 a 1), con la cadera en el arco que tiene su centro en las rodillas, K = [alto, z]; el giro del
     cuerpo, la columna, la cabeza y los hombros, a partes iguales entre las dos; y los brazos: si las manos están apoyadas (se dan en el
     mundo, las dos posturas), siguen en su sitio; si no, la muñeca y el codo van a partes iguales, vistos desde el tórax. Las posturas
     intermedias van en la secuencia entre A y B */
  function arcoRodillas(A, B, u, K) {
    var a = Math.atan2(A.pel[1] - K[0], A.pel[2] - K[1]), b = Math.atan2(B.pel[1] - K[0], B.pel[2] - K[1]), th = a + (b - a) * u;
    var ra = Math.sqrt((A.pel[1] - K[0]) * (A.pel[1] - K[0]) + (A.pel[2] - K[1]) * (A.pel[2] - K[1])), rb = Math.sqrt((B.pel[1] - K[0]) * (B.pel[1] - K[0]) + (B.pel[2] - K[1]) * (B.pel[2] - K[1])), r = ra + (rb - ra) * u;
    var entre2 = function (x, y) { x = x || [0, 0, 0]; y = y || [0, 0, 0]; return [x[0] + (y[0] - x[0]) * u, x[1] + (y[1] - x[1]) * u, x.length > 2 ? x[2] + (y[2] - x[2]) * u : 0].slice(0, x.length); };
    var EA = resolver(A), EB = resolver(B);
    var c = { pel: [A.pel[0] + (B.pel[0] - A.pel[0]) * u, K[0] + r * Math.sin(th), K[1] + r * Math.cos(th)], giro: entre2(A.giro, B.giro), col: entre2(A.col, B.col), cab: entre2(A.cab, B.cab),
      hom: { i: entre2(EA.S.hom.i, EB.S.hom.i), d: entre2(EA.S.hom.d, EB.S.hom.d) } };
    if (A.b && B.b && A.b.a && B.b.a && !A.b.en && !B.b.en && A.b.polo && B.b.polo) c.b = { a: entre2(A.b.a, B.b.a), polo: entre2(A.b.polo, B.b.polo) };
    else LADOS.forEach(function (k) {
      c['b' + k] = { a: entre2(aLocal(EA.Bt, menos(EA[k].mun, EA.tor)), aLocal(EB.Bt, menos(EB[k].mun, EB.tor))), en: 'torax',
        polo: entre2(aLocal(EA.Bt, menos(EA[k].cod, EA[k].hom)), aLocal(EB.Bt, menos(EB[k].cod, EB[k].hom))) };
    });
    return sobre(u < 0.5 ? A : B, c);
  }
  /* la secuencia de A a B por el arco, en «seg» segundos y con «n» posturas intermedias (se guardan en «posturas» con los nombres
     pre1, pre2…): arranca y frena redondeado y entre medias va a paso constante. Devuelve los tramos: [[pre1, …], …, [nombreB, …]] */
  function porArco(posturas, pre, A, B, nombreB, n, seg, K, clavos) {
    var d = seg / (n + 3), tramos = [], i;
    for (i = 1; i <= n; i++) { posturas[pre + i] = arcoRodillas(A, B, i / (n + 1), K); tramos.push([pre + i, i === 1 ? 2 * d : d, i === 1 ? 'entra' : 'lineal']); }
    tramos.push([nombreB, 2 * d, 'sale']);
    if (clavos) tramos.forEach(function (q) { q.push(clavos); });
    return tramos;
  }
  /* ── la media vuelta en el sitio ── De mirar a +Z (giro 0) a mirar a −Z (giro 180), pasando de frente a +X, en tres giros de 60°: los
     pies giran con el cuerpo, planos en el suelo (de un tirón, de 0 a 180, la punta de cada pie pasaría por no apuntar a ningún sitio y
     el pie se hundiría). mediaVuelta(posturas, pre, seg, extra): añade las dos posturas intermedias (pre1 y pre2: de pie, con «extra») y
     devuelve los tres tramos, con los tobillos clavados a su camino; el último llega a «llega», que pone quien llama (con giro 180 y
     los pies donde les toca: el izquierdo en x = −10 y el derecho en x = 10) */
  function mediaVuelta(posturas, pre, seg, extra, llega) {
    var d = seg / 5, T2V = ['ti', 'td'];
    [60, 120].forEach(function (g, i) {
      var c = Math.cos(g * RAD), s = Math.sin(g * RAD);
      posturas[pre + (i + 1)] = sobre({ giro: [g, 0, 0], pi: { suelo: [10 * c, -10 * s], abre: 6 }, pd: { suelo: [-10 * c, 10 * s], abre: 6 } }, extra || {});
    });
    return [[pre + '1', 2 * d, 'entra', T2V], [pre + '2', d, 'lineal', T2V], [llega, 2 * d, 'sale', T2V]];
  }
  /* ── sentado en un banco (nacieron en el bloque 5, con los hombros) ── */
  var Z_BIS = 24;                                   /* la bisagra del banco con respaldo (largo 124, asiento 38) */
  function silla5(ang) { return ['banco', { rumbo: 180, largo: 124, respaldo: ang }]; }
  /* con la espalda en el respaldo (a «ang» grados: 85, casi vertical; 45, inclinado) y los pies en el suelo */
  function sentadoEnRespaldo(ang, extra) {
    var a = ang * RAD, c = Math.cos(a), s = Math.sin(a), k = (11 - 11.5 * c) / s;
    return sobre({ pel: [0, 55, Z_BIS + 11.5 * s - k * c], giro: [0, -(90 - ang), 0], p: { suelo: [15, Z_BIS + 52], abre: 8, polo: [0.2, 1, 0.3] } }, extra || {});
  }
  /* en el extremo de un banco plano, que queda detrás: el tronco, a «inc» grados hacia delante */
  var BANCO_DETRAS = ['banco', { en: [0, -20], largo: 96 }];
  function sentadoAlBorde(inc, extra) { return sobre({ pel: [0, 55, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0], p: { suelo: [13, 42], abre: 7 } }, extra || {}); }
  /* ── tumbado boca arriba en un banco (como en el bloque 2, que guarda las suyas; estas son para cualquier bloque) ──
     ang: 0, plano; 45, inclinado; −15, declinado (la cabeza más baja que la cadera). Inclinado o declinado, el banco va con rumbo 180:
     el respaldo sale del asiento hacia −Z, que es donde queda la cabeza. La espalda, a 11,5 cm del respaldo; la cadera, a 11 del asiento */
  function bancoDe(ang) { return ang ? ['banco', { rumbo: 180, largo: 124, respaldo: ang }] : ['banco', { largo: 124 }]; }
  function tumbadoEn(ang, extra) {
    var P;
    if (!ang) P = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] } };
    else {
      var a = ang * RAD, c = Math.cos(a), s = Math.sin(a), k = (11 - 11.5 * c) / s;
      P = { pel: [0, 55, Z_BIS + 11.5 * s - k * c], giro: [0, -(90 - ang), 0], p: { suelo: [18, 70], abre: 8, polo: [0.2, 1, 0.3] } };
    }
    return sobre(P, extra || {});
  }
  /* ── el codo que no se mueve (nacieron en el bloque 6, con los bíceps; el 7 las subió aquí) ──
     flexion(P, C, fi, ref): el brazo izquierdo de la postura P con el codo en C (un punto del mundo, a un brazo justo del hombro) y el
     antebrazo doblado «fi» grados respecto del brazo (0, en línea con él), hacia el lado de «ref». Con una barra (las manos, a G del
     centro: flexionG) el antebrazo se abre o se cierra lo que haga falta (abre) y gira en un cono */
  function abre(C, G) { return (G - C[0]) / (D.antebrazo + D.mano); }
  function dirFlex(P, C, fi, ref) {
    var u = unidad(menos(C, resolver(P).i.hom)), f = unidad(sinParte(ref || [0, 0, 1], u));
    return mas(por(u, Math.cos(fi * RAD)), por(f, Math.sin(fi * RAD)));
  }
  function flexion(P, C, fi, ref) { return { a: mas(C, por(dirFlex(P, C, fi, ref), D.antebrazo)), polo: menos(C, resolver(P).i.hom) }; }
  function flexionG(P, C, fi, ref, G) {
    var d = dirFlex(P, C, fi, ref), dx = abre(C, G), l = Math.sqrt(d[1] * d[1] + d[2] * d[2]) || 1, k = Math.sqrt(1 - dx * dx);
    return { a: mas(C, por([dx, k * d[1] / l, k * d[2] / l], D.antebrazo)), polo: menos(C, resolver(P).i.hom) };
  }

  /* ══════════ más ayudas para cualquier bloque (nacieron en el 8, con el antebrazo y la pantorrilla; el 9 las subió aquí) ══════════ */
  /* ── la mano, dicha en el mundo ──
     manoHacia(P, k, dir, palma, tipo): la mano del lado k ('i', 'd') de la postura P con los dedos hacia «dir» y la palma mirando a «palma»
     (dos direcciones del mundo): devuelve el giro del antebrazo (prono), lo que se dobla la muñeca (mun) y lo que se ladea (lat) que
     hacen falta con el brazo tal como queda en P. cerca: un prono de referencia, para que de una postura a otra no dé la vuelta entera */
  function manoHacia(P, k, dir, palma, tipo, cerca) {
    var E = resolver(P), L = E[k], s = k === 'i' ? 1 : -1, lw = L.lw, bis = cruz(L.uw, lw);
    if (largo(bis) < 0.05) bis = cruz(L.uw, E.S.b[k].b ? aplicar(E.Bt, E.S.b[k].b) : [0, 0, 1]);
    var palma0 = por(unidad(bis, [1, 0, 0]), s), pd = unidad(palma), dd = unidad(sinParte(dir, pd));
    var sm = entre(-punto(pd, lw), -1, 1), m = Math.asin(sm), cm = Math.cos(m);
    var d1 = cm > 0.05 ? unidad(mas(lw, por(pd, sm))) : dd;
    var pp = unidad(mas(por(d1, sm), por(pd, cm)));                /* la palma, antes de doblar la muñeca */
    var lat = Math.atan2(punto(cruz(d1, dd), pd), punto(d1, dd)) / RAD;
    var pr = Math.atan2(punto(cruz(palma0, pp), lw), punto(palma0, pp)) / RAD * s;
    if (cerca != null) { while (pr - cerca > 180) pr -= 360; while (pr - cerca < -180) pr += 360; }
    return { tipo: tipo || 'abierta', prono: pr, mun: m / RAD, lat: lat };
  }
  /* de puntillas: el pie gira sobre su bola, el tobillo sube y se adelanta, y la cadera va con él (la pierna sigue como estaba).
     deTalon(g): cuánto se adelanta el tobillo y cuánto sube con el talón levantado g grados (negativo: por debajo del apoyo) */
  function deTalon(g) { var t = g * RAD; return [D.bola - D.bola * Math.cos(t) + D.tobillo * Math.sin(t), D.bola * Math.sin(t) + D.tobillo * Math.cos(t) - D.tobillo]; }
  /* entre el pie en el suelo y el pie recogido: apoyado solo en la punta, con el talón ya arriba (así se despega y se posa por la punta);
     y, a medio camino (enPunta(x, 28): el talón, a la mitad), para que el pie ruede sobre la punta en vez de atravesar el suelo */
  function enPunta(x, talon) { return { suelo: [x, 0], abre: 5, talon: talon || 56 }; }
  /* un punto sobre el muslo izquierdo de la postura P: a «s» cm de la cadera por su eje y «h» por encima de él */
  function puntoEnMuslo(P, s, h, k) { var L = resolver(P)[k || 'i'], u = unidad(menos(L.rod, L.cad)), n = unidad(sinParte([0, 1, 0], u)); return mas(L.cad, mas(por(u, s), por(n, h))); }
  /* enSuMuslo: la mano que descansa sobre el muslo de su lado (k: 'i' o 'd'), con la palma hacia abajo: la muñeca, a 21 cm de la cadera por el muslo
     (pasado el bajo del pantalón) y 12 por encima de su eje, que es su cara de arriba más medio grueso de muñeca; la mano sigue la caída
     del muslo hacia la rodilla (unos 11°). Se coloca sobre el muslo tal como queda en P: si la rodilla sube, la mano sube con ella */
  function enSuMuslo(P, k) {
    var L = resolver(P)[k], sg = k === 'i' ? 1 : -1, u = unidad(menos(L.rod, L.cad)), n = unidad(sinParte([0, 1, 0], u)), c = {};
    c['b' + k] = { a: mas(L.cad, mas(por(u, 21), por(n, 12))), polo: [0.55 * sg, -0.1, -1] };
    var Q = sobre(P, c), m = {};
    m['m' + k] = manoHacia(Q, k, mas(mas(por(u, 0.94), por(n, -0.2)), [-0.27 * sg, 0, 0]), mas(mas(por(n, -0.95), por(u, -0.2)), [0.3 * sg, 0, 0]), 'plana');
    return sobre(Q, m);
  }
  function enSusMuslos(P) { return enSuMuslo(enSuMuslo(P, 'i'), 'd'); }
  /* tumbado de lado, la pierna de abajo descansa en el suelo: si su zapatilla (que es más ancha que el tobillo) se hunde, el tobillo
     sube lo justo; la rodilla sigue donde estaba. (Nació en el bloque 5, con los rotadores del hombro; el 9 la subió aquí) */
  function pieSobreSuelo(P, k) {
    var E = resolver(P), bajo = bajoZapa(E[k], k), c = {};
    if (bajo > -0.5) return P;
    c['p' + k] = { a: [E[k].tob[0], E[k].tob[1] - bajo - 0.3, E[k].tob[2]], polo: menos(E[k].rod, E[k].cad) };
    return sobre(P, c);
  }

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
    /* mientras la espalda baja por la pared, los pies se separan de ella de uno en uno, por el aire: primero el izquierdo (w1, y queda
       plantado: w2) y después el derecho (w3). Los tobillos van clavados a ese camino: ningún pie atraviesa el suelo */
    var cerca = { suelo: [10, 8], abre: 4 }, lejos = { suelo: [11, 39], abre: 4, polo: [0.1, 0.4, 1] }, PIE_AIRE_S = { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] };
    COREO['sentadilla-isometrica-pared'] = {
      vista: [66, 22], isometrico: 'c', clavos: ['ti', 'td'], material: [['pared', { z: -13.4, normal: [0, 0, 1], ancho: 150 }]],
      posturas: {
        a: { pel: [0, PIE - 0.5, -1], p: cerca },
        w1: { pel: [0, 77, -1], pi: { a: [10.5, 20, 25], polo: [0.1, 0.3, 1] }, ti: PIE_AIRE_S, pd: reflejo(cerca) },
        w2: { pel: [0, 67, -1], pi: lejos, pd: reflejo(cerca) },
        w3: { pel: [0, 56, -1], pi: lejos, pd: { a: [-10.5, 20, 25], polo: [-0.1, 0.3, 1] }, td: PIE_AIRE_S },
        b: { pel: [0, 46, -1], p: lejos },
        c: { pel: [0, 46, -1], p: lejos, b: cruz, m: SUELTA }
      },
      inicio: 'b', encuadra: ['a'],
      pasos: [{ sec: [['a', 0.5], ['w1', 0.5, 'entra'], ['w2', 0.6, 'sale'], ['w3', 0.6, 'entra'], ['b', 0.6, 'sale']], desde: 'a' }, 'b', { sec: [['c', 0.9, 'suave']], desde: 'b' }]
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
    var pies = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, manos = { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] };
    COREO['puente-gluteos'] = {
      vista: [72, [28, 30]], picado: 16, rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti', 'td', 'mi', 'md'],
      posturas: {
        a: sobre(SUPINO_SUELO, { p: pies, b: manos, m: EN_SUELO }),
        /* arriba: los hombros no se levantan del suelo (siguen en z = −23,5 y cargan el peso: bajan a 10 cm de él) y el tronco sube desde
           ellos hasta la cadera, 22°: las rodillas, la cadera y los hombros quedan en línea (175°), la parte alta de la espalda sigue en el
           suelo y la cabeza también (la barbilla se acerca al pecho) */
        b: { pel: [0, 10 + 43.5 * Math.sin(22 * RAD), -23.5 + 43.5 * Math.cos(22 * RAD)], giro: [0, -112, 0], cab: [35, 0, 0], p: pies, b: manos, m: EN_SUELO }
      },
      rep: [['b', 1.2, 'empuje'], ['b', 0.6], ['a', 1.6, 'freno'], ['a', 0.5]],
      pasos: ['a', 'rep', 'rep']
    };
    /* con la espalda en el banco: el tronco gira sobre el borde del banco */
    var ph = { suelo: [17, 60], abre: 6, polo: [0.15, 1, 0.3] }, enCadera = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };       /* en la cintura, por encima del pliegue de la cadera */
    COREO['hip-thrust-banco'] = {
      vista: [72, 20], rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      material: [['banco', { rumbo: 90, en: [0, -36], largo: 110 }]],
      posturas: {
        a0: { pel: [0, 22, 10.9], giro: [0, -53.3, 0], cab: [12, 0, 0], p: ph, b: { a: [27, ALTO_MUN, -3], polo: [1, 0.2, -0.7] }, m: EN_SUELO },
        a: { pel: [0, 22, 10.9], giro: [0, -53.3, 0], cab: [12, 0, 0], p: ph, b: enCadera, m: SUELTA },
        b: { pel: [0, 49, 19.5], giro: [0, -90, 0], cab: [14, 0, 0], p: ph, b: enCadera, m: SUELTA }
      },
      rep: [['b', 1.1, 'empuje'], ['b', 0.6], ['a', 1.5, 'freno'], ['a', 0.5]],
      pasos: ['a0', { sec: [['a', 0.9, 'suave']], desde: 'a0' }, 'rep']
    };
    /* la zancada hacia atrás: el pie de delante no se mueve */
    var f = { suelo: [17, 0], abre: 4 };
    var z = { pel: [0, 47, -36], giro: [0, 5, 0], pi: { suelo: [17, 0], abre: 4, polo: [0.1, 0.1, 1] }, pd: { suelo: [-15, -70], abre: 0, talon: 62, polo: [0, -1, 0.4] } };
    /* el paso: el pie que va atrás (el derecho; el otro lado, reflejado) se levanta del suelo y viaja por el aire, con la punta algo caída,
       hasta posarse en su parte delantera; y vuelve igual. Los dos tobillos van clavados a su camino: el de delante no se mueve y el de
       atrás no arrastra por el suelo */
    var paso = { pel: [0, 66, -17], giro: [0, 3, 0], pi: z.pi, pd: { a: [-16, 24, -31], polo: [0, -0.6, 1] }, td: { punta: [0, -0.5, 0.866], arriba: [0, 0.866, 0.5] } };
    var T2Z = ['ti', 'td'];
    COREO['zancada-atras'] = {
      vista: [62, 14], rastro: 'pel', esfuerzo: [3, 4, 9, 10],
      posturas: { a: { p: f }, b: z, b2: refleja(z), p: paso, p2: refleja(paso) },
      rep: [['p', 0.6, 'entra', T2Z], ['b', 0.65, 'sale', T2Z], ['b', 0.5, null, T2Z], ['p', 0.5, 'entra', T2Z], ['a', 0.55, 'sale', T2Z], ['a', 0.35, null, T2Z],
            ['p2', 0.6, 'entra', T2Z], ['b2', 0.65, 'sale', T2Z], ['b2', 0.5, null, T2Z], ['p2', 0.5, 'entra', T2Z], ['a', 0.55, 'sale', T2Z], ['a', 0.35, null, T2Z]],
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
    /* el peso muerto: la barra espera en el suelo hasta que se agarra (una palma hacia arriba y otra hacia abajo). Las manos, por fuera
       de las piernas (a 27 cm del centro): suben y bajan sin tocar las rodillas ni los muslos */
    var pp = { suelo: [12, 0], abre: 8 };
    COREO['peso-muerto-barra'] = {
      vista: [66, 38], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['a0'],
      material: [['barra', { reposo: [0, 21, 9.5] }]],
      posturas: {
        a0: { p: pp },
        g: { pel: [0, 60, -28], giro: [0, 64, 0], cab: [-30, 0, 0], p: pp, bi: { cuelga: [8, -2.5], largo: 50.3 }, bd: { cuelga: [8, -2.5], largo: 50.3 }, mi: SUPINO, md: PRONO },
        b: { hom: [0, -1.6], p: pp, bi: { cuelga: [8, 9], largo: 49.6 }, bd: { cuelga: [8, 9], largo: 49.6 }, mi: SUPINO, md: PRONO }
      },
      inicio: 'g', encuadra: ['a0'],
      rep: [['b', 1.4, 'empuje'], ['b', 0.5], ['g', 1.9, 'freno'], ['g', 0.5]],
      pasos: ['a0', { sec: [['g', 1.5, 'suave']], desde: 'a0' }, 'rep', { rep: 1.9 }]
    };
    /* las manos, en la cintura, por encima del pliegue de la cadera: al inclinar el tronco, el muslo sube hacia ellas y no les llega
       (más abajo, se les echaba encima) */
    var pa = { suelo: [25, 0], abre: 8 }, cad = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };
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
    /* el gemelo en la pared: una pierna atrás, con la rodilla estirada y el talón en el suelo. Las manos, apoyadas de plano en la pared (su
       cara, en z = 52: las muñecas, a ALTO_MUN de ella), no se mueven */
    var enPared = { a: [17, 120, 52 - ALTO_MUN], polo: [0.7, -1, -0.5] }, mp = PLANA_PARED;
    var e1 = { pel: [0, 78, -6], giro: [0, 12, 0], pi: { suelo: [10, 24], abre: 0 }, pd: { suelo: [-10, -36], abre: 0, polo: [0, 0, 1] }, b: enPared, m: mp };
    var e2 = { pel: [0, 74, 2], giro: [0, 16, 0], pi: { suelo: [10, 24], abre: 0, polo: [0, 0.2, 1] }, pd: { suelo: [-10, -36], abre: 0, polo: [0, 0, 1] }, b: enPared, m: mp };
    /* el cambio de pierna, en dos pasos: el pie de atrás viene junto al otro por el aire (g1) y quedan los dos juntos (gj); y el otro va
       atrás, también por el aire (el reflejo de g1). Los tobillos van clavados a ese camino: ningún pie atraviesa el suelo */
    var gj = { pel: [0, 84.5, 16], giro: [0, 9, 0], p: { suelo: [10, 24], abre: 0 }, b: enPared, m: mp };
    var g1 = { pel: [0, 81.5, 5], giro: [0, 10.5, 0], pi: { suelo: [10, 24], abre: 0 }, pd: { a: [-10, 21, -8], polo: [0, 0, 1] }, td: { punta: [0, -0.42, 0.91], arriba: [0, 0.91, 0.42] }, b: enPared, m: mp };
    var T4G = ['mi', 'md', 'ti', 'td'];
    COREO['estiramiento-gemelo-pared'] = {
      vista: [100, 146], isometrico: 'b', clavos: T4G,
      material: [['pared', { z: 52, normal: [0, 0, -1], ancho: 130 }]],
      posturas: { a: e1, b: e2, a2: refleja(e1), b2: refleja(e2), g1: g1, gj: gj, g2: refleja(g1) },
      inicio: 'a', encuadra: ['b'],
      pasos: ['a', { sec: [['b', 1.5, 'suave']], desde: 'a' },
              { sec: [['b', 0.6], ['a', 0.8, 'suave'], ['g1', 0.32, 'entra'], ['gj', 0.34, 'sale'], ['g2', 0.34, 'entra'], ['a2', 0.32, 'sale'], ['b2', 1.5, 'suave']], desde: 'b' }]
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
    /* las manos, en el borde del banco, junto a la cadera: a 29 cm del centro, que es donde la mano entera (con su pulgar) queda fuera del muslo */
    var borde = { a: [29, 47, -3], polo: [0.25, 0.25, -1] }, mb = { tipo: 'abierta', prono: 90, mun: -78 };
    COREO['fondos-banco'] = {
      vista: [70, 24], rastro: 'hombros', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      material: [['banco', { rumbo: 90, en: [0, -17], largo: 110 }]],
      posturas: {
        s: { pel: [0, 55, -9], hom: [-2.5, 0], p: { suelo: [10, 34], abre: 4, polo: [0, 1, 0.5] }, b: borde, m: mb },
        a: { pel: [0, 52, 8], p: { suelo: [10, 47], abre: 4, polo: [0, 1, 0.5] }, b: borde, m: mb },
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
    /* la flexión diamante: las manos juntas, bajo el pecho, giradas 35° hacia dentro: las puntas de los índices se tocan delante y las de
       los pulgares, detrás (el triángulo de la ficha) */
    var juntas = { a: [14.3, ALTO_MUN, 4], polo: [1, 0.25, -0.5] }, EN_DIAMANTE = apoyada([-Math.sin(35 * RAD), 0, Math.cos(35 * RAD)]);
    COREO['flexion-diamante'] = {
      vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      posturas: { a: tablaAlta(juntas.a, juntas.polo, { m: EN_DIAMANTE }), b: tabla(3.2, { b: juntas, m: EN_DIAMANTE, cab: [-22, 0, 0] }) },
      rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
      pasos: ['a', 'a', 'rep']
    };
  })();

  /* ══════════ PECHO ══════════ */
  (function () {
    var tumbado = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] }, m: EN_BARRA };       /* las palmas, hacia los pies */
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
    var manos = { a: [19, ALTO_MUN, 13.3], polo: [0.55, 0.25, -1] };
    COREO.flexion = {
      vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      posturas: { a: tablaAlta(manos.a, manos.polo), b: tabla(1.0, { b: manos, cab: [-24, 0, 0] }) },
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
    var sup = sobre(COLGADO, { m: EN_BARRA_SUP });
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
      return sobre({ pel: [0, 8 + 78 * s, 88 - 78 * c], giro: [0, -(90 - ang), 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0.97, 0.24], arriba: [0, 0.24, -0.97] }, m: EN_BARRA, b: { a: [26, 72, 0], polo: [1, -1, 0.1] } }, extra || {});
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
    /* los antebrazos, apoyados: la muñeca, a 2,9 cm del suelo (el antebrazo lo toca y la mano queda tendida en él, con la palma hacia abajo) */
    var brazos = { a: [19, ALTO_MUN + 0.2, -100 + 121.5 * c + 24], polo: [0, -1, -0.25] };
    COREO['plancha-antebrazos'] = {
      vista: [80, [32, 34]], picado: 16, isometrico: 'a', clavos: ['ti', 'td', 'mi', 'md'],
      posturas: {
        /* tumbado boca abajo, apoyado en los antebrazos con los codos bajo los hombros (a 6 cm del suelo: el antebrazo descansa en él) y
           el pecho levantado; los pies, ya de puntas: al subir no se mueven de su sitio */
        a0: { pel: [0, 11.5, -22.2], giro: [0, 84, 0], col: [-36, 0, 0], cab: [-16, 0, 0], p: { a: [10, TOB_PUNTA, -100], polo: [0, -1, 0.3] }, t: PIES_PUNTA, b: brazos, m: EN_SUELO },
        a: { pel: [0, TOB_PUNTA + 78 * s, -100 + 78 * c], giro: [0, 90 - ang, 0], cab: [-12, 0, 0], p: { e: 0, z: 0, c: 0 }, t: PIES_PUNTA, b: brazos, m: EN_SUELO }
      },
      inicio: 'a0', encuadra: ['a'],
      pasos: ['a0', { sec: [['a', 1.3, 'suave']], desde: 'a0' }, { sec: [['a', 5.25], ['a0', 1.5, 'suave']], desde: 'a' }]
    };
    /* el crunch: se enrolla el tronco; la pelvis y los pies no se mueven */
    /* las manos, detrás de la cabeza; los codos, abiertos, a 5,5 cm del suelo cuando está tumbado (el brazo descansa en él) */
    var nuca = { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, 0.15] }, pc = { suelo: [11, 60], abre: 4, polo: [0.1, 1, 0.2] };
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
        a: { pel: [0, 121, -2], hom: [1, 0], p: { e: 4, z: 0, c: 8 }, t: { tob: 26 }, m: EN_BARRA, b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } },
        b: { pel: [0, 121.5, -4], giro: [0, -8, 0], col: [12, 0, 0], hom: [1, 0], p: { e: 90, z: 0, c: 96 }, t: { tob: 10 }, m: EN_BARRA, b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } }
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
