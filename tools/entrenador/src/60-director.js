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
      return { rumbo: r, picado: pic, esc: e, mira: mira, ox: ANCHO / 2 - (a[0] + b[0]) / 2 * e, oy: 58 + (ALTO - 96) / 2 - (a[1] + b[1]) / 2 * e + 4 };
    });
    /* el busto: de frente, de cerca, para saludar y para los consejos */
    this.vBusto = { rumbo: 0, picado: BUSTO.picado, esc: BUSTO.esc, mira: BUSTO.mira, ox: ANCHO / 2, oy: BUSTO.oy };
    this.vista = Math.min(this.vista, this.vistas.length - 1);
    this.salto = true;
  };
  Director.prototype.girar = function () { this.vista = (this.vista + 1) % this.vistas.length; return this.vista; };
  Director.prototype.aBusto = function (si) { if (this.busto !== !!si) { this.busto = !!si; this.salto = true; this.tBusto = 0; this.vida.corte(); this.cortes++; this.esc.cab.corte = true; } };
