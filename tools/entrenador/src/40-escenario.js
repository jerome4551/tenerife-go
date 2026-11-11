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
    this.sombra = crear('ellipse', { fill: '#1a1408', opacity: 0.24 }, this.sombras);
    this.sombra2 = crear('ellipse', { fill: '#1a1408', opacity: 0.18 }, this.sombras);
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
    pon(this.sombra, 'cx', cx); pon(this.sombra, 'cy', cy); pon(this.sombra, 'rx', n1(rx)); pon(this.sombra, 'ry', n1(ry)); pon(this.sombra, 'opacity', n2(0.24 * k));
    pon(this.sombra2, 'cx', cx); pon(this.sombra2, 'cy', cy); pon(this.sombra2, 'rx', n1(rx * 0.6)); pon(this.sombra2, 'ry', n1(ry * 0.6)); pon(this.sombra2, 'opacity', n2(0.2 * k));
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
    this.sombra.setAttribute('fill', tema === 'noche' || nombre === 'gimnasio' ? '#000' : '#4A2C12'); this.sombra2.setAttribute('fill', tema === 'noche' || nombre === 'gimnasio' ? '#000' : '#4A2C12');
    this.ajustarAmbiente();
  };
  Escenario.prototype.ajustarAmbiente = function () {
    var h = this.horizonte == null ? 300 : this.horizonte, f = this.fondo;
    if (!f.firstChild) return;
    f.childNodes[1].setAttribute('transform', 'translate(0,' + h + ')'); f.childNodes[2].setAttribute('transform', 'translate(0,' + h + ')');
  };
