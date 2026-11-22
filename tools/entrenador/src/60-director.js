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
    this.vida.corte(); this.cortes++; this.gestoDe = null; this.ap = null; this.gm = null;
    /* los rodeos de la repetición, mirados ya; salvo en las muy largas (un paseo, unos saltos de lado a lado: decenas de tramos),
       que se miran al llegar a cada uno: ahí mirarlos todos de golpe tardaría más que lo que ahorra */
    this.metas = [];
    if (this.rep.length <= RODEO_REP) this.rodeos(this.rep);
    this.encuadrar();
  };
  /* cuánto se dobla el codo (o la rodilla) cuando del hombro a la muñeca (o de la cadera al tobillo) hay d centímetros, en grados */
  function dobladoA(d, brazo) { var a = brazo ? D.brazo : D.muslo, b = brazo ? D.antebrazo : D.pierna; return Math.acos(entre((d * d - a * a - b * b) / (2 * a * b), -1, 1)) / RAD; }
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
      lista.push([c.que, meta, c]);
    }
    if (!lista.length) return E;
    var corr = [0, 0, 0], v, l, peor, falta, tope, vuelta, q, L, brazo;
    /* (21-11-2026) lo tenso. De una postura a otra la cadera va derecha, por la cuerda; si el cuerpo gira sobre los pies clavados (una
       flexión, un remo colgado de la cinta) o lleva las manos clavadas a lo que rueda, lo suyo es el arco: por la cuerda queda más
       cerca, y la rodilla o el codo, que en las dos posturas van rectos, se doblaban de paso (hasta 35° en el bloque 15). El brazo o
       la pierna tensos llegan a su sitio tan estirados como en las posturas: lo que miden del hombro a la muñeca, o de la cadera al
       tobillo, va de lo que mide en una a lo que mide en la otra, y es la cadera (el cuerpo entero, lo mismo) la que se aparta lo que
       haga falta.
       (22-11-2026) Y ya no hay que pedirlo: va tenso solo lo clavado que, entre dos posturas distintas, está recto en las dos (del
       todo, hasta 25° de rodilla o de codo; nada, desde 40°) y cuyo clavo no viaja (el pie o la mano que se quedan donde están: hasta
       2 cm; desde 5, nada. Lo clavado a un agarre del material o a un punto dicho no viaja: lo lleva lo que lo lleva). La mano que
       va de un sitio a otro en línea recta (se suelta del suelo y se tiende al frente) dobla el codo por el camino, como al alcanzar
       algo, y eso no se toca. Lo que la coreografía dice tenso (tensos: ['ti', 'td', 'mi', 'md']) lo va siempre, también quieto */
    var tensos = this.co && this.co.tensos, ct, dA, dB, kt, hayT = false, wT, cT, mA, mB, deMat, E0;
    if (A && B) for (i = 0; i < lista.length; i++) {
      q = lista[i]; kt = q[0].charAt(1); brazo = q[0].charAt(0) === 'm'; cT = q[2];
      /* a dónde va clavado en cada punta (y de ahí, lo que mide el miembro en ella: lo que mide clavado, no lo que diga la postura) */
      deMat = cT.mat != null && mats[cT.mat] && mats[cT.mat].agarre;
      if (deMat) { mA = munecaPara(A, kt, mats[cT.mat].agarre(cT.x)); mB = munecaPara(B, kt, mats[cT.mat].agarre(cT.x)); }
      else if (cT.en) mA = mB = cT.en;
      else { mA = brazo ? A[kt].mun : A[kt].tob; mB = brazo ? B[kt].mun : B[kt].tob; }
      dA = largo(menos(mA, brazo ? A[kt].hom : A[kt].cad)); dB = largo(menos(mB, brazo ? B[kt].hom : B[kt].cad));
      if (tensos && tensos.indexOf(q[0]) >= 0) wT = 1;
      /* solo entre dos posturas distintas; y a un agarre del material, solo si ese agarre no se mueve (una barra fija, unas paralelas:
         el de una máquina o el de una barra que va en las manos siguen al cuerpo, y tirar de él no tiene sentido) */
      else if (A === B || tensos === false || (deMat && !mats[cT.mat].agarreFijo)) wT = 0;
      else {
        wT = 1 - CURVA.suave(entre((Math.max(dobladoA(dA, brazo), dobladoA(dB, brazo)) - 25) / 15, 0, 1));
        if (wT > 0 && !deMat && !cT.en) wT *= 1 - CURVA.suave(entre((largo(menos(mA, mB)) - 2) / 3, 0, 1));
      }
      q[3] = wT; q[4] = dA; q[5] = dB; if (wT > 0) hayT = true;
    }
    if (hayT) {
      /* lo que hay que apartar la cadera se mide en la mezcla limpia de las dos posturas (sin la vida: el aire y el peso mueven los
         hombros y la cadera un poco, y eso no se corrige; corregirlo levantaba del suelo, al empezar a moverse, al que está tumbado
         con las manos apoyadas). Así, en las dos puntas del tramo no se aparta nada, y enlaza con la postura quieta sin un salto */
      E0 = A === B ? A : mezclar(A, B, e); ct = [0, 0, 0];
      for (vuelta = 0; vuelta < 60; vuelta++) {
        peor = 0;
        for (i = 0; i < lista.length; i++) {
          q = lista[i]; if (!(q[3] > 0)) continue;
          kt = q[0].charAt(1); brazo = q[0].charAt(0) === 'm';
          v = menos(q[1], mas(brazo ? E0[kt].hom : E0[kt].cad, ct)); l = largo(v); falta = (l - (q[4] + (q[5] - q[4]) * e)) * q[3];
          if (Math.abs(falta) > peor) peor = Math.abs(falta);
          if (l > 1e-6) ct = mas(ct, por(v, falta / l));
        }
        if (peor < 0.002) break;
      }
      l = largo(ct);
      if (l > 0.002) {
        if (l > 8) ct = por(ct, 8 / l);
        E = armar({ p: mas(E.S.p, ct), B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: { i: E.S.q.i, d: E.S.q.d }, m: E.S.m, t: E.S.t });
      }
    }
    /* si la vida (el aire, el peso) deja algo un pelo fuera de alcance, es el cuerpo el que se arrima: la mano no suelta
       la barra. Mover la cadera mueve hombros y caderas lo mismo, así que se va corrigiendo lo que más falta, unas vueltas. */
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
  /* (22-11-2026) la mano no gira de golpe. Hacia dónde mira la palma sale de la bisagra del codo, del prono y de lo que la postura
     diga en el mundo, y hay momentos en que eso cambia de un cuadro al siguiente: el brazo que llega a estirarse del todo (de ahí
     en adelante la bisagra ya no la dicen sus dos huesos), la palma dicha que pasa por detrás del antebrazo… En 83 de los 534 la
     mano daba un giro de 25° a 180° en un solo cuadro. Aquí, en lo que se ve, la mano gira sobre su antebrazo como mucho VGM
     grados por segundo: llega a donde iba en dos o tres décimas en vez de saltar. Quieta es exacta, y también en el primer cuadro
     tras un corte. (La que en plena repetición va y vuelve se arregla en su coreografía: lo mira la auditoría.) */
  var VGM = 600;
  Director.prototype.sinGolpe = function (E, dt) {
    var gm = this.gm, exacto = !gm || !(dt > 0) || dt > 0.25, tope = VGM * dt, R = null, i, k, L, p0, p1, a, d, m, c, toca = [];
    if (!gm) gm = this.gm = { i: null, d: null };
    for (i = 0; i < 2; i++) {
      k = LADOS[i]; L = E[k]; p1 = sinParte(L.mano.palma, L.lw); p0 = gm[k] ? sinParte(gm[k], L.lw) : null;
      if (exacto || !p0 || largo(p1) < 0.3 || largo(p0) < 0.3) { gm[k] = L.mano.palma; continue; }
      /* de la que se enseñó a la que sale ahora, girando sobre el antebrazo */
      a = Math.atan2(punto(cruz(p0, p1), L.lw), punto(p0, p1)) / RAD;
      if (Math.abs(a) <= tope) { gm[k] = L.mano.palma; continue; }
      d = a - (a > 0 ? tope : -tope);
      if (!R) R = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: E.S.b, q: E.S.q, m: { i: E.S.m.i, d: E.S.m.d }, t: E.S.t };
      m = {}; for (c in E.S.m[k]) m[c] = E.S.m[k][c];
      m.giro = (m.giro || 0) - d; R.m[k] = m; toca.push(k);
    }
    if (R) { E = armar(R); for (i = 0; i < toca.length; i++) gm[toca[i]] = E[toca[i]].mano.palma; }
    return E;
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
    this.vida.linea = []; if (seg === 0) { this.vida.corte(); this.cortes++; this.ap = null; this.gm = null; }
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
    E = this.sinGolpe(this.suave(E, this.despejar(E, clavos), dt, clavos), dt);
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
    /* (20-11-2026) y a cuál va y por dónde anda el tramo (de 0 a 1, en tiempo): lo que se lanza y vuelve (el balón medicinal) lo necesita */
    this.ctx.a = this.busto ? null : this.modo === 'sec' ? this.secA : this.modo === 'rep' ? (this.tramo ? this.tramo.a : null) : this.meta;
    this.ctx.u = this.busto ? null : this.modo === 'sec' ? this.secU : this.modo === 'rep' ? (this.tramo ? this.tramoU : 0) : 1;
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
  Director.prototype.aBusto = function (si) { if (this.busto !== !!si) { this.busto = !!si; this.salto = true; this.tBusto = 0; this.vida.corte(); this.cortes++; this.ap = null; this.gm = null; this.esc.cab.corte = true; } };
