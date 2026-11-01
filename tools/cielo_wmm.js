/* tools/cielo_wmm.js — la declinacion magnetica con el World Magnetic Model.
 *
 * La brujula del movil marca el norte MAGNETICO: el de Android (el sensor de
 * rotacion, que es lo que da «deviceorientationabsolute») y el de iOS
 * (webkitCompassHeading). En Tenerife el norte magnetico esta unos grados al
 * oeste del de verdad, y con «Apunta al cielo» eso es la distancia entre dos
 * estrellas: sin corregirlo, la app nombraria la de al lado.
 *
 * El modelo es el WMM2025 de la NOAA y el British Geological Survey (dominio
 * publico, valido de 2025,0 a 2030,0). Sus coeficientes son WMM_2025.COF,
 * que tools/cielo_fuentes.sh baja con commit fijado (de pygeomag, MIT, que lo
 * copia tal cual de la NOAA). El calculo es el del informe tecnico del WMM
 * (Chulliat et al., «The US/UK World Magnetic Model for 2025-2030», NOAA
 * NCEI), el mismo de la rutina oficial geomag.c: paso de latitud geodesica a
 * geocentrica, funciones de Legendre seminormalizadas de Schmidt hasta grado
 * 12, suma en armonicos esfericos y giro de vuelta al elipsoide WGS84.
 *
 * Se comprueba contra la tabla de valores de prueba que publica la NOAA
 * (WMM2025testvalues.pdf): tools/auditar_cielo.js y tools/cielo_construir.js
 * la pasan, y si una fila no cuadra a 0,01 grados y 0,1 nT, paran.
 */
'use strict';

function leerCOF(txt) {
  const lineas = txt.split(/\r?\n/).filter(l => l.trim());
  const cab = lineas[0].trim().split(/\s+/);
  const epoca = +cab[0], modelo = cab[1];
  const g = {}, h = {}, gd = {}, hd = {};
  let nMax = 0;
  for (const l of lineas.slice(1)) {
    if (/^9{10,}/.test(l.trim())) break;
    const c = l.trim().split(/\s+/).map(Number);
    if (c.length < 6 || !c.every(isFinite)) throw new Error('fila rara en el COF: ' + l);
    const [n, m] = c, k = n * (n + 1) / 2 + m;
    g[k] = c[2]; h[k] = c[3]; gd[k] = c[4]; hd[k] = c[5];
    if (n > nMax) nMax = n;
  }
  return { epoca, modelo, nMax, g, h, gd, hd };
}

/* lat, lon en grados (geodesicos, WGS84); alt en km sobre el elipsoide;
   anio decimal. Devuelve X (norte), Y (este), Z (abajo) en nT y la
   declinacion D en grados (positiva al este). */
