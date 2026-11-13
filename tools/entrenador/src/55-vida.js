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
        manos[lado] = { tipo: m.tipo, prono: m.prono, mun: m.mun, lat: m.lat, c: m.c + dd, ci: m.ci + dd * 0.8, ab: m.ab, pu: m.pu, pal: m.pal, bar: m.bar, w: m.w };
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
