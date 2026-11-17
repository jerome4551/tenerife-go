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
   TG_ENTRENADOR.pedir(id) → promesa (trae la coreografía, si no está) · TG_ENTRENADOR.tiene(id, nPasos) ·
   TG_ENTRENADOR.montar(caja, datos, opc) → reproductor (reproducir, pausar, irA, tema, quitar) ·
   TG_ENTRENADOR.ids() · .trozos() · .todo() · .huellas · .textos (los diez idiomas).
   innerHTML solo recibe constantes de este fichero (dibujos e iconos); los textos de la ficha
   entran con textContent.

   POR TROZOS (16 de noviembre de 2026)
   Aquí van el motor y las 40 coreografías del bloque 1. Las otras 273 van por grupos en modulos/entrenador/,
   cada fichero con la huella de su contenido en el nombre, y se piden al abrir la ficha de uno de sus ejercicios:
     CARGA-PEREZOSA: modulos/entrenador/pecho.9bf43e42.js   (35)
     CARGA-PEREZOSA: modulos/entrenador/dorsal.18cd6e1c.js   (35)
     CARGA-PEREZOSA: modulos/entrenador/espalda-alta.0920d36f.js   (30)
     CARGA-PEREZOSA: modulos/entrenador/hombros.689c08a8.js   (34)
     CARGA-PEREZOSA: modulos/entrenador/biceps.1f778db3.js   (36)
     CARGA-PEREZOSA: modulos/entrenador/triceps.bfe5bbc4.js   (37)
     CARGA-PEREZOSA: modulos/entrenador/antebrazo-pantorrilla.478307b0.js   (35)
     CARGA-PEREZOSA: modulos/entrenador/cuadriceps.0e6985be.js   (31)

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
     cuánto se abren en abanico y cuánto se levanta el pulgar. Así un gesto pasa a otro poco a poco.
     Un quinto número, si lo hay: cuánto baja el pulgar a apoyarse como un dedo más (la mano en tienda, sobre las yemas, o en garra
     sobre algo ancho). «separados» es la mano abierta con los dedos bien separados; «yemas», esa misma mano en tienda */
  var GESTO = { abierta: [0.04, 0.04, 1, 0], plana: [0.03, 0.03, 0.12, 0], suelta: [0.3, 0.26, 0.3, 0], puno: [1, 1, 0.2, 0], indice: [1, 0, 0.2, 0], pulgar: [1, 1, 0.2, 1],
                separados: [0.04, 0.04, 1.7, 0], yemas: [0.35, 0.35, 1.7, 0, 1] };
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
    if (q.palma) r.palma = [-q.palma[0], q.palma[1], q.palma[2]];
    if (q.barra) r.barra = [-q.barra[0], q.barra[1], q.barra[2]];
    if (q.dedos) r.dedos = [-q.dedos[0], q.dedos[1], q.dedos[2]];
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
      S.m[k] = { tipo: m.tipo || 'suelta', prono: m.prono || 0, mun: m.mun || 0, lat: m.lat || 0, c: gm[0], ci: gm[1], ab: gm[2], pu: gm[3], ap: gm[4] || 0, pal: m.palma ? unidad(m.palma) : null, bar: m.barra ? unidad(m.barra) : null, w: m.palma || m.barra ? 1 : 0,
                 ded: m.palma && m.dedos ? unidad(m.dedos) : null, wd: m.palma && m.dedos ? 1 : 0 };
      /* ── la pierna ── */
      var q = deLado(P, 'p', k) || { suelo: [s * D.caderaX, 0], abre: 6 };
      var cad = mas(S.p, aplicar(S.B, [s * D.caderaX, 0, 0]));
      var pie = null, rumbo = (P.giro && P.giro[0]) || 0;
      if (q.suelo) { pie = piePlantado(k, q, q.rumbo == null ? rumbo : q.rumbo); q = { a: pie.tob, polo: q.polo, plantado: true }; }
      if (q.a) {
        var pq = q.polo;
        if (!pq) {
          pq = aplicar(S.B, [s * 0.25, 0.1, 1]);
          /* con el tronco muy inclinado hacia delante (una bisagra de cadera), «delante de la pelvis» es el suelo y la rodilla se
             iría hacia fuera: con el pie plantado, la rodilla va hacia donde apunta el pie */
          if (pie) { var wq = entre((-S.B[2][1] - 0.766) / 0.174, 0, 1); if (wq > 0) pq = mezcla(pq, [pie.punta[0] + s * 0.08, 0.5, pie.punta[2]], wq * wq * (3 - 2 * wq)); }
        }
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
    /* o se dice, en el mundo, hacia dónde mira la palma (m.palma) o a lo largo de qué va lo que agarra (m.barra, y entonces
       m.palma solo dice de qué lado de la barra queda la palma): la mano que agarra una barra no gira con el codo.
       El antebrazo gira lo que haga falta; si apunta casi hacia donde debería mirar la palma, manda el prono */
    var mira = m.pal;
    if (m.bar && m.w > 0) {
      var qb = cruz(m.bar, lw);
      if (largo(qb) > 0.2) { qb = unidad(qb); mira = punto(qb, m.pal || girar(palma0, lw, pr)) < 0 ? por(qb, -1) : qb; }
    }
    if (mira && m.w > 0) {
      var tp = sinParte(mira, lw), lt = largo(tp);
      if (lt > 0.2) {
        tp = por(tp, 1 / lt);
        var dif = Math.atan2(punto(cruz(palma0, tp), lw), punto(palma0, tp)) / RAD - pr;
        /* por el camino corto; y si hay que dar casi media vuelta, siempre por el mismo lado (girando la palma hacia atrás, que es
           como gira el antebrazo): con ±180 justos, de un instante al siguiente la mano cambiaba de lado y daba un salto */
        dif *= s; while (dif > 210) dif -= 360; while (dif <= -150) dif += 360; dif *= s;
        pr += dif * m.w * entre((lt - 0.2) / 0.3, 0, 1);
      }
    }
    var eje = girar(eje0, lw, pr), palma = girar(palma0, lw, pr);
    var dir = lw;
    if (m.mun) { dir = girar(lw, eje, -m.mun * s); palma = girar(palma, eje, -m.mun * s); }
    if (m.lat) { var ej2 = girar(eje, palma, m.lat); dir = girar(dir, palma, m.lat); eje = ej2; }
    /* la mano apoyada (en el suelo, en una pared): se dice en el mundo hacia dónde mira la palma (m.palma) y hacia dónde van los
       dedos (m.dedos), y la mano queda así haga lo que haga el antebrazo: la muñeca se dobla lo que haga falta. Entre una postura
       apoyada y otra que no lo está, m.wd dice cuánto manda */
    if (m.ded && m.pal && m.wd > 0) {
      var pF = m.pal, dF = unidad(sinParte(m.ded, pF), dir);
      if (m.wd < 1) { pF = unidad(mezcla(unidad(palma), pF, m.wd), pF); dF = unidad(sinParte(mezcla(unidad(dir), dF, m.wd), pF), dF); }
      return { dir: dF, eje: por(cruz(pF, dF), s), palma: pF };
    }
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
      /* el frente del antebrazo (su cara de dentro, la de la palma): perpendicular a él, en el plano en que se dobla el codo. Con el
         brazo estirado es el del brazo; con el codo doblado gira con el antebrazo (el del brazo, a 90°, queda a lo largo de él) */
      L.frenteAnte = unidad(sinParte(menos(por(L.frenteBrazo, punto(uw, lw)), por(uw, largo(sinParte(lw, uw)))), lw), L.frenteBrazo);
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
      var ma = a.m[k], mb = b.m[k], pa = ma.pal, pb = mb.pal;
      /* de una mano con la palma dicha a otra que agarra una barra sin decirla (o al revés): la palma va de la una a la que de verdad
         tiene la otra postura. Si se quedara fija la que se dijo, al llegar la mano se daría la vuelta de golpe */
      if (pa && !pb && mb.bar) pb = Bb[k].mano.palma; else if (pb && !pa && ma.bar) pa = A[k].mano.palma;
      S.m[k] = { tipo: t < 0.5 ? ma.tipo : mb.tipo, prono: mezclaN(ma.prono, mb.prono, t), mun: mezclaN(ma.mun, mb.mun, t), lat: mezclaN(ma.lat, mb.lat, t),
                 c: mezclaN(ma.c, mb.c, t), ci: mezclaN(ma.ci, mb.ci, t), ab: mezclaN(ma.ab, mb.ab, t), pu: mezclaN(ma.pu, mb.pu, t), ap: mezclaN(ma.ap || 0, mb.ap || 0, t),
                 pal: pa && pb ? unidad(mezcla(pa, pb, t), pb) : (pa || pb),
                 bar: ma.bar && mb.bar ? unidad(mezcla(ma.bar, punto(ma.bar, mb.bar) < 0 ? por(mb.bar, -1) : mb.bar, t), mb.bar) : (ma.bar || mb.bar), w: mezclaN(ma.w || 0, mb.w || 0, t),
                 ded: ma.ded && mb.ded ? unidad(mezcla(ma.ded, mb.ded, t), mb.ded) : (ma.ded || mb.ded), wd: mezclaN(ma.wd || 0, mb.wd || 0, t) };
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
  var K_TR = 18, COS_TR = [], SIN_TR = [];        /* los anillos del tronco, la pieza más grande, llevan más puntos */
  (function () { for (var i = 0; i < K_TR; i++) { COS_TR.push(Math.cos(i * 2 * Math.PI / K_TR)); SIN_TR.push(Math.sin(i * 2 * Math.PI / K_TR)); } })();
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

  /* los músculos del tronco: un elipsoide pegado a la superficie de su marco, como los de los miembros. Así se ven
     bien desde cualquier lado: de frente, la mancha entera; de canto, un bulto de luz en el borde (un parche plano,
     de canto, se quedaba en un borrón).
     [grupo, marco, centro local, normal local (hacia fuera), semiejes: a lo ancho, a lo alto, de fondo] */
  var PARCHES = [
    ['pecho', 't', [8.4, 13.4, 10.2], [0.42, 0.1, 0.9], 8.6, 6.8, 3.8],
    ['pecho', 't', [-8.4, 13.4, 10.2], [-0.42, 0.1, 0.9], 8.6, 6.8, 3.8],
    ['core', 'l', [0, 4, 9.2], [0, 0, 1], 7.4, 13.4, 3.4],
    ['core', 'l', [11.2, 5, 4.4], [0.86, 0, 0.5], 4.6, 10, 3],
    ['core', 'l', [-11.2, 5, 4.4], [-0.86, 0, 0.5], 4.6, 10, 3],
    ['core', 'l', [0, 3, -8.8], [0, 0, -1], 7.6, 10.4, 3.2],
    ['dorsal', 't', [9, 7.6, -8.4], [0.5, 0, -0.87], 8.2, 11.6, 3.6],
    ['dorsal', 't', [-9, 7.6, -8.4], [-0.5, 0, -0.87], 8.2, 11.6, 3.6],
    ['espalda_alta', 't', [0, 17.2, -9.2], [0, 0.1, -1], 15, 9.4, 3.4],
    ['gluteos', 'p', [7.6, -2.5, -9.8], [0.45, 0, -0.9], 8, 8.6, 3.8],
    ['gluteos', 'p', [-7.6, -2.5, -9.8], [-0.45, 0, -0.9], 8, 8.6, 3.8],
    ['gluteos', 'p', [15, -2, -2.4], [1, 0, -0.1], 6.5, 7.6, 3.2],
    ['gluteos', 'p', [-15, -2, -2.4], [-1, 0, -0.1], 6.5, 7.6, 3.2]
  ];
  /* los de los miembros: un elipsoide pegado al hueso.
     [grupo, hueso, cara (1, delante; -1, detrás; 0, entero), centro a lo largo, hacia fuera, al frente, semiejes: largo, ancho, fondo] */
  var CALCOS = [
    ['hombros', 'brazo', 0, 3.6, 1.3, 0.2, 6.0, 5.4, 5.6],
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
    /* los músculos de un hueso: sus elipses. «encima» dice cuáles se piden (el del hombro va sobre la manga: si no,
       la manga lo tapa y solo asoma un cerco) */
    var calcos = function (g, hueso, encima) {
      CALCOS.forEach(function (m) {
        if (m[1] !== hueso || (m[0] === 'hombros') !== !!encima) return;
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
      g.tela = capa(g, C.camiSS, C.cami, C.camiLL, C.camiB); calcos(g, 'brazo', true); g.dob = raya(g, C.camiL);
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
      var g = crear('ellipse', { 'class': 'tge-mus', rx: 1, ry: 1, opacity: 0 }, (m[1] === 'p' ? gp : gc).parches);
      g._g = m[0];
      return { g: g, marco: m[1], o: m[2], n: unidad(m[3]), a: m[4], b: m[5], c: m[6] };
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

  /* un elipsoide visto por la cámara es una elipse: c, su centro en la pantalla; a1, a2 y a3, sus ejes vistos por la
     cámara (cam.d); r1, r2 y r3, sus semiejes */
  function elipsoide(m, c, a1, a2, a3, r1, r2, r3, esc) {
    var x1 = a1[0] * r1, y1 = a1[1] * r1, x2 = a2[0] * r2, y2 = a2[1] * r2, x3 = a3[0] * r3, y3 = a3[1] * r3;
    var m11 = x1 * x1 + x2 * x2 + x3 * x3, m22 = y1 * y1 + y2 * y2 + y3 * y3, m12 = x1 * y1 + x2 * y2 + x3 * y3;
    var md = (m11 + m22) / 2, df = Math.sqrt((m11 - m22) * (m11 - m22) / 4 + m12 * m12), ang = 0.5 * Math.atan2(2 * m12, m11 - m22) / RAD;
    pon(m, 'rx', n1(Math.sqrt(Math.max(0.01, md + df)) * esc)); pon(m, 'ry', n1(Math.sqrt(Math.max(0.01, md - df)) * esc));
    pon(m, 'transform', 'translate(' + n1(c[0]) + ',' + n1(c[1]) + ') rotate(' + n1(ang) + ')');
  }
  /* los músculos de un hueso: cada elipsoide, proyectado */
  function calcar(g, cam, O, e, s, f, pulso) {
    for (var i = 0; i < g._mus.length; i++) {
      var m = g._mus[i]; if (!m._nivel) continue;
      var d = m._def, cara = d[2], op = 1;
      if (cara) op = entre((punto(f, cam.k) * cara + 0.55) / 0.7, 0, 1);
      if (op <= 0.01) { pon(m, 'opacity', '0'); continue; }
      elipsoide(m, cam.p(mas(O, mas(por(e, d[3]), mas(por(s, d[4]), por(f, d[5]))))), cam.d(e), cam.d(s), cam.d(f), d[6], d[7], d[8], cam.esc);
      pon(m, 'opacity', n2(op * (m._nivel === 3 ? 1 : 0.9) * pulso));
    }
  }

  /* Pinta el esqueleto E visto por la cámara: traza las piezas y deja en la lista lo que hay que ordenar. */
  Figura.prototype.pintar = function (E, cam, lista) {
    var P = this.P, esc = cam.esc, yo = this, pulso = this.pulso, aire = this.aire || 0;
    var bases = { p: [E.Bp, E.pel], l: [E.Bl, E.lum], t: [E.Bt, E.tor] };
    Object.keys(P).forEach(function (n) { anchos(P[n], esc); });
    /* ── el tronco ──
       Sus secciones son elipses en el espacio (el pecho se hincha un poco al respirar) y, entre cada dos, va otra
       por una curva suave. El contorno es la unión de las envolventes de cada tres secciones seguidas: así vale
       desde cualquier lado (también de pies a cabeza, tumbado, cuando el tronco se ve en escorzo y lo que asoma es
       el pecho entero y la tapa de los hombros) y no pierde la cintura. */
    var S3 = [], i, n = SECC.length, sP = [0];
    for (i = 0; i < n; i++) {
      var q0 = SECC[i], Bm = bases[q0[0]][0];
      S3.push([mas(bases[q0[0]][1], aplicar(Bm, [0, q0[1], q0[4] + (i === 5 ? aire * 0.5 : 0)])), por(Bm[0], q0[2] * (i === 5 ? 1 + aire * 0.008 : 1)), por(Bm[2], q0[3] * ((i === 5 || i === 4) ? 1 + aire * 0.022 : 1))]);
      if (i) sP.push(sP[i - 1] + largo(menos(S3[i][0], S3[i - 1][0])));
    }
    /* hacia dónde va cada cosa (el centro y los dos semiejes) al pasar por la sección i */
    var pend = function (j, q) { var a = Math.max(0, j - 1), b = Math.min(n - 1, j + 1); return por(menos(S3[b][q], S3[a][q]), 1 / ((sP[b] - sP[a]) || 1)); };
    /* una sección entre la i y la siguiente, a t del camino: [centro, semieje a lo ancho, semieje de fondo] */
    var entreSecc = function (j, t) {
      var h = sP[j + 1] - sP[j], t2 = t * t, t3 = t2 * t, h10 = (t3 - 2 * t2 + t) * h, h11 = (t3 - t2) * h, h01 = 3 * t2 - 2 * t3, r = [];
      for (var q = 0; q < 3; q++) r.push(mas(mezcla(S3[j][q], S3[j + 1][q], h01), mas(por(pend(j, q), h10), por(pend(j + 1, q), h11))));
      return r;
    };
    var anilloTr = function (T3) {
      var c = cam.p(T3[0]), a = cam.d(T3[1]), f = cam.d(T3[2]), P = [];
      for (var j = 0; j < K_TR; j++) P.push([c[0] + (a[0] * COS_TR[j] + f[0] * SIN_TR[j]) * esc, c[1] + (a[1] * COS_TR[j] + f[1] * SIN_TR[j]) * esc]);
      return P;
    };
    /* los anillos: el 2·i es la sección i; el 2·i + 1, la de en medio hasta la siguiente */
    var AN = [];
    for (i = 0; i < n; i++) { AN.push(anilloTr(S3[i])); if (i < n - 1) AN.push(anilloTr(entreSecc(i, 0.5))); }
    /* de tres en tres, y cada trío monta sobre el siguiente: si fueran de dos en dos, cuando una sección se ve justo de
       canto (una raya) las dos envolventes que la comparten solo se tocarían en esa raya, y ahí asomaría la costura */
    var union = function (lista) { var d = ''; for (var j = 0; j + 2 < lista.length; j++) d += poli(envolvente(lista[j].concat(lista[j + 1], lista[j + 2]))); return d; };
    /* el pantalón: de la entrepierna a la cintura */
    var dPan = union(AN.slice(0, 7));
    var gp = P.pantalon, gc = P.camiseta, lx = LUZ[0] * esc, ly = LUZ[1] * esc;
    pon(gp.f, 'd', dPan); pon(gp.rec, 'd', dPan); pon(gp.luz, 'd', dPan); pon(gp.luz, 'transform', 'translate(' + n1(lx * 2.6) + ',' + n1(ly * 2.6) + ')');
    /* la camiseta: de un poco por debajo de la cintura al cuello */
    var bajo3 = entreSecc(2, 0.3), dCam = union([anilloTr(bajo3)].concat(AN.slice(5)));
    pon(gc.f, 'd', dCam); pon(gc.rec, 'd', dCam); pon(gc.luz, 'd', dCam); pon(gc.luz, 'transform', 'translate(' + n1(lx * 3.3) + ',' + n1(ly * 3.3) + ')');
    /* el bajo de la camiseta, con su pespunte: la mitad de su aro que queda de este lado */
    pon(gc.bajo, 'd', aro(cam, mas(bajo3[0], por(unidad(menos(S3[3][0], S3[2][0])), 1.3)), bajo3[1], bajo3[2], 1.5)); pon(gc.bajo, 'stroke-width', n2(0.7 * esc)); pon(gc.bajo, 'opacity', '.7');
    /* el cuello de la camiseta: un aro inclinado, y se ve la mitad de este lado */
    var Bt = E.Bt, oc = mas(E.tor, aplicar(Bt, [0, 24.6, 0.4])), uc = por(Bt[0], 7.7), vc = mas(por(Bt[2], 7.0), por(Bt[1], -2.5));
    var dEsc = aro(cam, oc, uc, vc, 1.75);
    pon(gc.escote, 'd', dEsc); pon(gc.escote, 'stroke-width', n2(2.3 * esc)); pon(gc.escote2, 'd', dEsc); pon(gc.escote2, 'stroke-width', n2(0.5 * esc)); pon(gc.escote2, 'opacity', '.55');
    /* el estampado: un plano pegado al pecho */
    var kt = cam.d(Bt[2])[2], est = gc.estampa;
    /* o se ve o no se ve: de canto no se queda a medio borrar, como un fantasma (se quedaba así toda una sentadilla en
       la pared). Aparece cuando el pecho mira a la cámara lo bastante y se va cuando deja de hacerlo, con un margen
       entre lo uno y lo otro para que no parpadee, y tarda en hacerlo unos pocos cuadros */
    if (kt > 0.4) this.estV = true; else if (kt < 0.32) this.estV = false;
    this.estO = this.estO == null ? (this.estV ? 1 : 0) : this.estO + ((this.estV ? 1 : 0) - this.estO) * 0.34;
    if (Math.abs(this.estO - (this.estV ? 1 : 0)) < 0.04) this.estO = this.estV ? 1 : 0;
    if (this.estO > 0) {
      var o = cam.p(mas(E.tor, aplicar(Bt, [0, 9.2, 13.0 + aire * 0.5]))), X = cam.d(Bt[0]), Y = cam.d(Bt[1]), ke = esc * 0.92;
      pon(est, 'transform', 'matrix(' + n2(X[0] * ke) + ',' + n2(X[1] * ke) + ',' + n2(Y[0] * ke) + ',' + n2(Y[1] * ke) + ',' + n1(o[0]) + ',' + n1(o[1]) + ')');
    }
    pon(est, 'opacity', n2(this.estO));
    /* los músculos del tronco: cada elipsoide, proyectado; lo que queda al otro lado del cuerpo no se ve */
    for (i = 0; i < this.parches.length; i++) {
      var pa = this.parches[i], nv = pa.g._nivel;
      if (!nv) continue;
      var Bq = bases[pa.marco][0], nw = aplicar(Bq, pa.n), ve = punto(nw, cam.k);
      if (ve < 0.02) { pon(pa.g, 'opacity', '0'); continue; }
      var ey = unidad(sinParte(Bq[1], nw)), ex = cruz(ey, nw);
      elipsoide(pa.g, cam.p(mas(bases[pa.marco][1], aplicar(Bq, pa.o))), cam.d(ex), cam.d(ey), cam.d(nw), pa.a, pa.b, pa.c, esc);
      pon(pa.g, 'opacity', n2(entre(ve / 0.3, 0, 1) * (nv === 3 ? 1 : 0.9) * pulso));
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
      s = pieza(ga, CUERPO.ante, L.cod, L.lw, L.frenteAnte, cod, mun, zA < zB, zA <= zMano);
      if (ga.rayas) { pon(ga.rayas, 'd', aro(cam, mas(L.cod, por(L.lw, 20.6)), por(s, 4.1), por(L.frenteAnte, 3.7), 1.5)); pon(ga.rayas, 'stroke-width', n2(0.9 * esc)); }
      lista.push({ z: zM, el: gm, pts: [L.cad, L.rod] }, { z: zQ, el: gq, pts: [L.rod, L.tob] }, { z: zB, el: gb, pts: [L.hom, L.cod] }, { z: zA, el: ga, pts: [L.cod, L.mun] });
      yo.mano(k, L, cam, lista, E.S.m[k], zMano < zA);
      yo.pie(k, L, cam, lista);
    });
  };

  /* ── la mano ──
     La palma es una masa; cada dedo, tres falanges que se doblan hacia la palma; el pulgar, dos.
     Según el gesto: abierta, suelta, puño (también agarrando), índice (los demás, cerrados) y pulgar. */
  var DEDOS = [[3.15, 6.7, 1.14, 7], [1.05, 7.6, 1.17, 1.5], [-1.05, 7.1, 1.1, -4], [-3.0, 5.6, 0.97, -10]];     /* a un lado, largo, grosor, abanico */
  var ABRE = [4, 4, 2], CIERRA = [80, 96, 60], KM = 1.12;
  var PALMA = [[0, 3.2, 2.4], [3, 4.1, 2.1, 0.1, 0], [6.6, 4.55, 1.85], [9.1, 4.3, 1.5]];
  /* los huesos de la mano con su gesto, en el mundo y a su medida (sin agrandar): de cada dedo, sus cuatro puntos (la base y el
     final de cada falange); y los tres del pulgar. Los usan el dibujo y la medida de los contactos: son los mismos */
  function huesosMano(L, M) {
    var m = L.mano, W = L.mun, dir = m.dir, eje = m.eje, pal = m.palma;
    var c = M.c == null ? 0.3 : M.c, ci = M.ci == null ? c : M.ci, abn = M.ab == null ? 0.3 : M.ab, pu = M.pu || 0, H = { dedos: [], pulgar: null };
    for (var f = 0; f < 4; f++) {
      var q = DEDOS[f], cf = f === 0 ? ci : c;
      var ab = q[3] * abn * RAD, base = mas(W, mas(por(dir, 9.0 - Math.abs(f - 1.3) * 0.45), por(eje, q[0])));
      var d0 = mas(por(dir, Math.cos(ab)), por(eje, Math.sin(ab))), acum = 0, p = base, lf = [0.44, 0.31, 0.25], P = [base];
      for (var j = 0; j < 3; j++) {
        acum += (ABRE[j] + (CIERRA[j] - ABRE[j]) * cf) * RAD;
        var dd = mas(por(d0, Math.cos(acum)), por(pal, Math.sin(acum))), p2 = mas(p, por(dd, q[1] * lf[j]));
        P.push(p2); p = p2;
      }
      H.dedos.push(P);
    }
    /* el pulgar: abierto hacia su lado, cruzado por delante del puño o levantado; entre uno y otro, lo que toque */
    var u0 = mas(W, mas(por(dir, 2.7), mas(por(eje, 3.3), por(pal, 0.7))));
    var wU = pu, wF = c * (1 - pu), wA = (1 - c) * (1 - pu);
    var pto = function (aD, aE, aP, fD, fE, fP, uD, uE, uP) { return mas(W, mas(por(dir, aD * wA + fD * wF + uD * wU), mas(por(eje, aE * wA + fE * wF + uE * wU), por(pal, aP * wA + fP * wF + uP * wU)))); };
    var u1 = pto(5.1, 6.3, 0.7, 5.6, 4.0, 2.4, 3.2, 7.3, 0.7), u2 = pto(7.4, 8.7, 0.7, 8.2, 0.9, 3.7, 3.0, 11.0, 0.7);
    /* y el pulgar que apoya (M.ap): baja hacia el lado de la palma hasta donde llegan las yemas de los demás dedos */
    if (M.ap > 0) { u1 = mezcla(u1, mas(W, mas(por(dir, 4.3), mas(por(eje, 5.6), por(pal, 3.3)))), M.ap); u2 = mezcla(u2, mas(W, mas(por(dir, 5.0), mas(por(eje, 6.6), por(pal, 7.1)))), M.ap); }
    H.pulgar = [u0, u1, u2];
    return H;
  }
  Figura.prototype.mano = function (k, L, cam0, lista, M, bola) {
    var g = this.P['mano' + k], m = L.mano, W = L.mun, dir = m.dir, eje = m.eje, pal = m.palma;
    /* la mano, un punto más grande que la del esqueleto (es un dibujo): todo crece desde la muñeca */
    var cam = { p: function (q) { return cam0.p(mas(W, por(menos(q, W), KM))); }, d: function (v) { return cam0.d(v); }, k: cam0.k, esc: cam0.esc * KM }, esc = cam.esc;
    var deCara = punto(pal, cam.k) >= 0, HM = huesosMano(L, M);
    /* la palma mira a la cámara: los dedos y el pulgar, por encima; si no, por debajo */
    if (g._cara !== deCara) { g._cara = deCara; if (deCara) { g.appendChild(g.gd); g.appendChild(g.gu); } else { g.insertBefore(g.gd, g.gp); g.insertBefore(g.gu, g.gp); } }
    var a2 = cam.p(W), b2 = cam.p(L.dedos), v = haciaLuz(a2, b2);
    var Hp = masa(cam, W, dir, eje, pal, PALMA, bola ? 3 : 2, bola ? 0 : 1);
    var T = new Tintas(); T.pon(Hp, v, 3.6 * esc, false); vuelca(g.palma, T);
    for (var f = 0; f < 4; f++) {
      var q = DEDOS[f], hd = HM.dedos[f], s = '';
      for (var j = 0; j < 3; j++) s += capsula(cam.p(hd[j]), q[2] * (1 - j * 0.07) * esc, cam.p(hd[j + 1]), q[2] * (0.93 - j * 0.07) * esc);
      pon(g.dedos[f], 'd', s);
    }
    var u0 = HM.pulgar[0], u1 = HM.pulgar[1], u2 = HM.pulgar[2];
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
  /* ── lo que mide el dibujo ──
     A qué distancia queda de un plano (el suelo, una pared, lo alto de un escalón) lo más cercano de cada pieza tal como se dibuja:
     0, lo toca; negativo, se mete en él. El plano es un punto (P0) y su normal (n, unidad) hacia el lado libre. Y cuánto se mete una
     mano en un muslo. Lo usa tools/auditar_entrenador.js (los contactos); el vídeo, no. */
  function seccAPlano(O, e, s, f, secc, P0, n, k, en) {
    var ne = punto(n, e), ns = punto(n, s), nf = punto(n, f), d0 = punto(n, menos(O, P0)), min = 1e9, i, q;
    k = k || 1;
    for (i = 0; i < secc.length; i++) {
      q = secc[i];
      if (en && !en(mas(O, por(mas(por(e, q[0]), mas(por(s, q[3] || 0), por(f, q[4] || 0))), k)))) continue;      /* fuera del paño: no cuenta */
      min = Math.min(min, d0 + k * (ne * q[0] + ns * (q[3] || 0) + nf * (q[4] || 0) - Math.sqrt(ns * ns * q[1] * q[1] + nf * nf * q[2] * q[2])));
    }
    return min;
  }
  /* las bolas de la mano dibujada (la palma, las falanges y el pulgar): [centro, radio], ya agrandadas */
  function bolasMano(L, M) {
    var W = L.mun, m = L.mano, H = huesosMano(L, M), B = [], f, j;
    var pon1 = function (p, r) { B.push([mas(W, por(menos(p, W), KM)), r * KM]); };
    for (f = 0; f < 4; f++) for (j = 0; j < 4; j++) pon1(H.dedos[f][j], DEDOS[f][2] * (j ? 1 - j * 0.07 : 1));
    pon1(H.pulgar[0], 1.75); pon1(H.pulgar[1], 1.4); pon1(H.pulgar[2], 1.18);
    /* la palma: en cada sección, su centro y sus dos lados, con medio grosor de radio */
    PALMA.forEach(function (q) { [-1, 0, 1].forEach(function (u) { pon1(mas(W, mas(por(m.dir, q[0]), por(m.eje, (q[3] || 0) + u * (q[1] - q[2])))), q[2]); }); });
    return B;
  }
  /* «en» (opcional, en todas): una función que dice si un punto cae en el paño que se mide (una pared estrecha, la tapa de un banco):
     lo que queda fuera de él no cuenta. Sin ella, el plano no tiene bordes */
  function manoAPlano(L, M, P0, n, en) {
    var m = L.mano, min = seccAPlano(L.mun, m.dir, m.eje, m.palma, PALMA, P0, n, KM, en), B = bolasMano(L, M), i;
    for (i = 0; i < 19; i++) if (!en || en(B[i][0])) min = Math.min(min, punto(n, menos(B[i][0], P0)) - B[i][1]);          /* los dedos y el pulgar */
    return min;
  }
  function zapaAPlano(L, k, P0, n, en) {
    var sg = k === 'i' ? 1 : -1, fl = (L.flex || 0) * RAD, cf = Math.cos(fl), sf = Math.sin(fl);
    var lado = por(unidad(cruz(L.arriba, L.punta), [1, 0, 0]), sg), bola = mas(L.suela, por(L.punta, D.bola));
    var pf = mas(por(L.punta, cf), por(L.arriba, sf)), af = mas(por(L.arriba, cf), por(L.punta, -sf)), min = 1e9, nl = punto(n, lado);
    [ZAPA.piso, ZAPA.media, ZAPA.pala].forEach(function (S) {
      S.forEach(function (q) {
        var atras = q[0] <= D.bola, nu = punto(n, atras ? L.arriba : af);
        var c = atras ? mas(L.suela, mas(por(L.punta, q[0]), por(L.arriba, q[3]))) : mas(bola, mas(por(pf, q[0] - D.bola), por(af, q[3])));
        if (en && !en(c)) return;
        min = Math.min(min, punto(n, menos(c, P0)) - Math.sqrt(nl * nl * q[1] * q[1] + nu * nu * q[2] * q[2]));
      });
    });
    return min;
  }
  /* un miembro: 'muslo', 'pierna' (con su rótula), 'brazo' o 'ante'; su piel */
  function miembroAPlano(E, k, cual, P0, n, en) {
    var L = E[k], sg = k === 'i' ? -1 : 1, O, e, f;
    if (cual === 'muslo') { O = L.cad; e = L.qu; f = L.frenteMuslo; } else if (cual === 'pierna') { O = L.rod; e = L.ql; f = L.frentePierna; }
    else if (cual === 'brazo') { O = L.hom; e = L.uw; f = L.frenteBrazo; } else { O = L.cod; e = L.lw; f = L.frenteAnte; }
    var s = por(unidad(cruz(e, f), [1, 0, 0]), sg), min = 1e9;
    CUERPO[cual].piel.forEach(function (q) {
      /* con las tapas redondas de sus extremos (la bola del codo, de la rodilla, de la muñeca, del tobillo), como las pone masa():
         la bola es de la pieza que se pinta primero, que depende de la cámara, así que aquí cuentan las de las dos */
      var S = q.s.slice(), tp = (q.t || 0) | (q.une === 'ppio' || q.une2 === 'ppio' ? 1 : 0) | (q.une === 'fin' || q.une2 === 'fin' ? 2 : 0), z, w;
      if (tp & 1) { z = q.s[0]; w = Math.min(z[1], z[2]); S.push([z[0] - w * 0.5, z[1] * 0.86, z[2] * 0.86, z[3] || 0, z[4] || 0], [z[0] - w * 0.88, z[1] * 0.46, z[2] * 0.46, z[3] || 0, z[4] || 0]); }
      if (tp & 2) { z = q.s[q.s.length - 1]; w = Math.min(z[1], z[2]); S.push([z[0] + w * 0.5, z[1] * 0.86, z[2] * 0.86, z[3] || 0, z[4] || 0], [z[0] + w * 0.88, z[1] * 0.46, z[2] * 0.46, z[3] || 0, z[4] || 0]); }
      min = Math.min(min, seccAPlano(O, e, s, f, S, P0, n, 1, en));
    });
    return min;
  }
  function troncoAPlano(E, P0, n, en) {
    var bases = { p: [E.Bp, E.pel], l: [E.Bl, E.lum], t: [E.Bt, E.tor] }, min = 1e9;
    SECC.forEach(function (q) {
      var B = bases[q[0]][0], c = mas(bases[q[0]][1], aplicar(B, [0, q[1], q[4]])), na = punto(n, B[0]) * q[2], nb = punto(n, B[2]) * q[3];
      if (en && !en(c)) return;
      min = Math.min(min, punto(n, menos(c, P0)) - Math.sqrt(na * na + nb * nb));
    });
    return min;
  }
  /* cuánto se mete la mano k en el muslo m (su piel y, arriba, la pernera): > 0, dentro; 0, lo toca; < 0, separada. Entre «desde» y
     «hasta» centímetros de la cadera (por defecto, de 8 a 37: ni la cadera ni la rodilla) */
  function manoEnMuslo(E, k, m, desde, hasta) {
    var L = E[m], O = L.cad, e = L.qu, f = L.frenteMuslo, s = por(unidad(cruz(e, f), [1, 0, 0]), m === 'i' ? -1 : 1), B = bolasMano(E[k], E.S.m[k]), max = -1e9;
    var en = function (S, t) {            /* la sección de una masa a t de la cadera: [semiancho, semifondo, a un lado, al frente] */
      if (t < S[0][0] || t > S[S.length - 1][0]) return null;
      for (var i = 1; i < S.length; i++) if (t <= S[i][0]) { var a = S[i - 1], b = S[i], u = (t - a[0]) / ((b[0] - a[0]) || 1); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * u, (a[4] || 0) + ((b[4] || 0) - (a[4] || 0)) * u]; }
      return null;
    };
    B.forEach(function (q) {
      var v = menos(q[0], O), t = punto(v, e);
      if (t < (desde == null ? 8 : desde) || t > (hasta == null ? 37 : hasta)) return;
      [CUERPO.muslo.piel[0].s, CUERPO.muslo.tela[0].s].forEach(function (S) {
        var c = en(S, t); if (!c) return;
        var x = punto(v, s) - c[2], z = punto(v, f) - c[3], ro = Math.sqrt(x * x + z * z) || 1e-6, cx = x / ro, cz = z / ro;
        max = Math.max(max, c[0] * c[1] / Math.sqrt(c[1] * c[1] * cx * cx + c[0] * c[0] * cz * cz) + q[1] - ro);
      });
    });
    return max;
  }
  /* ── las manos no se meten en los muslos ──
     apartaMano(E, k): cuánto y hacia dónde hay que mover la muñeca k para que su mano (tal como se dibuja) salga de los dos muslos
     (su piel y, arriba, la pernera), y cómo de adentro está. Devuelve { v, c } o null si no toca ninguno:
     · v: la media de lo que pide cada parte metida (lo que se mete, hacia fuera del eje del muslo), pesando mucho más la que más: si
       todas piden lo mismo, es casi lo de la más metida (y el Director repite hasta acabar de sacarla); si unas piden un lado y
       otras el contrario, se anulan poco a poco;
     · c: lo cerca del eje que llega lo más metido (1, en la piel; 0, en el eje).
     Cuenta el muslo de 8 a 37 cm de la cadera; hacia la cadera y hacia la rodilla se va afinando hasta quedar en nada (de 8 a 4 y de
     37 a 40): las manos en la cintura y en las rodillas no se mueven de su sitio. Es la misma superficie que mide manoEnMuslo (la piel y, arriba, la
     pernera): donde acaba la pernera hay un escalón, y de que la mano no salte al cruzarlo se ocupa el Director, que desliza lo
     apartado (60-director.js: despejar, en cada cuadro, y suave) */
  function apartaMano(E, k) {
    var B = bolasMano(E[k], E.S.m[k]), sx = 0, sy = 0, sz = 0, sw = 0, cmin = 2, cual = null, MASAS = [CUERPO.muslo.piel[0].s, CUERPO.muslo.tela[0].s];
    var en = function (S, t) {
      if (t < S[0][0] || t > S[S.length - 1][0]) return null;
      for (var i = 1; i < S.length; i++) if (t <= S[i][0]) { var a = S[i - 1], b = S[i], u = (t - a[0]) / ((b[0] - a[0]) || 1); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * u, (a[4] || 0) + ((b[4] || 0) - (a[4] || 0)) * u]; }
      return null;
    };
    LADOS.forEach(function (m) {
      var L = E[m], O = L.cad, e = L.qu, f = L.frenteMuslo, s = por(unidad(cruz(e, f), [1, 0, 0]), m === 'i' ? -1 : 1);
      B.forEach(function (q) {
        var v = menos(q[0], O), t = punto(v, e), r = Math.min(entre((t - 4) / 4, 0, 1), entre((40 - t) / 3, 0, 1)), d = 0, n, c, x, z, ro, cx, cz, R, dn, ux, uz, co, w;
        if (r <= 0) return;
        /* la superficie que toca: de la piel y la pernera (donde la hay), la de más afuera */
        for (n = 0; n < 2; n++) {
          c = en(MASAS[n], t); if (!c) continue;
          x = punto(v, s) - c[2]; z = punto(v, f) - c[3]; ro = Math.sqrt(x * x + z * z);
          cx = ro > 1e-6 ? x / ro : 1; cz = ro > 1e-6 ? z / ro : 0;
          R = r * c[0] * c[1] / Math.sqrt(c[1] * c[1] * cx * cx + c[0] * c[0] * cz * cz);
          dn = R + q[1] - ro;
          if (R >= 0.3 && dn > d) { d = dn; ux = cx; uz = cz; co = ro / R; }
        }
        if (d <= 0) return;
        if (co < cmin) { cmin = co; cual = m; }
        w = d * d; sw += w; sx += w * d * (ux * s[0] + uz * f[0]); sy += w * d * (ux * s[1] + uz * f[1]); sz += w * d * (ux * s[2] + uz * f[2]);
      });
    });
    if (sw <= 0) return null;
    return { v: [sx / sw, sy / sw, sz / sw], c: cmin, m: cual };
  }
  /* la muñeca k vista desde el muslo m: [a lo largo (desde la cadera), a qué distancia de su eje, y a qué lado (grados: 0, hacia fuera;
     90, por delante; 180, hacia el otro muslo)]; y al revés, el punto del mundo que es eso */
  function marcoMuslo(E, m) { var L = E[m], f = L.frenteMuslo; return { O: L.cad, e: L.qu, f: f, s: por(unidad(cruz(L.qu, f), [1, 0, 0]), m === 'i' ? -1 : 1) }; }
  function cilMuslo(E, k, m) { var M = marcoMuslo(E, m), v = menos(E[k].mun, M.O), x = punto(v, M.s), z = punto(v, M.f); return [punto(v, M.e), Math.sqrt(x * x + z * z), Math.atan2(z, x) / RAD]; }
  function deCilMuslo(E, m, c) { var M = marcoMuslo(E, m), a = c[2] * RAD; return mas(M.O, mas(por(M.e, c[0]), mas(por(M.s, c[1] * Math.cos(a)), por(M.f, c[1] * Math.sin(a))))); }
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
     Una cabeza con volumen, hecha como el cuerpo: gira de verdad. Antes eran tres dibujos planos (de
     frente, de perfil y de espaldas) entre los que se saltaba; de tres cuartos salía el de frente con
     los rasgos corridos, y se notaba. Ahora:
       · el cráneo y la quijada son dos elipsoides; el pelo, el cráneo un punto más gordo por encima
         de la línea del pelo (un plano que baja de la frente a la nuca). Se pinta la cabeza entera en
         el color del pelo y, encima, la piel que se ve desde donde mira la cámara;
       · la nariz y las orejas son bultos de verdad: de perfil, asoman;
       · el tupé son púas (conos) sobre el pelo, y la cinta, un aro alrededor de la cabeza;
       · los rasgos (ojos, cejas, boca, colorete) van pegados a la cara, cada uno en su plano: al
         girar se estrechan y se esconden como en una cara de verdad. La boca son dos mitades, una a
         cada lado, para que de perfil se le vea la comisura; las gafas, un plano rígido con patillas.
     Las bocas y los párpados son los del presentador (modulos/guia.js), en sus medidas: una unidad de
     aquel dibujo son 0,195 cm. El punto E.cab es la base de la cabeza (la barbilla); +X, su
     izquierda; +Z, hacia donde mira. */
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
  /* las formas de un ojo, centrado en (0, 0): cuánto se abre (a), cuánto se entorna por abajo (b), el arco
     de un ojo cerrado que ríe, y de qué lado cae el rabillo */
  function ojoFormas(a, b, arcoO, fuera) {
    var l = -11.5, r = 11.5, ab = a > 1 ? 1 : a, c = 1 - ab;
    var t = -16 * a - arcoO * c, f = 14 * (1 - 0.5 * b) * ab - arcoO * c;
    var n = function (v) { return v.toFixed(1); };
    var top = 'M' + l + ',0 C-8,' + n(t) + ' 8,' + n(t) + ' ' + r + ',0';
    return {
      hueco: top + ' C8,' + n(f) + ' -8,' + n(f) + ' ' + l + ',0z',
      sombra: top + ' C8,' + n(t + 7.5) + ' -8,' + n(t + 7.5) + ' ' + l + ',0z',
      parpado: top + (fuera < 0 ? ' M' + l + ',0 l-2.4,-1.5' : ' M' + r + ',0 l2.4,-1.5'),
      bajo: ab > 0.3 ? 'M' + (l + 2) + ',1 C-7,' + n(f + 1) + ' 7,' + n(f + 1) + ' ' + (r - 2) + ',1' : '',
      pliegue: 'M' + (l + 1.5) + ',-3.6 C-8,' + n(t - 4.6) + ' 8,' + n(t - 4.6) + ' ' + (r - 1.5) + ',-3.6'
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


  /* ── las medidas de la cabeza, en centímetros desde la barbilla ── */
  var U_CARA = 0.195, K_CAB = 1.13;      /* una unidad del dibujo de la cara, en cm; y cuánto se agranda la cabeza entera (es un dibujo: la cara tiene que leerse de lejos) */
  var CRANEO = { c: [0, 19.5, -0.6], r: [11.3, 13.4, 11.9] }, QUIJADA = { c: [0, 9.6, 1.0], r: [9.5, 8.3, 9.6] };
  var MENTON = { c: [0, 4.4, 6.5], r: [4.8, 3.3, 3.7] };
  var MELENA = { c: [0, 19.5, -0.6], r: [11.9, 14.0, 12.5] }, NARIZ = { c: [0, 11.7, 11.2], r: [1.75, 2.05, 2.7] }, OREJA = { c: [10.4, 12.9, -0.4], r: [1.6, 3.3, 2.3] };
  /* la línea del pelo: un plano que pasa por lo alto de la frente (0, 27,5, 10) y baja hasta la nuca (0, 5,5, −10,5), rozando
     lo alto de las orejas. De él hacia arriba, pelo */
  var PL_P = [0, 27.5, 10.0], PL_N = unidad([0, 20.5, -22]);
  function enPelo(p) { return (p[0] - PL_P[0]) * PL_N[0] + (p[1] - PL_P[1]) * PL_N[1] + (p[2] - PL_P[2]) * PL_N[2]; }
  function n4(v) { return (Math.round(v * 10000) / 10000).toString(); }
  /* una esfera de puntos: con ella se sabe qué parte de cada bulto mira a la cámara */
  var ESFERA = (function () {
    var L = [[0, 1, 0], [0, -1, 0]], i, j, la, lo;
    for (i = -5; i <= 5; i++) for (j = 0; j < 16; j++) { la = i * 15 * RAD; lo = (j + (i & 1) * 0.5) * 22.5 * RAD; L.push([Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]); }
    return L;
  })();
  var N_SIL = 26, COS_S = [], SIN_S = [];
  (function () { for (var i = 0; i < N_SIL; i++) { COS_S.push(Math.cos(i * 2 * Math.PI / N_SIL)); SIN_S.push(Math.sin(i * 2 * Math.PI / N_SIL)); } })();
  function enEl(el, s) { return [el.c[0] + el.r[0] * s[0], el.c[1] + el.r[1] * s[1], el.c[2] + el.r[2] * s[2]]; }
  /* los puntos de piel de un bulto (los que quedan por debajo de la línea del pelo), calculados una vez */
  function pielDe(el) { var L = []; ESFERA.forEach(function (s) { var p = enEl(el, s); if (enPelo(p) <= 0) L.push({ s: s, p: p }); }); return L; }
  var P_CRANEO = pielDe(CRANEO), P_QUIJADA = pielDe(QUIJADA), P_MENTON = pielDe(MENTON);
  /* y los de pelo de la melena */
  var P_MELENA = (function () { var L = []; ESFERA.forEach(function (s) { var p = enEl(MELENA, s); if (enPelo(p) > 0) L.push({ s: s, p: p }); }); return L; })();
  /* y la propia línea del pelo sobre el cráneo: la curva por la que el plano lo corta */
  var CORTE = (function () {
    var r = CRANEO.r, m = [r[0] * PL_N[0], r[1] * PL_N[1], r[2] * PL_N[2]], M = largo(m), mu = por(m, 1 / M), h = punto(menos(PL_P, CRANEO.c), PL_N) / M;
    var a = unidad(cruz(mu, [1, 0, 0])), b = cruz(mu, a), ro = Math.sqrt(Math.max(0, 1 - h * h)), L = [], i, t, s;
    for (i = 0; i < 40; i++) { t = i * Math.PI / 20; s = mas(por(mu, h), mas(por(a, ro * Math.cos(t)), por(b, ro * Math.sin(t)))); L.push({ s: s, p: enEl(CRANEO, s) }); }
    return L;
  })();
  /* el tupé: púas sobre el pelo. [hacia qué lado (grados, 0 al frente), a qué altura, largo, radio de la base] */
  var PUAS = (function () {
    /* más altas en el centro y echadas un poco hacia su izquierda: un tupé peinado, no una corona */
    return [[-50, 42, 6.6, 4.2, 0.1], [-27, 45, 9.2, 4.6, 0.16], [-2, 47, 11.6, 4.9, 0.22], [23, 46, 10.2, 4.7, 0.3], [47, 43, 7.4, 4.3, 0.34],
      [-38, 62, 7.4, 4.5, 0.12], [-13, 65, 9.4, 4.8, 0.2], [13, 65, 9.6, 4.8, 0.28], [38, 62, 7.6, 4.5, 0.32],
      [-22, 81, 6.2, 4.4, 0.16], [5, 83, 6.8, 4.5, 0.22], [28, 80, 6.0, 4.3, 0.26], [-76, 58, 4.6, 3.8, 0], [76, 58, 4.6, 3.8, 0.1]].map(function (q) {
      var az = q[0] * RAD, el = q[1] * RAD, s = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
      var b = enEl(MELENA, s), n = unidad([s[0] / MELENA.r[0], s[1] / MELENA.r[1], s[2] / MELENA.r[2]]);
      var t1 = unidad(cruz([0, 1, 0], n), [1, 0, 0]), t2 = cruz(n, t1), dir = unidad([n[0] * 0.7 + Math.sin(az) * 0.2 + (q[4] || 0), n[1] * 0.7 + 0.8, n[2] * 0.55 + 0.06]);
      var aro = [], i, base = menos(b, por(n, 1.1));
      for (i = 0; i < 10; i++) aro.push(mas(base, mas(por(t1, q[3] * Math.cos(i * Math.PI / 5)), por(t2, q[3] * 0.85 * Math.sin(i * Math.PI / 5)))));
      return { b: base, n: n, dir: dir, L: q[2], R: q[3], aro: aro };
    });
  })();
  /* lo que le falta a la cabeza (el pelo, la quijada, el mentón, la nariz, las orejas y las púas del tupé en reposo) para tocar un
     plano: como las medidas de 20-figura.js, para la auditoría de los contactos */
  function cabezaAPlano(E, P0, n, en) {
    var Bc = E.Bc, nl = [punto(n, Bc[0]), punto(n, Bc[1]), punto(n, Bc[2])], d0 = punto(n, menos(E.cab, P0)), min = 1e9;
    if (en && !en(mas(E.cab, aplicar(Bc, por(MELENA.c, K_CAB))))) return min;        /* la cabeza, fuera del paño que se mide */
    [MELENA, QUIJADA, MENTON, NARIZ, OREJA, { c: [-OREJA.c[0], OREJA.c[1], OREJA.c[2]], r: OREJA.r }].forEach(function (el) {
      var a = nl[0] * el.r[0], b = nl[1] * el.r[1], c = nl[2] * el.r[2];
      min = Math.min(min, d0 + K_CAB * (nl[0] * el.c[0] + nl[1] * el.c[1] + nl[2] * el.c[2] - Math.sqrt(a * a + b * b + c * c)));
    });
    PUAS.forEach(function (q) { min = Math.min(min, d0 + K_CAB * (nl[0] * (q.b[0] + q.dir[0] * q.L) + nl[1] * (q.b[1] + q.dir[1] * q.L) + nl[2] * (q.b[2] + q.dir[2] * q.L))); });
    return min;
  }
  /* la cinta: un aro alrededor de la cabeza, más alto en la frente que en la nuca */
  var CINTA = (function () {
    var L = [], N = 40, j, t, fi, DB = 5.6 * RAD, r = [MELENA.r[0] + 0.3, MELENA.r[1] + 0.3, MELENA.r[2] + 0.3];
    var en = function (t, f) { return [MELENA.c[0] + r[0] * Math.sin(t) * Math.cos(f), MELENA.c[1] + r[1] * Math.sin(f), MELENA.c[2] + r[2] * Math.cos(t) * Math.cos(f)]; };
    for (j = 0; j < N; j++) {
      t = j * 2 * Math.PI / N; fi = (12.8 + 17.7 * Math.cos(t)) * RAD;
      L.push({ s: [Math.sin(t) * Math.cos(fi) / r[0], Math.sin(fi) / r[1], Math.cos(t) * Math.cos(fi) / r[2]], up: en(t, fi + DB), lo: en(t, fi - DB), luz: en(t, fi + DB * 0.45) });
    }
    return L;
  })();
  var NUDO = (function () { var f = (12.8 - 17.7) * RAD, p = [0, MELENA.c[1] + (MELENA.r[1] + 0.3) * Math.sin(f), MELENA.c[2] - (MELENA.r[2] + 1.0) * Math.cos(f)]; return { p: p, colas: [[[-0.5, -0.7, 0.1], [-3.2, -7.0, 0.9], [-0.9, -5.8, 1.0]], [[0.5, -0.7, 0.1], [3.2, -7.0, 0.9], [0.9, -5.8, 1.0]]].map(function (T) { return T.map(function (d) { return mas(p, d); }); }) }; })();
  /* los planos de los rasgos: el ancla, hacia dónde mira (n), su derecha (u) y su arriba (v) */
  function plano(a, giro, cae, k) {
    var g = giro * RAD, n = unidad([Math.sin(g), -(cae || 0), Math.cos(g)]);
    return { a: a, n: n, u: [Math.cos(g), 0, -Math.sin(g)], v: [0, 1, 0], k: k || 1 };
  }
  var PL = {
    ojo: [plano([-5.25, 15.3, 9.5], -22, 0.05, 1.14), plano([5.25, 15.3, 9.5], 22, 0.05, 1.14)],
    boca: [plano([0, 6.9, 10.25], -30, 0.12), plano([0, 6.9, 10.25], 30, 0.12)],
    rubor: [plano([-7.1, 9.6, 6.5], -48, 0.1), plano([7.1, 9.6, 6.5], 48, 0.1)],
    gota: [plano([-9.3, 21.4, 5.2], -58, 0), plano([9.3, 21.4, 5.2], 58, 0)],
    gafas: plano([0, 15.4, 11.7], 0, 0)
  };

  function Cabeza(defs, u) {
    var p = function (n) { return u + '-' + n; }, url = function (n) { return 'url(#' + u + '-' + n + ')'; }, yo = this;
    /* en <defs>: el iris y los recortes (la piel que se ve, cada ojo, la boca y sus dos mitades) */
    var hueco = crear('g', null, defs);
    hueco.innerHTML = '<radialGradient id="' + p('iris') + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c98f4e"/><stop offset=".6" stop-color="#8a5a2c"/><stop offset="1" stop-color="#4a2c12"/></radialGradient>' +
      '<clipPath id="' + p('cara') + '"><path class="tgh-c-cara" d=""/></clipPath>' +
      '<clipPath id="' + p('ojo0') + '"><path class="tgh-c-ojo0" d=""/></clipPath><clipPath id="' + p('ojo1') + '"><path class="tgh-c-ojo1" d=""/></clipPath>' +
      '<clipPath id="' + p('boca') + '"><path class="tgh-c-boca" d=""/></clipPath>' +
      '<clipPath id="' + p('mitad0') + '"><rect x="-90" y="-70" width="90" height="140"/></clipPath><clipPath id="' + p('mitad1') + '"><rect x="0" y="-70" width="90" height="140"/></clipPath>';
    this.defs = hueco;
    var g = crear('g', { 'class': 'tgh' }); this.g = g;
    this.anchos = [];
    var lleno = function (color, padre, borde, k) { var e = crear('path', { d: '', fill: color }, padre || g); if (borde) { e.setAttribute('stroke', borde); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); e._k = k || 1.2; yo.anchos.push(e); } return e; };
    var raya = function (color, k, padre) { var e = crear('path', { d: '', fill: 'none', stroke: color, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, padre || g); e._k = k; yo.anchos.push(e); return e; };
    /* 1. las líneas de contorno, debajo de todo: de cada una solo se ve lo que asoma por fuera de los rellenos */
    this.cCab = raya(C.peloSS, 1.3); this.cPua = raya(C.peloSS, 1.3); this.cPiel = raya(C.pielB, 1.3); this.cNar = raya(C.pielB, 1.2);
    /* 2. lo que queda por detrás de la cabeza y solo asoma: la oreja y la patilla del otro lado, las púas de detrás, la nariz y el nudo */
    var gd = crear('g', null, g);
    this.oreD = [lleno(C.piel, gd, C.pielB), lleno(C.piel, gd, C.pielB)];
    this.patD = [raya(C.mont, 0.55, gd), raya(C.mont, 0.55, gd)];
    this.narD = lleno(C.pielS, gd, C.pielB);
    this.puaD = [lleno(C.peloS, gd), lleno(C.pelo, gd), lleno(C.peloL, gd)];
    /* 3. el pelo: la cabeza entera en su color, a tres tintas */
    this.pelo = [lleno(C.peloS), lleno(C.pelo), lleno(C.peloL)];
    /* 4. la piel que se ve, a dos tintas */
    this.piel = [lleno(C.pielS), lleno(C.piel)];
    /* 4 bis. visto por detrás, el pelo de la nuca tapa la piel: el pelo que se ve, encima */
    this.nuca = [lleno(C.peloS), lleno(C.pelo), lleno(C.peloL)];
    /* 5. los rasgos, recortados a esa piel */
    var gc = crear('g', { 'clip-path': url('cara') }, g);
    this.cCara = hueco.querySelector('.tgh-c-cara');
    this.rubor = [0, 1].map(function () { var q = crear('g', null, gc); crear('ellipse', { cx: 0, cy: 0, rx: 13.5, ry: 8.5, fill: C.rubor }, q); return q; });
    this.boca = [0, 1].map(function (n) {
      var q = crear('g', { 'clip-path': url('mitad' + n) }, gc), d = crear('g', { transform: 'scale(1.1547,1) translate(-160,-180)' }, q), r = { g: q };
      r.f = crear('path', { d: '', fill: C.boca }, d);
      var dc = crear('g', { 'clip-path': url('boca') }, d);
      r.lengua = crear('ellipse', { cx: 160, cy: 197, rx: 16, ry: 8.5, fill: C.lengua }, dc);
      r.d = crear('path', { d: '', fill: C.diente }, dc);
      r.r = crear('path', { d: '', fill: 'none', stroke: '#b9aea6', 'stroke-width': 1.1, 'stroke-linecap': 'round' }, dc);
      r.l = crear('path', { d: '', fill: 'none', stroke: '#8c4a3e', 'stroke-width': 2.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, d);
      return r;
    });
    this.bocaClip = hueco.querySelector('.tgh-c-boca');
    this.ojo = [0, 1].map(function (n) {
      var q = crear('g', null, gc), r = { g: q, hueco: hueco.querySelector('.tgh-c-ojo' + n) };
      r.blanco = crear('path', { d: '', fill: '#ffffff' }, q);
      var dc = crear('g', { 'clip-path': url('ojo' + n) }, q);
      r.iris = crear('g', null, dc);
      crear('circle', { cx: 0, cy: -0.5, r: 8.6, fill: url('iris') }, r.iris); crear('circle', { cx: 0, cy: -0.5, r: 8.6, fill: 'none', stroke: '#2a180b', 'stroke-width': 1.3 }, r.iris);
      crear('circle', { cx: 0, cy: -0.5, r: 4.1, fill: '#160b05' }, r.iris); crear('circle', { cx: -3, cy: -4, r: 2.9, fill: '#ffffff' }, r.iris); crear('circle', { cx: 2.9, cy: 2.6, r: 1.3, fill: '#ffffff', opacity: 0.9 }, r.iris);
      r.sombra = crear('path', { d: '', fill: '#4a2f22', opacity: 0.2 }, dc);
      r.pliegue = crear('path', { d: '', fill: 'none', stroke: C.pielSS, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.55 }, q);
      r.bajo = crear('path', { d: '', fill: 'none', stroke: C.pielSS, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.75 }, q);
      r.parpado = crear('path', { d: '', fill: 'none', stroke: '#3d2a1c', 'stroke-width': 2.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, q);
      /* la ceja: la de la izquierda de la pantalla y su espejo */
      var s = n ? -1 : 1, x = function (v) { return n1(s * v); };
      r.ceja = crear('path', { fill: C.ceja, d: 'M' + x(-21.5) + ',-24.5 C' + x(-14) + ',-34.5 ' + x(3) + ',-38.5 ' + x(20) + ',-33.5 C' + x(21.6) + ',-33 ' + x(21.6) + ',-28.4 ' + x(19.5) + ',-28 C' + x(5) + ',-31.5 ' + x(-10) + ',-30 ' + x(-18.5) + ',-23 C' + x(-20.5) + ',-21.5 ' + x(-22.5) + ',-23 ' + x(-21.5) + ',-24.5z' }, q);
      return r;
    });
    /* 6. la nariz, cuando se le ve la cara; y las púas del tupé que quedan de este lado */
    this.nar = [lleno(C.pielS), lleno(C.piel)];
    this.pua = [lleno(C.peloS), lleno(C.pelo), lleno(C.peloL)];
    /* 7. la oreja de este lado, la cinta (con su nudo y sus colas, por detrás) y las gafas */
    this.oreA = [lleno(C.piel, null, C.pielB), lleno(C.piel, null, C.pielB)];
    this.oreI = [raya(C.pielSS, 0.5), raya(C.pielSS, 0.5)];
    this.colas = lleno(C.pantS, null, C.pantB, 1.0);
    this.cinta = lleno(C.pant, null, C.pantB, 1.0); this.cinta.setAttribute('fill-rule', 'evenodd');
    this.cintaL = raya(C.pantL, 0.55);
    this.nudo = lleno(C.pantS, null, C.pantB, 1.0);
    this.patA = [raya(C.mont, 0.55), raya(C.mont, 0.55)];
    this.canto = raya(C.mont, 0.8);
    var gg = crear('g', null, g); this.gafas = gg;
    /* dos cristales de 50 x 38 con las esquinas redondas, su brillo, su montura y el puente */
    [-54, 4].forEach(function (x) {
      crear('rect', { x: x + 2, y: -19, width: 46, height: 34, rx: 7, fill: '#dff1ff', 'fill-opacity': 0.1 }, gg);
      crear('path', { d: 'M' + (x + 33) + ',-15 L' + (x + 43) + ',-15 M' + (x + 44) + ',-13 L' + (x + 44) + ',-6', fill: 'none', stroke: '#ffffff', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0.75 }, gg);
      crear('path', { 'fill-rule': 'evenodd', fill: C.mont, d: 'M' + (x + 8) + ',-21 h34 a8,8 0 0 1 8,8 v22 a8,8 0 0 1 -8,8 h-34 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z M' + (x + 9.6) + ',-15.2 a6,6 0 0 0 -6,6 v17.4 a6,6 0 0 0 6,6 h30.8 a6,6 0 0 0 6,-6 v-17.4 a6,6 0 0 0 -6,-6z' }, gg);
    });
    crear('path', { d: 'M-4.6,-7 Q0,-11.5 4.6,-7', fill: 'none', stroke: C.mont, 'stroke-width': 4.4, 'stroke-linecap': 'round' }, gg);
    /* 8. las gotas de sudor, una en cada sien */
    this.gota = [0, 1].map(function () { var q = crear('g', null, g); crear('path', { d: 'M0,-10 C0,-10 -6.5,0.5 -6.5,5.5 a6.5,6.5 0 0 0 13,0 C6.5,0.5 0,-10 0,-10z', fill: '#8fd6fb', stroke: '#3aa0d8', 'stroke-width': 1.2 }, q); return q; });
    /* el estado de la cara: cada cosa va hacia su meta con suavidad */
    this.e = EMO.contento; this.emo = 'contento';
    this.v = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.m = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.bocaN = 'sonrisa'; this.bocaBase = 'sonrisa'; this.parp = 0; this.parpT = -1; this.prox = 1.4; this.t = 0; this.habla = 0; this.bocaT = 0;
    /* el tupé va un instante detrás de la cabeza: se ladea, se echa atrás y se estira */
    this.peloA = new Muelle(17, 0.25); this.peloF = new Muelle(17, 0.25); this.peloY = new Muelle(20, 0.3);
    this.cAnt = null; this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.dt = 0; this.corte = true;
  }
  /* el gesto de la cara */
  Cabeza.prototype.emocion = function (n) {
    var e = EMO[n] || EMO.contento, o = e.ojos || [1, 1], c = e.cejas || [0, 0, 0, 0], m = this.m;
    this.emo = EMO[n] ? n : 'contento'; this.e = e;
    m.aI = o[0]; m.aD = o[1]; m.bb = e.entorna || 0; m.cIy = c[0]; m.cIr = -c[1]; m.cDy = c[2]; m.cDr = c[3];
    m.rubor = e.rubor == null ? 0.24 : e.rubor;
    this.bocaBase = e.boca || 'sonrisa'; if (!this.habla) this.bocaN = this.bocaBase;
  };
  Cabeza.prototype.sudar = function (cuanto) { this.m.sudor = cuanto ? 1 : 0; };
  Cabeza.prototype.hablar = function (seg) { this.habla = seg ? this.t + seg : 0; if (!seg) this.bocaN = this.bocaBase; };
  Cabeza.prototype.letra = function (ch) { var v = visema(ch); this.bocaN = v || this.bocaBase; };
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
      if (this.bocaT <= 0) { this.bocaT = 0.085 + Math.random() * 0.06; this.bocaN = ['a', 'poco', 'e', 'o', 'poco', 'cerrada', 'e', 'a'][Math.floor(Math.random() * 8)]; }
    } else if (this.habla) { this.habla = 0; this.bocaN = this.bocaBase; }
  };
  /* Pinta la cabeza según el esqueleto y la cámara. */
  Cabeza.prototype.pintar = function (E, cam, lista) {
    var Bc = E.Bc, esc = cam.esc, o = cam.p(E.cab), X = cam.d(Bc[0]), Y = cam.d(Bc[1]), Z = cam.d(Bc[2]), yo = this, v = this.v, i;
    var ec = esc * K_CAB, ax = X[0] * ec, ay = X[1] * ec, bx = Y[0] * ec, by = Y[1] * ec, cx = Z[0] * ec, cy = Z[1] * ec;
    var k3 = [X[2], Y[2], Z[2]];                    /* hacia dónde está la cámara, vista desde la cabeza */
    var pr = function (q) { return [o[0] + ax * q[0] + bx * q[1] + cx * q[2], o[1] + ay * q[0] + by * q[1] + cy * q[2]]; };
    for (i = 0; i < this.anchos.length; i++) pon(this.anchos[i], 'stroke-width', n2(this.anchos[i]._k * esc));
    /* la silueta de un bulto desde aquí: lado 1, solo lo que es pelo; −1, solo lo que es piel */
    var silueta = function (P, el, lado) {
      var w = [k3[0] / el.r[0], k3[1] / el.r[1], k3[2] / el.r[2]], a = unidad(cruz(w, Math.abs(w[1]) < 0.9 * largo(w) ? [0, 1, 0] : [1, 0, 0])), b = unidad(cruz(w, a)), j, q;
      for (j = 0; j < N_SIL; j++) {
        q = [el.c[0] + el.r[0] * (a[0] * COS_S[j] + b[0] * SIN_S[j]), el.c[1] + el.r[1] * (a[1] * COS_S[j] + b[1] * SIN_S[j]), el.c[2] + el.r[2] * (a[2] * COS_S[j] + b[2] * SIN_S[j])];
        if (lado && lado * enPelo(q) < 0) continue;
        P.push(pr(q));
      }
    };
    /* de unos puntos de un bulto, los que miran a la cámara */
    var vistos = function (P, el, pts) {
      var w0 = k3[0] / el.r[0], w1 = k3[1] / el.r[1], w2 = k3[2] / el.r[2], j, q;
      for (j = 0; j < pts.length; j++) { q = pts[j]; if (q.s[0] * w0 + q.s[1] * w1 + q.s[2] * w2 > 0) P.push(pr(q.p)); }
    };
    var R = 11.6 * ec, lx = LUZ[0], ly = LUZ[1];
    /* ── la cabeza entera (pelo) y la piel que se ve ── */
    var Pc = []; silueta(Pc, MELENA, 1); silueta(Pc, CRANEO, -1); silueta(Pc, QUIJADA, 0); silueta(Pc, MENTON, 0);
    var Hc = envolvente(Pc), dc = poli(Hc);
    pon(this.cCab, 'd', dc); pon(this.pelo[0], 'd', dc);
    pon(this.pelo[1], 'd', poli(recorte(Hc, lx * R * 0.3, ly * R * 0.3))); pon(this.pelo[2], 'd', poli(recorte(Hc, lx * R * 1.5, ly * R * 1.5)));
    var Pp = []; silueta(Pp, CRANEO, -1); silueta(Pp, QUIJADA, -1); silueta(Pp, MENTON, -1); vistos(Pp, CRANEO, P_CRANEO); vistos(Pp, QUIJADA, P_QUIJADA); vistos(Pp, MENTON, P_MENTON); vistos(Pp, CRANEO, CORTE);
    var Hp = envolvente(Pp), dp = poli(Hp);
    pon(this.cPiel, 'd', dp); pon(this.piel[0], 'd', dp); pon(this.cCara, 'd', dp || 'M0,0');
    pon(this.piel[1], 'd', poli(recorte(Hp, lx * R * 0.15, ly * R * 0.15)));
    /* de frente, la piel va sobre el pelo (la frente recorta el flequillo); por detrás es al revés: el pelo que se ve
       (hasta la nuca) va sobre la piel. De perfil las dos cuentas dan lo mismo: la línea del pelo es una recta */
    if (k3[2] < 0) {
      var Ph = []; silueta(Ph, MELENA, 1); vistos(Ph, MELENA, P_MELENA); vistos(Ph, CRANEO, CORTE);
      var Hh = envolvente(Ph);
      pon(this.nuca[0], 'd', poli(Hh)); pon(this.nuca[1], 'd', poli(recorte(Hh, lx * R * 0.3, ly * R * 0.3))); pon(this.nuca[2], 'd', poli(recorte(Hh, lx * R * 1.5, ly * R * 1.5)));
    } else { pon(this.nuca[0], 'd', ''); pon(this.nuca[1], 'd', ''); pon(this.nuca[2], 'd', ''); }
    /* ── las orejas: la de este lado, encima; la otra, detrás ── */
    [0, 1].forEach(function (n) {
      var s = n ? 1 : -1, el = { c: [s * OREJA.c[0], OREJA.c[1], OREJA.c[2]], r: OREJA.r }, P = [], de = s * k3[0];
      silueta(P, el, 0);
      var d = poli(envolvente(P)), delante = de > 0.3;
      pon(yo.oreD[n], 'd', delante ? '' : d); pon(yo.oreA[n], 'd', delante ? d : '');
      /* por dentro, cuando se le ve de lado */
      pon(yo.oreI[n], 'd', de > 0.5 ? linea(camDe(pr), [[s * 12.05, 14.6, 0.6], [s * 12.1, 13.2, -0.9], [s * 12.05, 11.4, -0.3]]) : '');
    });
    /* ── la nariz ── */
    var Pn = []; silueta(Pn, NARIZ, 0);
    var Hn = envolvente(Pn), dn = poli(Hn), rn = 2.4 * ec;
    if (k3[2] > 0.05) { pon(this.narD, 'd', ''); pon(this.cNar, 'd', dn); pon(this.nar[0], 'd', dn); pon(this.nar[1], 'd', poli(recorte(Hn, lx * rn * 0.55, ly * rn * 0.55))); }
    else { pon(this.narD, 'd', dn); pon(this.cNar, 'd', ''); pon(this.nar[0], 'd', ''); pon(this.nar[1], 'd', ''); }
    /* ── el tupé: lo que cambia la velocidad de la cabeza (el tirón) lo ladea, lo echa atrás y lo estira ── */
    var dtp = this.dt, tl = [0, 0, 0];
    if (this.corte || !this.cAnt || quieto()) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.peloA.x = this.peloA.v = this.peloF.x = this.peloF.v = this.peloY.x = this.peloY.v = 0; this.corte = false; }
    else if (dtp > 0) {
      var mov = menos(E.cab, this.cAnt);
      if (largo(mov) > 22) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; }
      else { var vel = por(mov, 1 / dtp); this.vF = mezcla(this.vF, vel, 1 - Math.exp(-dtp / 0.04)); this.vS = mezcla(this.vS, vel, 1 - Math.exp(-dtp / 0.18)); }
      tl = aLocal(Bc, menos(this.vF, this.vS));
    }
    this.cAnt = E.cab;
    var pa = Math.sin(this.peloA.paso(entre(-0.12 * tl[0], -6, 6), dtp) * RAD), pf = Math.sin(this.peloF.paso(entre(-0.12 * tl[2], -6, 6), dtp) * RAD), py = 1 + this.peloY.paso(entre(-0.0015 * tl[1], -0.035, 0.045), dtp);
    var S = [['', '', ''], ['', '', '']], pcont = '';
    PUAS.forEach(function (q) {
      var L = q.L * py, ap = [q.b[0] + q.dir[0] * L + pa * q.L, q.b[1] + q.dir[1] * L, q.b[2] + q.dir[2] * L + pf * q.L], P = [pr(ap)], j;
      for (j = 0; j < q.aro.length; j++) P.push(pr(q.aro[j]));
      var H = envolvente(P), d = poli(H), vv = haciaLuz(pr(q.b), P[0]), rr = q.R * ec, T = S[q.n[0] * k3[0] + q.n[1] * k3[1] + q.n[2] * k3[2] > -0.05 ? 1 : 0];
      pcont += d; T[0] += d; T[1] += poli(recorte(H, vv[0] * rr * 0.55, vv[1] * rr * 0.55)); T[2] += poli(recorte(H, vv[0] * rr * 1.45, vv[1] * rr * 1.45));
    });
    pon(this.cPua, 'd', pcont);
    for (i = 0; i < 3; i++) { pon(this.puaD[i], 'd', S[0][i]); pon(this.pua[i], 'd', S[1][i]); }
    /* ── la cinta: el trozo del aro que queda de este lado ── */
    var N = CINTA.length, vis = [], j, ini = -1, n0 = 0;
    for (j = 0; j < N; j++) { vis[j] = CINTA[j].s[0] * k3[0] + CINTA[j].s[1] * k3[1] + CINTA[j].s[2] * k3[2] > -0.004; if (vis[j]) n0++; }
    for (j = 0; j < N; j++) if (vis[j] && !vis[(j + N - 1) % N]) { ini = j; break; }
    var dC = '', dL = '', q2, arr = [], aba = [];
    if (n0 === N) {
      for (j = 0; j < N; j++) { q2 = pr(CINTA[j].up); dC += (j ? 'L' : 'M') + n1(q2[0]) + ',' + n1(q2[1]); }
      dC += 'z';
      for (j = 0; j < N; j++) { q2 = pr(CINTA[j].lo); dC += (j ? 'L' : 'M') + n1(q2[0]) + ',' + n1(q2[1]); }
      dC += 'z';
    } else if (ini >= 0) {
      for (j = ini; vis[j % N] && j < ini + N; j++) { arr.push(pr(CINTA[j % N].up)); aba.push(pr(CINTA[j % N].lo)); q2 = pr(CINTA[j % N].luz); dL += (dL ? 'L' : 'M') + n1(q2[0]) + ',' + n1(q2[1]); }
      for (j = 0; j < arr.length; j++) dC += (j ? 'L' : 'M') + n1(arr[j][0]) + ',' + n1(arr[j][1]);
      for (j = aba.length - 1; j >= 0; j--) dC += 'L' + n1(aba[j][0]) + ',' + n1(aba[j][1]);
      dC += 'z';
    }
    pon(this.cinta, 'd', dC); pon(this.cintaL, 'd', dL);
    /* el nudo y sus colas, por detrás */
    if (k3[2] < 0.12) {
      var nu = pr(NUDO.p), rr2 = 1.45 * ec, dq = '';
      NUDO.colas.forEach(function (T) { T.forEach(function (q, n) { var w = pr(q); dq += (n ? 'L' : 'M') + n1(w[0]) + ',' + n1(w[1]); }); dq += 'z'; });
      pon(this.colas, 'd', dq); pon(this.nudo, 'd', elipse(nu[0], nu[1], rr2, rr2));
    } else { pon(this.colas, 'd', ''); pon(this.nudo, 'd', ''); }
    /* ── un rasgo pegado a la cara: se estrecha al girar y se esconde cuando su plano deja de mirar a la cámara ── */
    var calco = function (g, pl, min) {
      var w = pl.n[0] * k3[0] + pl.n[1] * k3[1] + pl.n[2] * k3[2];
      if (!(w > (min || 0.04))) { if (g._v !== 0) { g._v = 0; g.style.display = 'none'; } return 0; }
      if (g._v !== 1) { g._v = 1; g.style.display = ''; }
      var a = pr(pl.a), u = pl.u, vv = pl.v, K = U_CARA * (pl.k || 1);
      pon(g, 'transform', 'matrix(' + n4((ax * u[0] + bx * u[1] + cx * u[2]) * K) + ',' + n4((ay * u[0] + by * u[1] + cy * u[2]) * K) + ',' + n4(-(ax * vv[0] + bx * vv[1] + cx * vv[2]) * K) + ',' + n4(-(ay * vv[0] + by * vv[1] + cy * vv[2]) * K) + ',' + n1(a[0]) + ',' + n1(a[1]) + ')');
      return w;
    };
    var parp = this.parp, e = this.e, ojos = e.ojos || [1, 1], entorna = entre(v.bb, -0.5, 1.2), bbS = entorna.toFixed(2);
    /* los ojos miran un poco hacia la cámara cuando la cabeza está girada */
    var ir = 'translate(' + n2(entre(v.mx * 3.4 + k3[0] * 3.2, -4.6, 4.6)) + ',' + n2(entre(v.my * 2.8 - k3[1] * 2.2, -3.6, 3.6)) + ')';
    [0, 1].forEach(function (n) {
      var r = yo.ojo[n];
      if (!calco(r.g, PL.ojo[n])) return;
      var a2 = entre((n ? v.aD : v.aI) * (1 - parp), 0, 1.4), arcoO = ojos[n] < 0.2 ? (e.arco || 0) : -9, cl = a2.toFixed(2) + '|' + bbS + '|' + arcoO;
      if (r._c !== cl) {
        r._c = cl;
        var F = ojoFormas(a2, entorna, arcoO, n ? 1 : -1);
        r.blanco.setAttribute('d', F.hueco); r.hueco.setAttribute('d', F.hueco); r.sombra.setAttribute('d', F.sombra); r.parpado.setAttribute('d', F.parpado); r.bajo.setAttribute('d', F.bajo); r.pliegue.setAttribute('d', F.pliegue);
      }
      pon(r.iris, 'transform', ir);
      /* la ceja no crece con el ojo: se queda con su tamaño y en su sitio */
      pon(r.ceja, 'transform', 'scale(' + n4(1 / PL.ojo[n].k) + ') ' + (n ? 'translate(0,' + n2(-v.cDy - 1.5) + ') rotate(' + n2(v.cDr) + ' 1 -30)' : 'translate(0,' + n2(-v.cIy - 1.5) + ') rotate(' + n2(v.cIr) + ' -1 -30)'));
    });
    var ru = n2(v.rubor);
    [0, 1].forEach(function (n) { if (calco(yo.rubor[n], PL.rubor[n], 0.1)) pon(yo.rubor[n], 'opacity', ru); });
    /* la boca, en sus dos mitades */
    var b2 = BOCAS[this.bocaN] || BOCAS.sonrisa;
    if (this._boca !== b2) { this._boca = b2; this.bocaClip.setAttribute('d', b2.f || 'M0,0'); }
    [0, 1].forEach(function (n) {
      var r = yo.boca[n];
      if (!calco(r.g, PL.boca[n], 0.02)) return;
      if (r._b !== b2) { r._b = b2; r.f.setAttribute('d', b2.f); r.d.setAttribute('d', b2.d); r.l.setAttribute('d', b2.l); r.r.setAttribute('d', b2.r || ''); r.lengua.style.display = b2.f && !b2.r ? '' : 'none'; }
    });
    /* ── las gafas: el plano de los cristales, el canto de la montura cuando se ve de lado y las patillas ── */
    calco(this.gafas, PL.gafas, 0.07);
    /* visto desde arriba con la cara hacia el suelo (una flexión, una plancha), de las gafas solo asomaría una patilla
       suelta junto al pelo: ahí se van apagando; con la cara a la vista, o por detrás a su altura, se quedan */
    var dCanto = '', opPat = n2(Math.max(entre(k3[2] / 0.1, 0, 1), entre((0.7 - k3[1]) / 0.16, 0, 1)));
    [0, 1].forEach(function (n) {
      var s = n ? 1 : -1, de = s * k3[0], pat = linea(camDe(pr), (k3[2] < -0.3 ? [] : [[s * 10.55, 16.9, 11.7]]).concat([[s * 11.25, 16.7, 5], [s * 11.2, 16.3, 0.6], [s * 10.6, 14.1, -1.3]]));
      pon(yo.patA[n], 'd', de > -0.08 ? pat : ''); pon(yo.patD[n], 'd', de > -0.08 || k3[2] < 0.1 ? '' : pat);
      pon(yo.patA[n], 'opacity', opPat); pon(yo.patD[n], 'opacity', opPat);
      if (de > 0.22 && k3[2] > -0.35) dCanto += linea(camDe(pr), [[s * 10.55, 19.4, 11.7], [s * 10.55, 12.1, 11.7]]);
    });
    pon(this.canto, 'd', dCanto); pon(this.canto, 'opacity', opPat);
    /* ── el sudor ── */
    var su = entre(v.sudor, 0, 1) * (0.55 + 0.45 * Math.sin(this.t * 3.1)), cae = n1((this.t * 9) % 14);
    [0, 1].forEach(function (n) {
      var q = yo.gota[n];
      if (su < 0.02) { if (q._v !== 0) { q._v = 0; q.style.display = 'none'; } return; }
      if (calco(q, PL.gota[n], 0.15)) { pon(q, 'opacity', n2(su)); pon(q.firstChild, 'transform', 'translate(0,' + cae + ')'); }
    });
    lista.push({ z: cam.p(mas(E.cab, aplicar(Bc, [0, 13, 0])))[2] + 3, el: this.g });
  };
  /* para trazar una línea por puntos de la cabeza con la misma «linea» del cuerpo: una cámara de pega que ya proyecta */
  function camDe(pr) { return { p: pr }; }

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
    var o = cam.p([cam.mira[0], 0, cam.mira[2]]), R = 118 * cam.esc, ryT = Math.max(6, R * Math.sin(cam.picado * RAD));
    pon(this.tarima, 'cx', n1(o[0])); pon(this.tarima, 'cy', n1(o[1])); pon(this.tarima, 'rx', n1(R)); pon(this.tarima, 'ry', n1(ryT));
    /* el horizonte: cuanto más desde arriba se mira, más suelo se ve (y la tarima nunca se sale del suelo) */
    var hor = Math.round(Math.min(o[1] - 46 - 20 * cam.esc, o[1] - ryT * 1.1 - 8));
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
  /* un prisma: un perfil convexo, dicho de delante atrás ([z, y], en el marco B), que se estira a lo ancho. Se pintan las caras que
     miran a la cámara y la tapa de ese lado. colores: uno por arista del perfil (la cara que sale de ella); tapa: el de las dos tapas */
  function Prisma(n, colores, tapa) {
    this.g = crear('g'); this.col = colores; this.tapa = tapa; this.caras = [];
    for (var i = 0; i <= n; i++) this.caras.push(crear('path', { 'stroke-linejoin': 'round', 'stroke-width': 0.8 }, this.g));
  }
  Prisma.prototype.pon = function (cam, c3, B, perfil, ancho, lista, sesgo) {
    var n = perfil.length, h = ancho / 2, yo = this, k = 0, zmin = 1e9, i, cz = 0, cy = 0;
    var v = function (q, s) { return cam.p(mas(c3, aplicar(B, [s * h, q[1], q[0]]))); };
    var pinta = function (pts, color) {
      var d = '', el = yo.caras[k++];
      pts.forEach(function (p, j) { zmin = Math.min(zmin, p[2]); d += (j ? 'L' : 'M') + n1(p[0]) + ',' + n1(p[1]); });
      pon(el, 'd', d + 'z'); pon(el, 'fill', color); pon(el, 'stroke', color); el.style.display = '';
    };
    perfil.forEach(function (q) { cz += q[0] / n; cy += q[1] / n; });
    for (i = 0; i < n; i++) {
      /* la normal de la arista, hacia fuera del perfil */
      var a = perfil[i], b = perfil[(i + 1) % n], nz = b[1] - a[1], ny = a[0] - b[0], l = Math.sqrt(nz * nz + ny * ny) || 1;
      if (nz * ((a[0] + b[0]) / 2 - cz) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nz = -nz; ny = -ny; }
      if (punto(aplicar(B, [0, ny / l, nz / l]), cam.k) > 0.02) pinta([v(a, -1), v(b, -1), v(b, 1), v(a, 1)], this.col[i]);
    }
    var lado = punto(B[0], cam.k);
    if (Math.abs(lado) > 0.02) pinta(perfil.map(function (q) { return v(q, lado > 0 ? 1 : -1); }), this.tapa);
    for (; k < this.caras.length; k++) this.caras[k].style.display = 'none';
    if (lista) lista.push({ z: zmin + (sesgo || 0), el: this.g });
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

  /* Una pieza maciza y convexa (el cojín del predicador, el respaldo de un banco) que tapa de verdad. caras: [[normal hacia fuera, un
     punto de la cara], …]. Lo que queda entero del lado de fuera de una de sus caras va por delante de la pieza si la cámara ve esa
     cara, y por detrás si no la ve. El tronco no se puede mover de sitio en la lista (no dice dónde está), así que es la pieza la que
     se coloca respecto de él; y los brazos y las piernas, respecto de la pieza. it: la pieza, tal como entró en la lista */
  function taparConCaras(E, cam, lista, it, caras) {
    var e = 1.5, i;
    /* 1: por delante; −1: por detrás; 0: no se sabe (la atraviesa) */
    var lado = function (pts) {
      var r = 0, j, q, m;
      for (j = 0; j < caras.length; j++) {
        m = 1e9;
        for (q = 0; q < pts.length; q++) m = Math.min(m, punto(caras[j][0], menos(pts[q], caras[j][1])));
        if (m < -e) continue;
        if (punto(caras[j][0], cam.k) > 0.02) return 1;
        r = -1;
      }
      return r;
    };
    var zTor = cam.p(mas(E.tor, aplicar(E.Bt, [0, 11, 0])))[2] + 0.4, zPel = cam.p(E.pel)[2];
    var t = lado([E.pel, E.lum, E.tor, mas(E.tor, aplicar(E.Bt, [0, D.hombroY, 0]))]);
    if (t > 0) it.z = Math.min(zTor, zPel) - 0.7; else if (t < 0) it.z = Math.max(zTor, zPel) + 0.7;
    for (i = 0; i < lista.length; i++) {
      var p = lista[i];
      if (!p.pts || p === it) continue;
      var s = lado(p.pts);
      if (s > 0) { if (p.z <= it.z + 0.2) p.z = it.z + 0.5 + p.z / 10000; }
      else if (s < 0) { if (p.z >= it.z - 0.2) p.z = it.z - 0.4 + p.z / 10000; }
    }
  }

  var MATERIAL = {};
  var N_MAT = 0;
  /* ¿espera en su sitio (o.reposo), porque todavía nadie lo ha cogido? Lo dice la coreografía («reposo»: en qué posturas); si el
     material trae su propia lista (reposoEn), manda esa: así dos cosas se cogen en momentos distintos */
  function enReposo(o, ctx) { return !!(o.reposo && ctx && (o.reposoEn ? ctx.enLista && ctx.enLista(o.reposoEn) : ctx.reposo)); }
  /* ── la barra: sigue a las manos, o va pegada al cuerpo (a la espalda, a la cadera), o en un punto del mundo.
     o: { ancla: 'manos' | 'torax' | 'pelvis' | 'mundo', en: [x, y, z], eje: [x, y, z], largo, discos (radio; 0, sin discos), una: 'i' | 'd' (la
     lleva una sola mano, por el centro), z: true (la barra Z) }
     La barra Z es corta (120) y su centro hace una W: dos rampas a cada lado, que es donde se agarra, con la muñeca a medio girar. Las
     de fuera (las manos a 45 cm) y las de dentro (a 19: «por la parte más interior») suben hacia lados contrarios, así que con el
     agarre estrecho la W queda al revés. Su plano lo dan las manos (hacia dónde sube el extremo de fuera de cada puño); mientras
     espera (reposo), o.w y o.estrecho */
  var Z_W = [3, 16, 29], Z_S = 3, Z_ANCHO = 22.5, Z_ESTRECHO = 9.5;      /* la W: dónde están el pico, el valle y el arranque del manguito; su media altura; y el centro de cada rampa */
  MATERIAL.barra = function (esc, o) {
    o = o || {};
    this.o = o; this.L = o.largo || (o.z ? 120 : 200); this.R = o.discos == null ? (o.z ? 13 : 21) : o.discos;
    if (o.z) { this.gz = crear('g'); this.za = trazo('', M_COL.cromo); this.zb = trazo('', 'rgba(255,255,255,.35)'); this.gz.appendChild(this.za); this.gz.appendChild(this.zb); this.w = unidad(o.w || [0, 0, 1]); this.zs = o.estrecho ? -1 : 1; }
    this.barra = new Cilindro(M_COL.cromo); this.manguitos = [new Cilindro(M_COL.cromoS), new Cilindro(M_COL.cromoS)];
    this.discos = this.R ? [new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo)] : [];
    this.c = [0, 100, 30]; this.eje = [1, 0, 0];
    this.antes = (o.ancla || 'manos') !== 'manos';
  };
  MATERIAL.barra.prototype.colocar = function (E, ctx) {
    var o = this.o, a = o.ancla || 'manos';
    if (enReposo(o, ctx)) { this.c = o.reposo; this.eje = [1, 0, 0]; }
    else if (a === 'manos') {
      this.c = mezcla(E.i.agarre, E.d.agarre, 0.5);
      var e = menos(E.i.agarre, E.d.agarre);
      this.eje = largo(e) > 4 ? unidad(e) : E.Bt[0];
      if (o.una) { this.c = E[o.una].agarre; this.eje = E[o.una].mano.eje; }
    } else if (a === 'torax') { this.c = mas(E.tor, aplicar(E.Bt, o.en)); this.eje = aplicar(E.Bt, o.eje || [1, 0, 0]); }
    else if (a === 'pelvis') { this.c = mas(E.pel, aplicar(E.Bp, o.en)); this.eje = aplicar(E.Bp, o.eje || [1, 0, 0]); }
    else { this.c = o.en; this.eje = unidad(o.eje || [1, 0, 0]); }
    if (o.z) {
      var w0 = o.w || [0, 0, 1], ez = this.eje;
      if (a === 'manos' && !enReposo(o, ctx)) {
        var ui = E.i.mano.eje, ud = E.d.mano.eje;
        if (punto(ui, ez) < 0) ui = por(ui, -1);
        if (punto(ud, ez) > 0) ud = por(ud, -1);
        w0 = mas(sinParte(ui, ez), sinParte(ud, ez));
        if (largo(w0) < 0.12) w0 = this.w;
        this.zs = largo(menos(E.i.agarre, E.d.agarre)) < Z_ANCHO + Z_ESTRECHO ? -1 : 1;
      } else this.zs = o.estrecho ? -1 : 1;
      this.w = unidad(sinParte(w0, ez), this.w);
    }
  };
  /* dónde se agarra: a x centímetros del centro, hacia la izquierda de Jérôme (+) o hacia su derecha (−) */
  MATERIAL.barra.prototype.agarre = function (x) { return mas(this.c, por(this.eje, x)); };
  MATERIAL.barra.prototype.extremos = function () {
    var h = this.L / 2, R = this.R || 2, c = this.c, e = this.eje, r = [];
    [1, -1].forEach(function (s) { var p = mas(c, por(e, s * h)); r.push(mas(p, [0, R, 0]), mas(p, [0, -R, 0]), mas(p, [0, 0, R]), mas(p, [0, 0, -R]), mas(p, [R, 0, 0]), mas(p, [-R, 0, 0])); });
    return r;
  };
  MATERIAL.barra.prototype.pintar = function (E, cam, lista) {
    var h = this.L / 2, c = this.c, e = this.eje, yo = this, sg = this.o.sesgo || 0, mg = 36;
    if (this.o.z) {
      /* la W, de un trazo: los manguitos quedan a la altura de los picos */
      var w = this.w, s0 = this.zs * Z_S, d = '', d2 = '', zm = 0, an = 3 * cam.esc;
      var P2 = [[-h, s0], [-Z_W[2], s0], [-Z_W[1], -s0], [-Z_W[0], s0], [Z_W[0], s0], [Z_W[1], -s0], [Z_W[2], s0], [h, s0]].map(function (q) { return cam.p(mas(c, mas(por(e, q[0]), por(w, q[1])))); });
      var dx = P2[7][0] - P2[0][0], dy = P2[7][1] - P2[0][1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
      if (ny > 0) { nx = -nx; ny = -ny; }
      P2.forEach(function (p, i) { zm += p[2] / 8; d += (i ? 'L' : 'M') + n1(p[0]) + ',' + n1(p[1]); d2 += (i ? 'L' : 'M') + n1(p[0] + nx * an * 0.22) + ',' + n1(p[1] + ny * an * 0.22); });
      pon(this.za, 'd', d); pon(this.za, 'stroke-width', n1(an)); pon(this.zb, 'd', d2); pon(this.zb, 'stroke-width', n1(Math.max(0.6, an * 0.22)));
      lista.push({ z: zm + 2.2 + sg, el: this.gz });
      c = mas(c, por(w, s0)); mg = 26;
    } else this.barra.pon(cam, mas(c, por(e, -h)), mas(c, por(e, h)), 1.5, lista, 2.2 + sg);
    [1, -1].forEach(function (s, i) {
      if (!yo.R) return;
      yo.manguitos[i].pon(cam, mas(c, por(e, s * (h - mg))), mas(c, por(e, s * h)), 2.4, lista, 2.3 + sg);
      yo.discos[i].pon(cam, mas(c, por(e, s * (h - mg + 6))), e, yo.R, 4.4, lista, sg);
      yo.discos[i + 2].pon(cam, mas(c, por(e, s * (h - mg + 11.4))), e, yo.R * 0.8, 3.4, lista, sg + (s * punto(e, cam.k) > 0 ? 0.6 : -0.6));
    });
  };
  /* ── las mancuernas: una en cada mano (o en una sola), con el eje del agarre. reposo: { i: [x, y, z], d: […] }, dónde espera cada una
     mientras nadie la ha cogido (ejeReposo: a lo largo de qué; de delante atrás, si no se dice). Con lado: 'i' y otra: 'd' (y
     reposo: {}), mientras espera la lleva la otra mano: se la pasa de una a otra. Con dos: true, una sola entre las dos manos: a lo
     largo de la mano izquierda, de ejeDos (en el marco del tórax) o, con medio: true, de la media de las dos manos (queda derecha
     aunque los antebrazos lleguen en cuña); corre: cuántos cm se corre a lo largo de su eje (las manos, bajo un disco y no en el centro);
     une: true, si las manos se separan se queda con la de «lado» (la otra la suelta un momento y vuelve a cogerla).
     extremo: true (o [a cuánto de la muñeca, cuánto hacia la palma]): no se coge por el asa sino por un extremo; la mano, en garra sobre
     el disco de arriba (su centro queda donde llegan las yemas), y la mancuerna cuelga a plomo de ella.
     toalla: true, una toalla en el asa, que la engorda: mientras espera, monta abierta sobre el asa y cae a los dos lados hasta el suelo; se
     enrolla cuando la mano que llega a ella se cierra, y enrollada sigue, con una punta colgando ── */
  var TOALLA = ['#f4f1ea', '#e2ddd0', '#cfc8b6'];
  MATERIAL.mancuernas = function (esc, o) {
    o = o || {};
    this.o = o; this.lados = o.lado ? [o.lado] : ['i', 'd'];
    this.p = {};
    this.lados.forEach(function (k) {
      this.p[k] = { m: new Cilindro(M_COL.cromo), a: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL), b: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL) };
      if (o.toalla) {
        var q = this.p[k]; q.t = new Cilindro(TOALLA[0], 'rgba(255,255,255,.55)'); q.gt = crear('g');
        q.pt = [TOALLA[0], TOALLA[1]].map(function (c) { return crear('path', { fill: c, stroke: TOALLA[2], 'stroke-width': 0.7, 'stroke-linejoin': 'round' }, q.gt); });
        q.fl = trazo('', TOALLA[1]); q.gt.appendChild(q.fl);
      }
    }, this);
  };
  MATERIAL.mancuernas.prototype.colocar = function (E, ctx) { this.suelta = enReposo(this.o, ctx); };
  MATERIAL.mancuernas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, R = o.radio || 6.6, suelta = this.suelta;
    this.lados.forEach(function (k) {
      var L = E[k], c = L.agarre, e = o.vertical ? L.mano.dir : L.mano.eje, p = this.p[k];
      if (o.dos) {
        c = mezcla(E.i.agarre, E.d.agarre, 0.5); e = o.ejeDos ? aplicar(E.Bt, o.ejeDos) : o.medio ? unidad(mas(E.i.mano.dir, E.d.mano.dir), L.mano.dir) : L.mano.dir;
        if (o.une) { var su = entre((largo(menos(E.i.agarre, E.d.agarre)) - 11) / 16, 0, 1); c = mezcla(c, L.agarre, su * su * (3 - 2 * su)); }
        if (o.corre) c = mas(c, por(e, o.corre));
      }
      if (o.extremo) { var ex = o.extremo.length ? o.extremo : [13, 1]; e = [0, -1, 0]; c = mas(mas(L.mun, mas(por(L.mano.dir, ex[0]), por(L.mano.palma, ex[1]))), por(e, 10.5)); }
      if (suelta && o.otra) { c = E[o.otra].agarre; e = E[o.otra].mano.eje; }
      else if (suelta && o.reposo[k]) { c = o.reposo[k]; e = unidad(o.ejeReposo || [0, 0, 1]); }
      p.m.pon(cam, mas(c, por(e, -9)), mas(c, por(e, 9)), 1.4, lista, 0.9);
      p.a.pon(cam, mas(c, por(e, 10.5)), e, R, 5.4, lista, 0.4); p.b.pon(cam, mas(c, por(e, -10.5)), e, R, 5.4, lista, 0.4);
      if (p.t) {
        /* cuánto está enrollada: del todo si ya la llevan; si espera, lo que se haya cerrado la mano que tiene encima */
        var w = 1, sm = function (x) { x = entre(x, 0, 1); return x * x * (3 - 2 * x); };
        if (suelta) w = largo(menos(L.agarre, c)) < 9 ? sm((E.S.m[k].c - 0.1) / 0.8) : 0;
        var rollo = sm((w - 0.3) / 0.7), abierta = w < 0.98, zt = 0, nz = 0;
        p.t.g.style.display = rollo > 0.02 ? '' : 'none';
        if (rollo > 0.02) p.t.pon(cam, mas(c, por(e, -7.8)), mas(c, por(e, 7.8)), 1.5 + 2.1 * rollo, lista, 1.0);
        p.pt[0].style.display = p.pt[1].style.display = abierta ? '' : 'none'; p.fl.style.display = abierta ? 'none' : '';
        if (abierta) {
          /* abierta: una tira que monta sobre el asa y cae a los dos lados hasta el suelo, donde descansan sus puntas; al enrollarse, se recoge */
          var lado = unidad(cruz(e, [0, 1, 0]), [1, 0, 0]), xf = 8.5 * (1 - w) + 3 * w, cae = (c[1] - 0.5) * (1 - w) + 2.2 * w;
          if (punto(menos(E.pel, c), lado) > 0) lado = por(lado, -1);         /* hacia fuera de quien las va a coger: por ahí cae la punta larga */
          [1, -1].forEach(function (sl, j) {
            var d = '', xo = (sl > 0 ? 25 : 13) * (1 - w) + 3 * w;
            [[-7.4, xo, -cae], [-7.4, xf, -cae], [-7.4, 0, 1.9], [7.4, 0, 1.9], [7.4, xf, -cae], [7.4, xo, -cae]].forEach(function (q3, n) {
              var q2 = cam.p(mas(c, mas(por(e, q3[0]), mas(por(lado, sl * q3[1]), [0, q3[2], 0])))); zt += q2[2]; nz++; d += (n ? 'L' : 'M') + n1(q2[0]) + ',' + n1(q2[1]);
            });
            pon(p.pt[j], 'd', d + 'z');
          });
          lista.push({ z: zt / nz + 1.2, el: p.gt });
        } else {
          /* enrollada: una punta cuelga del rollo, junto a un disco */
          var f1 = mas(c, mas(por(e, 5.2), [0, -3, 0])), f2 = mas(f1, [0, -Math.min(6.5, Math.max(0.5, f1[1] - 2.4)), 0]), g1 = cam.p(f1), g2 = cam.p(f2);
          ponLinea(p.fl, g1, g2, 4.6 * cam.esc);
          lista.push({ z: (g1[2] + g2[2]) / 2 + 1.1, el: p.gt });
        }
      }
    }, this);
  };
  /* ── la pesa rusa: cuelga de la mano (o de las dos). cuelga: true, a plomo de su asa, que va en la palma: en un curl, con la mano
     ya arriba, la bola queda por fuera del antebrazo (del lado del dorso de la mano) ── */
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
    if (o.cuelga) {
      var md = o.lado ? E[o.lado].mano.dir : unidad(mas(E.i.mano.dir, E.d.mano.dir)), mp = o.lado ? E[o.lado].mano.palma : unidad(mas(E.i.mano.palma, E.d.mano.palma));
      dir = unidad(mas([0, -1, 0], por(mp, -0.55 * Math.max(0, md[1]))));
    }
    var b3 = mas(c, por(dir, 13.5)), b = cam.p(b3), a = cam.p(c), r = 9.2 * cam.esc;
    var px = -(b[1] - a[1]), py = b[0] - a[0], l = Math.sqrt(px * px + py * py) || 1; px = px / l * r * 0.62; py = py / l * r * 0.62;
    pon(this.asa, 'd', 'M' + n1(b[0] + px) + ',' + n1(b[1] + py) + ' Q' + n1(a[0] + px * 1.5) + ',' + n1(a[1] + py * 1.5) + ' ' + n1(a[0]) + ',' + n1(a[1]) + ' Q' + n1(a[0] - px * 1.5) + ',' + n1(a[1] - py * 1.5) + ' ' + n1(b[0] - px) + ',' + n1(b[1] - py));
    pon(this.asa, 'stroke-width', n1(2.6 * cam.esc));
    this.bola.pon(cam, b3, 9.2, lista, 0.6);
  };
  /* ── el banco: el asiento y, si se pide, el respaldo inclinado. o: { en: [x, z], rumbo, largo, alto, ancho, respaldo: grados, asiento: largo del asiento,
     tapa: true (el respaldo tapa de verdad lo que tiene detrás: para quien se pone de pie al otro lado) }
     El respaldo sale del asiento hacia +Z (con rumbo 180, hacia −Z: así se tumba Jérôme, que mira a +Z, con la cabeza hacia −Z).
     respaldo: 45, inclinado; 85, casi vertical (una silla); negativo, declinado (la cabeza más baja que la cadera) ── */
  MATERIAL.banco = function (esc, o) {
    o = o || {};
    this.o = o;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = [M_COL.hierroL, M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.asiento = new Caja(tap); this.resp = o.respaldo != null ? new Caja(tap) : null;
    this.patas = [new Caja(hie), new Caja(hie)]; this.puntal = new Cilindro(M_COL.hierro); this.pies = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.riel = this.resp ? new Cilindro(M_COL.hierroS) : null;
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
      if (o.tapa) {
        /* de pie detrás de un banco inclinado, con un brazo por encima: el respaldo tapa lo que le queda detrás */
        var cr = mas(bis, aplicar(Br, [0, 0, lr / 2])), hh = [ancho / 2, gr / 2, lr / 2], caras = [];
        [0, 1, 2].forEach(function (j) { [1, -1].forEach(function (s) { caras.push([por(Br[j], s), mas(cr, por(Br[j], s * hh[j]))]); }); });
        taparConCaras(E, cam, lista, lista[lista.length - 1], caras);
      }
      /* el puntal que sostiene el respaldo */
      this.puntal.pon(cam, al(0, 3, -lar / 2 + la + lr * 0.5), mas(bis, aplicar(Br, [0, -gr / 2, lr * 0.62])), 2.6, lista, sg - 3);
    } else this.asiento.pon(cam, al(0, alto - gr / 2, 0), B, [ancho, gr, lar], lista, sg, 'fondo');
    /* las patas: la de delante, bajo el asiento. La del fondo: en un banco plano, bajo el otro extremo; con el respaldo
       levantado, un taco al pie del puntal (suelta detrás del respaldo parecía un poste); declinado, hasta donde baja el respaldo */
    var zf = lar / 2 - 16, hp = alto - gr;
    if (this.resp && o.respaldo > 0) { zf = -lar / 2 + (o.asiento || 38) + (lar - (o.asiento || 38)) * 0.5; hp = 7; }
    else if (this.resp) hp = Math.max(6, alto - gr / 2 + Math.tan(o.respaldo * RAD) * (lar - (o.asiento || 38) - 16) - gr * 0.6);
    this.patas[0].pon(cam, al(0, (alto - gr) / 2, -lar / 2 + 14), B, [ancho * 0.5, alto - gr, 5], lista, sg - 2, 'fondo');
    this.patas[1].pon(cam, al(0, hp / 2, zf), B, [ancho * 0.5, hp, 5], lista, sg - 2, 'fondo');
    this.pies[0].pon(cam, al(-ancho * 0.62, 1.6, -lar / 2 + 14), al(ancho * 0.62, 1.6, -lar / 2 + 14), 2, lista, sg - 3);
    this.pies[1].pon(cam, al(-ancho * 0.62, 1.6, zf), al(ancho * 0.62, 1.6, zf), 2, lista, sg - 3);
    if (this.riel) this.riel.pon(cam, al(0, 2, -lar / 2 + 14), al(0, 2, zf), 1.7, lista, sg - 4);
  };
  MATERIAL.banco.prototype.extremos = function () {
    var o = this.o, B = giroY(o.rumbo || 0), c = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], w = (o.ancho || 28) / 2, l = (o.largo || 120) / 2, h = o.alto || 44, r = [];
    [[-w, -l], [w, -l], [w, l], [-w, l]].forEach(function (q) { r.push(mas(c, aplicar(B, [q[0], 0, q[1]])), mas(c, aplicar(B, [q[0], h, q[1]]))); });
    if (o.respaldo != null) { var la = o.asiento || 38, lr = (o.largo || 120) - la; r.push(mas(c, aplicar(B, [0, h + Math.sin(o.respaldo * RAD) * lr, -l + la + Math.cos(o.respaldo * RAD) * lr]))); }
    return r;
  };
  /* dónde queda la superficie del banco (para tumbarse o sentarse): un punto a z del centro, y el respaldo */
  MATERIAL.banco.prototype.alto = function () { return this.o.alto || 44; };
  /* ── el banco predicador (Scott): un cojín con dos caras —la inclinada, donde descansan los brazos, y la vertical, donde va el pecho—
     sobre su poste, con su asiento detrás. Quien se sienta mira hacia +Z (rumbo 0): el cojín baja alejándose de él.
     o: { en: [x, z] (el canto de arriba del cojín, por el lado del pecho), rumbo, alto (el de ese canto: 89), ang (cuánto baja la cara
     inclinada: 45), largo (el de esa cara: 40), ancho (62), asiento: [a cuánto del canto, alto] (false: sin asiento), ganchos: [y, z]
     (los dos soportes donde espera la barra, por delante del cojín: el centro de la barra, en el marco del banco), sep (a cuánto del
     centro va cada soporte: 33) } ── */
  MATERIAL.predicador = function (esc, o) {
    o = o || {}; this.o = o;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = ['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.cojin = new Prisma(5, [M_COL.tapizL, M_COL.tapizL, M_COL.tapizS, M_COL.tapizS, M_COL.tapizS], M_COL.tapiz);
    this.poste = new Caja(hie); this.viga = new Cilindro(M_COL.hierro); this.pies = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.sillin = o.asiento === false ? null : new Caja(tap); this.patSillin = this.sillin ? new Caja(hie) : null;
    this.ganchos = [];
    if (o.ganchos) for (var i = 0; i < 6; i++) this.ganchos.push(new Cilindro(i % 3 ? M_COL.hierroL : M_COL.hierro));
    this.antes = true;
  };
  MATERIAL.predicador.prototype.colocar = function () {};
  MATERIAL.predicador.prototype.al = function (x, y, z) { var o = this.o; return mas([o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], aplicar(giroY(o.rumbo || 0), [x, y, z])); };
  /* el perfil del cojín ([z, y], desde el canto): el canto, la cara inclinada, su extremo bajo, la de debajo y la vertical */
  MATERIAL.predicador.prototype.perfil = function () {
    var o = this.o, a = (o.ang == null ? 45 : o.ang) * RAD, L = o.largo || 40, gr = 9, c = Math.cos(a), s = Math.sin(a);
    var C = [3 + L * c, -L * s], Dd = [C[0] - gr * s, C[1] - gr * c];
    return [[0, 0], [3, 0], C, Dd, [0, Dd[1] + Dd[0] * s / c]];
  };
  MATERIAL.predicador.prototype.asientoEn = function () { var o = this.o; return o.asiento === false ? null : (o.asiento || [22, 50]); };
  MATERIAL.predicador.prototype.extremos = function () {
    var o = this.o, H = o.alto || 89, w = (o.ancho || 62) / 2, P = this.perfil(), as = this.asientoEn(), r = [], yo = this;
    P.forEach(function (q) { r.push(yo.al(-w, H + q[1], q[0]), yo.al(w, H + q[1], q[0])); });
    r.push(this.al(-22, 0, P[2][0] * 0.5), this.al(22, 0, P[2][0] * 0.5));
    if (as) r.push(this.al(-17, as[1], -as[0] - 15), this.al(17, as[1], -as[0] - 15), this.al(-20, 0, -as[0]), this.al(20, 0, -as[0]));
    if (o.ganchos) { var sp = o.sep || 33; r.push(this.al(-sp, o.ganchos[0] + 4, o.ganchos[1] + 4), this.al(sp, o.ganchos[0] + 4, o.ganchos[1] + 4), this.al(-sp, 0, o.ganchos[1]), this.al(sp, 0, o.ganchos[1])); }
    return r;
  };
  /* el cojín tapa de verdad (taparConCaras): de frente quedaba pintado detrás de quien se sienta, como un respaldo */
  MATERIAL.predicador.prototype.tapar = function (E, cam, lista, it, P, H, w, B) {
    var n = P.length, caras = [], i, cz = 0, cy = 0;
    P.forEach(function (q) { cz += q[0] / n; cy += q[1] / n; });
    for (i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], nz = b[1] - a[1], ny = a[0] - b[0], l = Math.sqrt(nz * nz + ny * ny) || 1;
      if (nz * ((a[0] + b[0]) / 2 - cz) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nz = -nz; ny = -ny; }
      caras.push([aplicar(B, [0, ny / l, nz / l]), this.al(0, H + a[1], a[0])]);
    }
    caras.push([B[0], this.al(w, H, 0)], [por(B[0], -1), this.al(-w, H, 0)]);
    taparConCaras(E, cam, lista, it, caras);
  };
  MATERIAL.predicador.prototype.pintar = function (E, cam, lista) {
    var o = this.o, B = giroY(o.rumbo || 0), H = o.alto || 89, ancho = o.ancho || 62, P = this.perfil(), as = this.asientoEn(), sg = o.sesgo == null ? -14 : o.sesgo, yo = this;
    this.cojin.pon(cam, this.al(0, H, 0), B, P, ancho, lista, sg);
    this.tapar(E, cam, lista, lista[lista.length - 1], P, H, ancho / 2, B);
    /* el poste, bajo el centro de la cara de debajo; la viga del suelo, del asiento a los ganchos (o al poste), y los pies */
    var zp = (P[3][0] + P[4][0]) / 2, yp = H + (P[3][1] + P[4][1]) / 2 + 2, z0 = as ? -as[0] : zp - 20, z1 = o.ganchos ? o.ganchos[1] - 3.2 : zp + 16;
    this.poste.pon(cam, this.al(0, yp / 2, zp), B, [7, yp, 7], lista, sg - 2, 'fondo');
    this.viga.pon(cam, this.al(0, 2, z0), this.al(0, 2, z1), 2, lista, sg - 4);
    this.pies[0].pon(cam, this.al(-20, 1.6, z0), this.al(20, 1.6, z0), 2, lista, sg - 3);
    this.pies[1].pon(cam, this.al(-(o.ganchos ? (o.sep || 33) + 4 : 22), 1.6, z1), this.al(o.ganchos ? (o.sep || 33) + 4 : 22, 1.6, z1), 2, lista, sg - 3);
    if (this.sillin) {
      this.sillin.pon(cam, this.al(0, as[1] - 3, -as[0]), B, [32, 6, 28], lista, sg, 'fondo');
      this.patSillin.pon(cam, this.al(0, (as[1] - 6) / 2, -as[0]), B, [7, as[1] - 6, 7], lista, sg - 2, 'fondo');
    }
    /* los ganchos: el poste, la cuna y su uña */
    if (o.ganchos) [1, -1].forEach(function (s, i) {
      var x = s * (o.sep || 33), y = o.ganchos[0], z = o.ganchos[1];
      yo.ganchos[i * 3].pon(cam, yo.al(x, 2, z - 3.2), yo.al(x, y + 3, z - 3.2), 1.7, lista, sg - 1);
      yo.ganchos[i * 3 + 1].pon(cam, yo.al(x, y - 2.7, z - 3.2), yo.al(x, y - 2.7, z + 3.6), 1.2, lista, sg - 1);
      yo.ganchos[i * 3 + 2].pon(cam, yo.al(x, y - 2.7, z + 3.6), yo.al(x, y + 1.4, z + 3.6), 1.2, lista, sg - 1);
    });
  };
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
      yo.ganchos[i].pon(cam, [s * w, h - 2.5, z], [s * w, h - 2.5, z + (o.haciaAtras ? -7 : 7)], 1.6, lista, sg + 0.5);
      yo.bases[i].pon(cam, [s * w, 1.5, z - 22], [s * w, 1.5, z + 22], 2.2, lista, sg - 1);
    });
  };
  /* ── la barra de dominadas: dos postes y el travesaño. o: { alto, ancho, z, paralelos: a cuántos cm del centro van los dos
     agarres paralelos (cortos, salen de la barra hacia delante: para colgarse con las palmas enfrentadas; se agarran por su mitad),
     voladizo: los postes van esos cm por detrás y la barra cuelga de dos brazos que salen por encima de ella, como en una torre de
     dominadas (así, visto de lado, ni un poste ni un brazo se cruzan por delante del cuerpo: el front lever) } ── */
  var VOLADIZO_ALTO = 56;
  var PARALELO = 36;
  MATERIAL.barra_dominadas = function (esc, o) {
    this.o = o || {}; this.postes = [new Cilindro(M_COL.hierro), new Cilindro(M_COL.hierro)]; this.trav = new Cilindro(M_COL.cromo);
    this.bases = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.par = this.o.paralelos ? [new Cilindro(M_COL.cromo), new Cilindro(M_COL.cromo)] : null;
    this.vol = this.o.voladizo ? [0, 1, 2, 3, 4, 5].map(function () { return new Cilindro(M_COL.hierro); }) : null;
    this.antes = true;
  };
  MATERIAL.barra_dominadas.prototype.colocar = function () {};
  MATERIAL.barra_dominadas.prototype.agarre = function (x) { return [x, this.o.alto || 225, (this.o.z || 0) + (this.o.paralelos ? PARALELO / 2 : 0)]; };
  MATERIAL.barra_dominadas.prototype.extremos = function () {
    var o = this.o, w = o.ancho || 66, z = o.z || 0, v = o.voladizo || 0, h = (o.alto || 225) + 6 + (v ? VOLADIZO_ALTO : 0);
    return [[w + 3, h, z], [-w - 3, h, z], [w, 0, z - v - 26], [-w, 0, z + (v ? 14 : 26)], [w, 0, z + (v ? 14 : 26)], [-w, 0, z - v - 26]];
  };
  MATERIAL.barra_dominadas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, h = o.alto || 225, w = o.ancho || 66, z = o.z || 0, v = o.voladizo || 0, yo = this;
    [1, -1].forEach(function (s, i) {
      var hv = h + (v ? VOLADIZO_ALTO : 0);
      yo.postes[i].pon(cam, [s * w, 0, z - v], [s * w, hv + 4, z - v], 3, lista, -4);
      yo.bases[i].pon(cam, [s * w, 1.5, z - v - 26], [s * w, 1.5, z + (v ? 14 : 26)], 2.4, lista, -5);
      if (v) {
        /* el brazo, por encima de la barra; su cartela; y el tirante del que cuelga la punta de la barra */
        yo.vol[i * 3].pon(cam, [s * w, hv, z - v], [s * w, hv, z + 2], 2.4, lista, -3);
        yo.vol[i * 3 + 1].pon(cam, [s * w, hv - 24, z - v], [s * w, hv - 1, z - v + 26], 1.7, lista, -3.5);
        yo.vol[i * 3 + 2].pon(cam, [s * w, hv, z], [s * w, h, z], 2, lista, -2.5);
      }
    });
    this.trav.pon(cam, [-w, h, z], [w, h, z], 1.7, lista, 2.2);
    if (this.par) [1, -1].forEach(function (s, i) { yo.par[i].pon(cam, [s * o.paralelos, h, z], [s * o.paralelos, h, z + PARALELO], 1.6, lista, 2.4); });
  };
  /* ── las paralelas: dos barras a los lados. o: { alto, ancho, largo } ── */
  MATERIAL.paralelas = function (esc, o) {
    this.o = o || {}; this.b = [new Cilindro(M_COL.cromo), new Cilindro(M_COL.cromo)];
    this.p = [0, 1, 2, 3].map(function () { return new Cilindro(M_COL.hierro); });
    this.antes = true;
  };
  MATERIAL.paralelas.prototype.colocar = function () {};
  /* dónde se agarra: en la barra de su lado (x > 0, la de su izquierda), a la altura de «manos» a lo largo de ella */
  MATERIAL.paralelas.prototype.agarre = function (x) { var o = this.o; return [(x >= 0 ? 1 : -1) * (o.ancho || 27), o.alto || 118, (o.z || 0) + (o.manos || 0)]; };
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
  /* ── la polea: la columna, la polea a su altura y el cable hasta el agarre.
     o: { en: [x, z], alto, rumbo, a: 'manos' | 'i' | 'd' | 'tobillo-i', agarre: 'barra' | 'cuerda' | 'asa' | 'v' (el triángulo de palmas enfrentadas) |
     'barra_v' (la barra en V de los tríceps: dos mangos que bajan del centro hacia fuera) }
     La máquina de jalón es esta misma con: brazo (cuánto sale de la columna el brazo de arriba hacia quien tira; la polea va en su
     punta), asiento: [a cuánto de la columna, alto] y rodillo: [a cuánto de la columna, alto] (el que sujeta los muslos).
     reposo: [x, y, z], dónde cuelga el agarre mientras nadie lo ha cogido (en las posturas que la coreografía diga en «reposo»).
     El remo sentado es esta misma, baja, con apoyo: [a cuánto de la columna, alto, grados], la chapa inclinada donde se apoyan
     los pies (el asiento es un banco aparte) ── */
  MATERIAL.polea = function (esc, o) {
    o = o || {};
    this.o = o; this.col = new Caja(['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]); this.base = new Caja(['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]);
    this.rueda = new Disco(M_COL.hierroL, M_COL.hierroS, M_COL.cromo); this.cable = trazo('', '#11151c', 1.2);
    this.pesas = new Caja(['#7b8696', '#5b6575', '#434c5a', '#434c5a']); this.guia = new Cilindro(M_COL.cromo);
    this.asa = new Cilindro(M_COL.cromo); this.cuerdas = [new Cilindro(M_COL.cuerda, 'rgba(255,255,255,.4)'), new Cilindro(M_COL.cuerda, 'rgba(255,255,255,.4)')];
    this.gc = crear('g'); this.gc.appendChild(this.cable);
    this.uve = [new Cilindro(M_COL.cromo), new Cilindro(M_COL.cromo), new Cilindro(M_COL.goma, 'rgba(255,255,255,.18)'), new Cilindro(M_COL.goma, 'rgba(255,255,255,.18)')];
    var hie = ['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.viga = o.brazo ? new Caja(hie) : null;
    this.sillin = o.asiento ? new Caja([M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS]) : null; this.patSillin = o.asiento ? new Caja(hie) : null;
    this.rod = o.rodillo ? new Cilindro(M_COL.tapiz, 'rgba(255,255,255,.2)') : null; this.sopRod = o.rodillo ? new Cilindro(M_COL.hierro) : null;
    this.chapa = o.apoyo ? new Caja(['#7b8696', '#5b6575', '#434c5a', '#434c5a']) : null; this.patChapa = o.apoyo ? new Caja(hie) : null;
    this.largo0 = null; this.antes = false;
  };
  MATERIAL.polea.prototype.colocar = function () {};
  /* la columna, girada: su polea mira hacia −Z (rumbo 0), hacia +Z (180: la columna queda detrás de Jérôme) o hacia el centro
     desde un lado (90, la de su izquierda; −90, la de su derecha: el cruce de poleas) */
  MATERIAL.polea.prototype.al = function (x, y, z) { var o = this.o; return mas([o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 90], aplicar(giroY(o.rumbo || 0), [x, y, z])); };
  MATERIAL.polea.prototype.punto = function () { var o = this.o; return this.al(0, o.alto == null ? 200 : o.alto, -(o.brazo || 9)); };
  /* encuadre: hasta qué altura cuenta la columna para el encuadre (tumbado entre dos poleas, lo que importa está abajo: la columna sigue y se sale por arriba) */
  MATERIAL.polea.prototype.extremos = function () { var H = Math.min(this.o.torre || 218, this.o.encuadre || 1e9); return [this.al(-5, H, 0), this.al(5, H, 0), this.al(-27, 0, -29), this.al(27, 0, 17), this.al(27, 0, -29), this.al(-27, 0, 17)]; };
  MATERIAL.polea.prototype.pintar = function (E, cam, lista, ctx) {
    var o = this.o, H = o.torre || 218, pp = this.punto(), sg = o.sesgo == null ? -8 : o.sesgo, B = giroY(o.rumbo || 0);
    this.col.pon(cam, this.al(0, H / 2, 0), B, [9, H, 9], lista, sg, 'fondo');
    this.base.pon(cam, this.al(0, 3, -6), B, [54, 6, 46], lista, sg - 20, 'fondo');
    this.rueda.pon(cam, this.al(0, pp[1], -(o.brazo ? o.brazo - 1 : 8)), B[0], 5.2, 2.2, lista, sg + 1);
    /* la máquina de jalón: el brazo de arriba, el asiento y el rodillo de los muslos */
    if (this.viga) this.viga.pon(cam, this.al(0, pp[1] + 8, -o.brazo / 2), B, [7, 6, o.brazo + 12], lista, sg, 'fondo');
    if (this.sillin) {
      var za = -o.asiento[0], ha = o.asiento[1];
      this.sillin.pon(cam, this.al(0, ha - 3, za), B, [34, 6, 34], lista, -14, 'fondo');
      this.patSillin.pon(cam, this.al(0, (ha - 6) / 2, za), B, [8, ha - 6, 8], lista, -16, 'fondo');
    }
    if (this.rod) {
      var zr = -o.rodillo[0], hr = o.rodillo[1];
      this.rod.pon(cam, this.al(-17, hr, zr), this.al(17, hr, zr), 5, lista, 4);
      this.sopRod.pon(cam, this.al(0, hr, zr), this.al(0, hr, 0), 1.8, lista, -6);
    }
    /* el remo sentado: la chapa de los pies, inclinada (por arriba se aleja de quien rema), sobre su pie */
    if (this.chapa) {
      var zc = -o.apoyo[0], hc = o.apoyo[1], Bc = componer(B, giroX(o.apoyo[2] == null ? 25 : o.apoyo[2]));
      this.chapa.pon(cam, this.al(0, hc, zc), Bc, [46, 34, 3], lista, -18, 'fondo');
      this.patChapa.pon(cam, this.al(0, (hc - 8) / 2, zc + 7), B, [30, hc - 8, 6], lista, -19, 'fondo');
    }
    /* a qué va el cable */
    var a = o.a || 'manos', fin, yo = this, suelto = enReposo(o, ctx);
    var ag = o.agarre || (a === 'manos' ? 'barra' : 'asa'), ver = { asa: false, cuerda: false, uve: false };
    /* el agarre: en las manos, o colgando del cable si aún no se ha cogido */
    var gi, gd, eje;
    if (suelto) {
      fin = o.reposo;
      var cae = unidad(menos(fin, pp), [0, -1, 0]), lat = unidad(cruz(cae, B[2]), B[0]), w = ag === 'barra' ? (o.ancho0 || 30) : ag === 'cuerda' ? 3 : ag === 'barra_v' ? (o.ancho0 || 8) : 5.5;
      gi = mas(fin, por(lat, w)); gd = mas(fin, por(lat, -w)); eje = ag === 'v' ? B[2] : lat;
      if (ag === 'cuerda') { fin = mas(fin, por(cae, -29.8)); gi = mas(fin, mas(por(cae, 29.8), por(lat, 3))); gd = mas(fin, mas(por(cae, 29.8), por(lat, -3))); }
    } else {
      if (a === 'manos') fin = mezcla(E.i.agarre, E.d.agarre, 0.5);
      else if (a === 'i' || a === 'd') fin = E[a].agarre;
      else if (a === 'tobillo-i' || a === 'tobillo-d') fin = E[a.slice(-1)].tob;
      else if (a === 'pelvis') fin = mas(E.pel, aplicar(E.Bp, o.punto || [0, 0, 0]));
      gi = E.i.agarre; gd = E.d.agarre; eje = a === 'i' || a === 'd' ? E[a].mano.eje : null;
    }
    if (ag === 'cuerda' && (a === 'manos' || suelto)) {
      /* cada ramal mide lo mismo siempre (30 cm): cuanto más se separan las manos, más cerca de ellas queda el nudo */
      var sep = largo(menos(gi, gd)) / 2, nudo = suelto ? fin : mas(fin, por(unidad(menos(pp, fin)), Math.sqrt(Math.max(49, 900 - sep * sep))));
      this.cuerdas[0].pon(cam, nudo, gi, 1.3, lista, 1.4); this.cuerdas[1].pon(cam, nudo, gd, 1.3, lista, 1.4);
      ver.cuerda = true; fin = nudo;
    } else if (ag === 'v' && (a === 'manos' || suelto)) {
      /* el triángulo: del mosquetón a cada agarre, que es un mango corto */
      var pico = mas(fin, por(unidad(menos(pp, fin)), 13));
      [gi, gd].forEach(function (g, i) {
        var ej = suelto ? eje : E[i ? 'd' : 'i'].mano.eje;
        yo.uve[i].pon(cam, pico, g, 1.1, lista, 1.6);
        yo.uve[i + 2].pon(cam, mas(g, por(ej, -6.5)), mas(g, por(ej, 6.5)), 1.5, lista, 1.5);
      });
      ver.uve = true; fin = pico;
    } else if (ag === 'barra_v' && (a === 'manos' || suelto)) {
      /* la barra en V: dos mangos que bajan del centro hacia fuera, por donde va cada mano; el cable, a su vértice */
      var cima = mas(fin, por(unidad(menos(pp, fin)), o.pico == null ? 5 : o.pico));
      [gi, gd].forEach(function (g, i) {
        var dv = unidad(menos(g, cima));
        yo.uve[i].pon(cam, cima, mas(g, por(dv, 7.5)), 1.3, lista, 1.6);
        yo.uve[i + 2].pon(cam, mas(g, por(dv, -5)), mas(g, por(dv, 6.5)), 1.6, lista, 1.5);
      });
      ver.uve = true; fin = cima;
    } else if (ag === 'barra' && (a === 'manos' || suelto)) {
      var e = unidad(menos(gi, gd), [1, 0, 0]), medio = largo(menos(gi, gd)) / 2 + (o.sobra == null ? 9 : o.sobra);
      this.asa.pon(cam, mas(fin, por(e, -medio)), mas(fin, por(e, medio)), 1.4, lista, 2);
      ver.asa = true;
    } else if (a === 'i' || a === 'd') { this.asa.pon(cam, mas(fin, por(eje, -6)), mas(fin, por(eje, 6)), 1.3, lista, 2); ver.asa = true; }
    this.asa.g.style.display = ver.asa ? '' : 'none';
    this.cuerdas[0].g.style.display = this.cuerdas[1].g.style.display = ver.cuerda ? '' : 'none';
    this.uve.forEach(function (u) { u.g.style.display = ver.uve ? '' : 'none'; });
    var p1 = cam.p(pp), p2 = cam.p(fin);
    ponLinea(this.cable, p1, p2, Math.max(1, 0.7 * cam.esc));
    lista.push({ z: (p1[2] + p2[2]) / 2 + 1, el: this.gc });
    /* las pesas suben lo que se alarga el cable */
    var lar = largo(menos(pp, fin));
    if (this.largo0 == null || o.reinicia) this.largo0 = o.largo0 == null ? lar : o.largo0;
    var sube = entre(lar - this.largo0, 0, 120);
    this.pesas.pon(cam, this.al(0, 20 + sube + 16, 9), B, [22, 32, 9], lista, sg - 3, 'fondo');
    this.guia.pon(cam, this.al(0, 6, 9), this.al(0, H - 6, 9), 0.7, lista, sg - 4);
  };
  /* ── la barra T (landmine): una barra con un extremo anclado al suelo, sobre el que pivota; el otro, con sus discos, es el que se
     levanta. o: { pivote: [x, z], a: 'manos' | 'i' | 'd' (quién la lleva), discos (radio), sobra (cuánto sigue la barra más allá del
     agarre), dentro (si se agarra por la punta: a cuánto del agarre quedan los discos, hacia el pivote), asas: 'v' (dos agarres
     estrechos, a los lados de la barra) | 'ancha' (un travesaño), reposo: [x, y, z] (dónde queda el agarre mientras nadie la ha
     cogido: en las posturas que la coreografía diga en «reposo») } ── */
  MATERIAL.landmine = function (esc, o) {
    o = o || {}; this.o = o;
    this.barra = new Cilindro(M_COL.cromo); this.manguito = new Cilindro(M_COL.cromoS);
    this.discos = [new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo)];
    this.base = new Caja(['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS]);
    this.asas = o.asas ? [new Cilindro(M_COL.cromo), new Cilindro(M_COL.cromo)] : null;
    this.antes = false;
  };
  MATERIAL.landmine.prototype.colocar = function (E, ctx) { this.suelta = enReposo(this.o, ctx); };
  MATERIAL.landmine.prototype.fin = function (E) { var a = this.o.a || 'manos'; return this.suelta ? this.o.reposo : a === 'manos' ? mezcla(E.i.agarre, E.d.agarre, 0.5) : E[a].agarre; };
  MATERIAL.landmine.prototype.tramo = function (E) {
    var o = this.o, piv = [o.pivote[0], 5, o.pivote[1]], fin = this.fin(E), d = unidad(menos(fin, piv), [0, 0, 1]);
    return { piv: piv, fin: fin, d: d, punta: mas(fin, por(d, o.sobra == null ? 30 : o.sobra)) };
  };
  MATERIAL.landmine.prototype.extremos = function (E) {
    var o = this.o, r = [[o.pivote[0] - 12, 0, o.pivote[1] - 12], [o.pivote[0] + 12, 8, o.pivote[1] + 12]];
    if (E) { var t = this.tramo(E), R = o.discos == null ? 17 : o.discos; r.push(mas(t.punta, [0, R, 0]), mas(t.punta, [0, -R, 0]), mas(t.punta, [R, 0, 0]), mas(t.punta, [-R, 0, 0])); }
    return r;
  };
  MATERIAL.landmine.prototype.pintar = function (E, cam, lista) {
    var o = this.o, t = this.tramo(E), d = t.d, R = o.discos == null ? 17 : o.discos, sg = o.sesgo || 0;
    this.barra.pon(cam, t.piv, t.punta, 1.5, lista, 2 + sg);
    this.manguito.pon(cam, mas(t.punta, por(d, -36)), t.punta, 2.4, lista, 2.1 + sg);
    /* los discos: más allá de las manos o, si se agarra por la punta, hacia el pivote */
    var zd = o.dentro ? -o.dentro : (o.sobra == null ? 30 : o.sobra) - 9, s = o.dentro ? -1 : 1;
    this.discos[0].pon(cam, mas(t.fin, por(d, zd)), d, R, 4.4, lista, sg);
    this.discos[1].pon(cam, mas(t.fin, por(d, zd + s * 5.4)), d, R * 0.8, 3.4, lista, sg + (s * punto(d, cam.k) > 0 ? 0.6 : -0.6));
    /* el anclaje, en el suelo, mirando a la barra */
    var rum = Math.atan2(d[0], d[2]) / RAD;
    this.base.pon(cam, [o.pivote[0], 3.5, o.pivote[1]], giroY(rum), [18, 7, 24], lista, -12, 'fondo');
    /* las asas: en las manos o, si aún no se ha cogido, a los lados de la barra */
    var lat = unidad(cruz([0, 1, 0], d), [1, 0, 0]), gi = this.suelta ? mas(t.fin, por(lat, o.asas === 'ancha' ? 26 : 7)) : E.i.agarre, gd = this.suelta ? mas(t.fin, por(lat, o.asas === 'ancha' ? -26 : -7)) : E.d.agarre;
    if (o.asas === 'ancha') {
      var e = unidad(menos(gi, gd), [1, 0, 0]), medio = largo(menos(gi, gd)) / 2 + 8;
      this.asas[0].pon(cam, mas(t.fin, por(e, -medio)), mas(t.fin, por(e, medio)), 1.5, lista, 2.3 + sg);
      this.asas[1].g.style.display = 'none';
    } else if (o.asas === 'v') {
      this.asas[0].pon(cam, mas(gi, por(d, -7)), mas(gi, por(d, 7)), 1.4, lista, 2.3 + sg);
      this.asas[1].pon(cam, mas(gd, por(d, -7)), mas(gd, por(d, 7)), 1.4, lista, 2.3 + sg);
    }
  };
  /* ── las toallas en tiras (una toalla cogida a lo largo, que hace de correa). Cada tira va de un punto a una mano y, pasada la mano,
     cuelga lo que sobra. o: { ancho (cm), tiras: [{ de: [x, y, z] (de dónde cuelga: lo alto de una barra) | 'pie-i' | 'pie-d' (pasa por la
     planta de ese pie, bajo la bola: cada tira sale por el lado del pie que da a su mano), a: 'i' | 'd' (la mano), cola (cm que sobran),
     reposo: [x, y, z] (hasta dónde cuelga mientras nadie la ha cogido: en las posturas que la coreografía diga en «reposo»),
     sobre: [x, y, z] (un punto de aquello sobre lo que monta —el centro de la barra—: su doblez se pinta por encima de eso),
     en: [posturas] (solo se pinta en los tramos que salen de una de esas posturas: así una toalla pasa de un pie al otro) }],
     agarreY (y agarreZ): a qué altura se agarran, si la mano va clavada a ellas }
     Con de: 'mano-i' o 'mano-d', la tira va de esa mano a la otra: la toalla, tendida entre las dos ── */
  MATERIAL.toallas = function (esc, o) {
    this.o = o || {};
    this.t = (this.o.tiras || []).map(function (q) {
      var g = crear('g'), b = trazo('', TOALLA[2]), c = trazo('', TOALLA[0]), r = { g: g, b: b, c: c };
      g.appendChild(b); g.appendChild(c);
      if (q.sobre) { r.g2 = crear('g'); r.b2 = trazo('', TOALLA[2]); r.c2 = trazo('', TOALLA[0]); r.g2.appendChild(r.b2); r.g2.appendChild(r.c2); }
      return r;
    });
    this.antes = false;
  };
  MATERIAL.toallas.prototype.colocar = function () {};
  /* dónde se agarra la de cada lado: a x del centro, a la altura «agarreY» (para clavar la mano a ella) */
  MATERIAL.toallas.prototype.agarre = function (x) { return [x, this.o.agarreY, this.o.agarreZ || 0]; };
  MATERIAL.toallas.prototype.pintar = function (E, cam, lista, ctx) {
    var o = this.o, an = o.ancho || 5, suelta = !!ctx && (o.reposoEn ? !!ctx.enLista && ctx.enLista(o.reposoEn) : !!ctx.reposo);
    var linea2 = function (pts) { var d = ''; pts.forEach(function (p3, i) { var p = cam.p(p3); d += (i ? 'L' : 'M') + n1(p[0]) + ',' + n1(p[1]); }); return d; };
    (o.tiras || []).forEach(function (q, i) {
      var r = this.t[i], M = E[q.a], pts = [], fin = suelta && q.reposo ? q.reposo : M.agarre, a = q.de;
      var ve = !q.en || (!!ctx && q.en.indexOf(ctx.de) >= 0);
      r.g.style.display = ve ? '' : 'none'; if (r.g2) r.g2.style.display = ve ? '' : 'none';
      if (!ve) return;
      if (a === 'mano-i' || a === 'mano-d') a = E[a.slice(-1)].agarre;
      else if (typeof a === 'string') {
        /* por la planta: del centro, bajo la bola del pie, al canto de su lado; y de ahí, a la mano */
        var k = a.slice(-1), L = E[k], bola = mas(L.suela, mas(por(L.punta, 12.5), por(L.arriba, -0.9))), lado = unidad(cruz(L.arriba, L.punta), [1, 0, 0]);
        if (punto(menos(fin, bola), lado) < 0) lado = por(lado, -1);
        pts.push(bola); a = mas(bola, mas(por(lado, 5.2), por(L.arriba, 0.6)));
      }
      pts.push(a, fin);
      if (!(suelta && q.reposo) && q.cola) pts.push(mas(fin, por(unidad(mas(por(unidad(menos(fin, a)), 0.3), [0, -1, 0])), q.cola)));
      var d = linea2(pts), w = an * cam.esc;
      pon(r.b, 'd', d); pon(r.b, 'stroke-width', n1(w)); pon(r.c, 'd', d); pon(r.c, 'stroke-width', n1(Math.max(1, w - 1.5)));
      lista.push({ z: cam.p(fin)[2] + (q.sesgo == null ? 0.9 : q.sesgo), el: r.g });
      if (r.g2) {
        var d2 = linea2([mas(q.de, [0, -4, 0]), q.de]);
        pon(r.b2, 'd', d2); pon(r.b2, 'stroke-width', n1(w)); pon(r.c2, 'd', d2); pon(r.c2, 'stroke-width', n1(Math.max(1, w - 1.5)));
        lista.push({ z: cam.p(q.sobre)[2] + 3, el: r.g2 });
      }
    }, this);
  };
  /* ── algo blando: una toalla doblada. o: { en: [x, y, z] (su centro), rumbo, cabeceo, med: [ancho, alto, largo] }
     Con rollo: [largo, radio], enrollada: un rulo tumbado a lo ancho (con «rumbo»), para ponerlo bajo una rodilla. Sobre la arena una
     toalla clara apenas se ve: el rulo lleva su contorno y una franja de color cerca de cada punta, como las toallas de playa ── */
  MATERIAL.toalla = function (esc, o) {
    this.o = o || {}; this.antes = true;
    if (!this.o.rollo) { this.c = new Caja(['#f4f1ea', '#e2ddd0', '#cfc8b6', '#cfc8b6']); return; }
    this.g = crear('g');
    this.k = trazo('', '#a89f8a'); this.a = trazo('', TOALLA[0]);
    this.f = [0, 1].map(function () { return crear('path', { fill: 'none', stroke: M_COL.agua, 'stroke-linecap': 'butt' }); });
    this.b = trazo('', 'rgba(255,255,255,.6)');
    [this.k, this.a].concat(this.f, [this.b]).forEach(function (e) { this.g.appendChild(e); }, this);
  };
  MATERIAL.toalla.prototype.colocar = function () {};
  MATERIAL.toalla.prototype.pintar = function (E, cam, lista) {
    var o = this.o;
    if (this.g) {
      var R = o.rollo[1], L = o.rollo[0] / 2 - R, e = aplicar(giroY(o.rumbo || 0), [1, 0, 0]), en = function (x) { return cam.p(mas(o.en, por(e, x))); };
      var p = en(-L), q = en(L), w = 2 * R * cam.esc;
      ponLinea(this.k, p, q, w + 1.8); ponLinea(this.a, p, q, w);
      this.f.forEach(function (f, i) { var sg = i ? 1 : -1; ponLinea(f, en(sg * (L - 1.2)), en(sg * (L - 4.6)), w); });
      /* el brillo, corrido hacia arriba */
      var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
      if (ny > 0) { nx = -nx; ny = -ny; }
      ponLinea(this.b, [p[0] + nx * w * 0.22, p[1] + ny * w * 0.22], [q[0] + nx * w * 0.22, q[1] + ny * w * 0.22], Math.max(0.6, w * 0.2));
      lista.push({ z: (p[2] + q[2]) / 2 + (o.sesgo == null ? -13 : o.sesgo), el: this.g });
      return;
    }
    this.c.pon(cam, o.en, componer(giroY(o.rumbo || 0), giroX(o.cabeceo || 0)), o.med || [26, 3, 14], lista, o.sesgo == null ? -13 : o.sesgo, 'fondo');
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
  /* E: el esqueleto de este instante, aún sin clavar. o: { busto, esf, rep, dePie, habla, libres: { i, d }, sobreManos } */
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
      /* (sobreManos: quien anda sobre las manos se sostiene en ellas, y el tronco no va detrás de la cadera: con los brazos
         estirados y las manos clavadas, esa demora las dejaría fuera de alcance) */
      if (!o.sobreManos) B = this.hace(DEMORA.tronco).B;
      col = this.hace(DEMORA.columna).col.slice(); cab = this.hace(DEMORA.cabeza).cab.slice();
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
      if (m.c < 0.7 && m.c > 0.12 && !(m.ap > 0)) {
        var dd = 0.035 * Math.sin(yo.t * 0.9 + (lado === 'i' ? 0 : 1.7)) + 0.02 * yo.aire;
        manos[lado] = { tipo: m.tipo, prono: m.prono, mun: m.mun, lat: m.lat, c: m.c + dd, ci: m.ci + dd * 0.8, ab: m.ab, pu: m.pu, pal: m.pal, bar: m.bar, w: m.w, ded: m.ded, wd: m.wd };
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
    tli: function (E) { return E.i.talon; }, tld: function (E) { return E.d.talon; }, dpi: function (E) { return E.i.dedosPie; }, dpd: function (E) { return E.d.dedosPie; },
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
    /* el saludo de visera: sube el codo, la mano plana a la ceja (la cabeza mide desde la barbilla: la ceja queda a 161 cm), y sale */
    visera0: { cab: [0, -3, 2], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 68, z: 58, g: 22, c: 100 }, mi: { tipo: 'plana', prono: -60 }, md: { tipo: 'suelta' } },
    visera1: { cab: [-3, -5, 4], hom: { i: [2, 0], d: [0, 0] }, bi: { e: 100, z: 55, g: 20, c: 122 }, mi: { tipo: 'plana', prono: -90 }, md: { tipo: 'suelta' } },
    visera2: { cab: [-5, 4, 5], hom: { i: [1.2, 0], d: [0, 0] }, bi: { e: 104, z: 58, g: 16, c: 88 }, mi: { tipo: 'plana', prono: -70 }, md: { tipo: 'suelta' } },
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
    this.cMarcas = [0, 1, 2, 3].map(function () { var g = crear('g', { opacity: 0 }, this.gMarcas); g._o = [0, 1].map(function () { return crear('circle', { r: 1, fill: 'none', stroke: '#F5C76B', 'stroke-linecap': 'round', opacity: 0 }, g); }); return g; }, this);
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
    for (n in co.posturas) this.K[n] = this.clave(co.posturas[n], co, n);
    this.esc.poner(co.material || []);
    /* la repetición: de dónde sale cada tramo */
    var desde = co.inicio || 'a', t0 = 0;
    this.rep = (co.rep || []).map(function (s, i) {
      var r = { de: desde, a: s[0], t0: t0, dur: s[1], curva: CURVA[s[2] || (s[0] === desde ? 'lineal' : 'suave')] || CURVA.suave, esf: (co.esfuerzo || []).indexOf(i) >= 0, clavos: s[3], src: s };
      desde = s[0]; t0 += s[1]; return r;
    });
    this.T = t0 || 1;
    this.inicio = co.inicio || 'a';
    this.clavos = (co.clavos || []).map(clavo);
    this.rastroDe = co.rastro || null; this.rastro = [];
    this.modo = 'postura'; this.meta = this.inicio; this.tau = 0; this.w = 1; this.Eprev = null; this.reps = 0; this.sec = null;
    this.vida.corte(); this.cortes++; this.gestoDe = null; this.ap = null;
    /* los rodeos de la repetición, mirados ya; salvo en las muy largas (un paseo, unos saltos de lado a lado: decenas de tramos),
       que se miran al llegar a cada uno: ahí mirarlos todos de golpe tardaría más que lo que ahorra */
    this.metas = [];
    if (this.rep.length <= RODEO_REP) this.rodeos(this.rep);
    this.encuadrar();
  };
  function clavo(s) {
    /* 'ti' · 'mi' (en línea recta entre posturas) · 'mi@0:31' (al agarre del material 0, a 31 cm del centro) · 'mi=x,y,z' (a un punto) */
    var m = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/.exec(s);
    return m ? { que: m[1], mat: m[2] == null ? null : Number(m[2]), x: Number(m[3] || 0), en: m[4] == null ? null : [Number(m[4]), Number(m[5]), Number(m[6])] } : null;
  }
  /* las posturas en las que ya no hay nada clavado (se ha soltado de la barra) */
  Director.prototype.suelto = function (n) { return !!(this.co && this.co.sinClavos && this.co.sinClavos.indexOf(n) >= 0); };
  /* lo clavado mientras mantiene una postura: lo de la coreografía, salvo que esa postura traiga su lista (clavosEn: { postura: [...] }).
     Una mano solo se clava donde agarra o apoya: la que cuelga suelta mientras espera, no (clavada en el aire, el cuerpo, que respira
     y se balancea, se le echaría encima) */
  Director.prototype.clavosDe = function (n) {
    var en = this.co && this.co.clavosEn && this.co.clavosEn[n];
    return en ? en.map(clavo) : this.clavos;
  };
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
    for (i = 0; i < lista.length; i++) clavar(E2, lista[i][0], lista[i][1]);
    /* la mano en un agarre del material: la muñeca se calculó con el codo de antes de clavar; con el codo ya en su sitio se
       afina (segunda pasada), y el centro del puño cae en la barra aunque el brazo esté muy doblado */
    var afina = false;
    for (i = 0; i < clavos.length; i++) if (clavos[i] && clavos[i].que.charAt(0) === 'm' && clavos[i].mat != null && mats[clavos[i].mat] && mats[clavos[i].mat].agarre) afina = true;
    if (afina) {
      E = armar(S); E2 = { S: S, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d }; var n = 0;
      for (i = 0; i < clavos.length; i++) {
        c = clavos[i]; if (!c) continue;
        if (c.que.charAt(0) === 'm' && c.mat != null && mats[c.mat] && mats[c.mat].agarre) { lista[n][1] = munecaPara(E, c.que.charAt(1), mats[c.mat].agarre(c.x)); clavar(E2, lista[n][0], lista[n][1]); }
        n++;
      }
    }
    for (i = 0; i < lista.length; i++) this.metas.push(lista[i]);
    return armar(S);
  };
  /* las manos no se meten en los muslos (20-figura.js, apartaMano): la que roza uno o se mete un poco (y no va clavada a nada: la que
     agarra una barra fija o apoya en el suelo se queda donde está) se aparta hasta sacarla, y el brazo se vuelve a resolver hacia
     donde ya se doblaba. Solo lo que roza o se mete poco: si lo más metido de la mano no pasa de la mitad del radio del muslo (unos
     6 cm), se saca del todo; de ahí hacia el eje, cada vez menos, y la mano que cruza un muslo por el centro no se toca (ahí «hacia
     fuera» no dice nada: eso se arregla en su coreografía). Cuánto, se decide con la mano donde estaba, antes de moverla: así, de un
     instante al siguiente, no da saltos. «clavos», lo clavado en este cuadro */
  Director.prototype.despejar = function (E, clavos) {
    var libre = { i: true, d: true }, i, k, n, r, a, S, E2, c, R = null;
    if (clavos) for (i = 0; i < clavos.length; i++) { c = clavos[i]; if (c && c.que.charAt(0) === 'm') libre[c.que.charAt(1)] = false; }
    for (i = 0; i < 2; i++) {
      k = LADOS[i]; if (!libre[k]) continue;
      r = apartaMano(E, k); if (!r) continue;
      a = entre((r.c - 0.25) / 0.25, 0, 1); if (a <= 0) continue;
      /* hasta sacarla (unas vueltas: al apartarla de un muslo puede rozar otra parte)… */
      S = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: E.S.q, m: E.S.m, t: E.S.t }; E2 = E;
      for (n = 0; n < 6 && r && (r.v[0] * r.v[0] + r.v[1] * r.v[1] + r.v[2] * r.v[2]) > 1e-4; n++) {
        clavar({ S: S, Bt: E2.Bt, Bp: E2.Bp, i: E2.i, d: E2.d }, 'm' + k, mas(E2[k].mun, r.v));
        E2 = armar(S); r = apartaMano(E2, k);
      }
      /* … y de ese camino, la parte que toca */
      if (!R) R = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: E.S.q, m: E.S.m, t: E.S.t };
      clavar({ S: R, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d }, 'm' + k, mas(E[k].mun, por(menos(E2[k].mun, E[k].mun), a)));
    }
    return R ? armar(R) : E;
  };
  /* ── la mano no cruza un muslo por dentro ──
     Entre dos posturas la mano va por donde la lleva el brazo (se mezclan los ángulos), y ese camino a veces atraviesa un muslo de
     parte a parte. Ahí apartar no vale (por el centro, «hacia fuera» no dice nada): hay que rodearlo. De cada tramo se mira una
     vez el camino de cada mano libre; si se mete hondo en un muslo (más de la mitad de su radio), el trozo del camino que pasa cerca
     de él se cambia por otro que lo rodea: de donde entraba a donde salía, girando alrededor del muslo y a la distancia de su eje
     que traía y que lleva (todo en el marco del muslo, que también se mueve). Lo que aún roce, lo quita despejar.
     s, el tramo ({ de, a, … }); guarda en él lo que encuentra (s.rodeo: null, o por mano { m, e1, e2, c1, c2, df }) */
  var RODEO_N = 24, RODEO_M = 12, RODEO_CERCA = 5, RODEO_REP = 16;
  Director.prototype.rodeoDe = function (s, A, B, clavos) {
    if (s.rodeo !== undefined) return s.rodeo;
    /* ya mirado en esta coreografía (otra vez el mismo paso, o el vídeo montado de nuevo): se guarda en el tramo tal como viene escrito */
    var o = s.src;
    if (o && o._rodeoCo === this.co && o._rodeoDe === s.de) return (s.rodeo = o._rodeo);
    var yo = this, metas = this.metas, libre = { i: true, d: true }, R = null, E = [], i, j, c, q;
    if (clavos) for (i = 0; i < clavos.length; i++) { c = clavos[i]; if (c && c.que.charAt(0) === 'm') libre[c.que.charAt(1)] = false; }
    this.metas = [];            /* lo que se clava al probar el camino no cuenta como clavado en este cuadro */
    for (j = 0; j <= RODEO_N; j++) { q = mezclar(A, B, j / RODEO_N); if (clavos && clavos.length) q = this.clavar(q, A, B, j / RODEO_N, clavos); E.push(q); }
    LADOS.forEach(function (k) {
      if (!libre[k]) return;
      var m = null, j, a, j1 = 0, j2 = RODEO_N, c1, c2, df, medio, otro;
      /* el muslo que rodea: el primero en el que se mete hondo (si después cruza también el otro, el mismo rodeo, que se abre lo que
         haga falta, le pasa por encima) */
      for (j = 0; j <= RODEO_N && !m; j++) { a = apartaMano(E[j], k); if (a && a.c < 0.5) m = a.m; }
      if (!m) return;
      var cerca = function (j) { return Math.max(manoEnMuslo(E[j], k, 'i', 0, 44), manoEnMuslo(E[j], k, 'd', 0, 44)) > -RODEO_CERCA; };
      while (j1 < RODEO_N && !cerca(j1)) j1++;
      while (j2 > 0 && !cerca(j2)) j2--;
      j1 = Math.max(0, j1 - 1); j2 = Math.min(RODEO_N, j2 + 1);
      if (j2 <= j1) return;
      c1 = cilMuslo(E[j1], k, m); c2 = cilMuslo(E[j2], k, m); df = c2[2] - c1[2];
      while (df > 180) df -= 360;
      while (df <= -180) df += 360;
      /* por qué lado: por el que ya iba (la vuelta que da el camino sin rodeo alrededor del eje del muslo, sumada punto a punto);
         y si pasaba casi por el mismo eje (ahí la vuelta no dice nada), por el más corto o, si es casi media vuelta, por delante */
      var dis = 0, romin = 1e9, ant = c1, ac;
      for (j = j1 + 1; j <= j2; j++) { ac = cilMuslo(E[j], k, m); medio = ac[2] - ant[2]; while (medio > 180) medio -= 360; while (medio <= -180) medio += 360; dis += medio; romin = Math.min(romin, ac[1]); ant = ac; }
      if (romin > 7) { if (Math.abs(dis - df) > 180) df = dis > df ? df + 360 : df - 360; }
      else {
        /* por el más corto; pero por detrás del muslo (por debajo, si está sentado) solo si la mano viene de detrás del cuerpo o va
           allí; y si es casi media vuelta, por delante */
        medio = c1[2] + df / 2; otro = c1[2] + (df > 0 ? df - 360 : df + 360) / 2;
        var detras = function (j) { return punto(menos(E[j][k].mun, E[j].S.p), E[j].Bp[2]) < -9; };
        if (Math.sin(medio * RAD) < -0.5 ? !(detras(j1) || detras(j2)) : (Math.abs(df) > 165 && Math.sin(otro * RAD) > Math.sin(medio * RAD))) df = df > 0 ? df - 360 : df + 360;
      }
      /* y a esa distancia se le suma, punto a punto, lo que haga falta para que la mano entera (los dedos van por delante de la
         muñeca) pase sin tocarlo: se prueba el camino y, donde aún se mete, se abre un poco más (unas vueltas) */
      var q = { m: m, e1: j1 / RODEO_N, e2: j2 / RODEO_N, c1: c1, c2: c2, df: df, mas: [], iba: dis, eje: romin }, n, v, u, P, S, z, hubo;
      for (n = 0; n <= RODEO_M; n++) q.mas.push(0);
      for (v = 0; v < 5; v++) {
        hubo = false;
        for (n = 1; n < RODEO_M; n++) {
          u = n / RODEO_M; P = yo.clavar(mezclar(A, B, q.e1 + (q.e2 - q.e1) * u), A, B, q.e1 + (q.e2 - q.e1) * u, clavos);
          S = { p: P.S.p, B: P.S.B, col: P.S.col, cab: P.S.cab, hom: P.S.hom, b: { i: P.S.b.i, d: P.S.b.d }, q: P.S.q, m: P.S.m, t: P.S.t };
          clavar({ S: S, Bt: P.Bt, Bp: P.Bp, i: P.i, d: P.d }, 'm' + k, deCilMuslo(P, m, cilRodeo(q, u)));
          P = armar(S); z = Math.max(manoEnMuslo(P, k, 'i', 2, 39), manoEnMuslo(P, k, 'd', 2, 39));
          if (z > -0.4 && q.mas[n] < 30) { q.mas[n] += z + 0.9; hubo = true; }
        }
        if (!hubo) break;
      }
      (R = R || {})[k] = q;
    });
    this.metas = metas;
    if (o) { o._rodeoCo = this.co; o._rodeoDe = s.de; o._rodeo = R; }
    return (s.rodeo = R);
  };
  /* los rodeos de unos tramos, mirados de antemano (al cargar la coreografía, los de la repetición; al empezar una secuencia, los
     suyos): mirar un tramo son unas decenas de posturas, y hecho en mitad del movimiento sería un cuadro que llega tarde */
  Director.prototype.rodeos = function (tramos) {
    var metas = this.metas, i, t;
    for (i = 0; i < tramos.length; i++) {
      t = tramos[i];
      if (t.de === t.a || !this.K[t.de] || !this.K[t.a]) continue;
      /* si aún no se puede (un material que todavía no está en su sitio), se mirará al llegar a ese tramo, como antes */
      try { this.rodeoDe(t, this.K[t.de], this.K[t.a], t.clavos ? t.clavos.map(clavo) : this.clavos); } catch (e) { t.rodeo = undefined; this.metas = metas; }
    }
  };
  /* el punto u (de 0 a 1) de un rodeo, visto desde su muslo */
  function cilRodeo(q, u) {
    var x = u * RODEO_M, n = Math.min(RODEO_M - 1, Math.floor(x)), f = x - n;
    return [q.c1[0] + (q.c2[0] - q.c1[0]) * u, q.c1[1] + (q.c2[1] - q.c1[1]) * u + q.mas[n] + (q.mas[n + 1] - q.mas[n]) * f, q.c1[2] + q.df * u];
  }
  Director.prototype.rodear = function (E, s, A, B, e, clavos) {
    var r = this.rodeoDe(s, A, B, clavos), R = null, i, k, q, u;
    if (!r) return E;
    for (i = 0; i < 2; i++) {
      k = LADOS[i]; q = r[k]; if (!q || e <= q.e1 || e >= q.e2) continue;
      u = (e - q.e1) / (q.e2 - q.e1);
      if (!R) R = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: E.S.q, m: E.S.m, t: E.S.t };
      clavar({ S: R, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d }, 'm' + k, deCilMuslo(E, q.m, cilRodeo(q, u)));
    }
    return R ? armar(R) : E;
  };
  /* un tramo (de la repetición o de una secuencia) en su punto e (de 0 a 1, ya con su curva): mezclado, con lo clavado en su sitio, el
     rodeo y lo apartado (sin la vida: para medir y comprobar) */
  Director.prototype.enTramo = function (s, e) {
    var A = this.K[s.de], B = this.K[s.a], cl = s.clavos ? s.clavos.map(clavo) : this.clavos, E = s.de === s.a ? A : mezclar(A, B, e);
    E = this.clavar(E, A, B, e, cl);
    if (s.de !== s.a) E = this.rodear(E, s, A, B, e, cl);
    return this.despejar(E, cl);
  };
  /* lo apartado no da tirones: en lo que se ve, de un cuadro al siguiente cambia como mucho VAP cm por segundo. Cuando la mano pasa de
     un lado del muslo al otro, o el muslo le sale al paso de golpe, se desliza a su sitio (un décimo de segundo) en vez de saltar. En una
     postura mantenida es exacto, y también en el primer cuadro tras un corte. E0, antes de apartar; E1, apartado del todo */
  var VAP = 90;
  Director.prototype.suave = function (E0, E1, dt, clavos) {
    var ap = this.ap, exacto = !ap || !(dt > 0) || dt > 0.25 || (this.modo === 'postura' && this.w >= 1), tope = VAP * dt, fija = {}, R = null, i, k, c, p, d, l;
    if (!ap) ap = this.ap = { i: [0, 0, 0], d: [0, 0, 0] };
    if (clavos) for (i = 0; i < clavos.length; i++) { c = clavos[i]; if (c && c.que.charAt(0) === 'm') fija[c.que.charAt(1)] = true; }
    for (i = 0; i < 2; i++) {
      k = LADOS[i]; p = menos(E1[k].mun, E0[k].mun); d = menos(p, ap[k]); l = largo(d);
      if (exacto || fija[k] || l <= tope) { ap[k] = p; continue; }
      ap[k] = mas(ap[k], por(d, tope / l));
      if (!R) R = { p: E1.S.p, B: E1.S.B, col: E1.S.col, cab: E1.S.cab, hom: E1.S.hom, b: { i: E1.S.b.i, d: E1.S.b.d }, q: E1.S.q, m: E1.S.m, t: E1.S.t };
      clavar({ S: R, Bt: E1.Bt, Bp: E1.Bp, i: E1.i, d: E1.d }, 'm' + k, mas(E0[k].mun, ap[k]));
    }
    return R ? armar(R) : E1;
  };
  /* una postura clave de una coreografía, resuelta: con las manos fuera de los muslos. Aquí, quieta, se saca del todo la mano que
     esté metida en uno, por honda que esté (en movimiento, despejar solo aparta lo que roza): hacia fuera del eje del muslo, hasta que
     no lo toque. Menos las manos que la coreografía lleva clavadas en esa postura (agarran algo fijo o apoyan en el suelo) */
  Director.prototype.clave = function (P, co, nombre) {
    var E = resolver(P), fijas = {}, i, k, n, r, S = null;
    var suelta = !!(co && co.sinClavos && co.sinClavos.indexOf(nombre) >= 0);
    (suelta ? [] : (co && ((co.clavosEn && co.clavosEn[nombre]) || co.clavos)) || []).forEach(function (q) { if (typeof q === 'string' && q.charAt(0) === 'm') fijas[q.charAt(1)] = true; });
    for (n = 0; n < 12; n++) {
      var movio = false;
      for (i = 0; i < 2; i++) {
        k = LADOS[i]; if (fijas[k]) continue;
        r = apartaMano(E, k); if (!r || r.v[0] * r.v[0] + r.v[1] * r.v[1] + r.v[2] * r.v[2] < 1e-4) continue;
        if (!S) S = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: E.S.q, m: E.S.m, t: E.S.t };
        clavar({ S: S, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d }, 'm' + k, mas(E[k].mun, r.v)); movio = true;
      }
      if (!movio) break;
      E = armar(S);
    }
    return E;
  };
  /* el esqueleto de la repetición en el instante tau, con lo clavado en su sitio (sin la vida: para medir y comprobar) */
  Director.prototype.enRep = function (tau) { var r = this.mezclaRep(tau); return this.enTramo(this.tramo, r.e); };
  /* ── qué hace ── */
  Director.prototype.aPostura = function (nombre, seg) {
    if (!this.K[nombre]) return;
    this.Eprev = this.E; this.w = this.E && seg !== 0 ? 0 : 1; this.durW = seg || 0.7;
    this.metaPrev = this.meta; this.modo = 'postura'; this.meta = nombre; this.sec = null; this.gestoDe = null;
    this.vida.linea = []; if (seg === 0) { this.vida.corte(); this.cortes++; this.ap = null; }
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
    this.sec = lista.map(function (s) { var r = { de: de, a: s[0], t0: t0, dur: s[1], curva: CURVA[s[2] || 'suave'] || CURVA.suave, clavos: s[3], src: s }; de = s[0]; t0 += s[1]; return r; });
    this.rodeos(this.sec);
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
    /* la cámara lenta («½×») es para el ejercicio: de cerca, el presentador saluda y aconseja a su velocidad */
    var esc = this.esc, E, v = parado ? 0 : this.busto ? 1 : this.vel, yo = this, A, B, e = 0, clavos = null, i, tr = null;
    this.t += dt;
    if (this.modo === 'rep') {
      this.tau += dt * v;
      if (this.tau >= this.T) { this.tau -= this.T; this.reps++; if (this.alRepetir) this.alRepetir(this.reps); }
      var r = this.mezclaRep(this.tau); E = r.E; A = r.A; B = r.B; e = r.e; clavos = r.clavos; tr = this.tramo;
      this.esf += ((this.tramo.esf ? 1 : 0) - this.esf) * (1 - Math.exp(-dt * 7));
    } else if (this.modo === 'sec') {
      this.tau = Math.min(this.secT, this.tau + dt * v);
      var s = this.sec[this.sec.length - 1];
      for (i = 0; i < this.sec.length; i++) if (this.tau < this.sec[i].t0 + this.sec[i].dur) { s = this.sec[i]; break; }
      e = s.curva(entre((this.tau - s.t0) / s.dur, 0, 1)); A = this.K[s.de]; B = this.K[s.a];
      this.secDe = s.de; this.secA = s.a; this.secU = entre((this.tau - s.t0) / s.dur, 0, 1);
      E = s.de === s.a ? A : mezclar(A, B, e); clavos = s.clavos ? s.clavos.map(clavo) : this.clavos; tr = s;
      this.esf += (0 - this.esf) * (1 - Math.exp(-dt * 5));
      if (this.tau >= this.secT) { this.modo = 'postura'; this.w = 1; }
    } else {
      E = this.K[this.meta] || this.K.listo; A = B = E;
      if (this.co && this.meta !== 'listo' && !this.suelto(this.meta)) clavos = this.clavosDe(this.meta);
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
    E = this.vida.paso(E, parado ? 0 : dt, { busto: this.busto, esf: this.esf, rep: this.modo === 'rep', dePie: dePie, habla: this.busto && esc.cab.habla > esc.cab.t, libres: libres, sobreManos: !this.busto && !!(this.co && this.co.sobreManos) });
    this.metas = [];            /* lo que se clava en este cuadro, y dónde (lo coteja la auditoría: lo clavado no se mueve) */
    if (clavos && clavos.length) E = this.clavar(E, A, B, e, clavos);
    /* la mano que iba a cruzar un muslo por dentro, lo rodea */
    if (tr && tr.de !== tr.a && !this.busto) E = this.rodear(E, tr, A, B, e, clavos);
    /* de donde estaba a donde va */
    if (this.w < 1 && this.Eprev) {
      this.w = Math.min(1, this.w + dt / this.durW);
      E = mezclar(this.Eprev, E, CURVA.suave(this.w));
    }
    E = this.suave(E, this.despejar(E, clavos), dt, clavos);
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
    /* y cuando dos cosas se cogen en momentos distintos (un asa y después la otra), cada una trae su lista (reposoEn, en su material):
       espera mientras la postura de salida esté en ella; y, si la de llegada también lo está, hasta el final del tramo */
    var dir_ = this;
    this.ctx.enLista = function (l) {
      return !!l && !dir_.busto && ((dir_.modo === 'postura' && l.indexOf(dir_.meta) >= 0) ||
        (dir_.modo === 'sec' && l.indexOf(dir_.secDe) >= 0 && (dir_.secU < 0.97 || l.indexOf(dir_.secA) >= 0)) ||
        (dir_.modo === 'postura' && dir_.w < 0.96 && l.indexOf(dir_.metaPrev) >= 0));
    };
    /* de qué postura sale lo que está haciendo: hay material que va de una manera u otra según el tramo (una toalla que pasa de un pie al otro) */
    this.ctx.de = this.busto ? null : this.modo === 'sec' ? this.secDe : this.modo === 'rep' ? (this.tramo ? this.tramo.de : this.inicio) : this.meta;
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
  /* el aviso sobre lo que nombra el paso: dos ondas que se abren desde el punto y se apagan, como cuando se toca un
     mapa. Dura lo que una mirada (MARCA_DUR): no se queda encima del cuerpo mientras trabaja. Con «reducir
     movimiento», un aro quieto que aparece y se va. */
  var MARCA_DUR = 2.1;
  Director.prototype.marcar = function (nombres) { this.marcas = (nombres || []).filter(function (n) { return PUNTOS[n]; }).slice(0, 4); this.tMarca = this.t; };
  Director.prototype.pintarMarcas = function (E) {
    var cam = this.esc.cam, yo = this, edad = this.t - (this.tMarca || 0) - 0.25, fijo = quieto();
    this.cMarcas.forEach(function (g) {
      var nom = yo.marcas[yo.cMarcas.indexOf(g)];
      if (!nom || yo.busto || edad < 0 || edad > MARCA_DUR) { pon(g, 'opacity', '0'); return; }
      var p = cam.p(PUNTOS[nom](E));
      pon(g, 'transform', 'translate(' + n1(p[0]) + ',' + n1(p[1]) + ')'); pon(g, 'opacity', '1');
      g._o.forEach(function (c, j) {
        /* cada onda: 1,15 s; la segunda sale 0,75 s después */
        var u = fijo ? (j ? -1 : edad / MARCA_DUR) : (edad - j * 0.75) / 1.15;
        if (u < 0 || u > 1) { pon(c, 'opacity', '0'); return; }
        var r = fijo ? 11 : 4 + 13 * (1 - (1 - u) * (1 - u)), op = fijo ? Math.min(1, u * 6, (1 - u) * 3) : Math.min(1, u * 8) * Math.pow(1 - u, 1.4);
        pon(c, 'r', n1(r)); pon(c, 'stroke-width', n2(fijo ? 2.2 : 3 - 1.9 * u)); pon(c, 'opacity', n2(op * 0.95));
      });
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
      /* la cabeza: lo alto del tupé (a 43 cm de la barbilla) y sus lados */
      pts.push(mas(E.cab, aplicar(E.Bc, [0, 43, 3])), mas(E.cab, aplicar(E.Bc, [0, 18, 14])), mas(E.cab, aplicar(E.Bc, [0, 18, -14])), E.pel);
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
      /* una vista es un rumbo, o [rumbo, picado] si esa se mira desde otra altura */
      var pic = r.length ? r[1] : picado; if (r.length) r = r[0];
      cam.rumbo = r; cam.picado = pic; cam.esc = 1; cam.ox = 0; cam.oy = 0; cam.mira = mira; cam.calc();
      var a = [1e9, 1e9], b = [-1e9, -1e9];
      pts.forEach(function (p) { var q = cam.p(p); a[0] = Math.min(a[0], q[0]); a[1] = Math.min(a[1], q[1]); b[0] = Math.max(b[0], q[0]); b[1] = Math.max(b[1], q[1]); });
      var e = entre(Math.min((ANCHO - 36) / (b[0] - a[0] + 12), (ALTO - 96) / (b[1] - a[1] + 8)) * (co.zoom || 1), 0.9, 2.6);
      /* corre: [dx, dy], si lo que importa cae justo bajo las etiquetas de los músculos (en un pino, la cabeza y las manos): el encuadre se corre eso */
      var cr = co.corre || [0, 0];
      return { rumbo: r, picado: pic, esc: e, mira: mira, ox: ANCHO / 2 - (a[0] + b[0]) / 2 * e + cr[0], oy: 58 + (ALTO - 96) / 2 - (a[1] + b[1]) / 2 * e + 4 + cr[1] };
    });
    /* el busto: de frente, de cerca, para saludar y para los consejos */
    this.vBusto = { rumbo: 0, picado: BUSTO.picado, esc: BUSTO.esc, mira: BUSTO.mira, ox: ANCHO / 2, oy: BUSTO.oy };
    this.vista = Math.min(this.vista, this.vistas.length - 1);
    this.salto = true;
  };
  Director.prototype.girar = function () { this.vista = (this.vista + 1) % this.vistas.length; return this.vista; };
  Director.prototype.aBusto = function (si) { if (this.busto !== !!si) { this.busto = !!si; this.salto = true; this.tBusto = 0; this.vida.corte(); this.cortes++; this.ap = null; this.esc.cab.corte = true; } };

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

  /* ───────────────────────── el reproductor ─────────────────────────
     El «vídeo» de un ejercicio: la cabecera (Jérôme saluda), un tramo por cada paso de la ficha
     (el texto del paso, tal cual, debajo; arriba, lo que ese paso describe) y el cierre. Con sus
     mandos: pausa, paso a paso, despacio, girar y la voz del móvil. */
  var ENT_UI = {
    "entCon": {"es": "Jérôme se lo enseña", "en": "Jérôme shows you how", "fr": "Jérôme vous montre", "de": "Jérôme zeigt es Ihnen", "it": "Jérôme Le mostra come", "nl": "Jérôme doet het voor", "zh": "热罗姆为您示范", "zht": "熱羅姆為您示範", "bg": "Жером ще ви покаже", "pl": "Jérôme pokazuje, jak to zrobić"},
    "entVideo": {"es": "Vídeo del ejercicio", "en": "Exercise video", "fr": "Vidéo de l’exercice", "de": "Video zur Übung", "it": "Video dell’esercizio", "nl": "Video van de oefening", "zh": "动作视频", "zht": "動作影片", "bg": "Видео на упражнението", "pl": "Film z ćwiczeniem"},
    "entPaso": {"es": "Paso {n} de {N}", "en": "Step {n} of {N}", "fr": "Étape {n} sur {N}", "de": "Schritt {n} von {N}", "it": "Passo {n} di {N}", "nl": "Stap {n} van {N}", "zh": "第 {n} 步，共 {N} 步", "zht": "第 {n} 步，共 {N} 步", "bg": "Стъпка {n} от {N}", "pl": "Krok {n} z {N}"},
    "entPlay": {"es": "Reproducir", "en": "Play", "fr": "Lire", "de": "Abspielen", "it": "Riproduci", "nl": "Afspelen", "zh": "播放", "zht": "播放", "bg": "Пусни", "pl": "Odtwórz"},
    "entPausa": {"es": "Pausa", "en": "Pause", "fr": "Pause", "de": "Pause", "it": "Pausa", "nl": "Pauze", "zh": "暂停", "zht": "暫停", "bg": "Пауза", "pl": "Pauza"},
    "entAnt": {"es": "Paso anterior", "en": "Previous step", "fr": "Étape précédente", "de": "Vorheriger Schritt", "it": "Passo precedente", "nl": "Vorige stap", "zh": "上一步", "zht": "上一步", "bg": "Предишна стъпка", "pl": "Poprzedni krok"},
    "entSig": {"es": "Paso siguiente", "en": "Next step", "fr": "Étape suivante", "de": "Nächster Schritt", "it": "Passo successivo", "nl": "Volgende stap", "zh": "下一步", "zht": "下一步", "bg": "Следваща стъпка", "pl": "Następny krok"},
    "entLento": {"es": "A cámara lenta", "en": "Slow motion", "fr": "Au ralenti", "de": "Zeitlupe", "it": "Al rallentatore", "nl": "Vertraagd", "zh": "慢动作", "zht": "慢動作", "bg": "Забавен каданс", "pl": "Zwolnione tempo"},
    "entGirar": {"es": "Girar", "en": "Turn", "fr": "Tourner", "de": "Drehen", "it": "Gira", "nl": "Draaien", "zh": "转身", "zht": "轉身", "bg": "Завърти", "pl": "Obróć"},
    "entVozOn": {"es": "Escuchar a Jérôme", "en": "Listen to Jérôme", "fr": "Écouter Jérôme", "de": "Jérôme zuhören", "it": "Ascoltare Jérôme", "nl": "Naar Jérôme luisteren", "zh": "听热罗姆讲解", "zht": "聽熱羅姆講解", "bg": "Гласът на Жером", "pl": "Głos Jérôme’a"},
    "entVozOff": {"es": "Parar la voz", "en": "Stop the voice", "fr": "Arrêter la voix", "de": "Stimme anhalten", "it": "Fermare la voce", "nl": "Stem stoppen", "zh": "停止朗读", "zht": "停止朗讀", "bg": "Спиране на гласа", "pl": "Zatrzymanie głosu"},
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
  /* SIN-TRADUCIR: VOZ_LOCALE — esto no son textos, son los códigos de idioma que espera speechSynthesis (como
     TTS_LOCALE en el tour): «bg-BG» se escribe así o no hay voz. */
  var VOZ_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL' };

  var CSS_V = [
'.tgv { --tv-tinta: var(--tinta, #12233A); --tv-tinta2: var(--tinta-2, #51627A); --tv-fondo: var(--fondo, #EEF3F8); --tv-tarjeta: var(--tarjeta, #FFFFFF); --tv-linea: var(--linea, #D5DFEA); --tv-oro: var(--oro, #8A6A12); --tv-orov: var(--oro-vivo, #D4AF37);',
'  --tv-titulo: var(--font-display, "Cormorant Garamond", Georgia, serif); --tv-texto: var(--font-body, "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif);',
'  display: grid; gap: 10px; min-width: 0; font: 400 15px/1.5 var(--tv-texto); color: var(--tv-tinta); -webkit-tap-highlight-color: transparent; }',
'.tgv *, .tgv *::before, .tgv *::after { box-sizing: border-box; }',
'.tgv[data-tema="noche"] { --tv-tinta: var(--tinta, #F0ECE4); --tv-tinta2: var(--tinta-2, #A8B3C4); --tv-fondo: var(--fondo, #0F1117); --tv-tarjeta: var(--tarjeta, #1B2330); --tv-linea: var(--linea, #2D3A4A); --tv-oro: var(--oro, #F5C76B); }',
'.tgv-escena { position: relative; border-radius: 22px; overflow: hidden; background: #8FA8E6; aspect-ratio: 400 / 460; isolation: isolate; touch-action: manipulation; -webkit-user-select: none; user-select: none; }',
'.tgv-escena .tge-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }',
'.tgv-escena .tgv-lienzo { position: absolute; display: block; pointer-events: none; }',
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
/* la leyenda de músculos: en su fila, debajo del vídeo (dentro del dibujo tapaba a Jérôme: los pies, las manos…).
   En una pantalla baja (un móvil pequeño, o tumbado) pasa detrás de la tarjeta del paso, más abajo: al pulsar «Ver el
   vídeo» ya no cabía todo, y con tres líneas de píldoras el texto del paso se quedaba fuera de la vista (16-11-2026) */
'.tgv-musc { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 6px; min-width: 0; min-height: 23px; margin: -2px 2px; transition: opacity .3s ease; }',
'.tgv-musc span { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; padding: 1px 10px 1px 8px; border-radius: 999px; border: 1px solid var(--tv-linea); background: var(--tv-fondo); color: var(--tv-tinta); font-size: 11.5px; font-weight: 600; line-height: 1.6; overflow-wrap: anywhere; }',
'.tgv-musc i { width: 9px; height: 9px; border-radius: 50%; flex: none; background: #FFD24A; box-shadow: 0 0 0 2px rgba(255,150,60,.75); }',
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
'@media (max-height: 700px) { .tgv-musc { order: 1; } .tgv-mandos { order: 2; } }',
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
    /* en Samsung Internet, el dibujo en un canvas encima del SVG (85-lienzo.js): su modo oscuro no lo repinta */
    this.lienzo = EN_SAMSUNG ? lienzo(this.esc.svg, escena, 0) : null;
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
    /* la leyenda de músculos (se cuelga más abajo, en el pie: aparece y desaparece sin que nada se mueva de sitio) */
    var mus = el('div', 'tgv-musc tgv-oculto'); this.musc = mus;
    var nomb = datos.nombres || {};
    (datos.prim || []).forEach(function (g) { var s = el('span'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    var secs = datos.sec || [], cabenSec = Math.max(1, 4 - (datos.prim || []).length);
    if (secs.length > cabenSec) cabenSec = Math.max(1, cabenSec - 1);
    secs.slice(0, cabenSec).forEach(function (g) { var s = el('span', 'sec'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    if (secs.length > cabenSec) { var mas2 = el('span', 'sec'); mas2.appendChild(el('i')); mas2.appendChild(document.createTextNode('+' + (secs.length - cabenSec))); mas2.title = secs.slice(cabenSec).map(function (g) { return nomb[g] || g; }).join(', '); mus.appendChild(mas2); }
    /* las zonas de toque */
    var zona = function (cls, rot, f) { var b = el('button', 'tgv-zona ' + cls); b.type = 'button'; b.setAttribute('aria-label', rot); b.addEventListener('click', f); escena.appendChild(b); return b; };
    zona('izq', T('entAnt'), function () { yo.irA(yo.n - 1); });
    this.zCen = zona('cen', T('entPausa'), function () { yo.alternar(); });
    zona('der', T('entSig'), function () { yo.irA(yo.n + 1); });
    this.gran = el('button', 'tgv-gran'); this.gran.type = 'button'; this.gran.innerHTML = ICO.play; this.gran.setAttribute('aria-label', T('entPlay'));
    this.gran.addEventListener('click', function () { if (yo.fin) yo.irA(0); yo.reproducir(); });
    escena.appendChild(this.gran);
    this.corte = el('div', 'tgv-corte'); escena.appendChild(this.corte);
    /* debajo: la leyenda de músculos (en su fila: ya no va sobre el dibujo), el paso y los mandos; en una pantalla baja,
       el paso, la leyenda y los mandos (el orden lo cambia la hoja de estilo, no esto) */
    var pie = el('div', 'tgv-pie');
    pie.appendChild(mus);
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
    this.n = 0; this.tt = 0; this.tm = 0; this.suena = false; this.fin = false; this.lento = false; this.conVoz = false; this.antes = 0; this.raf = 0;
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
    /* el reloj del tramo va a la velocidad de lo que se está viendo, que es la del Director. A cámara lenta («½×») el ejercicio va
       más despacio y su paso dura en proporción: se ve lo mismo que a velocidad normal (la secuencia entera, las mismas repeticiones),
       más despacio. De cerca (la cabecera, un consejo, el cierre) no hay ejercicio que mirar despacio: todo va a su velocidad. La
       cortinilla y el cambio de plano que lleva dentro van con el mismo reloj: al dejar un ejercicio, la cortinilla lo tapa a su
       paso (y el ejercicio avanza debajo lo mismo que a velocidad normal); al dejar un plano de cerca, al suyo. A velocidad normal
       dv es dt. tt sigue siendo el tiempo de verdad: el texto y la voz no se frenan */
    var dv = dt * (this.dir.busto ? 1 : this.dir.vel);
    this.tm += dv;
    if (this.pendiente) { this.pendT -= dv; if (this.pendT <= 0) { var g0 = this.pendiente; this.pendiente = null; g0(); } }
    if (this.corteT != null) {
      this.corteT += dv;
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
    var f = entre(this.tm / t.dur, 0, 1);
    t.barra.firstChild.style.width = (f * 100).toFixed(1) + '%';
    if (this.tm >= t.dur && !esperaVoz) {
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
    this.n = n; this.tt = 0; this.tm = 0;
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
    if (this.lienzo) { try { this.lienzo.soltar(); } catch (e) {} this.lienzo = null; }
    if (this.raiz.parentNode) this.raiz.parentNode.removeChild(this.raiz);
  };

  /* ── Samsung Internet: el vídeo en un canvas (12 de noviembre de 2026) ──
     Con su modo oscuro, Samsung Internet repinta a su manera los dibujos SVG y no hace caso de color-scheme: a
     Jérôme le ponía la cara y el pelo casi negros (11-11-2026, el tour, captura de un usuario búlgaro). Lo único que
     deja tal cual es un canvas (probado ese día en un móvil con Samsung Internet 30). Es el mismo arreglo que el del
     tour (lienzo, en modulos/guia.js), traído aquí porque este módulo va solo: allí, el SVG sigue en su sitio y se
     anima igual, pero invisible, y un canvas encima lo copia pieza a pieza (trazados, círculos, elipses y
     rectángulos; colores, degradados, recortes, transparencias y el orden de pintar el borde) cada vez que algo
     cambia, 30 veces por segundo como mucho. Aquí el canvas cubre la escena justa (sin el cuarto de más por lado
     del tour: la escena recorta lo que sobresale) y va justo encima del SVG, debajo de los rótulos y los mandos.
     Si algo fallara al pintar, el SVG vuelve a verse. En los demás navegadores no se toca nada. */
  /* sin navigator (la auditoría carga el módulo fuera del navegador para leer sus coreografías), no es Samsung */
  var EN_SAMSUNG = false;
  try { EN_SAMSUNG = /SamsungBrowser\//.test(navigator.userAgent || ''); } catch (e) {}
  function lienzo(svg, caja, sobra) {
    sobra = sobra > 0 ? sobra : 0;
    if (typeof Path2D === 'undefined' || typeof DOMMatrix === 'undefined' || typeof MutationObserver === 'undefined') return null;
    var cv = document.createElement('canvas'), c = cv.getContext('2d');
    if (!c || !svg || typeof svg.getCTM !== 'function') return null;
    cv.className = 'tgv-lienzo'; cv.setAttribute('aria-hidden', 'true');
    caja.classList.add('tgv-con-lienzo');
    caja.insertBefore(cv, svg.nextSibling);
    svg.style.opacity = '0';
    var rutas = new Map(), grads = {}, libres = [], base = null, pendiente = 0, roto = false, mo = null, ro = null;
    var esc = function (id) { return window.CSS && CSS.escape ? CSS.escape(id) : id; };
    function idDe(v) { var m = /url\(\s*["']?#([^"')]+)["']?\s*\)/.exec(v || ''); return m ? m[1] : null; }
    function num(el, a, d) { var v = el.getAttribute(a); if (v == null || v === '') return d; var n = parseFloat(v); return /%\s*$/.test(v) ? n / 100 : n; }
    function alfa(color, a) {
      var m = /rgba?\(([^)]*)\)/.exec(color || ''); if (!m) return color;
      var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + ((p.length > 3 ? p[3] : 1) * (isFinite(a) ? a : 1)) + ')';
    }
    function ruta(el) {
      var t = el.localName, p;
      if (t === 'path') {
        var d = el.getAttribute('d') || '';
        p = rutas.get(d);
        if (!p) { p = new Path2D(d); if (rutas.size > 600) rutas.clear(); rutas.set(d, p); }
        return p;
      }
      p = new Path2D();
      if (t === 'circle') p.arc(el.cx.baseVal.value, el.cy.baseVal.value, el.r.baseVal.value, 0, 2 * Math.PI);
      else if (t === 'ellipse') p.ellipse(el.cx.baseVal.value, el.cy.baseVal.value, el.rx.baseVal.value, el.ry.baseVal.value, 0, 0, 2 * Math.PI);
      else if (t === 'rect') {
        var x = el.x.baseVal.value, y = el.y.baseVal.value, w = el.width.baseVal.value, h = el.height.baseVal.value;
        var rx = num(el, 'rx', null), ry = num(el, 'ry', null);
        if (rx == null) rx = ry || 0;
        if (ry == null) ry = rx;
        rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
        if (rx > 0 && ry > 0 && p.roundRect) p.roundRect(x, y, w, h, [{ x: rx, y: ry }]); else p.rect(x, y, w, h);
      } else return null;
      return p;
    }
    /* un degradado, leido una vez: sus paradas como las calcula el navegador (stop-color y stop-opacity) */
    function grad(id) {
      if (grads[id] !== undefined) return grads[id];
      var g = svg.querySelector('#' + esc(id)), out = null, antes = 0;
      if (g && (g.localName === 'linearGradient' || g.localName === 'radialGradient')) {
        var paradas = Array.prototype.map.call(g.querySelectorAll('stop'), function (s) {
          var cs = getComputedStyle(s), o = Math.max(antes, Math.min(1, Math.max(0, num(s, 'offset', 0))));
          antes = o;
          return [o, alfa(cs.stopColor, parseFloat(cs.stopOpacity))];
        });
        out = g.localName === 'radialGradient'
          ? { r: true, cx: num(g, 'cx', 0.5), cy: num(g, 'cy', 0.5), rr: num(g, 'r', 0.5), p: paradas }
          : { r: false, x1: num(g, 'x1', 0), y1: num(g, 'y1', 0), x2: num(g, 'x2', 1), y2: num(g, 'y2', 0), p: paradas };
      }
      return (grads[id] = out);
    }
    /* cada contexto lleva su desplazamiento (las capas son del tamaño de su grupo, no del canvas entero) */
    function poner(x, T) { if (x.tgvDx || x.tgvDy) x.setTransform(new DOMMatrix([1, 0, 0, 1, -x.tgvDx, -x.tgvDy]).multiply(T)); else x.setTransform(T); }
    function lleno(x, g, cx, cy, r, x1, y1, x2, y2) {
      var cg = g.r ? x.createRadialGradient(cx, cy, 0, cx, cy, r) : x.createLinearGradient(x1, y1, x2, y2);
      g.p.forEach(function (s) { cg.addColorStop(s[0], s[1]); });
      return cg;
    }
    /* el relleno: con un degradado, en las unidades de la caja de la figura (las de SVG por defecto), recortando la
       figura y llenando su caja: asi sale igual tambien el radial de la cara, que en su caja es una elipse */
    function relleno(x, el, T, p, pint, a, regla) {
      x.save(); poner(x, T); x.globalAlpha = a;
      var id = idDe(pint);
      if (!id) { x.fillStyle = pint; x.fill(p, regla); }
      else {
        var g = grad(id), bb = g && el.getBBox();
        if (g && bb.width > 0 && bb.height > 0) {
          x.clip(p, regla);
          x.transform(bb.width, 0, 0, bb.height, bb.x, bb.y);
          x.fillStyle = lleno(x, g, g.cx, g.cy, g.rr, g.x1, g.y1, g.x2, g.y2);
          x.fillRect(0, 0, 1, 1);
        }
      }
      x.restore();
    }
    /* el trazo; con un degradado, en la caja de la figura (en el tour, el aro: un circulo, con su caja cuadrada) */
    function trazo(x, el, T, p, pint, a, cs) {
      x.save(); poner(x, T); x.globalAlpha = a;
      x.lineWidth = parseFloat(cs.strokeWidth) || 1;
      x.lineCap = cs.strokeLinecap || 'butt';
      x.lineJoin = cs.strokeLinejoin === 'round' || cs.strokeLinejoin === 'bevel' ? cs.strokeLinejoin : 'miter';
      x.miterLimit = parseFloat(cs.strokeMiterlimit) || 4;
      var da = cs.strokeDasharray;
      x.setLineDash(da && da !== 'none' ? da.split(/[\s,]+/).map(parseFloat).filter(function (n) { return n >= 0; }) : []);
      x.lineDashOffset = parseFloat(cs.strokeDashoffset) || 0;
      var id = idDe(pint);
      if (!id) x.strokeStyle = pint;
      else {
        var g = grad(id), bb = g && el.getBBox();
        if (!g || !(bb.width > 0 && bb.height > 0)) { x.restore(); return; }
        var w = bb.width, h = bb.height;
        x.strokeStyle = lleno(x, g, bb.x + g.cx * w, bb.y + g.cy * h, g.rr * Math.max(w, h), bb.x + g.x1 * w, bb.y + g.y1 * h, bb.x + g.x2 * w, bb.y + g.y2 * h);
      }
      x.stroke(p);
      x.restore();
    }
    /* un recorte (clip-path): sus figuras, en el espacio de quien lo usa */
    function recortar(x, el, id) {
      var cp = svg.querySelector('#' + esc(id));
      if (!cp) return;
      var u = new Path2D();
      for (var k = cp.firstElementChild; k; k = k.nextElementSibling) {
        if (getComputedStyle(k).display === 'none') continue;
        var pk = ruta(k);
        if (!pk) continue;
        var tr = k.transform && k.transform.baseVal.consolidate();
        if (tr) u.addPath(pk, tr.matrix); else u.addPath(pk);
      }
      poner(x, base.multiply(el.getCTM()));
      x.clip(u);
    }
    /* un grupo (o una figura con relleno y trazo) con transparencia: aparte, en otra capa, y luego encima */
    function capa(x, a, fn, el) {
      var bb = el.getBBox(), M = base.multiply(el.getCTM()), xs = [], ys = [];
      [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].forEach(function (q) {
        var r = M.transformPoint(new DOMPoint(q[0], q[1])); xs.push(r.x); ys.push(r.y); });
      var m = 12 + 8 * Math.abs(M.a || M.d || 1), x0 = Math.max(0, Math.floor(Math.min.apply(null, xs) - m)), y0 = Math.max(0, Math.floor(Math.min.apply(null, ys) - m));
      var x1 = Math.min(cv.width, Math.ceil(Math.max.apply(null, xs) + m)), y1 = Math.min(cv.height, Math.ceil(Math.max.apply(null, ys) + m));
      if (!(x1 > x0 && y1 > y0)) return;
      var o = libres.pop() || document.createElement('canvas');
      if (o.width < x1 - x0 || o.height < y1 - y0) { o.width = Math.max(o.width, x1 - x0); o.height = Math.max(o.height, y1 - y0); }
      var oc = o.getContext('2d');
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.clearRect(0, 0, x1 - x0, y1 - y0);
      oc.tgvDx = x0; oc.tgvDy = y0;                 // en pixeles del canvas principal, como base
      oc.save(); fn(oc); oc.restore();
      x.save(); poner(x, new DOMMatrix()); x.globalAlpha = a; x.drawImage(o, 0, 0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); x.restore();
      libres.push(o);
    }
    function pieza(el, x) {
      var t = el.localName;
      if (t === 'defs' || t === 'clipPath' || t === 'linearGradient' || t === 'radialGradient' || t === 'title' || t === 'desc' ||
          t === 'style' || t === 'metadata' || t === 'mask' || t === 'pattern' || t === 'filter' || t === 'symbol') return;
      var cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      var op = parseFloat(cs.opacity);
      if (!(op > 0)) return;
      var rec = idDe(cs.clipPath);
      if (t === 'g') {
        var hijos = function (y) {
          y.save();
          if (rec) recortar(y, el, rec);
          for (var h = el.firstElementChild; h; h = h.nextElementSibling) pieza(h, y);
          y.restore();
        };
        if (op < 1) capa(x, op, hijos, el); else hijos(x);
        return;
      }
      if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return;
      var p = ruta(el);
      if (!p) return;
      var f = cs.fill, s = cs.stroke, hayF = !!f && f !== 'none', hayS = !!s && s !== 'none' && parseFloat(cs.strokeWidth) > 0;
      if (!hayF && !hayS) return;
      var T = base.multiply(el.getCTM()), regla = cs.fillRule === 'evenodd' ? 'evenodd' : 'nonzero';
      /* paint-order: stroke (el tronco y los miembros): primero el borde y encima el relleno */
      var antes = /^\s*stroke/.test(cs.paintOrder || '');
      var dibuja = function (y, a) {
        y.save();
        if (rec) recortar(y, el, rec);
        if (hayS && antes) trazo(y, el, T, p, s, a * parseFloat(cs.strokeOpacity), cs);
        if (hayF) relleno(y, el, T, p, f, a * parseFloat(cs.fillOpacity), regla);
        if (hayS && !antes) trazo(y, el, T, p, s, a * parseFloat(cs.strokeOpacity), cs);
        y.restore();
      };
      if (op < 1 && hayF && hayS) capa(x, op, function (y) { dibuja(y, 1); }, el); else dibuja(x, op);
    }
    /* si algo saliera mal, el SVG vuelve a verse tal cual: Jérôme nunca se queda sin dibujar */
    function soltar() {
      roto = true;
      if (mo) mo.disconnect();
      if (ro) ro.disconnect();
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      caja.classList.remove('tgv-con-lienzo');
      svg.style.opacity = '';
    }
    /* el canvas cubre el SVG y, si se pide, «sobra» de mas por cada lado (en el tour, un cuarto: los brazos en alto,
       el aro; aqui nada, la escena recorta lo que sobresale), con sus
       bordes en pixeles enteros de la pantalla y un pixel suyo por cada pixel de ella. Si no, el navegador lo
       reescala al ponerlo y los bordes salen algo blandos al lado de los del SVG, que se pinta justo donde cae. Sus
       medidas van en las del dibujo (sin las transformaciones de fuera): si algo de fuera lo mueve sin avisar, el
       canvas va con el SVG */
    var puesto = '';
    function dibujar() {
      if (roto || !svg.isConnected) return false;
      var cs = getComputedStyle(svg), lw = parseFloat(cs.width), lh = parseFloat(cs.height), sr = svg.getBoundingClientRect();
      if (!(lw > 0 && lh > 0 && sr.width > 0 && sr.height > 0)) return false;
      /* hasta tres pixeles por punto: con dos, en las pantallas de tres (las de muchos moviles de ahora) el navegador
         ampliaria el canvas y Jérôme se veria algo blando al lado del SVG; con mas, pintaria casi el doble. Y nunca
         mas de 4000 pixeles por lado: un Jérôme enorme se pinta con menos detalle, pero se pinta */
      var dpr = Math.min(3, window.devicePixelRatio || 1, 4000 / (sr.width * (1 + 2 * sobra) + 2), 4000 / (sr.height * (1 + 2 * sobra) + 2));
      var s = sr.width / lw, k = dpr * s;
      var X0 = Math.floor((sr.left - sr.width * sobra) * dpr), Y0 = Math.floor((sr.top - sr.height * sobra) * dpr);
      var W = Math.ceil((sr.right + sr.width * sobra) * dpr) - X0, H = Math.ceil((sr.bottom + sr.height * sobra) * dpr) - Y0;
      if (!(W > 0 && H > 0)) return false;
      var u0 = (X0 / dpr - sr.left) / s, v0 = (Y0 / dpr - sr.top) / s;
      var pon = [u0, v0, W / k, H / k].map(function (n) { return n.toFixed(4) + 'px'; });
      if (pon.join() !== puesto) {
        puesto = pon.join();
        cv.style.left = pon[0]; cv.style.top = pon[1]; cv.style.width = pon[2]; cv.style.height = pon[3];
      }
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      /* y el SVG lo pinta el navegador con sus bordes llevados al pixel entero mas cercano de la pantalla (y el dibujo
         estirado a esa medida): el canvas lo copia igual. Sin esto, el dibujo del canvas quedaba hasta medio pixel
         corrido y sus bordes no casaban con los del SVG (medido el 11-11-2026 en el tour) */
      var real = window.devicePixelRatio || 1, q = dpr / real;
      var sx0 = Math.round(sr.left * real) * q, sy0 = Math.round(sr.top * real) * q;
      var sx1 = Math.round(sr.right * real) * q, sy1 = Math.round(sr.bottom * real) * q;
      base = new DOMMatrix([(sx1 - sx0) / lw, 0, 0, (sy1 - sy0) / lh, sx0 - X0, sy0 - Y0]);
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H);
      try {
        for (var h = svg.firstElementChild; h; h = h.nextElementSibling) pieza(h, c);
      } catch (e) { soltar(); return false; }
      return true;
    }
    /* lo que se mueve solo con CSS (las estrellas que titilan, el fundido al cambiar de escena, los efectos de cada
       gesto) no toca el SVG y el observador no lo ve: mientras algo de eso este en marcha, se sigue pintando */
    function anima() {
      try {
        var a = typeof svg.getAnimations === 'function' ? svg.getAnimations({ subtree: true }) : [];
        for (var i = 0; i < a.length; i++) if (a[i].playState === 'running') return true;
      } catch (e) {}
      return false;
    }
    /* como mucho unas 30 veces por segundo: el dibujo se mueve con muelles suaves y en un movil de gama media
       pintarlo a cada fotograma le quitaria tiempo al resto de la pagina */
    var ultimo = 0;
    function tic(ahora) {
      pendiente = 0;
      if (ahora - ultimo < 30) { pedir(); return; }
      ultimo = ahora;
      if (dibujar() && anima()) pedir();
    }
    function pedir() { if (!pendiente && !roto) pendiente = requestAnimationFrame(tic); }
    /* el ambiente cambia sus degradados con el tema (los mismos ids, otros colores): si cambian los hijos, se releen */
    mo = new MutationObserver(function (rs) {
      for (var i = 0; i < rs.length; i++) if (rs[i].type === 'childList') { grads = {}; break; }
      pedir();
    });
    mo.observe(svg, { attributes: true, childList: true, subtree: true });
    mo.observe(caja, { attributes: true });
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(pedir); ro.observe(caja); }
    pedir();
    var api = { dibujar: dibujar, lienzo: cv, soltar: soltar };
    caja.tgvLienzo = api;
    return api;
  }

  /* las huellas de los pasos (las escribe construir.py) */
  var HUELLAS = {"sentadilla-peso-corporal": "0f72185fe02d", "sentadilla-goblet": "73da97f6d857", "sentadilla-trasera-barra": "e702c8abe1af", "subida-escalon": "4fac36ce3594", "sentadilla-isometrica-pared": "8e2837419645", "sentadilla-salto": "6f6ce9019552", "puente-gluteos": "8a4f295635da", "hip-thrust-banco": "4bf6869bc3d6", "zancada-atras": "91b6d2d8138a", "sentadilla-bulgara": "38ca4696ecd0", "peso-muerto-rumano-barra": "d71e381da0f3", "peso-muerto-rumano-mancuernas": "24746a0b8865", "peso-muerto-barra": "ae78e5a380c9", "buenos-dias-sin-peso": "cc90a8d10eeb", "elevacion-talones-de-pie": "60656844dad8", "elevacion-talones-escalon": "103123f89cab", "saltos-pogo": "3799ccfe9d15", "estiramiento-gemelo-pared": "b00f54237b5d", "curl-mancuernas": "9d76339f7662", "curl-martillo": "8295d3c302c7", "curl-barra": "b8a935cd99bc", "fondos-banco": "56a73eb850df", "extension-triceps-polea-cuerda": "8d95e21e0a40", "flexion-diamante": "1aeeb2eb3e59", "press-banca-barra": "6dbb8ef03cde", "flexion": "3c04ca3d61b2", "dominadas": "b789c525d45f", "dominadas-supinas": "221476f1bd1c", "remo-mancuerna-un-brazo": "04b176e1a1b1", "encogimientos-mancuernas": "03217817abba", "remo-invertido": "240cc2ef7370", "face-pull-polea": "5b2372b043ca", "elevaciones-laterales-mancuernas": "43d59ce9f30b", "elevaciones-frontales-mancuernas": "c48e3f6d0d5f", "press-militar-barra": "b99176a99a22", "plancha-antebrazos": "03ef445ab5bb", "crunch-abdominal": "9cc54e9f434b", "bicho-muerto": "07cc5a277f73", "elevacion-rodillas-colgado": "62f974536661", "suspension-barra": "c86ba37f716f"};

  /* ───────────────────────── las coreografías, por trozos (16 de noviembre de 2026) ─────────────────────────
     Este fichero lleva el motor y las coreografías del bloque 1 (70-coreografias.js). Las demás van aparte, un fichero por
     grupo en modulos/entrenador/, y se piden cuando hacen falta: pedir(id) trae el trozo de ese ejercicio (una promesa) y
     hasta entonces tiene(id) dice que no. Así el motor no crece con cada bloque, y al abrir una ficha el móvil solo
     lee las coreografías de su grupo.
     Cada trozo lleva en el nombre la huella de su contenido (pecho.1a2b3c4d.js): este motor pide siempre los suyos, y
     un trozo que cambia es otro fichero. Por eso el service worker los guarda con lo de por defecto («cache primero»,
     como las mallas del 3D) y un motor nunca se junta con un trozo que no se auditó con él.
     Un trozo es una función: recibe del motor lo que usa (NUCLEO: nombres de este fichero), define sus COREO y devuelve
     las huellas de sus pasos. TROZOS y NUCLEO los escribe tools/entrenador/construir.py. */
  var TROZOS = {"pecho": ["pecho.9bf43e42", ["press-banca-mancuernas", "press-inclinado-mancuernas", "press-inclinado-mancuernas-agarre-neutro", "press-declinado-mancuernas", "press-mancuerna-un-brazo", "press-mancuernas-juntas", "press-suelo-mancuernas", "press-inclinado-barra", "press-declinado-barra", "aperturas-mancuernas", "aperturas-inclinadas-mancuernas", "aperturas-declinadas-mancuernas", "apertura-mancuerna-un-brazo", "pullover-mancuerna", "pullover-barra-brazos-flexionados", "cruce-poleas", "cruce-poleas-bajo-alto", "cruce-poleas-alto-bajo", "press-pecho-polea-un-brazo", "aperturas-polea-banco-plano", "aperturas-polea-banco-inclinado", "aperturas-polea-sentado", "flexion-pared", "flexion-inclinada", "flexion-declinada", "flexion-rodillas", "flexion-abierta", "flexion-manos-escalonadas", "flexion-arquero", "flexion-explosiva", "flexion-deficit", "fondos-paralelas", "estiramiento-pecho-sentado", "estiramiento-pecho-marco-puerta", "estiramiento-pecho-pared"]], "dorsal": ["dorsal.18cd6e1c", ["dominadas-agarre-ancho", "dominadas-agarre-neutro", "dominadas-agarre-estrecho", "dominadas-negativas", "dominada-isometrica", "dominadas-parciales", "dominadas-arquero", "dominadas-maquina-de-escribir", "dominadas-comando", "front-lever", "front-lever-agrupado", "dominada-front-lever", "ice-cream-maker", "jalon-al-pecho", "jalon-agarre-estrecho", "jalon-supino", "jalon-agarre-neutro", "jalon-unilateral-cruzado", "jalon-unilateral-rodilla", "jalon-brazos-rectos", "jalon-brazos-rectos-cuerda", "remo-inclinado-mancuernas", "remo-inclinado-barra", "remo-inclinado-barra-supino", "remo-pendlay", "remo-barra-t", "remo-barra-t-agarre-ancho", "remo-helms", "remo-renegado", "remo-meadows", "remo-polea-de-pie-una-mano", "remo-polea-alta-una-mano", "remo-polea-baja-una-mano", "estiramiento-dorsal-rodillas-banco", "estiramiento-dorsal-codos-banco"]], "espalda-alta": ["espalda-alta.0920d36f", ["encogimientos-barra", "encogimientos-polea", "encogimientos-entre-poleas", "encogimiento-silverback", "encogimientos-sin-peso", "remo-sentado-polea", "remo-sentado-polea-agarre-ancho", "remo-sentado-polea-supino", "remo-alto-polea-sentado", "remo-alto-inclinado-mancuernas", "remo-landmine-perpendicular", "remo-pecho-apoyado-mancuernas", "elevacion-plano-escapular", "protraccion-escapular-tumbado", "empaquetado-escapular", "elevacion-trap-3", "angeles-en-pared", "flexion-escapular-pared", "flexion-escapular-cuadrupedia", "dominadas-escapulares", "elevacion-prona-y", "elevacion-prona-t", "elevacion-prona-i", "elevacion-prona-w", "angel-de-nieve-inverso", "superman-mariposa", "estiramiento-trapecio-superior", "estiramiento-elevador-escapula", "estiramiento-nuca", "circulos-hombros"]], "hombros": ["hombros.689c08a8", ["press-hombros-barra-sentado", "press-hombros-mancuernas", "press-hombro-mancuerna-un-brazo", "press-arnold", "press-hombros-inclinado-mancuernas", "press-hombros-rotacion", "push-press", "elevaciones-laterales-sentado", "elevacion-frontal-barra", "elevacion-lateral-polea", "apertura-inversa-polea-un-brazo", "rotacion-externa-polea", "pajaro-polea-inclinado", "elevacion-frontal-polea", "pajaros-mancuernas", "pajaros-tumbado-banco", "pajaro-tumbado-un-brazo", "remo-deltoides-posterior-mancuernas", "remo-deltoides-posterior-barra", "aperturas-inversas-polea", "pajaros-polea-sentado", "rotacion-externa-mancuerna-tumbado", "rotacion-interna-polea", "empuje-isometrico-hombro-pared", "flexion-pica", "flexion-pica-pies-elevados", "flexion-pseudoplancha", "flexion-hindu", "pino-libre", "flexion-pino-pared", "pino-pared", "circulos-brazos", "estiramiento-hombro-cruzado", "estiramiento-durmiente"]], "biceps": ["biceps.1f778db3", ["curl-barra-z", "curl-barra-z-agarre-estrecho", "curl-barra-agarre-ancho", "curl-barra-agarre-estrecho", "curl-invertido-barra", "curl-barra-una-mano", "curl-alterno-mancuernas", "curl-martillo-alterno", "curl-martillo-cruzado", "curl-arrastre", "curl-zottman", "curl-invertido-mancuernas", "curl-kettlebell", "curl-kettlebell-una-mano", "curl-mancuernas-sentado", "curl-inclinado-mancuernas", "curl-tumbado-banco", "curl-arana-mancuernas", "curl-banco-inclinado-de-pie", "curl-concentrado", "curl-concentrado-barra", "curl-predicador-barra", "curl-predicador-mancuerna", "curl-predicador-martillo", "curl-zottman-predicador", "curl-predicador-polea", "curl-arana-barra", "curl-polea-baja", "curl-martillo-polea-cuerda", "curl-polea-una-mano", "curl-polea-alta", "curl-tumbado-polea", "remo-invertido-supino", "curl-biceps-peso-corporal", "muscle-up", "estiramiento-biceps-pared"]], "triceps": ["triceps.bfe5bbc4", ["press-frances-barra-z", "press-frances-barra", "press-frances-mancuernas", "extension-triceps-tumbado-una-mancuerna", "extension-triceps-tumbado-un-brazo", "press-frances-inclinado-mancuernas", "press-frances-declinado-barra-z", "press-frances-declinado-mancuernas", "press-frances-suelo", "extension-triceps-sobre-cabeza-mancuerna", "extension-triceps-sentado-mancuerna", "extension-triceps-un-brazo-mancuerna", "extension-triceps-sobre-cabeza-barra", "patada-triceps-mancuerna", "patada-triceps-dos-mancuernas", "patada-triceps-polea", "patada-triceps-banco-inclinado", "extension-triceps-polea-barra", "extension-triceps-polea-barra-v", "extension-triceps-polea-agarre-inverso", "extension-triceps-polea-un-brazo", "extension-triceps-polea-sobre-cabeza", "extension-triceps-polea-baja-un-brazo", "extension-triceps-polea-tumbado", "press-banca-agarre-cerrado", "press-banca-agarre-inverso", "press-jm", "press-mancuernas-codos-pegados", "press-tate", "fondos-entre-bancos", "fondos-banco-con-rotacion", "fondos-suelo", "fondos-paralelas-triceps", "soporte-paralelas", "flexion-codos-pegados", "flexion-triceps-rodillas-postura-nino", "estiramiento-triceps"]], "antebrazo-pantorrilla": ["antebrazo-pantorrilla.478307b0", ["curl-muneca-barra", "curl-muneca-inverso-barra", "curl-muneca-mancuernas", "curl-muneca-inverso-mancuernas", "desviacion-radial-cubital-peso", "curl-muneca-polea", "flexoextension-muneca-de-pie", "pronacion-supinacion-mancuerna", "paseo-granjero", "paseo-granjero-toalla", "paseo-mancuerna-por-extremo", "dominada-con-toallas", "flexiones-yemas-dedos", "estiramiento-flexores-muneca", "estiramiento-extensores-muneca", "estiramiento-oracion", "elevacion-talon-una-pierna", "elevacion-talones-bajada-una-pierna", "elevacion-talon-una-pierna-escalon", "elevacion-talones-escalon-mancuerna", "elevacion-talones-barra", "elevacion-talones-sentado-barra", "elevacion-talones-sentado-mancuernas", "elevacion-talon-sentado-una-pierna", "elevacion-talones-sentado", "elevacion-tibial-de-pie", "toques-puntas-sentado", "saltos-pogo-altos", "saltos-pogo-laterales", "saltos-laterales-una-pierna", "estiramiento-soleo-pared", "estiramiento-soleo-escalon", "estiramiento-pantorrilla-toalla", "estiramiento-tibial-rodillas", "estiramiento-tobillo-sentado"]], "cuadriceps": ["cuadriceps.0e6985be", ["sentadilla-mancuernas", "sentadilla-prisionero", "sentadilla-sumo-mancuerna", "sentadilla-frontal-mancuernas", "sentadilla-sumo-barra", "sentadilla-al-banco-barra", "sentadilla-frontal-barra", "sentadilla-por-encima-cabeza", "sentadilla-hack-barra", "media-sentadilla-apoyo", "sentadilla-deslizando-pared", "sentadilla-hindu", "sentarse-levantarse", "sentarse-levantarse-pie-adelantado", "extension-rodilla-sentado", "bajada-escalon", "subida-banco-mancuernas", "subida-banco-barra", "sentadilla-una-pierna", "sentadilla-camaron", "sentadilla-pistol", "curl-nordico-inverso", "estiramiento-flexor-cadera-rodillas", "elevacion-pierna-recta", "cuadriceps-isometrico-toalla", "estiramiento-cuadriceps-tumbado", "estiramiento-cuadriceps-de-pie", "salto-rodillas-pecho", "salto-horizontal", "salto-cajon", "impulso-alterno-escalon"]]};          /* { nombre: [el fichero, sin «.js», [sus ejercicios]] }, en el orden de los fuentes */
  var NUCLEO = { ALTO: ALTO, ALTO_BARRA: ALTO_BARRA, ALTO_CANTO: ALTO_CANTO, ALTO_MUN: ALTO_MUN, BANCO_DETRAS: BANCO_DETRAS, BRAZO: BRAZO, C: C, COLGADO: COLGADO, COREO: COREO, D: D, DE_PIE: DE_PIE, EN_BARRA: EN_BARRA, EN_BARRA_SUP: EN_BARRA_SUP, EN_SUELO: EN_SUELO, HOMBRO: HOMBRO, PIE: PIE, PIES_PUNTA: PIES_PUNTA, PLANA_PARED: PLANA_PARED, PRONO: PRONO, PUNO: PUNO, RAD: RAD, SUELTA: SUELTA, SUPINO_SUELO: SUPINO_SUELO, TOB_PUNTA: TOB_PUNTA, V: V, Z_BIS: Z_BIS, aDosBrazos: aDosBrazos, aLocal: aLocal, aLosLados: aLosLados, aUnBrazo: aUnBrazo, abre: abre, activo: activo, agarreDe: agarreDe, anteTronco: anteTronco, aplicar: aplicar, apoyada: apoyada, arco: arco, arcoRodillas: arcoRodillas, bajaSube: bajaSube, bajoZapa: bajoZapa, bancoDe: bancoDe, barraD: barraD, baseEjes: baseEjes, busca: busca, cabezaAPlano: cabezaAPlano, clavosB: clavosB, colgando: colgando, conAgarre: conAgarre, cruz: cruz, cuelga: cuelga, curva: curva, deTalon: deTalon, el: el, enPunta: enPunta, enSuMuslo: enSuMuslo, enSusMuslos: enSusMuslos, entre: entre, estirado: estirado, flexion: flexion, flexionG: flexionG, girar: girar, giroY: giroY, inclinado: inclinado, largo: largo, lejos: lejos, linea: linea, manoEnMuslo: manoEnMuslo, manoHacia: manoHacia, mas: mas, mediaVuelta: mediaVuelta, menos: menos, mezcla: mezcla, miembroAPlano: miembroAPlano, n1: n1, n2: n2, pieSobreSuelo: pieSobreSuelo, plano: plano, por: por, porArco: porArco, punto: punto, puntoEnMuslo: puntoEnMuslo, quieto: quieto, refleja: refleja, reflejo: reflejo, resolver: resolver, sentadoAlBorde: sentadoAlBorde, sentadoEnRespaldo: sentadoEnRespaldo, silla5: silla5, sinParte: sinParte, sobre: sobre, tabla: tabla, tablaAlta: tablaAlta, troncoAPlano: troncoAPlano, tumbadoEn: tumbadoEn, une: une, unidad: unidad, yColgado: yColgado, zapaAPlano: zapaAPlano };
  var IDS_NUCLEO = Object.keys(COREO), TROZO_DE = {}, TROZO_ESTA = {}, TROZO_BASE = '';
  Object.keys(TROZOS).forEach(function (n) { TROZOS[n][1].forEach(function (id) { TROZO_DE[id] = n; }); });
  /* de dónde se piden: de la carpeta que se llama como este fichero (…/modulos/entrenador.js → …/modulos/entrenador/).
     Sin dirección (pegado en una página, o fuera de un navegador), los trozos tienen que venir detrás de él */
  (function () {
    var s = typeof document !== 'undefined' && document.currentScript, u = s && s.src ? String(s.src) : '';
    if (/\.js(?:[?#].*)?$/.test(u)) TROZO_BASE = u.replace(/\.js(?:[?#].*)?$/, '/');
  })();
  function esDe(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function trozoListo(n) { return TROZO_ESTA[n] === true; }
  /* lo llama el fichero del trozo al cargarse: TG_ENTRENADOR._trozo(nombre, función) */
  function recibirTrozo(n, hacer) {
    if (!esDe(TROZOS, n) || trozoListo(n) || typeof hacer !== 'function') return;
    var h = hacer(NUCLEO) || {};
    Object.keys(h).forEach(function (id) { HUELLAS[id] = h[id]; });
    TROZO_ESTA[n] = true;
  }
  function pedirTrozo(n) {
    if (trozoListo(n)) return Promise.resolve(true);
    if (TROZO_ESTA[n]) return TROZO_ESTA[n];
    var p = new Promise(function (ok, mal) {
      if (!TROZO_BASE || typeof document === 'undefined' || !document.head) { mal(new Error('trozo ' + n)); return; }
      var s = document.createElement('script');
      s.src = TROZO_BASE + TROZOS[n][0] + '.js';
      s.onload = function () { if (trozoListo(n)) ok(true); else { s.remove(); mal(new Error('trozo ' + n)); } };
      s.onerror = function () { s.remove(); mal(new Error('trozo ' + n)); };
      document.head.appendChild(s);
    });
    TROZO_ESTA[n] = p;
    /* si no llega, no se queda apuntado: la ficha siguiente lo vuelve a pedir */
    p.then(null, function () { if (TROZO_ESTA[n] === p) delete TROZO_ESTA[n]; });
    return p;
  }
  /* ¿está la coreografía de este ejercicio? (las del bloque 1, siempre; las demás, cuando ha llegado su trozo entero) */
  function coreoDe(id) { return esDe(COREO, id) && (!esDe(TROZO_DE, id) || trozoListo(TROZO_DE[id])) ? COREO[id] : null; }
  /* trae la coreografía de un ejercicio: una promesa que dice si la hay (y falla si su trozo no llega) */
  function pedirCoreo(id) { return esDe(TROZO_DE, id) ? pedirTrozo(TROZO_DE[id]) : Promise.resolve(esDe(COREO, id)); }
  function idsTodos() { var l = IDS_NUCLEO.slice(); Object.keys(TROZOS).forEach(function (n) { l = l.concat(TROZOS[n][1]); }); return l; }

  /* ───────────────────────── lo que sale del módulo ───────────────────────── */
  window.TG_ENTRENADOR = {
    version: 4,
    /* (16-11-2026) trae la coreografía de un ejercicio, si no está ya: las del bloque 1 van con el motor y las demás
       por grupos, en modulos/entrenador/ (95-trozos.js). Una promesa: dice si el ejercicio tiene coreografía, y falla si
       su trozo no llega (sin conexión y sin haberlo guardado). Se llama antes de tiene() y de montar(). */
    pedir: function (id) { return pedirCoreo(id); },
    /* ¿tiene vídeo este ejercicio? Con n (los pasos que trae su ficha), solo si son los mismos que se
       coreografiaron: si la ficha cambia de pasos, el vídeo deja de salir hasta que se revise.
       Dice que no mientras su trozo no haya llegado (pedir). */
    tiene: function (id, n) { var co = coreoDe(id); return !!co && (n == null || (co.pasos || []).length === n); },
    /* todos los ejercicios con coreografía, hayan llegado o no sus trozos */
    ids: function () { return idsTodos(); },
    /* los ficheros de los trozos (sin «.js»), y todos de una vez (para las herramientas y la muestra) */
    trozos: function () { return Object.keys(TROZOS).map(function (n) { return TROZOS[n][0]; }); },
    todo: function () { return Promise.all(Object.keys(TROZOS).map(pedirTrozo)).then(function () { return true; }); },
    _trozo: recibirTrozo,
    /* monta el vídeo de un ejercicio en una caja; devuelve el reproductor (reproducir, pausar, irA, tema, quitar) o null */
    montar: function (caja, datos, opc) { return datos && this.tiene(datos.id, (datos.pasos || []).length) ? new Reproductor(caja, datos, opc) : null; },
    textos: ENT_UI,
    /* ¿se pinta en un canvas? (Samsung Internet: 85-lienzo.js) */
    samsung: EN_SAMSUNG,
    /* qué voz usaría el vídeo en este aparato para un idioma, y cuáles enseña el navegador (para saber por qué suena como suena) */
    voces: function (idioma) {
      var v = vocesDe(idioma);
      return { locale: v.locale, elegida: v.voz ? String(v.voz.name) : null, sistema: v.sistema,
        lista: v.lista.map(function (q) { return { nombre: String(q.name), lang: String(q.lang), uri: String(q.voiceURI), local: q.localService !== false, nota: notaVoz(q, v.locale.toLowerCase()) }; }) };
    },
    /* la huella de los pasos en castellano con los que se hizo cada coreografía (la coteja tools/auditar_entrenador.js) */
    huellas: HUELLAS,
    _: { resolver: resolver, mezclar: mezclar, clavar: clavar, munecaPara: munecaPara, armar: armar, Escenario: Escenario, Director: Director, Camara: Camara, D: D, C: C, CURVA: CURVA, COREO: COREO, MATERIAL: MATERIAL, PRESENTA: PRESENTA, GESTOS: GESTOS, GESTOS_DE: GESTOS_DE, Vida: Vida, bajoZapa: bajoZapa, manoAPlano: manoAPlano, bolasMano: bolasMano, zapaAPlano: zapaAPlano, miembroAPlano: miembroAPlano, troncoAPlano: troncoAPlano, cabezaAPlano: cabezaAPlano, manoEnMuslo: manoEnMuslo, apartaMano: apartaMano, BUSTO: BUSTO, ANCHO: ANCHO, ALTO: ALTO, PUNTOS: PUNTOS, EMO: EMO, Reproductor: Reproductor, SECC: SECC, MARCA_DUR: MARCA_DUR }
  };

})();
