/* Tenerife Go · «Su cuerpo» en 3D. Motor propio sobre WebGL2, sin librerías.
   Dibuja un cuerpo humano (malla y texturas de MakeHuman, CC0) con su pelo, su ropa y el
   mapa de músculos. Todo se calcula en el dispositivo; nada sale de él.

   El motor de la maqueta «Su cuerpo Amanecer» (6-11-2026), pasado a la app el 7-11-2026 (bloque 3
   del rediseño): los datos llegan en ficheros binarios sueltos (datos/cuerpo3d/, que hace
   tools/cuerpo3d/empaqueta3d.py) y solo los del aspecto elegido, con un cargador propio
   (TG_CUERPO3D.cargador); las mallas y las variantes pueden llegar después de crear el motor;
   las texturas se piden por su URL; y el aspecto lleva el audífono (detrás de la oreja) y la
   prótesis de pierna o de brazo (el encaje, el tubo y el pie o la mano, como en el dibujo). La
   pantalla (modulos/cuerpo.js) lo pide al abrirse, si hay WebGL 2; si no, queda el dibujo. */
(function (raiz) {
  'use strict';

  /* ---------- utilidades ---------- */
  /* los datos vienen en binario (Uint8Array, del cargador) o, como en la maqueta, en base64 */
  function bytes(x) {
    if (x instanceof Uint8Array) return x;
    if (x instanceof ArrayBuffer) return new Uint8Array(x);
    var s = atob(x), n = s.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = s.charCodeAt(i);
    return u;
  }
  function u16(x) { var u = bytes(x); return new Uint16Array(u.buffer, u.byteOffset, u.length >> 1); }
  function u32(x) { var u = bytes(x); return new Uint32Array(u.buffer, u.byteOffset, u.length >> 2); }
  function i16(x) { var u = bytes(x); return new Int16Array(u.buffer, u.byteOffset, u.length >> 1); }
  function srgbLin(x) { return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
  function hex(h) {            /* '#RRGGBB' → [r,g,b] lineal */
    var n = parseInt(h.slice(1), 16);
    return [srgbLin(((n >> 16) & 255) / 255), srgbLin(((n >> 8) & 255) / 255), srgbLin((n & 255) / 255)];
  }
  function hexS(h) { var n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  function persp(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2);
    return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  }
  function norm3(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function paso(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  /* la curva de tono del sombreador y su inversa (para que la piel salga del color elegido) */
  function tonoF(c) { var x = Math.max(0, c - 0.004); return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06); }
  function tonoInv(v) { var a = 0, b = 16; for (var i = 0; i < 40; i++) { var m = (a + b) / 2; if (tonoF(m) < v) a = m; else b = m; } return (a + b) / 2; }

  /* ---------- sombreadores ---------- */
  var VS = [
    '#version 300 es',
    'in vec3 aPos; in vec3 aNor; in vec2 aUv; in float aExtra; in float aCuero; in vec3 aG1; in vec3 aG2; in float aProt;',
    'uniform mat4 uVP; uniform mat3 uGiro; uniform vec3 uPiv; uniform float uInfla; uniform vec3 uResp; uniform mat4 uLuzVP; uniform vec2 uGesto;',
    'out vec3 vN; out vec2 vUv; out vec3 vP; out vec3 vO; out float vX; out vec3 vL; out float vC; out float vPr;',
    'void main(){',
    /* la prótesis (7-11-2026): 1 en los vértices del miembro que la lleva; los cortes los pone el sombreador de fragmentos */
    '  vPr = aProt;',
    /* los gestos de la cara: parpadeo (aG1) y sonrisa (aG2) */
    '  vec3 pg = aPos + aG1 * uGesto.x + aG2 * uGesto.y;',
    '  vec3 p0 = pg + aNor * uInfla;',
    /* la respiración: el pecho sube un punto hacia delante y hacia arriba */
    '  float wr = (1.0 - smoothstep(0.0, 1.0, abs(aPos.y - uResp.y) / uResp.z)) * smoothstep(-0.2, 0.9, aPos.z);',
    '  p0 += vec3(0.0, 0.35, 1.0) * (uResp.x * wr);',
    '  vec3 p = uGiro * (p0 - uPiv) + uPiv;',
    '  vP = p; vO = aPos; vN = uGiro * aNor; vUv = aUv; vX = aExtra; vC = aCuero;',
    '  vec4 pl = uLuzVP * vec4(p, 1.0); vL = pl.xyz * 0.5 + 0.5;',
    '  gl_Position = uVP * vec4(p, 1.0);',
    '}'].join('\n');

  var CAB = ['#version 300 es', 'precision highp float;',
    'precision highp sampler2DShadow;',
    'in vec3 vN; in vec2 vUv; in vec3 vP; in vec3 vO; in float vX; in vec3 vL; in float vC; in float vPr;',
    'uniform vec3 uCam; uniform sampler2DShadow uSombra; uniform float uSombraK; uniform float uSesgoMas;',
    'uniform vec3 uSolDir; uniform vec3 uSolCol;',
    'uniform vec3 uCielo; uniform vec3 uSuelo;',
    'uniform vec3 uContraDir; uniform vec3 uContraCol;',
    'uniform float uExpo;',
    'uniform vec3 uBarr;',          /* x: altura de la línea de barrido; y: fuerza del destello */
    'out vec4 o;',
    /* 1 = al sol, 0 = a la sombra: cuatro lecturas alrededor del punto (cada una ya promedia 2×2) */
    'float sol(vec3 n){',
    '  float sesgo = 0.0016 + 0.0050 * (1.0 - clamp(dot(n, uSolDir), 0.0, 1.0)) + uSesgoMas;',
    '  vec3 q = vec3(vL.xy, vL.z - sesgo); float t = 1.1 / 1024.0;',
    '  float s = texture(uSombra, q + vec3(-t, -t, 0.0)) + texture(uSombra, q + vec3(t, -t, 0.0)) + texture(uSombra, q + vec3(-t, t, 0.0)) + texture(uSombra, q + vec3(t, t, 0.0));',
    '  return mix(1.0, s * 0.25, uSombraK);',
    '}',
    'vec3 destello(){ float d = (vP.y - uBarr.x) / 0.09; return vec3(1.0, 0.90, 0.62) * exp(-d * d) * uBarr.y; }',
    'vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }',
    'vec3 ambiente(vec3 n){ float h = n.y * 0.5 + 0.5; return mix(uSuelo, uCielo, h * h * (3.0 - 2.0 * h)); }',
    'vec3 tono(vec3 c){ c *= uExpo; vec3 x = max(vec3(0.0), c - 0.004); return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06); }',
    'float trama(vec2 p){ return (fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0; }',
    'float ruido(vec3 p){ return fract(sin(dot(floor(p), vec3(12.9898, 78.233, 37.719))) * 43758.5453); }'
  ].join('\n');

  var FS_PIEL = [CAB,
    'uniform sampler2D uDetA; uniform sampler2D uDetO;',
    'uniform vec3 uMediaA; uniform vec3 uMediaO; uniform float uOsc;',
    'uniform vec3 uTono; uniform float uBrilloPiel; uniform vec4 uRapado;',
    'uniform sampler2D uMusId; uniform sampler2D uMusDist; uniform float uMus[36];',
    'uniform vec3 uSom[4]; uniform vec3 uSurco; uniform float uLuzMan; uniform vec3 uContraS;',
    'uniform vec3 uNiv[4]; uniform vec3 uBaseMus; uniform vec3 uCorteCab; uniform float uRelieve; uniform float uT; uniform float uDepura;',
    'uniform vec3 uProtCol[2]; uniform vec3 uProtEje; uniform vec3 uProtOrg; uniform vec3 uProtC;',
    /* la prótesis (7-11-2026): en el miembro que la lleva (vPr), la posición a lo largo del hueso (desde la rodilla
       o el codo) dice la zona: 0 piel, 1 el encaje, 2 nada (ahí va el tubo), 3 el pie o la mano. El corte es un
       plano exacto: con la zona en el vértice saldría a dientes, fila a fila de la malla */
    'float zonaProt(){ if (vPr < 0.5) return 0.0; float t = dot(vO - uProtOrg, uProtEje); return t < uProtC.x ? 0.0 : t < uProtC.y ? 1.0 : t < uProtC.z ? 2.0 : 3.0; }',
    'void main(){',
    /* entre el encaje y el pie (o la mano) no hay piel, va el tubo; el encaje y el pie o la mano son una carcasa
       mate, sin músculos debajo, en los dos modos */
    '  float zp = zonaProt();',
    '  if (zp == 2.0) discard;',
    '  vec3 n = normalize(vN); vec3 v = normalize(uCam - vP);',
    '  vec3 h = normalize(uSolDir + v);',
    '  float nv = max(dot(n, v), 0.0);',
    '  if (zp > 0.5) {',
    '    vec3 ap = zp > 2.5 ? uProtCol[1] : uProtCol[0];',
    '    float dp = dot(n, uSolDir); float sp = sol(n);',
    '    float ep = pow(max(dot(n, h), 0.0), 36.0) * 0.22 * max(dp, 0.0);',
    '    float dcp = max(dot(n, uContraDir), 0.0);',
    '    vec3 cp = ap * (vec3(smoothstep(-0.25, 1.0, dp)) * uSolCol * mix(0.32, 1.0, sp) + ambiente(n)) + uSolCol * ep * sp + ap * uContraCol * dcp * (0.25 + 0.75 * pow(1.0 - nv, 2.0)) * 1.5;',
    '    o = vec4(tono(cp) + destello() + trama(gl_FragCoord.xy), 1.0); return;',
    '  }',
    /* el maniquí de músculos es todo el cuerpo menos la cabeza */
    '  float yc = uCorteCab.x + uCorteCab.y * vO.z;',
    '  float lado = smoothstep(uBarr.x - 0.03, uBarr.x + 0.03, vP.y);',          /* por encima de la línea, músculos */
    '  float man = lado * smoothstep(yc + uCorteCab.z, yc - uCorteCab.z, vO.y);',
    '  if (vX > 0.06 && lado < 0.5) discard;',
    '  vec3 col = vec3(0.0);',
    '  if (man < 0.999) {',
    '    vec3 da = lin(texture(uDetA, vUv).rgb) / uMediaA;',
    '    vec3 db = lin(texture(uDetO, vUv).rgb) / uMediaO;',
    '    vec3 det = mix(da, db, uOsc);',
    '    det = mix(vec3(dot(det, vec3(0.3333))), det, 0.92);',
    '    vec3 alb = uTono * det;',
    /* pelo rapado: el cuero cabelludo se tiñe del color del pelo, con un punteado fino */
    '    float rap = uRapado.a * smoothstep(0.30, 0.62, vC);',
    '    if (rap > 0.0) { float pt = ruido(vO * 260.0) * 0.5 + ruido(vO * 130.0) * 0.5; alb = mix(alb, uRapado.rgb * (0.55 + 0.9 * pt), rap * (0.62 + 0.30 * pt)); }',
    '    float ao = 1.0 - 0.34 * smoothstep(-0.26, 0.04, vX) * (1.0 - lado);',     /* sombra de contacto junto al borde de la ropa */
    '    float d1 = dot(n, uSolDir);',
    /* difusa envolvente: la penumbra se tiñe de rojo, como en la piel */
    '    vec3 dif = vec3(smoothstep(-0.34, 1.0, d1), smoothstep(-0.17, 1.0, d1), smoothstep(-0.07, 1.0, d1));',
    '    vec3 amb = ambiente(n) * ao;',
    '    float fres = pow(1.0 - nv, 4.0);',
    '    float nh = max(dot(n, h), 0.0);',
    '    float esp = (pow(nh, 60.0) * 0.16 + pow(nh, 10.0) * 0.045) * (0.55 + 0.9 * fres) * max(d1, 0.0) * uBrilloPiel;',
    '    float dc = max(dot(n, uContraDir), 0.0);',
    '    vec3 contra = uContraCol * (pow(dc, 1.5) * (0.20 + 0.80 * pow(1.0 - nv, 2.0)));',
    '    float sl = sol(n);',
    '    col = alb * (dif * uSolCol * mix(0.8, 1.0, ao) * mix(0.30, 1.0, sl) + amb * mix(0.86, 1.0, sl)) + uSolCol * esp * sl + alb * contra * 1.5 + contra * 0.08 + amb * fres * 0.08;',
    '  }',
    '  vec3 fin = tono(col);',
    '  if (man > 0.001) {',
    '    int id = int(texture(uMusId, vUv).r * 255.0 + 0.5);',
    '    float dist = texture(uMusDist, vUv).r;',
    '    float cod = uMus[id]; float niv = mod(cod, 10.0); float sel = step(9.5, mod(cod, 100.0)); float prio = step(99.5, cod);',
    '    float mus = id == 0 ? 0.0 : 1.0;',
    '    int ni = int(niv + 0.5);',
    '    vec3 claro = id == 0 ? uBaseMus : uNiv[ni];',
    '    vec3 oscuro = id == 0 ? uBaseMus * 0.45 : uSom[ni];',
    '    if (uDepura > 0.5 && id > 0) { claro = 0.5 + 0.5 * cos(6.2831 * (float(id) * 0.381 + vec3(0.0, 0.33, 0.67))); oscuro = claro * 0.4; }',
    /* relieve: cada músculo es una almohadilla que sube desde el surco de su borde */
    '    float alt = mus * (1.0 - pow(1.0 - smoothstep(0.0, 0.9, dist), 2.0));',
    '    vec3 dpx = dFdx(vP), dpy = dFdy(vP); float hx = dFdx(alt), hy = dFdy(alt);',
    '    vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float dt = dot(dpx, r1);',
    '    vec3 nb = normalize(abs(dt) * n - uRelieve * sign(dt) * (hx * r1 + hy * r2));',
    '    float d1m = dot(nb, uSolDir);',
    /* la luz, como un solo número: el color va de su sombra a su tono (colores de pantalla, sin curva) */
    '    float slm = sol(n);',
    '    float luzM = clamp(0.16 + 0.80 * smoothstep(-0.45, 0.85, d1m) * mix(0.45, 1.0, slm) + 0.16 * (nb.y * 0.5 + 0.5), 0.0, 1.0) * uLuzMan;',
    '    vec3 cM = mix(oscuro, claro, luzM);',
    '    cM *= mix(0.90, 1.05, smoothstep(0.25, 1.0, dist) * mus);',
    '    float surco = mix(1.0, smoothstep(0.0, 0.15, dist), mus);',
    '    cM = mix(mix(uSurco, oscuro * 0.6, 0.45), cM, surco);',
    '    cM *= mix(0.80, 1.0, smoothstep(0.10, 0.42, dist) * mus + (1.0 - mus));',
    '    float espM = pow(max(dot(nb, h), 0.0), 34.0) * max(d1m, 0.0);',
    '    cM += (id == 0 ? 0.10 : mix(0.10, 0.22, niv / 3.0)) * espM * uLuzMan;',
    '    float dcm = max(dot(nb, uContraDir), 0.0);',
    '    cM += (claro * 0.5 + 0.06) * uContraS * dcm * pow(1.0 - nv, 2.0) * 0.9;',
    /* el grupo elegido: un filo blanco que late; los prioritarios de un deporte: un filo a rayas */
    '    float filo = (1.0 - smoothstep(0.16, 0.26, dist)) * smoothstep(0.02, 0.10, dist) * mus;',
    '    cM = mix(cM, vec3(1.0), filo * sel * (0.80 + 0.20 * sin(uT * 4.0)));',
    '    float raya = step(0.5, fract((vO.x + vO.y * 1.3 + vO.z) * 6.5));',
    '    cM = mix(cM, vec3(0.94, 0.925, 0.89), filo * prio * raya * (1.0 - sel));',
    '    fin = mix(fin, cM, man);',
    '  }',
    '  o = vec4(fin + destello() + trama(gl_FragCoord.xy), 1.0);',
    '}'].join('\n');

  var FS_OJO = [CAB,
    'uniform sampler2D uTex;',
    'void main(){',
    '  vec4 t = texture(uTex, vUv);',
    '  if (t.a < 0.5) discard;',
    '  vec3 n = normalize(vN); vec3 v = normalize(uCam - vP);',
    '  vec3 alb = lin(t.rgb);',
    '  float d1 = dot(n, uSolDir);',
    '  vec3 col = alb * (smoothstep(-0.6, 1.0, d1) * uSolCol * 0.62 * mix(0.45, 1.0, sol(n)) + ambiente(n) * 0.85);',
    '  vec3 h = normalize(uSolDir + v);',
    '  col += uSolCol * pow(max(dot(n, h), 0.0), 260.0) * 1.3;',
    '  o = vec4(tono(col) + trama(gl_FragCoord.xy), 1.0);',
    '}'].join('\n');

  /* pelo: R = detalle de claridad, G/B = dirección del mechón (ángulo doble), A = alfa */
  var FS_PELO = [CAB,
    'uniform sampler2D uTex; uniform vec3 uColor; uniform float uPase; uniform float uCorte;',
    'void main(){',
    '  vec4 t = texture(uTex, vUv);',
    '  float a = t.a;',
    '  if (uPase < 0.5) { if (a < uCorte) discard; a = 1.0; }',
    '  else { if (a >= uCorte || a < 0.03) discard; a = smoothstep(0.0, uCorte, a); }',
    '  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    '  vec3 v = normalize(uCam - vP);',
    /* la dirección del mechón en 3D, a partir de la que trae la textura */
    '  vec2 q = t.gb * 2.0 - 1.0; float coh = clamp(length(q), 0.0, 1.0); coh *= coh;',
    '  float ang = 0.5 * atan(q.y, q.x);',
    '  vec2 d = vec2(cos(ang), sin(ang));',
    '  vec3 dpx = dFdx(vP), dpy = dFdy(vP); vec2 dux = dFdx(vUv), duy = dFdy(vUv);',
    '  float det = dux.x * duy.y - dux.y * duy.x;',
    '  vec3 T = vec3(0.0, 1.0, 0.0);',
    '  if (abs(det) > 1e-12) { vec3 Pu = (dpx * duy.y - dpy * dux.y) / det; vec3 Pv = (dpy * dux.x - dpx * duy.x) / det; T = Pu * d.x + Pv * d.y; }',
    '  T = normalize(T - n * dot(T, n) + vec3(0.0, 1e-4, 0.0));',
    /* la textura da la dirección del mechón, pero no su sentido: se toma siempre el que cae (de la raíz a la punta);
       sin esto el brillo se desplaza a un lado o al otro por zonas y el pelo oscuro sale a manchas */
    '  if (T.y > 0.0) T = -T;',
    '  float lum = t.r * 2.0;',                                    /* 1 = la media */
    '  vec3 alb = uColor * (0.50 + 0.50 * lum * lum);',
    '  float d1 = dot(n, uSolDir);',
    '  float tl = dot(T, uSolDir);',
    '  float difK = sqrt(max(0.0, 1.0 - tl * tl));',               /* Kajiya-Kay */
    '  vec3 dif = vec3(mix(smoothstep(-0.4, 1.0, d1), difK * smoothstep(-0.5, 0.6, d1), 0.35 * coh)) * 0.86;',
    '  vec3 h = normalize(uSolDir + v);',
    '  float th1 = dot(normalize(T + n * (0.10 + (lum - 1.0) * 0.20)), h);',
    '  float th2 = dot(normalize(T - n * (0.16 - (lum - 1.0) * 0.20)), h);',
    '  float sombra = smoothstep(-0.25, 0.45, d1);',
    '  float clr = dot(uColor, vec3(0.2126, 0.7152, 0.0722));',
    '  float e1 = pow(sqrt(max(0.0, 1.0 - th1 * th1)), 90.0) * 0.014 * coh * (1.0 - 0.6 * smoothstep(0.1, 0.6, clr));',
    '  float e2 = pow(sqrt(max(0.0, 1.0 - th2 * th2)), 18.0) * 0.10 * coh;',
    '  vec3 hc = normalize(uContraDir + v);',
    '  float th3 = dot(T, hc); float e3 = pow(sqrt(max(0.0, 1.0 - th3 * th3)), 14.0) * 0.12 * coh * smoothstep(-0.2, 0.6, dot(n, uContraDir));',
    '  vec3 tinte = uColor * 1.5 + 0.006;',
    '  float sl = mix(0.55, 1.0, sol(n));',
    '  vec3 col = alb * (dif * uSolCol * sl + ambiente(n) * 0.9) + uSolCol * sombra * sl * (e1 * (0.5 + lum) + tinte * e2 * mix(1.0, lum, 0.55)) + uContraCol * tinte * e3 * mix(1.0, lum, 0.55);',
    '  o = vec4((tono(col) + trama(gl_FragCoord.xy)) * a, a);',
    '}'].join('\n');

  var FS_VELLO = [CAB,
    'uniform sampler2D uTex; uniform vec3 uColor; uniform float uFuerza;',
    'void main(){',
    '  float a = texture(uTex, vUv).a * uFuerza;',
    '  if (a < 0.02) discard;',
    '  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    '  float d1 = dot(n, uSolDir);',
    '  vec3 col = uColor * (smoothstep(-0.5, 1.0, d1) * uSolCol + ambiente(n));',
    '  a = min(a, 1.0);',
    '  o = vec4(tono(col) * a, a);',
    '}'].join('\n');

  /* tela: vX = distancia al borde de la prenda (dm) */
  var FS_TELA = [CAB,
    'uniform vec3 uColor; uniform float uSeda;',
    'void main(){',
    '  if (vP.y > uBarr.x) discard;',
    '  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    '  vec3 v = normalize(uCam - vP);',
    '  float banda = 1.0 - smoothstep(0.075, 0.095, vX);',         /* el ribete: cuello, puños, cintura */
    '  float punto = 0.94 + 0.06 * sin(vO.y * 95.0) * sin((vO.x + vO.z) * 70.0);',
    '  vec3 alb = uColor * mix(1.0, 0.80, banda) * mix(punto, 1.0, banda * 0.5);',
    '  float d1 = dot(n, uSolDir);',
    '  vec3 dif = vec3(smoothstep(-0.22, 1.0, d1));',
    '  float nv = max(dot(n, v), 0.0);',
    '  vec3 h = normalize(uSolDir + v);',
    '  float esp = pow(max(dot(n, h), 0.0), 24.0) * 0.10 * uSeda * max(d1, 0.0);',
    '  float pelusa = pow(1.0 - nv, 3.0);',
    '  float dc = max(dot(n, uContraDir), 0.0);',
    '  float sl = sol(n);',
    '  vec3 col = alb * (dif * uSolCol * mix(0.32, 1.0, sl) + ambiente(n) * mix(0.88, 1.0, sl)) + uSolCol * esp * sl + (alb * 0.9 + 0.02) * ambiente(n) * pelusa * 0.55',
    '           + alb * uContraCol * dc * (0.25 + 0.75 * pow(1.0 - nv, 2.0)) * 1.5;',
    '  o = vec4(tono(col) + destello() + trama(gl_FragCoord.xy), 1.0);',
    '}'].join('\n');

  /* calzado: la zapatilla se dibuja en coordenadas propias del pie (u: del talón a la punta; w: de dentro a fuera;
     y: altura), en decímetros de un pie de 27 cm, para que el dibujo valga en cualquier talla */
  var FS_CALZ = [CAB,
    'uniform vec3 uColor; uniform vec3 uSuelaC; uniform vec3 uCalcetin; uniform vec3 uLazo; uniform vec3 uGoma; uniform vec4 uPie; uniform vec2 uLargo; uniform float uTope; uniform float uDep;',
    'float filo(float d, float a){ return 1.0 - smoothstep(0.0, a, abs(d)); }',
    'void main(){',
    '  if (vP.y > uBarr.x) discard;',
    '  float lado = vO.x < 0.0 ? -1.0 : 1.0;',
    '  vec2 q = vec2(vO.x * lado - uPie.x, vO.z - uPie.y);',
    '  float k = 2.735 / (uLargo.y - uLargo.x);',
    '  float u = (dot(q, uPie.zw) - uLargo.x) * k;',
    '  float w = (q.x * uPie.w - q.y * uPie.z) * k;',
    '  float y = vO.y * k;',
    '  if (y > uTope) discard;',
    '  if (uDep > 0.5) { o = vec4(fract(u / 0.5), fract(y / 0.25), fract(w / 0.25 + 0.5), 1.0); return; }',
    '  vec3 n = normalize(vN); vec3 v = normalize(uCam - vP);',
    '  float aw = abs(w);',
    /* la pala: tejido de punto del color elegido */
    '  float punto = 0.955 + 0.045 * sin(u * 120.0) * sin(y * 120.0 + w * 90.0);',
    '  vec3 alb = uColor * punto; float brillo = 0.045; float hueco = 1.0;',
    /* refuerzos cosidos: puntera, talón y una banda a media pala; cada uno, un punto más oscuro y con su costura */
    '  float dPun = (u - 2.26) - 1.15 * w * w;',
    '  float dTal = min((0.50 + 0.30 * (y - 0.30)) - u, 0.90 - y);',
    '  float dBan = min(0.135 - abs(u - (1.56 - 0.42 * (y - 0.25))), aw - 0.30);',
    '  float dOjal = min(min(u - 1.00, 2.06 - u), min(0.345 - aw, y - 0.34));',
    '  float ref = max(max(smoothstep(0.0, 0.012, dPun), smoothstep(0.0, 0.012, dTal)), max(smoothstep(0.0, 0.012, dBan), smoothstep(0.0, 0.012, dOjal)));',
    '  alb = mix(alb, uColor * 0.82, ref); brillo = mix(brillo, 0.09, ref);',
    '  float cost = max(max(filo(dPun, 0.014), filo(dTal, 0.014)), max(filo(dBan, 0.014), filo(dOjal, 0.014)));',
    '  float hs = 0.20 + 0.11 * (1.0 - smoothstep(0.25, 1.25, u)) + 0.045 * smoothstep(2.30, 2.70, u);',
    '  float sue = 1.0 - smoothstep(hs - 0.008, hs + 0.008, y);',
    '  hueco *= 1.0 - 0.30 * cost * (1.0 - sue);',
    /* la lengüeta y los cordones: barras blancas con su sombra debajo */
    '  float dLen = min(min(u - 1.06, 1.99 - u), min(0.235 - aw, y - 0.36));',
    '  float len = smoothstep(0.0, 0.012, dLen);',
    '  float fb = fract((u - 1.10) / 0.172);',
    '  float barra = smoothstep(0.20, 0.30, fb) * (1.0 - smoothstep(0.66, 0.76, fb)) * step(1.10, u) * step(u, 1.96);',
    '  float somb = smoothstep(0.02, 0.20, fb) * (1.0 - smoothstep(0.20, 0.30, fb));',
    '  alb = mix(alb, mix(uColor * 0.60 * (1.0 - 0.35 * somb), uLazo, barra), len);',
    '  hueco *= 1.0 - 0.30 * filo(dLen, 0.016) * (1.0 - barra);',
    /* el cuello acolchado, bajo el calcetín */
    '  float cue = smoothstep(0.93, 0.97, y) * (1.0 - smoothstep(1.03, 1.05, y));',
    '  alb = mix(alb, uColor * 0.70, cue * (1.0 - len));',
    /* la suela: entresuela clara, más alta en el talón, y la goma oscura que pisa */
    '  float goma = 1.0 - smoothstep(-0.085, -0.065, y);',
    '  alb = mix(alb, mix(uSuelaC, uGoma, goma), sue);',
    '  brillo = mix(brillo, 0.16, sue);',
    '  hueco *= 1.0 - 0.38 * filo(y - hs, 0.016);',
    /* el calcetín: canalé en el puño */
    '  float cal = smoothstep(1.03, 1.05, y);',
    '  float canale = mix(1.0, 0.93 + 0.07 * sin(u * 150.0 + w * 150.0), smoothstep(uTope - 0.36, uTope - 0.30, y));',
    '  alb = mix(alb, uCalcetin * canale * (1.0 - 0.10 * filo(y - (uTope - 0.33), 0.012)), cal);',
    '  hueco = mix(hueco, (1.0 - 0.30 * (1.0 - smoothstep(0.0, 0.05, y - 1.04))) * (1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.025, uTope - y))), cal);',
    '  float d1 = dot(n, uSolDir);',
    '  vec3 dif = vec3(smoothstep(-0.2, 1.0, d1));',
    '  vec3 h = normalize(uSolDir + v);',
    '  float nv = max(dot(n, v), 0.0);',
    '  float esp = pow(max(dot(n, h), 0.0), 40.0) * brillo * (1.0 - cal) * max(d1, 0.0);',
    '  float dc = max(dot(n, uContraDir), 0.0);',
    '  float sombraSuelo = mix(0.55, 1.0, smoothstep(0.0, 0.5, vO.y));',
    '  float sl = sol(n);',
    '  vec3 col = alb * hueco * (dif * uSolCol * mix(0.32, 1.0, sl) + ambiente(n) * sombraSuelo) + uSolCol * esp * sl + alb * uContraCol * dc * (0.3 + 0.7 * pow(1.0 - nv, 2.0)) * 1.0;',
    '  o = vec4(tono(col) + destello() + trama(gl_FragCoord.xy), 1.0);',
    '}'].join('\n');

  var FS_LENTE = [CAB,
    'uniform vec4 uColor;',
    'void main(){',
    '  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    '  vec3 v = normalize(uCam - vP); vec3 h = normalize(uSolDir + v);',
    '  float nv = max(dot(n, v), 0.0);',
    '  float refl = pow(max(dot(n, h), 0.0), 60.0) * 0.9 + pow(1.0 - nv, 3.0) * 0.25;',
    '  float a = clamp(uColor.a + refl * 0.5, 0.0, 1.0);',
    '  o = vec4((tono(uColor.rgb * (ambiente(n) + uSolCol * 0.3)) + vec3(refl) * 0.6) * a, a);',
    '}'].join('\n');

  /* la pasada de sombra: solo profundidad; el pelo recorta por su alfa y la ropa por la línea de barrido */
  var FS_PROF = ['#version 300 es', 'precision highp float;',
    'in vec2 vUv; in vec3 vP; in vec3 vO; in float vX; in float vPr;',
    'uniform sampler2D uTex; uniform float uAlfa; uniform vec3 uBarr; uniform float uRopa; uniform vec3 uProtEje; uniform vec3 uProtOrg; uniform vec3 uProtC;',
    'void main(){',
    '  if (uAlfa > 0.5 && texture(uTex, vUv).a < 0.5) discard;',
    '  if (uRopa > 0.5 && vP.y > uBarr.x) discard;',
    '  if (vPr > 0.5) { float t = dot(vO - uProtOrg, uProtEje); if (t >= uProtC.y && t < uProtC.z) discard; }',
    '}'].join('\n');

  function soportado() {
    try { var c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch (e) { return false; }
  }

  /* ---------- el motor ---------- */
  function crea(lienzo, D, opc) {
    opc = opc || {};
    var gl = lienzo.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, stencil: false, preserveDrawingBuffer: !!opc.conserva });
    if (!gl) return null;

    function sombreador(tipo, src) {
      var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('GLSL: ' + gl.getShaderInfoLog(s));
      return s;
    }
    function programa(fs) {
      var p = gl.createProgram();
      gl.attachShader(p, sombreador(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sombreador(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aNor'); gl.bindAttribLocation(p, 2, 'aUv'); gl.bindAttribLocation(p, 3, 'aExtra'); gl.bindAttribLocation(p, 4, 'aCuero'); gl.bindAttribLocation(p, 5, 'aG1'); gl.bindAttribLocation(p, 6, 'aG2'); gl.bindAttribLocation(p, 7, 'aProt');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('GLSL: ' + gl.getProgramInfoLog(p));
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var inf = gl.getActiveUniform(p, i); u[inf.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, inf.name); }
      return { p: p, u: u };
    }
    var PR = { piel: programa(FS_PIEL), ojo: programa(FS_OJO), pelo: programa(FS_PELO), vello: programa(FS_VELLO), tela: programa(FS_TELA), calz: programa(FS_CALZ), prof: programa(FS_PROF), lente: programa(FS_LENTE) };
    /* el mapa de sombras: una textura de profundidad vista desde el sol */
    var SM = 1024, somTex = gl.createTexture(), somFbo = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, somTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SM, SM, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    gl.bindFramebuffer(gl.FRAMEBUFFER, somFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, somTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    var conSombra = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE && opc.sombras !== false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    function matrizLuz() {
      var L = norm3(E.luz.solDir), alto = D.alto[vr()], cy = alto * 0.5, cz = 0.35;
      /* base ortonormal con z hacia la luz */
      var xx = [L[2], 0, -L[0]], xl = Math.hypot(xx[0], xx[2]) || 1; xx = [xx[0] / xl, 0, xx[2] / xl];
      var yy = [L[1] * xx[2] - L[2] * xx[1], L[2] * xx[0] - L[0] * xx[2], L[0] * xx[1] - L[1] * xx[0]];
      var r = alto * 0.62, f = alto * 0.75;
      /* orto(vista(p)): x/r, y/r, -z/f, con el centro en el del cuerpo */
      var m = new Float32Array(16), c = [0, cy, cz];
      var tx = -(xx[0] * c[0] + xx[1] * c[1] + xx[2] * c[2]), ty = -(yy[0] * c[0] + yy[1] * c[1] + yy[2] * c[2]), tz = -(L[0] * c[0] + L[1] * c[1] + L[2] * c[2]);
      m[0] = xx[0] / r; m[4] = xx[1] / r; m[8] = xx[2] / r; m[12] = tx / r;
      m[1] = yy[0] / r; m[5] = yy[1] / r; m[9] = yy[2] / r; m[13] = ty / r;
      m[2] = -L[0] / f; m[6] = -L[1] / f; m[10] = -L[2] / f; m[14] = -tz / f;
      m[15] = 1;
      return m;
    }

    /* --- mallas --- */
    /* Cada malla se crea la primera vez que se necesita y ya tiene sus triángulos (con los datos de
       la app llegan en ficheros sueltos, después de crear el motor); sus posiciones de cada variante
       pueden llegar más tarde aún: hasta entonces se queda con la variante que tenga */
    var M = {}, PARTES0 = {};
    function partes0() {
      if (!PARTES0.cuero && D.partes && D.partes.cuero) Object.keys(D.partes).forEach(function (k) { PARTES0[k] = bytes(D.partes[k]); });
      return PARTES0;
    }
    function vao(m, dinamico) {
      m.vao = gl.createVertexArray(); gl.bindVertexArray(m.vao);
      var uso = dinamico ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      m.bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bPos); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      m.bNor = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bNor); gl.bufferData(gl.ARRAY_BUFFER, m.nor, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      if (m.uv) { m.bUv = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bUv); gl.bufferData(gl.ARRAY_BUFFER, m.uv, uso); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0); }
      if (m.extra) { m.bExtra = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bExtra); gl.bufferData(gl.ARRAY_BUFFER, m.extra, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0); }
      [m.g1, m.g2].forEach(function (g, k) { if (!g) return; var bg = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bg); gl.bufferData(gl.ARRAY_BUFFER, g, gl.STATIC_DRAW); gl.enableVertexAttribArray(5 + k); gl.vertexAttribPointer(5 + k, 3, gl.FLOAT, false, 0, 0); });
      if (m.cuero) { var bc = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bc); gl.bufferData(gl.ARRAY_BUFFER, m.cuero, gl.STATIC_DRAW); gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0); }
      if (m.prot) { m.bProt = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bProt); gl.bufferData(gl.ARRAY_BUFFER, m.prot, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(7); gl.vertexAttribPointer(7, 1, gl.FLOAT, false, 0, 0); }
      m.bTri = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.bTri); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.tri, uso);
      gl.bindVertexArray(null);
    }
    /* un gesto viene disperso: solo los vértices que se mueven */
    function denso(g, nv) {
      if (!g || !g.i || !g.d) return null;
      var a = new Float32Array(nv * 3), ix = u16(g.i), dd = i16(g.d);
      for (var j = 0; j < ix.length; j++) { a[ix[j] * 3] = dd[j * 3] * g.s; a[ix[j] * 3 + 1] = dd[j * 3 + 1] * g.s; a[ix[j] * 3 + 2] = dd[j * 3 + 2] * g.s; }
      return a;
    }
    function creaMalla(nombre) {
      var d = D.mallas[nombre]; if (!d || !d.tri || !d.uv || !d.sold) return null;
      var m = { nombre: nombre, d: d, nv: d.nv, ns: d.ns, q: d.q, tex: d.tex, var: null, cuant: {} };
      m.tri = d.nv < 65536 ? u16(d.tri) : u32(d.tri);
      m.tipo = d.nv < 65536 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
      m.sold = u16(d.sold);
      var uvq = u16(d.uv), uv = new Float32Array(d.nv * 2);
      for (var i = 0; i < uv.length; i++) uv[i] = uvq[i] / 65535;
      m.uv = uv;
      m.pos = new Float32Array(d.nv * 3); m.nor = new Float32Array(d.nv * 3);
      if (nombre === 'cuerpo') {
        var P0 = partes0();
        m.extra = new Float32Array(d.nv); m.cuero = new Float32Array(d.nv); m.prot = new Float32Array(d.nv);
        if (P0.cuero) for (var j = 0; j < d.nv; j++) m.cuero[j] = P0.cuero[m.sold[j]] / 255;
      }
      var G = D.gestos && D.gestos[nombre];
      if (G) { m.g1 = denso(G.parp, d.nv); m.g2 = denso(G.sonr, d.nv); }
      vao(m, false);
      M[nombre] = m;
      return m;
    }
    /* la malla, si ya tiene sus datos; null si aún no han llegado (o no existe) */
    function malla(nombre) { return M[nombre] || creaMalla(nombre); }
    function sube(m) {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bPos); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bNor); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.nor);
    }
    /* pone la malla en esa variante; si sus posiciones no han llegado, se queda como estaba (false) */
    function ponVariante(m, clave) {
      if (m.var === clave) return false;
      if (!m.cuant[clave]) { if (!m.d.pos || !m.d.pos[clave]) return false; m.cuant[clave] = u16(m.d.pos[clave]); }
      var q = m.cuant[clave];
      var s = m.q[0], ox = m.q[1], oy = m.q[2], oz = m.q[3], p = m.pos, n = m.nv;
      for (var i = 0; i < n; i++) { p[i * 3] = ox + q[i * 3] * s; p[i * 3 + 1] = oy + q[i * 3 + 1] * s; p[i * 3 + 2] = oz + q[i * 3 + 2] * s; }
      normales(m.pos, m.tri, m.sold, m.ns, m.nor, m.nv);
      sube(m);
      m.var = clave;
      return true;
    }
    /* la variante que de verdad tiene el cuerpo en pantalla (la pedida, hasta que lleguen sus datos) */
    function vr() { var m = M.cuerpo; return m && m.var ? m.var : variante(); }
    /* normales suaves: se acumulan en los vértices soldados */
    function normales(p, t, s, ns, n, nv) {
      var acc = new Float32Array(ns * 3), i;
      for (i = 0; i < t.length; i += 3) {
        var a = t[i] * 3, b = t[i + 1] * 3, c = t[i + 2] * 3;
        var ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
        var vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        for (var k = 0; k < 3; k++) { var j = (s ? s[t[i + k]] : t[i + k]) * 3; acc[j] += nx; acc[j + 1] += ny; acc[j + 2] += nz; }
      }
      for (i = 0; i < nv; i++) {
        var j2 = (s ? s[i] : i) * 3, x = acc[j2], y = acc[j2 + 1], z = acc[j2 + 2], l = Math.hypot(x, y, z) || 1;
        n[i * 3] = x / l; n[i * 3 + 1] = y / l; n[i * 3 + 2] = z / l;
      }
    }

    /* --- la ropa: se corta de la malla del cuerpo por el borde de un campo y se separa de la piel.
       El campo (dm; positivo = cubierto, 0 = el borde) se calcula aquí, con los hitos del esqueleto
       de cada variante: así los bajos quedan rectos en cualquier silueta y complexión. --- */
    var GR = 9, TOPE = 0.32, TOPE_CAL = 1.52;      /* TOPE_CAL: altura del calcetín (dm de un pie de 27 cm) */
    /* d0: separación de la piel; vuelo: cuánto más se separa donde la prenda es holgada; suav: pasadas de alisado */
    var PRENDAS = {
      camiseta: { d0: 0.08, vuelo: 0.30, suav: 30, cae: 1 },
      manga_larga: { d0: 0.075, vuelo: 0.26, suav: 28, cae: 1 },
      tirantes: { d0: 0.06, vuelo: 0.22, suav: 22, cae: 1 },
      top: { d0: 0.05, vuelo: 0, suav: 10, cae: 0 },
      corto: { d0: 0.07, vuelo: 0.22, suav: 20, cae: 1 },
      mallas_cortas: { d0: 0.025, vuelo: 0, suav: 3, cae: 0 },
      mallas: { d0: 0.025, vuelo: 0, suav: 3, cae: 0 },
      largo: { d0: 0.09, vuelo: 0.26, suav: 34, cae: 1 }
    };
    var BAJO = { mallas: 0.45, largo: 0.20 };      /* altura del bajo sobre el tobillo (dm) de lo que llega al pie */
    /* hasta dónde sube el calcetín (dm de un pie de 27 cm): bajo unas mallas o un pantalón largo, solo hasta su bajo */
    function topeCal() {
      var H = D.hitos[vr()], k = 2.735 / (H.pie[5] - H.pie[4]), b = BAJO[E.asp.abajo];
      return b == null ? TOPE_CAL : Math.max(1.06, Math.min(TOPE_CAL, (H.tob[1] + b) * k + 0.03));
    }
    var SOLD = null;       /* el cuerpo soldado de la variante en curso */
    function soldado() {
      var m = M.cuerpo, ns = m.ns, i;
      if (!SOLD) {
        var t = new Uint32Array(m.tri.length);
        for (i = 0; i < t.length; i++) t[i] = m.sold[m.tri[i]];
        SOLD = { tri: t, pos: new Float32Array(ns * 3), nor: new Float32Array(ns * 3), var: null };
      }
      if (SOLD.var !== m.var) {
        for (i = 0; i < m.nv; i++) {
          var j = m.sold[i] * 3;
          SOLD.pos[j] = m.pos[i * 3]; SOLD.pos[j + 1] = m.pos[i * 3 + 1]; SOLD.pos[j + 2] = m.pos[i * 3 + 2];
          SOLD.nor[j] = m.nor[i * 3]; SOLD.nor[j + 1] = m.nor[i * 3 + 1]; SOLD.nor[j + 2] = m.nor[i * 3 + 2];
        }
        SOLD.var = m.var;
      }
      return SOLD;
    }
    function campoPrenda(k) {
      var S = soldado(), P = S.pos, ns = M.cuerpo.ns, H = D.hitos[vr()], PARTES = partes0();
      var f = new Float32Array(ns), hol = new Float32Array(ns);
      var bL = PARTES.brazoL, bR = PARTES.brazoR, pi = PARTES.pierna, ca = PARTES.cabeza;
      var hom = H.hom, cod = H.cod, mun = H.mun, nk = H.nk, cad = H.cad, rod = H.rod, tob = H.tob;
      function eje(a, b) { var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]); return { o: a, u: [d[0] / l, d[1] / l, d[2] / l], l: l }; }
      var brazo = eje(hom, cod), ante = eje(cod, mun);
      function a_lo_largo(e, x, y, z, s) { return (x * s - e.o[0]) * e.u[0] + (y - e.o[1]) * e.u[1] + (z - e.o[2]) * e.u[2]; }
      var yBajo = cad[1] - 0.30, yCint = cad[1] + 0.50, yPiel = (topeCal() - 0.05) * (H.pie[5] - H.pie[4]) / 2.735;
      var def = {
        camiseta: { cu: [0.72, 0.68, 0.50, 1.5], manga: [0, 0.50], bajo: yBajo },
        manga_larga: { cu: [0.72, 0.68, 0.50, 1.5], manga: [1, 0.93], bajo: yBajo },
        /* tir: dónde va el tirante (fracción del ancho del hombro) y cuánto mide de ancho (dm) */
        tirantes: { cu: [1.20, 0.78, 0.62, 1.1], tir: [0.50, 0.34], sisa: [0.56, 0.95, 0.84, 1.25, 0.12], bajo: yBajo },
        top: { cu: [1.12, 0.78, 0.55, 1.5], tir: [0.52, 0.38], sisa: [0.62, 0.95, 0.90, 1.30, 0.08], bajo: hom[1] - 2.45 },
        corto: { corte: rod[1] + 1.35, hb: 1.0, hp: 0.45 },
        mallas_cortas: { corte: rod[1] + 0.75, hb: 0, hp: 0 },
        mallas: { corte: tob[1] + BAJO.mallas, hb: 0, hp: 0 },
        largo: { corte: tob[1] + BAJO.largo, hb: 0.6, hp: 0.6 },
        calzado: {}
      }[k];
      var c3 = def.cu ? def.cu[3] : 0, xFuera = 0;
      if (def.tir) {
        /* el lomo del hombro en la línea del tirante: por ahí pasan el borde del escote y el de la sisa */
        var xs = hom[0] * def.tir[0], yR = -1e9, zR = 0, j;
        for (j = 0; j < ns; j++) {
          if (ca[j] > 127 || bL[j] > 127 || bR[j] > 127 || Math.abs(Math.abs(P[j * 3]) - xs) > 0.07) continue;
          if (P[j * 3 + 1] > yR) { yR = P[j * 3 + 1]; zR = P[j * 3 + 2]; }
        }
        var xi = xs - def.tir[1] / 2; xFuera = xs + def.tir[1] / 2;
        c3 = (yR - (nk[1] - def.cu[0]) - ((nk[2] + def.cu[1]) - zR) * def.cu[2]) / (xi * xi);
      }
      for (var i = 0; i < ns; i++) {
        var x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], ax = Math.abs(x);
        var esBrazo = (x > 0 ? bL[i] : bR[i]) > 127, s = x > 0 ? 1 : -1, v, hh = 0;
        if (k === 'calzado') { f[i] = pi[i] > 127 ? yPiel - y : -GR; continue; }
        if (def.corte !== undefined) {                 /* parte de abajo */
          v = Math.min(yCint - y, y - def.corte, esBrazo ? -GR : GR);
          hh = Math.max(Math.min(1, Math.max(0, 1 - (y - def.corte) / 2.2)) * def.hb, Math.min(1, Math.max(0, (yCint - 0.5 - y) / 1.5)) * def.hp);
        } else {                                       /* parte de arriba */
          var c = def.cu, yc = (nk[1] - c[0]) + ((nk[2] + c[1]) - z) * c[2] + c3 * ax * ax;
          /* dividido por la pendiente del escote: así el campo mide distancia al borde también donde el escote sube empinado */
          v = ca[i] > 216 ? -GR : (yc - y) / Math.sqrt(1 + 4 * c3 * c3 * ax * ax);
          v = Math.min(v, y - def.bajo);
          hh = Math.min(1, Math.max(0, (hom[1] - 0.6 - y) / 3)) * 0.7;
          if (def.manga) {
            if (esBrazo) {
              var m = def.manga[0] ? def.manga[1] * ante.l - a_lo_largo(ante, x, y, z, s) : def.manga[1] * brazo.l - a_lo_largo(brazo, x, y, z, s);
              v = Math.min(v, m);
              hh = def.manga[0] ? 0.22 : Math.min(1, Math.max(0, 1 - m / 1.2)) * 0.30;
            }
          } else {
            var q = def.sisa, yAlto = hom[1] + q[1], yAx = hom[1] - q[3];
            v = Math.min(v, (0.5 - (x > 0 ? bL[i] : bR[i]) / 255) * 1.4);
            if (y >= yAx) {
              var t = Math.min(1, Math.max(0, (yAlto - y) / (yAlto - yAx)));
              v = Math.min(v, xFuera + (hom[0] * q[2] - xFuera) * t - q[4] * Math.sin(Math.PI * t) - ax);
            }
          }
        }
        f[i] = Math.max(-TOPE, Math.min(TOPE, v)); hol[i] = hh;
      }
      return { f: f, h: hol };
    }
    function generaPrenda(k, C, debajo) {
      var S = soldado(), r = PRENDAS[k], f = C.f, ns = M.cuerpo.ns, T = S.tri, i, j;
      /* separación y dirección: donde la prenda es holgada cae en vertical (se separa en horizontal) */
      var d = new Float32Array(ns), dir = new Float32Array(ns * 3);
      for (i = 0; i < ns; i++) {
        d[i] = r.d0 + r.vuelo * C.h[i];
        if (debajo) d[i] += paso(-0.12, 0.10, debajo.f[i]) * (debajo.d[i] + 0.022);
        var nx = S.nor[i * 3], ny = S.nor[i * 3 + 1], nz = S.nor[i * 3 + 2];
        if (r.cae) {
          var w = Math.min(1, C.h[i] * 2.2), hl = Math.hypot(nx, nz);
          /* la horizontal: la de la normal o, si la normal mira arriba o abajo, la que sale del eje del cuerpo */
          var rx = S.pos[i * 3], rz = S.pos[i * 3 + 2] - 0.3, rl = Math.hypot(rx, rz) || 1, k2 = paso(0.2, 0.6, hl);
          var hx2 = (hl > 1e-4 ? nx / hl : 0) * k2 + rx / rl * (1 - k2), hz2 = (hl > 1e-4 ? nz / hl : 0) * k2 + rz / rl * (1 - k2);
          nx = nx * (1 - w) + hx2 * w; ny = ny * (1 - w); nz = nz * (1 - w) + hz2 * w;
          var l0 = Math.hypot(nx, ny, nz) || 1; nx /= l0; ny /= l0; nz /= l0;
        }
        dir[i * 3] = nx; dir[i * 3 + 1] = ny; dir[i * 3 + 2] = nz;
      }
      var id = new Int32Array(ns).fill(-1), cortes = new Map();
      var piel = [], nor = [], dist = [], campo = [], tri = [], borde = [];
      function v(a) {
        if (id[a] < 0) {
          id[a] = dist.length;
          piel.push(S.pos[a * 3], S.pos[a * 3 + 1], S.pos[a * 3 + 2]); nor.push(dir[a * 3], dir[a * 3 + 1], dir[a * 3 + 2]);
          dist.push(d[a]); campo.push(f[a]);
        }
        return id[a];
      }
      function corte(a, b) {
        var key = a < b ? a * ns + b : b * ns + a, c = cortes.get(key);
        if (c !== undefined) return c;
        var t = f[a] / (f[a] - f[b]), u = 1 - t;
        c = dist.length;
        piel.push(S.pos[a * 3] * u + S.pos[b * 3] * t, S.pos[a * 3 + 1] * u + S.pos[b * 3 + 1] * t, S.pos[a * 3 + 2] * u + S.pos[b * 3 + 2] * t);
        var nx = dir[a * 3] * u + dir[b * 3] * t, ny = dir[a * 3 + 1] * u + dir[b * 3 + 1] * t, nz = dir[a * 3 + 2] * u + dir[b * 3 + 2] * t, l = Math.hypot(nx, ny, nz) || 1;
        nor.push(nx / l, ny / l, nz / l);
        dist.push(d[a] * u + d[b] * t); campo.push(0);
        cortes.set(key, c);
        return c;
      }
      for (i = 0; i < T.length; i += 3) {
        var a = T[i], b = T[i + 1], c = T[i + 2], ia = f[a] > 0, ib = f[b] > 0, ic = f[c] > 0, n = ia + ib + ic;
        if (n === 0) continue;
        if (n === 3) { tri.push(v(a), v(b), v(c)); continue; }
        if (n === 1) {                                  /* se gira para que «a» sea el único dentro */
          if (ib) { var t1 = a; a = b; b = c; c = t1; } else if (ic) { var t2 = a; a = c; c = b; b = t2; }
          var ab = corte(a, b), ac = corte(a, c);
          tri.push(v(a), ab, ac); borde.push(ab, ac);
        } else {                                        /* se gira para que «a» sea el único fuera */
          if (!ib) { var t3 = a; a = b; b = c; c = t3; } else if (!ic) { var t4 = a; a = c; c = b; b = t4; }
          var ba = corte(b, a), ca = corte(c, a);
          tri.push(ba, v(b), v(c), ba, v(c), ca); borde.push(ca, ba);
        }
      }
      var nv = dist.length; if (!nv) return null;
      /* altura sobre la piel: parte de la separación y se alisa sin bajar nunca de ella (la tela se tensa) */
      var h = new Float32Array(dist), p = new Float32Array(nv * 3), it;
      function coloca() { for (j = 0; j < nv; j++) { p[j * 3] = piel[j * 3] + nor[j * 3] * h[j]; p[j * 3 + 1] = piel[j * 3 + 1] + nor[j * 3 + 1] * h[j]; p[j * 3 + 2] = piel[j * 3 + 2] + nor[j * 3 + 2] * h[j]; } }
      coloca();
      var sx = new Float32Array(nv), sy = new Float32Array(nv), sz = new Float32Array(nv), cnt = new Float32Array(nv);
      for (it = 0; it < r.suav; it++) {
        sx.fill(0); sy.fill(0); sz.fill(0); cnt.fill(0);
        for (j = 0; j < tri.length; j += 3) {
          for (var e = 0; e < 3; e++) {
            var u1 = tri[j + e], u2 = tri[j + (e + 1) % 3];
            sx[u1] += p[u2 * 3]; sy[u1] += p[u2 * 3 + 1]; sz[u1] += p[u2 * 3 + 2]; cnt[u1]++;
            sx[u2] += p[u1 * 3]; sy[u2] += p[u1 * 3 + 1]; sz[u2] += p[u1 * 3 + 2]; cnt[u2]++;
          }
        }
        for (j = 0; j < nv; j++) {
          if (!cnt[j]) continue;
          var hx = sx[j] / cnt[j] - piel[j * 3], hy = sy[j] / cnt[j] - piel[j * 3 + 1], hz = sz[j] / cnt[j] - piel[j * 3 + 2];
          var hn = hx * nor[j * 3] + hy * nor[j * 3 + 1] + hz * nor[j * 3 + 2];
          h[j] = Math.max(dist[j], Math.min(h[j] * 0.4 + hn * 0.6, dist[j] + 0.35));
        }
        coloca();
      }
      /* normales de la cara de fuera */
      var N1 = new Float32Array(nv * 3), TR1 = new Uint32Array(tri);
      normales(p, TR1, null, nv, N1, nv);
      /* el canto: una tira con vértices propios (arista viva) del borde hacia la piel, para que la prenda tenga grosor */
      var nb = borde.length, tot = nv + nb * 2, P2 = new Float32Array(tot * 3), N2 = new Float32Array(tot * 3), X = new Float32Array(tot), TR = new Uint32Array(tri.length + nb * 3), q = nv;
      P2.set(p); N2.set(N1); TR.set(TR1);
      for (j = 0; j < nv; j++) X[j] = campo[j];
      for (j = 0; j < nb; j += 2) {
        var b1 = borde[j], b2 = borde[j + 1], g1 = Math.min(h[b1], 0.012), g2 = Math.min(h[b2], 0.012), o = q;
        /* fuera 1, fuera 2, dentro 1, dentro 2 */
        P2.set([p[b1 * 3], p[b1 * 3 + 1], p[b1 * 3 + 2], p[b2 * 3], p[b2 * 3 + 1], p[b2 * 3 + 2],
          piel[b1 * 3] + nor[b1 * 3] * g1, piel[b1 * 3 + 1] + nor[b1 * 3 + 1] * g1, piel[b1 * 3 + 2] + nor[b1 * 3 + 2] * g1,
          piel[b2 * 3] + nor[b2 * 3] * g2, piel[b2 * 3 + 1] + nor[b2 * 3 + 1] * g2, piel[b2 * 3 + 2] + nor[b2 * 3 + 2] * g2], o * 3);
        /* normal plana de la tira */
        var ex = P2[o * 3 + 3] - P2[o * 3], ey = P2[o * 3 + 4] - P2[o * 3 + 1], ez = P2[o * 3 + 5] - P2[o * 3 + 2];
        var fx = P2[o * 3 + 6] - P2[o * 3], fy = P2[o * 3 + 7] - P2[o * 3 + 1], fz = P2[o * 3 + 8] - P2[o * 3 + 2];
        var mx = fy * ez - fz * ey, my = fz * ex - fx * ez, mz = fx * ey - fy * ex, ml = Math.hypot(mx, my, mz) || 1;
        for (var w2 = 0; w2 < 4; w2++) { N2[(o + w2) * 3] = mx / ml; N2[(o + w2) * 3 + 1] = my / ml; N2[(o + w2) * 3 + 2] = mz / ml; X[o + w2] = 0; }
        TR.set([o + 1, o, o + 2, o + 1, o + 2, o + 3], tri.length + j * 3);
        q += 4;
      }
      return { pos: P2, nor: N2, extra: X, tri: TR, nv: tot, sep: d };
    }
    function tubo(P, cerrado, r, lados, V, N, T) {
      /* un tubo de `lados` caras a lo largo de la línea P (lista de [x,y,z]) */
      var n = P.length, base = V.length / 3, i, k;
      for (i = 0; i < n; i++) {
        var a = P[cerrado ? (i + n - 1) % n : Math.max(0, i - 1)], b = P[cerrado ? (i + 1) % n : Math.min(n - 1, i + 1)];
        var t = norm3([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
        var u = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        var e1 = norm3([t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]]);
        var e2 = [t[1] * e1[2] - t[2] * e1[1], t[2] * e1[0] - t[0] * e1[2], t[0] * e1[1] - t[1] * e1[0]];
        for (k = 0; k < lados; k++) {
          var an = k / lados * Math.PI * 2, c = Math.cos(an), s2 = Math.sin(an), nx = e1[0] * c + e2[0] * s2, ny = e1[1] * c + e2[1] * s2, nz = e1[2] * c + e2[2] * s2;
          V.push(P[i][0] + nx * r, P[i][1] + ny * r, P[i][2] + nz * r); N.push(nx, ny, nz);
        }
      }
      var tramos = cerrado ? n : n - 1;
      for (i = 0; i < tramos; i++) for (k = 0; k < lados; k++) {
        var i2 = (i + 1) % n, k2 = (k + 1) % lados, p0 = base + i * lados + k, p1 = base + i * lados + k2, p2 = base + i2 * lados + k, p3 = base + i2 * lados + k2;
        T.push(p0, p2, p1, p1, p2, p3);
      }
    }
    var GAFAS = { var: null, montura: null, lentes: null };
    function gafas() {
      var v = vr(); if (GAFAS.var === v) return GAFAS;
      var H = D.hitos[v], o = H.ojo, sn = H.sien, V = [], N = [], T = [], LV = [], LN = [], LT = [];
      [1, -1].forEach(function (s) {
        var cx = o[0] * s * 1.04, cy = o[1] - 0.015, cz = o[2] + 0.265, aro = [], i, giro = 0.12 * s;
        for (i = 0; i < 28; i++) {
          var an = i / 28 * Math.PI * 2, ca = Math.cos(an), sa = Math.sin(an);
          /* superelipse: un rectángulo de esquinas muy redondas */
          var ex = Math.sign(ca) * Math.pow(Math.abs(ca), 0.72) * 0.245, ey = Math.sign(sa) * Math.pow(Math.abs(sa), 0.72) * 0.192;
          aro.push([cx + ex * Math.cos(giro), cy + ey, cz - ex * Math.sin(giro) - 0.04 * Math.abs(ex / 0.245) * 0.0]);
        }
        tubo(aro, true, 0.018, 6, V, N, T);
        /* la lente: un abanico desde el centro */
        var b0 = LV.length / 3; LV.push(cx, cy, cz); LN.push(0, 0, 1);
        aro.forEach(function (p) { LV.push(p[0], p[1], p[2]); LN.push(0, 0, 1); });
        for (i = 0; i < 28; i++) LT.push(b0, b0 + 1 + i, b0 + 1 + (i + 1) % 28);
        /* la patilla: de la bisagra a la oreja y un poco por detrás */
        var bx = cx + 0.25 * s, bz = cz - 0.03 * 1;
        tubo([[bx, cy + 0.06, bz - 0.03], [sn[0] * s * 0.99 + 0.02 * s, cy + 0.09, bz - 0.35], [sn[0] * s + 0.035 * s, sn[1] + 0.13, sn[2] + 0.10], [sn[0] * s + 0.02 * s, sn[1] - 0.05, sn[2] - 0.22]], false, 0.014, 5, V, N, T);
      });
      /* el puente */
      var px = o[0] * 1.04 - 0.235, py = o[1] + 0.045, pz2 = o[2] + 0.262;
      tubo([[-px, py, pz2], [-px * 0.5, py + 0.035, pz2 + 0.022], [0, py + 0.045, pz2 + 0.028], [px * 0.5, py + 0.035, pz2 + 0.022], [px, py, pz2]], false, 0.017, 6, V, N, T);
      function sube2(viejo, Vv, Nn, Tt) {
        if (viejo) { gl.deleteVertexArray(viejo.vao); [viejo.bPos, viejo.bNor, viejo.bTri].forEach(function (b) { gl.deleteBuffer(b); }); }
        var m = { pos: new Float32Array(Vv), nor: new Float32Array(Nn), tri: new Uint32Array(Tt), tipo: gl.UNSIGNED_INT, nv: Vv.length / 3 };
        vao(m, true); return m;
      }
      GAFAS.montura = sube2(GAFAS.montura, V, N, T); GAFAS.lentes = sube2(GAFAS.lentes, LV, LN, LT); GAFAS.var = v;
      return GAFAS;
    }
    /* una malla propia (tubos, aros, discos) en la GPU, en el sitio de otra que se tira */
    function mallaPropia(viejo, Vv, Nn, Tt) {
      if (viejo) { gl.deleteVertexArray(viejo.vao); [viejo.bPos, viejo.bNor, viejo.bTri].forEach(function (b) { gl.deleteBuffer(b); }); }
      if (!Tt.length) return null;
      var m = { pos: new Float32Array(Vv), nor: new Float32Array(Nn), tri: new Uint32Array(Tt), tipo: gl.UNSIGNED_INT, nv: Vv.length / 3 };
      vao(m, true); return m;
    }
    /* un disco plano (abanico) de centro c, en el plano de normal n, con el borde en la lista de puntos */
    function disco(c, n, borde, V, N, T) {
      var b0 = V.length / 3; V.push(c[0], c[1], c[2]); N.push(n[0], n[1], n[2]);
      borde.forEach(function (p) { V.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); });
      for (var i = 0; i < borde.length; i++) T.push(b0, b0 + 1 + i, b0 + 1 + (i + 1) % borde.length);
    }
    /* un aro: la circunferencia de radio r alrededor del centro c, en el plano de normal n */
    function aro(c, n, r, k) {
      var u = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      var e1 = norm3([n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]]);
      var e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]], P = [];
      for (var i = 0; i < k; i++) { var a = i / k * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); P.push([c[0] + (e1[0] * ca + e2[0] * sa) * r, c[1] + (e1[1] * ca + e2[1] * sa) * r, c[2] + (e1[2] * ca + e2[2] * sa) * r]); }
      return P;
    }

    /* --- el audífono (7-11-2026, decisión 10 de Jerome): uno detrás de cada oreja que lo lleve, como en el
       dibujo. El cuerpo del aparato, un tubo curvado pegado a la cabeza detrás del pabellón, y el tubo fino
       que sube por encima de la oreja y entra en el oído. El hito «sien» de cada variante es el punto más
       saliente de la oreja a la altura del ojo (así lo calcula tools/cuerpo3d/construir3d.py) --- */
    var AUDIF = { clave: '', cuerpo: null, tubo: null };
    function audifono() {
      var v = vr(), a = E.asp.audifono || 'no', clave = v + '|' + a;
      if (AUDIF.clave === clave) return AUDIF;
      AUDIF.clave = clave;
      var H = D.hitos[v], o = H.sien, V = [], N = [], T = [], V2 = [], N2 = [], T2 = [];
      var S = soldado(), P = S.pos, ca = partes0().cabeza, ns = M.cuerpo.ns;
      /* la piel de la cabeza detrás del pabellón, a una altura y una profundidad dadas (la x más saliente) */
      function piel(y, z) {
        var x = o[0] - 0.22;
        for (var i = 0; i < ns; i++) {
          if (ca[i] < 128 || P[i * 3] < 0 || P[i * 3 + 2] > o[2] - 0.06) continue;
          if (Math.abs(P[i * 3 + 1] - y) < 0.1 && Math.abs(P[i * 3 + 2] - z) < 0.08 && P[i * 3] > x) x = P[i * 3];
        }
        return x;
      }
      /* el hito «sien» cae en el borde de atrás del pabellón, arriba (el pabellón va de ahí hacia delante unos
         2,5 cm y hacia abajo unos 4): el aparato se apoya en la piel justo detrás, y el tubo pasa por encima */
      [1, -1].forEach(function (s) {
        if (a !== 'ambos' && !(a === 'izq' && s > 0) && !(a === 'der' && s < 0)) return;
        var y = o[1], z = o[2], R = 0.048;
        var C = [[y + 0.17, z - 0.05], [y + 0.09, z - 0.11], [y - 0.05, z - 0.14], [y - 0.18, z - 0.13]].map(function (q) { return [(piel(q[0], q[1]) + R + 0.012) * s, q[0], q[1]]; });
        tubo(C, false, R, 8, V, N, T);
        var x0 = C[0][0] * s;
        tubo([[x0 * s, y + 0.20, z - 0.05], [(x0 + 0.02) * s, y + 0.27, z + 0.03], [(x0 + 0.05) * s, y + 0.25, z + 0.13], [(x0 + 0.06) * s, y + 0.06, z + 0.17], [(x0 + 0.02) * s, y - 0.08, z + 0.12]], false, 0.013, 5, V2, N2, T2);
      });
      AUDIF.cuerpo = mallaPropia(AUDIF.cuerpo, V, N, T); AUDIF.tubo = mallaPropia(AUDIF.tubo, V2, N2, T2);
      return AUDIF;
    }

    /* --- la prótesis (7-11-2026, decisión 10): de pierna, bajo la rodilla, o de brazo, bajo el codo, como en el
       dibujo: el encaje (la propia piel, como carcasa), el tubo y el pie o la mano (también carcasa). Lo que va
       entre el encaje y el pie o la mano no se dibuja. Por vértice del cuerpo, con los hitos de la variante:
       0 piel, 1 encaje, 2 nada, 3 pie o mano; el tubo, los aros y las tapas son mallas propias --- */
    var PROTES = { clave: '', mallas: null, lado: 0, eje: [0, -1, 0], org: [0, 0, 0], c: [9e9, 9e9, 9e9] };
    function protesis() {
      var m = M.cuerpo, v = vr(), p = E.asp.protesis || 'no', clave = v + '|' + p;
      if (PROTES.clave === clave) return PROTES;
      PROTES.clave = clave;
      var pr = m.prot, S = soldado(), P = S.pos, PARTES = partes0(), H = D.hitos[v], i;
      pr.fill(0);
      var V = [], N = [], T = [], pierna = p.indexOf('pierna') === 0, brazo = p.indexOf('brazo') === 0;
      PROTES.lado = (pierna || brazo) ? (/_izq$/.test(p) ? 1 : -1) : 0;
      PROTES.c = [9e9, 9e9, 9e9];
      if (PROTES.lado) {
        var s = PROTES.lado, mask = pierna ? PARTES.pierna : (s > 0 ? PARTES.brazoL : PARTES.brazoR);
        /* la coordenada a lo largo del miembro: la altura en la pierna; en el brazo, la distancia desde el codo por su eje */
        var cod = [H.cod[0] * s, H.cod[1], H.cod[2]], mun = [H.mun[0] * s, H.mun[1], H.mun[2]];
        var eje = pierna ? [0, -1, 0] : norm3([mun[0] - cod[0], mun[1] - cod[1], mun[2] - cod[2]]), L = pierna ? 0 : Math.hypot(mun[0] - cod[0], mun[1] - cod[1], mun[2] - cod[2]);
        var org = pierna ? [0, H.rod[1], 0] : cod;
        function t(q) { return (q[0] - org[0]) * eje[0] + (q[1] - org[1]) * eje[1] + (q[2] - org[2]) * eje[2]; }
        /* los tres cortes: arriba del encaje, abajo del encaje, arriba del pie o la mano */
        var c1 = pierna ? 0.25 : 0.22 * L, c2 = pierna ? 1.55 : 0.62 * L, c3 = pierna ? H.rod[1] - H.tob[1] - 0.45 : 0.95 * L;
        PROTES.eje = eje; PROTES.org = org; PROTES.c = [c1, c2, c3];
        var ns = m.ns;
        for (i = 0; i < m.nv; i++) { var w = m.sold[i]; pr[i] = (mask[w] > 127 && P[w * 3] * s >= 0) ? 1 : 0; }
        /* las secciones del miembro en los cortes: su centro y su radio, de los vértices de alrededor */
        function seccion(tc) {
          var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], n = 0;
          for (var k = 0; k < ns; k++) {
            if (mask[k] < 128 || P[k * 3] * s < 0) continue;
            var q = [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]], d = t(q) - tc;
            if (Math.abs(d) > 0.22) continue;
            q = [q[0] - eje[0] * d, q[1] - eje[1] * d, q[2] - eje[2] * d];
            for (var w2 = 0; w2 < 3; w2++) { if (q[w2] < mn[w2]) mn[w2] = q[w2]; if (q[w2] > mx[w2]) mx[w2] = q[w2]; }
            n++;
          }
          if (!n) return null;
          var c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], r = 0;
          for (var w3 = 0; w3 < 3; w3++) r = Math.max(r, (mx[w3] - mn[w3]) / 2 * (1 - Math.abs(eje[w3])));
          return { c: c, r: r };
        }
        var s1 = seccion(c1), s2 = seccion(c2), s3 = seccion(c3);
        if (s1 && s2 && s3) {
          var n1 = [-eje[0], -eje[1], -eje[2]];
          /* el aro de arriba del encaje, su tapa de abajo con su aro, el tubo y el aro y la tapa del pie o la mano */
          tubo(aro(s1.c, eje, s1.r + 0.012, 20), true, 0.03, 6, V, N, T);
          tubo(aro(s2.c, eje, s2.r + 0.005, 20), true, 0.035, 6, V, N, T);
          disco(s2.c, eje, aro(s2.c, eje, s2.r + 0.005, 20), V, N, T);
          var r3 = Math.min(s3.r, pierna ? 0.34 : 0.26) + 0.01;
          tubo(aro(s3.c, eje, r3, 20), true, 0.035, 6, V, N, T);
          disco(s3.c, n1, aro(s3.c, eje, r3, 20).reverse(), V, N, T);
          tubo([s2.c, s3.c], false, pierna ? 0.16 : 0.12, 12, V, N, T);
        }
      }
      PROTES.mallas = mallaPropia(PROTES.mallas, V, N, T);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bProt); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pr);
      return PROTES;
    }
    var CORTE_PELO = { largo: 0.40, medio: 0.50, coleta: 0.50, trenzas: 0.50 };
    var PRENDA = {};       /* hueco ('arriba' | 'abajo') → malla en la GPU */
    function ponPrenda(hueco, geo) {
      var m = PRENDA[hueco];
      if (m) { gl.deleteVertexArray(m.vao); [m.bPos, m.bNor, m.bExtra, m.bTri].forEach(function (b) { gl.deleteBuffer(b); }); PRENDA[hueco] = null; }
      if (!geo) return;
      geo.tipo = gl.UNSIGNED_INT; vao(geo, true); PRENDA[hueco] = geo;
    }
    var ropaClave = '';
    function vistete() {
      var a = E.asp, arriba = a.arriba, abajo = a.abajo;
      if (arriba === 'sin' && a.fig === 'b') arriba = 'top';
      ponVariante(M.cuerpo, variante());
      var v = vr(), clave = [v, arriba, abajo, a.calzado].join('|');
      protesis();
      if (clave === ropaClave) return;
      ropaClave = clave;
      var cCal = a.calzado !== 'descalzo' ? campoPrenda('calzado') : null, sobreCal = null;
      if (cCal) { sobreCal = { f: cCal.f, d: new Float32Array(cCal.f.length).fill(0.04) }; }
      var cAb = PRENDAS[abajo] ? campoPrenda(abajo) : null, gAb = cAb ? generaPrenda(abajo, cAb, sobreCal) : null;
      ponPrenda('abajo', gAb);
      var cAr = PRENDAS[arriba] ? campoPrenda(arriba) : null;
      ponPrenda('arriba', cAr ? generaPrenda(arriba, cAr, gAb ? { f: cAb.f, d: gAb.sep } : null) : null);
      /* lo que queda tapado se descarta al pintar la piel */
      var m = M.cuerpo, ex = m.extra, fa = cAr && cAr.f, fb = cAb && cAb.f, fc = cCal ? cCal.f : null;
      for (var i = 0; i < m.nv; i++) {
        var s = m.sold[i], x = -TOPE;
        if (fa && fa[s] > x) x = fa[s]; if (fb && fb[s] > x) x = fb[s]; if (fc && fc[s] > x) x = Math.min(TOPE, fc[s]);
        ex[i] = x;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bExtra); gl.bufferSubData(gl.ARRAY_BUFFER, 0, ex);
    }

    var IDS = null;
    function guardaIds(im) {
      var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
      var px = x.getImageData(0, 0, im.width, im.height).data, d = new Uint8Array(im.width * im.height);
      for (var i = 0; i < d.length; i++) d[i] = px[i * 4];
      IDS = { w: im.width, h: im.height, d: d };
    }
    /* la textura de distancia al borde lleva sus niveles hechos a mano: cada uno toma la mezcla del
       mínimo y la media de sus cuatro texeles, para que al alejar la figura los surcos no se borren */
    function mipsMin(im) {
      var c = document.createElement('canvas'), w = im.width, h = im.height; c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var px = x.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h), i, nivel = 1;
      for (i = 0; i < w * h; i++) a[i] = px[i * 4];
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      while (w > 1 && h > 1) {
        var w2 = w >> 1, h2 = h >> 1, b = new Uint8Array(w2 * h2);
        for (var y = 0; y < h2; y++) for (var xx = 0; xx < w2; xx++) {
          var p = (y * 2) * w + xx * 2, v0 = a[p], v1 = a[p + 1], v2 = a[p + w], v3 = a[p + w + 1];
          b[y * w2 + xx] = (Math.min(v0, v1, v2, v3) * 0.6 + (v0 + v1 + v2 + v3) * 0.1) | 0;
        }
        gl.texImage2D(gl.TEXTURE_2D, nivel++, gl.R8, w2, h2, 0, gl.RED, gl.UNSIGNED_BYTE, b);
        a = b; w = w2; h = h2;
      }
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    /* --- texturas --- */
    var T = {}, pendientes = 0, alListo = [], fallos = [];
    function textura(clave) {
      if (T[clave]) return T[clave];
      var t = gl.createTexture(); T[clave] = t;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 0]));
      if (!D.tex[clave]) return t;
      pendientes++;
      var im = new Image();
      im.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        /* los identificadores de los músculos van a la tarjeta con los mismos bytes que lee el toque (guardaIds: <img> y
           un lienzo 2D de lectura), no con la imagen: en WebKit, un PNG gris leído por otro camino puede cambiar en ±2
           (createImageBitmap lo hacía con el relieve; 1-11-2026), y un 20 que llegue como 22 pinta otro músculo */
        if (clave === 'mus_id') {
          guardaIds(im);
          gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, IDS.w, IDS.h, 0, gl.RED, gl.UNSIGNED_BYTE, IDS.d);
          gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        }
        else if (clave === 'mus_dist') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, im);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        if (clave === 'mus_id') { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); }
        else if (clave === 'mus_dist') { mipsMin(im); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
        else { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var e = gl.getExtension('EXT_texture_filter_anisotropic');
        if (e && clave !== 'mus_id') gl.texParameterf(gl.TEXTURE_2D, e.TEXTURE_MAX_ANISOTROPY_EXT, 4);
        pendientes--; pide();
        if (!pendientes) { var l = alListo; alListo = []; l.forEach(function (f) { f(); }); }
      };
      im.onerror = function () { pendientes--; fallos.push(clave); if (opc.alFallar) opc.alFallar(clave); };
      im.src = D.tex[clave];      /* una URL (la app) o un data: (la maqueta) */
      return t;
    }

    /* --- estado --- */
    var E = {
      asp: { fig: 'a', comp: 1, gafas: 'no', audifono: 'no', protesis: 'no', piel: '#D9A57E', pelo: 'corto', peloColor: '#6B4630', arriba: 'camiseta', arribaColor: '#D4AF37', abajo: 'corto', abajoColor: '#1D2230', calzado: 'zapatillas', calzadoColor: '#EEF0F3' },
      giro: 0, zoom: 1, cy: null, modo: 'persona', barr: 0, barrLin: 0, niveles: {}, sel: null, prio: [], t: 0, resp: 0, parp: 0, sonr: 0, sonrBase: 0.22,
      luz: {
        solDir: [-0.45, 0.50, 0.74], solCol: [2.35, 2.18, 1.95],
        cielo: [0.60, 0.70, 0.88], suelo: [0.40, 0.31, 0.25],
        contraDir: [0.75, 0.30, -0.58], contraCol: [1.0, 0.72, 0.45], expo: 0.62, maniqui: 1
      }
    };
    /* la luz de referencia: con ella la piel sale del tono elegido; con otra, más clara o más oscura */
    var REF = { solCol: [2.35, 2.18, 1.95], cielo: [0.60, 0.70, 0.88], suelo: [0.40, 0.31, 0.25], expo: 0.62 };
    var sucio = true, dibujado = false;
    E.sonr = E.sonrBase;

    function variante() { return E.asp.fig + E.asp.comp; }

    function camara() {
      var w = lienzo.width, h = lienzo.height;
      var alto = D.alto[vr()];
      var fov = 15 * Math.PI / 180;
      var visto = alto * 1.10 / E.zoom;
      var dist = (visto / 2) / Math.tan(fov / 2);
      var cy = E.cy == null ? alto * 0.5 : E.cy;
      var P = persp(fov, w / h, dist * 0.25, dist * 2.2);
      var V = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -cy, -dist, 1]);
      return { vp: mul(P, V), ojo: [0, cy, dist], luz: matrizLuz() };
    }

    function comunes(pr, cam) {
      var u = pr.u, L = E.luz, a = E.giro * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      gl.useProgram(pr.p);
      gl.uniformMatrix4fv(u.uVP, false, cam.vp);
      gl.uniformMatrix3fv(u.uGiro, false, new Float32Array([c, 0, -s, 0, 1, 0, s, 0, c]));
      gl.uniform3f(u.uPiv, 0, 0, 0.35);
      gl.uniform1f(u.uInfla, 0);
      gl.uniform3fv(u.uCam, cam.ojo);
      gl.uniform3fv(u.uSolDir, norm3(L.solDir)); gl.uniform3fv(u.uSolCol, L.solCol);
      gl.uniform3fv(u.uCielo, L.cielo); gl.uniform3fv(u.uSuelo, L.suelo);
      gl.uniform3fv(u.uContraDir, norm3(L.contraDir)); gl.uniform3fv(u.uContraCol, L.contraCol);
      gl.uniform1f(u.uExpo, L.expo);
      var alto = D.alto[vr()], b = E.barr;
      gl.uniform3f(u.uBarr, alto + 0.7 - (alto + 1.4) * b, (b > 0.001 && b < 0.999) ? 1 : 0, 0);
      gl.uniform3f(u.uResp, 0.022 * E.resp, alto * 0.735, alto * 0.115);
      if (u.uLuzVP) gl.uniformMatrix4fv(u.uLuzVP, false, cam.luz);
      if (u.uSombra) { gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, somTex); gl.uniform1i(u.uSombra, 7); gl.uniform1f(u.uSombraK, conSombra ? 1 : 0); }
      gl.uniform2f(u.uGesto, E.parp, E.sonr); if (u.uSesgoMas) gl.uniform1f(u.uSesgoMas, 0);
      if (u.uProtEje) { gl.uniform3fv(u.uProtEje, PROTES.eje); gl.uniform3fv(u.uProtOrg, PROTES.org); gl.uniform3fv(u.uProtC, PROTES.c); }
      gl.vertexAttrib1f(3, 0); gl.vertexAttrib1f(4, 0); gl.vertexAttrib3f(5, 0, 0, 0); gl.vertexAttrib3f(6, 0, 0, 0); gl.vertexAttrib1f(7, 0);
    }
    function pinta(m) {
      if (!m) return;
      if (m.d) { ponVariante(m, variante()); if (!m.var) return; }      /* sin posiciones aún: no se dibuja */
      gl.bindVertexArray(m.vao);
      gl.drawElements(gl.TRIANGLES, m.tri.length, m.tipo, 0);
    }
    function tex(unidad, t, loc) { gl.activeTexture(gl.TEXTURE0 + unidad); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unidad); }

    /* el color de la piel: el albedo que, con la luz de frente, da el tono elegido en pantalla */
    function albedoPiel(h) {
      var s = hexS(h), L = REF, lum = function (c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      var frente = (lum(L.solCol) * 0.80 + lum(L.cielo) * 0.55 + lum(L.suelo) * 0.45) * L.expo;
      var m = (s[0] + s[1] + s[2]) / 3; s = s.map(function (c) { return m + (c - m) * 0.90; });
      var cal = [1.035, 1.0, 0.975];       /* la luz del sol ya es cálida: el albedo se enfría un punto */
      return s.map(function (c, i) { return tonoInv(Math.min(0.97, c)) / (frente * cal[i]); });
    }

    /* albedo que, con la luz de frente (y un tanto de luz propia), da en pantalla el color pedido */
    function albedoDe(h, propia) {
      var s = hexS(h), L = E.luz, lum = function (c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      var frente = (lum(L.solCol) * 0.80 + lum(L.cielo) * 0.55 + lum(L.suelo) * 0.45) * L.expo;
      return s.map(function (c) { return tonoInv(Math.min(0.97, c)) / (propia ? frente * 0.62 + 0.95 * 0.62 : frente); });
    }
    /* niveles de trabajo: su tono y su sombra (el oro, con sombra de bronce) */
    var PALETA = { nivel: ['#333E4D', '#EE5F7E', '#FFA04A', '#FFE48A'], sombra: ['#141A23', '#7A1B3A', '#96400F', '#B07A1E'], base: '#252F3D', surco: '#0A0E14' };
    /* la prótesis y el audífono: los colores del dibujo (TG_FIGURA, PROTO y el audífono) */
    var PROTO = { encaje: '#5E6878', tubo: '#7D8796', mano: '#8E98A8', audifono: '#C9CED6', audifonoTubo: '#E6E9EE' };
    function codigos() {
      var c = new Float32Array(36), mu = D.musculos || [];
      for (var i = 0; i < mu.length; i++) {
        var g = mu[i][1], n = Math.max(0, Math.min(3, E.niveles[g] | 0));
        c[i + 1] = n + (E.sel === g ? 10 : 0) + (E.prio.indexOf(g) >= 0 ? 100 : 0);
      }
      return c;
    }

    function dibuja() {
      sucio = false;
      /* sin el cuerpo (sus triángulos y las posiciones de alguna variante) no hay nada que dibujar aún */
      var mc = malla('cuerpo');
      if (!mc) return false;
      ponVariante(mc, variante());
      if (!mc.var) return false;
      var a = E.asp, cam = camara(), pr, u;
      vistete();
      var mz = a.calzado !== 'descalzo' ? malla('cz_' + a.calzado) : null, mp = malla('pelo_' + a.pelo), pt = PROTES.lado ? PROTES.mallas : null, au = audifono();
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);
      if (conSombra) {
        /* lo que el sol ve: cuerpo, ropa, calzado, prótesis y pelo */
        var cl = { vp: cam.luz, ojo: cam.ojo, luz: cam.luz };
        gl.bindFramebuffer(gl.FRAMEBUFFER, somFbo); gl.viewport(0, 0, SM, SM); gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.CULL_FACE); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 2.0);
        pr = PR.prof; u = pr.u; comunes(pr, cl);
        gl.uniform1f(u.uAlfa, 0); gl.uniform1f(u.uRopa, 0); pinta(mc);
        if (pt) pinta(pt);
        gl.uniform1f(u.uRopa, 1);
        if (E.barr < 0.999) {
          if (mz) pinta(mz);
          if (PRENDA.abajo) pinta(PRENDA.abajo); if (PRENDA.arriba) pinta(PRENDA.arriba);
        }
        if (mp) { gl.uniform1f(u.uRopa, 0); gl.uniform1f(u.uAlfa, 1); tex(0, textura('pelo_' + a.pelo), u.uTex); pinta(mp); }
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.viewport(0, 0, lienzo.width, lienzo.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.CULL_FACE);

      /* piel */
      pr = PR.piel; u = pr.u; comunes(pr, cam);
      var tl = hex(a.piel), lum = 0.2126 * tl[0] + 0.7152 * tl[1] + 0.0722 * tl[2], osc = 1 - paso(0.06, 0.26, lum);
      tex(0, textura('piel_' + a.fig), u.uDetA); tex(1, textura('piel_' + a.fig + 'o'), u.uDetO);
      gl.uniform3fv(u.uMediaA, D.media['piel_' + a.fig]); gl.uniform3fv(u.uMediaO, D.media['piel_' + a.fig + 'o']);
      gl.uniform1f(u.uOsc, osc);
      gl.uniform3fv(u.uTono, albedoPiel(a.piel)); gl.uniform1f(u.uBrilloPiel, 1.0 - 0.35 * osc);
      var cr = albedoDe(a.peloColor, false); gl.uniform4f(u.uRapado, cr[0] * 0.75, cr[1] * 0.75, cr[2] * 0.75, a.pelo === 'rapado' ? 1 : 0);
      var mm = E.barr >= 0.999 ? 1 : 0, H = D.hitos[vr()];
      tex(2, textura('mus_id'), u.uMusId); tex(3, textura('mus_dist'), u.uMusDist);
      gl.uniform3fv(u.uProtCol, new Float32Array(hex(PROTO.encaje).concat(hex(PROTO.mano))));
      gl.uniform1fv(u.uMus, codigos());
      var nv4 = [], sm4 = []; PALETA.nivel.forEach(function (c, i) { nv4 = nv4.concat(hexS(c)); sm4 = sm4.concat(hexS(PALETA.sombra[i])); });
      gl.uniform3fv(u.uNiv, new Float32Array(nv4)); gl.uniform3fv(u.uSom, new Float32Array(sm4));
      gl.uniform3fv(u.uBaseMus, hexS(PALETA.base)); gl.uniform3fv(u.uSurco, hexS(PALETA.surco));
      gl.uniform1f(u.uLuzMan, E.luz.maniqui == null ? 1 : E.luz.maniqui);
      var cs = E.luz.contraCol, cmx = Math.max(cs[0], cs[1], cs[2]) || 1; gl.uniform3f(u.uContraS, cs[0] / cmx, cs[1] / cmx, cs[2] / cmx);
      gl.uniform1f(u.uRelieve, 0.070); gl.uniform1f(u.uT, E.t);
      gl.uniform1f(u.uDepura, opc.depura ? 1 : 0);
      gl.uniform3f(u.uCorteCab, H.cab[1] - 0.12 - 0.315 * (1.23 - H.cab[2]), -0.315, 0.30);
      pinta(mc);

      /* ojos */
      pr = PR.ojo; comunes(pr, cam); tex(0, textura('ojo'), pr.u.uTex);
      pinta(malla('ojos'));

      /* la prótesis (el tubo, los aros y las tapas): carcasa, con el sombreador de la tela */
      if (pt) {
        pr = PR.tela; u = pr.u; comunes(pr, cam);
        gl.uniform3f(u.uBarr, 999, 0, 0); gl.vertexAttrib1f(3, 1);
        gl.uniform3fv(u.uColor, hex(PROTO.tubo)); gl.uniform1f(u.uSeda, 2.5); pinta(pt);
      }

      /* calzado */
      if (!mm && mz) {
        pr = PR.calz; u = pr.u; comunes(pr, cam);
        gl.uniform3fv(u.uColor, hex(a.calzadoColor)); gl.uniform3fv(u.uSuelaC, hex('#F2F0EA')); gl.uniform3fv(u.uCalcetin, hex('#ECEEF1'));
        gl.uniform3fv(u.uLazo, hex('#F4F4F2')); gl.uniform3fv(u.uGoma, hex('#3A3F48'));
        gl.uniform4f(u.uPie, H.pie[0], H.pie[1], H.pie[2], H.pie[3]); gl.uniform2f(u.uLargo, H.pie[4], H.pie[5]);
        gl.uniform1f(u.uTope, topeCal()); gl.uniform1f(u.uDep, opc.depura ? 1 : 0);
        pinta(mz);
      }

      /* ropa */
      pr = PR.tela; u = pr.u; comunes(pr, cam);
      gl.disable(gl.CULL_FACE);
      if (!mm && PRENDA.abajo) { gl.uniform3fv(u.uColor, hex(a.abajoColor)); gl.uniform1f(u.uSeda, /mallas/.test(a.abajo) ? 0.45 : 0.3); pinta(PRENDA.abajo); }
      if (!mm && PRENDA.arriba) { gl.uniform3fv(u.uColor, hex(a.arribaColor)); gl.uniform1f(u.uSeda, a.arriba === 'top' ? 0.45 : 0.3); pinta(PRENDA.arriba); }

      if (a.gafas && a.gafas !== 'no') {
        var gf = gafas();
        pr = PR.tela; u = pr.u; comunes(pr, cam);
        gl.uniform3f(u.uBarr, 999, 0, 0); gl.vertexAttrib1f(3, 1);
        gl.uniform3fv(u.uColor, hex(a.gafas === 'sol' ? '#14161A' : '#2A2622')); gl.uniform1f(u.uSeda, 4.0);
        gl.enable(gl.CULL_FACE); pinta(gf.montura); gl.disable(gl.CULL_FACE);
      }
      /* pelo: primero lo opaco (escribe profundidad), luego el borde suave (mezcla) */
      if (mp) {
        pr = PR.pelo; u = pr.u; comunes(pr, cam);
        tex(0, textura('pelo_' + a.pelo), u.uTex);
        gl.uniform3fv(u.uColor, hex(a.peloColor));
        gl.uniform1f(u.uCorte, CORTE_PELO[a.pelo] || 0.62);
        gl.uniform1f(u.uSesgoMas, E.sesgoPelo == null ? 0.012 : E.sesgoPelo);      /* solo le da sombra lo que está a más de un par de centímetros */
        gl.uniform1f(u.uPase, 0); pinta(mp);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        gl.uniform1f(u.uPase, 1); pinta(mp);
        gl.depthMask(true); gl.disable(gl.BLEND);
      }
      /* el audífono, después del pelo: lo que el pelo tapa se insinúa a través de él (segunda pasada, solo donde
         hay algo delante, al 45 %), para que se vea que lo lleva también con el pelo por encima de la oreja */
      if (au.cuerpo) {
        pr = PR.tela; u = pr.u; comunes(pr, cam);
        gl.uniform3f(u.uBarr, 999, 0, 0); gl.vertexAttrib1f(3, 1); gl.enable(gl.CULL_FACE);
        gl.uniform3fv(u.uColor, hex(PROTO.audifono)); gl.uniform1f(u.uSeda, 3.0); pinta(au.cuerpo);
        gl.uniform3fv(u.uColor, hex(PROTO.audifonoTubo)); gl.uniform1f(u.uSeda, 4.0); pinta(au.tubo);
        gl.depthFunc(gl.GREATER); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA); gl.blendColor(0, 0, 0, 0.45);
        gl.uniform3fv(u.uColor, hex(PROTO.audifono)); pinta(au.cuerpo); gl.uniform3fv(u.uColor, hex(PROTO.audifonoTubo)); pinta(au.tubo);
        gl.disable(gl.BLEND); gl.depthMask(true); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
      }
      /* cejas y pestañas: mezcla, sin escribir profundidad */
      pr = PR.vello; u = pr.u; comunes(pr, cam);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.uniform1f(u.uInfla, 0.006);
      var pc = hex(a.peloColor), cl = 0.2126 * pc[0] + 0.7152 * pc[1] + 0.0722 * pc[2];
      var ceja = pc.map(function (x) { return x * (cl > 0.25 ? 0.30 : 0.55); });
      gl.uniform3fv(u.uColor, ceja); gl.uniform1f(u.uFuerza, 1.5);
      tex(0, textura('cejas'), u.uTex); pinta(malla('cejas'));
      gl.uniform3fv(u.uColor, [0.012, 0.009, 0.008]); gl.uniform1f(u.uFuerza, 1.0);
      tex(0, textura('pestanas'), u.uTex); pinta(malla('pestanas'));
      if (a.gafas && a.gafas !== 'no') {
        pr = PR.lente; u = pr.u; comunes(pr, cam);
        if (a.gafas === 'sol') gl.uniform4f(u.uColor, 0.012, 0.014, 0.018, 0.86); else gl.uniform4f(u.uColor, 0.55, 0.62, 0.70, 0.07);
        pinta(GAFAS.lentes);
      }
      gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
      gl.bindVertexArray(null);
      dibujado = true;
      return true;
    }

    function ajusta() {
      var dpr = Math.min(raiz.devicePixelRatio || 1, opc.dprMax || 3);
      var w = Math.max(2, Math.round(lienzo.clientWidth * dpr)), h = Math.max(2, Math.round(lienzo.clientHeight * dpr));
      if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }
    }

    /* --- el toque: un rayo desde la cámara hasta la piel, y de ahí al mapa de músculos --- */
    function rayo(xc, yc) {
      var w = lienzo.clientWidth, h = lienzo.clientHeight, alto = D.alto[vr()];
      var fov = 15 * Math.PI / 180, tg = Math.tan(fov / 2), visto = alto * 1.10 / E.zoom, dist = (visto / 2) / tg;
      var cy = E.cy == null ? alto * 0.5 : E.cy;
      var dx = ((xc / w) * 2 - 1) * tg * (w / h), dy = (1 - (yc / h) * 2) * tg, dz = -1;
      /* al espacio del cuerpo: se deshace el giro alrededor del eje vertical */
      var a = E.giro * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), pz = 0.35;
      var ox = 0, oz = dist - pz;
      return { o: [c * ox - s * oz, cy, s * ox + c * oz + pz], d: [c * dx - s * dz, dy, s * dx + c * dz] };
    }
    /* la zona de la prótesis de un vértice del cuerpo (como en el sombreador): 0 piel, 1 encaje, 2 nada, 3 pie o mano */
    function zonaProt(i) {
      var m = M.cuerpo, p = m.pos, e = PROTES.eje, o = PROTES.org, c = PROTES.c;
      var t = (p[i * 3] - o[0]) * e[0] + (p[i * 3 + 1] - o[1]) * e[1] + (p[i * 3 + 2] - o[2]) * e[2];
      return t < c[0] ? 0 : t < c[1] ? 1 : t < c[2] ? 2 : 3;
    }
    function musculoEn(xc, yc) {
      var m = M.cuerpo;
      if (!IDS || !m || !m.var) return 0;
      var p = m.pos, t = m.tri, uv = m.uv, pr = m.prot, R = rayo(xc, yc), o = R.o, d = R.d;
      var mejor = Infinity, mu = 0, mv = 0, mi = -1;
      for (var i = 0; i < t.length; i += 3) {
        /* lo que la prótesis quita no está; el encaje, el pie y la mano son carcasa: se tocan, pero sin músculo */
        if (pr[t[i]] > 0.5 && zonaProt(t[i]) === 2) continue;
        var a = t[i] * 3, b = t[i + 1] * 3, c = t[i + 2] * 3;
        var e1x = p[b] - p[a], e1y = p[b + 1] - p[a + 1], e1z = p[b + 2] - p[a + 2];
        var e2x = p[c] - p[a], e2y = p[c + 1] - p[a + 1], e2z = p[c + 2] - p[a + 2];
        var px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
        var det = e1x * px + e1y * py + e1z * pz;
        if (det < 1e-9) continue;                              /* de espaldas o paralelo */
        var tx = o[0] - p[a], ty = o[1] - p[a + 1], tz = o[2] - p[a + 2];
        var u = (tx * px + ty * py + tz * pz) / det; if (u < 0 || u > 1) continue;
        var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
        var v = (d[0] * qx + d[1] * qy + d[2] * qz) / det; if (v < 0 || u + v > 1) continue;
        var tt = (e2x * qx + e2y * qy + e2z * qz) / det;
        if (tt > 0 && tt < mejor) { mejor = tt; mu = u; mv = v; mi = i; }
      }
      if (mi < 0) return -1;                                    /* fuera del cuerpo */
      if (pr[t[mi]] > 0.5 && zonaProt(t[mi]) > 0) return 0;     /* la carcasa de la prótesis */
      var i0 = t[mi] * 2, i1 = t[mi + 1] * 2, i2 = t[mi + 2] * 2, w0 = 1 - mu - mv;
      var U = uv[i0] * w0 + uv[i1] * mu + uv[i2] * mv, V = uv[i0 + 1] * w0 + uv[i1 + 1] * mu + uv[i2 + 1] * mv;
      var X = Math.min(IDS.w - 1, Math.max(0, Math.floor(U * IDS.w))), Y = Math.min(IDS.h - 1, Math.max(0, Math.floor(V * IDS.h)));
      return IDS.d[Y * IDS.w + X];
    }
    /* el centro vale más; un anillo de 12 px y otro de 22 recogen los dedos gordos */
    function toca(xc, yc) {
      var votos = {}, mu = D.musculos || [], centro = musculoEn(xc, yc), dentro = centro >= 0;
      function vota(id, peso) { if (id > 0) { var g = mu[id - 1][1]; votos[g] = (votos[g] || 0) + peso; } }
      vota(centro, 6);
      [12, 22].forEach(function (rad, n) {
        for (var k = 0; k < 8; k++) { var id = musculoEn(xc + Math.cos(k * Math.PI / 4) * rad, yc + Math.sin(k * Math.PI / 4) * rad); if (id >= 0) dentro = true; vota(id, n ? 1 : 2); }
      });
      var mejor = null, max = 0;
      for (var g in votos) if (votos[g] > max) { max = votos[g]; mejor = g; }
      return mejor ? { g: mejor, m: centro > 0 ? mu[centro - 1][0] : null } : (dentro ? { g: null, m: null } : null);
    }

    /* --- el movimiento: giro, barrido y respiración --- */
    var raf = 0, tAnt = 0, tUlt = 0, giroObj = null, vel = 0, vivo = false, perdido = false;
    var tParp = 1.6, parpIni = -9, parpDoble = false, sonrHasta = -1, sonrLin = 0;
    function suave(x) { return x * x * (3 - 2 * x); }
    function pide() { if (!raf && !perdido) raf = requestAnimationFrame(cuadro); }
    function cuadro(ts) {
      raf = 0;
      var dt = Math.min(0.12, tAnt ? (ts - tAnt) / 1000 : 0.016); tAnt = ts;
      var sigue = false, soloVivo = true;
      if (giroObj != null) {
        var df = giroObj - E.giro;
        if (Math.abs(df) < 0.25) { E.giro = giroObj; giroObj = null; } else { E.giro += df * Math.min(1, dt * 8); sigue = true; }
        soloVivo = false;
      } else if (Math.abs(vel) > 3) { E.giro += vel * dt; vel *= Math.pow(0.02, dt); sigue = true; soloVivo = false; }
      var bo = E.modo === 'musculos' ? 1 : 0;
      if (E.barrLin !== bo) {
        var ps = dt / (opc.barridoSeg || 0.85);
        E.barrLin = bo > E.barrLin ? Math.min(bo, E.barrLin + ps) : Math.max(bo, E.barrLin - ps);
        E.barr = suave(E.barrLin); sigue = true; soloVivo = false;
      }
      if (vivo) {
        sigue = true;
        var enGesto = E.t - parpIni < 0.26 || sonrLin !== (E.t < sonrHasta ? 1 : 0);
        /* en reposo basta con unos 30 cuadros por segundo; un parpadeo o una sonrisa piden todos */
        if (soloVivo && !enGesto && ts - tUlt < 30) { pide(); return; }
        var dv = Math.min(0.1, soloVivo ? (ts - tUlt) / 1000 : dt);
        E.t += dv; E.resp = 0.5 + 0.5 * Math.sin(E.t * 1.55);
        /* parpadeo: cada pocos segundos, a veces doble; cierra rápido y abre más despacio */
        if (E.t >= tParp) { parpIni = E.t; parpDoble = !parpDoble && Math.random() < 0.18; tParp = E.t + (parpDoble ? 0.34 : 2.2 + Math.random() * 3.8); }
        var tp = E.t - parpIni;
        E.parp = tp < 0.075 ? suave(tp / 0.075) : tp < 0.24 ? 1 - suave((tp - 0.075) / 0.165) : 0;
        /* sonrisa: sube en un cuarto de segundo y se va en algo más de medio */
        var so = E.t < sonrHasta ? 1 : 0;
        if (sonrLin !== so) sonrLin = so > sonrLin ? Math.min(1, sonrLin + dv / 0.26) : Math.max(0, sonrLin - dv / 0.65);
        E.sonr = E.sonrBase + (1 - E.sonrBase) * suave(sonrLin);
      } else { E.t += dt; E.sonr = E.sonrBase; }
      tUlt = ts;
      ajusta(); dibuja();
      if (opc.alCuadro) opc.alCuadro(api);
      if (sigue) pide(); else tAnt = 0;
    }
    lienzo.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); perdido = true; if (raf) cancelAnimationFrame(raf); raf = 0; if (opc.alPerder) opc.alPerder(); });

    var api = {
      gl: gl, estado: E, lienzo: lienzo,
      pon: function (cambios) { for (var k in cambios) E[k] = cambios[k]; pide(); return api; },
      aspecto: function (a) { for (var k in a) E.asp[k] = a[k]; api.precarga(); pide(); return api; },
      luz: function (L) { for (var k in L) E.luz[k] = L[k]; pide(); return api; },
      /* 'persona' o 'musculos'; con barrido si animado */
      modo: function (m, animado) {
        E.modo = m === 'musculos' ? 'musculos' : 'persona';
        if (!animado) { E.barrLin = E.barr = E.modo === 'musculos' ? 1 : 0; }
        pide(); return api;
      },
      /* gira hasta un ángulo (0 = de frente, 180 = de espaldas) por el camino corto */
      vista: function (grados, animado) {
        var k = Math.round((E.giro - grados) / 360), obj = grados + 360 * k;
        vel = 0;
        if (animado) giroObj = obj; else { E.giro = obj; giroObj = null; }
        pide(); return api;
      },
      arrastra: function (grados) { giroObj = null; vel = 0; E.giro += grados; pide(); return api; },
      suelta: function (gradosPorSeg) { vel = Math.max(-720, Math.min(720, gradosPorSeg || 0)); pide(); return api; },
      angulo: function () { var a = E.giro % 360; if (a > 180) a -= 360; if (a < -180) a += 360; return a; },
      deFrente: function () { return Math.abs(api.angulo()) <= 90; },
      toca: toca,
      vivo: function (b) { vivo = !!b; if (!vivo) { E.resp = 0; E.parp = 0; sonrLin = 0; sonrHasta = -1; E.sonr = E.sonrBase; } pide(); return api; },
      /* una sonrisa de unos segundos (al anotar una serie, al llenar un sello…); con la animación parada no hace nada */
      sonrie: function (seg) { if (vivo) { sonrHasta = E.t + (seg || 1.8); pide(); } return api; },
      /* la altura en pantalla (px CSS, desde arriba del lienzo) de la línea de barrido; null si no hay barrido */
      lineaBarrido: function () {
        if (E.barr <= 0.001 || E.barr >= 0.999) return null;
        var alto = D.alto[vr()], y = alto + 0.7 - (alto + 1.4) * E.barr, visto = alto * 1.10 / E.zoom, cy = E.cy == null ? alto * 0.5 : E.cy;
        return (0.5 - (y - cy) / visto) * lienzo.clientHeight;
      },
      /* true cuando el cuerpo ya se ha dibujado con la variante pedida y sin texturas pendientes */
      preparado: function () { var m = M.cuerpo; return !!(dibujado && m && m.var === variante() && !pendientes); },
      /* lo que la malla tiene de verdad: la variante del cuerpo en pantalla y las mallas creadas */
      tiene: function () { var m = M.cuerpo; return { variante: m ? m.var : null, mallas: Object.keys(M), fallos: fallos.slice() }; },
      /* han llegado datos nuevos (mallas, variantes, texturas): se tienen en cuenta en el próximo cuadro */
      cambia: function () { pide(); return api; },
      dibuja: function () { ajusta(); dibuja(); return api; },
      /* una copia del dibujo en un lienzo 2D (para la postal): de frente y en modo persona salvo que se diga otra cosa */
      foto: function (o) {
        o = o || {};
        var g = E.giro, b = E.barr, z = E.zoom, r = E.resp, pa0 = E.parp, so0 = E.sonr, w0 = lienzo.width, h0 = lienzo.height;
        E.giro = o.giro == null ? 0 : o.giro; E.barr = o.musculos ? 1 : 0; E.resp = 0; E.parp = 0; E.sonr = o.sonrisa == null ? E.sonrBase : o.sonrisa;
        if (o.ancho && o.alto) { lienzo.width = o.ancho; lienzo.height = o.alto; } else ajusta();
        dibuja();
        var c = document.createElement('canvas'); c.width = lienzo.width; c.height = lienzo.height;
        c.getContext('2d').drawImage(lienzo, 0, 0);
        E.giro = g; E.barr = b; E.zoom = z; E.resp = r; E.parp = pa0; E.sonr = so0; lienzo.width = w0; lienzo.height = h0;
        dibuja();
        return c;
      },
      listo: function (f) { if (!pendientes) f(); else alListo.push(f); },
      precarga: function () { var a = E.asp; ['piel_' + a.fig, 'piel_' + a.fig + 'o', 'ojo', 'cejas', 'pestanas', 'pelo_' + a.pelo, 'mus_id', 'mus_dist'].forEach(function (k) { if (D.tex[k]) textura(k); }); return api; },
      destruye: function () { perdido = true; if (raf) cancelAnimationFrame(raf); var e = gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); }
    };
    return api;
  }


  /* ---------- el cargador (7-11-2026): los datos de datos/cuerpo3d/, pieza a pieza ----------
     indice.json dice qué hay (las mallas con sus cabeceras, las variantes, los hitos, las texturas) y
     qué fichero trae cada cosa, con sus bytes y su sha256. Cada fichero .bin es un contenedor
     «TG3D» (tools/cuerpo3d/empaqueta3d.py) con secciones que se vuelcan tal cual en el objeto de
     datos que el motor lee (D.mallas[m].tri, D.mallas[m].pos[v], D.gestos, D.partes). Las texturas
     se dejan como URL: el motor las pide al dibujar. Se pide solo lo que necesita un aspecto, y
     nada dos veces. */
  function cargador(base) {
    var D = null, indice = null, ficheros = {};      /* clave del fichero → promesa */
    function sha256(buf) {
      try { if (raiz.crypto && raiz.crypto.subtle && raiz.isSecureContext) return raiz.crypto.subtle.digest('SHA-256', buf).then(function (h) { return Array.prototype.map.call(new Uint8Array(h), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(''); }); } catch (e) {}
      return Promise.resolve(null);
    }
    function pide(url) { return fetch(base + url).then(function (r) { if (!r.ok) throw new Error(url); return r; }); }
    /* un .bin: las secciones, comprobadas (los bytes siempre; la suma, donde el navegador la calcula); v, la
       variante a la que van sus posiciones (los ficheros «-a0»…«-b2») */
    function fichero(clave, v) {
      if (ficheros[clave]) return ficheros[clave];
      var f = indice.ficheros[clave]; if (!f) return Promise.reject(new Error('sin fichero ' + clave));
      ficheros[clave] = pide(f.f).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
        if (buf.byteLength !== f.bytes) throw new Error(f.f + ': ' + buf.byteLength + ' bytes, no ' + f.bytes);
        return sha256(buf).then(function (h) {
          if (h && h !== f.sha256) throw new Error(f.f + ': la suma no es la del índice');
          var u = new Uint8Array(buf), dv = new DataView(buf);
          if (u[0] !== 84 || u[1] !== 71 || u[2] !== 51 || u[3] !== 68) throw new Error(f.f + ': no es un contenedor TG3D');
          var n = dv.getUint32(4, true), cab = JSON.parse(new TextDecoder().decode(u.subarray(8, 8 + n))), ini = 8 + n;
          cab.sec.forEach(function (sec) { coloca(sec[0], new Uint8Array(buf, ini + sec[1], sec[2]), v); });
          return clave;
        });
      }).catch(function (e) { delete ficheros[clave]; throw e; });
      return ficheros[clave];
    }
    /* una sección («cuerpo.tri», «cuerpo.pos» del fichero de una variante, «gestos.cejas.parp.i», «partes.cuero») a su sitio.
       Solo con los nombres que escribe empaqueta3d.py y de lo que el índice conoce: una sección con otro nombre (de un
       fichero roto o cambiado) se deja, y ningún nombre («__proto__», «constructor»…) escribe fuera de los datos, en
       Object.prototype (7-11-2026) */
    var CAMPOS = { tri: 1, uv: 1, sold: 1, pos: 1 };
    function bueno(k) { return typeof k === 'string' && /^[A-Za-z0-9_]+$/.test(k) && k !== '__proto__' && k !== 'constructor' && k !== 'prototype'; }
    function propia(o, k) { return bueno(k) && !!o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k); }
    function coloca(nombre, u, v) {
      var p = String(nombre).split('.'), g;
      if (p[0] === 'gestos') {
        if (p.length !== 4 || (p[3] !== 'i' && p[3] !== 'd') || !propia(indice.gestos, p[1]) || !propia(indice.gestos[p[1]], p[2])) return;
        g = propia(D.gestos, p[1]) ? D.gestos[p[1]] : (D.gestos[p[1]] = {});
        if (!propia(g, p[2])) g[p[2]] = { s: indice.gestos[p[1]][p[2]].s, n: indice.gestos[p[1]][p[2]].n };
        g[p[2]][p[3]] = u; return;
      }
      if (p[0] === 'partes') { if (p.length === 2 && bueno(p[1]) && Array.isArray(indice.partes) && indice.partes.indexOf(p[1]) >= 0) D.partes[p[1]] = u; return; }
      if (p.length !== 2 || !propia(D.mallas, p[0]) || !propia(CAMPOS, p[1])) return;
      var m = D.mallas[p[0]];
      if (p[1] === 'pos') { if (v) m.pos[v] = u; } else m[p[1]] = u;
    }
    function piezasDe(a) {
      /* qué ficheros (.bin) y qué texturas necesita un aspecto: fig+comp → variante; pelo; calzado */
      var v = a.fig + a.comp, L = [['cuerpo', null], ['cuerpo-' + v, v]];
      if (D.mallas['pelo_' + a.pelo]) L.push(['pelo-' + a.pelo, null], ['pelo-' + a.pelo + '-' + v, v]);
      if (a.calzado !== 'descalzo' && D.mallas['cz_' + a.calzado]) L.push([a.calzado, null], [a.calzado + '-' + v, v]);
      return L;
    }
    var api = {
      /* el índice, una vez; devuelve el objeto de datos del motor, aún sin mallas */
      indice: function () {
        if (D) return Promise.resolve(D);
        return pide('indice.json').then(function (r) { return r.json(); }).then(function (I) {
          if (!I || I.v !== 1 || !I.mallas || !I.ficheros) throw new Error('indice.json');
          indice = I;
          D = { v: 1, variantes: I.variantes, alto: I.alto, media: I.media, hitos: I.hitos, musculos: I.musculos, grupos: I.grupos, mallas: {}, tex: {}, gestos: {}, partes: {} };
          Object.keys(I.mallas).forEach(function (m) { if (!bueno(m)) return; var c = I.mallas[m]; D.mallas[m] = { nv: c.nv, nt: c.nt, ns: c.ns, q: c.q, mat: c.mat, tex: c.tex, pos: {} }; });
          Object.keys(I.tex).forEach(function (k) { if (bueno(k) && typeof I.tex[k] === 'string') D.tex[k] = base + I.tex[k]; });
          return D;
        });
      },
      datos: function () { return D; },
      indiceLeido: function () { return indice; },
      /* los ficheros de un aspecto (del motor: fig, comp, pelo, calzado); las texturas las pide el motor */
      piezas: function (a) {
        return api.indice().then(function () {
          return Promise.all(piezasDe(a).map(function (x) { return fichero(x[0], x[1]); }));
        });
      },
      /* true si todo lo de ese aspecto ya está (sin pedir nada) */
      tiene: function (a) {
        if (!D) return false;
        var v = a.fig + a.comp;
        return piezasDe(a).every(function (x) { var m = x[0] === 'cuerpo' || x[0] === 'cuerpo-' + v ? D.mallas.cuerpo : D.mallas[x[0].indexOf('pelo-') === 0 ? 'pelo_' + a.pelo : 'cz_' + a.calzado]; return x[1] ? !!m.pos[x[1]] : !!m.tri; });
      },
      /* todo lo que hay (al entrar en «Aspecto»): uno tras otro, para no estorbar a lo que se está viendo */
      todo: function () {
        return api.indice().then(function () {
          var claves = Object.keys(indice.ficheros).filter(function (k) { return k.indexOf('tex-') !== 0; }), p = Promise.resolve();
          claves.forEach(function (k) {
            var v = (k.match(/-([ab][012])$/) || [])[1];
            p = p.then(function () { return fichero(k, v); }).catch(function () {});
          });
          return p.then(function () { return Object.keys(indice.tex).map(function (k) { return D.tex[k]; }); });
        });
      },
      pedidos: function () { return Object.keys(ficheros); }
    };
    return api;
  }

  raiz.TG_CUERPO3D = { crea: crea, soportado: soportado, cargador: cargador };
})(typeof window !== 'undefined' ? window : this);
