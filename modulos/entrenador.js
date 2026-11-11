/* modulos/entrenador.js — Jérôme, el entrenador (11 de noviembre de 2026): el vídeo de cada
   ejercicio de «Su cuerpo». Lo pide modulos/cuerpo.js al abrir la ficha de un ejercicio;
   tools/fuente.js y tools/fuente.py lo pegan al final del fuente (CARGA-PEREZOSA).

   QUÉ ES
   No son archivos de vídeo: Jérôme (el presentador de modulos/guia.js, con cuerpo entero) es un
   dibujo vectorial que se mueve. Un esqueleto en tres dimensiones (en centímetros), una cámara
   y sus piezas pintadas de lejos a cerca. Cada ejercicio tiene su coreografía (COREO), hecha a
   partir de los pasos verificados de su ficha: no añade técnica que la ficha no diga. El vídeo es
   una cabecera (Jérôme saluda), un tramo por paso (el texto de la ficha, tal cual, en el idioma
   de la app; arriba, lo que ese paso describe) y un cierre. Sin conexión, sin bibliotecas.

   CÓMO SE USA
   TG_ENTRENADOR.tiene(id, nPasos) · TG_ENTRENADOR.montar(caja, datos, opc) → reproductor
   (reproducir, pausar, irA, tema, quitar) · TG_ENTRENADOR.ids() · .huellas · .textos (los diez idiomas).
   innerHTML solo recibe constantes de este fichero (dibujos e iconos); los textos de la ficha
   entran con textContent.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py juntando los trozos de tools/entrenador/src/. */
