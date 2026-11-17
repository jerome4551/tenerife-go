"""Campos de la ropa sobre los vértices del cuerpo.

Cada prenda es un campo escalar por vértice (en decímetros, positivo = cubierto, 0 = el borde)
y una holgura (0..1). El navegador corta la malla del cuerpo por el borde y la separa de la piel:
así la prenda sigue a cualquier silueta y complexión. Se calculan sobre el cuerpo a1 ya posado."""
import numpy as np

NB = 13380          # vértices del cuerpo (sin ayudas)
TOPE = 0.32         # dm: el campo se guarda recortado a ±3,2 cm


def partes(esq, W):
    def sub(h):
        idx = [esq.nombres.index(b) for b in esq.hijos(h)]
        return W[:NB][:, idx].sum(1)
    return dict(brazoL=sub('upperarm01.L'), brazoR=sub('upperarm01.R'), piernaL=sub('upperleg01.L'),
                piernaR=sub('upperleg01.R'), cabeza=sub('neck01'), manoL=sub('wrist.L'), manoR=sub('wrist.R'),
                pieL=sub('foot.L'), pieR=sub('foot.R'), hombroL=sub('clavicle.L'), hombroR=sub('clavicle.R'))


def campos(vp, esq, W):
    """vp: cuerpo a1 posado (todos los vértices). Devuelve dict prenda → (campo, holgura)."""
    B = vp[:NB]; x, y, z = B[:, 0], B[:, 1], B[:, 2]
    pa = partes(esq, W)
    J = lambda h: esq.cabeza(vp, h)
    GR = 9.0
    out = {}

    def manga(lado, frac_brazo=None, frac_ante=None):
        """Distancia al final de la manga a lo largo del brazo (positiva = cubierto)."""
        S, E, M = J(f'upperarm01.{lado}'), J(f'lowerarm01.{lado}'), J(f'wrist.{lado}')
        arm = pa['brazo' + lado]
        if frac_ante is None:
            u = (E - S); L = np.linalg.norm(u); u = u / L
            f = frac_brazo * L - (B - S) @ u
        else:
            u = (M - E); L = np.linalg.norm(u); u = u / L
            f = frac_ante * L - (B - E) @ u
        return np.where(arm > 0.5, f, GR)

    def sin_brazo(lado):
        return np.where(pa['brazo' + lado] > 0.5, -GR, GR)

    def cuello(y_f, z_f, pend, k, ancho_min=0.0):
        """Escote: un cuenco que sube con |x|; cubierto lo que queda por debajo."""
        yc = y_f + (z_f - z) * pend + k * np.maximum(np.abs(x) - ancho_min, 0) ** 2
        return np.where(pa['cabeza'] > 0.85, -GR, yc - y)

    def sisa(x_tir, y_alto, x_axila, y_axila, comba):
        """Sisa de tirantes: límite lateral que baja del tirante a la axila."""
        t = np.clip((y_alto - y) / (y_alto - y_axila), 0, 1)
        xl = x_tir + (x_axila - x_tir) * t - comba * np.sin(np.pi * t)
        f = xl - np.abs(x)
        f = np.where(y < y_axila, GR, f)                       # por debajo de la axila, cubierto
        return f

    cad = J('upperleg01.L'); rod = J('lowerleg01.L'); tob = J('foot.L')
    hom = J('upperarm01.L'); nk = J('neck01')
    y_bajo = cad[1] - 0.55                 # bajo de la camiseta
    y_cint = cad[1] + 0.50                 # cintura del pantalón
    sin_brazos = np.minimum(sin_brazo('L'), sin_brazo('R'))

    # --- parte de arriba
    f_bajo = y - y_bajo
    cam = np.minimum.reduce([cuello(nk[1] - 0.72, 0.80, 0.50, 1.5), f_bajo, manga('L', 0.50), manga('R', 0.50)])
    hol = np.clip((hom[1] - 0.6 - y) / 3.0, 0, 1) * 0.6 + np.clip(1 - np.abs(np.minimum(manga('L', 0.50), manga('R', 0.50))) / 0.9, 0, 1) * 0.8
    out['camiseta'] = (cam, np.clip(hol, 0, 1))
    ml = np.minimum.reduce([cuello(nk[1] - 0.72, 0.80, 0.50, 1.5), f_bajo, manga('L', None, 0.93), manga('R', None, 0.93)])
    out['manga_larga'] = (ml, np.clip((hom[1] - 0.6 - y) / 3.0, 0, 1) * 0.5)
    s = sisa(hom[0] - 0.95, hom[1] + 0.95, hom[0] - 0.42, hom[1] - 1.25, 0.16)
    tir = np.minimum.reduce([cuello(nk[1] - 1.25, 0.9, 0.62, 0.9), f_bajo, s, sin_brazos])
    out['tirantes'] = (tir, np.clip((hom[1] - 1.6 - y) / 3.0, 0, 1) * 0.5)
    s2 = sisa(hom[0] - 1.02, hom[1] + 0.95, hom[0] - 0.50, hom[1] - 1.30, 0.20)
    top = np.minimum.reduce([cuello(nk[1] - 1.30, 0.9, 0.55, 0.9), y - (hom[1] - 2.45), s2, sin_brazos])
    out['top'] = (top, np.zeros(NB))

    # --- parte de abajo
    def abajo(y_corte, holg_borde, holg_pierna=0.0):
        f = np.minimum.reduce([y_cint - y, y - y_corte, sin_brazos])
        h = np.clip(1 - (y - y_corte) / 2.2, 0, 1) * holg_borde            # vuelo en el bajo
        h = np.maximum(h, np.clip((y_cint - 0.5 - y) / 1.5, 0, 1) * holg_pierna)   # holgura en toda la pierna
        return f, h
    out['corto'] = abajo(rod[1] + 1.35, 1.0, 0.45)
    out['mallas_cortas'] = abajo(rod[1] + 0.75, 0.0)
    out['mallas'] = abajo(tob[1] + 0.45, 0.0)
    out['largo'] = abajo(tob[1] + 0.20, 0.6, 0.6)
    out['_partes'] = pa
    return out


def codifica(f):
    return np.clip(np.round(np.clip(f, -TOPE, TOPE) / TOPE * 127 + 128), 1, 255).astype(np.uint8)