function campo(cof, lat, lon, altKm, anio) {
  const RAD = Math.PI / 180;
  const a = 6378.137, f = 1 / 298.257223563, e2 = f * (2 - f), re = 6371.2;
  const dt = anio - cof.epoca;
  /* geodesica -> geocentrica esferica */
  const sf = Math.sin(lat * RAD), cf = Math.cos(lat * RAD);
  const rc = a / Math.sqrt(1 - e2 * sf * sf);
  const p = (rc + altKm) * cf, z = (rc * (1 - e2) + altKm) * sf;
  const r = Math.hypot(p, z);
  const phig = Math.asin(z / r);                  // radianes
  /* Legendre de Gauss y su derivada, luego a Schmidt (geomag.c, MAG_PcupLow) */
  const N = cof.nMax, x = Math.sin(phig), zz = Math.sqrt((1 - x) * (1 + x));
  const P = [1], dP = [0];
  for (let n = 1; n <= N; n++) {
    for (let m = 0; m <= n; m++) {
      const i = n * (n + 1) / 2 + m;
      if (n === m) {
        const i1 = (n - 1) * n / 2 + m - 1;
        P[i] = zz * P[i1]; dP[i] = zz * dP[i1] + x * P[i1];
      } else if (n === 1 && m === 0) {
        const i1 = (n - 1) * n / 2 + m;
        P[i] = x * P[i1]; dP[i] = x * dP[i1] - zz * P[i1];
      } else {
        const i1 = (n - 2) * (n - 1) / 2 + m, i2 = (n - 1) * n / 2 + m;
        if (m > n - 2) { P[i] = x * P[i2]; dP[i] = x * dP[i2] - zz * P[i2]; }
        else {
          const k = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));
          P[i] = x * P[i2] - k * P[i1]; dP[i] = x * dP[i2] - zz * P[i2] - k * dP[i1];
        }
      }
    }
  }
  const sq = [1];
  for (let n = 1; n <= N; n++) {
    const i = n * (n + 1) / 2, i1 = (n - 1) * n / 2;
    sq[i] = sq[i1] * (2 * n - 1) / n;
    for (let m = 1; m <= n; m++) {
      const j = n * (n + 1) / 2 + m;
      sq[j] = sq[j - 1] * Math.sqrt((n - m + 1) * (m === 1 ? 2 : 1) / (n + m));
    }
  }
  for (let i = 0; i < P.length; i++) { P[i] *= sq[i]; dP[i] = -dP[i] * sq[i]; }   // derivada respecto a la latitud
  /* suma */
  let Bx = 0, By = 0, Bz = 0;
  const lam = lon * RAD;
  for (let n = 1; n <= N; n++) {
    const rr = Math.pow(re / r, n + 2);
    for (let m = 0; m <= n; m++) {
      const i = n * (n + 1) / 2 + m;
      const g = cof.g[i] + dt * cof.gd[i], h = cof.h[i] + dt * cof.hd[i];
      const cm = Math.cos(m * lam), sm = Math.sin(m * lam);
      Bz -= rr * (g * cm + h * sm) * (n + 1) * P[i];
      By += rr * (g * sm - h * cm) * m * P[i];
      Bx -= rr * (g * cm + h * sm) * dP[i];
    }
  }
  By /= Math.cos(phig);           // (no se usa cerca de los polos: Tenerife esta a 28 grados)
  /* de vuelta al elipsoide */
  const psi = phig - lat * RAD;
  const X = Bx * Math.cos(psi) - Bz * Math.sin(psi);
  const Z = Bx * Math.sin(psi) + Bz * Math.cos(psi);
  return { X, Y: By, Z, D: Math.atan2(By, X) / RAD };
}

/* La tabla oficial de la NOAA (WMM2025testvalues.pdf, febrero de 2025):
   [anio, altura km, lat, lon, X, Y, Z, D] */
const PRUEBAS_NOAA = [
  [2025.0, 0, 80, 0, 6521.6, 145.9, 54791.5, 1.28],
  [2025.0, 0, 0, 120, 39677.8, -109.6, -10580.2, -0.16],
  [2025.0, 0, -80, 240, 6117.5, 15751.9, -52022.5, 68.78],
  [2025.0, 100, 80, 0, 6216, 92.4, 52598.8, 0.85],
  [2025.0, 100, 0, 120, 37688.6, -96.2, -10152.1, -0.15],
  [2025.0, 100, -80, 240, 5907.6, 14780.3, -49540.7, 68.21],
  [2027.5, 0, 80, 0, 6500.8, 294.5, 54869.4, 2.59],
  [2027.5, 0, 0, 120, 39701.6, -167.4, -10381.8, -0.24],
  [2027.5, 0, -80, 240, 6200.7, 15730.3, -51783.7, 68.49],
  [2027.5, 100, 80, 0, 6196.7, 233.8, 52670.5, 2.16],
  [2027.5, 100, 0, 120, 37711.5, -148.7, -9969.8, -0.23],
  [2027.5, 100, -80, 240, 5984, 14760.1, -49317.7, 67.93]
];
function comprobar(cof) {
  const mal = [];
  for (const [t, h, la, lo, X, Y, Z, D] of PRUEBAS_NOAA) {
    const c = campo(cof, la, lo, h, t);
    const d = ((c.D - D + 540) % 360) - 180;
    if (Math.abs(d) > 0.006 || Math.abs(c.X - X) > 0.06 || Math.abs(c.Y - Y) > 0.06 || Math.abs(c.Z - Z) > 0.06)
      mal.push(`${t} ${h} km ${la},${lo}: D ${c.D.toFixed(3)} (NOAA ${D}), X ${c.X.toFixed(1)} (${X}), Y ${c.Y.toFixed(1)} (${Y}), Z ${c.Z.toFixed(1)} (${Z})`);
  }
  return mal;
}

module.exports = { leerCOF, campo, comprobar, PRUEBAS_NOAA };
