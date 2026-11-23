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
     almohadilla: true, lleva en el centro una almohadilla (un rulo de goma de 40 cm: el hip thrust).
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
    if (o.almohadilla) this.pad = new Cilindro(M_COL.gomaL, 'rgba(255,255,255,.16)');
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
    if (this.pad) this.pad.pon(cam, mas(c, por(e, -20)), mas(c, por(e, 20)), 3.2, lista, 2.4 + sg);
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
     cambia: { i: [posturas] } (con lado: 'd'), para pasarla de una mano a la otra a la vista: en los tramos que SALEN de esas
     posturas la lleva la otra mano. Con las manos juntas (a menos de 11 cm) va entre las dos, y se va con la que la lleva según se
     separan: el cambio de mano se hace en una postura con los dos puños juntos en el asa, y no da un salto.
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
  MATERIAL.mancuernas.prototype.colocar = function (E, ctx) {
    var q = this.o.cambia, k;
    this.suelta = enReposo(this.o, ctx); this.lleva = null;
    if (q && ctx && ctx.de) for (k in q) if (q[k].indexOf(ctx.de) >= 0) this.lleva = k;
  };
  MATERIAL.mancuernas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, R = o.radio || 6.6, suelta = this.suelta;
    this.lados.forEach(function (k) {
      var L = E[this.lleva || k], c = L.agarre, e = o.vertical ? L.mano.dir : L.mano.eje, p = this.p[k];
      if (o.cambia) { var sc = entre((largo(menos(E.i.agarre, E.d.agarre)) - 11) / 16, 0, 1); c = mezcla(mezcla(E.i.agarre, E.d.agarre, 0.5), L.agarre, sc * sc * (3 - 2 * sc)); }
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
     respaldo: 45, inclinado; 85, casi vertical (una silla); negativo, declinado (la cabeza más baja que la cadera).
     rodillos: [[z, y, sesgo], …], en el marco del banco: los rulos tapizados que sujetan los pies o las rodillas (el banco declinado, el
     de hiperextensiones), cada uno a lo ancho y sobre su poste ── */
  MATERIAL.banco = function (esc, o) {
    o = o || {};
    this.o = o;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = [M_COL.hierroL, M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.asiento = new Caja(tap); this.resp = o.respaldo != null ? new Caja(tap) : null;
    this.patas = [new Caja(hie), new Caja(hie)]; this.puntal = new Cilindro(M_COL.hierro); this.pies = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.riel = this.resp ? new Cilindro(M_COL.hierroS) : null;
    this.rod = o.rodillos ? o.rodillos.map(function () { return [new Cilindro(M_COL.tapiz, 'rgba(255,255,255,.2)'), new Cilindro(M_COL.hierro)]; }) : null;
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
    if (this.rod) this.rod.forEach(function (r, i) {
      var q = o.rodillos[i];
      r[0].pon(cam, al(-(ancho / 2 + 6), q[1], q[0]), al(ancho / 2 + 6, q[1], q[0]), 4.6, lista, q[2] == null ? 2 : q[2]);
      r[1].pon(cam, al(0, 2, q[0]), al(0, q[1], q[0]), 2, lista, sg - 3);
    });
  };
  MATERIAL.banco.prototype.extremos = function () {
    var o = this.o, B = giroY(o.rumbo || 0), c = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], w = (o.ancho || 28) / 2, l = (o.largo || 120) / 2, h = o.alto || 44, r = [];
    [[-w, -l], [w, -l], [w, l], [-w, l]].forEach(function (q) { r.push(mas(c, aplicar(B, [q[0], 0, q[1]])), mas(c, aplicar(B, [q[0], h, q[1]]))); });
    if (o.respaldo != null) { var la = o.asiento || 38, lr = (o.largo || 120) - la; r.push(mas(c, aplicar(B, [0, h + Math.sin(o.respaldo * RAD) * lr, -l + la + Math.cos(o.respaldo * RAD) * lr]))); }
    (o.rodillos || []).forEach(function (q) { r.push(mas(c, aplicar(B, [-w - 6, q[1] + 5, q[0]])), mas(c, aplicar(B, [w + 6, q[1] + 5, q[0]])), mas(c, aplicar(B, [0, 0, q[0]]))); });
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
  MATERIAL.barra_dominadas.prototype.agarreFijo = true;      /* no se mueve: lo que cuelga de ella con los brazos rectos va tenso (60-director.js) */
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
  MATERIAL.paralelas.prototype.agarreFijo = true;
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
  /* ── la esterilla ── (y, más gruesa y más corta, un cojín: med: [ancho, grueso, largo]; descansa en el suelo) */
  MATERIAL.esterilla = function (esc, o) { this.o = o || {}; this.c = new Caja(['#5B4FCF', '#463cab', '#3a3190', '#3a3190']); this.antes = true; };
  MATERIAL.esterilla.prototype.colocar = function () {};
  MATERIAL.esterilla.prototype.pintar = function (E, cam, lista) {
    var o = this.o, B = giroY(o.rumbo || 0), m = o.med || [62, 1.6, 180];
    this.c.pon(cam, [o.en ? o.en[0] : 0, m[1] / 2, o.en ? o.en[1] : 0], B, m, lista, -400);
  };
  /* ── la pared: un paño vertical, que no tape a Jérôme ──
     o: { x, z (por dónde pasa su cara), normal (hacia el lado libre), ancho, alto, grueso (lo que se ve de su canto: 8) y tapa: true
     (el extremo de un muro, con una pierna a cada lado: lo que queda detrás de él se pinta detrás; solo con la normal a lo largo de
     un eje) } */
  MATERIAL.pared = function (esc, o) {
    this.o = o || {}; this.g = crear('g');
    this.f = crear('path', { fill: '#e9e2d2', stroke: '#cfc5ad', 'stroke-width': 1, 'stroke-linejoin': 'round' }, this.g);
    this.z = crear('path', { fill: '#b9ae93' }, this.g);
    this.l = crear('path', { fill: 'none', stroke: '#d8cfba', 'stroke-width': 1 }, this.g);
    this.antes = true;
  };
  MATERIAL.pared.prototype.colocar = function () {};
  MATERIAL.pared.prototype.extremos = function () { var o = this.o, z = o.z == null ? 40 : o.z; return [[(o.x || 0) - 40, 0, z], [(o.x || 0) + 40, Math.min(150, o.alto || 215), z]]; };
  MATERIAL.pared.prototype.pintar = function (E, cam, lista) {
    var o = this.o, z = o.z == null ? 40 : o.z, w = o.ancho || 150, h = o.alto || 215, n = o.normal || [0, 0, -1], gr = o.grueso || 8;
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
    /* el extremo de un muro: lo que queda detrás de su bulto (el paño y su grueso) va detrás de él (taparCon, en 40-escenario.js) */
    if (o.tapa) {
      var e1 = mas(c, por(t, -w / 2)), e2 = mas(mas(c, por(t, w / 2)), por(n, -gr));
      this.tapa = { min: [Math.min(e1[0], e2[0]), 0, Math.min(e1[2], e2[2])], max: [Math.max(e1[0], e2[0]), h, Math.max(e1[2], e2[2])], z: -500 };
    }
  };
  /* ── la polea: la columna, la polea a su altura y el cable hasta el agarre.
     o: { en: [x, z], alto, rumbo, a: 'manos' | 'i' | 'd' | 'tobillo-i' | 'tobillo-d' (con tobillera: true, se ve la tobillera: una banda justo
     encima del tobillo, y el cable va a su lado, no al centro del tobillo), agarre: 'barra' | 'cuerda' | 'asa' | 'v' (el triángulo de palmas enfrentadas) |
     'barra_v' (la barra en V de los tríceps: dos mangos que bajan del centro hacia fuera) }
     La máquina de jalón es esta misma con: brazo (cuánto sale de la columna el brazo de arriba hacia quien tira; la polea va en su
     punta), asiento: [a cuánto de la columna, alto] y rodillo: [a cuánto de la columna, alto] (el que sujeta los muslos).
     reposo: [x, y, z], dónde cuelga el agarre mientras nadie lo ha cogido (en las posturas que la coreografía diga en «reposo»).
     pasa: { manos: [posturas], 'tobillo-d': [posturas] }, para cambiar la tobillera de tobillo a la vista: en los tramos que SALEN de
     esas posturas el cable va a donde diga su clave y no a «a». En «manos» la tobillera viaja entre los dos puños (que en la postura
     de salida y en la de llegada tienen que estar uno a cada lado de la tobillera de ese tobillo, para que no dé un salto).
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
    if (o.tobillera) this.cinta = new Cilindro('#2b3340', 'rgba(255,255,255,.2)');
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
    var a = o.a || 'manos', fin, yo = this, suelto = enReposo(o, ctx), kp;
    if (o.pasa && ctx && ctx.de) for (kp in o.pasa) if (o.pasa[kp].indexOf(ctx.de) >= 0) a = kp;
    var ag = o.agarre || (a === 'manos' ? 'barra' : 'asa'), ver = { asa: false, cuerda: false, uve: false };
    /* el agarre: en las manos, o colgando del cable si aún no se ha cogido */
    var gi, gd, eje;
    if (suelto) {
      fin = o.reposo;
      var cae = unidad(menos(fin, pp), [0, -1, 0]), lat = unidad(cruz(cae, B[2]), B[0]), w = ag === 'barra' ? (o.ancho0 || 30) : ag === 'cuerda' ? 3 : ag === 'barra_v' ? (o.ancho0 || 8) : 5.5;
      gi = mas(fin, por(lat, w)); gd = mas(fin, por(lat, -w)); eje = ag === 'v' ? B[2] : lat;
      if (ag === 'cuerda') { fin = mas(fin, por(cae, -29.8)); gi = mas(fin, mas(por(cae, 29.8), por(lat, 3))); gd = mas(fin, mas(por(cae, 29.8), por(lat, -3))); }
    } else {
      if (a === 'manos' && this.cinta) {
        /* la tobillera, en las manos (de un tobillo al otro): entre los dos puños, con la inclinación y la profundidad de la pierna
           que tenga más cerca; en cada tobillo queda justo donde la pinta ese tobillo */
        var cI = menos(E.i.tob, por(E.i.ql, 5.5)), cD = menos(E.d.tob, por(E.d.ql, 5.5)), cm = mezcla(E.i.agarre, E.d.agarre, 0.5);
        var dI = largo(menos(cm, cI)), dD = largo(menos(cm, cD)), wq = dI + dD > 0.01 ? dI / (dI + dD) : 0, qm = unidad(mezcla(E.i.ql, E.d.ql, wq), [0, -1, 0]);
        var zI = (cam.p(E.i.rod)[2] + cam.p(E.i.tob)[2]) / 2, zD = (cam.p(E.d.rod)[2] + cam.p(E.d.tob)[2]) / 2;
        this.cinta.pon(cam, menos(cm, por(qm, 3.5)), mas(cm, por(qm, 3.5)), 4.9);
        lista.push({ z: zI + (zD - zI) * wq + 0.1, el: this.cinta.g });
        fin = mas(cm, por(unidad(sinParte(menos(pp, cm), qm), [0, 0, 1]), 4.9)); ag = 'nada';
      }
      else if (a === 'manos') fin = mezcla(E.i.agarre, E.d.agarre, 0.5);
      else if (a === 'i' || a === 'd') fin = E[a].agarre;
      else if (a === 'tobillo-i' || a === 'tobillo-d') {
        fin = E[a.slice(-1)].tob;
        if (this.cinta) {
          /* la tobillera: de 2 a 9 cm por encima del tobillo; el cable se engancha en su lado, mirando a la polea. Se pinta justo encima
             de su pierna (con la profundidad de la pierna entera, no la del tobillo: si no, con la rodilla más cerca de la cámara quedaría debajo) */
          var Lt = E[a.slice(-1)], ct = menos(Lt.tob, por(Lt.ql, 5.5));
          this.cinta.pon(cam, menos(Lt.tob, por(Lt.ql, 9)), menos(Lt.tob, por(Lt.ql, 2)), 4.9);
          lista.push({ z: (cam.p(Lt.rod)[2] + cam.p(Lt.tob)[2]) / 2 + 0.1, el: this.cinta.g });
          fin = mas(ct, por(unidad(sinParte(menos(pp, ct), Lt.ql), [0, 0, 1]), 4.9));
        }
      }
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
     toalla clara apenas se ve: el rulo lleva su contorno y una franja de color cerca de cada punta, como las toallas de playa.
     Doblada, con franjas: true lleva esas dos franjas (una cerca de cada canto, a lo ancho); y con bajo: 'talones' va con los pies,
     deslizándose por el suelo: su centro queda bajo los dos tobillos, «dz» cm más allá (el curl de isquios deslizando los talones) ── */
  MATERIAL.toalla = function (esc, o) {
    this.o = o || {}; this.antes = true;
    if (!this.o.rollo) {
      this.c = new Caja(['#f4f1ea', '#e2ddd0', '#cfc8b6', '#cfc8b6']);
      if (this.o.franjas) this.fr = [0, 1].map(function () { return new Caja([M_COL.agua, '#0e8a7e', '#0e8a7e', '#0e8a7e']); });
      return;
    }
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
    var en = o.en, med = o.med || [26, 3, 14], B = componer(giroY(o.rumbo || 0), giroX(o.cabeceo || 0)), sg = o.sesgo == null ? -13 : o.sesgo;
    if (o.bajo === 'talones') en = [(E.i.tob[0] + E.d.tob[0]) / 2, med[1] / 2, (E.i.tob[2] + E.d.tob[2]) / 2 + (o.dz || 0)];
    this.c.pon(cam, en, B, med, lista, sg, 'fondo');
    if (this.fr) this.fr.forEach(function (f, i) { f.pon(cam, mas(en, aplicar(B, [0, 0.1, (i ? 1 : -1) * (med[2] / 2 - 4.5)])), B, [med[0] + 0.2, med[1] + 0.1, 3.2], lista, sg + 0.05, 'fondo'); });
  };
  /* ── un poste: algo firme a lo que atar una banda (una farola, el poste de una barandilla). o: { en: [x, z], alto, r } ── */
  MATERIAL.poste = function (esc, o) {
    this.o = o || {}; this.c = new Cilindro(M_COL.hierro, 'rgba(255,255,255,.22)'); this.pie = new Disco(M_COL.hierroL, M_COL.hierroS, M_COL.hierro);
    this.antes = true;
  };
  MATERIAL.poste.prototype.colocar = function () {};
  MATERIAL.poste.prototype.extremos = function () {
    var o = this.o, e = o.en || [0, 90], h = Math.min(o.alto || 200, o.encuadre || 1e9), r = (o.r || 3) + 6;
    return [[e[0] - r, 0, e[1]], [e[0] + r, 0, e[1]], [e[0], h, e[1] - r], [e[0], h, e[1] + r]];
  };
  MATERIAL.poste.prototype.pintar = function (E, cam, lista) {
    var o = this.o, e = o.en || [0, 90], h = o.alto || 200, r = o.r || 3, sg = o.sesgo == null ? -6 : o.sesgo;
    this.pie.pon(cam, [e[0], 1, e[1]], [0, 1, 0], r + 6, 2, lista, sg - 1);
    this.c.pon(cam, [e[0], 1, e[1]], [e[0], h, e[1]], r, lista, sg);
  };
  /* ── la banda elástica (bloque 13) ──
     Una goma plana que va de un sitio a otro: pisada, atada a un poste, en las manos o rodeando una pierna.
     o: { tiras: [tira, …], lazos: [lazo, …], color }
     tira: { de: punto, a: punto, por: [punto, …] (por dónde pasa), ancho (3 cm), ve: [posturas] (solo se ve en los tramos que salen de
             ellas), asas: 'de' | 'a' | true (un asa en el extremo que lleva una mano), sesgo, largo0 (lo que mide sin estirar: cuanto más
             se estira, más fina), rodea: { en: 'torax' | 'pelvis', c, a, b, sentido } (no atraviesa el tronco: lo rodea) }
     punto: [x, y, z] (del mundo) · 'mano-i' | 'mano-d' (el centro del agarre) · 'manos' (entre las dos) · 'pie-i' | 'pie-d' (bajo el
            arco de la zapatilla: la pisa, y sale por el canto que mira al punto siguiente, o por el que se diga: 'pie-i:fuera',
            'pie-i:dentro') · 'bola-i' | 'bola-d' (bajo la parte delantera) · 'planta-i' | 'arco-i' (en la planta, con el pie en el aire: bajo los dedos o en el arco) ·
            'canto-i:fuera' | 'canto-i:dentro' (el canto de la suela a la altura del arco, o de los dedos con ':planta' detrás: por
            donde la tira dobla hacia la planta) · 'empeine-i' · 'lazo:N' (el enganche del lazo N, por el lado
            que mira al otro punto) · { en: 'torax' | 'pelvis', a: [x, y, z] } (pegado al cuerpo) · { de: 'i' | 'd', p: 'tob' | 'rod' |
            'cod' | 'mun' | 'hom' | 'cad', mas: [x, y, z] }
     lazo: la banda rodea algo. { en: 'muslos' | 'pantorrillas' | 'tobillos' (las dos piernas: la minibanda, con sus dos tramos entre
           ellas) | 'muslo-i' | 'pantorrilla-i' | 'tobillo-i' | 'brazo-i' | 'mano-i' | 'pie-i' (una sola, y lo mismo con -d) | [x, y, z] (un poste:
           con «eje» y «r»), a: a cuántos cm de la articulación, ancho (4,5 cm), r (el radio), ve: [posturas] } ── */
  function bandaAro(E, cam, que, q) {
    var L = E[que.slice(-1)], z2 = function (a, b) { return (cam.p(a)[2] + cam.p(b)[2]) / 2 + 0.1; }, u;
    if (que.indexOf('tobillo') === 0) return { c: menos(L.tob, por(L.ql, q.a == null ? 5.5 : q.a)), e: L.ql, r: q.r || 4.9, z: z2(L.rod, L.tob) };
    if (que.indexOf('pantorrilla') === 0) return { c: mas(L.rod, por(L.ql, q.a == null ? 12 : q.a)), e: L.ql, r: q.r || 7.3, z: z2(L.rod, L.tob) };
    if (que.indexOf('muslo') === 0) return { c: menos(L.rod, por(L.qu, q.a == null ? 7 : q.a)), e: L.qu, r: q.r || 7.6, z: z2(L.cad, L.rod) };
    if (que.indexOf('brazo') === 0) { u = unidad(menos(L.cod, L.hom)); return { c: mas(L.hom, por(u, q.a == null ? 16 : q.a)), e: u, r: q.r || 6.9, z: z2(L.hom, L.cod) + 0.65 }; }
    if (que.indexOf('mano') === 0) return { c: L.agarre, e: unidad(L.mano.dir), r: q.r || 4.9, z: cam.p(L.agarre)[2] + 1.9 };
    return { c: mas(L.suela, mas(por(L.punta, q.a == null ? 10 : q.a), por(L.arriba, 3.6))), e: L.punta, r: q.r || 5.9, z: cam.p(mas(L.suela, por(L.punta, 9)))[2] + 0.7 };
  }
  /* por dónde rodea el tronco una tira que va de A a B: los puntos del arco (ninguno, si en línea recta no lo cruza por ese lado).
     o: { en: 'torax' | 'pelvis', c: [x, y, z] (el centro de la elipse, en ese marco), a: semiancho, b: semifondo, sentido: 1 | −1,
     siempre (la rodea aunque en línea recta no la cruce: de mano a mano por la espalda) }.
     Se hace en el plano de la elipse, estirado para que sea un círculo de radio 1: las tangentes siguen siéndolo */
  function bandaRodea(E, o, A, B) {
    var M = o.en === 'pelvis' ? E.Bp : E.Bt, C = mas(o.en === 'pelvis' ? E.pel : E.tor, aplicar(M, o.c || [0, 0, 0])), sg = o.sentido || 1;
    var loc = function (P) { var d = menos(P, C); return [punto(d, M[0]) / o.a, punto(d, M[1]), punto(d, M[2]) / o.b]; };
    var a = loc(A), b = loc(B), da = Math.max(1.001, Math.sqrt(a[0] * a[0] + a[2] * a[2])), db = Math.max(1.001, Math.sqrt(b[0] * b[0] + b[2] * b[2]));
    if (!o.siempre) {
      /* si en línea recta no cruza la elipse, no hay nada que rodear (con «siempre», la rodea igual: la banda que pasa por la espalda) */
      var ux = b[0] - a[0], uz = b[2] - a[2], l2 = ux * ux + uz * uz, tm = l2 > 1e-9 ? entre(-(a[0] * ux + a[2] * uz) / l2, 0, 1) : 0, qx = a[0] + ux * tm, qz = a[2] + uz * tm;
      if (qx * qx + qz * qz >= 1) return [];
    }
    /* de A a B por el lado que se dice hay «fi» de vuelta; de ella, lo que no va en las dos tangentes es el arco */
    var aa = Math.acos(1 / da), ab = Math.acos(1 / db), dos = 2 * Math.PI, fi = sg * (Math.atan2(b[2], b[0]) - Math.atan2(a[2], a[0]));
    fi = fi - dos * Math.floor(fi / dos);
    var ta = Math.atan2(a[2], a[0]) + sg * aa, d = fi - aa - ab;
    if (d <= 0.02) return [];
    var n = Math.max(1, Math.min(10, Math.ceil(d / 0.4))), la = Math.sqrt(Math.max(0, da * da - 1)), lb = Math.sqrt(Math.max(0, db * db - 1)), tot = la + d + lb, r = [], i;
    for (i = 0; i <= n; i++) {
      var t = ta + sg * d * i / n, f = (la + d * i / n) / tot;
      r.push(mas(C, mas(mas(por(M[0], Math.cos(t) * o.a), por(M[2], Math.sin(t) * o.b)), por(M[1], a[1] + (b[1] - a[1]) * f))));
    }
    return r;
  }
  var BANDA_PAR = { muslos: 'muslo', pantorrillas: 'pantorrilla', tobillos: 'tobillo' };
  MATERIAL.banda = function (esc, o) {
    o = o || {}; this.o = o; this.antes = false;
    var col = o.color || M_COL.banda, osc = o.borde || '#b8375a';
    var cinta = function (tope) {
      var g = crear('g'), b = crear('path', { fill: 'none', stroke: osc, 'stroke-linecap': tope || 'round', 'stroke-linejoin': 'round' }, g);
      return { g: g, b: b, c: crear('path', { fill: 'none', stroke: col, 'stroke-linecap': tope || 'round', 'stroke-linejoin': 'round' }, g) };
    };
    this.t = (o.tiras || []).map(function (q) {
      var s = [], i, n = (q.por ? q.por.length * 2 : 0) + 3 + (q.rodea ? 12 : 0);
      for (i = 0; i < n; i++) s.push(cinta());
      return { s: s, asas: [new Cilindro('#2b3340', 'rgba(255,255,255,.2)'), new Cilindro('#2b3340', 'rgba(255,255,255,.2)')] };
    });
    this.l = (o.lazos || []).map(function () { return { c: [cinta('butt'), cinta('butt')], s: [cinta(), cinta()] }; });
  };
  MATERIAL.banda.prototype.colocar = function () {};
  MATERIAL.banda.prototype.pintar = function (E, cam, lista, ctx) {
    var o = this.o, yo = this;
    var visto = function (q) { return !q.ve || (!!ctx && q.ve.indexOf(ctx.de) >= 0); };
    var raya = function (r, a3, b3, w, z) {
      var a = cam.p(a3), b = cam.p(b3), d = 'M' + n1(a[0]) + ',' + n1(a[1]) + ' L' + n1(b[0]) + ',' + n1(b[1]);
      pon(r.b, 'd', d); pon(r.b, 'stroke-width', n1(w + 1.3)); pon(r.c, 'd', d); pon(r.c, 'stroke-width', n1(Math.max(0.8, w)));
      r.g.style.display = '';
      lista.push({ z: z == null ? (a[2] + b[2]) / 2 + 0.9 : z, el: r.g });
    };
    /* los lazos: dónde rodea la banda cada cosa */
    var aros = (o.lazos || []).map(function (q) {
      if (BANDA_PAR[q.en]) return [bandaAro(E, cam, BANDA_PAR[q.en] + '-i', q), bandaAro(E, cam, BANDA_PAR[q.en] + '-d', q)];
      if (typeof q.en === 'string') return [bandaAro(E, cam, q.en, q)];
      return [{ c: q.en, e: unidad(q.eje || [0, 1, 0]), r: q.r || 3.6, z: cam.p(q.en)[2] + (q.sesgo == null ? 0.5 : q.sesgo) }];
    });
    (o.lazos || []).forEach(function (q, i) {
      var r = yo.l[i], A = aros[i], ve = visto(q), w = q.ancho || 4.5;
      r.c.concat(r.s).forEach(function (x) { x.g.style.display = 'none'; });
      if (!ve) return;
      /* cada aro, una franja atravesada sobre lo que rodea (de canto se estrecha) */
      A.forEach(function (a, j) {
        var n = unidad(cruz(a.e, cam.k), [1, 0, 0]), s = Math.sqrt(Math.max(0, 1 - punto(a.e, cam.k) * punto(a.e, cam.k)));
        raya(r.c[j], menos(a.c, por(n, a.r)), mas(a.c, por(n, a.r)), w * cam.esc * Math.max(0.45, s), a.z);
      });
      /* la minibanda: de una pierna a la otra, por delante y por detrás; el tramo que queda del lado de la cámara tapa las dos piernas */
      if (A.length === 2) {
        var u = unidad(menos(A[1].c, A[0].c), [1, 0, 0]), f = unidad(cruz(u, unidad(mas(A[0].e, A[1].e), [0, 1, 0])), [0, 0, 1]);
        var zc = [1, -1].map(function (sg) { return cam.p(mas(mezcla(A[0].c, A[1].c, 0.5), por(f, sg * (A[0].r + A[1].r) / 2)))[2]; });
        [1, -1].forEach(function (sg, j) {
          var cerca = zc[j] >= zc[1 - j];
          raya(r.s[j], mas(A[0].c, por(f, sg * A[0].r)), mas(A[1].c, por(f, sg * A[1].r)), w * cam.esc * 0.9, cerca ? Math.max(A[0].z, A[1].z) + 0.25 : Math.min(A[0].z, A[1].z) - 0.25);
        });
      }
    });
    /* un punto de una tira: uno o dos puntos del mundo (bajo el pie y su canto), de fuera adentro de la tira */
    var punto3 = function (p, otro) {
      if (Array.isArray(p)) return [p];
      if (typeof p === 'object') {
        if (p.en) return [mas(p.en === 'torax' ? E.tor : E.pel, aplicar(p.en === 'torax' ? E.Bt : E.Bp, p.a))];
        return [p.mas ? mas(E[p.de][p.p], p.mas) : E[p.de][p.p]];
      }
      if (p === 'manos') return [mezcla(E.i.agarre, E.d.agarre, 0.5)];
      if (p.indexOf('lazo:') === 0) { var A = aros[Number(p.slice(5))][0]; return [otro ? mas(A.c, por(unidad(sinParte(menos(otro, A.c), A.e), [0, 0, 1]), A.r)) : A.c]; }
      var pp = p.split(':'), k = pp[0].slice(-1), L = E[k], que = pp[0].slice(0, -2);
      if (que === 'mano') return [L.agarre];
      if (que === 'planta' || que === 'arco' || que === 'canto') {
        /* la planta, con el pie en el aire: bajo los dedos o en el arco; y su canto (de fuera o de dentro), por donde la tira dobla
           hacia la planta. Llevan la normal de la suela: la tira se pinta delante de la zapatilla si la suela mira a la cámara */
        var av = que === 'planta' || pp[2] === 'planta' ? 12.5 : 6.5, cp = mas(L.suela, por(L.punta, av));
        if (que === 'canto') cp = mas(cp, mas(por(unidad(cruz(L.arriba, L.punta), [1, 0, 0]), ((pp[1] === 'dentro') === (k === 'i') ? -1 : 1) * 5.4), por(L.arriba, 1.2)));
        cp.n = por(L.arriba, -1);
        return [cp];
      }
      if (que === 'empeine') return [mas(L.suela, mas(por(L.punta, 9), por(L.arriba, 6.8)))];
      /* pisada: bajo el arco (o bajo la parte delantera), y el canto por el que sale: el de fuera o el de dentro, si se dice
         ('pie-i:fuera'); si no, el que mira al otro punto */
      var c = mas(L.suela, mas(por(L.punta, que === 'bola' ? 12.5 : 6.5), por(L.arriba, -0.5))), lado = unidad(cruz(L.arriba, L.punta), [1, 0, 0]);
      var sg = pp[1] ? ((pp[1] === 'fuera') === (k === 'i') ? 1 : -1) : (otro && punto(menos(otro, c), lado) < 0 ? -1 : 1);
      return [c, mas(c, mas(por(lado, sg * 5.4), por(L.arriba, 0.6)))];
    };
    (o.tiras || []).forEach(function (q, i) {
      var r = yo.t[i], ve = visto(q), k;
      r.s.forEach(function (x) { x.g.style.display = 'none'; });
      r.asas.forEach(function (x) { x.g.style.display = 'none'; });
      if (!ve) return;
      var esp = [q.de].concat(q.por || [], [q.a]), prov = esp.map(function (p) { var x = punto3(p, null); return x[0]; }), pts = [], bajo = [];
      esp.forEach(function (p, j) {
        var ant = j > 0 ? prov[j - 1] : null, sig = j < esp.length - 1 ? prov[j + 1] : null;
        var x = punto3(p, sig || ant);
        if (x.length === 1) { pts.push(x[0]); bajo.push(0); return; }
        /* pisada: entra por el canto que mira al punto anterior y sale por el que mira al siguiente */
        if (ant) { var e = punto3(p, ant); pts.push(e[1]); bajo.push(0); }
        pts.push(x[0]); bajo.push(1);
        if (sig) { pts.push(x[1]); bajo.push(0); }
      });
      /* rodea: la tira no atraviesa el tronco: si en línea recta lo cruzaría, lo rodea por el lado que se diga (una elipse en el
         marco que se diga; sentido 1: de la mano izquierda hacia delante; −1: por la espalda) */
      if (q.rodea) {
        var nuevos = [], nb = [];
        for (k = 0; k + 1 < pts.length; k++) {
          var arco = bandaRodea(E, q.rodea, pts[k], pts[k + 1]);
          nuevos.push(pts[k]); nb.push(bajo[k]);
          arco.forEach(function (x) { nuevos.push(x); nb.push(0); });
        }
        nuevos.push(pts[pts.length - 1]); nb.push(bajo[bajo.length - 1]);
        pts = nuevos; bajo = nb;
      }
      var total = 0;
      for (k = 0; k + 1 < pts.length; k++) total += largo(menos(pts[k], pts[k + 1]));
      var w = (q.ancho || 3) * cam.esc * (q.largo0 ? entre(Math.sqrt(q.largo0 / Math.max(1, total)), 0.55, 1) : 1);
      for (k = 0; k + 1 < pts.length && k < r.s.length; k++) {
        /* lo que va bajo la zapatilla, por detrás de ella */
        var zb = bajo[k] || bajo[k + 1] ? Math.min(cam.p(pts[k])[2], cam.p(pts[k + 1])[2]) - 4 : null;
        /* lo que va por la planta de un pie en el aire: delante o detrás de la zapatilla según mire la suela */
        var na = pts[k].n, nb = pts[k + 1].n, pa = na && nb ? mas(pts[k], por(na, 4)) : pts[k], pb = na && nb ? mas(pts[k + 1], por(nb, 4)) : pts[k + 1];
        raya(r.s[k], pts[k], pts[k + 1], w, zb == null ? (cam.p(pa)[2] + cam.p(pb)[2]) / 2 + (q.sesgo == null ? 0.9 : q.sesgo) : zb);
      }
      /* las asas: un mango en la mano */
      [[q.de, 'de'], [q.a, 'a']].forEach(function (x, j) {
        if (!(q.asas === true || q.asas === x[1]) || typeof x[0] !== 'string' || x[0].indexOf('mano-') !== 0) return;
        var L = E[x[0].slice(-1)], eje = L.mano.eje;
        r.asas[j].pon(cam, mas(L.agarre, por(eje, -5.6)), mas(L.agarre, por(eje, 5.6)), 1.5);
        r.asas[j].g.style.display = ''; lista.push({ z: cam.p(L.agarre)[2] + 1.6, el: r.asas[j].g });
      });
    });
  };
  /* ── las máquinas y el multipower (bloque 14) ──
     Una máquina se dice por piezas, en centímetros y en su marco (el del mundo, salvo que lleve «en: [x, z]» y «rumbo»).
     o: { fijo: [pieza, …], mec: [mecanismo, …], agarres: { i: [x, y, z], d: […] } (las asas que no se mueven), en, rumbo, sesgo,
          encuadre: [puntos] (lo que tiene que caber en el cuadro, si no es todo), reposo: true (ver «quieto») }
     pieza: ['tubo', A, B, radio, color, sesgo, 'A' | 'B'] (con 'A' o 'B', en un mecanismo: ese extremo no se mueve, sigue en el bastidor)
          · ['rulo', A, B, radio, sesgo] (un rodillo tapizado) · ['asa', A, B, radio, sesgo]
          · ['cojin', centro, [ancho, grueso, largo], a lo largo de qué va, hacia dónde mira, sesgo, 'centro'] (se ordena por su fondo;
            con 'centro', por su centro: lo que va encima del cuerpo) · ['placa', …] (lo mismo, de chapa)
          · ['disco', centro, eje, radio, grosor, color, sesgo]
          · ['pila', [x, y, z], alto, { mec, gana, cero, ancho, eje }] (la torre de placas: las de arriba suben «gana» cm por cada
            grado o centímetro que el mecanismo «mec» pasa de «cero»)
     mecanismo: lo que se mueve, y con qué parte del cuerpo va.
          { gira: [un punto del eje, su dirección] | corre: dirección | lleva: true (se traslada con el punto, sin girar),
            ref: [x, y, z] (dónde está, con la máquina en reposo, el punto que va con el cuerpo), sigue: punto del cuerpo,
            max: 1 | -1 (con un par —'bolas', 'tobillos'—: manda el pie que más empuja, o el que menos), lim: [de, a] (grados o cm),
            quieto: valor mientras nadie la ha cogido (las posturas de «reposo» de la coreografía), piezas: […],
            agarres: { i, d } (sus asas: la mano va clavada a ellas con 'mi@N:1' y 'md@N:-1'; el segundo juego de asas de la máquina
            es el 2, y así), barra: [centro, eje] (un agarre corrido: 'mi@N:25', a 25 cm del centro) }
     punto del cuerpo: 'manos' · 'mano-i' · 'tobillos' · 'tobillo-i' · 'bolas' · 'bola-i' (bajo la parte delantera del pie) · 'rodillas' ·
          'hombros' · 'codos' · 'muneca-i' · { en: 'torax' | 'pelvis', a: [x, y, z] } · { de: 'i', p: 'rod', mas: [x, y, z] } · [varios: su media]
     Una palanca gira sobre su eje hasta donde está la mano o la pierna que la mueve, y el asa queda siempre a la misma distancia del
     eje: la mano se clava a ella, y es la mano la que sigue el arco de la máquina, no la máquina la que se estira. ── */
  function maqPunto(E, p) {
    if (Array.isArray(p)) { if (typeof p[0] === 'number') return p; var s = [0, 0, 0]; p.forEach(function (q) { s = mas(s, por(maqPunto(E, q), 1 / p.length)); }); return s; }
    if (typeof p === 'object') return p.en ? mas(p.en === 'torax' ? E.tor : E.pel, aplicar(p.en === 'torax' ? E.Bt : E.Bp, p.a)) : (p.mas ? mas(E[p.de][p.p], p.mas) : E[p.de][p.p]);
    if (MAQ_PAR[p]) return mezcla(maqPunto(E, MAQ_PAR[p] + '-i'), maqPunto(E, MAQ_PAR[p] + '-d'), 0.5);
    var L = E[p.slice(-1)], que = p.slice(0, -2);
    return que === 'mano' ? L.agarre : que === 'tobillo' ? L.tob : que === 'rodilla' ? L.rod : que === 'hombro' ? L.hom : que === 'codo' ? L.cod : que === 'muneca' ? L.mun : mas(L.suela, por(L.punta, D.bola));
  }
  var MAQ_PAR = { manos: 'mano', tobillos: 'tobillo', bolas: 'bola', rodillas: 'rodilla', hombros: 'hombro', codos: 'codo' };
  function maqValor(m, f) {
    if (m.lleva) return menos(f, m.ref);
    if (m.gira) { var P = m.gira[0], u = unidad(m.gira[1]), a = sinParte(menos(m.ref, P), u), b = sinParte(menos(f, P), u); return Math.atan2(punto(cruz(a, b), u), punto(a, b)) / RAD; }
    return punto(menos(f, m.ref), unidad(m.corre));
  }
  function maqMueve(x, p) { var m = x.m; return m.lleva ? mas(p, x.v) : m.gira ? mas(m.gira[0], girar(menos(p, m.gira[0]), unidad(m.gira[1]), x.v)) : mas(p, por(unidad(m.corre), x.v)); }
  function maqGira(x, d) { return x.m.gira ? girar(d, unidad(x.m.gira[1]), x.v) : d; }
  MATERIAL.maquina = function (esc, o) {
    o = o || {}; this.o = o; this.antes = true;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = ['#566072', M_COL.hierro, M_COL.hierroS, M_COL.hierroS], pl = ['#3a414d', '#2b313c', M_COL.hierroS, M_COL.hierroS];
    var haz = function (q) {
      var t = q[0];
      return { q: q, f: t === 'tubo' ? new Cilindro(M_COL[q[4] || 'hierro']) : t === 'rulo' ? new Cilindro(M_COL.tapiz, 'rgba(255,255,255,.2)') : t === 'asa' ? new Cilindro(M_COL.goma, 'rgba(255,255,255,.18)') :
        t === 'cojin' ? new Caja(tap) : t === 'placa' ? new Caja(hie) : t === 'disco' ? new Disco(q[5] || M_COL.goma, M_COL.hierroS, M_COL.cromo) :
        { v: [new Cilindro(M_COL.cromoS), new Cilindro(M_COL.cromoS)], t: new Cilindro(M_COL.hierro), a: new Caja(pl), b: new Caja(pl) } };
    };
    this.fijo = (o.fijo || []).map(haz);
    this.mec = (o.mec || []).map(function (m) { return { m: m, v: m.lleva ? [0, 0, 0] : 0, piezas: (m.piezas || []).map(haz) }; });
    this.B0 = giroY(o.rumbo || 0); this.c0 = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0];
  };
  MATERIAL.maquina.prototype.colocar = function (E, ctx) {
    var yo = this, rep = enReposo(this.o, ctx);
    var loc = function (p) { return aLocal(yo.B0, menos(maqPunto(E, p), yo.c0)); };
    this.mec.forEach(function (x) {
      var m = x.m, v;
      if (!m.sigue || (rep && m.quieto != null)) { x.v = m.quieto != null ? m.quieto : m.lleva ? [0, 0, 0] : 0; return; }
      if (m.max && MAQ_PAR[m.sigue]) { var a = maqValor(m, loc(MAQ_PAR[m.sigue] + '-i')), b = maqValor(m, loc(MAQ_PAR[m.sigue] + '-d')); v = m.max > 0 ? Math.max(a, b) : Math.min(a, b); }
      else v = maqValor(m, loc(m.sigue));
      if (m.lim && !m.lleva) v = entre(v, m.lim[0], m.lim[1]);
      x.v = v;
    });
  };
  /* dónde se agarra: |x| dice qué juego de asas (1, el primero: los de los mecanismos, por orden, y después los fijos) y su signo, qué
     mano (+, la izquierda). Con una barra corrida, x es a cuántos centímetros de su centro */
  MATERIAL.maquina.prototype.agarre = function (x) {
    var k = x >= 0 ? 'i' : 'd', n = Math.max(1, Math.round(Math.abs(x))), i, m, p = null;
    for (i = 0; i < this.mec.length && !p; i++) {
      m = this.mec[i].m;
      if (m.barra) p = maqMueve(this.mec[i], mas(m.barra[0], por(unidad(m.barra[1]), x)));
      else if (m.agarres && m.agarres[k] && --n === 0) p = maqMueve(this.mec[i], m.agarres[k]);
    }
    if (!p && this.o.agarres) p = this.o.agarres[k];
    return mas(this.c0, aplicar(this.B0, p || [0, 100, 0]));
  };
  MATERIAL.maquina.prototype.cada = function (f) {
    var yo = this, id = function (p) { return p; };
    this.fijo.forEach(function (z) { f(z, id, id, id); });
    this.mec.forEach(function (x) { var T = function (p) { return maqMueve(x, p); }, Td = function (d) { return maqGira(x, d); }; x.piezas.forEach(function (z) { f(z, T, Td, id); }); });
  };
  MATERIAL.maquina.prototype.extremos = function () {
    var yo = this, o = this.o, r = [];
    var W = function (p) { return mas(yo.c0, aplicar(yo.B0, p)); };
    if (o.encuadre) return o.encuadre.map(W);
    this.cada(function (z, T, Td) {
      var q = z.q, t = q[0];
      if (t === 'tubo' || t === 'rulo' || t === 'asa') r.push(W(q[6] === 'A' ? q[1] : T(q[1])), W(q[6] === 'B' ? q[2] : T(q[2])));
      else if (t === 'pila') r.push(W(q[1]), W([q[1][0], q[1][1] + q[2], q[1][2]]));
      else if (t === 'disco') { var c = T(q[1]), R = q[3] || 20; r.push(W(mas(c, [0, R, 0])), W(mas(c, [0, -R, 0])), W(mas(c, [0, 0, R])), W(mas(c, [0, 0, -R]))); }
      else { var dz = por(unidad(Td(q[3] || [0, 0, 1])), q[2][2] / 2); r.push(W(mas(T(q[1]), dz)), W(menos(T(q[1]), dz))); }
    });
    return r;
  };
  MATERIAL.maquina.prototype.pintar = function (E, cam, lista) {
    var yo = this, o = this.o, sg0 = o.sesgo == null ? -6 : o.sesgo;
    var W = function (p) { return mas(yo.c0, aplicar(yo.B0, p)); }, Wd = function (d) { return aplicar(yo.B0, d); };
    this.cada(function (z, T, Td) {
      var q = z.q, t = q[0], f = z.f;
      if (t === 'tubo') f.pon(cam, W(q[6] === 'A' ? q[1] : T(q[1])), W(q[6] === 'B' ? q[2] : T(q[2])), q[3] || 2.4, lista, q[5] == null ? sg0 : q[5]);
      else if (t === 'rulo') f.pon(cam, W(T(q[1])), W(T(q[2])), q[3] || 5, lista, q[4] == null ? 1 : q[4]);
      else if (t === 'asa') f.pon(cam, W(T(q[1])), W(T(q[2])), q[3] || 1.7, lista, q[4] == null ? 2.2 : q[4]);
      else if (t === 'cojin' || t === 'placa') {
        var dz = unidad(Wd(Td(q[3] || [0, 0, 1]))), dy = unidad(sinParte(Wd(Td(q[4] || [0, 1, 0])), dz), [0, 1, 0]);
        f.pon(cam, W(T(q[1])), [cruz(dy, dz), dy, dz], q[2], lista, q[5] == null ? sg0 - 8 : q[5], q[6] === 'centro' ? null : 'fondo');
      }
      else if (t === 'disco') f.pon(cam, W(T(q[1])), unidad(Wd(Td(q[2] || [1, 0, 0]))), q[3] || 20, q[4] || 4, lista, q[6] == null ? 0 : q[6]);
      else {
        /* la torre de placas: dos guías, su puente y las placas; las de arriba (las que se han elegido) suben con el mecanismo */
        var op = q[3] || {}, c = q[1], h = q[2], w = op.ancho || 24, e = op.eje === 'z' ? [0, 0, 1] : [1, 0, 0], hp = h * 0.5, hl = hp * 0.3, hr = hp - hl, B = [e, [0, 1, 0], cruz(e, [0, 1, 0])];
        var x = op.mec != null ? yo.mec[op.mec] : null, sube = x && !x.m.lleva ? entre(Math.abs(x.v - (op.cero || 0)) * (op.gana || 0), 0, h - hp - 5) : 0, sg = op.sesgo == null ? sg0 - 2 : op.sesgo;
        [1, -1].forEach(function (s, i) { f.v[i].pon(cam, W(mas(c, por(e, s * w * 0.3))), W(mas(c, mas(por(e, s * w * 0.3), [0, h, 0]))), 0.9, lista, sg - 0.5); });
        f.t.pon(cam, W(mas(c, mas(por(e, -w * 0.42), [0, h, 0]))), W(mas(c, mas(por(e, w * 0.42), [0, h, 0]))), 2, lista, sg);
        f.a.pon(cam, W(mas(c, [0, hr / 2, 0])), [Wd(B[0]), B[1], Wd(B[2])], [w, hr, 8], lista, sg, 'fondo');
        f.b.pon(cam, W(mas(c, [0, hr + 0.8 + sube + hl / 2, 0])), [Wd(B[0]), B[1], Wd(B[2])], [w, hl, 8], lista, sg + 0.3, 'fondo');
      }
    });
  };
  /* ══════════ el material del bloque 15: el fitball, el disco, el balón medicinal, la cinta de suspensión, las anillas y la rueda ══════════ */
  /* un aro (una anilla): un círculo hueco de radio R y tubo r, con su eje; de lado se ve como una elipse */
  function Aro(color, brillo) {
    this.g = crear('g');
    this.c = crear('ellipse', { fill: 'none', stroke: color }, this.g);
    this.b = crear('ellipse', { fill: 'none', stroke: brillo || 'rgba(255,255,255,.35)' }, this.g);
  }
  Aro.prototype.pon = function (cam, c3, eje, R, r, lista, sesgo) {
    var e = cam.d(eje), l2 = Math.sqrt(e[0] * e[0] + e[1] * e[1]), ang = l2 > 1e-3 ? Math.atan2(e[1], e[0]) / RAD : 0, c = cam.p(c3);
    var rx = Math.max(0.6, R * cam.esc * Math.abs(e[2])), ry = R * cam.esc, w = 2 * r * cam.esc, tr = 'translate(' + n1(c[0]) + ',' + n1(c[1]) + ') rotate(' + n1(ang) + ')';
    pon(this.c, 'transform', tr); pon(this.c, 'rx', n1(rx)); pon(this.c, 'ry', n1(ry)); pon(this.c, 'stroke-width', n1(w));
    pon(this.b, 'transform', tr); pon(this.b, 'rx', n1(rx + w * 0.2)); pon(this.b, 'ry', n1(ry + w * 0.2)); pon(this.b, 'stroke-width', n1(Math.max(0.5, w * 0.22)));
    if (lista) lista.push({ z: c[2] + (sesgo || 0), el: this.g });
  };
  /* lo que les falta a unas piezas del cuerpo E para tocar la esfera de centro C y radio R (negativo: lo que se mete la que más).
     piezas: [['zapa', 'i'], ['pierna', 'd'], ['muslo', 'i'], ['ante', 'd'], ['brazo', 'i'], ['mano', 'd'], ['tronco'], ['cabeza']…] */
  function huecoPelota(E, piezas, C, R) {
    var m = 1e9;
    piezas.forEach(function (q) {
      var k = q[1], d = piezaAEsfera(q[0] === 'zapa' ? function (P0, n, f) { return zapaAPlano(E[k], k, P0, n, f); }
        : q[0] === 'tronco' ? function (P0, n, f) { return troncoAPlano(E, P0, n, f); }
        : q[0] === 'cabeza' ? function (P0, n, f) { return cabezaAPlano(E, P0, n, f); }
        : q[0] === 'mano' ? function (P0, n, f) { return manoAPlano(E[k], E.S.m[k], P0, n, f); }
        : function (P0, n, f) { return miembroAPlano(E, k, q[0], P0, n, f); }, C, R);
      if (d < m) m = d;
    });
    return m;
  }
  /* dónde queda (en z) el centro de una pelota de radio R posada en el suelo, con el centro en x, que llega rodando desde más allá de
     los pies hasta tocar alguna de esas piezas: el primer sitio donde las toca. sentido: 1, si los pies quedan hacia +z (boca arriba)
     y la pelota viene de ahí; −1, al revés (boca abajo). cerca: por dónde andaba (de un cuadro al siguiente se mueve poco, y así
     se mide menos). Devuelve z, o null si no llega a tocar nada */
  function pelotaContra(E, piezas, x, R, sentido, cerca) {
    var s = sentido || 1, hueco = function (z) { return huecoPelota(E, piezas, [x, R, z], R); }, z0, z1, f0, f1, fm, zm, i;
    if (cerca != null) { z1 = cerca + 1.5 * s; z0 = cerca - 1.5 * s; }
    if (cerca == null || !((f1 = hueco(z1)) > 0 && (f0 = hueco(z0)) <= 0)) {
      z1 = -1e9; ['i', 'd'].forEach(function (k) { z1 = Math.max(z1, s * E[k].tob[2], s * E[k].dedosPie[2], s * E[k].talon[2]); });
      z1 = s * (z1 + R + 8); z0 = z1; f1 = 1e9;
      for (i = 0; i < 44 && (fm = hueco(z0)) > 0; i++) { z1 = z0; f1 = fm; z0 -= 4 * s; }
      if (i === 44) return null;
      f0 = fm;
    }
    /* entre un sitio donde se mete (z0) y otro donde no llega (z1): se queda donde le falta menos de una décima de milímetro */
    for (i = 0; i < 16 && f1 > 0.01 && Math.abs(z1 - z0) > 1e-4; i++) {
      zm = i % 3 === 2 || f1 > 1e8 ? (z0 + z1) / 2 : z1 - entre((f1 - 0.005) / (f1 - f0), 0.02, 0.98) * (z1 - z0);
      fm = hueco(zm);
      if (fm > 0) { z1 = zm; f1 = fm; } else { z0 = zm; f0 = fm; }
    }
    return z1;
  }
  /* ── el fitball: una pelota grande en el suelo. o: { radio (30), en: [x, z] (quieta), sigue: { … } (rueda con lo que lleva encima):
     · que: 'tob', 'rod', 'mun', 'dedosPie'… (y lado: 'i' o 'd'; sin él, el medio de los dos): su centro va bajo ese punto del cuerpo,
       corrido dz; x: a qué lado va su centro (si no se dice, el del punto);
     · con mapa: [[z del punto, z del centro], …] no va debajo sino a su paso: el centro está en cada sitio cuando el punto está en
       el suyo, y entre medias, a partes iguales (una pelota que rueda bajo unas piernas que se recogen avanza menos que ellas);
     · que: 'pierna': va donde la pisan o descansan en ella las piernas (las dos, o la de un lado): llega rodando desde más allá de
       los pies (desde: 1, los pies hacia +z; −1, hacia −z) hasta tocar la zapatilla o la pierna (y el muslo, con muslo: true), tal
       como se dibujan, y ahí se queda } ── */
  MATERIAL.fitball = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#5B4FCF', '#9B8CFF', '#3a3190'); this.antes = true; this.c = this.centro(null); };
  MATERIAL.fitball.prototype.centro = function (E) {
    var o = this.o, R = o.radio || 30, en = o.en || [0, 30], q = o.sigue, p;
    if (q && E && q.que === 'pierna') {
      var piezas = [], z;
      (q.lado ? [q.lado] : ['i', 'd']).forEach(function (k) { piezas.push(['zapa', k], ['pierna', k]); if (q.muslo) piezas.push(['muslo', k]); });
      z = pelotaContra(E, piezas, q.x || 0, R, q.desde || 1, this.c ? this.c[2] : null);
      return [q.x || 0, R, z == null ? en[1] : z];                             /* si nada la toca, se queda donde se dijo */
    }
    if (q && E && q.mapa) {
      var M = q.mapa, v = (q.lado ? E[q.lado][q.que] : mezcla(E.i[q.que], E.d[q.que], 0.5))[2], j, t;
      for (j = 1; j < M.length - 1 && (M[j][0] - v) * (M[j][0] - M[0][0]) < 0; j++);
      t = entre((v - M[j - 1][0]) / ((M[j][0] - M[j - 1][0]) || 1), 0, 1);
      return [q.x || 0, R, M[j - 1][1] + (M[j][1] - M[j - 1][1]) * t];
    }
    if (q && E) { p = q.lado ? E[q.lado][q.que] : mezcla(E.i[q.que], E.d[q.que], 0.5); en = [q.x == null ? p[0] : q.x, p[2] + (q.dz || 0)]; }
    return [en[0], R, en[1]];
  };
  MATERIAL.fitball.prototype.colocar = function (E) { this.c = this.centro(E); };
  MATERIAL.fitball.prototype.extremos = function () { var R = this.o.radio || 30, c = this.centro(null); return [[c[0] - R, 0, c[2]], [c[0] + R, 2 * R, c[2]], [c[0], R, c[2] + R], [c[0], R, c[2] - R]]; };
  MATERIAL.fitball.prototype.pintar = function (E, cam, lista) {
    var o = this.o;
    this.e.pon(cam, this.c, o.radio || 30, lista, o.sesgo == null ? -10 : o.sesgo);
  };
  /* ── el disco (una pesa suelta). o: { radio (15), grosor (3.4), color, doble: true (dos discos juntos: la pinza),
       a: 'manos' (entre los dos puños: lo sujetan por los lados) | 'i' | 'd' (en una mano) | 'torax' | 'pelvis' (pegado al cuerpo),
       punto: [x, y, z] (en 'torax' y 'pelvis', dónde va su centro, en ese marco; en una mano, lo que se aparta del puño, en el mundo),
       corre: con las dos manos, lo que su centro se adelanta a los puños por donde apuntan las manos (cogido por arriba: las once y la una),
       eje: [x, y, z] (hacia dónde mira su cara, en el marco del tórax —o de la pelvis, si va en ella—; ejeMundo: en el del mundo),
       cinturon: true (cuelga de un cinturón de lastre: se pintan el cinturón y las dos cadenas) } ── */
  MATERIAL.disco = function (esc, o) {
    this.o = o || {}; this.d = new Disco(this.o.color || '#c9413f', M_COL.hierroS, M_COL.cromo);       /* de color: contra la camiseta, uno negro no se ve */
    if (this.o.doble) this.d2 = new Disco(this.o.color || '#c9413f', M_COL.hierroS, M_COL.cromo);
    if (this.o.cinturon) { this.cinto = new Caja(['#3a2f25', '#4a3b2d', '#2e251d', '#2e251d']); this.cad = [new Cilindro(M_COL.cromoS), new Cilindro(M_COL.cromoS)]; }
  };
  MATERIAL.disco.prototype.colocar = function () {};
  MATERIAL.disco.prototype.donde = function (E) {
    var o = this.o, a = o.a || 'manos', q = o.punto || [0, 0, 0], B = a === 'pelvis' ? E.Bp : E.Bt, c, e;
    if (a === 'manos') { c = mezcla(E.i.agarre, E.d.agarre, 0.5); if (o.corre) c = mas(c, por(unidad(mas(E.i.mano.dir, E.d.mano.dir), E.i.mano.dir), o.corre)); }
    else if (a === 'i' || a === 'd') c = mas(E[a].agarre, q);
    else c = mas(a === 'pelvis' ? E.pel : E.tor, aplicar(B, q));
    e = o.ejeMundo ? unidad(o.ejeMundo) : o.eje ? unidad(aplicar(B, o.eje)) : a === 'manos' ? unidad(cruz(menos(E.i.agarre, E.d.agarre), E.i.mano.dir), E.Bt[2]) : B[2];
    return [c, e];
  };
  MATERIAL.disco.prototype.pintar = function (E, cam, lista) {
    var o = this.o, R = o.radio || 15, g = o.grosor || 3.4, ce = this.donde(E), c = ce[0], e = ce[1], sg = o.sesgo == null ? -1.2 : o.sesgo, yo = this;
    if (this.d2) { this.d.pon(cam, mas(c, por(e, g / 2)), e, R, g, lista, sg); this.d2.pon(cam, mas(c, por(e, -g / 2)), e, R, g, lista, sg); }
    else this.d.pon(cam, c, e, R, g, lista, sg);
    if (this.cinto) {
      /* el cinturón, ceñido a la cintura (algo más ancho que ella), y las dos cadenas, que bajan por delante, desde el frente del
         cinturón al agujero del disco: pasan entre los muslos, no a través de ellos */
      this.cinto.pon(cam, mas(E.pel, aplicar(E.Bp, [0, 6, -0.6])), E.Bp, [34.6, 6.4, 25.2], lista, 0.6);
      [1, -1].forEach(function (s, i) { yo.cad[i].pon(cam, mas(E.pel, aplicar(E.Bp, [s * 4.5, 3.4, 12.7])), mas(c, por(e, s * g * 0.6)), 0.55, lista, 0.7); });
    }
  };
  /* ── el balón medicinal. o: { radio (11), en: [x, z] (quieto en el suelo: las manos se apoyan en él),
       suelta: [{ de, a, en: [x, y, z], u: [u0, u1], va, vuelve }] (un lanzamiento: en el tramo que va de la postura «de» a la «a», el
       balón deja las manos en u0 —el avance del tramo, de 0 a 1—, llega a «en» en u1 y vuelve a ellas al acabar el tramo; va y
       vuelve: con qué curva, 'sale' y 'entra' si no se dice) }
     Si no, va entre las dos manos ── */
  MATERIAL.balon_medicinal = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#d9682e', '#f39a5b', '#8f3d14'); this.antes = !!this.o.en; };
  MATERIAL.balon_medicinal.prototype.colocar = function () {};
  MATERIAL.balon_medicinal.prototype.centro = function (E, ctx) {
    var o = this.o, R = o.radio || 11, c, i, q, u, t, w;
    if (o.en) return [o.en[0], R, o.en[1]];
    c = mezcla(E.i.agarre, E.d.agarre, 0.5);
    for (i = 0; o.suelta && ctx && i < o.suelta.length; i++) {
      q = o.suelta[i]; u = ctx.u;
      if (q.de !== ctx.de || q.a !== ctx.a || u == null || u <= q.u[0]) continue;
      if (u < q.u[1]) { t = (u - q.u[0]) / (q.u[1] - q.u[0]); w = (CURVA[q.va] || CURVA.sale)(t); }
      else { t = (u - q.u[1]) / Math.max(1e-6, 1 - q.u[1]); w = 1 - (CURVA[q.vuelve] || CURVA.entra)(t); }
      c = mezcla(c, q.en, w);
    }
    return c;
  };
  MATERIAL.balon_medicinal.prototype.extremos = function () { var o = this.o, R = o.radio || 11, L = []; if (o.en) L.push([o.en[0] - R, 0, o.en[1]], [o.en[0] + R, 2 * R, o.en[1]]); (o.suelta || []).forEach(function (q) { L.push([q.en[0], q.en[1] + R, q.en[2]]); }); return L; };
  MATERIAL.balon_medicinal.prototype.pintar = function (E, cam, lista, ctx) {
    this.e.pon(cam, this.centro(E, ctx), this.o.radio || 11, lista, this.o.sesgo == null ? 1.2 : this.o.sesgo);
  };
  /* ── la cinta de suspensión: cuelga de un anclaje alto y acaba en dos asas, cada una con su estribo para el pie.
     o: { ancla: [x, y, z] (de dónde cuelga), cuello: lo que mide el tramo único antes de abrirse en dos (24),
          a: 'manos' (cada asa, en su puño) | 'i' | 'd' (las dos asas juntas en esa mano) | 'pies' (cada pie, en su estribo) }
     Se pinta el mosquetón, el cuello, los dos ramales (del cuello al vértice de cada asa) y cada asa: un triángulo de cinta con el mango
     de goma en su base (en los pies, el mango es la banda del estribo, sobre el empeine). La cinta no se estira: es la coreografía la
     que tiene que dejar las manos (o los pies) siempre a la misma distancia del anclaje ── */
  MATERIAL.suspension = function (esc, o) {
    this.o = o || {};
    var cinta = function (r) { return new Cilindro('#262a33', r ? 'rgba(244,196,48,.9)' : 'rgba(255,255,255,.18)'); };
    this.cuello = cinta(1); this.ramal = [cinta(1), cinta(1)]; this.lados = [0, 1, 2, 3].map(function () { return cinta(0); });
    this.mango = [new Cilindro(M_COL.goma, 'rgba(255,255,255,.28)'), new Cilindro(M_COL.goma, 'rgba(255,255,255,.28)')];
    this.mosq = new Cilindro(M_COL.cromo);
  };
  MATERIAL.suspension.prototype.colocar = function () {};
  MATERIAL.suspension.prototype.ancla = function () { return this.o.ancla || [0, 230, 0]; };
  MATERIAL.suspension.prototype.extremos = function () { var A = this.ancla(); return [[A[0] - 4, A[1] + 4, A[2]], [A[0] + 4, A[1] + 4, A[2]]]; };
  /* dónde va cada asa: [centro del mango, su eje] */
  MATERIAL.suspension.prototype.asas = function (E) {
    var a = this.o.a || 'manos';
    return ['i', 'd'].map(function (k, n) {
      var L = E[k];
      if (a === 'pies') return [mas(L.suela, mas(por(L.punta, 9), por(L.arriba, 8))), unidad(cruz(L.punta, L.arriba), [1, 0, 0])];
      if (a === 'i' || a === 'd') { L = E[a]; return [mas(L.agarre, por(L.mano.eje, n ? -0.9 : 0.9)), L.mano.eje]; }
      return [L.agarre, L.mano.eje];
    });
  };
  MATERIAL.suspension.prototype.pintar = function (E, cam, lista) {
    var o = this.o, A = this.ancla(), as = this.asas(E), yo = this, pies = o.a === 'pies', m = pies ? 6 : 6.5;
    var J = mas(A, por(unidad(menos(mezcla(as[0][0], as[1][0], 0.5), A), [0, -1, 0]), o.cuello == null ? 24 : o.cuello));
    this.mosq.pon(cam, mas(A, [0, 3, 0]), mas(A, [0, -3.5, 0]), 1.3, lista, 0.2);
    this.cuello.pon(cam, mas(A, [0, -3, 0]), J, 1.15, lista, 0.3);
    as.forEach(function (q, i) {
      var g = q[0], e = q[1], V = mas(g, por(unidad(menos(J, g), [0, 1, 0]), pies ? 15 : 12.5));
      yo.ramal[i].pon(cam, J, V, 1.05, lista, 0.3);
      yo.lados[i * 2].pon(cam, V, mas(g, por(e, m)), 0.6, lista, 0.5); yo.lados[i * 2 + 1].pon(cam, V, mas(g, por(e, -m)), 0.6, lista, 0.5);
      yo.mango[i].pon(cam, mas(g, por(e, -m)), mas(g, por(e, m)), pies ? 1.2 : 1.75, lista, 0.9);
    });
  };
  /* ── las anillas: dos aros de madera, cada uno colgado de su cinta. o: { alto (de dónde cuelgan: 250), sep (lo que separa los dos
     anclajes: 50), z }. Cada anilla va en su puño: el aro sube desde él hacia su anclaje, en el plano del puño y la cinta ── */
  MATERIAL.anillas = function (esc, o) {
    this.o = o || {};
    this.cinta = [0, 1].map(function () { return new Cilindro('#262a33', 'rgba(244,196,48,.9)'); });
    this.aro = [0, 1].map(function () { return new Aro(M_COL.madera, 'rgba(255,255,255,.45)'); });
  };
  MATERIAL.anillas.prototype.colocar = function () {};
  MATERIAL.anillas.prototype.ancla = function (s) { var o = this.o; return [s * (o.sep == null ? 50 : o.sep) / 2, o.alto || 250, o.z || 0]; };
  MATERIAL.anillas.prototype.extremos = function () { var a = this.ancla(1), b = this.ancla(-1); return [[a[0] + 3, a[1] + 3, a[2]], [b[0] - 3, b[1] + 3, b[2]]]; };
  MATERIAL.anillas.prototype.pintar = function (E, cam, lista) {
    var yo = this, R = 10.6;
    ['i', 'd'].forEach(function (k, i) {
      var L = E[k], A = yo.ancla(i ? -1 : 1), u = unidad(menos(A, L.agarre), [0, 1, 0]), c = mas(L.agarre, por(u, R));
      yo.aro[i].pon(cam, c, unidad(cruz(L.mano.eje, u), [0, 0, 1]), R, 1.5, lista, 0.9);
      yo.cinta[i].pon(cam, mas(c, por(u, R)), A, 1.0, lista, 0.3);
    });
  };
  /* ── la rueda abdominal: una rueda con su eje, que hace de mango a cada lado. Va entre los dos puños y rueda por el suelo (es la
     coreografía la que lleva las manos a la altura de su radio). o: { radio (9) } ── */
  MATERIAL.rueda = function (esc, o) {
    this.o = o || {};
    this.d = new Disco(M_COL.gomaL, M_COL.goma, M_COL.oro); this.eje = new Cilindro(M_COL.cromo);
    this.mango = [new Cilindro(M_COL.goma, 'rgba(255,255,255,.28)'), new Cilindro(M_COL.goma, 'rgba(255,255,255,.28)')];
  };
  MATERIAL.rueda.prototype.colocar = function () {};
  MATERIAL.rueda.prototype.pintar = function (E, cam, lista) {
    var gi = E.i.agarre, gd = E.d.agarre, c = mezcla(gi, gd, 0.5), e = unidad(menos(gi, gd), [1, 0, 0]), yo = this;
    this.eje.pon(cam, mas(gd, por(e, -6.5)), mas(gi, por(e, 6.5)), 1.1, lista, 0.5);
    [gi, gd].forEach(function (g, i) { yo.mango[i].pon(cam, mas(g, por(e, -5.5)), mas(g, por(e, 5.5)), 1.75, lista, 0.9); });
    this.d.pon(cam, c, e, this.o.radio || 9, 4.2, lista, 0.2);
  };
