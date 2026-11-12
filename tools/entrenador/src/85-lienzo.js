  /* ── Samsung Internet: el vídeo en un canvas (12 de noviembre de 2026) ──
     Con su modo oscuro, Samsung Internet repinta a su manera los dibujos SVG y no hace caso de color-scheme: a
     Jérôme le ponía la cara y el pelo casi negros (11-11-2026, el tour, captura de un usuario búlgaro). Lo único que
     deja tal cual es un canvas (probado ese día en un móvil con Samsung Internet 30). Es el mismo arreglo que el del
     tour (lienzo, en modulos/guia.js), traído aquí porque este módulo va solo: allí, el SVG sigue en su sitio y se
     anima igual, pero invisible, y un canvas encima lo copia pieza a pieza (trazados, círculos, elipses y
     rectángulos; colores, degradados, recortes, transparencias y el orden de pintar el borde) cada vez que algo
     cambia, 30 veces por segundo como mucho. Aquí el canvas cubre la escena justa (sin el cuarto de más por lado
     del tour: la escena recorta lo que sobresale) y va justo encima del SVG, debajo de los rótulos y los mandos.
     Si algo fallara al pintar, el SVG vuelve a verse. En los demás navegadores no se toca nada. */
  /* sin navigator (la auditoría carga el módulo fuera del navegador para leer sus coreografías), no es Samsung */
  var EN_SAMSUNG = false;
  try { EN_SAMSUNG = /SamsungBrowser\//.test(navigator.userAgent || ''); } catch (e) {}
  function lienzo(svg, caja, sobra) {
    sobra = sobra > 0 ? sobra : 0;
    if (typeof Path2D === 'undefined' || typeof DOMMatrix === 'undefined' || typeof MutationObserver === 'undefined') return null;
    var cv = document.createElement('canvas'), c = cv.getContext('2d');
    if (!c || !svg || typeof svg.getCTM !== 'function') return null;
    cv.className = 'tgv-lienzo'; cv.setAttribute('aria-hidden', 'true');
    caja.classList.add('tgv-con-lienzo');
    caja.insertBefore(cv, svg.nextSibling);
    svg.style.opacity = '0';
    var rutas = new Map(), grads = {}, libres = [], base = null, pendiente = 0, roto = false, mo = null, ro = null;
    var esc = function (id) { return window.CSS && CSS.escape ? CSS.escape(id) : id; };
    function idDe(v) { var m = /url\(\s*["']?#([^"')]+)["']?\s*\)/.exec(v || ''); return m ? m[1] : null; }
    function num(el, a, d) { var v = el.getAttribute(a); if (v == null || v === '') return d; var n = parseFloat(v); return /%\s*$/.test(v) ? n / 100 : n; }
    function alfa(color, a) {
      var m = /rgba?\(([^)]*)\)/.exec(color || ''); if (!m) return color;
      var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + ((p.length > 3 ? p[3] : 1) * (isFinite(a) ? a : 1)) + ')';
    }
    function ruta(el) {
      var t = el.localName, p;
      if (t === 'path') {
        var d = el.getAttribute('d') || '';
        p = rutas.get(d);
        if (!p) { p = new Path2D(d); if (rutas.size > 600) rutas.clear(); rutas.set(d, p); }
        return p;
      }
      p = new Path2D();
      if (t === 'circle') p.arc(el.cx.baseVal.value, el.cy.baseVal.value, el.r.baseVal.value, 0, 2 * Math.PI);
      else if (t === 'ellipse') p.ellipse(el.cx.baseVal.value, el.cy.baseVal.value, el.rx.baseVal.value, el.ry.baseVal.value, 0, 0, 2 * Math.PI);
      else if (t === 'rect') {
        var x = el.x.baseVal.value, y = el.y.baseVal.value, w = el.width.baseVal.value, h = el.height.baseVal.value;
        var rx = num(el, 'rx', null), ry = num(el, 'ry', null);
        if (rx == null) rx = ry || 0;
        if (ry == null) ry = rx;
        rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
        if (rx > 0 && ry > 0 && p.roundRect) p.roundRect(x, y, w, h, [{ x: rx, y: ry }]); else p.rect(x, y, w, h);
      } else return null;
      return p;
    }
    /* un degradado, leido una vez: sus paradas como las calcula el navegador (stop-color y stop-opacity) */
    function grad(id) {
      if (grads[id] !== undefined) return grads[id];
      var g = svg.querySelector('#' + esc(id)), out = null, antes = 0;
      if (g && (g.localName === 'linearGradient' || g.localName === 'radialGradient')) {
        var paradas = Array.prototype.map.call(g.querySelectorAll('stop'), function (s) {
          var cs = getComputedStyle(s), o = Math.max(antes, Math.min(1, Math.max(0, num(s, 'offset', 0))));
          antes = o;
          return [o, alfa(cs.stopColor, parseFloat(cs.stopOpacity))];
        });
        out = g.localName === 'radialGradient'
          ? { r: true, cx: num(g, 'cx', 0.5), cy: num(g, 'cy', 0.5), rr: num(g, 'r', 0.5), p: paradas }
          : { r: false, x1: num(g, 'x1', 0), y1: num(g, 'y1', 0), x2: num(g, 'x2', 1), y2: num(g, 'y2', 0), p: paradas };
      }
      return (grads[id] = out);
    }
    /* cada contexto lleva su desplazamiento (las capas son del tamaño de su grupo, no del canvas entero) */
    function poner(x, T) { if (x.tgvDx || x.tgvDy) x.setTransform(new DOMMatrix([1, 0, 0, 1, -x.tgvDx, -x.tgvDy]).multiply(T)); else x.setTransform(T); }
    function lleno(x, g, cx, cy, r, x1, y1, x2, y2) {
      var cg = g.r ? x.createRadialGradient(cx, cy, 0, cx, cy, r) : x.createLinearGradient(x1, y1, x2, y2);
      g.p.forEach(function (s) { cg.addColorStop(s[0], s[1]); });
      return cg;
    }
    /* el relleno: con un degradado, en las unidades de la caja de la figura (las de SVG por defecto), recortando la
       figura y llenando su caja: asi sale igual tambien el radial de la cara, que en su caja es una elipse */
    function relleno(x, el, T, p, pint, a, regla) {
      x.save(); poner(x, T); x.globalAlpha = a;
      var id = idDe(pint);
      if (!id) { x.fillStyle = pint; x.fill(p, regla); }
      else {
        var g = grad(id), bb = g && el.getBBox();
        if (g && bb.width > 0 && bb.height > 0) {
          x.clip(p, regla);
          x.transform(bb.width, 0, 0, bb.height, bb.x, bb.y);
          x.fillStyle = lleno(x, g, g.cx, g.cy, g.rr, g.x1, g.y1, g.x2, g.y2);
          x.fillRect(0, 0, 1, 1);
        }
      }
      x.restore();
    }
    /* el trazo; con un degradado, en la caja de la figura (en el tour, el aro: un circulo, con su caja cuadrada) */
    function trazo(x, el, T, p, pint, a, cs) {
      x.save(); poner(x, T); x.globalAlpha = a;
      x.lineWidth = parseFloat(cs.strokeWidth) || 1;
      x.lineCap = cs.strokeLinecap || 'butt';
      x.lineJoin = cs.strokeLinejoin === 'round' || cs.strokeLinejoin === 'bevel' ? cs.strokeLinejoin : 'miter';
      x.miterLimit = parseFloat(cs.strokeMiterlimit) || 4;
      var da = cs.strokeDasharray;
      x.setLineDash(da && da !== 'none' ? da.split(/[\s,]+/).map(parseFloat).filter(function (n) { return n >= 0; }) : []);
      x.lineDashOffset = parseFloat(cs.strokeDashoffset) || 0;
      var id = idDe(pint);
      if (!id) x.strokeStyle = pint;
      else {
        var g = grad(id), bb = g && el.getBBox();
        if (!g || !(bb.width > 0 && bb.height > 0)) { x.restore(); return; }
        var w = bb.width, h = bb.height;
        x.strokeStyle = lleno(x, g, bb.x + g.cx * w, bb.y + g.cy * h, g.rr * Math.max(w, h), bb.x + g.x1 * w, bb.y + g.y1 * h, bb.x + g.x2 * w, bb.y + g.y2 * h);
      }
      x.stroke(p);
      x.restore();
    }
    /* un recorte (clip-path): sus figuras, en el espacio de quien lo usa */
    function recortar(x, el, id) {
      var cp = svg.querySelector('#' + esc(id));
      if (!cp) return;
      var u = new Path2D();
      for (var k = cp.firstElementChild; k; k = k.nextElementSibling) {
        if (getComputedStyle(k).display === 'none') continue;
        var pk = ruta(k);
        if (!pk) continue;
        var tr = k.transform && k.transform.baseVal.consolidate();
        if (tr) u.addPath(pk, tr.matrix); else u.addPath(pk);
      }
      poner(x, base.multiply(el.getCTM()));
      x.clip(u);
    }
    /* un grupo (o una figura con relleno y trazo) con transparencia: aparte, en otra capa, y luego encima */
    function capa(x, a, fn, el) {
      var bb = el.getBBox(), M = base.multiply(el.getCTM()), xs = [], ys = [];
      [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].forEach(function (q) {
        var r = M.transformPoint(new DOMPoint(q[0], q[1])); xs.push(r.x); ys.push(r.y); });
      var m = 12 + 8 * Math.abs(M.a || M.d || 1), x0 = Math.max(0, Math.floor(Math.min.apply(null, xs) - m)), y0 = Math.max(0, Math.floor(Math.min.apply(null, ys) - m));
      var x1 = Math.min(cv.width, Math.ceil(Math.max.apply(null, xs) + m)), y1 = Math.min(cv.height, Math.ceil(Math.max.apply(null, ys) + m));
      if (!(x1 > x0 && y1 > y0)) return;
      var o = libres.pop() || document.createElement('canvas');
      if (o.width < x1 - x0 || o.height < y1 - y0) { o.width = Math.max(o.width, x1 - x0); o.height = Math.max(o.height, y1 - y0); }
      var oc = o.getContext('2d');
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.clearRect(0, 0, x1 - x0, y1 - y0);
      oc.tgvDx = x0; oc.tgvDy = y0;                 // en pixeles del canvas principal, como base
      oc.save(); fn(oc); oc.restore();
      x.save(); poner(x, new DOMMatrix()); x.globalAlpha = a; x.drawImage(o, 0, 0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); x.restore();
      libres.push(o);
    }
    function pieza(el, x) {
      var t = el.localName;
      if (t === 'defs' || t === 'clipPath' || t === 'linearGradient' || t === 'radialGradient' || t === 'title' || t === 'desc' ||
          t === 'style' || t === 'metadata' || t === 'mask' || t === 'pattern' || t === 'filter' || t === 'symbol') return;
      var cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      var op = parseFloat(cs.opacity);
      if (!(op > 0)) return;
      var rec = idDe(cs.clipPath);
      if (t === 'g') {
        var hijos = function (y) {
          y.save();
          if (rec) recortar(y, el, rec);
          for (var h = el.firstElementChild; h; h = h.nextElementSibling) pieza(h, y);
          y.restore();
        };
        if (op < 1) capa(x, op, hijos, el); else hijos(x);
        return;
      }
      if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return;
      var p = ruta(el);
      if (!p) return;
      var f = cs.fill, s = cs.stroke, hayF = !!f && f !== 'none', hayS = !!s && s !== 'none' && parseFloat(cs.strokeWidth) > 0;
      if (!hayF && !hayS) return;
      var T = base.multiply(el.getCTM()), regla = cs.fillRule === 'evenodd' ? 'evenodd' : 'nonzero';
      /* paint-order: stroke (el tronco y los miembros): primero el borde y encima el relleno */
      var antes = /^\s*stroke/.test(cs.paintOrder || '');
      var dibuja = function (y, a) {
        y.save();
        if (rec) recortar(y, el, rec);
        if (hayS && antes) trazo(y, el, T, p, s, a * parseFloat(cs.strokeOpacity), cs);
        if (hayF) relleno(y, el, T, p, f, a * parseFloat(cs.fillOpacity), regla);
        if (hayS && !antes) trazo(y, el, T, p, s, a * parseFloat(cs.strokeOpacity), cs);
        y.restore();
      };
      if (op < 1 && hayF && hayS) capa(x, op, function (y) { dibuja(y, 1); }, el); else dibuja(x, op);
    }
    /* si algo saliera mal, el SVG vuelve a verse tal cual: Jérôme nunca se queda sin dibujar */
    function soltar() {
      roto = true;
      if (mo) mo.disconnect();
      if (ro) ro.disconnect();
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      caja.classList.remove('tgv-con-lienzo');
      svg.style.opacity = '';
    }
    /* el canvas cubre el SVG y, si se pide, «sobra» de mas por cada lado (en el tour, un cuarto: los brazos en alto,
       el aro; aqui nada, la escena recorta lo que sobresale), con sus
       bordes en pixeles enteros de la pantalla y un pixel suyo por cada pixel de ella. Si no, el navegador lo
       reescala al ponerlo y los bordes salen algo blandos al lado de los del SVG, que se pinta justo donde cae. Sus
       medidas van en las del dibujo (sin las transformaciones de fuera): si algo de fuera lo mueve sin avisar, el
       canvas va con el SVG */
    var puesto = '';
    function dibujar() {
      if (roto || !svg.isConnected) return false;
      var cs = getComputedStyle(svg), lw = parseFloat(cs.width), lh = parseFloat(cs.height), sr = svg.getBoundingClientRect();
      if (!(lw > 0 && lh > 0 && sr.width > 0 && sr.height > 0)) return false;
      /* hasta tres pixeles por punto: con dos, en las pantallas de tres (las de muchos moviles de ahora) el navegador
         ampliaria el canvas y Jérôme se veria algo blando al lado del SVG; con mas, pintaria casi el doble. Y nunca
         mas de 4000 pixeles por lado: un Jérôme enorme se pinta con menos detalle, pero se pinta */
      var dpr = Math.min(3, window.devicePixelRatio || 1, 4000 / (sr.width * (1 + 2 * sobra) + 2), 4000 / (sr.height * (1 + 2 * sobra) + 2));
      var s = sr.width / lw, k = dpr * s;
      var X0 = Math.floor((sr.left - sr.width * sobra) * dpr), Y0 = Math.floor((sr.top - sr.height * sobra) * dpr);
      var W = Math.ceil((sr.right + sr.width * sobra) * dpr) - X0, H = Math.ceil((sr.bottom + sr.height * sobra) * dpr) - Y0;
      if (!(W > 0 && H > 0)) return false;
      var u0 = (X0 / dpr - sr.left) / s, v0 = (Y0 / dpr - sr.top) / s;
      var pon = [u0, v0, W / k, H / k].map(function (n) { return n.toFixed(4) + 'px'; });
      if (pon.join() !== puesto) {
        puesto = pon.join();
        cv.style.left = pon[0]; cv.style.top = pon[1]; cv.style.width = pon[2]; cv.style.height = pon[3];
      }
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      /* y el SVG lo pinta el navegador con sus bordes llevados al pixel entero mas cercano de la pantalla (y el dibujo
         estirado a esa medida): el canvas lo copia igual. Sin esto, el dibujo del canvas quedaba hasta medio pixel
         corrido y sus bordes no casaban con los del SVG (medido el 11-11-2026 en el tour) */
      var real = window.devicePixelRatio || 1, q = dpr / real;
      var sx0 = Math.round(sr.left * real) * q, sy0 = Math.round(sr.top * real) * q;
      var sx1 = Math.round(sr.right * real) * q, sy1 = Math.round(sr.bottom * real) * q;
      base = new DOMMatrix([(sx1 - sx0) / lw, 0, 0, (sy1 - sy0) / lh, sx0 - X0, sy0 - Y0]);
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H);
      try {
        for (var h = svg.firstElementChild; h; h = h.nextElementSibling) pieza(h, c);
      } catch (e) { soltar(); return false; }
      return true;
    }
    /* lo que se mueve solo con CSS (las estrellas que titilan, el fundido al cambiar de escena, los efectos de cada
       gesto) no toca el SVG y el observador no lo ve: mientras algo de eso este en marcha, se sigue pintando */
    function anima() {
      try {
        var a = typeof svg.getAnimations === 'function' ? svg.getAnimations({ subtree: true }) : [];
        for (var i = 0; i < a.length; i++) if (a[i].playState === 'running') return true;
      } catch (e) {}
      return false;
    }
    /* como mucho unas 30 veces por segundo: el dibujo se mueve con muelles suaves y en un movil de gama media
       pintarlo a cada fotograma le quitaria tiempo al resto de la pagina */
    var ultimo = 0;
    function tic(ahora) {
      pendiente = 0;
      if (ahora - ultimo < 30) { pedir(); return; }
      ultimo = ahora;
      if (dibujar() && anima()) pedir();
    }
    function pedir() { if (!pendiente && !roto) pendiente = requestAnimationFrame(tic); }
    /* el ambiente cambia sus degradados con el tema (los mismos ids, otros colores): si cambian los hijos, se releen */
    mo = new MutationObserver(function (rs) {
      for (var i = 0; i < rs.length; i++) if (rs[i].type === 'childList') { grads = {}; break; }
      pedir();
    });
    mo.observe(svg, { attributes: true, childList: true, subtree: true });
    mo.observe(caja, { attributes: true });
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(pedir); ro.observe(caja); }
    pedir();
    var api = { dibujar: dibujar, lienzo: cv, soltar: soltar };
    caja.tgvLienzo = api;
    return api;
  }
