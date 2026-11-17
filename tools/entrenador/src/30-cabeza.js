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
