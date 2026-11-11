  /* ───────────────────────── el esqueleto ─────────────────────────
     Un esqueleto de verdad, en tres dimensiones: pelvis, columna (lumbar y tórax), cabeza,
     dos brazos y dos piernas de dos huesos, manos y pies. Una POSTURA se escribe como la
     escribiría un entrenador (dónde está la pelvis, cuánto se inclina, hacia dónde va cada
     brazo, dónde pisa cada pie) y se RESUELVE a huesos. Entre dos posturas resueltas se va por
     arcos, y lo que tiene que quedarse en su sitio (un pie en el suelo, una mano en la barra)
     se vuelve a clavar en cada cuadro. */
  var D = {
    pelvis: 86,            /* la altura de la cadera, de pie */
    lumbar: 8, torax: 14,  /* de la pelvis a la articulación lumbar, y de esta a la del tórax */
    hombroY: 21.5, hombroX: 19, cuello: 24.5, cabeza: 30.5,   /* sobre la articulación del tórax */
    brazo: 27, antebrazo: 24, mano: 8, dedos: 16,
    caderaX: 10, muslo: 40, pierna: 38,
    tobillo: 8, talon: 6, punta: 18, bola: 12   /* el pie: alto del tobillo, y de él al talón, a la punta y a la bola */
  };
  var LADOS = ['i', 'd'];
  function signo(k) { return k === 'i' ? 1 : -1; }

  /* dos huesos que llegan de la raíz a la meta, doblándose hacia donde tira el polo (un punto) */
  function dosHuesos(raiz, meta, l1, l2, polo) {
    var d = menos(meta, raiz), dist = largo(d);
    var dir = unidad(d, [0, -1, 0]);
    var c = entre(dist, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
    var a = (l1 * l1 - l2 * l2 + c * c) / (2 * c), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    var lado = sinParte(menos(polo, raiz), dir);
    if (largo(lado) < 1e-4) lado = sinParte([0, 0, 1], dir);
    if (largo(lado) < 1e-4) lado = sinParte([1, 0, 0], dir);
    lado = unidad(lado);
    var medio = mas(raiz, mas(por(dir, a), por(lado, h)));
    return { medio: medio, fin: mas(medio, por(unidad(menos(mas(raiz, por(dir, c)), medio)), l2)) };
  }
  /* la dirección de un hueso colgante (de un brazo o un muslo) en la base de su padre:
     e, cuánto se levanta (0, cuelga; 90, horizontal; 180, arriba); z, hacia dónde (0, al frente;
     90, a su lado; 180, atrás) */
  function direccion(k, e, z) {
    var s = signo(k), se = Math.sin(e * RAD), ce = Math.cos(e * RAD), sz = Math.sin(z * RAD), cz = Math.cos(z * RAD);
    return { u: [s * se * sz, -ce, se * cz], b0: [s * ce * sz, se, ce * cz] };
  }

  /* el gesto de la mano, en números: cuánto se cierran los dedos (0, abierta; 1, puño), cuánto el índice,
     cuánto se abren en abanico y cuánto se levanta el pulgar. Así un gesto pasa a otro poco a poco. */
  var GESTO = { abierta: [0.04, 0.04, 1, 0], plana: [0.03, 0.03, 0.12, 0], suelta: [0.3, 0.26, 0.3, 0], puno: [1, 1, 0.2, 0], indice: [1, 0, 0.2, 0], pulgar: [1, 1, 0.2, 1] };
  /* el pie plantado: [x, z] es donde cae el tobillo; abre, cuánto apunta hacia fuera; talon, cuánto
     se levanta el talón (gira sobre la bola del pie); alto, si pisa sobre algo; rumbo, el del cuerpo */
  function piePlantado(k, f, rumbo) {
    var s = signo(k), ang = (rumbo || 0) + s * (f.abre || 0);
    var pt = [Math.sin(ang * RAD), 0, Math.cos(ang * RAD)], y0 = f.alto || 0, t = (f.talon || 0) * RAD;
    /* de puntillas gira sobre la bola, y la zapatilla se dobla por ahí: el antepié sigue plano en el suelo */
    var bola = [f.suelo[0] + pt[0] * D.bola, y0, f.suelo[1] + pt[2] * D.bola];
    var atras = por(pt, -1), arriba = [0, 1, 0];
    var tob = mas(bola, mas(por(mas(por(atras, Math.cos(t)), por(arriba, Math.sin(t))), D.bola), por(mas(por(arriba, Math.cos(t)), por(pt, Math.sin(t))), D.tobillo)));
    return { tob: tob, punta: unidad(mas(por(pt, Math.cos(t)), por(arriba, -Math.sin(t)))), arriba: unidad(mas(por(arriba, Math.cos(t)), por(pt, Math.sin(t)))), flex: Math.max(0, f.talon || 0) };
  }

  /* De la postura escrita al estado canónico: la pelvis, los ángulos de la columna y, de cada
     brazo y cada pierna, la dirección de sus dos huesos en la base de su padre. */
  /* lo que se escribe una vez para los dos lados (b, m, p, t): se escribe para el izquierdo y aquí se refleja para el derecho */
  function reflejo(q) {
    var r = {}, k;
    for (k in q) r[k] = q[k];
    if (q.a && q.en !== 'cuelga') r.a = [-q.a[0], q.a[1], q.a[2]];
    if (q.polo) r.polo = [-q.polo[0], q.polo[1], q.polo[2]];
    if (q.suelo) r.suelo = [-q.suelo[0], q.suelo[1]];
    if (q.punta) r.punta = [-q.punta[0], q.punta[1], q.punta[2]];
    if (q.arriba) r.arriba = [-q.arriba[0], q.arriba[1], q.arriba[2]];
    return r;
  }
  function deLado(P, pre, k) { return P[pre + k] || (P[pre] ? (k === 'i' ? P[pre] : reflejo(P[pre])) : null); }
  function estadoDe(P) {
    var S = {
      p: P.pel ? [P.pel[0], P.pel[1], P.pel[2]] : [0, D.pelvis, 0],
      B: P.base || baseDe(P.giro || [0, 0, 0]),     /* base: los tres ejes de la pelvis, dados directamente (tumbado de lado…) */
      col: (P.col || [0, 0, 0]).slice(), cab: (P.cab || [0, 0, 0]).slice(),
      hom: { i: ((P.hom && (P.hom.i || (P.hom.length ? P.hom : null))) || [0, 0]).slice(), d: ((P.hom && (P.hom.d || (P.hom.length ? P.hom : null))) || [0, 0]).slice() },
      b: {}, q: {}, m: {}, t: {}
    };
    var T = troncoDe(S);
    LADOS.forEach(function (k) {
      var s = signo(k);
      /* ── el brazo ── */
      var a = deLado(P, 'b', k) || { e: 7, z: 90, g: 90, c: 12 };
      var hom = mas(T.pt, aplicar(T.Bt, [s * D.hombroX, D.hombroY + S.hom[k][0], S.hom[k][1]]));
      if (a.cuelga) a = { a: mas(hom, [s * a.cuelga[0], -(a.largo || 50), a.cuelga[1]]), polo: a.polo || [s * 0.6, 0, -1] };
      if (a.a) {
        var marco = a.en === 'torax' ? T.Bt : a.en === 'pelvis' ? S.B : null;
        var meta = marco ? mas(a.en === 'torax' ? T.pt : S.p, aplicar(marco, a.a)) : a.a;
        var polo = a.polo || [s * 0.5, -1, -0.4];
        polo = marco ? aplicar(marco, polo) : polo;
        var r = dosHuesos(hom, meta, D.brazo, D.antebrazo, mas(hom, por(polo, 100)));
        S.b[k] = { u: aLocal(T.Bt, unidad(menos(r.medio, hom))), l: aLocal(T.Bt, unidad(menos(r.fin, r.medio))) };
      } else {
        var dd = direccion(k, a.e || 0, a.z || 0), g = (a.g || 0) * RAD;
        var bb = mas(por(dd.b0, Math.cos(g)), por(cruz(dd.u, dd.b0), s * Math.sin(g)));
        var c = (a.c || 0) * RAD;
        S.b[k] = { u: dd.u, l: unidad(mas(por(dd.u, Math.cos(c)), por(bb, Math.sin(c)))), b: bb };
      }
      /* ── la mano ── */
      var m = deLado(P, 'm', k) || {};
      var gm = GESTO[m.tipo] || GESTO.suelta;
      S.m[k] = { tipo: m.tipo || 'suelta', prono: m.prono || 0, mun: m.mun || 0, lat: m.lat || 0, c: gm[0], ci: gm[1], ab: gm[2], pu: gm[3] };
      /* ── la pierna ── */
      var q = deLado(P, 'p', k) || { suelo: [s * D.caderaX, 0], abre: 6 };
      var cad = mas(S.p, aplicar(S.B, [s * D.caderaX, 0, 0]));
      var pie = null, rumbo = (P.giro && P.giro[0]) || 0;
      if (q.suelo) { pie = piePlantado(k, q, q.rumbo == null ? rumbo : q.rumbo); q = { a: pie.tob, polo: q.polo, plantado: true }; }
      if (q.a) {
        var pq = q.polo || aplicar(S.B, [s * 0.25, 0.1, 1]);
        var rq = dosHuesos(cad, q.a, D.muslo, D.pierna, mas(cad, por(pq, 100)));
        S.q[k] = { u: aLocal(S.B, unidad(menos(rq.medio, cad))), l: aLocal(S.B, unidad(menos(rq.fin, rq.medio))) };
      } else {
        var dq = direccion(k, q.e || 0, q.z || 0), gq = (q.g || 0) * RAD;
        var bq = mas(por(dq.b0, Math.cos(gq)), por(cruz(dq.u, dq.b0), s * Math.sin(gq)));
        var cq = (q.c || 0) * RAD;
        S.q[k] = { u: dq.u, l: unidad(menos(por(dq.u, Math.cos(cq)), por(bq, Math.sin(cq)))), b: bq };
      }
      /* ── el pie: plantado (dos vectores del mundo) o suelto (el ángulo del tobillo) ── */
      var t = deLado(P, 't', k) || {};
      S.t[k] = pie ? { punta: pie.punta, arriba: pie.arriba, flex: pie.flex } : (t.punta ? { punta: unidad(t.punta), arriba: unidad(t.arriba || [0, 1, 0]), flex: t.flex || 0 } : { tob: t.tob == null ? 8 : t.tob, flex: t.flex || 0 });
    });
    return S;
  }
  /* la columna: media flexión en la lumbar y media en el tórax */
  function troncoDe(S) {
    var c = S.col, R = componer(giroY(c[2] * 0.5), componer(giroX(c[0] * 0.5), giroZ(-c[1] * 0.5)));
    var Bl = componer(S.B, R), Bt = componer(Bl, R);
    var pl = mas(S.p, aplicar(S.B, [0, D.lumbar, 0])), pt = mas(pl, aplicar(Bl, [0, D.torax, 0]));
    var h = S.cab, Bc = componer(Bt, componer(giroY(h[1] || 0), componer(giroX(h[0] || 0), giroZ(-(h[2] || 0)))));
    return { Bl: Bl, Bt: Bt, Bc: Bc, pl: pl, pt: pt, pcue: mas(pt, aplicar(Bt, [0, D.cuello, 0])), pcab: mas(pt, aplicar(Bt, [0, D.cabeza, 0])) };
  }
  /* la base de una mano: hacia dónde va, el eje de lo que agarra y hacia dónde mira la palma */
  function manoDe(k, uw, lw, bw, m) {
    var s = signo(k);
    var bis = cruz(uw, lw);
    if (largo(bis) < 0.05) bis = cruz(uw, bw || [0, 0, 1]);
    bis = unidad(bis, [1, 0, 0]);                 /* la bisagra del codo */
    var eje0 = unidad(cruz(bis, lw)), palma0 = por(bis, s);
    var pr = (m.prono || 0) * s;      /* prono > 0: la palma hacia atrás o hacia abajo; < 0: hacia delante o hacia arriba */
    var eje = girar(eje0, lw, pr), palma = girar(palma0, lw, pr);
    var dir = lw;
    if (m.mun) { dir = girar(lw, eje, -m.mun * s); palma = girar(palma, eje, -m.mun * s); }
    if (m.lat) { var ej2 = girar(eje, palma, m.lat); dir = girar(dir, palma, m.lat); eje = ej2; }
    return { dir: unidad(dir), eje: unidad(eje), palma: unidad(palma) };
  }

  /* Del estado canónico al esqueleto: cada articulación, en el mundo. */
  function armar(S) {
    var T = troncoDe(S);
    var E = { S: S, pel: S.p, Bp: S.B, Bl: T.Bl, Bt: T.Bt, Bc: T.Bc, lum: T.pl, tor: T.pt, cue: T.pcue, cab: T.pcab, i: {}, d: {} };
    LADOS.forEach(function (k) {
      var s = signo(k), L = E[k];
      L.hom = mas(T.pt, aplicar(T.Bt, [s * D.hombroX, D.hombroY + S.hom[k][0], S.hom[k][1]]));
      var uw = aplicar(T.Bt, S.b[k].u), lw = aplicar(T.Bt, S.b[k].l);
      L.cod = mas(L.hom, por(uw, D.brazo)); L.mun = mas(L.cod, por(lw, D.antebrazo));
      L.uw = uw; L.lw = lw;
      /* el frente del brazo (el bíceps): hacia donde se dobla el codo */
      var fb = sinParte(lw, uw), fb0 = unidad(sinParte(S.b[k].b ? aplicar(T.Bt, S.b[k].b) : aplicar(T.Bt, [0, 0, 1]), uw), [0, 0, 1]), wb = entre((largo(fb) - 0.04) / 0.3, 0, 1);
      L.frenteBrazo = unidad(mas(por(unidad(fb, fb0), wb), por(fb0, 1 - wb)), fb0);
      var M = manoDe(k, uw, lw, S.b[k].b ? aplicar(T.Bt, S.b[k].b) : null, S.m[k]);
      L.mano = M; L.agarre = mas(L.mun, por(M.dir, D.mano)); L.dedos = mas(L.mun, por(M.dir, D.dedos));
      L.cad = mas(S.p, aplicar(S.B, [s * D.caderaX, 0, 0]));
      var qu = aplicar(S.B, S.q[k].u), ql = aplicar(S.B, S.q[k].l);
      L.rod = mas(L.cad, por(qu, D.muslo)); L.tob = mas(L.rod, por(ql, D.pierna));
      L.qu = qu; L.ql = ql;
      /* el frente del muslo (el cuádriceps): al contrario de donde se dobla la rodilla */
      var fm = sinParte(por(ql, -1), qu), fm0 = unidad(sinParte(S.q[k].b ? aplicar(S.B, S.q[k].b) : aplicar(S.B, [0, 0, 1]), qu), [0, 0, 1]), wm = entre((largo(fm) - 0.04) / 0.3, 0, 1);
      L.frenteMuslo = unidad(mas(por(unidad(fm, fm0), wm), por(fm0, 1 - wm)), fm0);
      var t = S.t[k], punta, arriba;
      if (t.punta) { punta = t.punta; arriba = t.arriba; }
      else {
        /* el pie suelto sigue a la espinilla: el frente de la pierna, girado lo que diga el tobillo */
        var fr = sinParte(qu, ql);
        if (largo(fr) < 0.05) fr = sinParte(S.q[k].b ? aplicar(S.B, S.q[k].b) : aplicar(S.B, [0, 0, 1]), ql);
        fr = unidad(fr, [0, 0, 1]);
        if (punto(fr, mas(qu, por(ql, -1))) < 0 && largo(cruz(qu, ql)) > 0.05) fr = por(fr, -1);
        var a = (t.tob || 0) * RAD;
        punta = unidad(mas(por(fr, Math.cos(a)), por(ql, Math.sin(a)))); arriba = unidad(mas(por(ql, -Math.cos(a)), por(fr, Math.sin(a))));
      }
      var fp = sinParte(qu, ql), fp0 = unidad(sinParte(L.frenteMuslo, ql), [0, 0, 1]), wp = entre((largo(fp) - 0.04) / 0.3, 0, 1);
      L.frentePierna = unidad(mas(por(unidad(fp, fp0), wp), por(fp0, 1 - wp)), fp0);
      L.punta = punta; L.arriba = arriba; L.flex = t.flex || 0;
      L.suela = menos(L.tob, por(arriba, D.tobillo));
      L.talon = menos(L.suela, por(punta, D.talon)); L.dedosPie = mas(L.suela, por(punta, D.punta));
    });
    return E;
  }
  function resolver(P) { return armar(estadoDe(P)); }

  /* Entre dos esqueletos: la pelvis en línea recta, los giros por el camino corto y los huesos por arcos. */
  function mezclar(A, Bb, t) {
    var a = A.S, b = Bb.S;
    if (t <= 0) return A; if (t >= 1) return Bb;
    var S = { p: mezcla(a.p, b.p, t), B: mezclaBase(a.B, b.B, t), col: mezcla(a.col, b.col, t), cab: mezcla(a.cab, b.cab, t), hom: {}, b: {}, q: {}, m: {}, t: {} };
    LADOS.forEach(function (k) {
      S.hom[k] = [mezclaN(a.hom[k][0], b.hom[k][0], t), mezclaN(a.hom[k][1], b.hom[k][1], t)];
      S.b[k] = { u: arco(a.b[k].u, b.b[k].u, t), l: arco(a.b[k].l, b.b[k].l, t), b: a.b[k].b && b.b[k].b ? unidad(mezcla(a.b[k].b, b.b[k].b, t)) : (a.b[k].b || b.b[k].b) };
      S.q[k] = { u: arco(a.q[k].u, b.q[k].u, t), l: arco(a.q[k].l, b.q[k].l, t), b: a.q[k].b && b.q[k].b ? unidad(mezcla(a.q[k].b, b.q[k].b, t)) : (a.q[k].b || b.q[k].b) };
      var ma = a.m[k], mb = b.m[k];
      S.m[k] = { tipo: t < 0.5 ? ma.tipo : mb.tipo, prono: mezclaN(ma.prono, mb.prono, t), mun: mezclaN(ma.mun, mb.mun, t), lat: mezclaN(ma.lat, mb.lat, t),
                 c: mezclaN(ma.c, mb.c, t), ci: mezclaN(ma.ci, mb.ci, t), ab: mezclaN(ma.ab, mb.ab, t), pu: mezclaN(ma.pu, mb.pu, t) };
      var ta = a.t[k], tb = b.t[k];
      var fx = mezclaN(ta.flex || 0, tb.flex || 0, t);
      if (ta.punta && tb.punta) S.t[k] = { punta: arco(ta.punta, tb.punta, t), arriba: arco(ta.arriba, tb.arriba, t), flex: fx };
      else if (ta.punta || tb.punta) {
        /* de plantado a suelto (o al revés): por los vectores del mundo de cada extremo */
        S.t[k] = { punta: arco(A[k].punta, Bb[k].punta, t), arriba: arco(A[k].arriba, Bb[k].arriba, t), flex: fx };
      } else S.t[k] = { tob: mezclaN(ta.tob, tb.tob, t), flex: fx };
    });
    return armar(S);
  }
  /* Clava una mano o un pie en un punto del mundo: se vuelve a resolver ese miembro, doblándose
     hacia donde ya se doblaba. que: 'mi', 'md' (muñecas), 'ti', 'td' (tobillos). */
  function clavar(E, que, meta) {
    var k = que.charAt(1), L = E[k], S = E.S;
    if (que.charAt(0) === 'm') {
      var r = dosHuesos(L.hom, meta, D.brazo, D.antebrazo, L.cod);
      S.b[k] = { u: aLocal(E.Bt, unidad(menos(r.medio, L.hom))), l: aLocal(E.Bt, unidad(menos(r.fin, r.medio))), b: S.b[k].b };
    } else {
      var rq = dosHuesos(L.cad, meta, D.muslo, D.pierna, L.rod);
      S.q[k] = { u: aLocal(E.Bp, unidad(menos(rq.medio, L.cad))), l: aLocal(E.Bp, unidad(menos(rq.fin, rq.medio))), b: S.q[k].b };
    }
  }
  /* la muñeca que hace falta para que el centro del agarre caiga en un punto (la mano sigue al antebrazo) */
  function munecaPara(E, k, agarre) {
    var L = E[k], d = unidad(menos(agarre, L.cod), L.lw);
    return menos(agarre, por(d, D.mano));
  }
