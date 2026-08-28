#!/usr/bin/env node
/* Cargador comun de la auditoria: lee index.html y DEVUELVE LA RED YA
 * HIDRATADA. Leer TITSA_LINES en crudo da paradas que son claves, no objetos,
 * y todo lo que mida lat/lng/nombre sale mal sin dar error.
 *
 *     const { LINES, CAT, PLACES, km, norm } = require('./tools/cargar');
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.dirname(__dirname);
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function grab(decl, abre) {
  const i = src.indexOf(decl);
  if (i < 0) return null;
  const o = src.indexOf(abre, i);
  const cierra = abre === '[' ? ']' : '}';
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === abre) d++;
    else if (c === cierra) { d--; if (d === 0) return eval('(' + src.slice(o, k + 1) + ')'); }
  }
  return null;
}

const LINES  = grab('const TITSA_LINES = [', '[');
const CAT    = grab('const TITSA_PARADAS = {', '{');
const PLACES = grab('const places = [', '[');

for (const line of LINES) {
  if (!Array.isArray(line.paradas) || typeof line.paradas[0] !== 'string') continue;
  const term = new Set(line.terminales || []), usados = new Set();
  line.paradas = line.paradas.map((ref, i) => {
    const p = CAT[ref];
    if (!p) return null;
    let pid = line.id + '-' + ref;
    if (usados.has(pid)) pid = pid + '-' + i;
    usados.add(pid);
    return { id: pid, stopId: ref, nombre: p.n, lat: p.la, lng: p.lo,
             municipio: p.m, esTerminal: term.has(ref) };
  }).filter(Boolean);
}
const sinHidratar = LINES.filter(l => typeof (l.paradas || [])[0] === 'string');
if (sinHidratar.length) throw new Error('quedan claves sin resolver: ' + sinHidratar.map(l => l.id));

const km = (a, b) => {
  const R = 6371, r = Math.PI / 180;
  const dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
/* metros de un punto al SEGMENTO ab, no al vertice: con Douglas-Peucker los
   vertices quedan lejos en las rectas y medir al vertice infla muchisimo. */
const mSeg = (p, a, b) => {
  const kx = 111320 * Math.cos(p[0] * Math.PI / 180), ky = 110540;
  const px = p[1] * kx, py = p[0] * ky, ax = a[1] * kx, ay = a[0] * ky, bx = b[1] * kx, by = b[0] * ky;
  const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay, L = vx * vx + vy * vy;
  const t = L === 0 ? 0 : Math.max(0, Math.min(1, (vx * wx + vy * wy) / L));
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
};
const norm = s => (s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

module.exports = { src, RAIZ, LINES, CAT, PLACES, km, mSeg, norm };
