"""Piezas que se ajustan al cuerpo: ojos, cejas, pestañas, pelo, calzado."""
import json
import os
import numpy as np
import mh

# Las piezas (pelo, cejas, pestañas, pieles, zapatillas) en JSON, como las guarda la copia de 2017
# makehuman-js/makehuman-data (tools/cuerpo3d/LEEME.md): por la variable TG_MJS o en
# tools/cuerpo3d/fuentes/makehuman-data/public/data
MJS = os.environ.get('TG_MJS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'makehuman-data', 'public', 'data')


class Pieza:
    """Malla con su ajuste a la malla base (tres vértices de referencia, pesos y desplazamiento)."""

    def __init__(self, nombre, v, vt, fv, ft, refs, pesos, offs, escalas=None, tex=None):
        self.nombre = nombre
        self.v = v; self.vt = vt; self.fv = fv; self.ft = ft
        self.refs = refs; self.pesos = pesos; self.offs = offs
        self.escalas = escalas      # [(v1, v2, den)] × 3 o None
        self.tex = tex

    def escala(self, v0, v_def):
        if self.escalas:
            return np.array([abs(v0[a, i] - v0[b, i]) / den for i, (a, b, den) in enumerate(self.escalas)])
        # sin datos: la proporción de la caja de los vértices de referencia frente al humano por defecto
        idx = np.unique(self.refs)
        ca = v0[idx].max(0) - v0[idx].min(0); cb = v_def[idx].max(0) - v_def[idx].min(0)
        cb[cb == 0] = 1
        s = ca / cb
        s[~np.isfinite(s)] = 1
        return s

    def ajusta(self, v0, v_def):
        """Posición de la pieza sobre el cuerpo `v0` (en reposo)."""
        r = self.refs; w = self.pesos
        p = (v0[r[:, 0]] * w[:, 0:1] + v0[r[:, 1]] * w[:, 1:2] + v0[r[:, 2]] * w[:, 2:3])
        return p + self.offs * self.escala(v0, v_def)

    def pesos_hueso(self, W):
        r = self.refs; w = np.clip(self.pesos, 0, None)
        s = w.sum(1, keepdims=True); s[s == 0] = 1; w = w / s
        return W[r[:, 0]] * w[:, 0:1] + W[r[:, 1]] * w[:, 1:2] + W[r[:, 2]] * w[:, 2:3]

    def posa(self, p, W, R, T):
        Wp = self.pesos_hueso(W)
        out = np.zeros_like(p)
        for k in np.nonzero(Wp.sum(0) > 0)[0]:
            out += Wp[:, k:k + 1] * (p @ R[k].T + T[k])
        return out

    def malla(self):
        """Triángulos y vértices partidos por UV: (mapa a vértice original, uv, tri)."""
        caras_v, caras_t = self.fv, self.ft
        tri_v, tri_t = [], []
        for cv, ct in zip(caras_v, caras_t):
            for i in range(1, len(cv) - 1):
                tri_v.append((cv[0], cv[i], cv[i + 1])); tri_t.append((ct[0], ct[i], ct[i + 1]))
        tri_v = np.array(tri_v, np.int64); tri_t = np.array(tri_t, np.int64)
        pares = np.stack([tri_v.reshape(-1), tri_t.reshape(-1)], 1)
        uniq, inv = np.unique(pares, axis=0, return_inverse=True)
        tri = inv.reshape(-1, 3)
        uv = self.vt[uniq[:, 1]].copy(); uv[:, 1] = 1 - uv[:, 1]
        return uniq[:, 0], uv, tri, tri_v


def _caras_three(faces):
    """Caras del formato JSON 3 de three.js → listas de índices de vértice y de UV."""
    fv, ft = [], []
    i = 0; n = len(faces)
    while i < n:
        t = faces[i]; i += 1
        nv = 4 if t & 1 else 3
        v = faces[i:i + nv]; i += nv
        if t & 2:
            i += 1
        if t & 4:
            i += 1
        uv = v
        if t & 8:
            uv = faces[i:i + nv]; i += nv
        if t & 16:
            i += 1
        if t & 32:
            i += nv
        if t & 64:
            i += 1
        if t & 128:
            i += nv
        fv.append(list(v)); ft.append(list(uv))
    return fv, ft


def de_json(cat, nombre):
    """Pieza de la copia de 2017 (makehuman-js): geometría y ajuste; la textura, aparte."""
    carp = f'{MJS}/proxies/{cat}/{nombre}'
    fich = [f for f in os.listdir(carp) if f.endswith('.json')][0]
    d = json.load(open(f'{carp}/{fich}'))
    v = np.array(d['vertices'], float).reshape(-1, 3)
    vt = np.array(d['uvs'][0], float).reshape(-1, 2)
    fv, ft = _caras_three(d['faces'])
    tex = d['materials'][0].get('mapDiffuse')
    return Pieza(nombre, v, vt, fv, ft, np.array(d['ref_vIdxs'], np.int64), np.array(d['weights'], float),
                 np.array(d['offsets'], float), None, f'{carp}/{tex}' if tex else None)


def de_mhclo(ruta):
    """Pieza oficial (.mhclo + .obj), con sus escalas."""
    carp = os.path.dirname(ruta)
    refs, pesos, offs, esc = [], [], [], {}
    obj = None; en_verts = False
    for ln in open(ruta):
        a = ln.split()
        if not a or a[0].startswith('#'):
            continue
        if a[0] == 'obj_file':
            obj = a[1]
        elif a[0] in ('x_scale', 'y_scale', 'z_scale'):
            esc[a[0][0]] = (int(a[1]), int(a[2]), float(a[3]))
        elif a[0] == 'verts':
            en_verts = True
        elif en_verts:
            if len(a) == 9:
                refs.append([int(a[0]), int(a[1]), int(a[2])])
                pesos.append([float(a[3]), float(a[4]), float(a[5])])
                offs.append([float(a[6]), float(a[7]), float(a[8])])
            elif len(a) == 1 and a[0].lstrip('-').isdigit():
                refs.append([int(a[0])] * 3); pesos.append([1.0, 0, 0]); offs.append([0, 0, 0])
            else:
                en_verts = False
    v, vt, fv, ft = [], [], [], []
    for ln in open(os.path.join(carp, obj)):
        if ln.startswith('v '):
            a = ln.split(); v.append((float(a[1]), float(a[2]), float(a[3])))
        elif ln.startswith('vt '):
            a = ln.split(); vt.append((float(a[1]), float(a[2])))
        elif ln.startswith('f '):
            a = ln.split()[1:]
            fv.append([int(x.split('/')[0]) - 1 for x in a]); ft.append([int(x.split('/')[1]) - 1 for x in a])
    assert len(v) == len(refs), (len(v), len(refs))
    return Pieza(os.path.basename(ruta)[:-6], np.array(v), np.array(vt), fv, ft, np.array(refs, np.int64),
                 np.array(pesos), np.array(offs), [esc['x'], esc['y'], esc['z']], None)