(function () {
  'use strict';
  /* ───────────────────────── núcleo: vectores, giros e interpolación ─────────────────────────
     El mundo va en centímetros. Jérôme mira hacia +Z, +Y es arriba y +X es SU izquierda (la
     derecha de la pantalla cuando se le ve de frente). Un giro es una base: tres vectores
     [X, Y, Z] con los ejes del hueso en el mundo. */
  var RAD = Math.PI / 180;
  function V(x, y, z) { return [x, y, z]; }
  function mas(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function menos(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function por(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function punto(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cruz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function largo(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
  function unidad(a, respaldo) { var l = largo(a); return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : (respaldo || [0, 1, 0]); }
  function mezcla(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function mezclaN(a, b, t) { return a + (b - a) * t; }
  function entre(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* lo que queda de a al quitarle su parte a lo largo de n (n, unidad) */
  function sinParte(a, n) { return menos(a, por(n, punto(a, n))); }
  /* gira v alrededor del eje (unidad) tantos grados */
  function girar(v, eje, g) {
    var c = Math.cos(g * RAD), s = Math.sin(g * RAD);
    return mas(mas(por(v, c), por(cruz(eje, v), s)), por(eje, punto(eje, v) * (1 - c)));
  }
  /* de un vector unidad a otro, por el arco (los brazos y las piernas se mueven en arcos) */
  function arco(a, b, t) {
    var d = entre(punto(a, b), -1, 1), w = Math.acos(d);
    if (w < 1e-4) return unidad(mezcla(a, b, t), a);
    if (w > Math.PI - 1e-3) {           /* opuestos: por un eje cualquiera, perpendicular */
      var e = unidad(cruz(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
      return girar(a, e, 180 * t);
    }
    var s = Math.sin(w);
    return mas(por(a, Math.sin((1 - t) * w) / s), por(b, Math.sin(t * w) / s));
  }

  /* ── bases ── */
  var BASE0 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  /* un punto local, al mundo */
  function aplicar(B, p) { return [B[0][0] * p[0] + B[1][0] * p[1] + B[2][0] * p[2], B[0][1] * p[0] + B[1][1] * p[1] + B[2][1] * p[2], B[0][2] * p[0] + B[1][2] * p[1] + B[2][2] * p[2]]; }
  /* un vector del mundo, a local */
  function aLocal(B, v) { return [punto(v, B[0]), punto(v, B[1]), punto(v, B[2])]; }
  /* A∘B: primero B (local), luego A */
  function componer(A, B) { return [aplicar(A, B[0]), aplicar(A, B[1]), aplicar(A, B[2])]; }
  function giroX(g) { var c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[1, 0, 0], [0, c, s], [0, -s, c]]; }
  function giroY(g) { var c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; }
  function giroZ(g) { var c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[c, s, 0], [-s, c, 0], [0, 0, 1]]; }
  /* la base de un cuerpo: rumbo (gira sobre la vertical; +, hacia su izquierda), cabeceo (+, se
     inclina hacia delante) y alabeo (+, se ladea hacia su izquierda) */
  function baseDe(r) { return componer(giroY(r[0] || 0), componer(giroX(r[1] || 0), giroZ(-(r[2] || 0)))); }
  /* la base de un cuerpo dado su eje largo (de la pelvis a la cabeza) y hacia dónde mira el pecho */
  function baseEjes(arriba, pecho) { var y = unidad(arriba), z = unidad(sinParte(pecho, y)); return [cruz(y, z), y, z]; }
  /* de una base a un cuaternión y vuelta, para ir de un giro a otro sin torcerse */
  function aCuat(B) {
    var m00 = B[0][0], m01 = B[1][0], m02 = B[2][0], m10 = B[0][1], m11 = B[1][1], m12 = B[2][1], m20 = B[0][2], m21 = B[1][2], m22 = B[2][2];
    var t = m00 + m11 + m22, s, q;
    if (t > 0) { s = Math.sqrt(t + 1) * 2; q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4]; }
    else if (m00 > m11 && m00 > m22) { s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
    else if (m11 > m22) { s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s]; }
    else { s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s]; }
    return q;
  }
  function deCuat(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return [[1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)],
            [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)],
            [2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)]];
  }
  function mezclaBase(A, B, t) {
    var a = aCuat(A), b = aCuat(B), d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
    var q;
    if (d > 0.9995) q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
    else {
      var w = Math.acos(d), s = Math.sin(w), ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
      q = [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb, a[3] * ka + b[3] * kb];
    }
    var n = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
    return deCuat([q[0] / n, q[1] / n, q[2] / n, q[3] / n]);
  }

  /* ── curvas de tiempo ── */
  var CURVA = {
    lineal: function (t) { return t; },
    suave: function (t) { return t * t * (3 - 2 * t); },
    muySuave: function (t) { return t * t * t * (t * (6 * t - 15) + 10); },
    sale: function (t) { return 1 - (1 - t) * (1 - t); },
    entra: function (t) { return t * t; },
    /* el empuje: arranca con fuerza y frena al llegar */
    empuje: function (t) { return 1 - Math.pow(1 - t, 2.4); },
    /* la bajada controlada: casi constante, con la entrada y la salida redondeadas */
    freno: function (t) { var s = t * t * (3 - 2 * t); return 0.55 * t + 0.45 * s; },
    rebote: function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };
  function quieto() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  var NS = 'http://www.w3.org/2000/svg';
  function n2(v) { return (Math.round(v * 100) / 100).toString(); }
  function n1(v) { return (Math.round(v * 10) / 10).toString(); }

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

  /* ───────────────────────── la cámara ─────────────────────────
     Ortográfica: rumbo (desde dónde se mira; 0, de frente; +90, desde su izquierda, y entonces
     mira hacia la izquierda de la pantalla), picado (cuánto se mira desde arriba) y escala. */
  function Camara() { this.rumbo = 0; this.picado = 9; this.esc = 2; this.ox = 200; this.oy = 300; this.mira = [0, 90, 0]; this.calc(); }
  Camara.prototype.calc = function () {
    var a = this.rumbo * RAD, f = this.picado * RAD;
    this.r = [Math.cos(a), 0, -Math.sin(a)];
    this.k = [Math.sin(a) * Math.cos(f), Math.sin(f), Math.cos(a) * Math.cos(f)];
    this.u = [-Math.sin(a) * Math.sin(f), Math.cos(f), -Math.cos(a) * Math.sin(f)];
  };
  /* un punto del mundo, a la pantalla: [x, y, fondo] (fondo mayor = más cerca) */
  Camara.prototype.p = function (q) {
    var d = menos(q, this.mira);
    return [this.ox + punto(d, this.r) * this.esc, this.oy - punto(d, this.u) * this.esc, punto(d, this.k)];
  };
  /* una dirección del mundo, a la pantalla (sin escala) */
  Camara.prototype.d = function (v) { return [punto(v, this.r), -punto(v, this.u), punto(v, this.k)]; };

  /* ───────────────────────── los colores de Jérôme ───────────────────────── */
  var C = {
    piel: '#f3c5a3', pielS: '#e2a683', pielSS: '#c98866', pielL: '#fde0c8', pielT: '#a9634a', rubor: '#f08c7c',
    pelo: '#aa834d', peloS: '#80602f', peloSS: '#5d4320', peloL: '#d6b274', ceja: '#7a5a2e',
    mont: '#17231e', montL: '#4d6b5f',
    cami: '#2c3140', camiS: '#1b1f29', camiL: '#4a5269', camiM: '#3a4054',
    boca: '#6e1f24', lengua: '#e2706f', diente: '#ffffff',
    pant: '#19b6a6', pantS: '#0e8a7e', pantL: '#3fd2c2', oro: '#F5C76B', oroS: '#D4AF37',
    zapa: '#f6f3ea', zapaS: '#d9d4c4', suela: '#1b1f29',
    /* el dibujo a tres tintas (sombra, medio, luz) y su línea */
    pielB: '#b9775a', pielLu: '#fbd8bb', camiB: '#11141b', camiSS: '#1c2029', camiLL: '#434b63', pantB: '#0a6a61', pantSS: '#0f9488',
    calc: '#fbfaf5', calcS: '#dcd8cc', calcB: '#b4ae9f', zapaB: '#a39d8c', zapaL: '#ffffff', media: '#ffffff', mediaS: '#e2ded2', piso: '#272c3a', pisoB: '#141821',
    n1: '#EE5F7E', n2: '#FFA04A', n3: '#FFE48A'
  };
  /* un color entre dos */
  function tinte(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), r = function (s) { return Math.round(((x >> s) & 255) + ((((y >> s) & 255) - ((x >> s) & 255)) * t)); };
    return '#' + ((1 << 24) + (r(16) << 16) + (r(8) << 8) + r(0)).toString(16).slice(1);
  }
  /* lo que queda del otro lado del cuerpo: un punto más oscuro y un pelo más frío, sin agrisarlo */
  function lejos(c) {
    var x = parseInt(c.slice(1), 16), r = (x >> 16) & 255, g = (x >> 8) & 255, b = x & 255;
    r = Math.round(r * 0.93); g = Math.round(g * 0.885); b = Math.round(b * 0.875);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + Math.min(255, b)).toString(16).slice(1);
  }

  function crear(tag, attrs, padre) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  /* pone un atributo solo si cambia */
  function pon(e, k, v) { var c = e._c || (e._c = {}); if (c[k] !== v) { c[k] = v; e.setAttribute(k, v); } }

  /* una curva suave por una lista de puntos [x, y] (Catmull-Rom → Bézier); devuelve los tramos «C …» */
  function curva(P, cerrada) {
    var n = P.length, s = '', i, p0, p1, p2, p3;
    for (i = 0; i < (cerrada ? n : n - 1); i++) {
      p0 = P[cerrada ? (i - 1 + n) % n : Math.max(0, i - 1)]; p1 = P[i % n]; p2 = P[(i + 1) % n]; p3 = P[cerrada ? (i + 2) % n : Math.min(n - 1, i + 2)];
      s += 'C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + n1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + n1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + n1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n1(p2[0]) + ',' + n1(p2[1]);
    }
    return s;
  }
  function elipse(cx, cy, rx, ry) {
    return 'M' + n1(cx - rx) + ',' + n1(cy) + ' a' + n1(rx) + ',' + n1(ry) + ' 0 1 0 ' + n1(2 * rx) + ',0 a' + n1(rx) + ',' + n1(ry) + ' 0 1 0 ' + n1(-2 * rx) + ',0z';
  }
  /* la envolvente de dos círculos (una cápsula que se estrecha) */
  function capsula(a, ra, b, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy);
    if (l < Math.abs(ra - rb) + 0.3) return ra >= rb ? elipse(a[0], a[1], ra, ra) : elipse(b[0], b[1], rb, rb);
    var ang = Math.atan2(dy, dx), be = Math.asin(entre((ra - rb) / l, -1, 1)), a1 = ang + Math.PI / 2 - be, a2 = ang - Math.PI / 2 + be;
    return 'M' + n1(a[0] + ra * Math.cos(a1)) + ',' + n1(a[1] + ra * Math.sin(a1)) + ' A' + n1(ra) + ',' + n1(ra) + ' 0 ' + (be > 0 ? 1 : 0) + ' 1 ' + n1(a[0] + ra * Math.cos(a2)) + ',' + n1(a[1] + ra * Math.sin(a2)) +
      ' L' + n1(b[0] + rb * Math.cos(a2)) + ',' + n1(b[1] + rb * Math.sin(a2)) + ' A' + n1(rb) + ',' + n1(rb) + ' 0 ' + (be > 0 ? 0 : 1) + ' 1 ' + n1(b[0] + rb * Math.cos(a1)) + ',' + n1(b[1] + rb * Math.sin(a1)) + 'z';
  }

  /* ───────────────────────── las formas: masas con volumen ─────────────────────────
     Cada pieza del cuerpo es una o varias MASAS: secciones elípticas [t, a, b, cs, cf] a lo largo de
     un hueso (t, a lo largo; a, el semiancho hacia fuera; b, el semifondo hacia delante; cs y cf, lo
     que se desplaza el centro). En cada cuadro se proyectan y se traza su envolvente: el contorno
     cambia con el punto de vista (el gemelo sobresale por detrás, el bíceps por delante).
     Y se pintan a tres tintas, con la luz arriba a la izquierda: la masa entera en sombra, encima
     lo que queda al recortarla con ella misma corrida hacia la luz (el tono medio) y, corrida más,
     la luz. Sin degradados: como un dibujo. */
  var K_EL = 14, COS_EL = [], SIN_EL = [];
  (function () { for (var i = 0; i < K_EL; i++) { COS_EL.push(Math.cos(i * 2 * Math.PI / K_EL)); SIN_EL.push(Math.sin(i * 2 * Math.PI / K_EL)); } })();
  var LUZ = [-0.5, -0.866];
  function lado2(a, b, p) { return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); }
  /* la envolvente convexa de unos puntos (antihoraria en sus números) */
  function envolvente(P) {
    P.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var n = P.length, H = [], k = 0, i, t;
    for (i = 0; i < n; i++) { while (k >= 2 && lado2(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
    for (i = n - 2, t = k + 1; i >= 0; i--) { while (k >= t && lado2(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
    H.length = Math.max(0, k - 1);
    return H;
  }
  /* S ∩ (S corrida dx, dy): lo que queda de una forma convexa al recortarla con ella misma desplazada */
  function recorte(S, dx, dy) {
    var out = S, n = S.length, i, j;
    for (i = 0; i < n && out.length; i++) {
      var ax = S[i][0] + dx, ay = S[i][1] + dy, bx = S[(i + 1) % n][0] + dx, by = S[(i + 1) % n][1] + dy, inp = out, m = inp.length;
      out = [];
      for (j = 0; j < m; j++) {
        var p = inp[j], q = inp[(j + 1) % m];
        var dp = (bx - ax) * (p[1] - ay) - (by - ay) * (p[0] - ax), dq = (bx - ax) * (q[1] - ay) - (by - ay) * (q[0] - ax);
        if (dp >= 0) out.push(p);
        if ((dp >= 0) !== (dq >= 0)) { var u = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]); }
      }
    }
    return out;
  }
  function poli(H) {
    if (H.length < 3) return '';
    var s = 'M' + n1(H[0][0]) + ',' + n1(H[0][1]);
    for (var i = 1; i < H.length; i++) s += 'L' + n1(H[i][0]) + ',' + n1(H[i][1]);
    return s + 'z';
  }
  /* la línea de una masa: su contorno, menos sus bocas (los tramos entre dos puntos de la misma boca),
     que es por donde se une a la pieza de al lado */
  function contorno(H) {
    var n = H.length, s = '', pluma = false, i;
    if (n < 3) return '';
    for (i = 0; i < n; i++) {
      var a = H[i], b = H[(i + 1) % n];
      if (a[2] && a[2] === b[2]) { pluma = false; continue; }
      if (!pluma) { s += 'M' + n1(a[0]) + ',' + n1(a[1]); pluma = true; }
      s += 'L' + n1(b[0]) + ',' + n1(b[1]);
    }
    return s;
  }
  /* los puntos de una sección (una elipse en el espacio), en la pantalla; m, la marca de boca */
  function anillo(P, c, ax, ay, bx, by, m) { for (var j = 0; j < K_EL; j++) P.push([c[0] + ax * COS_EL[j] + bx * SIN_EL[j], c[1] + ay * COS_EL[j] + by * SIN_EL[j], m || 0]); }
  /* una masa en el marco de un hueso: O, y los ejes e (a lo largo), s (hacia fuera) y f (al frente).
     tapas: 1, redondea el principio (media bola); 2, el final; 3, los dos.
     bocas: 1, el principio va sin línea (ahí se une a otra pieza); 2, el final; 3, los dos */
  function masa(cam, O, e, s, f, secc, tapas, bocas) {
    var o = cam.p(O), E2 = cam.d(e), S2 = cam.d(s), F2 = cam.d(f), esc = cam.esc, P = [], i, ult = secc.length - 1;
    var uno = function (t, a, b, cs, cf, m) {
      anillo(P, [o[0] + (E2[0] * t + S2[0] * cs + F2[0] * cf) * esc, o[1] + (E2[1] * t + S2[1] * cs + F2[1] * cf) * esc], S2[0] * a * esc, S2[1] * a * esc, F2[0] * b * esc, F2[1] * b * esc, m);
    };
    for (i = 0; i < secc.length; i++) uno(secc[i][0], secc[i][1], secc[i][2], secc[i][3] || 0, secc[i][4] || 0, (i === 0 && (bocas & 1) && !(tapas & 1)) ? 1 : (i === ult && (bocas & 2) && !(tapas & 2)) ? 2 : 0);
    if (tapas & 1) { var q = secc[0], m = Math.min(q[1], q[2]); uno(q[0] - m * 0.5, q[1] * 0.86, q[2] * 0.86, q[3] || 0, q[4] || 0); uno(q[0] - m * 0.88, q[1] * 0.46, q[2] * 0.46, q[3] || 0, q[4] || 0); }
    if (tapas & 2) { var z = secc[secc.length - 1], w = Math.min(z[1], z[2]); uno(z[0] + w * 0.5, z[1] * 0.86, z[2] * 0.86, z[3] || 0, z[4] || 0); uno(z[0] + w * 0.88, z[1] * 0.46, z[2] * 0.46, z[3] || 0, z[4] || 0); }
    return envolvente(P);
  }
  /* hacia dónde se corre la luz en una pieza alargada: de lado, hacia la luz. Devuelve [nx, ny, c]:
     la normal del lado de la luz y cuánto mira a ella (0, la pieza va en la dirección de la luz) */
  function haciaLuz(A, B) {
    var dx = B[0] - A[0], dy = B[1] - A[1], l = Math.sqrt(dx * dx + dy * dy);
    if (l < 3) return [LUZ[0], LUZ[1], 1];
    var nx = -dy / l, ny = dx / l, c = nx * LUZ[0] + ny * LUZ[1];
    if (c < 0) { nx = -nx; ny = -ny; c = -c; }
    return [nx, ny, Math.pow(c, 0.6)];
  }
  /* lo que se va trazando de una capa en un cuadro: la base, el tono medio y la luz */
  function Tintas() { this.c = ''; this.b = ''; this.m = ''; this.l = ''; }
  /* añade una masa: H, su envolvente; v, hacia la luz; r, su radio en la pantalla */
  Tintas.prototype.pon = function (H, v, r, conLuz) {
    if (H.length < 3) return;
    this.c += contorno(H); this.b += poli(H);
    var c = v[2], kS = r * 0.42;
    this.m += poli(recorte(H, (v[0] * c + LUZ[0] * (1 - c) * 0.6) * kS, (v[1] * c + LUZ[1] * (1 - c) * 0.6) * kS));
    if (conLuz) { var kL = r * (1.58 + 0.6 * (1 - c)); this.l += poli(recorte(H, v[0] * kL, v[1] * kL)); }
  };
  /* la mitad de un aro que queda de este lado: C, su centro; U y V, sus ejes (ya con su radio) */
  function aro(cam, C3, U, V, abre) {
    var th0 = Math.atan2(punto(V, cam.k), punto(U, cam.k)), c = cam.p(C3), U2 = cam.d(U), V2 = cam.d(V), esc = cam.esc, s = '', N = 9, ab = abre || 1.66;
    for (var i = 0; i <= N; i++) {
      var th = th0 - ab + 2 * ab * i / N, co = Math.cos(th), si = Math.sin(th);
      s += (i ? 'L' : 'M') + n1(c[0] + (U2[0] * co + V2[0] * si) * esc) + ',' + n1(c[1] + (U2[1] * co + V2[1] * si) * esc);
    }
    return s;
  }
  function linea(cam, pts) { var s = ''; for (var i = 0; i < pts.length; i++) { var p = cam.p(pts[i]); s += (i ? 'L' : 'M') + n1(p[0]) + ',' + n1(p[1]); } return s; }

  /* ── el cuerpo de Jérôme, en centímetros ──
     piel y tela: masas { s: secciones, t: tapas, r: su radio (para el grosor de la sombra) } */
  var CUERPO = {
    brazo: {
      piel: [{ s: [[0, 5.6, 5.8], [7, 6.3, 6.9, 0, 0.8], [14, 6.0, 6.5, 0, 0.7], [21, 5.1, 5.3], [27, 4.7, 4.9]], r: 5.8, une: 'fin' },
             { s: [[-0.4, 3.2, 3.5, 0.4, 0], [1.2, 5.0, 5.3, 0.9, 0], [3.4, 5.8, 6.1, 1.2, 0], [6, 6.0, 6.3, 1.3, 0], [9, 5.6, 5.9, 1.1, 0], [12.5, 4.5, 4.8, 0.7, 0]], r: 6, t: 0, b: 1 }],
      tela: [{ s: [[-1.2, 4.0, 4.3, 0.4, 0], [0.5, 5.7, 6.0, 0.9, 0], [3, 6.5, 6.8, 1.2, 0], [6, 6.7, 7.0, 1.3, 0.2], [9.5, 6.5, 6.9, 0.9, 0.4], [12.9, 6.3, 6.7, 0.4, 0.5]], r: 6.6, t: 0, b: 1 }]
    },
    ante: {
      piel: [{ s: [[0, 4.9, 5.1], [5, 5.5, 5.8, 0.4, 0.2], [11, 4.9, 4.9, 0.2, 0], [18, 3.8, 3.5], [24, 3.5, 3.0]], r: 4.8, une: 'ppio', une2: 'fin' }],
      tela: [{ s: [[18.4, 4.25, 3.95], [22.8, 4.05, 3.6]], t: 0, r: 4 }]           /* la muñequera (solo en la izquierda) */
    },
    muslo: {
      piel: [{ s: [[0, 9.0, 9.3], [8, 9.5, 10.2, 0, 0.9], [18, 8.7, 9.5, 0, 0.9], [28, 7.3, 7.9, 0, 0.5], [36, 6.3, 6.6], [40, 6.1, 6.3]], r: 8.2, une: 'fin' }],
      tela: [{ s: [[-4.5, 8.4, 8.6], [-1, 9.7, 9.9], [5, 10.3, 10.8, 0, 0.6], [12, 10.4, 11.1, 0, 0.9], [19.6, 10.7, 11.3, 0, 0.9]], r: 10.2, t: 0, b: 1 }]
    },
    pierna: {
      piel: [{ s: [[0, 6.1, 6.3], [4, 5.9, 6.2, 0, -0.4], [10, 6.3, 7.4, 0.2, -2.0], [17, 5.7, 6.4, 0.1, -1.7], [26, 4.3, 4.6, 0, -0.6], [33, 3.7, 3.9], [38, 3.6, 3.9]], r: 5.5, une: 'ppio', t: 2 },
             { s: [[-2.4, 3.3, 2.2, 0, 3.8], [0.8, 3.9, 2.7, 0, 4.0], [3.8, 3.1, 2.0, 0, 3.7]], t: 3, r: 3.4 }],       /* la rótula */
      tela: [{ s: [[30.4, 4.4, 4.6, 0, -0.2], [34, 4.2, 4.4], [38.8, 4.2, 4.5]], t: 0, b: 2, r: 4.2 }]                 /* el calcetín */
    }
  };
  /* las secciones del tronco: marco (p, pelvis; l, lumbar; t, tórax), altura, semiancho, semifondo y centro en z */
  var SECC = [
    ['p', -10, 8.6, 8.2, 0.4], ['p', -3.5, 17.6, 12.6, -1.6], ['p', 4.5, 16.2, 11.6, -0.8],
    ['l', 3.5, 14.4, 10.6, 0.0],
    ['t', 1.5, 15.8, 11.5, 0.7], ['t', 11.5, 18.8, 13.2, 1.7], ['t', 20.6, 21.2, 11.4, 0.5], ['t', 23.9, 14.6, 8.8, -0.2], ['t', 26.2, 8.6, 7.2, -0.6]
  ];

  /* los parches de músculo del tronco: sobre un plano pegado a la superficie de su marco.
     [grupo, marco, origen local, normal local, forma en el plano (x a lo ancho, y hacia arriba)] */
  var PARCHES = [
    ['pecho', 't', [8.2, 13.6, 11.6], [0.42, 0.1, 0.9], 'M-8,4 C-5.4,7 3.2,7.2 7.6,5 C9.3,1.8 8.9,-3.2 6,-5.8 C1.8,-7.8 -4.8,-6.9 -7.6,-3.7 C-8.7,-1.1 -8.7,1.7 -8,4z'],
    ['pecho', 't', [-8.2, 13.6, 11.6], [-0.42, 0.1, 0.9], 'M8,4 C5.4,7 -3.2,7.2 -7.6,5 C-9.3,1.8 -8.9,-3.2 -6,-5.8 C-1.8,-7.8 4.8,-6.9 7.6,-3.7 C8.7,-1.1 8.7,1.7 8,4z'],
    ['core', 'l', [0, 3, 10.8], [0, 0, 1], 'M-7,13.6 C-2.2,15 2.2,15 7,13.6 L7.4,-6.4 C4.4,-12.8 -4.4,-12.8 -7.4,-6.4z'],
    ['core', 'l', [12.3, 3, 5], [0.86, 0, 0.5], elipse(0, 2, 4.6, 10)],
    ['core', 'l', [-12.3, 3, 5], [-0.86, 0, 0.5], elipse(0, 2, 4.6, 10)],
    ['core', 'l', [0, 2, -10.2], [0, 0, -1], 'M-7.6,10.6 C-3.2,11.6 3.2,11.6 7.6,10.6 L6.5,-7.4 C2.2,-9.5 -2.2,-9.5 -6.5,-7.4z'],
    ['dorsal', 't', [9.6, 8, -9.6], [0.5, 0, -0.87], 'M7,9.5 C2.2,11.6 -5.4,10.6 -8.6,7.4 L-6,-10.6 C-2.2,-12.2 2.2,-10 4.3,-5.3 C6.5,0 8,5.3 7,9.5z'],
    ['dorsal', 't', [-9.6, 8, -9.6], [-0.5, 0, -0.87], 'M-7,9.5 C-2.2,11.6 5.4,10.6 8.6,7.4 L6,-10.6 C2.2,-12.2 -2.2,-10 -4.3,-5.3 C-6.5,0 -8,5.3 -7,9.5z'],
    ['espalda_alta', 't', [0, 17.4, -10.4], [0, 0.1, -1], 'M0,10 C5.4,8.4 11.8,5.4 16,3.6 C10.8,0.5 5.4,-4.3 0,-11.8 C-5.4,-4.3 -10.8,0.5 -16,3.6 C-11.8,5.4 -5.4,8.4 0,10z'],
    ['gluteos', 'p', [8, -2.5, -11.2], [0.45, 0, -0.9], elipse(0, 0, 8, 8.6)],
    ['gluteos', 'p', [-8, -2.5, -11.2], [-0.45, 0, -0.9], elipse(0, 0, 8, 8.6)],
    ['gluteos', 'p', [16.4, -2, -2.4], [1, 0, -0.1], elipse(0, 0, 6.5, 7.6)],
    ['gluteos', 'p', [-16.4, -2, -2.4], [-1, 0, -0.1], elipse(0, 0, 6.5, 7.6)]
  ];
  /* los de los miembros: un elipsoide pegado al hueso.
     [grupo, hueso, cara (1, delante; -1, detrás; 0, entero), centro a lo largo, hacia fuera, al frente, semiejes: largo, ancho, fondo] */
  var CALCOS = [
    ['hombros', 'brazo', 0, 2.6, 1.5, 0, 6.6, 5.6, 5.8],
    ['biceps', 'brazo', 1, 15, 0, 2.7, 8.4, 4.5, 3.7], ['triceps', 'brazo', -1, 15, 0, -2.0, 9.4, 4.5, 3.7],
    ['antebrazo', 'ante', 0, 9, 0.2, 0, 8.6, 4.3, 4.3],
    ['cuadriceps', 'muslo', 1, 20, 0, 4.2, 15, 7.3, 5.9], ['isquios', 'muslo', -1, 21, 0, -2.9, 14, 7.0, 5.6],
    ['pantorrilla', 'pierna', -1, 12.5, 0, -3.6, 9.6, 5.0, 4.0]
  ];
  var GRUPOS = ['pecho', 'dorsal', 'espalda_alta', 'hombros', 'biceps', 'triceps', 'antebrazo', 'core', 'gluteos', 'cuadriceps', 'isquios', 'pantorrilla'];

  var N_FIG = 0;
  /* ───────────────────────── Jérôme, de cuerpo entero ─────────────────────────
     Se crea una vez (sus piezas son nodos de SVG) y en cada cuadro se vuelven a trazar. */
  function Figura(defs) {
    var u = 'tge' + (++N_FIG), yo = this;
    this.u = u;
    var id = function (n) { return u + '-' + n; }, url = function (n) { return 'url(#' + u + '-' + n + ')'; };
    this.url = url;
    /* los músculos que trabajan: una mancha de calor (amarillo con borde naranja, como el nivel alto del maniquí) y, los secundarios, rosa */
    [['mus3', [[0, '#FFF6CF', 0.98], [0.42, C.n3, 0.95], [0.8, C.n2, 0.82], [1, C.n2, 0]]], ['mus1', [[0, '#FFA0B4', 0.86], [0.6, C.n1, 0.74], [1, C.n1, 0]]]].forEach(function (m) {
      var g = crear('radialGradient', { id: id(m[0]), cx: 0.5, cy: 0.5, r: 0.5 }, defs);
      m[1].forEach(function (p) { crear('stop', { offset: p[0], 'stop-color': p[1], 'stop-opacity': p[2] }, g); });
    });
    this.P = {};        /* las piezas: cada una, un nodo; en cada cuadro se le da su fondo para ordenarlas */
    var P = this.P;
    var grupo = function (n) { var g = crear('g', { 'class': 'tge-' + n }); g._t = []; g._mus = []; P[n] = g; return g; };
    /* una tinta: un trazo con su color (y, la de la base, con su línea, que se pinta por debajo) */
    var tinta = function (g, color, borde, padre) {
      var e = crear('path', { d: '', fill: color }, padre || g);
      e._col = color;
      if (borde) { e._bor = borde; e.setAttribute('stroke', borde); e.setAttribute('paint-order', 'stroke'); e.setAttribute('stroke-linejoin', 'round'); e._ancho = true; }
      g._t.push(e);
      return e;
    };
    /* una capa: la línea (debajo), la base en sombra, el tono medio y, si la lleva, la luz */
    var capa = function (g, tS, tM, tL, borde, padre) {
      var c = crear('path', { d: '', fill: 'none', stroke: borde, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, padre || g);
      c._bor = borde; c._ancho = true; g._t.push(c);
      return { c: c, b: tinta(g, tS, null, padre), m: tinta(g, tM, null, padre), l: tL ? tinta(g, tL, null, padre) : null };
    };
    var raya = function (g, color, extra) {
      var e = crear('path', { d: '', fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      e._bor = color; g._t.push(e);
      if (extra) for (var q in extra) e.setAttribute(q, extra[q]);
      return e;
    };
    var calcos = function (g, hueso) {
      CALCOS.forEach(function (m) {
        if (m[1] !== hueso) return;
        var e = crear('ellipse', { 'class': 'tge-mus', rx: 1, ry: 1, opacity: 0 }, g);
        e._g = m[0]; e._def = m; g._mus.push(e);
      });
    };
    this.mus = [];
    LADOS.forEach(function (k) {
      var g;
      /* el muslo: la piel, sus músculos y la pernera del pantalón, con su dobladillo y su raya */
      g = grupo('muslo' + k); g.piel = capa(g, C.pielS, C.piel, C.pielLu, C.pielB); calcos(g, 'muslo');
      g.tela = capa(g, C.pantSS, C.pant, C.pantL, C.pantB); g.dob = raya(g, C.pantB); g.raya = raya(g, C.oro);
      /* la pierna: la piel con la rótula, el gemelo y el calcetín con sus dos rayas */
      g = grupo('pierna' + k); g.piel = capa(g, C.pielS, C.piel, C.pielLu, C.pielB); calcos(g, 'pierna');
      g.tela = capa(g, C.calcS, C.calc, null, C.calcB); g.rayas = raya(g, C.pant);
      /* el brazo, con la manga */
      g = grupo('brazo' + k); g.piel = capa(g, C.pielS, C.piel, C.pielLu, C.pielB); calcos(g, 'brazo');
      g.tela = capa(g, C.camiSS, C.cami, C.camiLL, C.camiB); g.dob = raya(g, C.camiL);
      g = grupo('ante' + k); g.piel = capa(g, C.pielS, C.piel, C.pielLu, C.pielB); calcos(g, 'ante');
      if (k === 'i') { g.tela = capa(g, C.pantSS, C.pant, null, C.pantB); g.rayas = raya(g, '#f3fffd'); }
      /* la mano: la palma, cuatro dedos (cada uno con su línea) y el pulgar */
      g = grupo('mano' + k);
      g.gd = crear('g', null, g); g.gp = crear('g', null, g); g.gu = crear('g', null, g);
      g.dedos = [0, 1, 2, 3].map(function () { return tinta(g, C.piel, C.pielB, g.gd); });
      g.palma = capa(g, C.pielS, C.piel, null, C.pielB, g.gp);
      g.nud = raya(g, C.pielB); g.gp.appendChild(g.nud);
      g.pulgar = tinta(g, C.piel, C.pielB, g.gu);
      /* la zapatilla: el piso, la media suela, la pala y sus detalles */
      g = grupo('pie' + k);
      g.piso = tinta(g, C.piso, C.pisoB); g.media = capa(g, C.mediaS, C.media, null, C.zapaB);
      g.pala = capa(g, C.zapaS, C.zapa, C.zapaL, C.zapaB);
      g.talonera = tinta(g, C.pant, C.pantB); g.punt = raya(g, '#c4bfb1'); g.franja = raya(g, C.oroS); g.cordon = raya(g, C.pant);
    });
    /* el tronco: el pantalón, la camiseta (con su estampado y sus músculos) y el cuello */
    var tronco = function (n, tS, tM, borde, dentro) {
      var g = grupo(n);
      g.f = tinta(g, tS, borde);
      var cp = crear('clipPath', { id: id('c' + n) }, g); g.rec = crear('path', { d: '' }, cp);
      g.dentro = crear('g', { 'clip-path': url('c' + n) }, g);
      g.luz = tinta(g, tM, null, g.dentro);
      if (dentro) { var d = crear('g', null, g.dentro); d.innerHTML = dentro; g.estampa = d; }
      g.parches = crear('g', { 'class': 'tge-parches' }, g.dentro);
      return g;
    };
    var gp = tronco('pantalon', C.pantSS, C.pant, C.pantB);
    gp.cint = raya(gp, C.pantB);
    var gc = tronco('camiseta', C.camiSS, C.cami, C.camiB,
      '<path d="M-7.2,-3.6 L-2.6,2.9 L-0.6,4.7 L1.1,2.9 L3,4.4 L4.9,2.5 L8.6,-3.6z" fill="#f6f2e8"/>' +
      '<path d="M-2.6,2.9 L-0.6,4.7 L1.1,2.9 L3,4.4 L4.9,2.5 L3.2,1.5 L1.2,2.1 L-0.5,1.2z" fill="#ffffff"/>' +
      '<path d="M-8.4,-4.8 h18" stroke="' + C.oro + '" stroke-width="1" stroke-linecap="round"/>' +
      '<g fill="#ff7a45"><circle cx="-10" cy="0" r=".8"/><circle cx="-8" cy="2.9" r=".5"/><circle cx="10.4" cy=".4" r=".65"/><circle cx="8.1" cy="4.7" r=".45"/></g>' +
      '<g fill="#4fb3ff"><circle cx="11.3" cy="-2.6" r=".75"/><circle cx="-11.3" cy="-3.3" r=".55"/><circle cx="-4.8" cy="5.3" r=".4"/></g>');
    gc.bajo = raya(gc, C.camiB); gc.escote = raya(gc, C.camiLL); gc.escote2 = raya(gc, C.camiB); gc.dentro.appendChild(gc.escote); gc.dentro.appendChild(gc.escote2);
    var gn = grupo('cuello'); gn.piel = capa(gn, C.pielS, C.piel, null, C.pielB);
    /* los parches de músculo del tronco */
    this.parches = PARCHES.map(function (m) {
      var g = crear('g', { 'class': 'tge-mus', opacity: 0 }, (m[1] === 'p' ? gp : gc).parches);
      crear('path', { d: m[4] }, g);
      g._g = m[0];
      return { g: g, marco: m[1], o: m[2], n: unidad(m[3]) };
    });
    Object.keys(P).forEach(function (n) { P[n]._t.forEach(function (e) { if (e._col) e._colL = lejos(e._col); if (e._bor) e._borL = lejos(e._bor); }); });
    this.lejos = {};
    this.pulso = 1;          /* cuánto brillan los músculos ahora mismo (el motor lo sube en el esfuerzo) */
    this.aire = 0;           /* la respiración: de −1 a 1 (el motor la mueve) */
    this.musculos([], []);
  }
  /* qué músculos se encienden: principales (amarillo) y secundarios (rosa), como en el maniquí de la ficha */
  Figura.prototype.musculos = function (prim, sec) {
    var nv = {}, yo = this;
    (sec || []).forEach(function (g) { nv[g] = 1; });
    (prim || []).forEach(function (g) { nv[g] = 3; });
    var uno = function (e) { var q = nv[e._g] || 0; e._nivel = q; e.setAttribute('fill', yo.url(q === 3 ? 'mus3' : 'mus1')); e.style.display = q ? '' : 'none'; };
    Object.keys(this.P).forEach(function (n) { yo.P[n]._mus.forEach(uno); });
    this.parches.forEach(function (p) { uno(p.g); });
  };
  /* la pieza del otro lado, un punto más oscura: se le cambian las tintas */
  Figura.prototype.oscurecer = function (n, si) {
    if (this.lejos[n] === si) return;
    this.lejos[n] = si;
    this.P[n]._t.forEach(function (e) {
      if (e._col) e.setAttribute('fill', si ? e._colL : e._col);
      if (e._bor) e.setAttribute('stroke', si ? e._borL : e._bor);
    });
  };
  /* el ancho de la línea de una pieza, según la escala */
  function anchos(g, esc) {
    if (g._esc === esc) return;
    g._esc = esc;
    for (var i = 0; i < g._t.length; i++) if (g._t[i]._ancho) g._t[i].setAttribute('stroke-width', n2(1.2 * esc));
  }
  function vuelca(c, T) { pon(c.c, 'd', T.c); pon(c.b, 'd', T.b); pon(c.m, 'd', T.m); if (c.l) pon(c.l, 'd', T.l); }

  /* los músculos de un hueso: cada elipsoide, proyectado (una elipse) */
  function calcar(g, cam, O, e, s, f, pulso) {
    for (var i = 0; i < g._mus.length; i++) {
      var m = g._mus[i]; if (!m._nivel) continue;
      var d = m._def, cara = d[2], op = 1;
      if (cara) op = entre((punto(f, cam.k) * cara + 0.55) / 0.7, 0, 1);
      if (op <= 0.01) { pon(m, 'opacity', '0'); continue; }
      var c = cam.p(mas(O, mas(por(e, d[3]), mas(por(s, d[4]), por(f, d[5]))))), esc = cam.esc;
      var a1 = cam.d(e), a2 = cam.d(s), a3 = cam.d(f);
      var x1 = a1[0] * d[6], y1 = a1[1] * d[6], x2 = a2[0] * d[7], y2 = a2[1] * d[7], x3 = a3[0] * d[8], y3 = a3[1] * d[8];
      var m11 = x1 * x1 + x2 * x2 + x3 * x3, m22 = y1 * y1 + y2 * y2 + y3 * y3, m12 = x1 * y1 + x2 * y2 + x3 * y3;
      var md = (m11 + m22) / 2, df = Math.sqrt((m11 - m22) * (m11 - m22) / 4 + m12 * m12), ang = 0.5 * Math.atan2(2 * m12, m11 - m22) / RAD;
      pon(m, 'rx', n1(Math.sqrt(Math.max(0.01, md + df)) * esc)); pon(m, 'ry', n1(Math.sqrt(Math.max(0.01, md - df)) * esc));
      pon(m, 'transform', 'translate(' + n1(c[0]) + ',' + n1(c[1]) + ') rotate(' + n1(ang) + ')');
      pon(m, 'opacity', n2(op * (m._nivel === 3 ? 1 : 0.9) * pulso));
    }
  }

  /* Pinta el esqueleto E visto por la cámara: traza las piezas y deja en la lista lo que hay que ordenar. */
  Figura.prototype.pintar = function (E, cam, lista) {
    var P = this.P, esc = cam.esc, yo = this, pulso = this.pulso, aire = this.aire || 0;
    var bases = { p: [E.Bp, E.pel], l: [E.Bl, E.lum], t: [E.Bt, E.tor] };
    Object.keys(P).forEach(function (n) { anchos(P[n], esc); });
    /* ── el tronco: las secciones, proyectadas (el pecho se hincha un poco al respirar) ── */
    var cen = [], izq = [], der = [], i, n = SECC.length;
    for (i = 0; i < n; i++) cen.push(cam.p(mas(bases[SECC[i][0]][1], aplicar(bases[SECC[i][0]][0], [0, SECC[i][1], SECC[i][4] + (i === 5 ? aire * 0.5 : 0)]))));
    for (i = 0; i < n; i++) {
      var a = cen[Math.max(0, i - 1)], b = cen[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.sqrt(tx * tx + ty * ty) || 1;
      var nx = -ty / tl, ny = tx / tl, Bm = bases[SECC[i][0]][0], hin = (i === 5 || i === 4) ? 1 + aire * 0.022 : 1;
      var U = cam.d(Bm[0]), W = cam.d(Bm[2]), sa = SECC[i][2] * (i === 5 ? 1 + aire * 0.008 : 1), sb = SECC[i][3] * hin;
      var un = (U[0] * nx + U[1] * ny) * sa, wn = (W[0] * nx + W[1] * ny) * sb, r = Math.sqrt(un * un + wn * wn) || 1e-6;
      /* el punto de apoyo de la elipse en la dirección n */
      var sx = (U[0] * sa * un + W[0] * sb * wn) / r * esc, sy = (U[1] * sa * un + W[1] * sb * wn) / r * esc;
      izq.push([cen[i][0] + sx, cen[i][1] + sy]); der.push([cen[i][0] - sx, cen[i][1] - sy]);
    }
    /* el pantalón: de la entrepierna a la cintura, redondeado por abajo */
    var Lp = izq.slice(0, 4), Rp = der.slice(0, 4).reverse(), e0 = [cen[0][0] - cen[1][0], cen[0][1] - cen[1][1]];
    var dPan = 'M' + n1(Lp[0][0]) + ',' + n1(Lp[0][1]) + curva(Lp) + 'L' + n1(Rp[0][0]) + ',' + n1(Rp[0][1]) + curva(Rp) +
      'Q' + n1(cen[0][0] + e0[0] * 0.5) + ',' + n1(cen[0][1] + e0[1] * 0.5) + ' ' + n1(Lp[0][0]) + ',' + n1(Lp[0][1]) + 'z';
    var gp = P.pantalon, gc = P.camiseta, lx = LUZ[0] * esc, ly = LUZ[1] * esc;
    pon(gp.f, 'd', dPan); pon(gp.rec, 'd', dPan); pon(gp.luz, 'd', dPan); pon(gp.luz, 'transform', 'translate(' + n1(lx * 2.6) + ',' + n1(ly * 2.6) + ')');
    /* la camiseta: de un poco por debajo de la cintura al cuello */
    var bajo = [izq[2][0] * 0.7 + izq[3][0] * 0.3, izq[2][1] * 0.7 + izq[3][1] * 0.3], bajoD = [der[2][0] * 0.7 + der[3][0] * 0.3, der[2][1] * 0.7 + der[3][1] * 0.3];
    var L2 = [bajo].concat(izq.slice(3)), R2 = der.slice(3).reverse().concat([bajoD]);
    var qx = (bajo[0] + bajoD[0]) / 2 + (cen[2][0] - cen[3][0]) * 0.42, qy = (bajo[1] + bajoD[1]) / 2 + (cen[2][1] - cen[3][1]) * 0.42;
    var dCam = 'M' + n1(L2[0][0]) + ',' + n1(L2[0][1]) + curva(L2) + 'L' + n1(R2[0][0]) + ',' + n1(R2[0][1]) + curva(R2) + 'Q' + n1(qx) + ',' + n1(qy) + ' ' + n1(bajo[0]) + ',' + n1(bajo[1]) + 'z';
    pon(gc.f, 'd', dCam); pon(gc.rec, 'd', dCam); pon(gc.luz, 'd', dCam); pon(gc.luz, 'transform', 'translate(' + n1(lx * 3.3) + ',' + n1(ly * 3.3) + ')');
    /* el bajo de la camiseta, con su pespunte */
    pon(gc.bajo, 'd', 'M' + n1(bajoD[0]) + ',' + n1(bajoD[1]) + 'Q' + n1(qx) + ',' + n1(qy - 1.5 * esc) + ' ' + n1(bajo[0]) + ',' + n1(bajo[1])); pon(gc.bajo, 'stroke-width', n2(0.7 * esc)); pon(gc.bajo, 'opacity', '.7');
    /* el cuello de la camiseta: un aro inclinado, y se ve la mitad de este lado */
    var Bt = E.Bt, oc = mas(E.tor, aplicar(Bt, [0, 24.6, 0.4])), uc = por(Bt[0], 7.7), vc = mas(por(Bt[2], 7.0), por(Bt[1], -2.5));
    var dEsc = aro(cam, oc, uc, vc, 1.75);
    pon(gc.escote, 'd', dEsc); pon(gc.escote, 'stroke-width', n2(2.3 * esc)); pon(gc.escote2, 'd', dEsc); pon(gc.escote2, 'stroke-width', n2(0.5 * esc)); pon(gc.escote2, 'opacity', '.55');
    /* el estampado: un plano pegado al pecho */
    var kt = cam.d(Bt[2])[2], est = gc.estampa;
    if (kt > 0.1) {
      var o = cam.p(mas(E.tor, aplicar(Bt, [0, 9.2, 13.0 + aire * 0.5]))), X = cam.d(Bt[0]), Y = cam.d(Bt[1]), ke = esc * 0.92;
      pon(est, 'transform', 'matrix(' + n2(X[0] * ke) + ',' + n2(X[1] * ke) + ',' + n2(Y[0] * ke) + ',' + n2(Y[1] * ke) + ',' + n1(o[0]) + ',' + n1(o[1]) + ')');
      pon(est, 'opacity', n2(entre((kt - 0.1) * 2.4, 0, 1)));
    } else pon(est, 'opacity', '0');
    /* los músculos del tronco: cada parche, en su plano */
    for (i = 0; i < this.parches.length; i++) {
      var pa = this.parches[i], nv = pa.g._nivel;
      if (!nv) continue;
      var Bq = bases[pa.marco][0], nw = aplicar(Bq, pa.n), ve = punto(nw, cam.k);
      if (ve < 0.06) { pon(pa.g, 'opacity', '0'); continue; }
      var ey = unidad(sinParte(Bq[1], nw)), ex = cruz(ey, nw), o2 = cam.p(mas(bases[pa.marco][1], aplicar(Bq, pa.o))), X2 = cam.d(ex), Y2 = cam.d(ey);
      pon(pa.g, 'transform', 'matrix(' + n2(X2[0] * esc) + ',' + n2(X2[1] * esc) + ',' + n2(Y2[0] * esc) + ',' + n2(Y2[1] * esc) + ',' + n1(o2[0]) + ',' + n1(o2[1]) + ')');
      pon(pa.g, 'opacity', n2(entre(ve * 1.7, 0, 1) * (nv === 3 ? 1 : 0.9) * pulso));
    }
    var zTor = cam.p(mas(E.tor, aplicar(Bt, [0, 11, 0])))[2], zPel = cam.p(E.pel)[2];
    lista.push({ z: zPel, el: gp }, { z: zTor + 0.4, el: gc });
    /* el cuello: una masa, con la sombra de la barbilla arriba */
    var n0 = mas(E.tor, aplicar(Bt, [0, 23.2, -0.5])), n1v = mas(E.cab, aplicar(E.Bc, [0, 4, 0.4])), en = menos(n1v, n0), ln = largo(en) || 1;
    en = por(en, 1 / ln);
    var fn = unidad(sinParte(Bt[2], en), [0, 0, 1]), sn = cruz(en, fn), gn = P.cuello;
    var Hn = masa(cam, n0, en, sn, fn, [[-1, 6.2, 5.9], [ln * 0.5, 5.5, 5.5], [ln + 1, 5.3, 5.6]], 0, 3), c1 = cam.p(n0), c2 = cam.p(n1v);
    var dnx = c1[0] - c2[0], dny = c1[1] - c2[1], dnl = Math.sqrt(dnx * dnx + dny * dny) || 1;
    pon(gn.piel.c, 'd', contorno(Hn)); pon(gn.piel.b, 'd', poli(Hn)); pon(gn.piel.m, 'd', poli(recorte(Hn, dnx / dnl * 4.6 * esc, dny / dnl * 4.6 * esc)));
    lista.push({ z: Math.min((c1[2] + c2[2]) / 2 - 0.5, zTor + 0.3), el: gn });

    /* ── los brazos y las piernas ── */
    var zc = { i: cam.p(E.i.cad)[2], d: cam.p(E.d.cad)[2] }, zh = { i: cam.p(E.i.hom)[2], d: cam.p(E.d.hom)[2] };
    LADOS.forEach(function (k) {
      var L = E[k], o = k === 'i' ? 'd' : 'i', sg = k === 'i' ? -1 : 1;
      /* del otro lado y por detrás: un punto más oscuro (con un margen, para que no parpadee) */
      var lp = zc[o] - zc[k], lb = zh[o] - zh[k];
      var farP = yo.lejos['muslo' + k] ? lp > 3 : lp > 6, farB = yo.lejos['brazo' + k] ? lb > 4 : lb > 8;
      ['muslo', 'pierna', 'pie'].forEach(function (q) { yo.oscurecer(q + k, farP); });
      ['brazo', 'ante', 'mano'].forEach(function (q) { yo.oscurecer(q + k, farB); });
      var cad = cam.p(L.cad), rod = cam.p(L.rod), tob = cam.p(L.tob), hom = cam.p(L.hom), cod = cam.p(L.cod), mun = cam.p(L.mun);
      /* Una pieza: su piel y su tela, masa a masa. La bola de una articulación (la rodilla, el codo, la
         muñeca) es de la pieza que se pinta primero; la otra llega a ella con boca, sin línea. bolaP y
         bolaF dicen si esta pieza lleva la del principio y la del final. */
      var pieza = function (g, def, O, e, f, A2, B2, bolaP, bolaF) {
        var s = por(unidad(cruz(e, f), [1, 0, 0]), sg), v = haciaLuz(A2, B2), T = new Tintas(), j, q, tp, bc;
        for (j = 0; j < def.piel.length; j++) {
          q = def.piel[j];
          if (q.une) { tp = (bolaP ? 1 : 0) | (bolaF ? 2 : 0); bc = 3 & ~tp; } else { tp = q.t || 0; bc = q.b || 0; }
          T.pon(masa(cam, O, e, s, f, q.s, tp, bc), v, q.r * esc, true);
        }
        vuelca(g.piel, T);
        calcar(g, cam, O, e, s, f, pulso);
        if (g.tela) {
          T = new Tintas();
          for (j = 0; j < def.tela.length; j++) T.pon(masa(cam, O, e, s, f, def.tela[j].s, def.tela[j].t || 0, def.tela[j].b || 0), v, def.tela[j].r * esc, !!g.tela.l);
          vuelca(g.tela, T);
        }
        return s;
      };
      var gm = P['muslo' + k], gq = P['pierna' + k], gb = P['brazo' + k], ga = P['ante' + k], s;
      var zM = (cad[2] + rod[2]) / 2, zQ = (rod[2] + tob[2]) / 2 - 0.2, zB = (hom[2] + cod[2]) / 2 + 0.6, zA = (cod[2] + mun[2]) / 2 + 0.8, zMano = cam.p(L.agarre)[2] + 1.6;
      /* el muslo: el dobladillo de la pernera y la raya dorada, por fuera */
      s = pieza(gm, CUERPO.muslo, L.cad, L.qu, L.frenteMuslo, cad, rod, false, zM <= zQ);
      var om = mas(L.cad, mas(por(L.qu, 20.5), por(L.frenteMuslo, 0.9)));
      pon(gm.dob, 'd', aro(cam, om, por(s, 11.0), por(L.frenteMuslo, 11.5), 1.5)); pon(gm.dob, 'stroke-width', n2(1.5 * esc)); pon(gm.dob, 'opacity', '.55');
      var vr = punto(s, cam.k);
      if (vr > -0.3) {
        pon(gm.raya, 'd', linea(cam, [mas(L.cad, mas(por(L.qu, -1.5), por(s, 9.9))), mas(L.cad, mas(por(L.qu, 6), mas(por(s, 10.9), por(L.frenteMuslo, 0.6)))), mas(L.cad, mas(por(L.qu, 13), mas(por(s, 11.0), por(L.frenteMuslo, 0.9)))), mas(L.cad, mas(por(L.qu, 19.6), mas(por(s, 11.0), por(L.frenteMuslo, 0.9))))]));
        pon(gm.raya, 'stroke-width', n2(1.5 * esc)); pon(gm.raya, 'opacity', n2(entre((vr + 0.3) * 2.4, 0, 1)));
      } else pon(gm.raya, 'opacity', '0');
      /* la pierna: las dos rayas del calcetín */
      s = pieza(gq, CUERPO.pierna, L.rod, L.ql, L.frentePierna, rod, tob, zQ < zM, false);
      pon(gq.rayas, 'd', aro(cam, mas(L.rod, por(L.ql, 31.9)), por(s, 4.55), por(L.frentePierna, 4.75), 1.5) + aro(cam, mas(L.rod, por(L.ql, 33.7)), por(s, 4.45), por(L.frentePierna, 4.65), 1.5));
      pon(gq.rayas, 'stroke-width', n2(0.95 * esc));
      /* el brazo: el dobladillo de la manga */
      s = pieza(gb, CUERPO.brazo, L.hom, L.uw, L.frenteBrazo, hom, cod, false, zB <= zA);
      pon(gb.dob, 'd', aro(cam, mas(L.hom, mas(por(L.uw, 13.2), mas(por(s, 0.5), por(L.frenteBrazo, 0.5)))), por(s, 6.6), por(L.frenteBrazo, 7.0), 1.5)); pon(gb.dob, 'stroke-width', n2(1.2 * esc)); pon(gb.dob, 'opacity', '.8');
      s = pieza(ga, CUERPO.ante, L.cod, L.lw, L.frenteBrazo, cod, mun, zA < zB, zA <= zMano);
      if (ga.rayas) { pon(ga.rayas, 'd', aro(cam, mas(L.cod, por(L.lw, 20.6)), por(s, 4.1), por(L.frenteBrazo, 3.7), 1.5)); pon(ga.rayas, 'stroke-width', n2(0.9 * esc)); }
      lista.push({ z: zM, el: gm, pts: [L.cad, L.rod] }, { z: zQ, el: gq, pts: [L.rod, L.tob] }, { z: zB, el: gb, pts: [L.hom, L.cod] }, { z: zA, el: ga, pts: [L.cod, L.mun] });
      yo.mano(k, L, cam, lista, E.S.m[k], zMano < zA);
      yo.pie(k, L, cam, lista);
    });
  };

  /* ── la mano ──
     La palma es una masa; cada dedo, tres falanges que se doblan hacia la palma; el pulgar, dos.
     Según el gesto: abierta, suelta, puño (también agarrando), índice (los demás, cerrados) y pulgar. */
  var DEDOS = [[3.15, 6.7, 1.14, 7], [1.05, 7.6, 1.17, 1.5], [-1.05, 7.1, 1.1, -4], [-3.0, 5.6, 0.97, -10]];     /* a un lado, largo, grosor, abanico */
  var ABRE = [4, 4, 2], CIERRA = [80, 96, 60];
  Figura.prototype.mano = function (k, L, cam0, lista, M, bola) {
    var g = this.P['mano' + k], KM = 1.12, m = L.mano, W = L.mun, dir = m.dir, eje = m.eje, pal = m.palma;
    /* la mano, un punto más grande que la del esqueleto (es un dibujo): todo crece desde la muñeca */
    var cam = { p: function (q) { return cam0.p(mas(W, por(menos(q, W), KM))); }, d: function (v) { return cam0.d(v); }, k: cam0.k, esc: cam0.esc * KM }, esc = cam.esc;
    var c = M.c == null ? 0.3 : M.c, ci = M.ci == null ? c : M.ci, abn = M.ab == null ? 0.3 : M.ab, pu = M.pu || 0;
    var deCara = punto(pal, cam.k) >= 0;
    /* la palma mira a la cámara: los dedos y el pulgar, por encima; si no, por debajo */
    if (g._cara !== deCara) { g._cara = deCara; if (deCara) { g.appendChild(g.gd); g.appendChild(g.gu); } else { g.insertBefore(g.gd, g.gp); g.insertBefore(g.gu, g.gp); } }
    var a2 = cam.p(W), b2 = cam.p(L.dedos), v = haciaLuz(a2, b2);
    var Hp = masa(cam, W, dir, eje, pal, [[0, 3.2, 2.4], [3, 4.1, 2.1, 0.1, 0], [6.6, 4.55, 1.85], [9.1, 4.3, 1.5]], bola ? 3 : 2, bola ? 0 : 1);
    var T = new Tintas(); T.pon(Hp, v, 3.6 * esc, false); vuelca(g.palma, T);
    for (var f = 0; f < 4; f++) {
      var q = DEDOS[f], cf = f === 0 ? ci : c;
      var ab = q[3] * abn * RAD, base = mas(W, mas(por(dir, 9.0 - Math.abs(f - 1.3) * 0.45), por(eje, q[0])));
      var d0 = mas(por(dir, Math.cos(ab)), por(eje, Math.sin(ab))), acum = 0, p = base, s = '', lf = [0.44, 0.31, 0.25];
      for (var j = 0; j < 3; j++) {
        acum += (ABRE[j] + (CIERRA[j] - ABRE[j]) * cf) * RAD;
        var dd = mas(por(d0, Math.cos(acum)), por(pal, Math.sin(acum))), p2 = mas(p, por(dd, q[1] * lf[j]));
        s += capsula(cam.p(p), q[2] * (1 - j * 0.07) * esc, cam.p(p2), q[2] * (0.93 - j * 0.07) * esc);
        p = p2;
      }
      pon(g.dedos[f], 'd', s);
    }
    /* el pulgar: abierto hacia su lado, cruzado por delante del puño o levantado; entre uno y otro, lo que toque */
    var u0 = mas(W, mas(por(dir, 2.7), mas(por(eje, 3.3), por(pal, 0.7))));
    var wU = pu, wF = c * (1 - pu), wA = (1 - c) * (1 - pu);
    var pto = function (aD, aE, aP, fD, fE, fP, uD, uE, uP) { return mas(W, mas(por(dir, aD * wA + fD * wF + uD * wU), mas(por(eje, aE * wA + fE * wF + uE * wU), por(pal, aP * wA + fP * wF + uP * wU)))); };
    var u1 = pto(5.1, 6.3, 0.7, 5.6, 4.0, 2.4, 3.2, 7.3, 0.7), u2 = pto(7.4, 8.7, 0.7, 8.2, 0.9, 3.7, 3.0, 11.0, 0.7);
    pon(g.pulgar, 'd', capsula(cam.p(u0), 1.75 * esc, cam.p(u1), 1.4 * esc) + capsula(cam.p(u1), 1.4 * esc, cam.p(u2), 1.18 * esc));
    /* los nudillos, si se ve el dorso */
    var nd = '';
    if (!deCara) for (f = 0; f < 4; f++) { var nb = mas(W, mas(por(dir, 8.9 - Math.abs(f - 1.3) * 0.45), mas(por(eje, DEDOS[f][0]), por(pal, -1.3)))); nd += linea(cam, [mas(nb, por(eje, -0.6)), mas(nb, por(dir, 0.5)), mas(nb, por(eje, 0.6))]); }
    pon(g.nud, 'd', nd); pon(g.nud, 'stroke-width', n2(0.42 * esc)); pon(g.nud, 'opacity', '.6');
    lista.push({ z: cam0.p(L.agarre)[2] + 1.6, el: g, pts: [L.mun, L.dedos] });
  };

  /* ── la zapatilla ──
     Tres masas (el piso, la media suela y la pala) en el marco del pie. Se dobla por la bola: de
     puntillas, el antepié sigue plano en el suelo. Y sus detalles: la puntera, la talonera, la
     franja y los cordones. */
  var ZAPA = {
    piso: [[-6.5, 3.3, 0.75, 0.75], [-3, 4.0, 0.75, 0.75], [4, 4.3, 0.75, 0.75], [12, 5.0, 0.75, 0.75], [16.6, 4.4, 0.7, 0.85], [19.3, 2.6, 0.6, 1.3]],
    media: [[-6.8, 3.5, 1.5, 2.6], [-3, 4.2, 1.6, 2.7], [4, 4.4, 1.35, 2.45], [12, 5.1, 1.05, 2.05], [16.6, 4.5, 0.95, 2.1], [19.5, 2.7, 0.8, 2.4]],
    pala: [[-6.1, 3.1, 3.0, 6.3], [-3.6, 3.8, 4.0, 7.0], [1.5, 4.0, 3.7, 6.7], [6.5, 4.3, 3.0, 5.7], [11.5, 4.7, 2.45, 4.8], [15.6, 4.4, 2.0, 4.15], [18.8, 2.9, 1.5, 3.45]]
  };
  /* lo más bajo de la zapatilla tal como se dibuja (la altura, en el mundo, del punto más bajo de su piso): lo usa
     tools/auditar_entrenador.js para comprobar que pisa y no se hunde. Plana en el suelo, da 0. */
  function bajoZapa(L, k) {
    var sg = k === 'i' ? 1 : -1, fl = (L.flex || 0) * RAD, cf = Math.cos(fl), sf = Math.sin(fl);
    var lado = por(unidad(cruz(L.arriba, L.punta), [1, 0, 0]), sg), bola = mas(L.suela, por(L.punta, D.bola));
    var pf = mas(por(L.punta, cf), por(L.arriba, sf)), af = mas(por(L.arriba, cf), por(L.punta, -sf)), min = 1e9;
    ZAPA.piso.forEach(function (q) {
      var atras = q[0] <= D.bola, U = atras ? L.arriba : af;
      var c = atras ? mas(L.suela, mas(por(L.punta, q[0]), por(L.arriba, q[3]))) : mas(bola, mas(por(pf, q[0] - D.bola), por(af, q[3])));
      min = Math.min(min, c[1] - Math.sqrt(lado[1] * lado[1] * q[1] * q[1] + U[1] * U[1] * q[2] * q[2]));
    });
    return min;
  }
  Figura.prototype.pie = function (k, L, cam, lista) {
    var g = this.P['pie' + k], esc = cam.esc, sg = k === 'i' ? 1 : -1;
    var fl = (L.flex || 0) * RAD, cf = Math.cos(fl), sf = Math.sin(fl);
    var lado = por(unidad(cruz(L.arriba, L.punta), [1, 0, 0]), sg), bola = mas(L.suela, por(L.punta, D.bola));
    var pf = mas(por(L.punta, cf), por(L.arriba, sf)), af = mas(por(L.arriba, cf), por(L.punta, -sf));       /* el antepié, doblado */
    var L2 = cam.d(lado), A2 = cam.d(L.arriba), F2 = cam.d(af);
    /* un punto de la zapatilla: t a lo largo, h de alto, w a un lado */
    var pt = function (t, h, w) {
      return t <= D.bola ? mas(L.suela, mas(por(L.punta, t), mas(por(L.arriba, h), por(lado, w || 0)))) : mas(bola, mas(por(pf, t - D.bola), mas(por(af, h), por(lado, w || 0))));
    };
    var nube = function (secc) {
      var P = [];
      for (var i = 0; i < secc.length; i++) {
        var q = secc[i], c = cam.p(pt(q[0], q[3])), U2 = q[0] <= D.bola ? A2 : F2;
        anillo(P, c, L2[0] * q[1] * esc, L2[1] * q[1] * esc, U2[0] * q[2] * esc, U2[1] * q[2] * esc);
      }
      return envolvente(P);
    };
    var t2 = cam.p(pt(-6, 3)), p2 = cam.p(pt(19, 3)), v = haciaLuz(t2, p2), T;
    pon(g.piso, 'd', poli(nube(ZAPA.piso)));
    T = new Tintas(); T.pon(nube(ZAPA.media), v, 2.2 * esc, false); vuelca(g.media, T);
    T = new Tintas(); T.pon(nube(ZAPA.pala), v, 4.2 * esc, true); vuelca(g.pala, T);
    /* la talonera */
    var Pt = []; anillo(Pt, cam.p(pt(-6.2, 7.2)), L2[0] * 2.3 * esc, L2[1] * 2.3 * esc, A2[0] * 2.5 * esc, A2[1] * 2.5 * esc); anillo(Pt, cam.p(pt(-4.6, 7.4)), L2[0] * 2.9 * esc, L2[1] * 2.9 * esc, A2[0] * 2.7 * esc, A2[1] * 2.7 * esc);
    pon(g.talonera, 'd', punto(L.punta, cam.k) < 0.35 ? poli(envolvente(Pt)) : '');
    /* la puntera: una costura que cruza por delante */
    pon(g.punt, 'd', aro(cam, pt(14.6, 4.2), por(lado, 4.5), por(fl ? af : L.arriba, 2.1), 1.5)); pon(g.punt, 'stroke-width', n2(0.6 * esc));
    /* la franja, por el lado que se ve */
    var vl = punto(lado, cam.k), ws = vl >= 0 ? 1 : -1;
    if (Math.abs(vl) > 0.2) {
      pon(g.franja, 'd', linea(cam, [pt(-1.5, 4.3, ws * 4.15), pt(3.5, 4.5, ws * 4.3), pt(8.6, 5.6, ws * 4.2)]));
      pon(g.franja, 'stroke-width', n2(1.25 * esc)); pon(g.franja, 'opacity', n2(entre((Math.abs(vl) - 0.2) * 3, 0, 1)));
    } else pon(g.franja, 'opacity', '0');
    /* los cordones, por arriba */
    var va = punto(L.arriba, cam.k), dc = '';
    if (va > -0.25) { for (var j = 0; j < 3; j++) { var tt = 3.6 + j * 2.5, hh = 10.3 - j * 1.35; dc += linea(cam, [pt(tt, hh - 0.9, -1.9), pt(tt + 0.5, hh, 0), pt(tt, hh - 0.9, 1.9)]); } }
    pon(g.cordon, 'd', dc); pon(g.cordon, 'stroke-width', n2(0.75 * esc)); pon(g.cordon, 'opacity', n2(entre((va + 0.25) * 2, 0, 1)));
    lista.push({ z: (t2[2] + p2[2]) / 2 + 0.5, el: g, pts: [L.talon, L.dedosPie, mas(L.suela, por(L.arriba, 1.5))] });
  };

  /* ───────────────────────── la cabeza de Jérôme ─────────────────────────
     La de frente es la del presentador (modulos/guia.js): el mismo dibujo, las mismas bocas y los
     mismos párpados. Aquí va montada sobre un cuerpo que se mueve en tres dimensiones, así que
     tiene además un dibujo de perfil y otro de espaldas, y se elige el que toca según hacia dónde
     mira la cabeza respecto de la cámara. De frente, los rasgos se corren un poco al girar. */
  var CARA = 'M103,112 C103,74 130,54 160,54 C190,54 217,74 217,112 L218,144 C218,162 213,177 203,188 C193,199 177,209 160,209 C143,209 127,199 117,188 C107,177 102,162 102,144z';
  var BOCAS = {
    cerrada: { f: '', d: '', l: 'M132,170 Q160,190 188,170' },
    sonrisa: { f: 'M129,167 Q160,181 191,167 Q188,197 160,200 Q132,197 129,167z', d: 'M132.5,168.5 Q160,182 187.5,168.5 L185.5,180 Q160,191 134.5,180z', l: 'M129,167 Q160,181 191,167' },
    poco:    { f: 'M135,170 Q160,179 185,170 Q182,191 160,193 Q138,191 135,170z', d: 'M137.5,171 Q160,179 182.5,171 L181.5,178 Q160,185 138.5,178z', l: 'M135,170 Q160,179 185,170' },
    a:       { f: 'M134,168 Q160,176 186,168 Q188,198 160,201 Q132,198 134,168z', d: 'M137,169 Q160,176 183,169 L183,178 Q160,184 137,178z', l: 'M134,168 Q160,176 186,168' },
    o:       { f: 'M145,170 Q160,164 175,170 Q181,187 160,199 Q139,187 145,170z', d: 'M148,170.5 Q160,166 172,170.5 L172,174.5 Q160,171 148,174.5z', l: 'M145,170 Q160,164 175,170' },
    e:       { f: 'M130,169 Q160,178 190,169 Q186,191 160,193 Q134,191 130,169z', d: 'M133,170 Q160,178 187,170 L185,181 Q160,188 135,181z', l: 'M130,169 Q160,178 190,169' },
    oh:      { f: 'M147,172 Q160,166 173,172 Q177,193 160,197 Q143,193 147,172z', d: '', l: '' },
    risa:    { f: 'M126,164 Q160,180 194,164 Q193,204 160,207 Q127,204 126,164z', d: 'M129.5,165.5 Q160,181 190.5,165.5 L188.5,178 Q160,190.5 131.5,178z', l: 'M126,164 Q160,180 194,164' },
    contenta:{ f: '', d: '', l: 'M130,170 Q160,195 190,170' },
    pilla:   { f: '', d: '', l: 'M137,177.5 Q161,189 187,168' },
    mm:      { f: '', d: '', l: 'M147,180 Q161,184.5 178,176' },
    seria:   { f: '', d: '', l: 'M139,178 Q160,183.5 181,178' },
    /* el esfuerzo: los dientes apretados */
    ay:      { f: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z', d: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z',
               r: 'M133,180 H187 M147.5,167 V193 M160,166 V194 M172.5,167 V193', l: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z' },
    /* soplar: la boca pequeña y redonda */
    sopla:   { f: 'M151,174 Q160,169 169,174 Q172,186 160,190 Q148,186 151,174z', d: '', l: '' }
  };
  /* los gestos de la cara: como en el presentador, más los del esfuerzo */
  var EMO = {
    contento:  { boca: 'sonrisa', entorna: 0.25 },
    risa:      { boca: 'risa', ojos: [0, 0], arco: 9, cejas: [3.5, 4, 3.5, 4], rubor: 0.44, entorna: 1 },
    guino:     { boca: 'sonrisa', ojos: [1, 0], arco: 7, cejas: [4, 0, -1.5, -4], entorna: 0.5 },
    asombro:   { boca: 'oh', ojos: [1.24, 1.24], cejas: [6.5, 3, 6.5, 3], entorna: -0.25 },
    ilusion:   { boca: 'risa', ojos: [1.14, 1.14], cejas: [4.5, 2, 4.5, 2], rubor: 0.36 },
    serio:     { boca: 'seria', cejas: [0.6, 6, 0.6, 6], rubor: 0.12 },
    atento:    { boca: 'contenta', ojos: [0.94, 0.94], cejas: [1.5, 2, 1.5, 2], entorna: 0.2 },
    apuro:     { boca: 'ay', ojos: [1.08, 1.08], cejas: [3.4, 12, 3.4, 12], rubor: 0.4 },
    /* el esfuerzo: los ojos entornados, el ceño y los dientes apretados; y soltar el aire */
    esfuerzo:  { boca: 'ay', ojos: [0.5, 0.5], cejas: [-1.5, -10, -1.5, -10], entorna: 0.85, rubor: 0.46 },
    sopla:     { boca: 'sopla', ojos: [0.82, 0.82], cejas: [0.5, -4, 0.5, -4], entorna: 0.4, rubor: 0.36 },
    concentra: { boca: 'mm', ojos: [0.84, 0.84], cejas: [0, -6, 0, -6], entorna: 0.35, rubor: 0.26 }
  };
  function ojoFormas(x, a, b, arcoO, fuera) {
    var y = 134, l = x - 11.5, r = x + 11.5, ab = a > 1 ? 1 : a, c = 1 - ab;
    var t = y - 16 * a - arcoO * c, f = y + 14 * (1 - 0.5 * b) * ab - arcoO * c;
    var n = function (v) { return v.toFixed(1); };
    var top = 'M' + l + ',' + y + ' C' + (x - 8) + ',' + n(t) + ' ' + (x + 8) + ',' + n(t) + ' ' + r + ',' + y;
    return {
      hueco: top + ' C' + (x + 8) + ',' + n(f) + ' ' + (x - 8) + ',' + n(f) + ' ' + l + ',' + y + 'z',
      sombra: top + ' C' + (x + 8) + ',' + n(t + 7.5) + ' ' + (x - 8) + ',' + n(t + 7.5) + ' ' + l + ',' + y + 'z',
      parpado: top + (fuera < 0 ? ' M' + l + ',' + y + ' l-2.4,-1.5' : ' M' + r + ',' + y + ' l2.4,-1.5'),
      bajo: ab > 0.3 ? 'M' + (l + 2) + ',' + (y + 1) + ' C' + (x - 7) + ',' + n(f + 1) + ' ' + (x + 7) + ',' + n(f + 1) + ' ' + (r - 2) + ',' + (y + 1) : '',
      pliegue: 'M' + (l + 1.5) + ',' + (y - 3.6) + ' C' + (x - 8) + ',' + n(t - 4.6) + ' ' + (x + 8) + ',' + n(t - 4.6) + ' ' + (r - 1.5) + ',' + (y - 3.6)
    };
  }
  function visema(ch) {
    if (!ch) return null;
    var c = ch.toLowerCase();
    if (' \n\t.,;:!?¡¿…—–-«»“”"\'()'.indexOf(c) >= 0) return null;
    if ('aáàâäãåаяą'.indexOf(c) >= 0) return 'a';
    if ('eéèêëęiíìîïyэеиыйě'.indexOf(c) >= 0) return 'e';
    if ('oóòôöõuúùûüоуюёø'.indexOf(c) >= 0) return 'o';
    if ('mbpмбп'.indexOf(c) >= 0) return 'cerrada';
    if (c > '⹿') return ['a', 'e', 'o', 'poco'][ch.charCodeAt(0) % 4];
    return 'poco';
  }

  function Cabeza(defs, u) {
    var p = function (n) { return u + '-' + n; }, url = function (n) { return 'url(#' + u + '-' + n + ')'; };
    var D0 = '';
    D0 += '<radialGradient id="' + p('piel') + '" cx=".4" cy=".34" r=".8"><stop offset="0" stop-color="' + C.pielL + '"/><stop offset=".5" stop-color="' + C.piel + '"/><stop offset="1" stop-color="' + C.pielS + '"/></radialGradient>';
    D0 += '<linearGradient id="' + p('pelo') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.peloL + '"/><stop offset=".6" stop-color="' + C.pelo + '"/><stop offset="1" stop-color="' + C.peloS + '"/></linearGradient>';
    D0 += '<linearGradient id="' + p('lente') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".38"/><stop offset=".45" stop-color="#cfe8ff" stop-opacity=".06"/><stop offset="1" stop-color="#cfe8ff" stop-opacity=".22"/></linearGradient>';
    D0 += '<radialGradient id="' + p('iris') + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b17a43"/><stop offset=".55" stop-color="#70482a"/><stop offset="1" stop-color="#3a2412"/></radialGradient>';
    D0 += '<linearGradient id="' + p('sien') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.peloS + '"/><stop offset=".5" stop-color="' + C.peloS + '" stop-opacity=".85"/><stop offset="1" stop-color="' + C.peloS + '" stop-opacity=".12"/></linearGradient>';
    D0 += '<clipPath id="' + p('caraclip') + '"><path d="' + CARA + '"/></clipPath>';
    D0 += '<clipPath id="' + p('ojoi') + '"><path class="tgh-hueco-i" d=""/></clipPath><clipPath id="' + p('ojod') + '"><path class="tgh-hueco-d" d=""/></clipPath>';
    D0 += '<clipPath id="' + p('bocaclip') + '"><path class="tgh-boca-forma" d=""/></clipPath>';
    D0 += '<clipPath id="' + p('perfclip') + '"><path d="' + PERFIL + '"/></clipPath>';
    D0 += '<clipPath id="' + p('ojop') + '"><path class="tgh-hueco-p" d=""/></clipPath>';
    var hueco = crear('g', null, defs); hueco.innerHTML = D0;
    this.defs = hueco;

    var ojo = function (x, k) {
      return '<g class="tgh-ojo tgh-ojo-' + k + '"><path class="tgh-blanco" d="" fill="#fff"/>' +
        '<g clip-path="' + url('ojo' + k) + '"><g class="tgh-iris"><circle cx="' + x + '" cy="133.5" r="7.8" fill="' + url('iris') + '"/><circle cx="' + x + '" cy="133.5" r="7.8" fill="none" stroke="#2f1c0e" stroke-width="1.1"/>' +
        '<circle cx="' + x + '" cy="133.5" r="3.6" fill="#160b05"/><circle cx="' + (x - 2.7) + '" cy="130.4" r="2.4" fill="#fff"/><circle cx="' + (x + 2.6) + '" cy="136.3" r="1.1" fill="#fff" opacity=".85"/></g>' +
        '<path class="tgh-sombra" d="" fill="#4a2f22" opacity=".2"/></g>' +
        '<path class="tgh-pliegue" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>' +
        '<path class="tgh-bajo" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>' +
        '<path class="tgh-parpado" d="" fill="none" stroke="#3d2a1c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
    };
    var montura = function (x) {
      return '<path fill-rule="evenodd" fill="' + C.mont + '" d="M' + (x + 8) + ',113 h34 a8,8 0 0 1 8,8 v22 a8,8 0 0 1 -8,8 h-34 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z ' +
        'M' + (x + 9.4) + ',118.6 a6,6 0 0 0 -6,6 v17.8 a6,6 0 0 0 6,6 h31.2 a6,6 0 0 0 6,-6 v-17.8 a6,6 0 0 0 -6,-6z"/>';
    };
    var g = crear('g', { 'class': 'tgh' });
    this.g = g;
    g.innerHTML =
    /* ══ de frente ══ */
    '<g class="tgh-frente">' +
      '<g class="tgh-orejas"><g class="tgh-oreja-i">' +
        '<path d="M104,130 C95,125 88,133 89,146 C90,158 97,166 105,163z" fill="' + C.piel + '"/>' +
        '<path d="M100,136 C94,137 93,146 95,153 C96,156 99,158 101,157 M97,145 q3.4,2.4 2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/></g><g class="tgh-oreja-d">' +
        '<path d="M216,130 C225,125 232,133 231,146 C230,158 223,166 215,163z" fill="' + C.pielS + '"/>' +
        '<path d="M220,136 C226,137 227,146 225,153 C224,156 221,158 219,157 M223,145 q-3.4,2.4 -2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/></g></g>' +
      '<path d="' + CARA + '" fill="' + url('piel') + '"/>' +
      '<g clip-path="' + url('caraclip') + '">' +
        '<path d="M100,152 C104,174 112,190 124,200 C136,212 150,214 160,214 C170,214 184,212 196,200 C208,190 216,174 220,152 C215,166 207,174 196,176 C188,170 178,166 170,166 C166,162 154,162 150,166 C142,166 132,170 124,176 C113,174 105,166 100,152z" fill="#6a5140" opacity=".14"/>' +
        '<ellipse cx="146" cy="90" rx="31" ry="12" fill="' + C.pielL + '" opacity=".5"/>' +
        '<path d="M102,150 C104,172 112,188 124,199 C115,186 109,170 107,150z M218,150 C216,172 208,188 196,199 C205,186 211,170 213,150z" fill="' + C.pielSS + '" opacity=".26"/>' +
        '<path d="M146,203.5 Q160,209.5 174,203.5 Q160,206.5 146,203.5z" fill="' + C.pielSS + '" opacity=".4"/>' +
        '<g class="tgh-mejillas"><ellipse class="tgh-rubor" cx="118" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/>' +
        '<ellipse class="tgh-rubor" cx="202" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/></g>' +
      '</g>' +
      '<g class="tgh-pelo">' +
        '<path d="M101,124 C95,104 97,84 108,68 C120,52 140,44 160,44 C182,44 202,52 213,68 C223,84 225,104 219,124 C217,113 214,107 211,104 C200,90 182,84 160,84 C138,84 120,90 109,104 C106,107 103,113 101,124z" fill="' + C.peloS + '"/>' +
        '<path d="M100.5,147 C97,131 98,116 102,103 C105,104 108,106 110,109 C107.5,120 106.5,134 107.5,147 C105.5,150 102,150 100.5,147z M219.5,147 C223,131 222,116 218,103 C215,104 212,106 210,109 C212.5,120 213.5,134 212.5,147 C214.5,150 218,150 219.5,147z" fill="' + url('sien') + '"/>' +
        '<g class="tgh-tupe">' +
          '<path d="M106,107 C97,89 100,70 110,58 C112,50 118,42 126,35 C128,41 131,45 136,45 C138,35 142,29 150,24 C151,31 154,36 159,37 C162,29 166,25 174,22 C174,29 177,34 182,35 C186,31 192,30 198,31 C198,37 201,42 206,46 C216,55 223,70 222,86 C221,94 218,100 214,105 C208,91 196,83 180,81 C160,77 140,79 126,85 C116,90 110,98 106,107z" fill="' + url('pelo') + '"/>' +
          '<path d="M106,107 C110,98 116,90 126,85 C140,79 160,77 180,81 C196,83 208,91 214,105 C209,98 198,92 180,90 C160,87 140,88 126,93 C117,96 111,101 106,107z" fill="' + C.peloSS + '" opacity=".5"/>' +
          '<path d="M136,45 C128,58 124,72 124,87 M159,37 C150,50 146,66 146,81 M182,35 C174,48 170,64 170,81 M206,46 C199,58 195,70 195,84" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".45"/>' +
          '<g fill="' + C.peloL + '" opacity=".8">' +
            '<path d="M113,76 C114,60 120,48 127,40 C125,52 123,63 122,77 C120,80 114,80 113,76z"/><path d="M135,72 C137,54 143,41 151,30 C149,45 148,58 147,73 C145,76 137,76 135,72z"/>' +
            '<path d="M159,69 C161,51 167,38 175,28 C173,43 172,56 171,70 C169,73 161,73 159,69z"/><path d="M183,70 C185,55 191,44 198,36 C197,49 196,60 195,73 C193,76 185,75 183,70z"/>' +
            '<path d="M204,78 C206,68 210,61 215,57 C215,66 214,74 212,82 C210,84 205,82 204,78z" opacity=".7"/></g>' +
        '</g>' +
      '</g>' +
      '<g class="tgh-cinta">' +
        '<path d="M98,96 Q160,70 222,96 L223,111 Q160,85 97,111z" fill="#19b6a6"/>' +
        '<path d="M98,96 Q160,70 222,96 L222.4,101 Q160,75 97.6,101z" fill="#3fd2c2" opacity=".9"/>' +
        '<path d="M97.4,107.5 Q160,81.5 222.6,107.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
        '<path d="M99,103.6 Q160,77.6 221,103.6" fill="none" stroke="#f3fffd" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
      '</g>' +
      '<g class="tgh-rasgos">' +
        '<g class="tgh-ceja-i"><path d="M109.5,109.5 C117,99.5 134,95.5 151,100.5 C152.6,101 152.6,105.6 150.5,106 C136,102.5 121,104 112.5,111 C110.5,112.5 108.5,111 109.5,109.5z" fill="' + C.ceja + '"/></g>' +
        '<g class="tgh-ceja-d"><path d="M210.5,109.5 C203,99.5 186,95.5 169,100.5 C167.4,101 167.4,105.6 169.5,106 C184,102.5 199,104 207.5,111 C209.5,112.5 211.5,111 210.5,109.5z" fill="' + C.ceja + '"/></g>' +
        ojo(131, 'i') + ojo(189, 'd') +
        '<path d="M161,137 L160.4,151" stroke="' + C.pielL + '" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>' +
        '<ellipse cx="160.5" cy="158.5" rx="4.6" ry="5.6" fill="' + C.pielL + '" opacity=".55"/>' +
        '<path d="M157,141 C155,151 149,158 151,164 C153,170 167,171 170,164" fill="none" stroke="' + C.pielSS + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g class="tgh-gafas">' +
          '<path class="tgh-patilla" d="M107,124 L95.5,129.6 M213,124 L224.5,129.6" stroke="' + C.mont + '" stroke-width="3.8" stroke-linecap="round"/>' +
          '<rect x="109" y="118" width="44" height="30" rx="7" fill="' + url('lente') + '"/><rect x="167" y="118" width="44" height="30" rx="7" fill="' + url('lente') + '"/>' +
          montura(106) + montura(164) +
          '<path d="M155,127 Q160,122.5 165,127" fill="none" stroke="' + C.mont + '" stroke-width="4.6" stroke-linecap="round"/>' +
          '<path d="M114,115.6 h30 M172,115.6 h30" stroke="' + C.montL + '" stroke-width="1.7" stroke-linecap="round"/>' +
          '<g fill="#fff" opacity=".42"><path d="M112,136 L119,121.5 h5 L112.5,145z"/><path d="M170,136 L177,121.5 h5 L170.5,145z"/></g>' +
        '</g>' +
        '<g class="tgh-boca">' +
          '<path class="tgh-boca-fondo" d="" fill="' + C.boca + '"/>' +
          '<g clip-path="' + url('bocaclip') + '"><ellipse class="tgh-lengua" cx="160" cy="197" rx="16" ry="8.5" fill="' + C.lengua + '"/>' +
          '<path class="tgh-dientes" d="" fill="' + C.diente + '"/><path class="tgh-boca-rayas" d="" fill="none" stroke="#b9aea6" stroke-width="1.1" stroke-linecap="round"/></g>' +
          '<path class="tgh-boca-linea" d="" fill="none" stroke="#8c4a3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M125,163 q-4,4 -2,10 M195,163 q4,4 2,10" fill="none" stroke="' + C.pielSS + '" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' +
        '</g>' +
      '</g>' +
      '<path class="tgh-gota" d="M226,74 C226,74 219.5,84.5 219.5,89.5 a6.5,6.5 0 0 0 13,0 C232.5,84.5 226,74 226,74z" fill="#8fd6fb" stroke="#3aa0d8" stroke-width="1.2" opacity="0"/>' +
    '</g>' +
    /* ══ de perfil (mira a la derecha) ══ */
    '<g class="tgh-perfil" style="display:none">' +
      '<path d="' + PERFIL + '" fill="' + url('piel') + '"/>' +
      '<g clip-path="' + url('perfclip') + '">' +
        '<path d="M150,170 C160,190 180,204 204,212 C216,210 218,198 214,188 C206,184 204,176 209,166 C196,160 170,160 150,170z" fill="#6a5140" opacity=".15"/>' +
        '<path d="M128,150 C134,176 146,196 170,210 L120,214z" fill="' + C.pielSS + '" opacity=".3"/>' +
        '<ellipse class="tgh-rubor" cx="186" cy="166" rx="12" ry="7.5" fill="' + C.rubor + '" opacity=".24"/>' +
        '<ellipse cx="196" cy="92" rx="12" ry="16" fill="' + C.pielL + '" opacity=".4"/>' +
      '</g>' +
      /* la nariz y su aleta; el surco de la boca */
      '<path d="M214,159 C210,157 207,160 207,163" fill="none" stroke="' + C.pielSS + '" stroke-width="2.2" stroke-linecap="round"/>' +
      /* el pelo: corto por detrás y por los lados, con la patilla; arriba, el tupé */
      '<path d="M199,84 C192,62 172,48 148,48 C114,48 90,74 88,110 C87,134 94,152 106,164 C110,152 116,144 124,140 C122,128 128,118 140,114 C150,112 156,108 160,102 C170,100 186,96 199,84z" fill="' + C.peloS + '"/>' +
      '<path d="M140,114 C150,112 156,108 160,102 C164,112 164,128 160,146 C156,150 152,148 152,142 C152,132 148,122 140,114z" fill="' + url('sien') + '"/>' +
      '<g class="tgh-tupe">' +
        '<path d="M200,88 C208,70 208,50 199,34 C194,40 189,42 183,40 C183,32 179,26 170,20 C168,28 164,32 158,32 C156,24 150,20 141,18 C141,26 137,30 131,32 C127,28 121,26 114,28 C116,34 114,40 108,46 C96,58 88,76 88,96 C98,80 114,70 134,66 C156,62 180,70 200,88z" fill="' + url('pelo') + '"/>' +
        '<path d="M183,40 C178,50 176,60 177,70 M158,32 C152,44 150,54 151,64 M131,32 C124,42 120,54 120,68" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".45"/>' +
        '<g fill="' + C.peloL + '" opacity=".8"><path d="M188,64 C190,52 194,44 198,38 C199,48 198,58 196,68 C194,70 189,68 188,64z"/><path d="M162,58 C163,46 166,36 171,26 C172,38 171,48 170,60 C168,62 163,62 162,58z"/>' +
          '<path d="M136,60 C137,48 140,38 144,26 C146,38 145,50 144,62 C142,64 137,64 136,60z"/><path d="M110,70 C112,58 116,48 122,40 C122,52 120,62 118,72 C116,74 111,74 110,70z"/></g>' +
      '</g>' +
      '<g class="tgh-cinta">' +
        '<path d="M211,93 C170,80 126,82 88,98 L89,113 C128,97 170,95 213,108z" fill="#19b6a6"/>' +
        '<path d="M211,93 C170,80 126,82 88,98 L88.4,103 C127,87 170,85 211.8,98z" fill="#3fd2c2" opacity=".9"/>' +
        '<path d="M88.8,109.5 C128,93.5 170,91.5 212.6,104.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
      '</g>' +
      /* la oreja */
      '<path d="M150,127 C140,122 131,131 132,146 C133,159 141,168 150,165 C157,161 159,138 150,127z" fill="' + C.piel + '" stroke="' + C.pielSS + '" stroke-width="1"/>' +
      '<path d="M147,134 C140,134 138,144 140,152 C141,156 144,158 147,157 M142,145 q4,2 3,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>' +
      /* la ceja, el ojo y las gafas (la montura, de canto; la patilla, hasta la oreja) */
      '<g class="tgh-ceja-p"><path d="M183,111 C190,103 202,102 211,107 C212,109 211,112 209,112 C202,108 193,109 186,114 C184,115 182,113 183,111z" fill="' + C.ceja + '"/></g>' +
      '<g class="tgh-ojo-p"><path class="tgh-blanco" d="" fill="#fff"/>' +
        '<g clip-path="' + url('ojop') + '"><circle cx="199.5" cy="133" r="6.2" fill="' + url('iris') + '"/><circle cx="201" cy="133" r="3" fill="#160b05"/><circle cx="198.6" cy="130.6" r="1.8" fill="#fff"/></g>' +
        '<path class="tgh-parpado" d="" fill="none" stroke="#3d2a1c" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="tgh-gafas">' +
        '<path d="M208,123 C190,121 168,122 150,126 C146,127 144,131 145,136" fill="none" stroke="' + C.mont + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<path d="M203,117 C199,118 197,121 197,125 L197,142 C197,147 200,150 204,150 L210,150 C212,150 213,148 213,146 L213,121 C213,119 212,117 210,117z" fill="' + url('lente') + '"/>' +
        '<path fill-rule="evenodd" d="M204,113.5 h7 a4,4 0 0 1 4,4 v30 a4,4 0 0 1 -4,4 h-7 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z M204.6,118.6 a4.6,4.6 0 0 0 -4.6,4.6 v19.6 a4.6,4.6 0 0 0 4.6,4.6 h4.6 a1.6,1.6 0 0 0 1.6,-1.6 v-25.6 a1.6,1.6 0 0 0 -1.6,-1.6z" fill="' + C.mont + '"/>' +
      '</g>' +
      '<g class="tgh-boca-p"><path class="tgh-bp-fondo" d="" fill="' + C.boca + '"/><path class="tgh-bp-dientes" d="" fill="#fff"/>' +
        '<path class="tgh-bp-linea" d="" fill="none" stroke="#8c4a3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M196,166 q-4,5 -1,11" fill="none" stroke="' + C.pielSS + '" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>' +
      '<path class="tgh-gota" d="M178,70 C178,70 171.5,80.5 171.5,85.5 a6.5,6.5 0 0 0 13,0 C184.5,80.5 178,70 178,70z" fill="#8fd6fb" stroke="#3aa0d8" stroke-width="1.2" opacity="0"/>' +
    '</g>' +
    /* ══ de espaldas ══ */
    '<g class="tgh-espalda" style="display:none">' +
      '<path d="M104,130 C95,125 88,133 89,146 C90,158 97,166 105,163z" fill="' + C.pielS + '"/><path d="M216,130 C225,125 232,133 231,146 C230,158 223,166 215,163z" fill="' + C.pielS + '"/>' +
      '<path d="' + CARA + '" fill="' + C.pielS + '"/>' +
      '<path d="M102,150 C101,120 100,96 108,74 C120,52 140,44 160,44 C182,44 202,52 213,74 C220,96 219,120 218,150 C216,170 208,184 196,190 C184,196 136,196 124,190 C112,184 104,170 102,150z" fill="' + C.peloS + '"/>' +
      '<path d="M124,190 C136,196 184,196 196,190 C190,200 176,206 160,206 C144,206 130,200 124,190z" fill="' + C.peloSS + '" opacity=".4"/>' +
      '<path d="M130,120 C128,140 130,160 136,180 M160,116 L160,186 M190,120 C192,140 190,160 184,180" fill="none" stroke="' + C.peloSS + '" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>' +
      '<g class="tgh-tupe"><path d="M106,104 C97,86 100,68 110,58 C112,50 118,42 126,35 C128,41 131,45 136,45 C138,35 142,29 150,24 C151,31 154,36 159,37 C162,29 166,25 174,22 C174,29 177,34 182,35 C186,31 192,30 198,31 C198,37 201,42 206,46 C216,55 223,70 222,86 C221,94 218,100 214,104 C200,96 180,92 160,92 C140,92 120,96 106,104z" fill="' + url('pelo') + '"/>' +
        '<path d="M136,45 C130,58 128,72 128,90 M159,37 C156,52 156,70 157,90 M182,35 C182,50 184,70 188,90" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".4"/></g>' +
      '<g class="tgh-cinta"><path d="M98,100 Q160,112 222,100 L223,115 Q160,127 97,115z" fill="#19b6a6"/><path d="M97.4,111.5 Q160,123.5 222.6,111.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
        '<path d="M150,112 L140,138 L152,134 L156,120z M170,112 L180,138 L168,134 L164,120z" fill="#19b6a6"/><circle cx="160" cy="114" r="7" fill="#0e8a7e"/></g>' +
    '</g>';
    var q = function (s) { return g.querySelector(s); };
    this.R = {
      frente: q('.tgh-frente'), perfil: q('.tgh-perfil'), espalda: q('.tgh-espalda'),
      rasgos: q('.tgh-frente .tgh-rasgos'), tupe: q('.tgh-frente .tgh-tupe'), tupeP: q('.tgh-perfil .tgh-tupe'), tupeE: q('.tgh-espalda .tgh-tupe'), orejaI: q('.tgh-oreja-i'), orejaD: q('.tgh-oreja-d'), mejillas: q('.tgh-mejillas'),
      cejaI: q('.tgh-ceja-i'), cejaD: q('.tgh-ceja-d'), cejaP: q('.tgh-ceja-p'),
      iris: Array.prototype.slice.call(g.querySelectorAll('.tgh-iris')), rubor: Array.prototype.slice.call(g.querySelectorAll('.tgh-rubor')),
      bocaF: q('.tgh-boca-fondo'), bocaD: q('.tgh-dientes'), bocaL: q('.tgh-boca-linea'), bocaR: q('.tgh-boca-rayas'), lengua: q('.tgh-lengua'),
      bocaClip: this.defs.querySelector('.tgh-boca-forma'),
      ojo: {
        i: { blanco: q('.tgh-ojo-i .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-i'), sombra: q('.tgh-ojo-i .tgh-sombra'), parpado: q('.tgh-ojo-i .tgh-parpado'), bajo: q('.tgh-ojo-i .tgh-bajo'), pliegue: q('.tgh-ojo-i .tgh-pliegue') },
        d: { blanco: q('.tgh-ojo-d .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-d'), sombra: q('.tgh-ojo-d .tgh-sombra'), parpado: q('.tgh-ojo-d .tgh-parpado'), bajo: q('.tgh-ojo-d .tgh-bajo'), pliegue: q('.tgh-ojo-d .tgh-pliegue') }
      },
      ojoP: { blanco: q('.tgh-ojo-p .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-p'), parpado: q('.tgh-ojo-p .tgh-parpado') },
      bpF: q('.tgh-bp-fondo'), bpD: q('.tgh-bp-dientes'), bpL: q('.tgh-bp-linea'),
      gotas: Array.prototype.slice.call(g.querySelectorAll('.tgh-gota'))
    };
    /* el estado de la cara: cada cosa va hacia su meta con suavidad */
    this.e = EMO.contento; this.emo = 'contento';
    this.v = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.m = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.boca = 'sonrisa'; this.bocaBase = 'sonrisa'; this.parp = 0; this.parpT = -1; this.prox = 1.4; this.t = 0; this.habla = 0; this.bocaT = 0;
    this.vista = ''; this.escala = 0.195;
    /* el tupé va un instante detrás de la cabeza: dos muelles (se ladea, se estira) y de dónde venía */
    this.peloA = new Muelle(17, 0.25); this.peloY = new Muelle(20, 0.3); this.cAnt = null; this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.dt = 0; this.corte = true;
  }
  /* la cabeza de perfil: el cráneo, la frente, la nariz, los labios, el mentón y la mandíbula */
  var PERFIL = 'M150,50 C176,48 200,62 208,86 C211,96 212,104 211,110 C209,114 207,117 208,121 C210,128 216,138 224,147 C229,152 231,155 228,158 C225,160 218,160 214,160 C212,163 213,166 216,169 C218,171 219,173 217,175 C216,176 216,178 217,180 C218,183 216,186 213,187 C210,188 209,190 210,193 C213,199 213,205 207,209 C200,213 188,212 176,208 C162,204 150,198 142,190 C134,182 130,170 128,158 C120,156 106,150 98,140 C88,126 86,104 94,84 C104,62 126,50 150,50z';
  var BOCAS_P = {
    sonrisa: { f: 'M218,174 C211,175 204,174 199,170 C199,180 208,186 216,181z', d: 'M217,175 C211,176 205,175 201,172 C202,176 205,178 208,179 C212,179 215,178 217,177z', l: 'M218,174 C211,175 204,174 199,170' },
    cerrada: { f: '', d: '', l: 'M218,175 C211,178 204,177 199,171' },
    seria: { f: '', d: '', l: 'M218,176 C211,177 205,177 200,176' },
    ay: { f: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z', d: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z', l: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z M201,178 L217,176.5' },
    sopla: { f: 'M219,173 C215,171 210,172 208,176 C208,181 212,184 217,182z', d: '', l: 'M219,173 C215,171 210,172 208,176 C208,181 212,184 217,182' },
    habla: { f: 'M218,173 C211,173 205,173 201,172 C201,180 206,185 213,184 C216,183 218,180 218,178z', d: 'M217,174 C211,174 206,174 203,173.4 L204,176.4 C208,177.4 213,177.4 217,176.6z', l: 'M218,173 C211,173 205,173 201,172' }
  };
  /* el gesto de la cara */
  Cabeza.prototype.emocion = function (n) {
    var e = EMO[n] || EMO.contento, o = e.ojos || [1, 1], c = e.cejas || [0, 0, 0, 0], m = this.m;
    this.emo = EMO[n] ? n : 'contento'; this.e = e;
    m.aI = o[0]; m.aD = o[1]; m.bb = e.entorna || 0; m.cIy = c[0]; m.cIr = -c[1]; m.cDy = c[2]; m.cDr = c[3];
    m.rubor = e.rubor == null ? 0.24 : e.rubor;
    this.bocaBase = e.boca || 'sonrisa'; if (!this.habla) this.boca = this.bocaBase;
  };
  Cabeza.prototype.sudar = function (cuanto) { this.m.sudor = cuanto ? 1 : 0; };
  Cabeza.prototype.hablar = function (seg) { this.habla = seg ? this.t + seg : 0; if (!seg) this.boca = this.bocaBase; };
  Cabeza.prototype.letra = function (ch) { var v = visema(ch); this.boca = v || this.bocaBase; };
  Cabeza.prototype.parpadea = function () { if (this.parpT < 0) this.parpT = 0; };
  /* un paso de tiempo: el parpadeo, la boca que habla y lo que va hacia su meta */
  Cabeza.prototype.paso = function (dt, parado) {
    var v = this.v, m = this.m, k = parado ? 1 : 1 - Math.exp(-dt * 14), n;
    if (parado) dt = 0;
    this.t += dt; this.dt = dt;
    /* los ojos van de un punto a otro de un salto corto, no deslizándose */
    for (n in m) v[n] += (m[n] - v[n]) * (n === 'sudor' ? 1 - Math.exp(-dt * 3) : (n === 'mx' || n === 'my') ? (parado ? 1 : 1 - Math.exp(-dt * 26)) : k);
    if (this.parpT < 0 && this.t > this.prox) this.parpT = 0;
    if (this.parpT >= 0) {
      this.parpT += dt; var f = this.parpT / 0.15;
      this.parp = f < 0.5 ? f * 2 : f < 1 ? 2 - f * 2 : 0;
      if (f >= 1) { this.parpT = -1; this.parp = 0; this.prox = this.t + (Math.random() < 0.2 ? 0.2 : 2.4 + Math.random() * 3.2); }
    }
    if (this.habla > this.t) {
      this.bocaT -= dt;
      if (this.bocaT <= 0) { this.bocaT = 0.085 + Math.random() * 0.06; this.boca = ['a', 'poco', 'e', 'o', 'poco', 'cerrada', 'e', 'a'][Math.floor(Math.random() * 8)]; }
    } else if (this.habla) { this.habla = 0; this.boca = this.bocaBase; }
  };
  /* Coloca la cabeza según el esqueleto y la cámara, elige el dibujo y pinta la cara. */
  Cabeza.prototype.pintar = function (E, cam, lista) {
    var R = this.R, Bc = E.Bc, f = cam.d(Bc[2]), up = cam.d(Bc[1]), pos = cam.p(E.cab), k = this.escala * cam.esc, v = this.v;
    var kx = punto(cam.k, Bc[0]), ky = punto(cam.k, Bc[1]), kz = f[2];
    /* con histéresis, para que no baile entre dos dibujos en el umbral */
    var vista = this.vista;
    if (vista === 'frente') { if (kz < 0.52) vista = kz < -0.6 ? 'espalda' : 'perfil'; }
    else if (vista === 'espalda') { if (kz > -0.52) vista = kz > 0.6 ? 'frente' : 'perfil'; }
    else if (vista === 'perfil') { if (kz > 0.68) vista = 'frente'; else if (kz < -0.68) vista = 'espalda'; }
    else vista = kz > 0.6 ? 'frente' : kz < -0.6 ? 'espalda' : 'perfil';
    if (vista !== this.vista) {
      this.vista = vista;
      R.frente.style.display = vista === 'frente' ? '' : 'none'; R.perfil.style.display = vista === 'perfil' ? '' : 'none'; R.espalda.style.display = vista === 'espalda' ? '' : 'none';
    }
    var parp = this.parp, e = this.e, ojos = e.ojos || [1, 1];
    /* el tupé: lo que cambia la velocidad de la cabeza (el tirón), visto en la pantalla y en unidades del dibujo */
    var tir = [0, 0], dtp = this.dt;
    if (this.corte || !this.cAnt || quieto()) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.peloA.x = this.peloA.v = this.peloY.x = this.peloY.v = 0; this.corte = false; }
    else if (dtp > 0) {
      var mov = menos(E.cab, this.cAnt);
      if (largo(mov) > 22) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; }
      else { var vel = por(mov, 1 / dtp); this.vF = mezcla(this.vF, vel, 1 - Math.exp(-dtp / 0.04)); this.vS = mezcla(this.vS, vel, 1 - Math.exp(-dtp / 0.18)); }
      var tw = cam.d(menos(this.vF, this.vS)); tir = [tw[0] / this.escala, tw[1] / this.escala];
    }
    this.cAnt = E.cab;
    var pelo = function (g, giro, vol, cx, cy, extra) {
      /* al dibujo: se deshace su giro (y su volteo, de perfil) */
      var cg = Math.cos(giro * RAD), sg = Math.sin(giro * RAD), lx = tir[0] * cg + tir[1] * sg, ly = (-tir[0] * sg + tir[1] * cg) * vol;
      var a = yo0.peloA.paso(entre(-0.024 * lx, -6, 6), dtp), sy = 1 + yo0.peloY.paso(entre(0.0003 * ly, -0.035, 0.045), dtp);
      pon(g, 'transform', (extra || '') + 'rotate(' + n1(a) + ' ' + cx + ' ' + cy + ') translate(0,' + n1(cy * (1 - sy)) + ') scale(1,' + n2(sy) + ')');
    }, yo0 = this;
    if (vista === 'perfil') {
      var fl = Math.sqrt(f[0] * f[0] + f[1] * f[1]) || 1, ang = Math.atan2(f[1], f[0]) / RAD;
      var a = ang * RAD, sx = Math.sin(a), cx = Math.cos(a);
      /* tras girar, el «arriba» del dibujo es (sen, −cos); si no coincide con el de la cabeza, se voltea */
      var vol = (sx * up[0] - cx * up[1]) < 0 ? -1 : 1;
      pon(this.g, 'transform', 'translate(' + n1(pos[0]) + ',' + n1(pos[1]) + ') rotate(' + n1(ang) + ') scale(' + n2(k) + ',' + n2(k * vol) + ') translate(-150,-206)');
      pelo(R.tupeP, ang, vol, 146, 84);
      /* el ojo que se ve: el del lado de la cámara */
      var ab = (kx > 0 ? v.aI : v.aD) * (1 - parp), aa = entre(ab, 0, 1.3);
      var clave = aa.toFixed(2);
      if (R.ojoP._c !== clave) {
        R.ojoP._c = clave;
        var t = 134 - 8.5 * aa, b = 134 + 5.5 * Math.min(1, aa);
        var hu = 'M188,134 C191,' + n1(t) + ' 200,' + n1(t - 1) + ' 205,132.6 C201,' + n1(b + 1) + ' 192,' + n1(b + 1) + ' 188,134z';
        R.ojoP.blanco.setAttribute('d', hu); R.ojoP.hueco.setAttribute('d', hu);
        R.ojoP.parpado.setAttribute('d', 'M187,134.4 C191,' + n1(t) + ' 200,' + n1(t - 1) + ' 206,132.4');
      }
      pon(R.cejaP, 'transform', 'translate(0,' + n2(-(kx > 0 ? v.cIy : v.cDy)) + ') rotate(' + n2((kx > 0 ? -v.cIr : v.cDr) * 0.8) + ' 197 108)');
      var bp = BOCAS_P[this.habla ? (this.boca === 'cerrada' || this.boca === 'poco' ? 'cerrada' : 'habla') : (BOCAS_P[this.bocaBase] ? this.bocaBase : (BOCAS[this.bocaBase] && BOCAS[this.bocaBase].f ? 'sonrisa' : 'cerrada'))];
      if (R._bp !== bp) { R._bp = bp; R.bpF.setAttribute('d', bp.f); R.bpD.setAttribute('d', bp.d); R.bpL.setAttribute('d', bp.l); }
    } else {
      var roll = Math.atan2(up[0], -up[1]) / RAD;
      pon(this.g, 'transform', 'translate(' + n1(pos[0]) + ',' + n1(pos[1]) + ') rotate(' + n1(roll) + ') scale(' + n2(k) + ') translate(-160,-214)');
      if (vista === 'frente') {
        /* los rasgos se corren hacia donde mira la cabeza; el tupé, menos; las orejas, al revés */
        var s = kz < 0 ? -1 : 1, dx = -kx * 40 * s, dy = ky * 30 * s, ap = 1 - 0.22 * Math.abs(kx);
        pon(R.rasgos, 'transform', 'translate(' + n1(160 + dx) + ',' + n1(dy) + ') scale(' + n2(ap) + ',1) translate(-160,0)');
        pon(R.mejillas, 'transform', 'translate(' + n1(dx * 0.7) + ',' + n1(dy * 0.6) + ')');
        pelo(R.tupe, roll, 1, 160, 98, 'translate(' + n1(dx * 0.3) + ',' + n1(dy * 0.2) + ') ');
        pon(R.orejaI, 'transform', 'translate(' + n1(-dx * 0.42) + ',' + n1(-dy * 0.3) + ')'); pon(R.orejaD, 'transform', 'translate(' + n1(-dx * 0.42) + ',' + n1(-dy * 0.3) + ')');
        pon(R.orejaI, 'opacity', dx > 14 ? '0' : '1'); pon(R.orejaD, 'opacity', dx < -14 ? '0' : '1');
        pon(R.cejaI, 'transform', 'translate(0,' + n2(-v.cIy) + ') rotate(' + n2(v.cIr) + ' 130 104)'); pon(R.cejaD, 'transform', 'translate(0,' + n2(-v.cDy) + ') rotate(' + n2(v.cDr) + ' 190 104)');
        var entorna = entre(v.bb, -0.5, 1.2), bbS = entorna.toFixed(2), yo = this;
        ['i', 'd'].forEach(function (kk, n) {
          var a2 = entre((n ? v.aD : v.aI) * (1 - parp), 0, 1.4), arcoO = ojos[n] < 0.2 ? (e.arco || 0) : -9, cl = a2.toFixed(2) + '|' + bbS + '|' + arcoO, o = R.ojo[kk];
          if (o._c === cl) return; o._c = cl;
          var F = ojoFormas(n ? 189 : 131, a2, entorna, arcoO, n ? 1 : -1);
          o.blanco.setAttribute('d', F.hueco); o.hueco.setAttribute('d', F.hueco); o.sombra.setAttribute('d', F.sombra); o.parpado.setAttribute('d', F.parpado); o.bajo.setAttribute('d', F.bajo); o.pliegue.setAttribute('d', F.pliegue);
        });
        var ir = 'translate(' + n2(v.mx * 3.4) + ',' + n2(v.my * 2.8) + ')';
        if (R._ir !== ir) { R._ir = ir; R.iris.forEach(function (gg) { gg.setAttribute('transform', ir); }); }
        if (R._boca !== this.boca) {
          R._boca = this.boca;
          var b2 = BOCAS[this.boca] || BOCAS.sonrisa;
          R.bocaF.setAttribute('d', b2.f); R.bocaClip.setAttribute('d', b2.f); R.bocaD.setAttribute('d', b2.d); R.bocaL.setAttribute('d', b2.l); R.bocaR.setAttribute('d', b2.r || '');
          R.lengua.style.display = b2.f && !b2.r ? '' : 'none';
        }
      } else pelo(R.tupeE, roll, 1, 160, 98);
    }
    var ru = n2(v.rubor);
    if (R._ru !== ru) { R._ru = ru; R.rubor.forEach(function (gg) { gg.setAttribute('opacity', ru); }); }
    var su = n2(entre(v.sudor, 0, 1) * (0.55 + 0.45 * Math.sin(this.t * 3.1)));
    if (R._su !== su) { R._su = su; R.gotas.forEach(function (gg) { gg.setAttribute('opacity', su); gg.setAttribute('transform', 'translate(0,' + n1((this.t * 9) % 14) + ')'); }, this); }
    lista.push({ z: cam.p(mas(E.cab, aplicar(Bc, [0, 13, 0])))[2] + 3, el: this.g });
  };

  /* ───────────────────────── el escenario ─────────────────────────
     Un SVG con sus capas (el ambiente, el suelo, las sombras, la estela, los actores y lo que va
     por encima) y una cámara. En cada cuadro, lo que hay en escena (Jérôme y el material) deja
     sus piezas en una lista con su fondo, y la lista se pinta de lejos a cerca. */
  var ANCHO = 400, ALTO = 460;
  var N_ESC = 0;
  function Escenario(caja) {
    var u = 'tgs' + (++N_ESC);
    this.u = u;
    var svg = crear('svg', { viewBox: '0 0 ' + ANCHO + ' ' + ALTO, 'class': 'tge-svg', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid slice' });
    this.svg = svg; caja.appendChild(svg);
    this.defs = crear('defs', null, svg);
    this.fondo = crear('g', { 'class': 'tge-fondo' }, svg);
    this.suelo = crear('g', { 'class': 'tge-suelo' }, svg);
    this.sombras = crear('g', { 'class': 'tge-sombras' }, svg);
    this.detras = crear('g', { 'class': 'tge-detras' }, svg);       /* la estela, por detrás de los actores */
    this.actores = crear('g', { 'class': 'tge-actores' }, svg);
    this.encima = crear('g', { 'class': 'tge-encima' }, svg);       /* marcas, flechas */
    this.cam = new Camara();
    this.fig = new Figura(this.defs);
    this.cab = new Cabeza(this.defs, this.fig.u);
    this.material = [];        /* las piezas de material en escena */
    this.orden = '';
    /* las sombras: una mancha suave bajo el cuerpo y otra, más prieta, bajo cada pie que pisa */
    var gs = crear('radialGradient', { id: this.fig.u + '-somb', cx: 0.5, cy: 0.5, r: 0.5 }, this.defs);
    this.sombTintas = [[0, 0.46], [0.5, 0.26], [1, 0]].map(function (q) { return crear('stop', { offset: q[0], 'stop-color': '#1a1408', 'stop-opacity': q[1] }, gs); });
    this.sombra = crear('ellipse', { fill: 'url(#' + this.fig.u + '-somb)' }, this.sombras);
    this.pisada = { i: crear('ellipse', { fill: 'url(#' + this.fig.u + '-somb)' }, this.sombras), d: crear('ellipse', { fill: 'url(#' + this.fig.u + '-somb)' }, this.sombras) };
    this.tarima = crear('ellipse', { fill: 'rgba(255,255,255,.16)', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1 }, this.suelo);
    this.nombreAmb = ''; this.tema = 'dia';
  }
  /* quita el material que hubiera y pone el de una coreografía: [['barra', {…}], …] */
  Escenario.prototype.poner = function (lista) {
    var yo = this;
    this.material.forEach(function (m) { yo.quitarNodos(m); });
    this.material = (lista || []).map(function (q) { var K = MATERIAL[q[0]]; return K ? new K(yo, q[1] || {}) : null; }).filter(Boolean);
    this.orden = '';
    while (this.actores.firstChild) this.actores.removeChild(this.actores.firstChild);
  };
  Escenario.prototype.quitarNodos = function () {};
  /* Pinta un esqueleto: la figura, la cabeza, el material y las sombras, y los ordena por fondo. */
  Escenario.prototype.pintar = function (E, ctx) {
    var cam = this.cam, lista = [], i;
    cam.calc();
    this.fig.pintar(E, cam, lista);
    this.cab.pintar(E, cam, lista);
    if (!this.soloFigura) for (i = 0; i < this.material.length; i++) {
      this.material[i].pintar(E, cam, lista, ctx);
      if (this.material[i].tapa) taparCon(lista, this.material[i].tapa, cam);
    }
    lista.sort(function (a, b) { return a.z - b.z; });
    var clave = '';
    for (i = 0; i < lista.length; i++) clave += (lista[i].el._n || (lista[i].el._n = ++Escenario.n)) + ',';
    if (clave !== this.orden) {
      this.orden = clave;
      while (this.actores.firstChild) this.actores.removeChild(this.actores.firstChild);
      for (i = 0; i < lista.length; i++) this.actores.appendChild(lista[i].el);
    }
    var ve = this.soloFigura ? 'none' : '';
    if (this.sombras.style.display !== ve) { this.sombras.style.display = ve; this.suelo.style.display = ve; }
    /* la sombra: bajo el cuerpo, de la cabeza a los pies; más pequeña y más clara cuanto más alto está */
    var sy = (ctx && ctx.sueloY) || 0;
    var alto = Math.max(0, Math.min(E.i.suela[1], E.d.suela[1], E.pel[1] - 8) - sy);
    var cabS = cam.p([E.cab[0], sy, E.cab[2]]), pieS = cam.p([(E.i.tob[0] + E.d.tob[0]) / 2, sy, (E.i.tob[2] + E.d.tob[2]) / 2]);
    var dx = cabS[0] - pieS[0], dy = cabS[1] - pieS[1], l2 = Math.sqrt(dx * dx + dy * dy);
    var k = 1 / (1 + alto / 70), rx = Math.max(19 * cam.esc, l2 * 0.56) * k, ry = Math.max(22 * cam.esc * Math.sin(cam.picado * RAD), 4) * k;
    var cx = n1((cabS[0] + pieS[0]) / 2), cy = n1((cabS[1] + pieS[1]) / 2);
    pon(this.sombra, 'cx', cx); pon(this.sombra, 'cy', cy); pon(this.sombra, 'rx', n1(rx * 1.3)); pon(this.sombra, 'ry', n1(ry * 1.45)); pon(this.sombra, 'opacity', n2(0.74 * k));
    for (var kk = 0; kk < 2; kk++) {
      var Lq = E[LADOS[kk]], ps = this.pisada[LADOS[kk]], hq = Math.min(Lq.suela[1], Lq.suela[1] + Lq.punta[1] * 12) - sy;
      if (hq > 7 || hq < -4) { pon(ps, 'opacity', '0'); continue; }
      var cq = cam.p([Lq.suela[0] + Lq.punta[0] * 6.5, sy, Lq.suela[2] + Lq.punta[2] * 6.5]), d2 = cam.d([Lq.punta[0], 0, Lq.punta[2]]), lq = Math.sqrt(d2[0] * d2[0] + d2[1] * d2[1]);
      pon(ps, 'cx', n1(cq[0])); pon(ps, 'cy', n1(cq[1] + 1)); pon(ps, 'rx', n1((7 + 9 * lq) * cam.esc)); pon(ps, 'ry', n1(Math.max(2.4, (3.5 + 7 * Math.sin(cam.picado * RAD)) * cam.esc * 0.62)));
      pon(ps, 'opacity', n2(0.95 * entre(1 - hq / 7, 0, 1)));
    }
    /* la tarima y el horizonte del ambiente siguen a la cámara */
    var o = cam.p([cam.mira[0], 0, cam.mira[2]]), R = 118 * cam.esc;
    pon(this.tarima, 'cx', n1(o[0])); pon(this.tarima, 'cy', n1(o[1])); pon(this.tarima, 'rx', n1(R)); pon(this.tarima, 'ry', n1(Math.max(6, R * Math.sin(cam.picado * RAD))));
    var hor = Math.round(o[1] - 46 - 20 * cam.esc);
    if (this.soloFigura) hor = Math.max(hor, ALTO + 260);      /* de cerca, que no asome nada de lo de lejos */
    if (this.horizonte !== hor) { this.horizonte = hor; this.ajustarAmbiente(); }
  };
  Escenario.n = 0;
  /* Un cajón y las piezas de Jérôme: lo que está encima de la tapa, o del lado de una cara que la
     cámara ve, va por delante; lo que queda al otro lado, por detrás (el cajón lo tapa). */
  function taparCon(lista, c, cam) {
    var k = cam.k, e = 1.2, i, j;
    for (i = 0; i < lista.length; i++) {
      var it = lista[i], P = it.pts;
      if (!P) continue;
      var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (j = 0; j < P.length; j++) for (var q = 0; q < 3; q++) { mn[q] = Math.min(mn[q], P[j][q]); mx[q] = Math.max(mx[q], P[j][q]); }
      var fuera = mn[0] >= c.max[0] - e || mx[0] <= c.min[0] + e || mn[2] >= c.max[2] - e || mx[2] <= c.min[2] + e;
      var delante = mn[1] >= c.max[1] - e ||
        (k[0] > 0.02 && mn[0] >= c.max[0] - e) || (k[0] < -0.02 && mx[0] <= c.min[0] + e) ||
        (k[2] > 0.02 && mn[2] >= c.max[2] - e) || (k[2] < -0.02 && mx[2] <= c.min[2] + e);
      if (delante) { if (it.z <= c.z + 0.2) it.z = c.z + 0.5 + it.z / 10000; }
      else if (fuera) it.z = c.z - 1 + it.z / 10000;
    }
  }

  /* ───────────────────────── los tres ambientes ─────────────────────────
     El gimnasio, el aire libre y el parque de calistenia, de día y de noche. Son telones: no
     giran con la cámara. Lo que está «lejos» (el Teide, el mar, la ventana) cuelga del horizonte,
     que sube o baja con el encuadre; el suelo va del horizonte al borde de abajo. */
  function teide(x, y, k, relleno, nieve, borde) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + k + ')">' +
      '<path d="M-150,0 L-96,-34 L-70,-58 L-44,-88 L-26,-101 L-12,-106 L4,-100 L16,-104 L30,-92 L60,-58 L92,-30 L150,0z" fill="' + relleno + '"/>' +
      (nieve ? '<path d="M-44,-88 L-26,-101 L-12,-106 L4,-100 L16,-104 L30,-92 L18,-84 L8,-92 L-4,-82 L-16,-92 L-30,-80z" fill="' + nieve + '" opacity=".9"/>' : '') +
      (borde ? '<path d="M-70,-58 L-44,-88 L-26,-101 L-12,-106 L4,-100 L16,-104 L30,-92 L60,-58" fill="none" stroke="' + borde + '" stroke-width="1.6" stroke-linejoin="round"/>' : '') + '</g>';
  }
  function palmera(x, y, k, color) {
    var h = '';
    [[-58, -8], [-44, -30], [-16, -44], [16, -42], [42, -26], [56, -4]].forEach(function (p) {
      h += '<path d="M0,-128 Q' + (p[0] * 0.5) + ',' + (-128 + p[1] * 1.1 - 10) + ' ' + p[0] + ',' + (-128 + p[1] + 22) + ' Q' + (p[0] * 0.5) + ',' + (-128 + p[1] * 0.5) + ' 0,-128z"/>';
    });
    return '<g transform="translate(' + x + ',' + y + ') scale(' + k + ')" fill="' + color + '"><path d="M-4,0 Q-10,-64 -1,-128 L4,-128 Q-2,-64 5,0z"/>' + h + '</g>';
  }
  function estrellasFondo(n, semilla, alto) {
    var s = '', r = semilla;
    var azar = function () { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (var i = 0; i < n; i++) s += '<circle cx="' + n1(azar() * ANCHO) + '" cy="' + n1(azar() * alto) + '" r="' + n1(0.5 + azar() * 1.1) + '" opacity="' + n2(0.4 + azar() * 0.6) + '"/>';
    return '<g fill="#fff6dd">' + s + '</g>';
  }
  var AMBIENTES = {
    fuera: function (u, noche) {
      return {
        defs: '<linearGradient id="' + u + 'cielo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#070b1f"/><stop offset=".6" stop-color="#17224f"/><stop offset="1" stop-color="#3a4380"/>'
          : '<stop offset="0" stop-color="#8FA8E6"/><stop offset=".5" stop-color="#c9b6e4"/><stop offset=".86" stop-color="#f6c9a8"/><stop offset="1" stop-color="#fbdcb2"/>') + '</linearGradient>' +
          '<linearGradient id="' + u + 'suelo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#2a2f4a"/><stop offset="1" stop-color="#1a1e33"/>'
          : '<stop offset="0" stop-color="#f3d9a6"/><stop offset="1" stop-color="#e2bd80"/>') + '</linearGradient>',
        cielo: '<rect x="0" y="-200" width="400" height="700" fill="url(#' + u + 'cielo)"/>' + (noche ? estrellasFondo(46, 7, 250) : ''),
        lejos: (noche ? '<path d="M318,-150 a17,17 0 1 0 13,27 a13.5,13.5 0 1 1 -13,-27z" fill="#F5C76B"/>' : '<circle cx="74" cy="-36" r="46" fill="#ffd9a0" opacity=".35"/><circle cx="74" cy="-36" r="27" fill="#ffb347" opacity=".95"/>') +
          teide(292, 0, 0.92, noche ? '#141a3a' : '#7A6FB8', noche ? null : '#fff', noche ? '#D4AF37' : null) +
          '<path d="M-10,0 L60,-22 L120,-8 L170,-18 L230,-4 L260,0z" fill="' + (noche ? '#0f1430' : '#9d8fce') + '" opacity=".8"/>' +
          '<rect x="0" y="0" width="400" height="15" fill="' + (noche ? '#141c44' : '#5fb6c9') + '"/><rect x="0" y="0" width="400" height="3" fill="#fff" opacity="' + (noche ? '.12' : '.4') + '"/>' +
          palmera(40, 22, 0.62, noche ? '#0b0f22' : '#3d5c50') + palmera(72, 20, 0.44, noche ? '#0b0f22' : '#4b6e5e'),
        suelo: '<rect x="0" y="14" width="400" height="500" fill="url(#' + u + 'suelo)"/>' +
          '<path d="M0,42 h400 M0,86 h400 M0,150 h400" stroke="' + (noche ? '#fff' : '#b98b4e') + '" stroke-width="1" opacity=".16"/>'
      };
    },
    calistenia: function (u, noche) {
      var hierro = noche ? '#0c1126' : '#56617a';
      return {
        defs: '<linearGradient id="' + u + 'cielo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#060a1c"/><stop offset=".65" stop-color="#14204a"/><stop offset="1" stop-color="#2c3a72"/>'
          : '<stop offset="0" stop-color="#58a8e6"/><stop offset=".6" stop-color="#a5d6f5"/><stop offset="1" stop-color="#e6f5fc"/>') + '</linearGradient>' +
          '<linearGradient id="' + u + 'suelo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#3a3550"/><stop offset="1" stop-color="#231f33"/>'
          : '<stop offset="0" stop-color="#f6e2b4"/><stop offset="1" stop-color="#e9c98c"/>') + '</linearGradient>',
        cielo: '<rect x="0" y="-200" width="400" height="700" fill="url(#' + u + 'cielo)"/>' + (noche ? estrellasFondo(40, 11, 250) : '<path d="M250,-0 m0,60 q6,-16 22,-11 q10,-16 28,-3 q16,-3 16,14z" fill="#fff" opacity=".9"/><path d="M40,110 q5,-12 17,-8 q8,-12 21,-2 q12,-2 12,10z" fill="#fff" opacity=".75"/>'),
        lejos: (noche ? '<path d="M70,-170 a17,17 0 1 0 13,27 a13.5,13.5 0 1 1 -13,-27z" fill="#F5C76B"/>' : '<circle cx="330" cy="-150" r="24" fill="#ffe07a"/><circle cx="330" cy="-150" r="40" fill="#ffe07a" opacity=".28"/>') +
          teide(96, 0, 0.7, noche ? '#10163a' : '#8fa5c9', noche ? null : '#fff', noche ? '#D4AF37' : null) +
          '<rect x="0" y="0" width="400" height="22" fill="' + (noche ? '#152050' : '#2f8fc7') + '"/><path d="M0,7 h400 M0,14 h400" stroke="#fff" stroke-width="1.2" opacity="' + (noche ? '.1' : '.35') + '"/>' +
          /* un parque de barras al fondo */
          '<g fill="none" stroke="' + hierro + '" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M300,30 V-58 M372,30 V-58 M300,-58 H372 M318,-58 V-30 M336,-58 V-30 M354,-58 V-30 M318,-30 H354"/><path d="M262,30 V-22 M286,30 V-22 M262,-22 H286"/></g>' +
          palmera(378, 26, 0.5, noche ? '#0b0f22' : '#3d6b57'),
        suelo: '<rect x="0" y="21" width="400" height="500" fill="url(#' + u + 'suelo)"/><path d="M0,24 q50,5 100,0 t100,0 t100,0 t100,0 v6 h-400z" fill="#fff" opacity="' + (noche ? '.08' : '.5') + '"/>'
      };
    },
    gimnasio: function (u, noche) {
      return {
        defs: '<linearGradient id="' + u + 'cielo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#232b3d"/><stop offset="1" stop-color="#2f394f"/>'
          : '<stop offset="0" stop-color="#e6edf5"/><stop offset="1" stop-color="#cfd9e6"/>') + '</linearGradient>' +
          '<linearGradient id="' + u + 'suelo" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#1c2230"/><stop offset="1" stop-color="#11151e"/>'
          : '<stop offset="0" stop-color="#59657a"/><stop offset="1" stop-color="#3b4557"/>') + '</linearGradient>' +
          '<linearGradient id="' + u + 'vent" x1="0" y1="0" x2="0" y2="1">' + (noche
          ? '<stop offset="0" stop-color="#070b1f"/><stop offset="1" stop-color="#2c3a72"/>'
          : '<stop offset="0" stop-color="#8FA8E6"/><stop offset=".6" stop-color="#c9b6e4"/><stop offset="1" stop-color="#f6c9a8"/>') + '</linearGradient>' +
          '<clipPath id="' + u + 'cv"><rect x="214" y="-176" width="160" height="124" rx="10"/></clipPath>',
        cielo: '<rect x="0" y="-200" width="400" height="700" fill="url(#' + u + 'cielo)"/>',
        lejos:
          /* la ventana, con el Teide al amanecer */
          '<rect x="208" y="-182" width="172" height="136" rx="14" fill="' + (noche ? '#161c2a' : '#ffffff') + '"/>' +
          '<g clip-path="url(#' + u + 'cv)"><rect x="214" y="-176" width="160" height="124" fill="url(#' + u + 'vent)"/>' + (noche ? '<g transform="translate(214,-176)">' + estrellasFondo(14, 5, 80).replace(/cx="([\d.]+)"/g, function (m, v) { return 'cx="' + n1(Number(v) * 0.4) + '"'; }) + '</g>' : '<circle cx="246" cy="-96" r="16" fill="#ffb347"/>') +
          teide(302, -52, 0.6, noche ? '#141a3a' : '#7A6FB8', noche ? null : '#fff', noche ? '#D4AF37' : null) + '</g>' +
          '<path d="M294,-176 v124 M214,-114 h160" stroke="' + (noche ? '#161c2a' : '#ffffff') + '" stroke-width="5"/>' +
          /* un mancuernero y un espejo */
          '<rect x="22" y="-170" width="118" height="150" rx="10" fill="' + (noche ? '#2c3650' : '#dbe5f0') + '" stroke="' + (noche ? '#3d4a66' : '#ffffff') + '" stroke-width="4"/>' +
          '<path d="M40,-150 L74,-110 M58,-156 L104,-102" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="' + (noche ? '.08' : '.5') + '"/>' +
          '<g fill="' + (noche ? '#0e121b' : '#465066') + '"><rect x="20" y="-16" width="128" height="6" rx="2"/><rect x="26" y="-10" width="6" height="26"/><rect x="136" y="-10" width="6" height="26"/>' +
            [34, 56, 78, 100, 122].map(function (x) { return '<rect x="' + x + '" y="-27" width="4" height="12" rx="1.5"/><rect x="' + (x + 12) + '" y="-27" width="4" height="12" rx="1.5"/><rect x="' + (x + 3) + '" y="-23" width="10" height="4"/>'; }).join('') + '</g>' +
          '<rect x="0" y="8" width="400" height="9" fill="' + (noche ? '#161b28' : '#aab6c6') + '"/>',
        suelo: '<rect x="0" y="16" width="400" height="500" fill="url(#' + u + 'suelo)"/>' +
          '<path d="M0,40 h400 M0,78 h400 M0,134 h400 M70,16 L20,250 M165,16 L150,250 M250,16 L270,250 M340,16 L400,250" stroke="#fff" stroke-width="1" opacity=".07"/>'
      };
    }
  };
  /* pone un ambiente: 'gimnasio', 'fuera' o 'calistenia'; tema 'dia' o 'noche' */
  Escenario.prototype.ambiente = function (nombre, tema) {
    nombre = AMBIENTES[nombre] ? nombre : 'fuera'; tema = tema === 'noche' ? 'noche' : 'dia';
    if (nombre === this.nombreAmb && tema === this.tema) return;
    this.nombreAmb = nombre; this.tema = tema;
    var A = AMBIENTES[nombre](this.u, tema === 'noche');
    if (!this.defsAmb) this.defsAmb = crear('g', null, this.defs);
    this.defsAmb.innerHTML = A.defs;
    this.fondo.innerHTML = '<g class="tge-a-cielo">' + A.cielo + '</g><g class="tge-a-lejos">' + A.lejos + '</g><g class="tge-a-suelo">' + A.suelo + '</g>';
    this.tarima.setAttribute('fill', nombre === 'gimnasio' ? 'rgba(255,255,255,.07)' : tema === 'noche' ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.2)');
    this.tarima.setAttribute('stroke', nombre === 'gimnasio' || tema === 'noche' ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.5)');
    this.sombTintas.forEach(function (q) { q.setAttribute('stop-color', tema === 'noche' || nombre === 'gimnasio' ? '#000' : '#4A2C12'); });
    this.ajustarAmbiente();
  };
  Escenario.prototype.ajustarAmbiente = function () {
    var h = this.horizonte == null ? 300 : this.horizonte, f = this.fondo;
    if (!f.firstChild) return;
    f.childNodes[1].setAttribute('transform', 'translate(0,' + h + ')'); f.childNodes[2].setAttribute('transform', 'translate(0,' + h + ')');
  };

  /* ───────────────────────── el material ─────────────────────────
     Cada pieza se pinta con unas pocas formas en tres dimensiones (un cilindro es un trazo
     grueso; un disco, una elipse; una caja, sus caras a la vista) y deja sus nodos en la lista
     con su fondo, como las piezas de Jérôme. Las que se agarran saben dónde están sus agarres.
     colocar(E, antes): antes de clavar las manos (lo que va en el mundo o pegado al cuerpo) o
     después (lo que cuelga de las manos). */
  var M_COL = { hierro: '#39414f', hierroL: '#6b7686', hierroS: '#1e2430', cromo: '#c7ced8', cromoS: '#8b95a3', goma: '#20252e', gomaL: '#3a414d',
                tapiz: '#27406e', tapizL: '#3b5a94', tapizS: '#1a2c4e', madera: '#c99a5b', maderaS: '#9c7038', oro: '#D4AF37', cuerda: '#e8dfc8', banda: '#EE5F7E', agua: '#19b6a6' };
  function trazo(clase, color, ancho) { return crear('path', { 'class': clase || '', fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': ancho || 1 }); }
  function ponLinea(e, a, b, ancho) { pon(e, 'd', 'M' + n1(a[0]) + ',' + n1(a[1]) + ' L' + n1(b[0]) + ',' + n1(b[1])); if (ancho != null) pon(e, 'stroke-width', n1(ancho)); }
  /* un cilindro: dos trazos (el cuerpo y su brillo) */
  function Cilindro(color, brillo) {
    this.g = crear('g'); this.a = trazo('', color); this.b = trazo('', brillo || 'rgba(255,255,255,.35)');
    this.g.appendChild(this.a); this.g.appendChild(this.b);
  }
  Cilindro.prototype.pon = function (cam, p3, q3, r, lista, sesgo) {
    var p = cam.p(p3), q = cam.p(q3), w = 2 * r * cam.esc;
    ponLinea(this.a, p, q, w);
    /* el brillo, corrido hacia arriba a la izquierda */
    var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    if (ny > 0) { nx = -nx; ny = -ny; }
    ponLinea(this.b, [p[0] + nx * w * 0.22, p[1] + ny * w * 0.22], [q[0] + nx * w * 0.22, q[1] + ny * w * 0.22], Math.max(0.6, w * 0.22));
    if (lista) lista.push({ z: (p[2] + q[2]) / 2 + (sesgo || 0), el: this.g });
    return [p, q];
  };
  /* un disco (una pesa, una polea): un círculo con su eje, que de canto se ve como una elipse con grosor */
  function Disco(color, canto, centro) {
    this.g = crear('g');
    this.t = crear('path', { fill: canto || M_COL.goma }, this.g);
    this.c = crear('ellipse', { fill: color, stroke: canto || M_COL.goma, 'stroke-width': 0.8 }, this.g);
    this.i = crear('ellipse', { fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1 }, this.g);
    this.n = crear('ellipse', { fill: centro || M_COL.cromo }, this.g);
  }
  Disco.prototype.pon = function (cam, c3, eje, R, grosor, lista, sesgo) {
    var e = cam.d(eje), ez = e[2], l2 = Math.sqrt(e[0] * e[0] + e[1] * e[1]);
    var ang = l2 > 1e-3 ? Math.atan2(e[1], e[0]) / RAD : 0;
    var rx = Math.max(0.6, R * cam.esc * Math.abs(ez)), ry = R * cam.esc;
    /* la cara que mira a la cámara y la de detrás */
    var s = ez >= 0 ? 1 : -1, cf = cam.p(mas(c3, por(eje, s * grosor / 2))), cb = cam.p(mas(c3, por(eje, -s * grosor / 2)));
    var rot = 'rotate(' + n1(ang) + ')';
    var put = function (el, c, kx, ky) { pon(el, 'transform', 'translate(' + n1(c[0]) + ',' + n1(c[1]) + ') ' + rot); pon(el, 'rx', n1(rx * kx)); pon(el, 'ry', n1(ry * ky)); };
    put(this.c, cf, 1, 1); put(this.i, cf, 0.62, 0.62); put(this.n, cf, 0.2, 0.2);
    /* el canto: lo que une las dos caras */
    var a = ang * RAD, ux = -Math.sin(a) * ry, uy = Math.cos(a) * ry;
    pon(this.t, 'd', 'M' + n1(cb[0] + ux) + ',' + n1(cb[1] + uy) + ' L' + n1(cf[0] + ux) + ',' + n1(cf[1] + uy) + ' L' + n1(cf[0] - ux) + ',' + n1(cf[1] - uy) + ' L' + n1(cb[0] - ux) + ',' + n1(cb[1] - uy) + 'z');
    if (!this._fondo) { this._fondo = crear('ellipse', { fill: this.t.getAttribute('fill') }); this.g.insertBefore(this._fondo, this.t); }
    put(this._fondo, cb, 1, 1);
    if (lista) lista.push({ z: cam.p(c3)[2] + (sesgo || 0), el: this.g });
  };
  /* una caja: un centro, una base y sus tres medidas; se pintan las caras que miran a la cámara */
  function Caja(colores) {
    this.g = crear('g'); this.col = colores;     /* [arriba, lado claro, lado oscuro, abajo] */
    this.caras = [0, 1, 2].map(function () { return crear('path', { 'stroke-linejoin': 'round', 'stroke-width': 0.8 }, this.g); }, this);
  }
  Caja.prototype.pon = function (cam, c3, B, med, lista, sesgo, zModo) {
    var hx = med[0] / 2, hy = med[1] / 2, hz = med[2] / 2, yo = this, n = 0, zmin = 1e9, zc = cam.p(c3)[2];
    var v = function (sx, sy, sz) { return cam.p(mas(c3, aplicar(B, [sx * hx, sy * hy, sz * hz]))); };
    var caras = [
      [B[1], [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]], 0], [por(B[1], -1), [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], 3],
      [B[0], [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]], 1], [por(B[0], -1), [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1]], 1],
      [B[2], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], 2], [por(B[2], -1), [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]], 2]
    ];
    caras.forEach(function (c) {
      var ve = punto(c[0], cam.k);
      if (ve <= 0.02 || n > 2) return;
      var d = '', el = yo.caras[n++];
      c[1].forEach(function (q, i) { var p = v(q[0], q[1], q[2]); zmin = Math.min(zmin, p[2]); d += (i ? 'L' : 'M') + n1(p[0]) + ',' + n1(p[1]); });
      pon(el, 'd', d + 'z'); pon(el, 'fill', yo.col[c[2]]); pon(el, 'stroke', yo.col[c[2]]);
      el.style.display = '';
    });
    for (; n < 3; n++) this.caras[n].style.display = 'none';
    if (lista) lista.push({ z: (zModo === 'fondo' ? zmin : zc) + (sesgo || 0), el: this.g });
  };
  /* una esfera */
  function Esfera(defs, u, color, claro, oscuro) {
    var g = crear('radialGradient', { id: u, cx: 0.36, cy: 0.3, r: 0.8 }, defs);
    [[0, claro], [0.5, color], [1, oscuro]].forEach(function (p) { crear('stop', { offset: p[0], 'stop-color': p[1] }, g); });
    this.g = crear('g'); this.c = crear('circle', { fill: 'url(#' + u + ')', stroke: oscuro, 'stroke-width': 0.8 }, this.g);
  }
  Esfera.prototype.pon = function (cam, c3, R, lista, sesgo) {
    var c = cam.p(c3);
    pon(this.c, 'cx', n1(c[0])); pon(this.c, 'cy', n1(c[1])); pon(this.c, 'r', n1(R * cam.esc));
    if (lista) lista.push({ z: c[2] + (sesgo || 0), el: this.g });
    return c;
  };

  var MATERIAL = {};
  var N_MAT = 0;
  /* ── la barra: sigue a las manos, o va pegada al cuerpo (a la espalda, a la cadera), o en un punto del mundo.
     o: { ancla: 'manos' | 'torax' | 'pelvis' | 'mundo', en: [x, y, z], eje: [x, y, z], largo, discos (radio; 0, sin discos), z (barra Z) } */
  MATERIAL.barra = function (esc, o) {
    o = o || {};
    this.o = o; this.L = o.largo || 200; this.R = o.discos == null ? 21 : o.discos;
    this.barra = new Cilindro(M_COL.cromo); this.manguitos = [new Cilindro(M_COL.cromoS), new Cilindro(M_COL.cromoS)];
    this.discos = this.R ? [new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo)] : [];
    this.c = [0, 100, 30]; this.eje = [1, 0, 0];
    this.antes = (o.ancla || 'manos') !== 'manos';
  };
  MATERIAL.barra.prototype.colocar = function (E, ctx) {
    var o = this.o, a = o.ancla || 'manos';
    if (o.reposo && ctx && ctx.reposo) { this.c = o.reposo; this.eje = [1, 0, 0]; }
    else if (a === 'manos') {
      this.c = mezcla(E.i.agarre, E.d.agarre, 0.5);
      var e = menos(E.i.agarre, E.d.agarre);
      this.eje = largo(e) > 4 ? unidad(e) : E.Bt[0];
      if (o.una) { this.c = E[o.una].agarre; this.eje = E[o.una].mano.eje; }
    } else if (a === 'torax') { this.c = mas(E.tor, aplicar(E.Bt, o.en)); this.eje = aplicar(E.Bt, o.eje || [1, 0, 0]); }
    else if (a === 'pelvis') { this.c = mas(E.pel, aplicar(E.Bp, o.en)); this.eje = aplicar(E.Bp, o.eje || [1, 0, 0]); }
    else { this.c = o.en; this.eje = unidad(o.eje || [1, 0, 0]); }
  };
  /* dónde se agarra: a x centímetros del centro, hacia la izquierda de Jérôme (+) o hacia su derecha (−) */
  MATERIAL.barra.prototype.agarre = function (x) { return mas(this.c, por(this.eje, x)); };
  MATERIAL.barra.prototype.extremos = function () {
    var h = this.L / 2, R = this.R || 2, c = this.c, e = this.eje, r = [];
    [1, -1].forEach(function (s) { var p = mas(c, por(e, s * h)); r.push(mas(p, [0, R, 0]), mas(p, [0, -R, 0]), mas(p, [0, 0, R]), mas(p, [0, 0, -R]), mas(p, [R, 0, 0]), mas(p, [-R, 0, 0])); });
    return r;
  };
  MATERIAL.barra.prototype.pintar = function (E, cam, lista) {
    var h = this.L / 2, c = this.c, e = this.eje, yo = this, sg = this.o.sesgo || 0;
    this.barra.pon(cam, mas(c, por(e, -h)), mas(c, por(e, h)), 1.5, lista, 2.2 + sg);
    [1, -1].forEach(function (s, i) {
      if (!yo.R) return;
      yo.manguitos[i].pon(cam, mas(c, por(e, s * (h - 36))), mas(c, por(e, s * h)), 2.4, lista, 2.3 + sg);
      yo.discos[i].pon(cam, mas(c, por(e, s * (h - 30))), e, yo.R, 4.4, lista, sg);
      yo.discos[i + 2].pon(cam, mas(c, por(e, s * (h - 24.6))), e, yo.R * 0.8, 3.4, lista, sg + (s * punto(e, cam.k) > 0 ? 0.6 : -0.6));
    });
  };
  /* ── las mancuernas: una en cada mano (o en una sola), con el eje del agarre ── */
  MATERIAL.mancuernas = function (esc, o) {
    o = o || {};
    this.o = o; this.lados = o.lado ? [o.lado] : ['i', 'd'];
    this.p = {};
    this.lados.forEach(function (k) { this.p[k] = { m: new Cilindro(M_COL.cromo), a: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL), b: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL) }; }, this);
  };
  MATERIAL.mancuernas.prototype.colocar = function () {};
  MATERIAL.mancuernas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, R = o.radio || 6.6;
    this.lados.forEach(function (k) {
      var L = E[k], c = L.agarre, e = o.vertical ? L.mano.dir : L.mano.eje, p = this.p[k];
      if (o.dos) { c = mezcla(E.i.agarre, E.d.agarre, 0.5); e = o.ejeDos ? aplicar(E.Bt, o.ejeDos) : L.mano.dir; }
      p.m.pon(cam, mas(c, por(e, -9)), mas(c, por(e, 9)), 1.4, lista, 0.9);
      p.a.pon(cam, mas(c, por(e, 10.5)), e, R, 5.4, lista, 0.4); p.b.pon(cam, mas(c, por(e, -10.5)), e, R, 5.4, lista, 0.4);
    }, this);
  };
  /* ── la pesa rusa: cuelga de la mano (o de las dos) ── */
  MATERIAL.kettlebell = function (esc, o) {
    this.o = o || {};
    this.bola = new Esfera(esc.defs, 'tgm' + (++N_MAT), M_COL.hierro, M_COL.hierroL, M_COL.hierroS);
    this.asa = trazo('', M_COL.hierroS, 3); this.bola.g.insertBefore(this.asa, this.bola.c);
  };
  MATERIAL.kettlebell.prototype.colocar = function () {};
  MATERIAL.kettlebell.prototype.pintar = function (E, cam, lista) {
    var o = this.o, c = o.lado ? E[o.lado].agarre : mezcla(E.i.agarre, E.d.agarre, 0.5);
    /* cuelga hacia donde apunta la mano, y un poco hacia abajo */
    var dir = unidad(mas(o.lado ? E[o.lado].mano.dir : unidad(mas(E.i.mano.dir, E.d.mano.dir)), [0, -(o.peso == null ? 0.35 : o.peso), 0]));
    var b3 = mas(c, por(dir, 13.5)), b = cam.p(b3), a = cam.p(c), r = 9.2 * cam.esc;
    var px = -(b[1] - a[1]), py = b[0] - a[0], l = Math.sqrt(px * px + py * py) || 1; px = px / l * r * 0.62; py = py / l * r * 0.62;
    pon(this.asa, 'd', 'M' + n1(b[0] + px) + ',' + n1(b[1] + py) + ' Q' + n1(a[0] + px * 1.5) + ',' + n1(a[1] + py * 1.5) + ' ' + n1(a[0]) + ',' + n1(a[1]) + ' Q' + n1(a[0] - px * 1.5) + ',' + n1(a[1] - py * 1.5) + ' ' + n1(b[0] - px) + ',' + n1(b[1] - py));
    pon(this.asa, 'stroke-width', n1(2.6 * cam.esc));
    this.bola.pon(cam, b3, 9.2, lista, 0.6);
  };
  /* ── el banco: el asiento y, si se pide, el respaldo inclinado. o: { en: [x, z], rumbo, largo, alto, ancho, respaldo: grados, asiento: largo del asiento } ── */
  MATERIAL.banco = function (esc, o) {
    o = o || {};
    this.o = o;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = [M_COL.hierroL, M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.asiento = new Caja(tap); this.resp = o.respaldo != null ? new Caja(tap) : null;
    this.patas = [new Caja(hie), new Caja(hie)]; this.puntal = new Cilindro(M_COL.hierro); this.pies = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.antes = true;
  };
  MATERIAL.banco.prototype.colocar = function () {};
  MATERIAL.banco.prototype.pintar = function (E, cam, lista) {
    var o = this.o, B = giroY(o.rumbo || 0), alto = o.alto || 44, ancho = o.ancho || 28, lar = o.largo || 120, sg = o.sesgo == null ? -14 : o.sesgo;
    var c = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], gr = 7;
    var al = function (x, y, z) { return mas(c, aplicar(B, [x, y, z])); };
    if (this.resp) {
      /* el asiento, corto, y el respaldo, que gira sobre su borde */
      var la = o.asiento || 38, lr = lar - la, ang = o.respaldo, Br = componer(B, giroX(-ang));
      this.asiento.pon(cam, al(0, alto - gr / 2, -lar / 2 + la / 2), B, [ancho, gr, la], lista, sg, 'fondo');
      var bis = al(0, alto - gr / 2, -lar / 2 + la);
      this.resp.pon(cam, mas(bis, aplicar(Br, [0, 0, lr / 2])), Br, [ancho, gr, lr], lista, sg, 'fondo');
      /* el puntal que sostiene el respaldo */
      this.puntal.pon(cam, al(0, 3, -lar / 2 + la + lr * 0.5), mas(bis, aplicar(Br, [0, -gr / 2, lr * 0.62])), 2.6, lista, sg - 3);
    } else this.asiento.pon(cam, al(0, alto - gr / 2, 0), B, [ancho, gr, lar], lista, sg, 'fondo');
    this.patas[0].pon(cam, al(0, (alto - gr) / 2, -lar / 2 + 14), B, [ancho * 0.5, alto - gr, 5], lista, sg - 2, 'fondo');
    this.patas[1].pon(cam, al(0, (alto - gr) / 2, lar / 2 - 16), B, [ancho * 0.5, alto - gr, 5], lista, sg - 2, 'fondo');
    this.pies[0].pon(cam, al(-ancho * 0.62, 1.6, -lar / 2 + 14), al(ancho * 0.62, 1.6, -lar / 2 + 14), 2, lista, sg - 3);
    this.pies[1].pon(cam, al(-ancho * 0.62, 1.6, lar / 2 - 16), al(ancho * 0.62, 1.6, lar / 2 - 16), 2, lista, sg - 3);
  };
  MATERIAL.banco.prototype.extremos = function () {
    var o = this.o, B = giroY(o.rumbo || 0), c = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], w = (o.ancho || 28) / 2, l = (o.largo || 120) / 2, h = o.alto || 44, r = [];
    [[-w, -l], [w, -l], [w, l], [-w, l]].forEach(function (q) { r.push(mas(c, aplicar(B, [q[0], 0, q[1]])), mas(c, aplicar(B, [q[0], h, q[1]]))); });
    if (o.respaldo != null) { var la = o.asiento || 38, lr = (o.largo || 120) - la; r.push(mas(c, aplicar(B, [0, h + Math.sin(o.respaldo * RAD) * lr, -l + la + Math.cos(o.respaldo * RAD) * lr]))); }
    return r;
  };
  /* dónde queda la superficie del banco (para tumbarse o sentarse): un punto a z del centro, y el respaldo */
  MATERIAL.banco.prototype.alto = function () { return this.o.alto || 44; };
  /* ── el soporte de la barra (dos postes con su gancho) ── */
  MATERIAL.soporte = function (esc, o) {
    this.o = o || {}; this.postes = [new Cilindro(M_COL.hierro), new Cilindro(M_COL.hierro)]; this.ganchos = [new Cilindro(M_COL.hierroL), new Cilindro(M_COL.hierroL)];
    this.bases = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.antes = true;
  };
  MATERIAL.soporte.prototype.colocar = function () {};
  MATERIAL.soporte.prototype.extremos = function () { var o = this.o, w = o.ancho || 52, z = o.z || 0, h = (o.alto || 100) + 8; return [[w, h, z], [-w, h, z], [w, 0, z - 22], [-w, 0, z + 22]]; };
  MATERIAL.soporte.prototype.pintar = function (E, cam, lista) {
    var o = this.o, z = o.z || 0, h = o.alto || 100, w = o.ancho || 52, yo = this, sg = o.sesgo == null ? -6 : o.sesgo;
    [1, -1].forEach(function (s, i) {
      yo.postes[i].pon(cam, [s * w, 0, z], [s * w, h + 8, z], 2.4, lista, sg);
      yo.ganchos[i].pon(cam, [s * w, h - 2.5, z], [s * w, h - 2.5, z + 7], 1.6, lista, sg + 0.5);
      yo.bases[i].pon(cam, [s * w, 1.5, z - 22], [s * w, 1.5, z + 22], 2.2, lista, sg - 1);
    });
  };
  /* ── la barra de dominadas: dos postes y el travesaño. o: { alto, ancho, z } ── */
  MATERIAL.barra_dominadas = function (esc, o) {
    this.o = o || {}; this.postes = [new Cilindro(M_COL.hierro), new Cilindro(M_COL.hierro)]; this.trav = new Cilindro(M_COL.cromo);
    this.bases = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.antes = true;
  };
  MATERIAL.barra_dominadas.prototype.colocar = function () {};
  MATERIAL.barra_dominadas.prototype.agarre = function (x) { return [x, this.o.alto || 225, this.o.z || 0]; };
  MATERIAL.barra_dominadas.prototype.extremos = function () { var o = this.o, w = o.ancho || 66, z = o.z || 0, h = (o.alto || 225) + 6; return [[w + 3, h, z], [-w - 3, h, z], [w, 0, z - 26], [-w, 0, z + 26], [w, 0, z + 26], [-w, 0, z - 26]]; };
  MATERIAL.barra_dominadas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, h = o.alto || 225, w = o.ancho || 66, z = o.z || 0, yo = this;
    [1, -1].forEach(function (s, i) {
      yo.postes[i].pon(cam, [s * w, 0, z], [s * w, h + 4, z], 3, lista, -4);
      yo.bases[i].pon(cam, [s * w, 1.5, z - 26], [s * w, 1.5, z + 26], 2.4, lista, -5);
    });
    this.trav.pon(cam, [-w, h, z], [w, h, z], 1.7, lista, 2.2);
  };
  /* ── las paralelas: dos barras a los lados. o: { alto, ancho, largo } ── */
  MATERIAL.paralelas = function (esc, o) {
    this.o = o || {}; this.b = [new Cilindro(M_COL.cromo), new Cilindro(M_COL.cromo)];
    this.p = [0, 1, 2, 3].map(function () { return new Cilindro(M_COL.hierro); });
    this.antes = true;
  };
  MATERIAL.paralelas.prototype.colocar = function () {};
  MATERIAL.paralelas.prototype.extremos = function () { var o = this.o, w = o.ancho || 27, l = (o.largo || 110) / 2, z = o.z || 0, h = o.alto || 118; return [[w, h, z - l], [-w, h, z + l], [w, 0, z + l], [-w, 0, z - l]]; };
  MATERIAL.paralelas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, h = o.alto || 118, w = o.ancho || 27, l = (o.largo || 110) / 2, z0 = o.z || 0, yo = this;
    [1, -1].forEach(function (s, i) {
      yo.b[i].pon(cam, [s * w, h, z0 - l], [s * w, h, z0 + l], 1.9, lista, s * punto([1, 0, 0], cam.k) > 0 ? 3 : -3);
      yo.p[i * 2].pon(cam, [s * w, 0, z0 - l + 8], [s * w, h, z0 - l + 8], 2.4, lista, -4); yo.p[i * 2 + 1].pon(cam, [s * w, 0, z0 + l - 8], [s * w, h, z0 + l - 8], 2.4, lista, -4);
    });
  };
  /* ── el escalón o el cajón ── */
  MATERIAL.escalon = function (esc, o) {
    this.o = o || {}; this.c = new Caja(o.madera ? ['#dab173', M_COL.madera, M_COL.maderaS, M_COL.maderaS] : ['#4a5364', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]);
    this.tira = new Caja([M_COL.agua, '#0e8a7e', '#0e8a7e', '#0e8a7e']);
    this.antes = true;
  };
  MATERIAL.escalon.prototype.colocar = function () {};
  MATERIAL.escalon.prototype.extremos = function () { var o = this.o, m = o.med || [80, 20, 36], x = o.en ? o.en[0] : 0, z = o.en ? o.en[1] : 30; return [[x - m[0] / 2, 0, z - m[2] / 2], [x + m[0] / 2, m[1], z + m[2] / 2], [x + m[0] / 2, 0, z - m[2] / 2], [x - m[0] / 2, m[1], z + m[2] / 2]]; };
  MATERIAL.escalon.prototype.pintar = function (E, cam, lista) {
    var o = this.o, m = o.med || [80, 20, 36], c = [o.en ? o.en[0] : 0, m[1] / 2, o.en ? o.en[1] : 30];
    this.c.pon(cam, c, BASE0, m, lista, o.sesgo == null ? -30 : o.sesgo, 'fondo');
    var it = lista[lista.length - 1];
    this.tira.pon(cam, [c[0], m[1] - 1.2, c[2]], BASE0, [m[0] + 0.6, 2.4, m[2] + 0.6], lista, (o.sesgo == null ? -30 : o.sesgo) + 0.1, 'fondo');
    lista[lista.length - 1].z = it.z + 0.1;
    /* tapa lo que le queda detrás y por debajo de la tapa; lo que tiene encima, nunca */
    this.tapa = { min: [c[0] - m[0] / 2, 0, c[2] - m[2] / 2], max: [c[0] + m[0] / 2, m[1], c[2] + m[2] / 2], z: it.z };
  };
  /* ── la esterilla ── */
  MATERIAL.esterilla = function (esc, o) { this.o = o || {}; this.c = new Caja(['#5B4FCF', '#463cab', '#3a3190', '#3a3190']); this.antes = true; };
  MATERIAL.esterilla.prototype.colocar = function () {};
  MATERIAL.esterilla.prototype.pintar = function (E, cam, lista) {
    var o = this.o, B = giroY(o.rumbo || 0);
    this.c.pon(cam, [o.en ? o.en[0] : 0, 0.8, o.en ? o.en[1] : 0], B, o.med || [62, 1.6, 180], lista, -400);
  };
  /* ── la pared: un paño vertical, que no tape a Jérôme ── */
  MATERIAL.pared = function (esc, o) {
    this.o = o || {}; this.g = crear('g');
    this.f = crear('path', { fill: '#e9e2d2', stroke: '#cfc5ad', 'stroke-width': 1, 'stroke-linejoin': 'round' }, this.g);
    this.z = crear('path', { fill: '#b9ae93' }, this.g);
    this.l = crear('path', { fill: 'none', stroke: '#d8cfba', 'stroke-width': 1 }, this.g);
    this.antes = true;
  };
  MATERIAL.pared.prototype.colocar = function () {};
  MATERIAL.pared.prototype.extremos = function () { var o = this.o, z = o.z == null ? 40 : o.z; return [[(o.x || 0) - 40, 0, z], [(o.x || 0) + 40, 150, z]]; };
  MATERIAL.pared.prototype.pintar = function (E, cam, lista) {
    var o = this.o, z = o.z == null ? 40 : o.z, w = o.ancho || 150, h = o.alto || 215, n = o.normal || [0, 0, -1], gr = 8;
    /* la pared está en el plano z; se ve su cara (hacia Jérôme) y su canto */
    var t = unidad(cruz([0, 1, 0], n)), c = [o.x || 0, 0, z], q = function (a, y, d) { return cam.p(mas(c, mas(por(t, a), mas([0, y, 0], por(n, -d))))); };
    var A = q(-w / 2, 0, 0), B2 = q(w / 2, 0, 0), C2 = q(w / 2, h, 0), D2 = q(-w / 2, h, 0);
    pon(this.f, 'd', 'M' + n1(A[0]) + ',' + n1(A[1]) + ' L' + n1(B2[0]) + ',' + n1(B2[1]) + ' L' + n1(C2[0]) + ',' + n1(C2[1]) + ' L' + n1(D2[0]) + ',' + n1(D2[1]) + 'z');
    /* el canto del lado que se ve */
    var s = punto(t, cam.k) > 0 ? 1 : -1, E1 = q(s * w / 2, 0, 0), E2 = q(s * w / 2, h, 0), E3 = q(s * w / 2, h, gr), E4 = q(s * w / 2, 0, gr);
    pon(this.z, 'd', 'M' + n1(E1[0]) + ',' + n1(E1[1]) + ' L' + n1(E2[0]) + ',' + n1(E2[1]) + ' L' + n1(E3[0]) + ',' + n1(E3[1]) + ' L' + n1(E4[0]) + ',' + n1(E4[1]) + 'z');
    var l = '';
    for (var y = 43; y < h; y += 43) { var a1 = q(-w / 2, y, 0), a2 = q(w / 2, y, 0); l += 'M' + n1(a1[0]) + ',' + n1(a1[1]) + ' L' + n1(a2[0]) + ',' + n1(a2[1]); }
    pon(this.l, 'd', l);
    /* si la cámara ve la cara de la pared, va detrás de todo; si la ve por detrás, no se pinta la cara (solo el canto) */
    var ve = punto(n, cam.k);
    this.f.style.display = ve > 0.05 ? '' : 'none'; this.l.style.display = ve > 0.05 ? '' : 'none';
    lista.push({ z: -500, el: this.g });
  };
  /* ── la polea: la columna, la polea a su altura y el cable hasta el agarre. o: { en: [x, z], alto, a: 'manos' | 'i' | 'd' | 'tobillo-i', agarre: 'barra' | 'cuerda' | 'asa' } ── */
  MATERIAL.polea = function (esc, o) {
    o = o || {};
    this.o = o; this.col = new Caja(['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]); this.base = new Caja(['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]);
    this.rueda = new Disco(M_COL.hierroL, M_COL.hierroS, M_COL.cromo); this.cable = trazo('', '#11151c', 1.2);
    this.pesas = new Caja(['#7b8696', '#5b6575', '#434c5a', '#434c5a']); this.guia = new Cilindro(M_COL.cromo);
    this.asa = new Cilindro(M_COL.cromo); this.cuerdas = [new Cilindro(M_COL.cuerda, 'rgba(255,255,255,.4)'), new Cilindro(M_COL.cuerda, 'rgba(255,255,255,.4)')];
    this.gc = crear('g'); this.gc.appendChild(this.cable);
    this.largo0 = null; this.antes = false;
  };
  MATERIAL.polea.prototype.colocar = function () {};
  MATERIAL.polea.prototype.punto = function () { var o = this.o; return [o.en ? o.en[0] : 0, o.alto == null ? 200 : o.alto, (o.en ? o.en[1] : 90) - 9]; };
  MATERIAL.polea.prototype.extremos = function () { var o = this.o, x = o.en ? o.en[0] : 0, z = o.en ? o.en[1] : 90, H = o.torre || 218; return [[x - 5, H, z], [x + 5, H, z], [x - 27, 0, z - 29], [x + 27, 0, z + 17]]; };
  MATERIAL.polea.prototype.pintar = function (E, cam, lista) {
    var o = this.o, x = o.en ? o.en[0] : 0, z = o.en ? o.en[1] : 90, H = o.torre || 218, pp = this.punto(), sg = o.sesgo == null ? -8 : o.sesgo;
    this.col.pon(cam, [x, H / 2, z], BASE0, [9, H, 9], lista, sg, 'fondo');
    this.base.pon(cam, [x, 3, z - 6], BASE0, [54, 6, 46], lista, sg - 20, 'fondo');
    this.rueda.pon(cam, [x, pp[1], z - 8], [1, 0, 0], 5.2, 2.2, lista, sg + 1);
    /* a qué va el cable */
    var a = o.a || 'manos', fin, yo = this;
    if (a === 'manos') fin = mezcla(E.i.agarre, E.d.agarre, 0.5);
    else if (a === 'i' || a === 'd') fin = E[a].agarre;
    else if (a === 'tobillo-i' || a === 'tobillo-d') fin = E[a.slice(-1)].tob;
    else if (a === 'pelvis') fin = mas(E.pel, aplicar(E.Bp, o.punto || [0, 0, 0]));
    var ag = o.agarre || (a === 'manos' ? 'barra' : 'asa');
    if (ag === 'cuerda' && a === 'manos') {
      var nudo = mas(fin, por(unidad(menos(pp, fin)), 9));
      this.cuerdas[0].pon(cam, nudo, E.i.agarre, 1.3, lista, 1.4); this.cuerdas[1].pon(cam, nudo, E.d.agarre, 1.3, lista, 1.4);
      this.cuerdas[0].g.style.display = ''; this.cuerdas[1].g.style.display = ''; this.asa.g.style.display = 'none';
      fin = nudo;
    } else if (ag === 'barra' && a === 'manos') {
      var e = unidad(menos(E.i.agarre, E.d.agarre), [1, 0, 0]), medio = largo(menos(E.i.agarre, E.d.agarre)) / 2 + 9;
      this.asa.pon(cam, mas(fin, por(e, -medio)), mas(fin, por(e, medio)), 1.4, lista, 2);
      this.asa.g.style.display = ''; this.cuerdas[0].g.style.display = 'none'; this.cuerdas[1].g.style.display = 'none';
    } else {
      if (a === 'i' || a === 'd') { var ej = E[a].mano.eje; this.asa.pon(cam, mas(fin, por(ej, -6)), mas(fin, por(ej, 6)), 1.3, lista, 2); this.asa.g.style.display = ''; }
      else this.asa.g.style.display = 'none';
      this.cuerdas[0].g.style.display = 'none'; this.cuerdas[1].g.style.display = 'none';
    }
    var p1 = cam.p(pp), p2 = cam.p(fin);
    ponLinea(this.cable, p1, p2, Math.max(1, 0.7 * cam.esc));
    lista.push({ z: (p1[2] + p2[2]) / 2 + 1, el: this.gc });
    /* las pesas suben lo que se alarga el cable */
    var lar = largo(menos(pp, fin));
    if (this.largo0 == null || o.reinicia) this.largo0 = o.largo0 == null ? lar : o.largo0;
    var sube = entre(lar - this.largo0, 0, 120);
    this.pesas.pon(cam, [x, 20 + sube + 16, z + 9], BASE0, [22, 32, 9], lista, sg - 3, 'fondo');
    this.guia.pon(cam, [x, 6, z + 9], [x, H - 6, z + 9], 0.7, lista, sg - 4);
  };
  /* ── la banda elástica: de un punto a la mano (o de un pie a su mano, o de una mano a la otra). o: { de: 'pies' | [x,y,z] | 'i', a: 'manos' | 'i' | 'd' } ── */
  MATERIAL.banda = function (esc, o) {
    this.o = o || {}; this.g = crear('g');
    this.t = [0, 1, 2, 3].map(function () { var p = trazo('', (o && o.color) || M_COL.banda, 2); this.g.appendChild(p); return p; }, this);
    this.antes = false;
  };
  MATERIAL.banda.prototype.colocar = function () {};
  MATERIAL.banda.prototype.pintar = function (E, cam, lista) {
    var o = this.o, tramos = [], zs = 0, yo = this;
    var pie = function (k) { return mas(E[k].suela, por(E[k].punta, 6)); };
    if (o.de === 'pies') { ['i', 'd'].forEach(function (k) { if (!o.a || o.a === 'manos' || o.a === k) tramos.push([pie(o.unPie ? o.unPie : k), E[k].agarre]); }); if (!o.unPie) tramos.push([pie('i'), pie('d')]); }
    else if (o.de === 'manos') tramos.push([E.i.agarre, E.d.agarre]);
    else if (o.de === 'rodillas') { var r1 = mas(E.i.rod, por(E.i.qu, -7)), r2 = mas(E.d.rod, por(E.d.qu, -7)); tramos.push([mas(r1, [0, 0, 6]), mas(r2, [0, 0, 6])], [mas(r1, [0, 0, -6]), mas(r2, [0, 0, -6])]); }
    else if (o.de === 'tobillos') tramos.push([mas(E.i.tob, [0, 3, 0]), mas(E.d.tob, [0, 3, 0])]);
    else { var ks = o.a === 'i' || o.a === 'd' ? [o.a] : ['i', 'd']; ks.forEach(function (k) { tramos.push([o.de, E[k].agarre]); }); }
    this.t.forEach(function (p, i) {
      if (!tramos[i]) { p.style.display = 'none'; return; }
      p.style.display = '';
      var a = cam.p(tramos[i][0]), b = cam.p(tramos[i][1]), l = largo(menos(tramos[i][0], tramos[i][1]));
      /* cuanto más se estira, más fina */
      ponLinea(p, a, b, entre(4.2 - l / 45, 1.6, 3.6) * cam.esc * 0.55);
      zs = Math.max(zs, (a[2] + b[2]) / 2);
    });
    lista.push({ z: zs + 2, el: this.g });
  };
  /* ── el fitball ── */
  MATERIAL.fitball = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#5B4FCF', '#9B8CFF', '#3a3190'); this.antes = true; };
  MATERIAL.fitball.prototype.colocar = function () {};
  MATERIAL.fitball.prototype.extremos = function () { var o = this.o, R = o.radio || 30, en = o.en || [0, 30]; return [[en[0] - R, 0, en[1]], [en[0] + R, 2 * R, en[1]], [en[0], R, en[1] + R], [en[0], R, en[1] - R]]; };
  MATERIAL.fitball.prototype.pintar = function (E, cam, lista, ctx) {
    var o = this.o, R = o.radio || 30, en = (ctx && ctx.fitball) || o.en || [0, 30];
    this.e.pon(cam, [en[0], R, en[1]], R, lista, o.sesgo == null ? -10 : o.sesgo);
  };
  /* ── el disco y el balón: entre las manos ── */
  MATERIAL.disco = function (esc, o) { this.o = o || {}; this.d = new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo); };
  MATERIAL.disco.prototype.colocar = function () {};
  MATERIAL.disco.prototype.pintar = function (E, cam, lista) {
    var o = this.o, c = mezcla(E.i.agarre, E.d.agarre, 0.5), e = o.eje ? aplicar(E.Bt, o.eje) : unidad(cruz(menos(E.i.agarre, E.d.agarre), E.i.mano.dir), E.Bt[2]);
    this.d.pon(cam, c, e, o.radio || 15, 3.4, lista, o.sesgo == null ? -1.2 : o.sesgo);
  };
  MATERIAL.balon_medicinal = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#d9682e', '#f39a5b', '#8f3d14'); };
  MATERIAL.balon_medicinal.prototype.colocar = function () {};
  MATERIAL.balon_medicinal.prototype.pintar = function (E, cam, lista, ctx) {
    var c = (ctx && ctx.balon) || mezcla(E.i.agarre, E.d.agarre, 0.5);
    this.e.pon(cam, c, this.o.radio || 11, lista, 1.2);
  };

  /* ───────────────────────── la vida ─────────────────────────
     Lo que separa a un muñeco que pasa de una postura a otra de alguien que está ahí:
       · respira, y más hondo cuando viene de trabajar;
       · el cuerpo no llega todo a la vez: el tronco va un instante detrás de la cadera, y la
         cabeza, detrás del tronco (la demora);
       · al frenar, la cabeza cabecea y los brazos sueltos se balancean (los muelles);
       · de pie y quieto, reparte el peso de un pie a otro;
       · cuando habla de cerca, acompaña con la mano y con la cabeza.
     Nada de esto es técnica del ejercicio y nada mueve lo clavado: se aplica ANTES de clavar los
     pies y las manos, así que el pie sigue en su sitio y la mano en la barra. La respiración va a
     su ritmo, sin acompasarse con la repetición: no le dice a nadie cuándo coger aire. Con
     «reducir movimiento» del sistema, no hace nada. */
  function Muelle(w, z) { this.x = 0; this.v = 0; this.w = w; this.z = z; }
  /* hacia la meta, con un punto de rebote; en pasos de 1/120 s, para que no se dispare si el móvil va justo */
  Muelle.prototype.paso = function (meta, dt) {
    var n = Math.max(1, Math.ceil(dt * 120)), h = dt / n, i;
    for (i = 0; i < n; i++) { this.v += (-this.w * this.w * (this.x - meta) - 2 * this.z * this.w * this.v) * h; this.x += this.v * h; }
    if (!isFinite(this.x) || !isFinite(this.v)) { this.x = 0; this.v = 0; }
    return this.x;
  };
  var DEMORA = { tronco: 0.04, columna: 0.08, cabeza: 0.13 };
  function Vida() { this.t = 0; this.fase = 0.3; this.fatiga = 0; this.aire = 0; this.quietoK = 0; this.hablaK = 0; this.corte(); }
  /* un corte de plano o un salto de postura: se olvida de dónde venía (sin esto, daría un latigazo) */
  Vida.prototype.corte = function () {
    this.cabP = new Muelle(12, 0.4); this.cabR = new Muelle(12, 0.4);
    this.bz = { i: [new Muelle(7.4, 0.2), new Muelle(7.4, 0.2)], d: [new Muelle(7.4, 0.2), new Muelle(7.4, 0.2)] };
    this.linea = []; this.reloj = 0; this.antes = null; this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.tiron = [0, 0, 0];
  };
  /* cómo iba hace «seg» segundos: entre las dos anotaciones que lo rodean */
  Vida.prototype.hace = function (seg) {
    var L = this.linea, t = this.reloj - seg, i;
    if (L.length < 2 || t >= L[L.length - 1].t) return L[L.length - 1];
    if (t <= L[0].t) return L[0];
    for (i = L.length - 1; i > 0; i--) if (L[i - 1].t <= t) break;
    var a = L[i - 1], b = L[i], u = b.t > a.t ? entre((t - a.t) / (b.t - a.t), 0, 1) : 1;
    return { B: mezclaBase(a.B, b.B, u), col: mezcla(a.col, b.col, u), cab: mezcla(a.cab, b.cab, u) };
  };
  /* E: el esqueleto de este instante, aún sin clavar. o: { busto, esf, rep, dePie, habla, libres: { i, d } } */
  Vida.prototype.paso = function (E, dt, o) {
    if (quieto()) return E;
    var S = E.S, yo = this, k;
    this.t += dt;
    /* ── la demora: la cadera manda; el tronco, la columna y la cabeza le siguen ── */
    if (dt > 0) {
      this.reloj += dt;
      this.linea.push({ t: this.reloj, B: S.B, col: S.col, cab: S.cab });
      while (this.linea.length > 2 && this.linea[1].t < this.reloj - 0.3) this.linea.shift();
    }
    var B = S.B, col = S.col.slice(), cab = S.cab.slice();
    if (this.linea.length > 1) {
      B = this.hace(DEMORA.tronco).B; col = this.hace(DEMORA.columna).col.slice(); cab = this.hace(DEMORA.cabeza).cab.slice();
    }
    /* ── respira ── */
    this.fatiga += ((o.rep || o.esf > 0.3 ? 1 : 0) - this.fatiga) * (1 - Math.exp(-dt / (o.rep ? 12 : 7)));
    this.fase += dt * (0.23 + 0.2 * this.fatiga);
    var f = this.fase % 1;
    /* coge aire más deprisa de lo que lo suelta */
    var aire = f < 0.42 ? -Math.cos(f / 0.42 * Math.PI) : Math.cos((f - 0.42) / 0.58 * Math.PI);
    var hondo = 0.55 + 0.45 * this.fatiga;
    this.aire = aire * hondo;
    var sube = this.aire * (0.34 + 0.3 * this.fatiga);
    col[0] -= this.aire * 0.55; cab[0] += this.aire * 0.5;
    var hom = { i: [S.hom.i[0] + sube, S.hom.i[1]], d: [S.hom.d[0] + sube, S.hom.d[1]] };
    /* ── reparte el peso: solo de pie y quieto ── */
    var p = S.p;
    this.quietoK += ((o.dePie && largo(this.vS) < 3 ? 1 : 0) - this.quietoK) * (1 - Math.exp(-dt * (o.dePie ? 1.1 : 6)));
    if (this.quietoK > 0.01) {
      var vaiven = (0.62 * Math.sin(this.t * 0.83) + 0.38 * Math.sin(this.t * 1.37 + 1.3)) * this.quietoK, cerca = o.busto ? 1.5 : 1;
      p = mas(p, por(B[0], 0.85 * cerca * vaiven));
      col[1] -= 1.1 * cerca * vaiven; cab[2] += 0.9 * cerca * vaiven; cab[1] += 0.8 * cerca * Math.sin(this.t * 0.47 + 0.6) * this.quietoK;
      hom.i[0] += 0.3 * vaiven; hom.d[0] -= 0.3 * vaiven;
    }
    /* ── al frenar: la cabeza cabecea; los brazos sueltos se balancean ── */
    /* (en un ejercicio, apenas: un par de grados; de cerca, cuando presenta, algo más) */
    var tl = aLocal(E.Bc, this.tiron), tope = o.busto ? 6 : 2.6;
    cab[0] += this.cabP.paso(entre(0.085 * tl[1] - 0.08 * tl[2], -tope, tope), dt);
    cab[2] += this.cabR.paso(entre(-0.09 * tl[0], -tope, tope), dt);
    var tt = aLocal(E.Bt, this.tiron), brazos = { i: S.b.i, d: S.b.d }, manos = { i: S.m.i, d: S.m.d };
    /* ── cuando habla de cerca, la mano que tiene levantada marca el compás, y la cabeza asiente ── */
    this.hablaK += ((o.habla ? 1 : 0) - this.hablaK) * (1 - Math.exp(-dt * 5));
    var compas = (0.7 * Math.sin(this.t * 9.4) + 0.3 * Math.sin(this.t * 5.9 + 0.8)) * this.hablaK;
    cab[0] += 1.5 * Math.sin(this.t * 4.7) * this.hablaK;
    LADOS.forEach(function (lado) {
      var b = S.b[lado], m = S.m[lado], uw = aplicar(E.Bt, b.u), M = yo.bz[lado];
      /* cuánto cuelga (apunta al suelo), cuánto está suelta la mano, y si no está agarrada a nada */
      var cuelga = entre((-uw[1] - 0.72) / 0.2, 0, 1) * entre((0.8 - m.c) / 0.3, 0, 1) * (o.libres && o.libres[lado] === false ? 0 : 1);
      var amp = (o.busto ? 1 : 0.3) * cuelga;
      var lat = M[0].paso(entre(-0.075 * tt[0], -16, 16), dt) * amp, fro = M[1].paso(entre(0.075 * tt[2], -16, 16), dt) * amp;
      var u = b.u, l = b.l, cambia = false;
      if (Math.abs(lat) > 0.02 || Math.abs(fro) > 0.02) {
        u = girar(girar(u, [0, 0, 1], lat), [1, 0, 0], fro); l = girar(girar(l, [0, 0, 1], lat * 1.5), [1, 0, 0], fro * 1.5); cambia = true;
      }
      /* el brazo levantado, al hablar */
      var alto = entre((uw[1] + 0.55) / 0.5, 0, 1) * (o.busto ? 1 : 0);
      if (alto * Math.abs(compas) > 0.004) { l = girar(l, [1, 0, 0], -2.6 * compas * alto); u = girar(u, [1, 0, 0], -0.9 * compas * alto); cambia = true; }
      if (cambia) brazos[lado] = { u: unidad(u), l: unidad(l), b: b.b };
      /* los dedos de la mano suelta no se quedan de piedra */
      if (m.c < 0.7 && m.c > 0.12) {
        var dd = 0.035 * Math.sin(yo.t * 0.9 + (lado === 'i' ? 0 : 1.7)) + 0.02 * yo.aire;
        manos[lado] = { tipo: m.tipo, prono: m.prono, mun: m.mun, lat: m.lat, c: m.c + dd, ci: m.ci + dd * 0.8, ab: m.ab, pu: m.pu };
      }
    });
    return armar({ p: p, B: B, col: col, cab: cab, hom: hom, b: brazos, q: S.q, m: manos, t: S.t });
  };
  /* tras pintar: a qué velocidad va el tórax, y el tiron (el cambio de velocidad) que mueve los muelles */
  Vida.prototype.mide = function (E, dt) {
    if (!(dt > 0)) return;
    var p = E.tor;
    if (this.antes) {
      var d = menos(p, this.antes);
      if (largo(d) > 22) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; }        /* un salto: no es movimiento */
      else {
        var v = por(d, 1 / dt), kf = 1 - Math.exp(-dt / 0.05), ks = 1 - Math.exp(-dt / 0.22);
        this.vF = mezcla(this.vF, v, kf); this.vS = mezcla(this.vS, v, ks);
      }
    }
    this.antes = p; this.tiron = menos(this.vF, this.vS);
  };

  /* ───────────────────────── el director ─────────────────────────
     Toma una coreografía (posturas clave, la repetición, lo que va clavado) y la interpreta:
     dónde está Jérôme en cada instante, qué cara pone, cómo brillan los músculos, por dónde va
     la estela. No sabe de textos ni de botones: eso es del reproductor. */
  function refleja(P) {
    /* la misma postura, del otro lado */
    var R = {}, k;
    for (k in P) R[k] = P[k];
    if (P.pel) R.pel = [-P.pel[0], P.pel[1], P.pel[2]];
    if (P.giro) R.giro = [-(P.giro[0] || 0), P.giro[1] || 0, -(P.giro[2] || 0)];
    if (P.col) R.col = [P.col[0] || 0, -(P.col[1] || 0), -(P.col[2] || 0)];
    if (P.cab) R.cab = [P.cab[0] || 0, -(P.cab[1] || 0), -(P.cab[2] || 0)];
    if (P.hom && !P.hom.length) R.hom = { i: P.hom.d, d: P.hom.i };
    ['b', 'm', 'p', 't'].forEach(function (q) {
      delete R[q + 'i']; delete R[q + 'd'];
      if (P[q + 'i']) R[q + 'd'] = reflejo(P[q + 'i']);
      if (P[q + 'd']) R[q + 'i'] = reflejo(P[q + 'd']);
    });
    return R;
  }
  /* una postura sobre otra: lo que diga la segunda manda */
  function sobre(base, cambios) {
    var R = {}, k;
    for (k in base) R[k] = base[k];
    for (k in cambios) {
      R[k] = cambios[k];
      /* si se da un lado, el compartido deja de valer para ese lado; y al revés */
      if (/^[bmpt][id]$/.test(k) && R[k.charAt(0)] && !cambios[k.charAt(0)]) {
        var o = k.charAt(1) === 'i' ? 'd' : 'i';
        if (!R[k.charAt(0) + o]) R[k.charAt(0) + o] = o === 'i' ? R[k.charAt(0)] : reflejo(R[k.charAt(0)]);
        delete R[k.charAt(0)];
      } else if (/^[bmpt]$/.test(k)) { delete R[k + 'i']; delete R[k + 'd']; if (cambios[k + 'i']) R[k + 'i'] = cambios[k + 'i']; if (cambios[k + 'd']) R[k + 'd'] = cambios[k + 'd']; }
    }
    return R;
  }
  var PUNTOS = {
    mi: function (E) { return E.i.agarre; }, md: function (E) { return E.d.agarre; }, manos: function (E) { return mezcla(E.i.agarre, E.d.agarre, 0.5); },
    ci: function (E) { return E.i.cod; }, cd: function (E) { return E.d.cod; }, codos: function (E) { return mezcla(E.i.cod, E.d.cod, 0.5); },
    hi: function (E) { return E.i.hom; }, hd: function (E) { return E.d.hom; }, hombros: function (E) { return mezcla(E.i.hom, E.d.hom, 0.5); },
    ti: function (E) { return E.i.tob; }, td: function (E) { return E.d.tob; }, pies: function (E) { return mezcla(E.i.suela, E.d.suela, 0.5); },
    pi: function (E) { return mas(E.i.suela, por(E.i.punta, 6)); }, pd: function (E) { return mas(E.d.suela, por(E.d.punta, 6)); },
    tli: function (E) { return E.i.talon; }, tld: function (E) { return E.d.talon; },
    ri: function (E) { return E.i.rod; }, rd: function (E) { return E.d.rod; }, rodillas: function (E) { return mezcla(E.i.rod, E.d.rod, 0.5); },
    pel: function (E) { return E.pel; }, cab: function (E) { return mas(E.cab, aplicar(E.Bc, [0, 16, 2])); }, pecho: function (E) { return mas(E.tor, aplicar(E.Bt, [0, 12, 12])); },
    espalda: function (E) { return mas(E.lum, aplicar(E.Bl, [0, 6, -10])); }, abdomen: function (E) { return mas(E.lum, aplicar(E.Bl, [0, 3, 10.5])); },
    gluteos: function (E) { return mas(E.pel, aplicar(E.Bp, [0, -2, -12])); }, cadera: function (E) { return E.pel; }, barbilla: function (E) { return mas(E.cab, aplicar(E.Bc, [0, 1, 9])); }
  };

  /* ── el presentador (el busto, de frente) ──
     Las posturas clave de sus gestos. Se escriben como las de un ejercicio; lo que no se dice, cuelga suelto. */
  var PRESENTA = {
    listo: { m: { tipo: 'suelta' } },
    /* se asoma por un lado, ladeado (así espera en la portada); se recoge un poco, entra pasándose y se endereza */
    asoma: { pel: [-60, D.pelvis - 1, 0], giro: [0, 0, 21], cab: [-2, 6, 7], hom: { i: [1.5, 0], d: [0, 0] }, m: { tipo: 'suelta' } },
    asoma0: { pel: [-65, D.pelvis - 2, 0], giro: [0, 0, 25], cab: [-3, 8, 9], hom: { i: [2, 0], d: [0, 0] }, m: { tipo: 'suelta' } },
    entra: { pel: [5, D.pelvis, 0], giro: [0, 0, -5], cab: [0, 0, -3], m: { tipo: 'suelta' } },
    /* la misma entrada, con la mano ya subiendo: llega saludando */
    entraS: { pel: [5, D.pelvis, 0], giro: [0, 0, -5], cab: [0, 0, -3], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 70, z: 48, g: 0, c: 118 }, mi: { tipo: 'abierta', prono: 0 }, md: { tipo: 'suelta' } },
    /* saluda con la mano: el antebrazo va y viene, y la muñeca llega un poco después */
    saluda1: { cab: [-2, 0, 5], col: [0, 2.5, 0], hom: { i: [2.4, 0], d: [0, 0] }, bi: { e: 126, z: 66, g: 0, c: 46 }, mi: { tipo: 'abierta', prono: 0, lat: -13 }, md: { tipo: 'suelta' } },
    saluda2: { cab: [-2, 0, 7], col: [0, 3.5, 0], hom: { i: [2.8, 0], d: [0, 0] }, bi: { e: 122, z: 66, g: 0, c: 88 }, mi: { tipo: 'abierta', prono: 0, lat: 13 }, md: { tipo: 'suelta' } },
    /* el saludo de visera: sube el codo, la mano plana a la ceja, y sale */
    visera0: { cab: [0, -3, 2], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 58, z: 58, g: 24, c: 104 }, mi: { tipo: 'plana', prono: -60 }, md: { tipo: 'suelta' } },
    visera1: { cab: [-3, -5, 4], hom: { i: [2, 0], d: [0, 0] }, bi: { e: 80, z: 50, g: 30, c: 150 }, mi: { tipo: 'plana', prono: -90 }, md: { tipo: 'suelta' } },
    visera2: { cab: [-5, 4, 5], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 84, z: 56, g: 20, c: 104 }, mi: { tipo: 'plana', prono: -70 }, md: { tipo: 'suelta' } },
    /* «¡vamos!»: recoge el puño y lo sube */
    vamos0: { pel: [0, D.pelvis - 3.2, 0], giro: [0, 5, 0], cab: [5, 0, 0], bi: { e: 26, z: 26, g: 0, c: 104 }, mi: { tipo: 'puno', prono: -20 }, md: { tipo: 'suelta' } },
    vamos1: { pel: [0, D.pelvis + 1.6, 0], giro: [0, -4, 0], col: [-2, 0, 0], cab: [-7, 0, 4], hom: { i: [3, 0], d: [0, 0] }, bi: { e: 100, z: 52, g: 0, c: 122 }, mi: { tipo: 'puno', prono: -20 }, md: { tipo: 'puno' } },
    vamos2: { cab: [-3, 0, 3], hom: { i: [1.6, 0], d: [0, 0] }, bi: { e: 90, z: 52, g: 0, c: 114 }, mi: { tipo: 'puno', prono: -20 }, md: { tipo: 'suelta' } },
    /* un consejo: el índice arriba, y lo menea */
    consejo0: { cab: [3, 0, 0], bi: { e: 24, z: 30, g: 0, c: 92 }, mi: { tipo: 'indice', prono: 0 }, md: { tipo: 'suelta' } },
    consejo: { cab: [2, 0, 4], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 42, z: 36, g: 0, c: 118 }, mi: { tipo: 'indice', prono: 0 }, md: { tipo: 'suelta' } },
    consejoA: { cab: [2, 3, 5], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 43, z: 36, g: 0, c: 118 }, mi: { tipo: 'indice', prono: 0, lat: 15 }, md: { tipo: 'suelta' } },
    consejoB: { cab: [2, -3, 3], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 43, z: 36, g: 0, c: 118 }, mi: { tipo: 'indice', prono: 0, lat: -15 }, md: { tipo: 'suelta' } },
    /* o lo explica con la palma abierta, hacia arriba */
    explica0: { cab: [3, 0, 0], bi: { e: 18, z: 26, g: 0, c: 72 }, mi: { tipo: 'suelta', prono: -50 }, md: { tipo: 'suelta' } },
    explica: { cab: [1, 4, 4], col: [0, 2, 0], hom: { i: [1.4, 0], d: [0, 0] }, bi: { e: 34, z: 34, g: 0, c: 108 }, mi: { tipo: 'abierta', prono: -90 }, md: { tipo: 'suelta' } },
    /* el pulgar arriba: lo recoge, lo saca pasándose y lo asienta */
    pulgar0: { cab: [3, 0, 0], bi: { e: 22, z: 26, g: 0, c: 86 }, mi: { tipo: 'puno', prono: 0 }, md: { tipo: 'suelta' } },
    pulgar1: { cab: [-3, 0, 7], hom: { i: [2.6, 0], d: [0, 0] }, bi: { e: 56, z: 42, g: 0, c: 110 }, mi: { tipo: 'pulgar', prono: 0 }, md: { tipo: 'suelta' } },
    pulgar: { cab: [0, 0, 5], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 46, z: 40, g: 0, c: 104 }, mi: { tipo: 'pulgar', prono: 0 }, md: { tipo: 'suelta' } },
    /* los dos pulgares */
    dos0: { cab: [4, 0, 0], b: { e: 20, z: 28, g: 0, c: 84 }, m: { tipo: 'puno', prono: 0 } },
    dos1: { cab: [-5, 0, 0], hom: [2.6, 0], b: { e: 55, z: 50, g: 0, c: 110 }, m: { tipo: 'pulgar', prono: 0 } },
    dos: { cab: [-2, 0, 0], hom: [1.2, 0], b: { e: 46, z: 47, g: 0, c: 105 }, m: { tipo: 'pulgar', prono: 0 } },
    /* saca bíceps */
    fuerza0: { cab: [3, 0, 0], b: { e: 50, z: 76, g: 0, c: 132 }, m: { tipo: 'puno', prono: 0 } },
    fuerza1: { cab: [-4, 0, 0], hom: [2.4, 0], b: { e: 95, z: 84, g: 0, c: 130 }, m: { tipo: 'puno', prono: 0 } },
    fuerza: { cab: [-2, 0, 0], hom: [1.4, 0], b: { e: 92, z: 84, g: 0, c: 118 }, m: { tipo: 'puno', prono: 0 } }
  };
  /* los gestos: de qué postura salen, la secuencia ([postura, segundos, curva]) y la cara de cada momento ([segundo, cara]).
     Como en el dibujo animado de siempre: antes del gesto, lo recoge; llega pasándose un poco; y se asienta. */
  var GESTOS = {
    saludo: { desde: 'asoma', sec: [['asoma0', 0.17, 'sale'], ['entraS', 0.42, 'suave'], ['saluda1', 0.3, 'suave'], ['saluda2', 0.2], ['saluda1', 0.2], ['saluda2', 0.2], ['saluda1', 0.2], ['saluda2', 0.2], ['listo', 0.6]],
      cara: [[0, 'ilusion'], [2.3, 'contento']] },
    visera: { desde: 'asomaD', sec: [['asomaD0', 0.17, 'sale'], ['entraD', 0.4, 'suave'], ['listo', 0.2], ['visera0', 0.3], ['visera1', 0.17, 'sale'], ['visera1', 0.32], ['visera2', 0.17, 'sale'], ['visera2', 0.4], ['listo', 0.6]],
      cara: [[0, 'ilusion'], [1.1, 'guino'], [2.1, 'contento']] },
    vamos: { desde: 'asoma', sec: [['asoma0', 0.17, 'sale'], ['entra', 0.4, 'suave'], ['vamos0', 0.3], ['vamos1', 0.25, 'sale'], ['vamos2', 0.2], ['vamos2', 0.5], ['listo', 0.6]],
      cara: [[0, 'ilusion'], [0.85, 'concentra'], [1.2, 'risa'], [2.1, 'contento']] },
    consejo: { desde: 'listo', sec: [['consejo0', 0.26], ['consejo', 0.24, 'sale'], ['consejoA', 0.2], ['consejoB', 0.24], ['consejoA', 0.24], ['consejo', 0.26]], cara: [[0, 'atento']] },
    explica: { desde: 'listo', sec: [['explica0', 0.26], ['explica', 0.34, 'sale']], cara: [[0, 'atento']] },
    pulgar: { desde: 'listo', sec: [['pulgar0', 0.28], ['pulgar1', 0.17, 'sale'], ['pulgar', 0.2]], cara: [[0, 'contento'], [0.42, 'guino']] },
    dos: { desde: 'listo', sec: [['dos0', 0.28], ['dos1', 0.17, 'sale'], ['dos', 0.2]], cara: [[0, 'contento'], [0.42, 'risa']] },
    fuerza: { desde: 'listo', sec: [['fuerza0', 0.34], ['fuerza1', 0.22, 'sale'], ['fuerza', 0.22], ['fuerza1', 0.24], ['fuerza', 0.26]], cara: [[0, 'contento'], [0.36, 'esfuerzo'], [0.9, 'guino']] }
  };
  /* el plano de cerca: la escala, a dónde mira, y cuánto se acerca (y baja) mientras dura */
  var BUSTO = { esc: 3.5, picado: 4, mira: [0, D.pelvis + 44, 0], oy: 268, acerca: 0.04, baja: 5 };
  var GESTOS_DE = { cabecera: ['saludo', 'visera', 'vamos'], consejo: ['consejo', 'explica'], cierre: ['pulgar', 'dos', 'fuerza'] };
  function Director(esc) {
    this.esc = esc; this.K = {}; this.rep = []; this.T = 1; this.clavos = [];
    this.modo = 'postura'; this.meta = null; this.tau = 0; this.w = 1; this.Eprev = null; this.E = null;
    this.vel = 1; this.t = 0; this.reps = 0; this.esf = 0;
    this.rastro = []; this.rastroDe = null; this.marcas = [];
    this.gRastro = crear('g', { 'class': 'tge-rastro' }, esc.detras);
    this.pRastro = [0, 1, 2, 3].map(function (i) { return crear('path', { fill: 'none', stroke: '#F5C76B', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 2 + i * 1.1, opacity: 0.16 + i * 0.2 }, this.gRastro); }, this);
    this.pPunta = crear('circle', { r: 4.2, fill: '#fff6d8', stroke: '#F5C76B', 'stroke-width': 1.6 }, this.gRastro);
    this.gMarcas = crear('g', { 'class': 'tge-marcas' }, esc.encima);
    this.cMarcas = [0, 1, 2, 3].map(function () { var g = crear('g', { opacity: 0 }, this.gMarcas); crear('circle', { r: 13, fill: 'none', stroke: '#F5C76B', 'stroke-width': 2.6 }, g); crear('circle', { r: 13, fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.8 }, g); return g; }, this);
    this.vistas = [{ rumbo: 35 }]; this.vista = 0; this.busto = false; this.tBusto = 0;
    this.vida = new Vida(); this.gestoDe = null; this.gestoN = ''; this.tGesto = 0; this.metas = []; this.cortes = 0;
  }
  /* carga una coreografía */
  Director.prototype.cargar = function (co) {
    var yo = this, n;
    this.co = co; this.K = {};
    for (n in PRESENTA) this.K[n] = resolver(PRESENTA[n]);
    /* y por el otro lado */
    ['asoma', 'asoma0', 'entra'].forEach(function (q) { yo.K[q + 'D'] = resolver(refleja(PRESENTA[q])); });
    this.K.asomaD0 = this.K.asoma0D;
    for (n in co.posturas) this.K[n] = resolver(co.posturas[n]);
    this.esc.poner(co.material || []);
    /* la repetición: de dónde sale cada tramo */
    var desde = co.inicio || 'a', t0 = 0;
    this.rep = (co.rep || []).map(function (s, i) {
      var r = { de: desde, a: s[0], t0: t0, dur: s[1], curva: CURVA[s[2] || (s[0] === desde ? 'lineal' : 'suave')] || CURVA.suave, esf: (co.esfuerzo || []).indexOf(i) >= 0, clavos: s[3] };
      desde = s[0]; t0 += s[1]; return r;
    });
    this.T = t0 || 1;
    this.inicio = co.inicio || 'a';
    this.clavos = (co.clavos || []).map(clavo);
    this.rastroDe = co.rastro || null; this.rastro = [];
    this.modo = 'postura'; this.meta = this.inicio; this.tau = 0; this.w = 1; this.Eprev = null; this.reps = 0; this.sec = null;
    this.vida.corte(); this.cortes++; this.gestoDe = null;
    this.encuadrar();
  };
  function clavo(s) {
    /* 'ti' · 'mi' (en línea recta entre posturas) · 'mi@0:31' (al agarre del material 0, a 31 cm del centro) · 'mi=x,y,z' (a un punto) */
    var m = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/.exec(s);
    return m ? { que: m[1], mat: m[2] == null ? null : Number(m[2]), x: Number(m[3] || 0), en: m[4] == null ? null : [Number(m[4]), Number(m[5]), Number(m[6])] } : null;
  }
  /* las posturas en las que ya no hay nada clavado (se ha soltado de la barra) */
  Director.prototype.suelto = function (n) { return !!(this.co && this.co.sinClavos && this.co.sinClavos.indexOf(n) >= 0); };
  /* el esqueleto de la repetición en el instante tau, aún sin clavar, y con qué se clava */
  Director.prototype.mezclaRep = function (tau) {
    var i, s = this.rep[this.rep.length - 1];
    for (i = 0; i < this.rep.length; i++) if (tau < this.rep[i].t0 + this.rep[i].dur) { s = this.rep[i]; break; }
    var u = entre((tau - s.t0) / s.dur, 0, 1), e = s.curva(u), A = this.K[s.de], B = this.K[s.a];
    this.tramo = s; this.tramoU = u;
    return { E: s.de === s.a ? A : mezclar(A, B, e), A: A, B: B, e: e, clavos: s.clavos ? s.clavos.map(clavo) : this.clavos };
  };
  Director.prototype.clavar = function (E, A, B, e, clavos) {
    if (!clavos || !clavos.length) return E;
    var mats = this.esc.material, i, S, lista = [];
    for (i = 0; i < mats.length; i++) if (mats[i].antes) mats[i].colocar(E);
    /* a dónde va cada cosa */
    for (i = 0; i < clavos.length; i++) {
      var c = clavos[i]; if (!c) continue;
      var k = c.que.charAt(1), meta;
      if (c.que.charAt(0) === 't') meta = c.en || mezcla(A[k].tob, B[k].tob, e);
      else if (c.mat != null && mats[c.mat] && mats[c.mat].agarre) meta = munecaPara(E, k, mats[c.mat].agarre(c.x));
      else meta = c.en || mezcla(A[k].mun, B[k].mun, e);
      lista.push([c.que, meta]);
    }
    if (!lista.length) return E;
    /* si la vida (el aire, el peso) deja algo un pelo fuera de alcance, es el cuerpo el que se arrima: la mano no suelta
       la barra. Mover la cadera mueve hombros y caderas lo mismo, así que se va corrigiendo lo que más falta, unas vueltas. */
    var corr = [0, 0, 0], v, l, peor, falta, tope, vuelta, q, L, brazo;
    for (vuelta = 0; vuelta < 4; vuelta++) {
      peor = null; falta = 0.004;
      for (i = 0; i < lista.length; i++) {
        q = lista[i]; L = E[q[0].charAt(1)]; brazo = q[0].charAt(0) === 'm'; tope = (brazo ? D.brazo + D.antebrazo : D.muslo + D.pierna) - 0.02;
        v = menos(q[1], mas(brazo ? L.hom : L.cad, corr)); l = largo(v);
        if (l - tope > falta) { falta = l - tope; peor = por(v, falta / l); }
      }
      if (!peor) break;
      corr = mas(corr, peor);
    }
    /* se trabaja sobre una copia del estado: la postura clave no se toca */
    S = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: { i: E.S.q.i, d: E.S.q.d }, m: E.S.m, t: E.S.t };
    l = largo(corr);
    if (l > 0) { if (l > 3) corr = por(corr, 3 / l); S.p = mas(S.p, corr); E = armar(S); }
    var E2 = { S: S, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d };
    for (i = 0; i < lista.length; i++) { clavar(E2, lista[i][0], lista[i][1]); this.metas.push(lista[i]); }
    return armar(S);
  };
  /* el esqueleto de la repetición en el instante tau, con lo clavado en su sitio (sin la vida: para medir y comprobar) */
  Director.prototype.enRep = function (tau) { var r = this.mezclaRep(tau); return this.clavar(r.E, r.A, r.B, r.e, r.clavos); };
  /* ── qué hace ── */
  Director.prototype.aPostura = function (nombre, seg) {
    if (!this.K[nombre]) return;
    this.Eprev = this.E; this.w = this.E && seg !== 0 ? 0 : 1; this.durW = seg || 0.7;
    this.metaPrev = this.meta; this.modo = 'postura'; this.meta = nombre; this.sec = null; this.gestoDe = null;
    this.vida.linea = []; if (seg === 0) { this.vida.corte(); this.cortes++; }
  };
  Director.prototype.aRep = function (seg) {
    if (!this.rep.length) return this.aPostura(this.inicio, seg);
    if (this.modo === 'rep') return;
    this.Eprev = this.E; this.w = this.E && seg !== 0 ? 0 : 1; this.durW = seg || 0.6;
    this.modo = 'rep'; this.tau = 0; this.rastro = []; this.sec = null; this.gestoDe = null;
    this.vida.linea = [];
  };
  /* una secuencia que se toca una vez (por ejemplo, sacar la barra del soporte): [[postura, segundos, curva], …] */
  Director.prototype.aSecuencia = function (lista, desde) {
    var de = desde || this.meta || this.inicio, t0 = 0;
    this.sec = lista.map(function (s) { var r = { de: de, a: s[0], t0: t0, dur: s[1], curva: CURVA[s[2] || 'suave'] || CURVA.suave, clavos: s[3] }; de = s[0]; t0 += s[1]; return r; });
    this.secT = t0; this.tau = 0; this.modo = 'sec'; this.Eprev = this.E; this.w = this.E ? 0 : 1; this.durW = 0.45; this.rastro = [];
    this.metaPrev = this.meta;
    this.meta = lista[lista.length - 1][0];
    this.vida.linea = []; this.gestoDe = null;
  };
  /* un gesto del presentador: sale de su postura, toca la secuencia y va poniendo las caras */
  Director.prototype.gesto = function (nombre, deGolpe) {
    var g = GESTOS[nombre]; if (!g) return;
    var desde = g.desde, sec = g.sec;
    /* con «reducir movimiento» del sistema no entra deslizándose por un lado: ya está ahí, y hace su gesto */
    if (quieto() && /^asoma/.test(desde)) { desde = 'listo'; sec = sec.filter(function (q) { return !/^(asoma|entra)/.test(q[0]); }); }
    /* de golpe (tras un corte, o en la portada): arranca en su primera postura; si no, llega a ella desde donde esté */
    if (deGolpe || !this.E) { this.aPostura(desde, 0); this.E = this.K[desde]; }
    this.aSecuencia(sec, desde); if (deGolpe) this.w = 1;
    this.gestoDe = g; this.gestoN = nombre; this.tGesto = 0; this.caraN = 0;
  };
  /* cuánto dura un gesto */
  Director.prototype.duraGesto = function (nombre) { var g = GESTOS[nombre], t = 0; if (g) g.sec.forEach(function (q) { t += q[1]; }); return t; };
  /* el gesto que le toca a un momento (cabecera, consejo, cierre): uno fijo por ejercicio, para que no sean todos iguales */
  Director.prototype.gestoPara = function (momento, n) { var l = GESTOS_DE[momento] || []; return l.length ? l[(n >>> 0) % l.length] : null; };
  /* un cuadro: avanza el tiempo y pinta */
  Director.prototype.cuadro = function (dt, parado) {
    var esc = this.esc, E, v = parado ? 0 : this.vel, yo = this, A, B, e = 0, clavos = null, i;
    this.t += dt;
    if (this.modo === 'rep') {
      this.tau += dt * v;
      if (this.tau >= this.T) { this.tau -= this.T; this.reps++; if (this.alRepetir) this.alRepetir(this.reps); }
      var r = this.mezclaRep(this.tau); E = r.E; A = r.A; B = r.B; e = r.e; clavos = r.clavos;
      this.esf += ((this.tramo.esf ? 1 : 0) - this.esf) * (1 - Math.exp(-dt * 7));
    } else if (this.modo === 'sec') {
      this.tau = Math.min(this.secT, this.tau + dt * v);
      var s = this.sec[this.sec.length - 1];
      for (i = 0; i < this.sec.length; i++) if (this.tau < this.sec[i].t0 + this.sec[i].dur) { s = this.sec[i]; break; }
      e = s.curva(entre((this.tau - s.t0) / s.dur, 0, 1)); A = this.K[s.de]; B = this.K[s.a];
      this.secDe = s.de; this.secU = entre((this.tau - s.t0) / s.dur, 0, 1);
      E = s.de === s.a ? A : mezclar(A, B, e); clavos = s.clavos ? s.clavos.map(clavo) : this.clavos;
      this.esf += (0 - this.esf) * (1 - Math.exp(-dt * 5));
      if (this.tau >= this.secT) { this.modo = 'postura'; this.w = 1; }
    } else {
      E = this.K[this.meta] || this.K.listo; A = B = E;
      if (this.co && this.meta !== 'listo' && !this.suelto(this.meta)) clavos = this.clavos;
      this.esf += ((this.co && this.co.isometrico && this.meta === this.co.isometrico ? 0.8 : 0) - this.esf) * (1 - Math.exp(-dt * 4));
    }
    /* de cerca presenta: ahí no hay barra que agarrar ni suelo que pisar */
    if (this.busto) clavos = null;
    /* el gesto del presentador va poniendo sus caras */
    if (this.gestoDe) {
      this.tGesto += dt * v;
      var caras = this.gestoDe.cara || [];
      while (this.caraN < caras.length && caras[this.caraN][0] <= this.tGesto) { esc.cab.emocion(caras[this.caraN][1]); if (this.caraN) esc.cab.parpadea(); this.caraN++; }
    }
    /* la vida (respira, llega por partes, cabecea al frenar), antes de clavar: lo clavado no se mueve */
    var libres = { i: true, d: true }, dePie = false;
    if (clavos) for (i = 0; i < clavos.length; i++) if (clavos[i] && clavos[i].que.charAt(0) === 'm') libres[clavos[i].que.charAt(1)] = false;
    /* de pie: el tronco derecho y la cadera a su altura (sentado o tumbado, descansa en algo: no se balancea) */
    dePie = E.S.B[1][1] > 0.94 && E.S.p[1] > D.pelvis - 9 && this.modo === 'postura' && this.w >= 1 && !(this.co && this.co.isometrico === this.meta && !this.busto);
    E = this.vida.paso(E, parado ? 0 : dt, { busto: this.busto, esf: this.esf, rep: this.modo === 'rep', dePie: dePie, habla: this.busto && esc.cab.habla > esc.cab.t, libres: libres });
    this.metas = [];            /* lo que se clava en este cuadro, y dónde (lo coteja la auditoría: lo clavado no se mueve) */
    if (clavos && clavos.length) E = this.clavar(E, A, B, e, clavos);
    /* de donde estaba a donde va */
    if (this.w < 1 && this.Eprev) {
      this.w = Math.min(1, this.w + dt / this.durW);
      E = mezclar(this.Eprev, E, CURVA.suave(this.w));
    }
    this.E = E;
    this.vida.mide(E, parado ? 0 : dt);
    /* la cámara: hacia su vista, con suavidad; de cerca, se va acercando muy despacio */
    var cam = esc.cam, V = this.vistas[this.vista], kk = 1 - Math.exp(-dt * 5.5);
    if (this.busto) {
      if (!parado) this.tBusto += dt;
      var cerca = quieto() ? 0 : CURVA.suave(entre(this.tBusto / 5, 0, 1));
      V = { rumbo: this.vBusto.rumbo, picado: this.vBusto.picado, esc: this.vBusto.esc * (1 + BUSTO.acerca * cerca), mira: this.vBusto.mira, ox: this.vBusto.ox, oy: this.vBusto.oy + BUSTO.baja * cerca };
    }
    if (this.salto) { kk = 1; this.salto = false; }
    var dr = V.rumbo - cam.rumbo; while (dr > 180) dr -= 360; while (dr < -180) dr += 360;
    cam.rumbo += dr * kk; cam.esc += (V.esc - cam.esc) * kk; cam.ox += (V.ox - cam.ox) * kk; cam.oy += (V.oy - cam.oy) * kk; cam.picado += (V.picado - cam.picado) * kk;
    cam.mira = mezcla(cam.mira, V.mira, kk);
    /* la mirada: a quien le escucha; cuando el paso nombra algo, un vistazo a eso; y, de cerca, no se queda clavada */
    var cab = esc.cab, mx = 0, my = 0, edad = this.t - (this.tMarca || 0);
    if (!this.busto && this.marcas.length && edad > 0.3 && edad < 1.7 && cam.k) {
      var pm = cam.p(PUNTOS[this.marcas[0]](E)), pc = cam.p(E.cab), up = cam.d(E.Bc[1]), ru = Math.atan2(up[0], -up[1]);
      var gx = pm[0] - pc[0], gy = pm[1] - pc[1], gl = Math.sqrt(gx * gx + gy * gy);
      if (gl > 16 * cam.esc) { gx /= gl; gy /= gl; mx = gx * Math.cos(ru) + gy * Math.sin(ru); my = -gx * Math.sin(ru) + gy * Math.cos(ru); }
    } else if (this.busto && !quieto()) {
      var ciclo = this.t / 3.1, fz = ciclo - Math.floor(ciclo), nn = Math.floor(ciclo);
      if (fz > 0.86) { mx = 0.5 * Math.sin(nn * 12.9898 + 4.1); my = 0.28 * Math.sin(nn * 78.233 + 1.7); }
    }
    cab.m.mx = mx; cab.m.my = my;
    /* lo que aún no se ha cogido (la barra en el suelo) se queda en su sitio */
    this.ctx = this.ctx || {};
    var rp = this.co && this.co.reposo;
    this.ctx.reposo = !!rp && !this.busto && ((this.modo === 'postura' && rp.indexOf(this.meta) >= 0) ||
      (this.modo === 'sec' && rp.indexOf(this.secDe) >= 0 && this.secU < 0.97) ||
      (this.modo === 'postura' && this.w < 0.96 && rp.indexOf(this.metaPrev) >= 0));
    /* el material, la figura y lo demás */
    var mats = esc.material, j;
    for (j = 0; j < mats.length; j++) { mats[j].colocar(E, this.ctx); mats[j].oculto = this.busto; }
    esc.fig.pulso = this.busto ? 0 : 0.72 + 0.28 * this.esf + 0.06 * Math.sin(this.t * 5);
    esc.fig.aire = this.vida.aire;
    esc.cab.paso(dt, parado);
    esc.soloFigura = this.busto;
    esc.pintar(E, this.ctx);
    this.pintarRastro(E, dt, v);
    this.pintarMarcas(E);
    return E;
  };
  /* la estela del punto que se sigue */
  Director.prototype.pintarRastro = function (E, dt, v) {
    var f = this.rastroDe && PUNTOS[this.rastroDe], cam = this.esc.cam, yo = this;
    var ve = f && (this.modo === 'rep' || this.modo === 'sec') && !this.busto && this.rastroVisible !== false;
    if (!ve) { if (this.gRastro._v !== 0) { this.gRastro._v = 0; this.gRastro.setAttribute('opacity', 0); } this.rastro = this.modo === 'rep' ? this.rastro : []; if (!f || this.busto) return; }
    else if (this.gRastro._v !== 1) { this.gRastro._v = 1; this.gRastro.setAttribute('opacity', 1); }
    if (f && v > 0 && (this.modo === 'rep' || this.modo === 'sec')) {
      this.rastro.push(f(E));
      var max = Math.round(this.T * 0.92 / Math.max(dt, 1 / 120) / Math.max(v, 0.25));
      max = entre(max, 12, 260);
      while (this.rastro.length > max) this.rastro.shift();
    }
    if (!ve) return;
    var n = this.rastro.length, P = this.rastro.map(function (p) { return cam.p(p); });
    this.pRastro.forEach(function (el, i) {
      var a = Math.floor(n * i / 4), b = Math.min(n, Math.floor(n * (i + 1) / 4) + 1), d = '';
      for (var q = a; q < b; q++) d += (q === a ? 'M' : 'L') + n1(P[q][0]) + ',' + n1(P[q][1]);
      pon(el, 'd', d);
    });
    if (n) { pon(this.pPunta, 'cx', n1(P[n - 1][0])); pon(this.pPunta, 'cy', n1(P[n - 1][1])); pon(this.pPunta, 'opacity', '1'); } else pon(this.pPunta, 'opacity', '0');
  };
  /* los anillos sobre lo que nombra el paso */
  Director.prototype.marcar = function (nombres) { this.marcas = (nombres || []).filter(function (n) { return PUNTOS[n]; }).slice(0, 4); this.tMarca = this.t; };
  Director.prototype.pintarMarcas = function (E) {
    var cam = this.esc.cam, yo = this, edad = this.t - (this.tMarca || 0);
    this.cMarcas.forEach(function (g, i) {
      var nom = yo.marcas[i];
      if (!nom || yo.busto || edad > 4.2) { pon(g, 'opacity', '0'); return; }
      var p = cam.p(PUNTOS[nom](E)), late = 1 + 0.16 * Math.sin(yo.t * 6 - i), op = Math.min(1, edad * 4) * Math.min(1, (4.2 - edad) * 1.6);
      pon(g, 'transform', 'translate(' + n1(p[0]) + ',' + n1(p[1]) + ') scale(' + n2(late) + ')'); pon(g, 'opacity', n2(op));
    });
  };
  /* ── el encuadre: que todo lo que pasa quepa, visto desde cada vista ── */
  Director.prototype.encuadrar = function () {
    var co = this.co, pts = [], n, yo = this, mats = this.esc.material;
    var usadas = {}; usadas[this.inicio] = 1;
    (co.rep || []).forEach(function (s) { usadas[s[0]] = 1; });
    (co.encuadra || []).forEach(function (s) { usadas[s] = 1; });
    for (n in usadas) {
      var E = this.suelto(n) ? this.K[n] : this.clavar(this.K[n], this.K[n], this.K[n], 0, this.clavos);
      pts.push(mas(E.cab, aplicar(E.Bc, [0, 37, 2])), mas(E.cab, aplicar(E.Bc, [0, 16, 13])), mas(E.cab, aplicar(E.Bc, [0, 16, -13])), E.pel);
      LADOS.forEach(function (k) { pts.push(E[k].dedos, E[k].cod, E[k].rod, E[k].dedosPie, E[k].talon, E[k].hom); });
      mats.forEach(function (m) { m.colocar(E); if (m.extremos) pts = pts.concat(m.extremos(E)); });
    }
    var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    pts.forEach(function (p) { for (var i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } });
    mn[1] = Math.min(mn[1], 0);
    var mira = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
    var rumbos = co.vista || [35, 90], picado = co.picado == null ? 9 : co.picado, cam = new Camara();
    /* cada vista, con su escala: lo que se ve cabe entre la barra de arriba y el borde de abajo */
    this.vistas = rumbos.map(function (r) {
      cam.rumbo = r; cam.picado = picado; cam.esc = 1; cam.ox = 0; cam.oy = 0; cam.mira = mira; cam.calc();
      var a = [1e9, 1e9], b = [-1e9, -1e9];
      pts.forEach(function (p) { var q = cam.p(p); a[0] = Math.min(a[0], q[0]); a[1] = Math.min(a[1], q[1]); b[0] = Math.max(b[0], q[0]); b[1] = Math.max(b[1], q[1]); });
      var e = entre(Math.min((ANCHO - 36) / (b[0] - a[0] + 12), (ALTO - 96) / (b[1] - a[1] + 8)) * (co.zoom || 1), 0.9, 2.6);
      return { rumbo: r, picado: picado, esc: e, mira: mira, ox: ANCHO / 2 - (a[0] + b[0]) / 2 * e, oy: 58 + (ALTO - 96) / 2 - (a[1] + b[1]) / 2 * e + 4 };
    });
    /* el busto: de frente, de cerca, para saludar y para los consejos */
    this.vBusto = { rumbo: 0, picado: BUSTO.picado, esc: BUSTO.esc, mira: BUSTO.mira, ox: ANCHO / 2, oy: BUSTO.oy };
    this.vista = Math.min(this.vista, this.vistas.length - 1);
    this.salto = true;
  };
  Director.prototype.girar = function () { this.vista = (this.vista + 1) % this.vistas.length; return this.vista; };
  Director.prototype.aBusto = function (si) { if (this.busto !== !!si) { this.busto = !!si; this.salto = true; this.tBusto = 0; this.vida.corte(); this.cortes++; this.esc.cab.corte = true; } };

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
      vista: [72, 24], picado: 16, rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti', 'td', 'mi', 'md'],
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
      vista: [78, 28], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      posturas: { a: tabla(20.2, { b: juntas }), b: tabla(3.2, { b: juntas, cab: [-22, 0, 0] }) },
      rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
      pasos: ['a', 'a', 'rep']
    };
  })();

  /* ══════════ PECHO ══════════ */
  (function () {
    var tumbado = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] }, m: PRONO };
    COREO['press-banca-barra'] = {
      vista: [60, 18], rastro: 'manos', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      material: [['banco', { largo: 124 }], ['soporte', { z: -36, alto: 106, ancho: 52 }], ['barra']],
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
      vista: [78, 28], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
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
    vista: [50, 0], rastro: 'manos', esfuerzo: [0], clavos: ['mi', 'md'], material: [['barra', { discos: 17 }]],
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
      vista: [80, 30], picado: 16, isometrico: 'a',
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
      vista: [74, 26], picado: 16, rastro: 'hombros', esfuerzo: [0, 1], clavos: ['ti', 'td'],
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
      vista: [72, 30], picado: 16, rastro: 'md', esfuerzo: [0, 1, 4, 5],
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

  /* ───────────────────────── el reproductor ─────────────────────────
     El «vídeo» de un ejercicio: la cabecera (Jérôme saluda), un tramo por cada paso de la ficha
     (el texto del paso, tal cual, debajo; arriba, lo que ese paso describe) y el cierre. Con sus
     mandos: pausa, paso a paso, despacio, girar y la voz del móvil. */
  var ENT_UI = {
    "entCon": {"es": "Jérôme se lo enseña", "en": "Jérôme shows you how", "fr": "Jérôme vous montre", "de": "Jérôme zeigt es Ihnen", "it": "Jérôme Le mostra come", "nl": "Jérôme doet het voor", "zh": "Jérôme 为您示范", "zht": "Jérôme 為您示範", "bg": "Jérôme ще ви покаже", "pl": "Jérôme pokazuje, jak to zrobić"},
    "entVideo": {"es": "Vídeo del ejercicio", "en": "Exercise video", "fr": "Vidéo de l’exercice", "de": "Video zur Übung", "it": "Video dell’esercizio", "nl": "Video van de oefening", "zh": "动作视频", "zht": "動作影片", "bg": "Видео на упражнението", "pl": "Film z ćwiczeniem"},
    "entPaso": {"es": "Paso {n} de {N}", "en": "Step {n} of {N}", "fr": "Étape {n} sur {N}", "de": "Schritt {n} von {N}", "it": "Passo {n} di {N}", "nl": "Stap {n} van {N}", "zh": "第 {n} 步，共 {N} 步", "zht": "第 {n} 步，共 {N} 步", "bg": "Стъпка {n} от {N}", "pl": "Krok {n} z {N}"},
    "entPlay": {"es": "Reproducir", "en": "Play", "fr": "Lire", "de": "Abspielen", "it": "Riproduci", "nl": "Afspelen", "zh": "播放", "zht": "播放", "bg": "Пусни", "pl": "Odtwórz"},
    "entPausa": {"es": "Pausa", "en": "Pause", "fr": "Pause", "de": "Pause", "it": "Pausa", "nl": "Pauze", "zh": "暂停", "zht": "暫停", "bg": "Пауза", "pl": "Pauza"},
    "entAnt": {"es": "Paso anterior", "en": "Previous step", "fr": "Étape précédente", "de": "Vorheriger Schritt", "it": "Passo precedente", "nl": "Vorige stap", "zh": "上一步", "zht": "上一步", "bg": "Предишна стъпка", "pl": "Poprzedni krok"},
    "entSig": {"es": "Paso siguiente", "en": "Next step", "fr": "Étape suivante", "de": "Nächster Schritt", "it": "Passo successivo", "nl": "Volgende stap", "zh": "下一步", "zht": "下一步", "bg": "Следваща стъпка", "pl": "Następny krok"},
    "entLento": {"es": "A cámara lenta", "en": "Slow motion", "fr": "Au ralenti", "de": "Zeitlupe", "it": "Al rallentatore", "nl": "Vertraagd", "zh": "慢动作", "zht": "慢動作", "bg": "Забавен каданс", "pl": "Zwolnione tempo"},
    "entGirar": {"es": "Girar", "en": "Turn", "fr": "Tourner", "de": "Drehen", "it": "Gira", "nl": "Draaien", "zh": "转身", "zht": "轉身", "bg": "Завърти", "pl": "Obróć"},
    "entVozOn": {"es": "Escuchar a Jérôme", "en": "Listen to Jérôme", "fr": "Écouter Jérôme", "de": "Jérôme zuhören", "it": "Ascolta Jérôme", "nl": "Luister naar Jérôme", "zh": "听 Jérôme 讲解", "zht": "聽 Jérôme 講解", "bg": "Слушайте Jérôme", "pl": "Posłuchaj Jérôme’a"},
    "entVozOff": {"es": "Parar la voz", "en": "Stop the voice", "fr": "Arrêter la voix", "de": "Stimme stoppen", "it": "Ferma la voce", "nl": "Stem stoppen", "zh": "停止朗读", "zht": "停止朗讀", "bg": "Спри гласа", "pl": "Wyłącz głos"},
    "entOtraVez": {"es": "Ver otra vez", "en": "Watch again", "fr": "Revoir", "de": "Noch einmal ansehen", "it": "Rivedi", "nl": "Opnieuw bekijken", "zh": "再看一遍", "zht": "再看一遍", "bg": "Гледай отново", "pl": "Obejrzyj ponownie"},
    "entConsejo": {"es": "Un consejo", "en": "A tip", "fr": "Un conseil", "de": "Ein Tipp", "it": "Un consiglio", "nl": "Een tip", "zh": "小贴士", "zht": "小提醒", "bg": "Един съвет", "pl": "Wskazówka"},
    "entTurno": {"es": "¡Su turno!", "en": "Your turn!", "fr": "À vous !", "de": "Jetzt sind Sie dran!", "it": "Tocca a Lei!", "nl": "Nu u!", "zh": "轮到您了！", "zht": "輪到您了！", "bg": "Ваш ред е!", "pl": "Pora spróbować!"},
    "entTrabaja": {"es": "Trabaja", "en": "Works", "fr": "Travaille", "de": "Trainiert", "it": "Allena", "nl": "Traint", "zh": "锻炼部位", "zht": "鍛鍊部位", "bg": "Натоварва", "pl": "Pracują"},
    "entFin1": {"es": "Yo ya he hecho las mías. Bueno, casi.", "en": "I’ve already done mine. Well, nearly.", "fr": "Moi, j’ai déjà fait les miennes. Enfin, presque.", "de": "Ich habe meine schon gemacht. Na ja, fast.", "it": "Io le mie le ho già fatte. Beh, quasi.", "nl": "Ik heb de mijne al gedaan. Nou ja, bijna.", "zh": "我的已经做完了。嗯，差不多吧。", "zht": "我的已經做完了。嗯，差不多吧。", "bg": "Аз моите вече ги направих. Е, почти.", "pl": "Ja swoje już zrobiłem. No, prawie."},
    "entFin2": {"es": "Hoy lo enseño yo. Mañana me lo enseña usted.", "en": "Today I’m showing you. Tomorrow you can show me.", "fr": "Aujourd’hui, c’est moi qui montre. Demain, ce sera vous.", "de": "Heute zeige ich es. Morgen zeigen Sie es mir.", "it": "Oggi lo mostro io. Domani me lo mostra Lei.", "nl": "Vandaag doe ik het voor. Morgen doet u het voor.", "zh": "今天我示范，明天换您教我。", "zht": "今天我示範，明天換您教我。", "bg": "Днес показвам аз. Утре ще ми покажете вие.", "pl": "Dziś pokazuję ja. Jutro może być odwrotnie."},
    "entFin3": {"es": "Con calma: la isla no se va a ninguna parte.", "en": "Take your time: the island isn’t going anywhere.", "fr": "Prenez votre temps : l’île ne va nulle part.", "de": "Ganz in Ruhe: Die Insel läuft nicht weg.", "it": "Con calma: l’isola non va da nessuna parte.", "nl": "Rustig aan: het eiland loopt niet weg.", "zh": "慢慢来，岛又不会跑。", "zht": "慢慢來，島又不會跑。", "bg": "Спокойно: островът няма да избяга.", "pl": "Spokojnie: wyspa nigdzie nie ucieknie."},
    "entFin4": {"es": "Yo me quedo aquí, por si quiere verlo otra vez.", "en": "I’ll stay right here in case you want to see it again.", "fr": "Je reste ici, au cas où vous voudriez le revoir.", "de": "Ich bleibe hier, falls Sie es noch einmal sehen möchten.", "it": "Io resto qui, nel caso volesse rivederlo.", "nl": "Ik blijf hier, voor als u het nog eens wilt zien.", "zh": "我就在这儿，您想再看一遍随时可以。", "zht": "我就在這兒，您想再看一遍隨時可以。", "bg": "Аз оставам тук, ако искате да го видите пак.", "pl": "Zostaję tutaj, gdyby trzeba było obejrzeć to jeszcze raz."},
    "entFin5": {"es": "A mí también me costó la primera.", "en": "The first one was hard for me too.", "fr": "Moi aussi, la première m’a coûté.", "de": "Die erste ist mir auch schwergefallen.", "it": "Anche a me la prima è costata.", "nl": "De eerste kostte mij ook moeite.", "zh": "第一个，我当初也觉得难。", "zht": "第一個，我當初也覺得難。", "bg": "И на мен първото ми беше трудно.", "pl": "Mnie pierwsze też przyszło z trudem."},
    "entFin6": {"es": "Sin prisa. Yo no tengo otra cosa que hacer.", "en": "No rush. I’ve got nothing else on.", "fr": "Rien ne presse. Je n’ai rien d’autre à faire.", "de": "Keine Eile. Ich habe sonst nichts vor.", "it": "Senza fretta. Io non ho altro da fare.", "nl": "Geen haast. Ik heb toch niets anders te doen.", "zh": "不着急，我也没别的事。", "zht": "不急，我也沒別的事。", "bg": "Без бързане. Аз нямам друга работа.", "pl": "Bez pośpiechu. I tak nie mam nic innego do roboty."}
  };
  var N_FIN = 6;
  var VOZ_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL' };

  var CSS_V = [
'.tgv { --tv-tinta: var(--tinta, #12233A); --tv-tinta2: var(--tinta-2, #51627A); --tv-fondo: var(--fondo, #EEF3F8); --tv-tarjeta: var(--tarjeta, #FFFFFF); --tv-linea: var(--linea, #D5DFEA); --tv-oro: var(--oro, #8A6A12); --tv-orov: var(--oro-vivo, #D4AF37);',
'  --tv-titulo: var(--font-display, "Cormorant Garamond", Georgia, serif); --tv-texto: var(--font-body, "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif);',
'  display: grid; gap: 10px; min-width: 0; font: 400 15px/1.5 var(--tv-texto); color: var(--tv-tinta); -webkit-tap-highlight-color: transparent; }',
'.tgv *, .tgv *::before, .tgv *::after { box-sizing: border-box; }',
'.tgv[data-tema="noche"] { --tv-tinta: var(--tinta, #F0ECE4); --tv-tinta2: var(--tinta-2, #A8B3C4); --tv-fondo: var(--fondo, #0F1117); --tv-tarjeta: var(--tarjeta, #1B2330); --tv-linea: var(--linea, #2D3A4A); --tv-oro: var(--oro, #F5C76B); }',
'.tgv-escena { position: relative; border-radius: 22px; overflow: hidden; background: #8FA8E6; aspect-ratio: 400 / 460; isolation: isolate; touch-action: manipulation; -webkit-user-select: none; user-select: none; }',
'.tgv-escena .tge-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }',
'.tgv-sombra-alta { position: absolute; left: 0; right: 0; top: 0; height: 86px; background: linear-gradient(180deg, rgba(10,16,32,.42), rgba(10,16,32,0)); pointer-events: none; z-index: 2; }',
/* la barra de tramos, como las historias */
'.tgv-barras { position: absolute; z-index: 4; left: 12px; right: 12px; top: 11px; display: flex; gap: 4px; pointer-events: none; }',
'.tgv-barras i { flex: 1 1 0; height: 3.5px; border-radius: 3px; background: rgba(255,255,255,.38); overflow: hidden; }',
'.tgv-barras i.corto { flex: 0.45 1 0; }',
'.tgv-barras b { display: block; height: 100%; width: 0; border-radius: 3px; background: #fff; }',
'.tgv-barras i.hecho b { width: 100%; }',
'.tgv-cab { position: absolute; z-index: 4; left: 12px; right: 12px; top: 24px; display: flex; align-items: center; gap: 8px; pointer-events: none; }',
'.tgv-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 3px 11px; border-radius: 999px; background: rgba(13,20,36,.55); color: #fff; font-size: 12.5px; font-weight: 600; letter-spacing: .1px; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }',
'.tgv-chip svg { width: 14px; height: 14px; flex: none; }',
'.tgv-hueco { flex: 1; }',
'.tgv-rep { min-width: 28px; justify-content: center; font-variant-numeric: tabular-nums; }',
/* la cabecera y el cierre: el título, en grande */
'.tgv-titulo { position: absolute; z-index: 3; left: 16px; right: 16px; bottom: 16px; display: grid; gap: 4px; pointer-events: none; opacity: 0; transform: translateY(10px); transition: opacity .35s ease, transform .45s cubic-bezier(.2,.9,.3,1); }',
'.tgv-titulo.ve { opacity: 1; transform: none; }',
'.tgv-titulo::before { content: ""; position: absolute; left: -16px; right: -16px; bottom: -16px; top: -46px; background: linear-gradient(180deg, rgba(10,16,32,0), rgba(10,16,32,.74)); z-index: -1; }',
'.tgv-kicker { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F5C76B; }',
'.tgv-nombre { margin: 0; font: 600 30px/1.02 var(--tv-titulo); color: #fff; text-wrap: balance; overflow-wrap: anywhere; }',
'.tgv-etiquetas { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px; }',
'.tgv-etiquetas span { padding: 2px 9px; border-radius: 999px; border: 1px solid rgba(255,255,255,.5); color: #fff; font-size: 12px; }',
/* los músculos que trabajan: la leyenda, sobre la escena */
'.tgv-musc { position: absolute; z-index: 3; left: 12px; bottom: 12px; display: grid; gap: 4px; justify-items: start; pointer-events: none; transition: opacity .3s ease; max-width: 62%; }',
'.tgv-musc span { display: inline-flex; align-items: center; gap: 6px; padding: 2px 9px 2px 7px; border-radius: 999px; background: rgba(13,20,36,.5); color: #fff; font-size: 11.5px; font-weight: 600; line-height: 1.5; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }',
'.tgv-musc i { width: 9px; height: 9px; border-radius: 50%; flex: none; background: #FFE48A; box-shadow: 0 0 0 2px rgba(255,160,74,.55); }',
'.tgv-musc .sec i { background: #EE5F7E; box-shadow: none; }',
'.tgv-oculto { opacity: 0 !important; }',
/* las zonas de toque: atrás, pausa, adelante */
'.tgv-zona { position: absolute; z-index: 1; top: 0; bottom: 0; border: 0; padding: 0; margin: 0; background: transparent; cursor: pointer; }',
'.tgv-zona.izq { left: 0; width: 28%; } .tgv-zona.cen { left: 28%; width: 44%; } .tgv-zona.der { right: 0; width: 28%; }',
'.tgv-zona:focus-visible { outline: 3px solid #F5C76B; outline-offset: -6px; border-radius: 22px; }',
/* el botón grande del centro: al empezar, en pausa y al acabar */
'.tgv-gran { position: absolute; z-index: 5; left: 50%; top: 50%; width: 76px; height: 76px; margin: -38px 0 0 -38px; border-radius: 50%; border: 0; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; display: grid; place-items: center; box-shadow: 0 10px 28px rgba(10,16,32,.4); cursor: pointer; transition: transform .2s ease, opacity .2s ease; }',
'.tgv-gran svg { width: 34px; height: 34px; }',
'.tgv-gran:active { transform: scale(.94); }',
'.tgv-gran[hidden] { display: none; }',
/* el corte entre dos planos: una cortinilla dorada que cruza */
'.tgv-corte { position: absolute; z-index: 6; inset: -4px -30%; background: linear-gradient(100deg, rgba(212,175,55,0) 0%, #D4AF37 22%, #F5C76B 50%, #D4AF37 78%, rgba(212,175,55,0) 100%); transform: translateX(-120%) skewX(-12deg); pointer-events: none; will-change: transform; }',
/* debajo: el paso y los mandos */
'.tgv-pie { display: grid; gap: 10px; min-width: 0; }',
'.tgv-paso { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: start; min-height: 96px; padding: 12px 14px; border-radius: 18px; background: var(--tv-fondo); }',
'.tgv-paso-n { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; }',
'.tgv-paso-n svg { width: 17px; height: 17px; }',
'.tgv-paso-t { margin: 0; font-size: 15.5px; line-height: 1.45; color: var(--tv-tinta); overflow-wrap: anywhere; }',
'.tgv-paso-t b { display: block; font: 600 22px/1.1 var(--tv-titulo); margin-bottom: 2px; }',
'.tgv-paso-t .tgv-pal { opacity: 0; transition: opacity .22s ease; }',
'.tgv-paso-t .tgv-pal.ve { opacity: 1; }',
'.tgv-paso-t em { font-style: italic; color: var(--tv-oro); }',
'.tgv-mandos { display: flex; align-items: center; gap: 7px; min-width: 0; }',
'.tgv-btn { position: relative; flex: 0 1 46px; min-width: 34px; width: 46px; height: 46px; border-radius: 14px; border: 1.5px solid var(--tv-linea); background: var(--tv-tarjeta); color: var(--tv-tinta); display: grid; place-items: center; padding: 0; cursor: pointer; font: 700 13.5px/1 var(--tv-texto); transition: background .15s ease, border-color .15s ease, color .15s ease, transform .12s ease; }',
'.tgv-btn svg { width: 21px; height: 21px; }',
'.tgv-btn:active { transform: scale(.94); }',
'.tgv-btn:focus-visible, .tgv-gran:focus-visible { outline: 3px solid var(--tv-orov); outline-offset: 2px; }',
'.tgv-btn[aria-pressed="true"] { background: var(--tv-tinta); border-color: var(--tv-tinta); color: var(--tv-fondo); }',
'.tgv-btn.play { flex-basis: 58px; min-width: 42px; width: 58px; border: 0; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; }',
'.tgv-btn.ancho { width: auto; padding: 0 13px; gap: 7px; display: inline-flex; align-items: center; }',
'.tgv-btn:disabled { opacity: .38; cursor: default; }',
'.tgv-sep { flex: 1 1 0; min-width: 0; }',
'.tgv .tgv-solo-lector { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }',
'@media (prefers-reduced-motion: reduce) { .tgv-titulo, .tgv-musc, .tgv-paso-t .tgv-pal, .tgv-btn, .tgv-gran { transition: none; } }'
  ].join('\n');
  function ponerEstilosV() {
    if (document.getElementById('tgv-estilos')) return;
    var s = document.createElement('style'); s.id = 'tgv-estilos'; s.textContent = CSS_V;
    document.head.appendChild(s);
  }
  var ICO = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.4" height="14" rx="1.3"/><rect x="13.6" y="5" width="4.4" height="14" rx="1.3"/></svg>',
    ant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>',
    sig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>',
    girar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.4 3.6v4.6h-4.6"/></svg>',
    voz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>',
    otra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M3.6 3.6v4.6h4.6"/></svg>',
    bombilla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
    mano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v7M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 6 6 0 0 1-5-2.6L4 14a1.5 1.5 0 0 1 2.4-1.8L7 13"/></svg>'
  };
  /* de qué habla un paso (por sus palabras, en castellano): dónde se pone el anillo */
  var NOMBRA = [
    [/puntas? de(l| los)? pies?|\bpies?\b|pisa|planta/, ['pi', 'pd']], [/tal[oó]n(es)?/, ['tli', 'tld']], [/rodillas?/, ['ri', 'rd']], [/cadera/, ['cadera']],
    [/gl[uú]teos?/, ['gluteos']], [/abdomen|ombligo/, ['abdomen']], [/zona lumbar|espalda|columna|tronco/, ['espalda']], [/\bpecho\b/, ['pecho']],
    [/om[oó]platos?|esc[aá]pulas?|hombros?/, ['hi', 'hd']], [/codos?/, ['ci', 'cd']], [/mu[ñn]ecas?|manos?|palmas?|agarr|dedos/, ['mi', 'md']], [/cabeza|cuello|barbilla/, ['cab']]
  ];
  function nombrados(texto) {
    var t = String(texto || '').toLowerCase(), halla = [];
    NOMBRA.forEach(function (q) { var m = q[0].exec(t); if (m) halla.push([m.index, q[1]]); });
    halla.sort(function (a, b) { return a[0] - b[0]; });
    var r = [];
    halla.slice(0, 2).forEach(function (h) { r = r.concat(h[1]); });
    return r;
  }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* datos: { id, nombre, pasos: [texto…], pasosEs: [texto en castellano…] (para los anillos), prim: [grupos], sec: [grupos],
              nombres: { grupo: su nombre }, etiquetas: [texto…], entorno: 'gimnasio' | 'fuera' | 'calistenia', nivel: 1-3 }
     opc:   { idioma, tema: 'dia' | 'noche', tx: función que da un texto de ENT_UI (si la app tiene los suyos), alAcabar, auto } */
  /* ── qué voz ──
     La del móvil (Web Speech), como la audioguía, pero ELIGIÉNDOLA. Un iPhone enseña a las webs, lo primero de cada
     idioma, las voces «Eloquence» (Eddy, Flo, Grandma, Grandpa, Reed, Rocko, Sandy, Shelley): un sintetizador por
     reglas de hace más de veinte años (ETI-Eloquence; su empresa se vendió en 2001). Quedarse con «la primera del
     idioma» es acabar con una de esas: suena a navegador viejo. Aquí se puntúan: primero las buenas (premium,
     mejorada, Siri), luego las normales del sistema; las robóticas y las de broma, nunca. Y si el aparato no enseña
     ninguna que valga (Safari no deja ver a las webs las voces que se descargan: lo dice Apple en sus foros de
     desarrolladores, hilo 723503), no se elige: se le da el idioma y pone la suya, la que el sistema tiene para ese
     idioma. Solo voces del dispositivo: ninguna manda el texto fuera (por eso «que ponga la suya» solo vale en
     aparatos de Apple, donde todas lo son). */
  var VOZ_NO = /eloquence|\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b|\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b|espeak/i;
  var VOZ_BUENA = [[/premium/i, 30], [/enhanced|mejorada|optimizada|améliorée|erweitert|ottimizzata|verbeterd|ulepszon|增强|優化/i, 22], [/siri/i, 18], [/natural|neural/i, 16]];
  /* Jérôme es un hombre: a igual calidad, una voz de hombre */
  var VOZ_EL = /\b(jorge|diego|carlos|juan|enrique|pablo|daniel|arthur|oliver|gordon|george|thomas|jacques|nicolas|paul|markus|yannick|viktor|martin|stefan|luca|cosimo|xander|frank|krzysztof|jacek|adam|ivan|li-mu|kangkang)\b/i;
  function notaVoz(v, quiero) {
    var uri = String(v.voiceURI || ''), todo = uri + ' ' + String(v.name || ''), lang = String(v.lang || '').replace('_', '-').toLowerCase(), n, i;
    if (v.localService === false || VOZ_NO.test(todo)) return -1;
    n = lang === quiero ? 40 : (lang.slice(0, 2) === quiero.slice(0, 2) && lang.slice(0, 2) !== 'zh') ? 10 : -1;
    if (n < 0) return -1;
    for (i = 0; i < VOZ_BUENA.length; i++) if (VOZ_BUENA[i][0].test(todo)) { n += VOZ_BUENA[i][1]; break; }
    if (i === VOZ_BUENA.length) n += /super-compact/i.test(uri) ? 0 : /compact/i.test(uri) ? 6 : 8;
    if (VOZ_EL.test(todo)) n += 3;
    return n;
  }
  function vocesDe(idioma) {
    var locale = (window.TG_VOZ && window.TG_VOZ.locale(idioma)) || VOZ_LOCALE[idioma] || 'es-ES', quiero = locale.toLowerCase(), lista = [], mejor = null, nota = -1, del = false, ag = '';
    try { lista = window.speechSynthesis.getVoices() || []; } catch (e) { lista = []; }
    for (var i = 0; i < lista.length; i++) {
      var n = notaVoz(lista[i], quiero), lg = String(lista[i].lang || '').replace('_', '-').toLowerCase();
      if (lg.slice(0, 2) === quiero.slice(0, 2)) del = true;
      if (n > nota) { nota = n; mejor = lista[i]; }
    }
    try { ag = navigator.userAgent || ''; } catch (e2) { ag = ''; }
    var apple = /iP(hone|ad|od)/.test(ag) || (/Macintosh/.test(ag) && lista.some(function (v) { return /^com\.apple\./.test(String(v.voiceURI || '')); }));
    /* «que ponga la suya»: en un aparato de Apple, si aún no hay lista o si las del idioma que enseña son las robóticas */
    return { locale: locale, voz: nota >= 0 ? mejor : null, nota: nota, sistema: !(nota >= 0) && apple && (!lista.length || del), lista: lista };
  }
  function Reproductor(caja, datos, opc) {
    opc = opc || {};
    var yo = this, co = COREO[datos.id];
    this.co = co; this.datos = datos; this.opc = opc; this.idioma = opc.idioma || 'es';
    ponerEstilosV();
    var T = function (k, v) {
      var s = (opc.tx && opc.tx(k)) || (ENT_UI[k] && (ENT_UI[k][yo.idioma] || ENT_UI[k].en || ENT_UI[k].es)) || '';
      if (v) for (var n in v) s = s.split('{' + n + '}').join(v[n]);
      return s;
    };
    this.T = T;
    var raiz = el('div', 'tgv'); raiz.setAttribute('data-tema', opc.tema === 'noche' ? 'noche' : 'dia');
    this.raiz = raiz;
    var escena = el('div', 'tgv-escena'); escena.setAttribute('role', 'group'); escena.setAttribute('aria-label', T('entVideo') + ': ' + datos.nombre);
    raiz.appendChild(escena);
    this.esc = new Escenario(escena);
    this.esc.ambiente(co.ambiente || datos.entorno || 'fuera', opc.tema);
    this.dir = new Director(this.esc);
    this.dir.cargar(co);
    this.esc.fig.musculos(datos.prim, datos.sec);
    escena.appendChild(el('div', 'tgv-sombra-alta'));
    /* los tramos: la cabecera, un tramo por paso y el cierre */
    var pasos = datos.pasos || [], acc = co.pasos || [];
    this.tramos = [{ tipo: 'cabecera', dur: 3.1 }];
    pasos.forEach(function (tx, i) {
      var a = acc[i] != null ? acc[i] : (i === 0 ? (co.inicio || 'a') : 'rep');
      yo.tramos.push({ tipo: 'paso', i: i, texto: tx, es: (datos.pasosEs || pasos)[i], accion: a, dur: Math.max(4.4, 1.9 + tx.length * (/^zh/.test(yo.idioma) ? 0.16 : 0.058)) });
    });
    this.tramos.push({ tipo: 'cierre', dur: 4.2 });
    this.barras = el('div', 'tgv-barras');
    this.tramos.forEach(function (t) { var i = el('i', t.tipo === 'paso' ? '' : 'corto'); i.appendChild(el('b')); yo.barras.appendChild(i); t.barra = i; });
    escena.appendChild(this.barras);
    var cab = el('div', 'tgv-cab');
    this.chipPaso = el('span', 'tgv-chip'); cab.appendChild(this.chipPaso);
    cab.appendChild(el('span', 'tgv-hueco'));
    this.chipRep = el('span', 'tgv-chip tgv-rep tgv-oculto', '0'); this.chipRep.setAttribute('aria-hidden', 'true'); cab.appendChild(this.chipRep);
    escena.appendChild(cab);
    /* el título (cabecera y cierre) */
    var tit = el('div', 'tgv-titulo'); this.titulo = tit;
    this.kicker = el('span', 'tgv-kicker', T('entCon')); tit.appendChild(this.kicker);
    this.nombre = el('p', 'tgv-nombre', datos.nombre); tit.appendChild(this.nombre);
    var etq = el('div', 'tgv-etiquetas'); (datos.etiquetas || []).forEach(function (e) { etq.appendChild(el('span', '', e)); }); tit.appendChild(etq);
    escena.appendChild(tit);
    /* la leyenda de músculos */
    var mus = el('div', 'tgv-musc tgv-oculto'); this.musc = mus;
    var nomb = datos.nombres || {};
    (datos.prim || []).forEach(function (g) { var s = el('span'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    var secs = datos.sec || [], cabenSec = Math.max(1, 4 - (datos.prim || []).length);
    if (secs.length > cabenSec) cabenSec = Math.max(1, cabenSec - 1);
    secs.slice(0, cabenSec).forEach(function (g) { var s = el('span', 'sec'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    if (secs.length > cabenSec) { var mas2 = el('span', 'sec'); mas2.appendChild(el('i')); mas2.appendChild(document.createTextNode('+' + (secs.length - cabenSec))); mas2.title = secs.slice(cabenSec).map(function (g) { return nomb[g] || g; }).join(', '); mus.appendChild(mas2); }
    escena.appendChild(mus);
    /* las zonas de toque */
    var zona = function (cls, rot, f) { var b = el('button', 'tgv-zona ' + cls); b.type = 'button'; b.setAttribute('aria-label', rot); b.addEventListener('click', f); escena.appendChild(b); return b; };
    zona('izq', T('entAnt'), function () { yo.irA(yo.n - 1); });
    this.zCen = zona('cen', T('entPausa'), function () { yo.alternar(); });
    zona('der', T('entSig'), function () { yo.irA(yo.n + 1); });
    this.gran = el('button', 'tgv-gran'); this.gran.type = 'button'; this.gran.innerHTML = ICO.play; this.gran.setAttribute('aria-label', T('entPlay'));
    this.gran.addEventListener('click', function () { if (yo.fin) yo.irA(0); yo.reproducir(); });
    escena.appendChild(this.gran);
    this.corte = el('div', 'tgv-corte'); escena.appendChild(this.corte);
    /* debajo: el paso y los mandos */
    var pie = el('div', 'tgv-pie');
    var paso = el('div', 'tgv-paso'); paso.setAttribute('aria-live', 'polite');
    this.pasoN = el('span', 'tgv-paso-n'); this.pasoT = el('p', 'tgv-paso-t');
    this.pasoL = el('span', 'tgv-solo-lector');       /* el paso entero, de una vez, para los lectores de pantalla */
    paso.appendChild(this.pasoN); paso.appendChild(this.pasoT); paso.appendChild(this.pasoL);
    this.pasoT.setAttribute('aria-hidden', 'true');
    pie.appendChild(paso);
    var mandos = el('div', 'tgv-mandos');
    var boton = function (cls, ico, rot, f, txt) {
      var b = el('button', 'tgv-btn ' + cls); b.type = 'button'; b.innerHTML = ico || ''; if (txt) b.appendChild(el('span', '', txt));
      b.setAttribute('aria-label', rot); b.title = rot; b.addEventListener('click', f); mandos.appendChild(b); return b;
    };
    this.bAnt = boton('', ICO.ant, T('entAnt'), function () { yo.irA(yo.n - 1); });
    this.bPlay = boton('play', ICO.play, T('entPlay'), function () { if (yo.fin) yo.irA(0); yo.alternar(); });
    this.bSig = boton('', ICO.sig, T('entSig'), function () { yo.irA(yo.n + 1); });
    mandos.appendChild(el('span', 'tgv-sep'));
    this.bLento = boton('', '', T('entLento'), function () { yo.lento = !yo.lento; yo.dir.vel = yo.lento ? 0.45 : 1; yo.bLento.setAttribute('aria-pressed', yo.lento ? 'true' : 'false'); }, '½×');
    this.bLento.setAttribute('aria-pressed', 'false');
    this.bGirar = boton('', ICO.girar, T('entGirar'), function () { yo.dir.girar(); });
    if (this.dir.vistas.length < 2) this.bGirar.disabled = true;
    this.bVoz = boton('', ICO.voz, T('entVozOn'), function () { yo.voz(!yo.conVoz); });
    this.bVoz.setAttribute('aria-pressed', 'false');
    if (!this.hayVoz()) this.bVoz.hidden = true;
    /* las voces llegan tarde en algunos navegadores: cuando lleguen, se vuelve a mirar si hay alguna que valga */
    try { if (window.speechSynthesis && window.speechSynthesis.addEventListener) { this._voces = function () { yo.bVoz.hidden = !yo.hayVoz(); if (yo.bVoz.hidden && yo.conVoz) yo.voz(false); }; window.speechSynthesis.addEventListener('voiceschanged', this._voces); } } catch (e) {}
    pie.appendChild(mandos);
    raiz.appendChild(pie);
    caja.appendChild(raiz);

    this.cajaPaso = paso;
    this.n = 0; this.tt = 0; this.suena = false; this.fin = false; this.lento = false; this.conVoz = false; this.antes = 0; this.raf = 0;
    this.dir.alRepetir = function (r) { yo.chipRep.textContent = '\u00d7 ' + r; yo.chipRep.classList.toggle('tgv-oculto', !yo.repVisible); };
    this.dir.aBusto(true);
    this.entrar(0, true);
    this.dir.cuadro(0.016, true);
    this.quieto = quieto();
    this._cuadro = function (ahora) { yo.cuadro(ahora); };
    /* solo corre mientras se ve */
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(function (es) { yo.visible = es[0].isIntersecting; if (!yo.visible && yo.suena) yo.pausar(); });
      this.io.observe(escena);
    }
    this.visible = true;
    this.medir();
    this._medir = function () { yo.medir(); };
    window.addEventListener('resize', this._medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { yo.anchoMedido = 0; yo.medir(); });
    if (opc.auto) this.reproducir();
  }
  /* mide el paso más largo y deja ese alto fijo (si aún no se ve, lo intenta al reproducir) */
  Reproductor.prototype.medir = function () {
    var c = this.cajaPaso, t = this.pasoT, ancho = t.clientWidth, max = 0, yo = this;
    if (!ancho) return;
    if (this.anchoMedido === ancho) return;
    var p = document.createElement('p'); p.className = 'tgv-paso-t'; p.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;width:' + ancho + 'px';
    c.style.position = 'relative'; c.appendChild(p);
    this.tramos.forEach(function (q) { if (q.tipo !== 'paso') return; p.textContent = ''; if (q.accion === 'nota') p.appendChild(el('b', '', yo.T('entConsejo'))); p.appendChild(document.createTextNode(q.texto)); max = Math.max(max, p.offsetHeight); });
    c.removeChild(p);
    if (max) { c.style.minHeight = Math.ceil(max + 26) + 'px'; this.anchoMedido = ancho; }
  };
  Reproductor.prototype.hayVoz = function () {
    try {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') return false;
      var v = vocesDe(this.idioma);
      /* si el navegador aún no ha dicho qué voces tiene, se ofrece; al ir a hablar se vuelve a mirar */
      return !v.lista.length || !!v.voz || v.sistema;
    } catch (e) { return false; }
  };
  Reproductor.prototype.reproducir = function () {
    if (this.suena) return;
    if (this.fin) { this.fin = false; this.entrar(0); }
    this.suena = true; this.gran.hidden = true;
    this.medir();
    this.bPlay.innerHTML = ICO.pausa; this.bPlay.setAttribute('aria-label', this.T('entPausa')); this.zCen.setAttribute('aria-label', this.T('entPausa'));
    this.antes = performance.now();
    if (this.conVoz && this.vozPendiente) this.decir(this.vozPendiente);
    this.raf = requestAnimationFrame(this._cuadro);
  };
  Reproductor.prototype.pausar = function () {
    if (!this.suena) return;
    this.suena = false; cancelAnimationFrame(this.raf);
    this.gran.hidden = false; this.gran.innerHTML = this.fin ? ICO.otra : ICO.play; this.gran.setAttribute('aria-label', this.T(this.fin ? 'entOtraVez' : 'entPlay'));
    this.bPlay.innerHTML = ICO.play; this.bPlay.setAttribute('aria-label', this.T('entPlay')); this.zCen.setAttribute('aria-label', this.T('entPlay'));
    this.callar();
  };
  Reproductor.prototype.alternar = function () { if (this.suena) this.pausar(); else this.reproducir(); };
  /* un cuadro */
  Reproductor.prototype.cuadro = function (ahora) {
    if (!this.suena) return;
    /* si al móvil le cuesta (más de media ración de cuadro solo en mover el dibujo), pinta uno de cada dos: 30 por
       segundo, a su velocidad. Y si aun así va justo, se saltan cuadros antes que ir a cámara lenta (hasta 10 por segundo). */
    if (this.aMitad && (this.par = !this.par)) { this.raf = requestAnimationFrame(this._cuadro); return; }
    var dt = Math.min(0.1, Math.max(0, (ahora - this.antes) / 1000)); this.antes = ahora;
    var t0 = performance.now();
    this.avanzar(dt);
    var coste = performance.now() - t0;
    this.costeM = this.costeM == null ? coste : this.costeM + (coste - this.costeM) * 0.06; this.nCoste = (this.nCoste || 0) + 1;
    if (this.nCoste > 45) this.aMitad = this.costeM > (this.aMitad ? 5.5 : 9);
    if (this.suena) this.raf = requestAnimationFrame(this._cuadro);
  };
  /* avanza el tiempo (lo usa también la grabación, cuadro a cuadro) */
  Reproductor.prototype.avanzar = function (dt) {
    var t = this.tramos[this.n];
    this.tt += dt;
    if (this.pendiente) { this.pendT -= dt; if (this.pendT <= 0) { var g0 = this.pendiente; this.pendiente = null; g0(); } }
    if (this.corteT != null) {
      this.corteT += dt;
      var uc = this.corteT / 0.52;
      if (uc >= 1) { this.corteT = null; this.corte.style.transform = ''; }
      else { uc = uc < 0.5 ? 2 * uc * uc : 1 - 2 * (1 - uc) * (1 - uc); this.corte.style.transform = 'translateX(' + (-120 + 240 * uc).toFixed(1) + '%) skewX(-12deg)'; }
    }
    /* las palabras del paso van saliendo */
    if (this.palabras && this.palabras.length) {
      var hasta = Math.floor(this.tt / 0.055);
      while (this.palN < Math.min(hasta, this.palabras.length)) this.palabras[this.palN++].classList.add('ve');
    }
    if (this.conVoz && this.hablando && ((!this.vozArranco && this.tt > 2.5) || this.tt > t.dur + 22)) { this.hablando = false; this.esc.cab.hablar(0); }
    var esperaVoz = this.conVoz && this.hablando;
    var f = entre(this.tt / t.dur, 0, 1);
    t.barra.firstChild.style.width = (f * 100).toFixed(1) + '%';
    if (this.tt >= t.dur && !esperaVoz) {
      if (this.n >= this.tramos.length - 1) { this.acabar(); }
      else this.entrar(this.n + 1);
    }
    /* la cara: según el esfuerzo */
    var d = this.dir, cab = this.esc.cab, nivel = this.datos.nivel || 1;
    if (!d.busto) {
      var emo = d.esf > 0.55 ? (nivel >= 2 ? 'esfuerzo' : 'concentra') : (d.modo === 'rep' ? 'concentra' : 'atento');
      if (d.modo === 'rep' && d.tramo && d.tramo.de === d.tramo.a && d.esf < 0.3) emo = 'contento';
      if (cab.emo !== emo) cab.emocion(emo);
      cab.sudar(nivel >= 3 && d.modo === 'rep');
    }
    d.cuadro(dt, false);
  };
  Reproductor.prototype.acabar = function () {
    this.fin = true; this.tramos[this.n].barra.classList.add('hecho');
    this.pausar();
    if (this.opc.alAcabar) this.opc.alAcabar();
  };
  Reproductor.prototype.irA = function (n) {
    n = entre(n, 0, this.tramos.length - 1);
    this.fin = false;
    this.entrar(n);
    if (!this.suena) { this.dir.cuadro(0.016, true); this.gran.innerHTML = ICO.play; }
  };
  /* el corte de plano: la cortinilla cruza y, cuando tapa, se cambia */
  Reproductor.prototype.cortar = function (f) {
    var c = this.corte, yo = this;
    if (this.quieto || !this.suena) { f(); return; }
    this.corteT = 0;
    this.pendiente = f; this.pendT = 0.25;       /* se cambia de plano cuando la cortinilla tapa (lo cuenta avanzar) */
  };
  /* entra en un tramo */
  Reproductor.prototype.entrar = function (n, sinCorte) {
    var yo = this, T = this.T, d = this.dir, cab = this.esc.cab, t = this.tramos[n], antes = this.tramos[this.n];
    if (this.pendiente) { var g = this.pendiente; this.pendiente = null; g(); }
    if (!this.suena) { this.corteT = null; this.corte.style.transform = ''; }
    this.n = n; this.tt = 0;
    this.tramos.forEach(function (q, i) { q.barra.classList.toggle('hecho', i < n); q.barra.firstChild.style.width = i < n ? '100%' : '0%'; });
    this.bAnt.disabled = n === 0; this.bSig.disabled = n === this.tramos.length - 1;
    var N = this.tramos.length - 2;
    this.callar();
    var escribir = function (num, ico, titulo, texto, aparte) {
      yo.pasoN.textContent = ''; if (ico) yo.pasoN.innerHTML = ico; else yo.pasoN.textContent = num;
      yo.pasoT.textContent = ''; yo.palabras = []; yo.palN = 0;
      if (titulo) yo.pasoT.appendChild(el('b', '', titulo));
      var cont = aparte ? el('em') : yo.pasoT;
      /* palabra a palabra (en chino, letra a letra) */
      var trozos = /^zh/.test(yo.idioma) ? texto.split('') : texto.split(/(\s+)/);
      trozos.forEach(function (w) { if (/^\s+$/.test(w)) cont.appendChild(document.createTextNode(w)); else if (w) { var s = el('span', 'tgv-pal', w); cont.appendChild(s); yo.palabras.push(s); } });
      if (aparte) yo.pasoT.appendChild(cont);
      yo.pasoL.textContent = (titulo ? titulo + '. ' : '') + texto;
      if (yo.quieto) yo.palabras.forEach(function (s) { s.classList.add('ve'); });
    };
    var plano = function (busto, f) { if (d.busto !== busto && !sinCorte) yo.cortar(function () { d.aBusto(busto); f(); }); else { d.aBusto(busto); f(); } };
    this.titulo.classList.toggle('ve', t.tipo !== 'paso' || false);
    var conMusc = t.tipo === 'paso' && t.accion !== 'nota';
    if (!conMusc) this.musc.classList.add('tgv-oculto');
    this.chipRep.classList.add('tgv-oculto'); this.repVisible = false;
    if (t.tipo === 'cabecera') {
      this.chipPaso.textContent = T('entVideo');
      this.kicker.textContent = T('entCon'); this.nombre.textContent = this.datos.nombre;
      this.titulo.classList.add('ve');
      escribir('', ICO.mano, '', this.datos.nombre);
      this.pasoT.textContent = ''; this.pasoT.appendChild(el('b', '', this.datos.nombre)); this.palabras = [];
      var et = (this.datos.etiquetas || []).join(' · '); if (et) this.pasoT.appendChild(document.createTextNode(et));
      plano(true, function () { d.gesto(d.gestoPara('cabecera', yo.hash()), true); d.marcar([]); });
      this.decir(this.datos.nombre);
    } else if (t.tipo === 'cierre') {
      this.chipPaso.textContent = T('entVideo');
      var fr = T('entFin' + (1 + (this.hash() % N_FIN)));
      this.kicker.textContent = this.datos.nombre; this.nombre.textContent = T('entTurno');
      escribir('', ICO.mano, T('entTurno'), fr, true);
      var deCerca = d.busto;
      plano(true, function () { d.gesto(d.gestoPara('cierre', yo.hash() >>> 3), !deCerca); d.marcar([]); });
      this.decir(T('entTurno') + ' ' + fr);
    } else {
      var a = t.accion;
      this.chipPaso.textContent = T('entPaso', { n: t.i + 1, N: N });
      this.titulo.classList.remove('ve');
      if (a === 'nota') {
        escribir('', ICO.bombilla, T('entConsejo'), t.texto);
        /* un consejo corto, con el índice en alto; uno largo, explicándolo con la mano abierta (por el texto en castellano: igual en todos los idiomas) */
        var yaCerca = d.busto;
        plano(true, function () { d.gesto(d.gestoPara('consejo', (t.es || t.texto).length > 110 ? 1 : 0), !yaCerca); cab.hablar(Math.min(t.dur - 0.6, 3.2)); d.marcar([]); });
      } else {
        escribir(String(t.i + 1), '', '', t.texto);
        plano(false, function () {
          var desdeBusto = antes && (antes.tipo !== 'paso' || antes.accion === 'nota');
          if (a === 'rep' || (a && a.rep != null)) {
            if (desdeBusto) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); }
            if (d.modo !== 'rep') { d.aRep(desdeBusto ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; }
            yo.repVisible = true; yo.chipRep.classList.toggle('tgv-oculto', !d.reps);
          } else if (a && a.sec) {
            if (desdeBusto || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); }
            d.aSecuencia(a.sec, a.desde);
          } else d.aPostura(typeof a === 'string' ? a : d.inicio, desdeBusto ? 0 : 0.7);
          d.marcar(nombrados(t.es));
          yo.musc.classList.remove('tgv-oculto');
          cab.hablar(Math.min(1.6, t.dur * 0.3));
        });
      }
      this.decir(t.texto);
    }
  };
  /* un número fijo por ejercicio, para elegir su frase de cierre */
  Reproductor.prototype.hash = function () { var s = this.datos.id || '', h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  /* ── la voz: la del móvil (las voces instaladas), elegida con vocesDe ── */
  Reproductor.prototype.voz = function (si) {
    this.conVoz = !!si && this.hayVoz();
    this.bVoz.setAttribute('aria-pressed', this.conVoz ? 'true' : 'false');
    this.bVoz.setAttribute('aria-label', this.T(this.conVoz ? 'entVozOff' : 'entVozOn')); this.bVoz.title = this.bVoz.getAttribute('aria-label');
    if (!this.conVoz) this.callar(); else if (this.vozPendiente && this.suena) this.decir(this.vozPendiente);
  };
  Reproductor.prototype.decir = function (texto) {
    var yo = this;
    this.vozPendiente = texto;
    if (!this.conVoz || !this.suena) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texto), v = vocesDe(this.idioma);
      /* ninguna voz del dispositivo que valga, y no es un aparato que ponga la suya: mejor callado que robótico */
      if (!v.voz && !v.sistema) { this.conVoz = false; this.bVoz.hidden = true; this.bVoz.setAttribute('aria-pressed', 'false'); return; }
      u.lang = v.locale;
      if (v.voz) u.voice = v.voz;
      u.rate = 0.97; u.pitch = 1;
      this.hablando = true; this.vozArranco = false; this.esc.cab.hablar(60);
      var fin = function () { if (yo.uVoz === u) { yo.hablando = false; yo.esc.cab.hablar(0); } };
      u.onstart = function () { if (yo.uVoz === u) yo.vozArranco = true; };
      u.onend = fin; u.onerror = fin; this.uVoz = u;
      window.speechSynthesis.speak(u);
    } catch (e) { this.hablando = false; }
  };
  Reproductor.prototype.callar = function () {
    this.hablando = false; this.uVoz = null;
    try { if (this.conVoz && window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    this.esc.cab.hablar(0);
  };
  Reproductor.prototype.tema = function (t) { this.raiz.setAttribute('data-tema', t === 'noche' ? 'noche' : 'dia'); this.esc.ambiente(this.esc.nombreAmb, t); if (!this.suena) this.dir.cuadro(0.016, true); };
  Reproductor.prototype.quitar = function () {
    this.pausar(); this.callar();
    window.removeEventListener('resize', this._medir);
    try { if (this._voces) window.speechSynthesis.removeEventListener('voiceschanged', this._voces); } catch (e) {}
    if (this.io) this.io.disconnect();
    if (this.raiz.parentNode) this.raiz.parentNode.removeChild(this.raiz);
  };

  /* las huellas de los pasos (las escribe construir.py) */
  var HUELLAS = {"sentadilla-peso-corporal": "0f72185fe02d", "sentadilla-goblet": "73da97f6d857", "sentadilla-trasera-barra": "e702c8abe1af", "subida-escalon": "4fac36ce3594", "sentadilla-isometrica-pared": "8e2837419645", "sentadilla-salto": "6f6ce9019552", "puente-gluteos": "8a4f295635da", "hip-thrust-banco": "4bf6869bc3d6", "zancada-atras": "91b6d2d8138a", "sentadilla-bulgara": "38ca4696ecd0", "peso-muerto-rumano-barra": "d71e381da0f3", "peso-muerto-rumano-mancuernas": "24746a0b8865", "peso-muerto-barra": "ae78e5a380c9", "buenos-dias-sin-peso": "cc90a8d10eeb", "elevacion-talones-de-pie": "60656844dad8", "elevacion-talones-escalon": "103123f89cab", "saltos-pogo": "3799ccfe9d15", "estiramiento-gemelo-pared": "b00f54237b5d", "curl-mancuernas": "9d76339f7662", "curl-martillo": "8295d3c302c7", "curl-barra": "b8a935cd99bc", "fondos-banco": "56a73eb850df", "extension-triceps-polea-cuerda": "8d95e21e0a40", "flexion-diamante": "1aeeb2eb3e59", "press-banca-barra": "6dbb8ef03cde", "flexion": "3c04ca3d61b2", "dominadas": "b789c525d45f", "dominadas-supinas": "221476f1bd1c", "remo-mancuerna-un-brazo": "04b176e1a1b1", "encogimientos-mancuernas": "03217817abba", "remo-invertido": "240cc2ef7370", "face-pull-polea": "5b2372b043ca", "elevaciones-laterales-mancuernas": "43d59ce9f30b", "elevaciones-frontales-mancuernas": "c48e3f6d0d5f", "press-militar-barra": "b99176a99a22", "plancha-antebrazos": "03ef445ab5bb", "crunch-abdominal": "9cc54e9f434b", "bicho-muerto": "07cc5a277f73", "elevacion-rodillas-colgado": "62f974536661", "suspension-barra": "c86ba37f716f"};

  /* ───────────────────────── lo que sale del módulo ───────────────────────── */
  window.TG_ENTRENADOR = {
    version: 2,
    /* ¿tiene vídeo este ejercicio? Con n (los pasos que trae su ficha), solo si son los mismos que se
       coreografiaron: si la ficha cambia de pasos, el vídeo deja de salir hasta que se revise. */
    tiene: function (id, n) { var co = Object.prototype.hasOwnProperty.call(COREO, id) ? COREO[id] : null; return !!co && (n == null || (co.pasos || []).length === n); },
    ids: function () { return Object.keys(COREO); },
    /* monta el vídeo de un ejercicio en una caja; devuelve el reproductor (reproducir, pausar, irA, tema, quitar) o null */
    montar: function (caja, datos, opc) { return datos && this.tiene(datos.id, (datos.pasos || []).length) ? new Reproductor(caja, datos, opc) : null; },
    textos: ENT_UI,
    /* qué voz usaría el vídeo en este aparato para un idioma, y cuáles enseña el navegador (para saber por qué suena como suena) */
    voces: function (idioma) {
      var v = vocesDe(idioma);
      return { locale: v.locale, elegida: v.voz ? String(v.voz.name) : null, sistema: v.sistema,
        lista: v.lista.map(function (q) { return { nombre: String(q.name), lang: String(q.lang), uri: String(q.voiceURI), local: q.localService !== false, nota: notaVoz(q, v.locale.toLowerCase()) }; }) };
    },
    /* la huella de los pasos en castellano con los que se hizo cada coreografía (la coteja tools/auditar_entrenador.js) */
    huellas: HUELLAS,
    _: { resolver: resolver, mezclar: mezclar, clavar: clavar, armar: armar, Escenario: Escenario, Director: Director, Camara: Camara, D: D, C: C, CURVA: CURVA, COREO: COREO, MATERIAL: MATERIAL, PRESENTA: PRESENTA, GESTOS: GESTOS, GESTOS_DE: GESTOS_DE, Vida: Vida, bajoZapa: bajoZapa, BUSTO: BUSTO, ANCHO: ANCHO, ALTO: ALTO, PUNTOS: PUNTOS, EMO: EMO, Reproductor: Reproductor }
  };

})();
