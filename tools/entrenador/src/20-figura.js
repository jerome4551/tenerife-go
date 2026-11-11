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
