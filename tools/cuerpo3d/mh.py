"""Lectura de los datos de MakeHuman (CC0) y construcción del cuerpo.

Todo lo de este fichero es código propio: lee los formatos de datos de
MakeHuman (base.obj, .target, .mhskel, .mhw) y aplica las mismas reglas de
mezcla que documenta su proyecto. Las unidades de MakeHuman son decímetros.
"""
import json
import os
import numpy as np

# Dónde están los datos de MakeHuman (tools/cuerpo3d/LEEME.md): el repositorio oficial
# makehumancommunity/makehuman (su carpeta makehuman/data), por la variable TG_MH o en
# tools/cuerpo3d/fuentes/makehuman/makehuman/data; y la caché de lo leído, en tools/cuerpo3d/cache
AQUI = os.path.dirname(os.path.abspath(__file__))
MH = os.environ.get('TG_MH') or os.path.join(AQUI, 'fuentes', 'makehuman', 'makehuman', 'data')
CACHE = os.environ.get('TG_CACHE') or os.path.join(AQUI, 'cache')
os.makedirs(CACHE, exist_ok=True)


class Base:
    """La malla base: vértices, UV, caras (con su grupo)."""

    def __init__(self):
        p = os.path.join(CACHE, 'base.npz')
        if os.path.exists(p):
            d = np.load(p, allow_pickle=True)
            self.v = d['v']; self.vt = d['vt']
            self.fv = d['fv']; self.ft = d['ft']; self.fg = d['fg']
            self.grupos = list(d['grupos'])
            return
        v, vt, fv, ft, fg, grupos = [], [], [], [], [], []
        g = -1
        with open(os.path.join(MH, '3dobjs/base.obj')) as f:
            for ln in f:
                if ln.startswith('v '):
                    a = ln.split(); v.append((float(a[1]), float(a[2]), float(a[3])))
                elif ln.startswith('vt '):
                    a = ln.split(); vt.append((float(a[1]), float(a[2])))
                elif ln.startswith('g '):
                    nombre = ln.split()[1]
                    if nombre not in grupos:
                        grupos.append(nombre)
                    g = grupos.index(nombre)
                elif ln.startswith('f '):
                    a = ln.split()[1:]
                    iv = [int(x.split('/')[0]) - 1 for x in a]
                    it = [int(x.split('/')[1]) - 1 for x in a]
                    assert len(iv) == 4, len(iv)
                    fv.append(iv); ft.append(it); fg.append(g)
        self.v = np.array(v, np.float64); self.vt = np.array(vt, np.float64)
        self.fv = np.array(fv, np.int32); self.ft = np.array(ft, np.int32)
        self.fg = np.array(fg, np.int32); self.grupos = grupos
        np.savez(p, v=self.v, vt=self.vt, fv=self.fv, ft=self.ft, fg=self.fg,
                 grupos=np.array(grupos, dtype=object))

    def caras_de(self, *nombres):
        ids = [self.grupos.index(n) for n in nombres]
        return np.isin(self.fg, ids)


_T = {}


def target(nombre):
    """Devuelve (indices, deltas) de un .target, o None si no existe."""
    if nombre in _T:
        return _T[nombre]
    p = os.path.join(MH, 'targets', nombre + '.target')
    if not os.path.exists(p):
        _T[nombre] = None
        return None
    idx, dl = [], []
    with open(p) as f:
        for ln in f:
            if not ln or ln[0] == '#':
                continue
            a = ln.split()
            if len(a) < 4:
                continue
            idx.append(int(a[0])); dl.append((float(a[1]), float(a[2]), float(a[3])))
    r = (np.array(idx, np.int32), np.array(dl, np.float64).reshape(-1, 3))
    _T[nombre] = r
    return r


def _tres(x):
    """min / average / max para una variable 0..1."""
    mx = max(0.0, x * 2 - 1); mn = max(0.0, 1 - x * 2)
    return mn, 1 - (mx + mn), mx


def _tres_b(x):
    mx = max(0.0, x * 2 - 1); mn = max(0.0, 1 - x * 2)
    return mn, (1 - mx) if mx > mn else (1 - mn), mx


def _edad(age):
    if age < 0.5:
        old = 0.0
        baby = max(0.0, 1 - age * 5.333)
        young = max(0.0, (age - 0.1875) * 3.2)
        child = max(0.0, min(1.0, 5.333 * age) - young)
    else:
        child = baby = 0.0
        old = max(0.0, age * 2 - 1)
        young = 1 - old
    return {'baby': baby, 'child': child, 'young': young, 'old': old}


