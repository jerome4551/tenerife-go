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

  /* las posturas del presentador (el busto, de frente): saluda, da un consejo, levanta el pulgar */
  var PRESENTA = {
    listo: { m: { tipo: 'suelta' } },
    saluda1: { cab: [0, 0, -5], bi: { e: 148, z: 80, g: 0, c: 58 }, mi: { tipo: 'abierta', prono: 0 }, md: { tipo: 'suelta' } },
    saluda2: { cab: [0, 0, -5], bi: { e: 148, z: 80, g: 0, c: 96 }, mi: { tipo: 'abierta', prono: 0 }, md: { tipo: 'suelta' } },
    consejo: { cab: [2, 0, 4], bi: { e: 42, z: 36, g: 0, c: 118 }, mi: { tipo: 'indice', prono: 0 }, md: { tipo: 'suelta' } },
    pulgar: { cab: [0, 0, 5], bi: { e: 46, z: 40, g: 0, c: 104 }, mi: { tipo: 'pulgar', prono: 0 }, md: { tipo: 'suelta' } }
  };
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
    this.vistas = [{ rumbo: 35 }]; this.vista = 0; this.busto = false; this.bustoK = 0;
  }
  /* carga una coreografía */
  Director.prototype.cargar = function (co) {
    var yo = this, n;
    this.co = co; this.K = {};
    for (n in PRESENTA) this.K[n] = resolver(PRESENTA[n]);
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
    this.encuadrar();
  };
  function clavo(s) {
    /* 'ti' · 'mi' (en línea recta entre posturas) · 'mi@0:31' (al agarre del material 0, a 31 cm del centro) · 'mi=x,y,z' (a un punto) */
    var m = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/.exec(s);
    return m ? { que: m[1], mat: m[2] == null ? null : Number(m[2]), x: Number(m[3] || 0), en: m[4] == null ? null : [Number(m[4]), Number(m[5]), Number(m[6])] } : null;
  }
  /* las posturas en las que ya no hay nada clavado (se ha soltado de la barra) */
  Director.prototype.suelto = function (n) { return !!(this.co && this.co.sinClavos && this.co.sinClavos.indexOf(n) >= 0); };
  /* el esqueleto de la repetición en el instante tau, con lo clavado en su sitio */
  Director.prototype.enRep = function (tau) {
    var i, s = this.rep[this.rep.length - 1];
    for (i = 0; i < this.rep.length; i++) if (tau < this.rep[i].t0 + this.rep[i].dur) { s = this.rep[i]; break; }
    var u = entre((tau - s.t0) / s.dur, 0, 1), e = s.curva(u), A = this.K[s.de], B = this.K[s.a];
    var E = s.de === s.a ? A : mezclar(A, B, e);
    this.tramo = s; this.tramoU = u;
    return this.clavar(E, A, B, e, s.clavos ? s.clavos.map(clavo) : this.clavos);
  };
  Director.prototype.clavar = function (E, A, B, e, clavos) {
    if (!clavos || !clavos.length) return E;
    var mats = this.esc.material, i, hecho = false, S;
    /* se trabaja sobre una copia del estado: la postura clave no se toca */
    S = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: { i: E.S.q.i, d: E.S.q.d }, m: E.S.m, t: E.S.t };
    var E2 = { S: S, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d };
    for (i = 0; i < mats.length; i++) if (mats[i].antes) mats[i].colocar(E);
    for (i = 0; i < clavos.length; i++) {
      var c = clavos[i]; if (!c) continue;
      var k = c.que.charAt(1), meta;
      if (c.que.charAt(0) === 't') meta = c.en || mezcla(A[k].tob, B[k].tob, e);
      else if (c.mat != null && mats[c.mat] && mats[c.mat].agarre) meta = munecaPara(E, k, mats[c.mat].agarre(c.x));
      else meta = c.en || mezcla(A[k].mun, B[k].mun, e);
      clavar(E2, c.que, meta); hecho = true;
    }
    return hecho ? armar(S) : E;
  };
  /* ── qué hace ── */
  Director.prototype.aPostura = function (nombre, seg) {
    if (!this.K[nombre]) return;
    this.Eprev = this.E; this.w = this.E && seg !== 0 ? 0 : 1; this.durW = seg || 0.7;
    this.metaPrev = this.meta; this.modo = 'postura'; this.meta = nombre; this.sec = null;
  };
  Director.prototype.aRep = function (seg) {
    if (!this.rep.length) return this.aPostura(this.inicio, seg);
    if (this.modo === 'rep') return;
    this.Eprev = this.E; this.w = this.E && seg !== 0 ? 0 : 1; this.durW = seg || 0.6;
    this.modo = 'rep'; this.tau = 0; this.rastro = []; this.sec = null;
  };
  /* una secuencia que se toca una vez (por ejemplo, sacar la barra del soporte): [[postura, segundos, curva], …] */
  Director.prototype.aSecuencia = function (lista, desde) {
    var de = desde || this.meta || this.inicio, t0 = 0;
    this.sec = lista.map(function (s) { var r = { de: de, a: s[0], t0: t0, dur: s[1], curva: CURVA[s[2] || 'suave'] || CURVA.suave, clavos: s[3] }; de = s[0]; t0 += s[1]; return r; });
    this.secT = t0; this.tau = 0; this.modo = 'sec'; this.Eprev = this.E; this.w = this.E ? 0 : 1; this.durW = 0.45; this.rastro = [];
    this.metaPrev = this.meta;
    this.meta = lista[lista.length - 1][0];
  };
  /* un cuadro: avanza el tiempo y pinta */
  Director.prototype.cuadro = function (dt, parado) {
    var esc = this.esc, E, v = parado ? 0 : this.vel, yo = this;
    this.t += dt;
    if (this.modo === 'rep') {
      this.tau += dt * v;
      if (this.tau >= this.T) { this.tau -= this.T; this.reps++; if (this.alRepetir) this.alRepetir(this.reps); }
      E = this.enRep(this.tau);
      this.esf += ((this.tramo.esf ? 1 : 0) - this.esf) * (1 - Math.exp(-dt * 7));
    } else if (this.modo === 'sec') {
      this.tau = Math.min(this.secT, this.tau + dt * v);
      var s = this.sec[this.sec.length - 1], i;
      for (i = 0; i < this.sec.length; i++) if (this.tau < this.sec[i].t0 + this.sec[i].dur) { s = this.sec[i]; break; }
      var e = s.curva(entre((this.tau - s.t0) / s.dur, 0, 1)), A = this.K[s.de], B = this.K[s.a];
      this.secDe = s.de; this.secU = entre((this.tau - s.t0) / s.dur, 0, 1);
      E = this.clavar(s.de === s.a ? A : mezclar(A, B, e), A, B, e, s.clavos ? s.clavos.map(clavo) : this.clavos);
      this.esf += (0 - this.esf) * (1 - Math.exp(-dt * 5));
      if (this.tau >= this.secT) { this.modo = 'postura'; this.w = 1; }
    } else {
      E = this.K[this.meta] || this.K.listo;
      if (this.co && this.meta !== 'listo' && !this.busto && !this.suelto(this.meta)) E = this.clavar(E, E, E, 0, this.clavos);
      this.esf += ((this.co && this.co.isometrico && this.meta === this.co.isometrico ? 0.8 : 0) - this.esf) * (1 - Math.exp(-dt * 4));
    }
    /* de donde estaba a donde va */
    if (this.w < 1 && this.Eprev) {
      this.w = Math.min(1, this.w + dt / this.durW);
      E = mezclar(this.Eprev, E, CURVA.suave(this.w));
    }
    /* respira: un punto de pecho y de hombros */
    var resp = Math.sin(this.t * (1.6 + this.esf * 1.6));
    if (!quieto()) {
      var S = E.S, S2 = { p: S.p, B: S.B, col: [S.col[0] - resp * 0.5, S.col[1], S.col[2]], cab: [S.cab[0] + resp * 0.5, S.cab[1], S.cab[2]],
        hom: { i: [S.hom.i[0] + resp * 0.35, S.hom.i[1]], d: [S.hom.d[0] + resp * 0.35, S.hom.d[1]] }, b: S.b, q: S.q, m: S.m, t: S.t };
      if (this.modo === 'postura' && this.w >= 1 && (!this.co || !this.clavos.length || this.busto || this.meta === 'listo')) E = armar(S2);
    }
    this.E = E;
    /* la cámara: hacia su vista, con suavidad */
    var cam = esc.cam, V = this.busto ? this.vBusto : this.vistas[this.vista], kk = 1 - Math.exp(-dt * 5.5);
    if (this.salto) { kk = 1; this.salto = false; }
    var dr = V.rumbo - cam.rumbo; while (dr > 180) dr -= 360; while (dr < -180) dr += 360;
    cam.rumbo += dr * kk; cam.esc += (V.esc - cam.esc) * kk; cam.ox += (V.ox - cam.ox) * kk; cam.oy += (V.oy - cam.oy) * kk; cam.picado += (V.picado - cam.picado) * kk;
    cam.mira = mezcla(cam.mira, V.mira, kk);
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
    esc.cab.paso(dt);
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
    this.vBusto = { rumbo: 0, picado: 4, esc: 3.5, mira: [0, D.pelvis + 44, 0], ox: ANCHO / 2, oy: 268 };
    this.vista = Math.min(this.vista, this.vistas.length - 1);
    this.salto = true;
  };
  Director.prototype.girar = function () { this.vista = (this.vista + 1) % this.vistas.length; return this.vista; };
  Director.prototype.aBusto = function (si) { if (this.busto !== !!si) { this.busto = !!si; this.salto = true; } };
