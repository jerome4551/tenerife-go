"""Variantes del cuerpo (silueta × complexión) y postura natural."""
import numpy as np
import mh

# silueta a = «Hombros más anchos», b = «Caderas más anchas»; complexión 0 delgada, 1 media, 2 ancha
VARIANTES = {
    'a0': dict(gender=1.0, age=0.5, muscle=0.55, weight=0.28, prop=0.75),
    'a1': dict(gender=1.0, age=0.5, muscle=0.66, weight=0.50, prop=0.80),
    'a2': dict(gender=1.0, age=0.5, muscle=0.66, weight=0.86, prop=0.70),
    'b0': dict(gender=0.0, age=0.5, muscle=0.52, weight=0.30, prop=0.75, cup=0.38, firm=0.75),
    'b1': dict(gender=0.0, age=0.5, muscle=0.60, weight=0.50, prop=0.80, cup=0.45, firm=0.75),
    'b2': dict(gender=0.0, age=0.5, muscle=0.58, weight=0.86, prop=0.70, cup=0.55, firm=0.70),
}
ORDEN = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2']


def _ang_vertical(d):
    """Ángulo (grados) de un vector respecto a la vertical hacia abajo, en el plano XY."""
    return np.degrees(np.arctan2(abs(d[0]), -d[1]))


def giros_postura(v, esq, brazo=13.0, codo=16.0, pierna_x=1.18):
    """Lista de giros para la postura de pie natural: brazos bajados, piernas bajo la cadera."""
    g = []
    for lado, s in (('L', 1.0), ('R', -1.0)):
        hombro = esq.cabeza(v, f'upperarm01.{lado}')
        codo_p = esq.cabeza(v, f'lowerarm01.{lado}')
        muneca = esq.cabeza(v, f'wrist.{lado}')
        u = codo_p - hombro
        a0 = _ang_vertical(u)
        baja = a0 - brazo                      # grados que hay que bajar
        z = np.array([0, 0, 1.0])
        g.append((f'clavicle.{lado}', z, -s * baja * 0.10))
        g.append((f'shoulder01.{lado}', z, -s * baja * 0.25))
        g.append((f'upperarm01.{lado}', z, -s * baja * 0.65))
        # el codo: dejar una flexión pequeña
        f = muneca - codo_p
        un = u / np.linalg.norm(u); fn = f / np.linalg.norm(f)
        flex = np.degrees(np.arccos(np.clip(un @ fn, -1, 1)))
        eje = np.cross(un, fn); eje /= np.linalg.norm(eje)
        g.append((f'lowerarm01.{lado}', eje, -(flex - codo)))
        # piernas: llevar el tobillo bajo la cadera
        cad = esq.cabeza(v, f'upperleg01.{lado}')
        tob = esq.cabeza(v, f'foot.{lado}')
        d = tob - cad
        a_ahora = np.degrees(np.arctan2(abs(d[0]), -d[1]))
        dx_obj = pierna_x - abs(cad[0])
        a_obj = np.degrees(np.arctan2(dx_obj, -d[1]))
        dp = a_ahora - a_obj
        g.append((f'upperleg01.{lado}', z, -s * dp))
        g.append((f'foot.{lado}', z, s * dp))
    return g


def torsion_antebrazo(v, esq, grados):
    """Giro del antebrazo sobre su eje para que la palma mire al muslo."""
    g = []
    for lado, s in (('L', 1.0), ('R', -1.0)):
        a = esq.cabeza(v, f'lowerarm01.{lado}'); b = esq.cabeza(v, f'wrist.{lado}')
        eje = (b - a) / np.linalg.norm(b - a)
        g.append((f'lowerarm01.{lado}', eje, s * grados * 0.35))
        g.append((f'lowerarm02.{lado}', eje, s * grados * 0.35))
        g.append((f'wrist.{lado}', eje, s * grados * 0.30))
    return g


def construye(base, esq, clave, W=None, torsion=0.0, **kw):
    """Devuelve (v_reposo, v_posado, R, T) de una variante."""
    v, faltan = mh.cuerpo(base, **VARIANTES[clave])
    assert not faltan, faltan[:4]
    giros = giros_postura(v, esq, **kw)
    if torsion:
        # la torsión se calcula sobre el brazo ya bajado: se añade al final con el eje girado por posar()
        giros += torsion_antebrazo(v, esq, torsion)
    vp, R, T = mh.posar(v, esq, giros, W)
    # los pies al suelo y el cuerpo centrado
    cuerpo_idx = np.arange(13380)
    suelo = vp[cuerpo_idx, 1].min()
    cx = (vp[cuerpo_idx, 0].min() + vp[cuerpo_idx, 0].max()) / 2
    vp = vp - np.array([cx, suelo, 0])
    T = T - np.array([cx, suelo, 0])
    return v, vp, R, T