def macro(gender=0.5, age=0.5, muscle=0.5, weight=0.5, height=0.5, prop=0.5,
          cup=0.5, firm=0.5, raza=(1 / 3, 1 / 3, 1 / 3)):
    """Lista de (target, peso) para las variables macro de MakeHuman."""
    gen = {'male': gender, 'female': 1 - gender}
    eda = _edad(age)
    mu = dict(zip(('minmuscle', 'averagemuscle', 'maxmuscle'), _tres(muscle)))
    pe = dict(zip(('minweight', 'averageweight', 'maxweight'), _tres(weight)))
    al = dict(zip(('minheight', 'averageheight', 'maxheight'), _tres_b(height)))
    pr = dict(zip(('uncommonproportions', 'regularproportions', 'idealproportions'), _tres_b(prop)))
    cu = dict(zip(('mincup', 'averagecup', 'maxcup'), _tres_b(cup)))
    fi = dict(zip(('minfirmness', 'averagefirmness', 'maxfirmness'), _tres_b(firm)))
    ra = dict(zip(('african', 'asian', 'caucasian'), raza))
    out = []
    for g, gv in gen.items():
        for e, ev in eda.items():
            if gv * ev == 0:
                continue
            for r, rv in ra.items():
                out.append((f'macrodetails/{r}-{g}-{e}', rv * gv * ev))
            for m, mv in mu.items():
                for p, pv in pe.items():
                    w = gv * ev * mv * pv
                    if w == 0:
                        continue
                    out.append((f'macrodetails/universal-{g}-{e}-{m}-{p}', w))
                    for a, av in al.items():
                        if a != 'averageheight' and av:
                            out.append((f'macrodetails/height/{g}-{e}-{m}-{p}-{a}', w * av))
                    for q, qv in pr.items():
                        if q != 'regularproportions' and qv:
                            out.append((f'macrodetails/proportions/{g}-{e}-{m}-{p}-{q}', w * qv))
                    if g == 'female':
                        for c, cv in cu.items():
                            for f_, fv in fi.items():
                                if cv * fv and not (c == 'averagecup' and f_ == 'averagefirmness'):
                                    out.append((f'breast/female-{e}-{m}-{p}-{c}-{f_}', w * cv * fv))
    return [(n, w) for n, w in out if w > 1e-9]


def cuerpo(base, extra=(), **kw):
    """Vértices (19158×3) con las variables macro y los targets de `extra`."""
    v = base.v.copy()
    faltan = []
    for n, w in list(macro(**kw)) + list(extra):
        t = target(n)
        if t is None:
            faltan.append(n)
            continue
        v[t[0]] += t[1] * w
    return v, faltan


class Esqueleto:
    def __init__(self):
        d = json.load(open(os.path.join(MH, 'rigs/default.mhskel')))
        self.huesos = d['bones']; self.juntas = d['joints']
        w = json.load(open(os.path.join(MH, 'rigs/default_weights.mhw')))['weights']
        self.nombres = sorted(self.huesos)
        self.pesos = w

    def junta(self, v, nombre):
        return v[self.juntas[nombre]].mean(axis=0)

    def cabeza(self, v, hueso):
        return self.junta(v, self.huesos[hueso]['head'])

    def cola(self, v, hueso):
        return self.junta(v, self.huesos[hueso]['tail'])

    def hijos(self, hueso):
        out = [hueso]
        cola = [hueso]
        while cola:
            b = cola.pop()
            for n, h in self.huesos.items():
                if h['parent'] == b:
                    out.append(n); cola.append(n)
        return out

    def matriz_pesos(self, n=19158):
        """Matriz densa vértice × hueso (normalizada por fila)."""
        p = os.path.join(CACHE, 'pesos.npy')
        if os.path.exists(p):
            return np.load(p)
        W = np.zeros((n, len(self.nombres)), np.float32)
        for b, lst in self.pesos.items():
            j = self.nombres.index(b)
            a = np.array(lst)
            W[a[:, 0].astype(int), j] = a[:, 1]
        s = W.sum(axis=1, keepdims=True)
        s[s == 0] = 1
        W /= s
        np.save(p, W)
        return W


def rot(eje, ang):
    """Matriz 3×3 de giro (Rodrigues), ángulo en grados."""
    e = np.asarray(eje, float); e /= np.linalg.norm(e)
    a = np.radians(ang); c, s = np.cos(a), np.sin(a)
    K = np.array([[0, -e[2], e[1]], [e[2], 0, -e[0]], [-e[1], e[0], 0]])
    return np.eye(3) * c + s * K + (1 - c) * np.outer(e, e)


def posar(v, esq, giros, W=None):
    """Postura por mezcla lineal de pesos.

    giros: lista de (hueso, eje, grados) en orden de padre a hijo; cada giro
    se aplica al hueso y a toda su descendencia alrededor de la cabeza del
    hueso (ya movida por los giros anteriores)."""
    if W is None:
        W = esq.matriz_pesos(len(v))
    nb = len(esq.nombres)
    R = np.tile(np.eye(3), (nb, 1, 1)); T = np.zeros((nb, 3))
    for hueso, eje, ang in giros:
        j = esq.nombres.index(hueso)
        p0 = esq.cabeza(v, hueso)
        p = R[j] @ p0 + T[j]            # el pivote, ya movido
        eje_m = R[j] @ np.asarray(eje, float)
        Rg = rot(eje_m, ang)
        for h in esq.hijos(hueso):
            k = esq.nombres.index(h)
            R[k] = Rg @ R[k]
            T[k] = Rg @ (T[k] - p) + p
    # mezcla: v' = sum_b w_b (R_b v + T_b)
    out = np.zeros_like(v)
    usados = np.nonzero(W.sum(axis=0) > 0)[0]
    for k in usados:
        w = W[:, k:k + 1]
        if not w.any():
            continue
        out += w * (v @ R[k].T + T[k])
    sin = W.sum(axis=1) == 0
    out[sin] = v[sin]
    return out, R, T


def normales(v, tri):
    n = np.zeros_like(v)
    a, b, c = v[tri[:, 0]], v[tri[:, 1]], v[tri[:, 2]]
    fn = np.cross(b - a, c - a)
    for i in range(3):
        np.add.at(n, tri[:, i], fn)
    l = np.linalg.norm(n, axis=1, keepdims=True); l[l == 0] = 1
    return n / l
