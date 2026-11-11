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
    n1: '#EE5F7E', n2: '#FFA04A', n3: '#FFE48A'
  };
  /* un color entre dos */
  function tinte(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), r = function (s) { return Math.round(((x >> s) & 255) + ((((y >> s) & 255) - ((x >> s) & 255)) * t)); };
    return '#' + ((1 << 24) + (r(16) << 16) + (r(8) << 8) + r(0)).toString(16).slice(1);
  }
  var LEJOS = '#232a45';
  function lejos(c) { return tinte(c, LEJOS, 0.2); }

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
  /* la forma de un hueso colgante: perfiles [y, semiancho], simétrica, con los extremos planos (los redondean las rótulas) */
  function formaHueso(perf) {
    var D2 = perf.map(function (q) { return [q[1], q[0]]; }), I = perf.slice().reverse().map(function (q) { return [-q[1], q[0]]; });
    return 'M' + n1(D2[0][0]) + ',' + n1(D2[0][1]) + curva(D2) + 'L' + n1(I[0][0]) + ',' + n1(I[0][1]) + curva(I) + 'z';
  }
  function ladosHueso(perf) {
    var D2 = perf.map(function (q) { return [q[1], q[0]]; }), I = perf.map(function (q) { return [-q[1], q[0]]; });
    return 'M' + n1(D2[0][0]) + ',' + n1(D2[0][1]) + curva(D2) + 'M' + n1(I[0][0]) + ',' + n1(I[0][1]) + curva(I);
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

  /* los perfiles de cada hueso, en centímetros */
  var PERF = {
    brazo: [[0, 5.6], [8, 6.0], [17, 5.3], [27, 4.5]],
    manga: [[-1, 6.5], [6, 6.7], [12.5, 6.5]],
    ante: [[0, 4.5], [6, 5.0], [14, 4.2], [24, 3.2]],
    muslo: [[0, 9.4], [11, 9.6], [26, 7.8], [40, 6.0]],
    pernera: [[-1, 10.1], [10, 10.3], [20, 9.9]],
    pierna: [[0, 5.9], [9, 6.3], [21, 5.1], [33, 3.7], [38, 3.6]],
    calcetin: [[31, 4.1], [38, 3.95]]
  };
  /* las secciones del tronco: marco (p, pelvis; l, lumbar; t, tórax), altura, semiancho, semifondo y centro en z */
  var SECC = [
    ['p', -10, 8.6, 8.2, 0.4], ['p', -3.5, 17.6, 12.6, -1.6], ['p', 4.5, 16.4, 11.6, -0.8],
    ['l', 3.5, 14.6, 10.6, 0.0],
    ['t', 1.5, 15.8, 11.4, 0.7], ['t', 11.5, 18.4, 12.9, 1.6], ['t', 19.5, 19.6, 11.0, 0.5], ['t', 23.6, 14.8, 8.6, -0.2], ['t', 26, 9.4, 7.2, -0.6]
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
  /* los de los miembros: [grupo, hueso, cara (1, la de delante; -1, la de atrás; 0, todo), y de, y a, semiancho] */
  var PARCHES_M = [
    ['hombros', 'brazo', 0, -5.4, 7.6, 6.8],
    ['biceps', 'brazo', 1, 6, 23.5, 5.0], ['triceps', 'brazo', -1, 5, 24.5, 5.0],
    ['antebrazo', 'ante', 0, 1.5, 18.5, 4.6],
    ['cuadriceps', 'muslo', 1, 6, 37, 8.0], ['isquios', 'muslo', -1, 7, 36, 7.6],
    ['pantorrilla', 'pierna', -1, 3, 23, 5.6]
  ];
  var GRUPOS = ['pecho', 'dorsal', 'espalda_alta', 'hombros', 'biceps', 'triceps', 'antebrazo', 'core', 'gluteos', 'cuadriceps', 'isquios', 'pantorrilla'];

  var N_FIG = 0;
  /* ───────────────────────── Jérôme, de cuerpo entero ─────────────────────────
     Se crea una vez (sus piezas son nodos de SVG) y en cada cuadro solo se mueven: los huesos
     son dibujos colgantes que se colocan con una matriz; el tronco, las manos y los pies se
     vuelven a trazar. */
  function Figura(defs) {
    var u = 'tge' + (++N_FIG);
    this.u = u;
    var id = function (n) { return u + '-' + n; }, url = function (n) { return 'url(#' + u + '-' + n + ')'; };
    this.url = url;
    /* ── las pinturas: cada una, con su versión «de lejos» (el brazo y la pierna del otro lado) ── */
    var grad = function (n, x1, y1, x2, y2, paradas, deUsuario) {
      [0, 1].forEach(function (far) {
        var g = crear('linearGradient', { id: id(n + (far ? 'L' : '')), x1: x1, y1: y1, x2: x2, y2: y2 }, defs);
        if (deUsuario) g.setAttribute('gradientUnits', 'userSpaceOnUse');
        paradas.forEach(function (p) { crear('stop', { offset: p[0], 'stop-color': far ? lejos(p[1]) : p[1] }, g); });
      });
    };
    /* la piel de un hueso: de lado a lado, como un cilindro con la luz un poco a la izquierda */
    var pielDe = function (n, w) { grad(n, -w, 0, w, 0, [[0, C.pielS], [0.3, C.pielL], [0.62, C.piel], [1, C.pielSS]], true); };
    pielDe('pb', 6.2); pielDe('pa', 5.2); pielDe('pm', 9.9); pielDe('pp', 6.5);
    grad('manga', -6.9, 0, 6.9, 0, [[0, C.cami], [0.34, tinte(C.cami, C.camiL, 0.75)], [0.7, C.cami], [1, C.camiS]], true);
    grad('pern', -10.5, 0, 10.5, 0, [[0, C.pant], [0.32, C.pantL], [0.66, C.pant], [1, C.pantS]], true);
    grad('calc', -4.2, 0, 4.2, 0, [[0, '#e6e2d6'], [0.35, '#ffffff'], [1, '#cfcabb']], true);
    grad('cami', 0, 0, 0, 1, [[0, C.camiL], [0.4, C.cami], [1, C.camiS]]);
    grad('pant', 0, 0, 0, 1, [[0, C.pantL], [0.45, C.pant], [1, C.pantS]]);
    grad('zapa', 0, 0, 0, 1, [[0, '#ffffff'], [0.6, C.zapa], [1, C.zapaS]]);
    grad('mano', 0, 0, 1, 1, [[0, C.pielL], [0.55, C.piel], [1, C.pielS]]);

    /* los músculos que trabajan: una mancha de calor (amarillo con borde naranja, como el nivel alto del maniquí) y, los secundarios, rosa */
    [['mus3', [[0, '#FFF6CF', 0.98], [0.42, C.n3, 0.95], [0.8, C.n2, 0.82], [1, C.n2, 0]]], ['mus1', [[0, '#FFA0B4', 0.86], [0.6, C.n1, 0.74], [1, C.n1, 0]]]].forEach(function (m) {
      var g = crear('radialGradient', { id: id(m[0]), cx: 0.5, cy: 0.5, r: 0.5 }, defs);
      m[1].forEach(function (p) { crear('stop', { offset: p[0], 'stop-color': p[1], 'stop-opacity': p[2] }, g); });
    });
    var T = ' stroke="' + C.pielT + '" stroke-opacity=".42" stroke-width="1" vector-effect="non-scaling-stroke" fill="none" stroke-linecap="round"';
    this.P = {};        /* las piezas: cada una, un nodo; en cada cuadro se le da su fondo para ordenarlas */
    var P = this.P;
    var grupo = function (n, html) { var g = crear('g', { 'class': 'tge-' + n }); g.innerHTML = html; P[n] = g; return g; };
    var pinta = function (n) { return ' fill="' + url(n) + '" data-p="' + n + '"'; };
    /* una rótula que no se aplasta: dentro del hueso, deshace su escala a lo largo */
    var rotula = function (y, r, n) { return '<g class="tge-rot" data-y="' + y + '"><circle r="' + r + '"' + pinta(n) + '/></g>'; };
    var parche = function (hueso) {
      return PARCHES_M.filter(function (m) { return m[1] === hueso; }).map(function (m) {
        var cy = (m[3] + m[4]) / 2, ry = (m[4] - m[3]) / 2;
        return '<g class="tge-mus" data-g="' + m[0] + '" data-cara="' + m[2] + '" opacity="0"><path d="' + elipse(0, cy, m[5] * 1.12, ry * 1.08) + '"/></g>';
      }).join('');
    };
    LADOS.forEach(function (k) {
      /* el muslo, con la pernera del pantalón y su raya */
      grupo('muslo' + k,
        '<clipPath id="' + id('cm' + k) + '"><path d="' + formaHueso([[-11, 10.2], [0, 10.2], [11, 9.6], [26, 7.8], [40, 6.0], [46, 6.0]]) + '"/></clipPath>' +
        rotula(40, 6.0, 'pm') + '<path d="' + formaHueso(PERF.muslo) + '"' + pinta('pm') + '/><path d="' + ladosHueso(PERF.muslo) + '"' + T + '/>' +
        '<g clip-path="' + url('cm' + k) + '">' + parche('muslo') + '</g>' +
        rotula(0, 10.1, 'pern') + '<path d="' + formaHueso(PERF.pernera) + '"' + pinta('pern') + '/>' +
        '<path d="M-9.9,20 Q0,23.6 9.9,20 L10,17.3 Q0,20.9 -10,17.3z" fill="' + C.pantS + '" opacity=".5"/>' +
        '<path class="tge-raya" d="M0,-3 L0,19.6" stroke="' + C.oro + '" stroke-width="1.6" stroke-linecap="round"/>');
      /* la pierna, con el calcetín */
      grupo('pierna' + k,
        '<clipPath id="' + id('cp' + k) + '"><path d="' + formaHueso([[-6, 6.2], [0, 5.9], [9, 6.3], [21, 5.1], [33, 3.7], [38, 3.6]]) + '"/></clipPath>' +
        rotula(0, 5.95, 'pp') + '<path d="' + formaHueso(PERF.pierna) + '"' + pinta('pp') + '/><path d="' + ladosHueso(PERF.pierna) + '"' + T + '/>' +
        '<g clip-path="' + url('cp' + k) + '">' + parche('pierna') + '</g>' +
        rotula(38, 4.0, 'calc') + '<path d="' + formaHueso(PERF.calcetin) + '"' + pinta('calc') + '/>' +
        '<path d="M-4,32.8 h8 M-4,34.6 h8" stroke="' + C.pant + '" stroke-width="0.95"/>');
      /* el brazo, con la manga */
      grupo('brazo' + k,
        '<clipPath id="' + id('cb' + k) + '"><path d="' + formaHueso([[-9, 6.9], [0, 6.7], [8, 6.3], [17, 5.3], [27, 4.5], [31, 4.5]]) + '"/></clipPath>' +
        rotula(27, 4.55, 'pb') + '<path d="' + formaHueso(PERF.brazo) + '"' + pinta('pb') + '/><path d="' + ladosHueso(PERF.brazo) + '"' + T + '/>' +
        rotula(0, 6.6, 'manga') + '<path d="' + formaHueso(PERF.manga) + '"' + pinta('manga') + '/>' +
        '<path d="M-6.5,12.5 Q0,15.2 6.5,12.5 L6.55,10.6 Q0,13.3 -6.55,10.6z" fill="' + C.camiL + '" opacity=".7"/>' +
        '<g clip-path="' + url('cb' + k) + '">' + parche('brazo') + '</g>');
      grupo('ante' + k,
        '<clipPath id="' + id('ca' + k) + '"><path d="' + formaHueso([[-5, 4.8], [0, 4.5], [6, 5.0], [14, 4.2], [24, 3.2], [27, 3.2]]) + '"/></clipPath>' +
        rotula(0, 4.55, 'pa') + rotula(24, 3.25, 'pa') + '<path d="' + formaHueso(PERF.ante) + '"' + pinta('pa') + '/><path d="' + ladosHueso(PERF.ante) + '"' + T + '/>' +
        '<g clip-path="' + url('ca' + k) + '">' + parche('ante') + '</g>');
      /* la mano y el pie se trazan en cada cuadro */
      grupo('mano' + k,
        '<path class="tge-m-pulgar" d=""' + pinta('mano') + ' stroke="' + C.pielT + '" stroke-opacity=".45" stroke-width=".8"/>' +
        '<path class="tge-m-dedo" d=""' + pinta('mano') + ' stroke="' + C.pielT + '" stroke-opacity=".45" stroke-width=".8"/>' +
        '<path class="tge-m-palma" d=""' + pinta('mano') + ' stroke="' + C.pielT + '" stroke-opacity=".45" stroke-width=".8"/>' +
        '<path class="tge-m-rayas" d="" fill="none" stroke="' + C.pielT + '" stroke-width=".8" stroke-linecap="round" opacity=".5"/>');
      grupo('pie' + k,
        '<path class="tge-suela" d="" fill="' + C.suela + '"/>' +
        '<path class="tge-zapa" d=""' + pinta('zapa') + ' stroke="#bdb7a6" stroke-width=".7"/>' +
        '<path class="tge-franja" d="" fill="none" stroke="' + C.oroS + '" stroke-linecap="round"/>' +
        '<path class="tge-cordon" d="" fill="none" stroke="' + C.pant + '" stroke-linecap="round"/>');
    });
    /* el tronco: el pantalón, la camiseta (con su estampado y sus músculos) y el cuello */
    grupo('pantalon', '<path class="tge-f" d="" fill="' + url('pant') + '" stroke="' + C.pantS + '" stroke-width=".8" stroke-linejoin="round"/>' +
      '<clipPath id="' + id('cpan') + '"><path class="tge-rec" d=""/></clipPath><g class="tge-parches" clip-path="' + url('cpan') + '"></g>' +
      '<path class="tge-cint" d="" fill="none" stroke="' + C.pantS + '" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>');
    grupo('camiseta', '<path class="tge-f" d="" fill="' + url('cami') + '" stroke="' + C.camiS + '" stroke-width=".8" stroke-linejoin="round"/>' +
      '<clipPath id="' + id('ccam') + '"><path class="tge-rec" d=""/></clipPath>' +
      '<g clip-path="' + url('ccam') + '"><g class="tge-estampa">' +
        '<path d="M-6.4,-3.4 L-2.2,2.6 L-0.5,4.1 L1,2.6 L2.7,3.9 L4.4,2.2 L7.8,-3.4z" fill="#f6f2e8"/>' +
        '<path d="M-7.4,-4.4 h16" stroke="' + C.oro + '" stroke-width="0.9" stroke-linecap="round"/>' +
        '<g fill="#ff7a45"><circle cx="-9" cy="0" r=".75"/><circle cx="-7.2" cy="2.6" r=".45"/><circle cx="9.4" cy=".4" r=".6"/><circle cx="7.3" cy="4.3" r=".4"/></g>' +
        '<g fill="#4fb3ff"><circle cx="10.2" cy="-2.4" r=".7"/><circle cx="-10.2" cy="-3" r=".5"/><circle cx="-4.3" cy="4.8" r=".38"/></g>' +
      '</g><g class="tge-parches"></g></g>' +
      '<path class="tge-escote" d="" fill="none" stroke="' + C.camiL + '" stroke-width="2.4" stroke-linecap="round"/>');
    grupo('cuello', '<path class="tge-f" d="" fill="none" stroke="' + C.pielS + '" stroke-linecap="round"/><path class="tge-f2" d="" fill="none" stroke="' + C.piel + '" stroke-linecap="round"/>');
    /* los parches de músculo del tronco */
    this.parches = PARCHES.map(function (m) {
      var cont = (m[1] === 'p' ? P.pantalon : P.camiseta).querySelector('.tge-parches');
      var g = crear('g', { 'class': 'tge-mus', 'data-g': m[0], opacity: 0 }, cont);
      crear('path', { d: m[4] }, g);
      return { g: g, marco: m[1], o: m[2], n: unidad(m[3]) };
    });
    Object.keys(P).forEach(function (n) {
      var g = P[n];
      g._rot = Array.prototype.slice.call(g.querySelectorAll('.tge-rot'));
      g._mus = Array.prototype.slice.call(g.querySelectorAll('.tge-mus'));
      g._pint = Array.prototype.slice.call(g.querySelectorAll('[data-p]'));
      g._raya = g.querySelector('.tge-raya');
      g._q = {};
      Array.prototype.forEach.call(g.querySelectorAll('[class]'), function (e) { g._q[e.getAttribute('class')] = e; });
    });
    this.lejos = {};
    this.pulso = 1;          /* cuánto brillan los músculos ahora mismo (el motor lo sube en el esfuerzo) */
    this.musculos([], []);
  }
  /* qué músculos se encienden: principales (amarillo) y secundarios (rosa), como en el maniquí de la ficha */
  Figura.prototype.musculos = function (prim, sec) {
    var nv = {}, yo = this;
    (sec || []).forEach(function (g) { nv[g] = 1; });
    (prim || []).forEach(function (g) { nv[g] = 3; });
    Object.keys(this.P).forEach(function (n) {
      yo.P[n]._mus.forEach(function (g) {
        var q = nv[g.getAttribute('data-g')] || 0;
        g._nivel = q; g.setAttribute('fill', yo.url(q === 3 ? 'mus3' : 'mus1')); g.style.display = q ? '' : 'none';
      });
    });
  };
  /* la pieza del otro lado, más oscura: se le cambian las pinturas */
  Figura.prototype.oscurecer = function (n, si) {
    if (this.lejos[n] === si) return;
    this.lejos[n] = si;
    var g = this.P[n], u = this.url;
    g._pint.forEach(function (e) { e.setAttribute('fill', u(e.getAttribute('data-p') + (si ? 'L' : ''))); });
  };

  /* coloca un hueso colgante entre dos puntos de la pantalla */
  function colocar(g, A, B, L, esc) {
    var dx = B[0] - A[0], dy = B[1] - A[1], l = Math.sqrt(dx * dx + dy * dy), f = Math.max(0.04, l / (L * esc));
    var c = l > 1e-3 ? dy / l : 1, s = l > 1e-3 ? -dx / l : 0;     /* el coseno y el seno del giro */
    pon(g, 'transform', 'matrix(' + n2(esc * c) + ',' + n2(esc * s) + ',' + n2(-esc * f * s) + ',' + n2(esc * f * c) + ',' + n1(A[0]) + ',' + n1(A[1]) + ')');
    var inv = n2(1 / f);
    for (var i = 0; i < g._rot.length; i++) pon(g._rot[i], 'transform', 'translate(0,' + g._rot[i].getAttribute('data-y') + ') scale(1,' + inv + ')');
  }
  /* de qué lado del hueso (en su dibujo) asoma una dirección del mundo, y cuánto mira a la cámara */
  function ladoDe(dir, A3, B3, cam) {
    var eje = unidad(menos(B3, A3)), x3 = unidad(cruz(eje, cam.k), [1, 0, 0]);
    var e2 = cam.d(eje), x2 = cam.d(x3), sg = (x2[0] * e2[1] - x2[1] * e2[0]) >= 0 ? 1 : -1;
    return [punto(dir, x3) * sg, punto(dir, cam.k)];
  }
  /* el parche de una cara del hueso: se corre hacia el lado por donde asoma esa cara y se estrecha si se ve de canto */
  function caraHueso(g, frente, A3, B3, cam, pulso, medio) {
    if (!g._mus.length) return;
    var ld = null;
    for (var i = 0; i < g._mus.length; i++) {
      var m = g._mus[i]; if (!m._nivel) continue;
      var cara = Number(m.getAttribute('data-cara')), op = 1, tr = '';
      if (cara) {
        ld = ld || ladoDe(frente, A3, B3, cam);
        var h = ld[1] * cara;
        op = entre((h + 0.6) / 0.6, 0, 1);
        tr = 'translate(' + n2(ld[0] * cara * medio * 0.6) + ',0) scale(' + n2(0.55 + 0.45 * Math.max(0, h)) + ',1)';
      }
      pon(m, 'transform', tr);
      pon(m, 'opacity', n2(op * (m._nivel === 3 ? 1 : 0.9) * pulso));
    }
  }

  /* Pinta el esqueleto E visto por la cámara: mueve las piezas y deja en la lista lo que hay que ordenar. */
  Figura.prototype.pintar = function (E, cam, lista) {
    var P = this.P, esc = cam.esc, yo = this, pulso = this.pulso;
    var bases = { p: [E.Bp, E.pel], l: [E.Bl, E.lum], t: [E.Bt, E.tor] };
    /* ── el tronco: las secciones, proyectadas ── */
    var cen = [], izq = [], der = [], i, n = SECC.length;
    for (i = 0; i < n; i++) cen.push(cam.p(mas(bases[SECC[i][0]][1], aplicar(bases[SECC[i][0]][0], [0, SECC[i][1], SECC[i][4]]))));
    for (i = 0; i < n; i++) {
      var a = cen[Math.max(0, i - 1)], b = cen[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.sqrt(tx * tx + ty * ty) || 1;
      var nx = -ty / tl, ny = tx / tl, Bm = bases[SECC[i][0]][0];
      var U = cam.d(Bm[0]), W = cam.d(Bm[2]);
      var un = (U[0] * nx + U[1] * ny) * SECC[i][2], wn = (W[0] * nx + W[1] * ny) * SECC[i][3], r = Math.sqrt(un * un + wn * wn) || 1e-6;
      /* el punto de apoyo de la elipse en la dirección n */
      var sx = (U[0] * SECC[i][2] * un + W[0] * SECC[i][3] * wn) / r * esc, sy = (U[1] * SECC[i][2] * un + W[1] * SECC[i][3] * wn) / r * esc;
      izq.push([cen[i][0] + sx, cen[i][1] + sy]); der.push([cen[i][0] - sx, cen[i][1] - sy]);
    }
    /* el pantalón: de la entrepierna a la cintura, redondeado por abajo */
    var Lp = izq.slice(0, 4), Rp = der.slice(0, 4).reverse(), e0 = [cen[0][0] - cen[1][0], cen[0][1] - cen[1][1]];
    var dPan = 'M' + n1(Lp[0][0]) + ',' + n1(Lp[0][1]) + curva(Lp) + 'L' + n1(Rp[0][0]) + ',' + n1(Rp[0][1]) + curva(Rp) +
      'Q' + n1(cen[0][0] + e0[0] * 0.5) + ',' + n1(cen[0][1] + e0[1] * 0.5) + ' ' + n1(Lp[0][0]) + ',' + n1(Lp[0][1]) + 'z';
    pon(P.pantalon._q['tge-f'], 'd', dPan); pon(P.pantalon._q['tge-rec'], 'd', dPan);
    pon(P.pantalon._q['tge-cint'], 'd', 'M' + n1(izq[3][0]) + ',' + n1(izq[3][1]) + ' L' + n1(der[3][0]) + ',' + n1(der[3][1]));
    /* la camiseta: de la cintura (un poco por debajo) al cuello */
    var bajo = [(izq[2][0] + izq[3][0]) / 2, (izq[2][1] + izq[3][1]) / 2], bajoD = [(der[2][0] + der[3][0]) / 2, (der[2][1] + der[3][1]) / 2];
    var L2 = [bajo].concat(izq.slice(3)), R2 = der.slice(3).reverse().concat([bajoD]);
    var dCam = 'M' + n1(L2[0][0]) + ',' + n1(L2[0][1]) + curva(L2) + 'L' + n1(R2[0][0]) + ',' + n1(R2[0][1]) + curva(R2) +
      'Q' + n1((bajo[0] + bajoD[0]) / 2 + (cen[2][0] - cen[3][0]) * 0.35) + ',' + n1((bajo[1] + bajoD[1]) / 2 + (cen[2][1] - cen[3][1]) * 0.35) + ' ' + n1(bajo[0]) + ',' + n1(bajo[1]) + 'z';
    pon(P.camiseta._q['tge-f'], 'd', dCam); pon(P.camiseta._q['tge-rec'], 'd', dCam);
    /* el escote: una curva bajo el cuello, por delante (solo si se ve el pecho) */
    var kt = cam.d(E.Bt[2])[2], esco = P.camiseta._q['tge-escote'];
    if (kt > 0.12) {
      var e1 = cam.p(mas(E.tor, aplicar(E.Bt, [7.6, 25.6, 3.4]))), e2 = cam.p(mas(E.tor, aplicar(E.Bt, [-7.6, 25.6, 3.4]))), e3 = cam.p(mas(E.tor, aplicar(E.Bt, [0, 20.6, 9.2])));
      pon(esco, 'd', 'M' + n1(e1[0]) + ',' + n1(e1[1]) + ' Q' + n1(e3[0]) + ',' + n1(e3[1]) + ' ' + n1(e2[0]) + ',' + n1(e2[1]));
      pon(esco, 'opacity', n2(entre((kt - 0.12) * 3, 0, 1)));
    } else pon(esco, 'opacity', '0');
    /* el estampado: un plano pegado al pecho */
    var est = P.camiseta._q['tge-estampa'];
    if (kt > 0.1) {
      var o = cam.p(mas(E.tor, aplicar(E.Bt, [0, 8.5, 12.4]))), X = cam.d(E.Bt[0]), Y = cam.d(E.Bt[1]), ke = esc * 0.92;
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
    var zTor = cam.p(mas(E.tor, aplicar(E.Bt, [0, 11, 0])))[2], zPel = cam.p(E.pel)[2];
    lista.push({ z: zPel, el: P.pantalon }, { z: zTor + 0.4, el: P.camiseta });
    /* el cuello */
    var c1 = cam.p(mas(E.tor, aplicar(E.Bt, [0, 23.5, -0.6]))), c2 = cam.p(mas(E.cab, aplicar(E.Bc, [0, 3, 0])));
    var dc = 'M' + n1(c1[0]) + ',' + n1(c1[1]) + ' L' + n1(c2[0]) + ',' + n1(c2[1]);
    pon(P.cuello._q['tge-f'], 'd', dc); pon(P.cuello._q['tge-f'], 'stroke-width', n1(13 * esc)); pon(P.cuello._q['tge-f2'], 'd', dc); pon(P.cuello._q['tge-f2'], 'stroke-width', n1(9.6 * esc));
    lista.push({ z: (c1[2] + c2[2]) / 2 - 0.5, el: P.cuello });

    /* ── los brazos y las piernas ── */
    var zc = { i: cam.p(E.i.cad)[2], d: cam.p(E.d.cad)[2] }, zh = { i: cam.p(E.i.hom)[2], d: cam.p(E.d.hom)[2] };
    LADOS.forEach(function (k) {
      var L = E[k], o = k === 'i' ? 'd' : 'i';
      /* del otro lado y por detrás: más oscuro (con un margen, para que no parpadee) */
      var lp = zc[o] - zc[k], lb = zh[o] - zh[k];
      var farP = yo.lejos['muslo' + k] ? lp > 3 : lp > 6, farB = yo.lejos['brazo' + k] ? lb > 4 : lb > 8;
      ['muslo', 'pierna', 'pie'].forEach(function (q) { yo.oscurecer(q + k, farP); });
      ['brazo', 'ante', 'mano'].forEach(function (q) { yo.oscurecer(q + k, farB); });
      var cad = cam.p(L.cad), rod = cam.p(L.rod), tob = cam.p(L.tob), hom = cam.p(L.hom), cod = cam.p(L.cod), mun = cam.p(L.mun);
      colocar(P['muslo' + k], cad, rod, D.muslo, esc); colocar(P['pierna' + k], rod, tob, D.pierna, esc);
      colocar(P['brazo' + k], hom, cod, D.brazo, esc); colocar(P['ante' + k], cod, mun, D.antebrazo, esc);
      caraHueso(P['muslo' + k], L.frenteMuslo, L.cad, L.rod, cam, pulso, 9);
      caraHueso(P['pierna' + k], L.frentePierna, L.rod, L.tob, cam, pulso, 5.6);
      caraHueso(P['brazo' + k], L.frenteBrazo, L.hom, L.cod, cam, pulso, 5.6);
      caraHueso(P['ante' + k], L.frenteBrazo, L.cod, L.mun, cam, pulso, 4.6);
      /* la raya del pantalón, por fuera del muslo */
      var ry = ladoDe(aplicar(E.Bp, [signo(k), 0, 0]), L.cad, L.rod, cam), gm = P['muslo' + k];
      pon(gm._raya, 'transform', 'translate(' + n2(ry[0] * 9.2) + ',0)'); pon(gm._raya, 'opacity', n2(entre((ry[1] + 0.45) * 2.2, 0, 1)));
      lista.push({ z: (cad[2] + rod[2]) / 2, el: P['muslo' + k], pts: [L.cad, L.rod] }, { z: (rod[2] + tob[2]) / 2 - 0.2, el: P['pierna' + k], pts: [L.rod, L.tob] },
                 { z: (hom[2] + cod[2]) / 2 + 0.6, el: P['brazo' + k], pts: [L.hom, L.cod] }, { z: (cod[2] + mun[2]) / 2 + 0.8, el: P['ante' + k], pts: [L.cod, L.mun] });
      yo.mano(k, L, cam, lista, E.S.m[k].tipo);
      yo.pie(k, L, cam, lista);
    });
  };

  /* La mano: dos cápsulas (la palma con los dedos, y el pulgar). Cerrada es un puño; abierta, una
     manopla que se ve ancha de cara y fina de canto. */
  Figura.prototype.mano = function (k, L, cam, lista, tipo) {
    var g = this.P['mano' + k], esc = cam.esc, m = L.mano, Q = g._q;
    var cara = Math.abs(punto(m.palma, cam.k));
    if (tipo === 'puno' || tipo === 'indice' || tipo === 'pulgar') {
      var c3 = L.agarre, c = cam.p(c3), nud = cam.p(mas(c3, por(m.dir, 2.6)));
      pon(Q['tge-m-palma'], 'd', capsula(cam.p(mas(L.mun, por(m.dir, 2.4))), 3.5 * esc, nud, 4.5 * esc));
      /* el pulgar, cruzado por delante del puño, del lado del eje del agarre; o levantado */
      var p1 = cam.p(mas(c3, mas(por(m.eje, 3.4), por(m.dir, -1.6)))), p2 = cam.p(mas(c3, mas(por(m.eje, 3.8), por(m.dir, 2.6))));
      if (tipo === 'pulgar') { p1 = cam.p(mas(c3, por(m.eje, 2.6))); p2 = cam.p(mas(c3, mas(por(m.eje, 11.5), por(m.dir, -1)))); }
      pon(Q['tge-m-pulgar'], 'd', capsula(p1, 2.1 * esc, p2, 1.8 * esc));
      /* el índice, estirado (para un consejo) */
      if (tipo === 'indice') pon(Q['tge-m-dedo'], 'd', capsula(cam.p(mas(c3, mas(por(m.dir, 2.5), por(m.eje, 2.2)))), 1.9 * esc, cam.p(mas(c3, mas(por(m.dir, 14), por(m.eje, 2.4)))), 1.6 * esc));
      else pon(Q['tge-m-dedo'], 'd', '');
      /* los nudillos */
      var u = cam.d(m.dir), v = cam.d(m.eje), r = '';
      for (var j = -1; j <= 1; j++) {
        var b3 = mas(c3, mas(por(m.dir, 4.4), por(m.eje, j * 2.1))), b = cam.p(b3);
        r += 'M' + n1(b[0] - u[0] * 1.2 * esc) + ',' + n1(b[1] - u[1] * 1.2 * esc) + ' l' + n1(-u[0] * 1.6 * esc) + ',' + n1(-u[1] * 1.6 * esc);
      }
      pon(Q['tge-m-rayas'], 'd', r);
      lista.push({ z: c[2] + 1.6, el: g, pts: [L.mun, L.dedos] });
    } else {
      /* abierta: la palma, cuatro dedos y el pulgar. Suelta, los dedos se curvan hacia la palma. De canto se ve fina. */
      var su = tipo === 'suelta', gr = 1.5 + 2.7 * cara;
      var a = cam.p(mas(L.mun, por(m.dir, 2.6))), b2 = cam.p(mas(L.mun, por(m.dir, 7.6)));
      pon(Q['tge-m-palma'], 'd', capsula(a, Math.max(gr * 0.86, 2.3) * esc, b2, Math.max(gr, 2.5) * esc));
      var dd = '', LARGOS = [6.4, 7.5, 7.1, 5.6], rr = '';
      for (var f = 0; f < 4; f++) {
        var lat = (f - 1.5) * 2.05, nud = mas(L.mun, mas(por(m.dir, 8.3 - Math.abs(f - 1.4) * 0.5), por(m.eje, -lat)));
        var lf = LARGOS[f], pta = su ? mas(nud, mas(por(m.dir, lf * 0.62), por(m.palma, lf * 0.5))) : mas(nud, mas(por(m.dir, lf), por(m.eje, -lat * 0.12)));
        dd += capsula(cam.p(nud), 1.08 * esc, cam.p(pta), 0.95 * esc);
      }
      pon(Q['tge-m-dedo'], 'd', dd);
      var q1 = cam.p(mas(L.mun, mas(por(m.dir, 3.2), por(m.eje, 2.4)))), q2 = cam.p(mas(L.mun, mas(por(m.dir, su ? 7.4 : 7.0), por(m.eje, su ? 4.4 : 6.6))));
      pon(Q['tge-m-pulgar'], 'd', capsula(q1, 1.9 * esc, q2, 1.3 * esc));
      pon(Q['tge-m-rayas'], 'd', '');
      lista.push({ z: (a[2] + b2[2]) / 2 + 1.2, el: g, pts: [L.mun, L.dedos] });
    }
  };
  /* La zapatilla: dos bolas (el talón y la punta) y lo que las une; la suela es la misma forma, oscura
     y un poco más abajo, así que asoma por debajo desde cualquier lado. */
  Figura.prototype.pie = function (k, L, cam, lista) {
    var g = this.P['pie' + k], esc = cam.esc, Q = g._q;
    var t3 = mas(L.suela, mas(por(L.punta, -2.2), por(L.arriba, 5.0))), p3 = mas(L.suela, mas(por(L.punta, D.punta - 4.2), por(L.arriba, 3.8)));
    var t = cam.p(t3), p = cam.p(p3), rt = 5.3 * esc, rp = 3.9 * esc;
    var ab = cam.d(L.arriba), bx = -ab[0] * 1.7 * esc, by = -ab[1] * 1.7 * esc;
    pon(Q['tge-zapa'], 'd', capsula(t, rt, p, rp));
    pon(Q['tge-suela'], 'd', capsula([t[0] + bx, t[1] + by], rt, [p[0] + bx, p[1] + by], rp));
    var dx = p[0] - t[0], dy = p[1] - t[1], l = Math.sqrt(dx * dx + dy * dy);
    if (l > rt * 1.2) {
      pon(Q['tge-franja'], 'd', 'M' + n1(t[0] + dx * 0.3 + bx * 0.2) + ',' + n1(t[1] + dy * 0.3 + by * 0.2) + ' L' + n1(t[0] + dx * 0.66 + bx * 0.2) + ',' + n1(t[1] + dy * 0.66 + by * 0.2));
      pon(Q['tge-franja'], 'stroke-width', n1(1.5 * esc)); pon(Q['tge-franja'], 'opacity', '1');
    } else pon(Q['tge-franja'], 'opacity', '0');
    /* el borde del tobillo */
    var c1 = cam.p(mas(L.tob, por(L.arriba, -1.2)));
    pon(Q['tge-cordon'], 'd', 'M' + n1(c1[0] - 3.2 * esc) + ',' + n1(c1[1]) + ' h' + n1(6.4 * esc)); pon(Q['tge-cordon'], 'stroke-width', n1(1.3 * esc));
    lista.push({ z: (t[2] + p[2]) / 2 + 0.5, el: g, pts: [L.talon, L.dedosPie, mas(L.suela, por(L.arriba, 1.5))] });
  };
