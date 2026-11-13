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

  var MATERIAL = {};
  var N_MAT = 0;
  /* ── la barra: sigue a las manos, o va pegada al cuerpo (a la espalda, a la cadera), o en un punto del mundo.
     o: { ancla: 'manos' | 'torax' | 'pelvis' | 'mundo', en: [x, y, z], eje: [x, y, z], largo, discos (radio; 0, sin discos), z (barra Z) } */
  MATERIAL.barra = function (esc, o) {
    o = o || {};
    this.o = o; this.L = o.largo || 200; this.R = o.discos == null ? 21 : o.discos;
    this.barra = new Cilindro(M_COL.cromo); this.manguitos = [new Cilindro(M_COL.cromoS), new Cilindro(M_COL.cromoS)];
    this.discos = this.R ? [new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo), new Disco(o.color || '#c9413f', M_COL.hierroS, M_COL.cromo)] : [];
    this.c = [0, 100, 30]; this.eje = [1, 0, 0];
    this.antes = (o.ancla || 'manos') !== 'manos';
  };
  MATERIAL.barra.prototype.colocar = function (E, ctx) {
    var o = this.o, a = o.ancla || 'manos';
    if (o.reposo && ctx && ctx.reposo) { this.c = o.reposo; this.eje = [1, 0, 0]; }
    else if (a === 'manos') {
      this.c = mezcla(E.i.agarre, E.d.agarre, 0.5);
      var e = menos(E.i.agarre, E.d.agarre);
      this.eje = largo(e) > 4 ? unidad(e) : E.Bt[0];
      if (o.una) { this.c = E[o.una].agarre; this.eje = E[o.una].mano.eje; }
    } else if (a === 'torax') { this.c = mas(E.tor, aplicar(E.Bt, o.en)); this.eje = aplicar(E.Bt, o.eje || [1, 0, 0]); }
    else if (a === 'pelvis') { this.c = mas(E.pel, aplicar(E.Bp, o.en)); this.eje = aplicar(E.Bp, o.eje || [1, 0, 0]); }
    else { this.c = o.en; this.eje = unidad(o.eje || [1, 0, 0]); }
  };
  /* dónde se agarra: a x centímetros del centro, hacia la izquierda de Jérôme (+) o hacia su derecha (−) */
  MATERIAL.barra.prototype.agarre = function (x) { return mas(this.c, por(this.eje, x)); };
  MATERIAL.barra.prototype.extremos = function () {
    var h = this.L / 2, R = this.R || 2, c = this.c, e = this.eje, r = [];
    [1, -1].forEach(function (s) { var p = mas(c, por(e, s * h)); r.push(mas(p, [0, R, 0]), mas(p, [0, -R, 0]), mas(p, [0, 0, R]), mas(p, [0, 0, -R]), mas(p, [R, 0, 0]), mas(p, [-R, 0, 0])); });
    return r;
  };
  MATERIAL.barra.prototype.pintar = function (E, cam, lista) {
    var h = this.L / 2, c = this.c, e = this.eje, yo = this, sg = this.o.sesgo || 0;
    this.barra.pon(cam, mas(c, por(e, -h)), mas(c, por(e, h)), 1.5, lista, 2.2 + sg);
    [1, -1].forEach(function (s, i) {
      if (!yo.R) return;
      yo.manguitos[i].pon(cam, mas(c, por(e, s * (h - 36))), mas(c, por(e, s * h)), 2.4, lista, 2.3 + sg);
      yo.discos[i].pon(cam, mas(c, por(e, s * (h - 30))), e, yo.R, 4.4, lista, sg);
      yo.discos[i + 2].pon(cam, mas(c, por(e, s * (h - 24.6))), e, yo.R * 0.8, 3.4, lista, sg + (s * punto(e, cam.k) > 0 ? 0.6 : -0.6));
    });
  };
  /* ── las mancuernas: una en cada mano (o en una sola), con el eje del agarre ── */
  MATERIAL.mancuernas = function (esc, o) {
    o = o || {};
    this.o = o; this.lados = o.lado ? [o.lado] : ['i', 'd'];
    this.p = {};
    this.lados.forEach(function (k) { this.p[k] = { m: new Cilindro(M_COL.cromo), a: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL), b: new Disco(M_COL.hierro, M_COL.hierroS, M_COL.hierroL) }; }, this);
  };
  MATERIAL.mancuernas.prototype.colocar = function () {};
  MATERIAL.mancuernas.prototype.pintar = function (E, cam, lista) {
    var o = this.o, R = o.radio || 6.6;
    this.lados.forEach(function (k) {
      var L = E[k], c = L.agarre, e = o.vertical ? L.mano.dir : L.mano.eje, p = this.p[k];
      if (o.dos) { c = mezcla(E.i.agarre, E.d.agarre, 0.5); e = o.ejeDos ? aplicar(E.Bt, o.ejeDos) : L.mano.dir; }
      p.m.pon(cam, mas(c, por(e, -9)), mas(c, por(e, 9)), 1.4, lista, 0.9);
      p.a.pon(cam, mas(c, por(e, 10.5)), e, R, 5.4, lista, 0.4); p.b.pon(cam, mas(c, por(e, -10.5)), e, R, 5.4, lista, 0.4);
    }, this);
  };
  /* ── la pesa rusa: cuelga de la mano (o de las dos) ── */
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
    var b3 = mas(c, por(dir, 13.5)), b = cam.p(b3), a = cam.p(c), r = 9.2 * cam.esc;
    var px = -(b[1] - a[1]), py = b[0] - a[0], l = Math.sqrt(px * px + py * py) || 1; px = px / l * r * 0.62; py = py / l * r * 0.62;
    pon(this.asa, 'd', 'M' + n1(b[0] + px) + ',' + n1(b[1] + py) + ' Q' + n1(a[0] + px * 1.5) + ',' + n1(a[1] + py * 1.5) + ' ' + n1(a[0]) + ',' + n1(a[1]) + ' Q' + n1(a[0] - px * 1.5) + ',' + n1(a[1] - py * 1.5) + ' ' + n1(b[0] - px) + ',' + n1(b[1] - py));
    pon(this.asa, 'stroke-width', n1(2.6 * cam.esc));
    this.bola.pon(cam, b3, 9.2, lista, 0.6);
  };
  /* ── el banco: el asiento y, si se pide, el respaldo inclinado. o: { en: [x, z], rumbo, largo, alto, ancho, respaldo: grados, asiento: largo del asiento }
     El respaldo sale del asiento hacia +Z (con rumbo 180, hacia −Z: así se tumba Jérôme, que mira a +Z, con la cabeza hacia −Z).
     respaldo: 45, inclinado; 85, casi vertical (una silla); negativo, declinado (la cabeza más baja que la cadera) ── */
  MATERIAL.banco = function (esc, o) {
    o = o || {};
    this.o = o;
    var tap = [M_COL.tapizL, M_COL.tapiz, M_COL.tapizS, M_COL.tapizS], hie = [M_COL.hierroL, M_COL.hierro, M_COL.hierroS, M_COL.hierroS];
    this.asiento = new Caja(tap); this.resp = o.respaldo != null ? new Caja(tap) : null;
    this.patas = [new Caja(hie), new Caja(hie)]; this.puntal = new Cilindro(M_COL.hierro); this.pies = [new Cilindro(M_COL.hierroS), new Cilindro(M_COL.hierroS)];
    this.riel = this.resp ? new Cilindro(M_COL.hierroS) : null;
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
  };
  MATERIAL.banco.prototype.extremos = function () {
    var o = this.o, B = giroY(o.rumbo || 0), c = [o.en ? o.en[0] : 0, 0, o.en ? o.en[1] : 0], w = (o.ancho || 28) / 2, l = (o.largo || 120) / 2, h = o.alto || 44, r = [];
    [[-w, -l], [w, -l], [w, l], [-w, l]].forEach(function (q) { r.push(mas(c, aplicar(B, [q[0], 0, q[1]])), mas(c, aplicar(B, [q[0], h, q[1]]))); });
    if (o.respaldo != null) { var la = o.asiento || 38, lr = (o.largo || 120) - la; r.push(mas(c, aplicar(B, [0, h + Math.sin(o.respaldo * RAD) * lr, -l + la + Math.cos(o.respaldo * RAD) * lr]))); }
    return r;
  };
  /* dónde queda la superficie del banco (para tumbarse o sentarse): un punto a z del centro, y el respaldo */
  MATERIAL.banco.prototype.alto = function () { return this.o.alto || 44; };
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
      yo.ganchos[i].pon(cam, [s * w, h - 2.5, z], [s * w, h - 2.5, z + 7], 1.6, lista, sg + 0.5);
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
  /* ── la esterilla ── */
  MATERIAL.esterilla = function (esc, o) { this.o = o || {}; this.c = new Caja(['#5B4FCF', '#463cab', '#3a3190', '#3a3190']); this.antes = true; };
  MATERIAL.esterilla.prototype.colocar = function () {};
  MATERIAL.esterilla.prototype.pintar = function (E, cam, lista) {
    var o = this.o, B = giroY(o.rumbo || 0);
    this.c.pon(cam, [o.en ? o.en[0] : 0, 0.8, o.en ? o.en[1] : 0], B, o.med || [62, 1.6, 180], lista, -400);
  };
  /* ── la pared: un paño vertical, que no tape a Jérôme ── */
  MATERIAL.pared = function (esc, o) {
    this.o = o || {}; this.g = crear('g');
    this.f = crear('path', { fill: '#e9e2d2', stroke: '#cfc5ad', 'stroke-width': 1, 'stroke-linejoin': 'round' }, this.g);
    this.z = crear('path', { fill: '#b9ae93' }, this.g);
    this.l = crear('path', { fill: 'none', stroke: '#d8cfba', 'stroke-width': 1 }, this.g);
    this.antes = true;
  };
  MATERIAL.pared.prototype.colocar = function () {};
  MATERIAL.pared.prototype.extremos = function () { var o = this.o, z = o.z == null ? 40 : o.z; return [[(o.x || 0) - 40, 0, z], [(o.x || 0) + 40, 150, z]]; };
  MATERIAL.pared.prototype.pintar = function (E, cam, lista) {
    var o = this.o, z = o.z == null ? 40 : o.z, w = o.ancho || 150, h = o.alto || 215, n = o.normal || [0, 0, -1], gr = 8;
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
  };
  /* ── la polea: la columna, la polea a su altura y el cable hasta el agarre.
     o: { en: [x, z], alto, rumbo, a: 'manos' | 'i' | 'd' | 'tobillo-i', agarre: 'barra' | 'cuerda' | 'asa' | 'v' (el triángulo de palmas enfrentadas) }
     La máquina de jalón es esta misma con: brazo (cuánto sale de la columna el brazo de arriba hacia quien tira; la polea va en su
     punta), asiento: [a cuánto de la columna, alto] y rodillo: [a cuánto de la columna, alto] (el que sujeta los muslos).
     reposo: [x, y, z], dónde cuelga el agarre mientras nadie lo ha cogido (en las posturas que la coreografía diga en «reposo»).
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
    var a = o.a || 'manos', fin, yo = this, suelto = !!(o.reposo && ctx && ctx.reposo);
    var ag = o.agarre || (a === 'manos' ? 'barra' : 'asa'), ver = { asa: false, cuerda: false, uve: false };
    /* el agarre: en las manos, o colgando del cable si aún no se ha cogido */
    var gi, gd, eje;
    if (suelto) {
      fin = o.reposo;
      var cae = unidad(menos(fin, pp), [0, -1, 0]), lat = unidad(cruz(cae, B[2]), B[0]), w = ag === 'barra' ? (o.ancho0 || 30) : ag === 'cuerda' ? 3 : 5.5;
      gi = mas(fin, por(lat, w)); gd = mas(fin, por(lat, -w)); eje = ag === 'v' ? B[2] : lat;
      if (ag === 'cuerda') { fin = mas(fin, por(cae, -29.8)); gi = mas(fin, mas(por(cae, 29.8), por(lat, 3))); gd = mas(fin, mas(por(cae, 29.8), por(lat, -3))); }
    } else {
      if (a === 'manos') fin = mezcla(E.i.agarre, E.d.agarre, 0.5);
      else if (a === 'i' || a === 'd') fin = E[a].agarre;
      else if (a === 'tobillo-i' || a === 'tobillo-d') fin = E[a.slice(-1)].tob;
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
  MATERIAL.landmine.prototype.colocar = function (E, ctx) { this.suelta = !!(this.o.reposo && ctx && ctx.reposo); };
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
  /* ── algo blando: una toalla doblada. o: { en: [x, y, z] (su centro), rumbo, cabeceo, med: [ancho, alto, largo] } ── */
  MATERIAL.toalla = function (esc, o) { this.o = o || {}; this.c = new Caja(['#f4f1ea', '#e2ddd0', '#cfc8b6', '#cfc8b6']); this.antes = true; };
  MATERIAL.toalla.prototype.colocar = function () {};
  MATERIAL.toalla.prototype.pintar = function (E, cam, lista) {
    var o = this.o;
    this.c.pon(cam, o.en, componer(giroY(o.rumbo || 0), giroX(o.cabeceo || 0)), o.med || [26, 3, 14], lista, o.sesgo == null ? -13 : o.sesgo, 'fondo');
  };
  /* ── la banda elástica: de un punto a la mano (o de un pie a su mano, o de una mano a la otra). o: { de: 'pies' | [x,y,z] | 'i', a: 'manos' | 'i' | 'd' } ── */
  MATERIAL.banda = function (esc, o) {
    this.o = o || {}; this.g = crear('g');
    this.t = [0, 1, 2, 3].map(function () { var p = trazo('', (o && o.color) || M_COL.banda, 2); this.g.appendChild(p); return p; }, this);
    this.antes = false;
  };
  MATERIAL.banda.prototype.colocar = function () {};
  MATERIAL.banda.prototype.pintar = function (E, cam, lista) {
    var o = this.o, tramos = [], zs = 0, yo = this;
    var pie = function (k) { return mas(E[k].suela, por(E[k].punta, 6)); };
    if (o.de === 'pies') { ['i', 'd'].forEach(function (k) { if (!o.a || o.a === 'manos' || o.a === k) tramos.push([pie(o.unPie ? o.unPie : k), E[k].agarre]); }); if (!o.unPie) tramos.push([pie('i'), pie('d')]); }
    else if (o.de === 'manos') tramos.push([E.i.agarre, E.d.agarre]);
    else if (o.de === 'rodillas') { var r1 = mas(E.i.rod, por(E.i.qu, -7)), r2 = mas(E.d.rod, por(E.d.qu, -7)); tramos.push([mas(r1, [0, 0, 6]), mas(r2, [0, 0, 6])], [mas(r1, [0, 0, -6]), mas(r2, [0, 0, -6])]); }
    else if (o.de === 'tobillos') tramos.push([mas(E.i.tob, [0, 3, 0]), mas(E.d.tob, [0, 3, 0])]);
    else { var ks = o.a === 'i' || o.a === 'd' ? [o.a] : ['i', 'd']; ks.forEach(function (k) { tramos.push([o.de, E[k].agarre]); }); }
    this.t.forEach(function (p, i) {
      if (!tramos[i]) { p.style.display = 'none'; return; }
      p.style.display = '';
      var a = cam.p(tramos[i][0]), b = cam.p(tramos[i][1]), l = largo(menos(tramos[i][0], tramos[i][1]));
      /* cuanto más se estira, más fina */
      ponLinea(p, a, b, entre(4.2 - l / 45, 1.6, 3.6) * cam.esc * 0.55);
      zs = Math.max(zs, (a[2] + b[2]) / 2);
    });
    lista.push({ z: zs + 2, el: this.g });
  };
  /* ── el fitball ── */
  MATERIAL.fitball = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#5B4FCF', '#9B8CFF', '#3a3190'); this.antes = true; };
  MATERIAL.fitball.prototype.colocar = function () {};
  MATERIAL.fitball.prototype.extremos = function () { var o = this.o, R = o.radio || 30, en = o.en || [0, 30]; return [[en[0] - R, 0, en[1]], [en[0] + R, 2 * R, en[1]], [en[0], R, en[1] + R], [en[0], R, en[1] - R]]; };
  MATERIAL.fitball.prototype.pintar = function (E, cam, lista, ctx) {
    var o = this.o, R = o.radio || 30, en = (ctx && ctx.fitball) || o.en || [0, 30];
    this.e.pon(cam, [en[0], R, en[1]], R, lista, o.sesgo == null ? -10 : o.sesgo);
  };
  /* ── el disco y el balón: entre las manos ── */
  MATERIAL.disco = function (esc, o) { this.o = o || {}; this.d = new Disco(M_COL.goma, M_COL.hierroS, M_COL.cromo); };
  MATERIAL.disco.prototype.colocar = function () {};
  MATERIAL.disco.prototype.pintar = function (E, cam, lista) {
    var o = this.o, c = mezcla(E.i.agarre, E.d.agarre, 0.5), e = o.eje ? aplicar(E.Bt, o.eje) : unidad(cruz(menos(E.i.agarre, E.d.agarre), E.i.mano.dir), E.Bt[2]);
    this.d.pon(cam, c, e, o.radio || 15, 3.4, lista, o.sesgo == null ? -1.2 : o.sesgo);
  };
  MATERIAL.balon_medicinal = function (esc, o) { this.o = o || {}; this.e = new Esfera(esc.defs, 'tgm' + (++N_MAT), '#d9682e', '#f39a5b', '#8f3d14'); };
  MATERIAL.balon_medicinal.prototype.colocar = function () {};
  MATERIAL.balon_medicinal.prototype.pintar = function (E, cam, lista, ctx) {
    var c = (ctx && ctx.balon) || mezcla(E.i.agarre, E.d.agarre, 0.5);
    this.e.pon(cam, c, this.o.radio || 11, lista, 1.2);
  };
