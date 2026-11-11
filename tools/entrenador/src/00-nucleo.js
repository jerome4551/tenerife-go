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
