"""El mapa de músculos sobre la superficie del cuerpo: 35 músculos en 12 grupos.

Cada músculo es una región definida con anatomía de superficie sobre el cuerpo a1 ya posado,
en tres «cartas»: el tronco (ángulo alrededor del cuerpo y altura), y cada segmento de brazo y
de pierna (posición a lo largo del hueso y ángulo alrededor). Se hornea en el espacio UV de la
malla (una textura de identificadores y otra de distancia al borde): al ser la misma topología,
el mapa vale para las dos siluetas y las tres complexiones. Dibujo propio; no se calca ningún
atlas ni modelo anatómico."""
import numpy as np
import cv2

# id (1..35) en el orden de TG_FIGURA.MUSCULOS (por grupos)
MUSCULOS = [
    ('pectoral_sup', 'pecho'), ('pectoral', 'pecho'),
    ('dorsal_ancho', 'dorsal'), ('redondo_mayor', 'dorsal'),
    ('trapecio_sup', 'espalda_alta'), ('serrato', 'espalda_alta'), ('romboides', 'espalda_alta'),
    ('trapecio_inf', 'espalda_alta'), ('trapecio_medio', 'espalda_alta'),
    ('deltoides_ant', 'hombros'), ('deltoides_lat', 'hombros'), ('manguito', 'hombros'), ('deltoides_post', 'hombros'),
    ('biceps', 'biceps'), ('braquial', 'biceps'),
    ('triceps', 'triceps'),
    ('braquiorradial', 'antebrazo'), ('flexores', 'antebrazo'), ('extensores', 'antebrazo'),
    ('oblicuos', 'core'), ('recto_abdominal', 'core'), ('erectores', 'core'),
    ('gluteo_medio', 'gluteos'), ('aductores', 'gluteos'), ('gluteo_mayor', 'gluteos'),
    ('vasto_lateral', 'cuadriceps'), ('recto_femoral', 'cuadriceps'), ('vasto_medial', 'cuadriceps'), ('sartorio', 'cuadriceps'),
    ('semitendinoso', 'isquios'), ('biceps_femoral', 'isquios'),
    ('tibial_anterior', 'pantorrilla'), ('peroneos', 'pantorrilla'), ('gastrocnemio', 'pantorrilla'), ('soleo', 'pantorrilla'),
]
ID = {n: i + 1 for i, (n, g) in enumerate(MUSCULOS)}
# profundidad del centro del tronco a cada altura (cuerpo a1 posado)
ZM_Y = [8.2, 9.0, 9.8, 10.6, 11.4, 12.2, 13.0, 13.8, 14.2, 14.6, 14.9, 15.4, 15.85]
ZM_Z = [0.28, 0.13, 0.24, 0.40, 0.35, 0.29, 0.27, 0.10, 0.06, -0.07, 0.12, 0.30, 0.48]
GRUPOS = ['pecho', 'dorsal', 'espalda_alta', 'hombros', 'biceps', 'triceps', 'antebrazo', 'core', 'gluteos',
          'cuadriceps', 'isquios', 'pantorrilla']


def rasteriza(uv, tri, S):
    """Índice de triángulo y coordenadas baricéntricas de cada texel."""
    idx = np.full((S, S), -1, np.int32)
    px = uv * S
    for i, t in enumerate(tri):
        cv2.fillConvexPoly(idx, np.round(px[t] - 0.5).astype(np.int32), int(i))
    ys, xs = np.nonzero(idx >= 0)
    t = tri[idx[ys, xs]]
    a, b, c = px[t[:, 0]], px[t[:, 1]], px[t[:, 2]]
    p = np.stack([xs + 0.5, ys + 0.5], 1)
    v0, v1, v2 = b - a, c - a, p - a
    den = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
    den[np.abs(den) < 1e-12] = 1e-12
    w1 = (v2[:, 0] * v1[:, 1] - v1[:, 0] * v2[:, 1]) / den
    w2 = (v0[:, 0] * v2[:, 1] - v2[:, 0] * v0[:, 1]) / den
    w = np.stack([1 - w1 - w2, w1, w2], 1)
    w = np.clip(w, 0, 1); w /= w.sum(1, keepdims=True)
    return idx, ys, xs, t, w


def cil(P, A, B):
    """Carta de un segmento (lado izquierdo): t a lo largo de A→B (0..1), ángulo alrededor
    (0 delante, +90 fuera, ±180 detrás, −90 dentro) y radio."""
    u = B - A; L = np.linalg.norm(u); u = u / L
    d = P - A
    t = (d @ u) / L
    r = d - np.outer(d @ u, u)
    ant = np.array([0, 0, 1.0]); ant = ant - (ant @ u) * u; ant /= np.linalg.norm(ant)
    lat = np.cross(ant, u)
    phi = np.degrees(np.arctan2(r @ lat, r @ ant))
    return t, phi, np.linalg.norm(r, axis=1)


# ---------------------------------------------------------------------------------------------
# Los contornos. Cada músculo es un polígono (o varios) en la carta de su parte del cuerpo:
#   tronco    → (ángulo alrededor del cuerpo: 0 = esternón, 90 = costado, 180 = columna; altura en dm)
#   brazo     → (ángulo alrededor del húmero: 0 delante, 90 fuera, 180 detrás, −90 dentro; t: 0 hombro … 1 codo)
#   antebrazo → (ídem alrededor del antebrazo, con el pulgar delante; t: 0 codo … 1 muñeca)
#   muslo     → (ídem; t: 0 cadera … 1 rodilla)        pierna → (ídem; t: 0 rodilla … 1 tobillo)
# Las esquinas se redondean (Chaikin). El orden es la prioridad: el primero que contiene un punto se lo queda.
POLIS = [
    # ----- hombro (en la carta del brazo; el anillo del tronco lo limita por dentro)
    ('deltoides_ant', 'brazo', [(-32, -0.48), (22, -0.48), (40, 0.0), (58, 0.30), (72, 0.455), (60, 0.44), (30, 0.35), (0, 0.23), (-30, 0.09)]),
    ('deltoides_lat', 'brazo', [(24, -0.48), (123, -0.48), (110, 0.0), (96, 0.30), (87, 0.455), (80, 0.478), (74, 0.455), (60, 0.30), (42, 0.0)]),
    ('deltoides_post', 'brazo', [(125, -0.48), (215, -0.48), (205, 0.02), (190, 0.12), (160, 0.24), (130, 0.35), (100, 0.44), (89, 0.455), (98, 0.30), (112, 0.0)]),
    # ----- antebrazo y brazo
    ('braquiorradial', 'antebrazo', [(60, -0.20), (40, -0.14), (22, -0.02), (5, 0.12), (-6, 0.30), (-4, 0.48), (4, 0.60), (12, 0.62), (24, 0.50), (38, 0.32), (52, 0.14), (66, 0.0), (72, -0.12)]),
    ('biceps', 'brazo', [(-30, 0.11), (0, 0.25), (30, 0.37), (41, 0.43), (43, 0.62), (36, 0.80), (18, 0.92), (0, 0.955), (-20, 0.92), (-48, 0.80), (-62, 0.60), (-64, 0.35), (-50, 0.17)]),
    ('braquial', 'brazo', [(47, 0.48), (62, 0.505), (80, 0.505), (88, 0.62), (86, 0.80), (74, 0.95), (58, 0.99), (44, 0.93), (46, 0.75), (49, 0.60)]),
    ('triceps', 'brazo', [(92, 0.48), (100, 0.46), (130, 0.37), (160, 0.26), (190, 0.14), (205, 0.04), (230, 0.05), (262, 0.14), (294, 0.34), (296, 0.62), (285, 0.82), (250, 0.93), (200, 0.96), (150, 0.95), (110, 0.90), (92, 0.80), (91, 0.62)]),
    ('extensores', 'antebrazo', [(68, -0.03), (100, -0.02), (140, 0.01), (170, 0.05), (177, 0.15), (177, 0.56), (165, 0.72), (125, 0.76), (85, 0.74), (52, 0.70), (30, 0.62), (26, 0.52), (40, 0.33), (54, 0.15)]),
    ('flexores', 'antebrazo', [(-12, 0.14), (-8, 0.30), (-6, 0.50), (-10, 0.62), (-30, 0.72), (-80, 0.76), (-130, 0.75), (-165, 0.70), (-177, 0.55), (-177, 0.15), (-170, 0.04), (-140, -0.01), (-100, -0.03), (-60, -0.02), (-30, 0.02)]),
    # ----- cadera
    ('gluteo_mayor', 'tronco', [(172, 9.95), (158, 10.02), (140, 9.75), (122, 9.35), (112, 9.0), (112, 8.55), (125, 8.38), (150, 8.33), (168, 8.36), (174, 8.6)]),
    ('gluteo_medio', 'tronco', [(158, 10.05), (140, 10.25), (122, 10.27), (100, 10.2), (84, 10.14), (70, 10.02), (66, 9.75), (70, 9.3), (80, 9.0), (100, 8.98), (112, 9.0), (122, 9.35), (140, 9.75)]),
    # ----- muslo
    ('sartorio', 'muslo', [(62, -0.14), (47, 0.02), (29, 0.18), (11, 0.34), (-11, 0.50), (-35, 0.66), (-57, 0.82), (-76, 0.97), (-90, 0.97), (-71, 0.82), (-49, 0.66), (-25, 0.50), (-3, 0.34), (15, 0.18), (33, 0.02), (48, -0.14)]),
    ('recto_femoral', 'muslo', [(36, 0.08), (44, 0.20), (34, 0.40), (31, 0.60), (26, 0.76), (14, 0.86), (4, 0.87), (-8, 0.78), (-12, 0.62), (-10, 0.50), (4, 0.40), (20, 0.24), (30, 0.12)]),
    ('vasto_lateral', 'muslo', [(46, 0.20), (60, 0.12), (84, 0.14), (100, 0.22), (104, 0.50), (100, 0.72), (88, 0.88), (66, 0.95), (44, 0.93), (30, 0.84), (29, 0.76), (34, 0.60), (37, 0.40)]),
    ('vasto_medial', 'muslo', [(-13, 0.52), (-14, 0.64), (-10, 0.78), (0, 0.87), (-8, 0.935), (-30, 0.955), (-50, 0.91), (-58, 0.84), (-36, 0.68), (-20, 0.55)]),
    ('aductores', 'muslo', [(-8, 0.36), (-27, 0.50), (-50, 0.665), (-80, 0.70), (-120, 0.62), (-148, 0.45), (-150, 0.25), (-120, 0.21), (-80, 0.19), (-50, 0.18), (-28, 0.21), (-10, 0.29)]),
    ('biceps_femoral', 'muslo', [(106, 0.24), (140, 0.17), (177, 0.17), (178, 0.50), (176, 0.80), (160, 0.95), (128, 0.97), (108, 0.90), (106, 0.60)]),
    ('semitendinoso', 'muslo', [(183, 0.17), (210, 0.17), (212, 0.45), (215, 0.66), (245, 0.72), (262, 0.90), (240, 0.97), (200, 0.97), (184, 0.85), (182, 0.5)]),
    # ----- pierna
    ('tibial_anterior', 'pierna', [(8, 0.08), (30, 0.06), (46, 0.12), (50, 0.30), (46, 0.50), (36, 0.66), (24, 0.74), (12, 0.66), (8, 0.40)]),
    ('peroneos', 'pierna', [(52, 0.10), (80, 0.08), (104, 0.14), (106, 0.40), (100, 0.62), (90, 0.80), (74, 0.88), (60, 0.80), (52, 0.56), (54, 0.30)]),
    ('gastrocnemio', 'pierna', [(108, 0.03), (140, -0.02), (176, 0.0), (178, 0.30), (170, 0.46), (150, 0.50), (128, 0.46), (110, 0.36)]),
    ('gastrocnemio', 'pierna', [(182, 0.0), (220, -0.02), (262, 0.04), (268, 0.36), (252, 0.50), (228, 0.56), (196, 0.52), (183, 0.34)]),
    ('soleo', 'pierna', [(108, 0.40), (128, 0.50), (150, 0.54), (180, 0.50), (196, 0.56), (228, 0.60), (254, 0.54), (270, 0.40), (292, 0.40), (296, 0.62), (280, 0.78), (240, 0.84), (200, 0.86), (160, 0.84), (120, 0.80), (104, 0.66)]),
    # ----- tronco, frente
    ('pectoral_sup', 'tronco', [(4, 13.95), (20, 13.82), (40, 13.62), (58, 13.48), (66, 13.40), (66, 13.72), (58, 14.02), (45, 14.12), (25, 14.08), (6, 14.05)]),
    ('pectoral', 'tronco', [(4, 13.93), (20, 13.80), (40, 13.60), (58, 13.46), (67, 13.38), (69, 13.05), (63, 12.80), (54, 12.52), (42, 12.33), (28, 12.30), (14, 12.36), (4, 12.45)]),
    ('recto_abdominal', 'tronco', [(2.5, 12.38), (20, 12.30), (33, 12.25), (35, 11.6), (36, 11.0), (36, 10.5), (34, 10.0), (28, 9.5), (20, 9.1), (9, 8.97), (2.5, 8.97)]),
    ('serrato', 'tronco', [(64, 12.82), (70, 12.95), (98, 12.72), (95, 12.2), (97, 11.55), (88, 11.42), (74, 11.35), (62, 11.30), (60, 11.50), (66, 11.62), (58, 11.78), (64, 11.92), (55, 12.05), (62, 12.20), (53, 12.32), (60, 12.45), (55, 12.56)]),
    ('oblicuos', 'tronco', [(36, 12.22), (53, 12.30), (55, 12.05), (64, 11.92), (58, 11.78), (66, 11.62), (60, 11.50), (62, 11.30), (74, 11.33), (88, 11.40), (97, 11.50), (100, 11.2), (109, 10.75), (122, 10.28), (105, 10.2), (90, 10.2), (72, 10.08), (60, 9.95), (45, 9.6), (30, 9.25), (22, 9.08), (30, 9.55), (36, 10.0), (38, 10.5), (38, 11.0), (37, 11.6)]),
    # ----- tronco, espalda
    ('trapecio_sup', 'tronco', [(30, 14.12), (45, 14.16), (58, 14.09), (70, 14.36), (90, 14.45), (113, 14.32), (128, 14.14), (150, 14.08), (178, 14.04), (178, 15.7), (150, 15.7), (128, 15.3), (105, 14.95), (60, 14.75), (38, 14.5)]),
    ('trapecio_medio', 'tronco', [(178, 14.02), (150, 14.06), (128, 14.12), (113, 14.30), (118, 13.95), (135, 13.50), (160, 13.42), (178, 13.40)]),
    ('trapecio_inf', 'tronco', [(178, 13.38), (160, 13.40), (137, 13.48), (150, 12.75), (165, 12.0), (178, 11.45)]),
    ('romboides', 'tronco', [(137, 13.44), (150, 12.76), (144, 12.55), (132, 12.9), (131, 13.3)]),
    ('manguito', 'tronco', [(134, 13.42), (122, 13.78), (115, 13.4), (109, 13.05), (118, 12.85), (128, 12.62), (132, 12.92)]),
    ('redondo_mayor', 'tronco', [(128, 12.60), (118, 12.83), (109, 13.03), (108, 12.82), (116, 12.55), (126, 12.38)]),
    ('dorsal_ancho', 'tronco', [(126, 12.36), (116, 12.53), (108, 12.80), (100, 12.75), (96, 12.2), (99, 11.5), (108, 10.8), (122, 10.3), (140, 10.35), (158, 11.0), (170, 11.6), (176, 11.9), (165, 12.0), (150, 12.73), (144, 12.53), (132, 12.45)]),
    ('erectores', 'tronco', [(176, 11.85), (170, 11.55), (160, 11.0), (159, 10.4), (160, 9.9), (168, 9.55), (177, 9.5)]),
]
# el deltoides sobre el tronco: solo dentro de este anillo alrededor del arranque del brazo
ANILLO_DELTOIDES = [(57, 14.05), (66, 13.38), (70, 13.0), (108, 13.0), (116, 13.45), (124, 13.9), (112, 14.33), (90, 14.42), (70, 14.33)]
# surcos dentro de un músculo (la misma zona, pero con relieve): segmentos en su carta
SURCOS = {
    'recto_abdominal': [((0, 11.78), (45, 11.70)), ((0, 11.20), (45, 11.12)), ((0, 10.62), (45, 10.55))],
    'serrato': [((60, 12.45), (100, 12.58)), ((62, 12.20), (100, 12.22)), ((64, 11.92), (100, 11.86)), ((66, 11.62), (100, 11.52))],
    'triceps': [((118, 0.30), (150, 0.80))],
    'deltoides_lat': [],
}


def chaikin(pts, pasadas=2):
    p = np.asarray(pts, float)
    for _ in range(pasadas):
        q = np.roll(p, -1, axis=0)
        p = np.stack([0.75 * p + 0.25 * q, 0.25 * p + 0.75 * q], 1).reshape(-1, 2)
    return p


def dentro(pts, a, b):
    from matplotlib.path import Path
    return Path(chaikin(pts)).contains_points(np.stack([a, b], 1))


def polis_carta(carta):
    col = {}
    out = []
    for i, (nom, c, pts) in enumerate(POLIS):
        if c == carta:
            h = (ID[nom] * 47) % 180
            out.append((nom, chaikin(pts), tuple(int(x) for x in cv2.cvtColor(np.uint8([[[h, 200, 255]]]), cv2.COLOR_HSV2BGR)[0, 0])))
    return out


def regiones(P, pa, hit):
    """P: posiciones (n×3) en el cuerpo a1 posado; pa: pesos de parte por punto (brazo y pierna
    del mismo lado, cabeza); hit: hitos. Devuelve (id de músculo, subzona) de cada punto."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    X = np.abs(x)
    Pm = P.copy(); Pm[:, 0] = X                              # todo al lado izquierdo
    zm = np.interp(y, ZM_Y, ZM_Z)
    th = np.degrees(np.arctan2(X, z - zm))                   # 0 frente … 180 espalda
    brazo = pa['brazo'] > 0.5; pierna = pa['pierna'] > 0.5
    C = {'tronco': (th, y)}
    C['brazo'] = cil(Pm, hit['hom'], hit['cod'])[:2][::-1]
    C['antebrazo'] = cil(Pm, hit['cod'], hit['mun'])[:2][::-1]
    C['muslo'] = cil(Pm, hit['cad'], hit['rod'])[:2][::-1]
    C['pierna'] = cil(Pm, hit['rod'], hit['tob'])[:2][::-1]
    tA = C['antebrazo'][1]; tP = C['pierna'][1]; tB = C['brazo'][1]; fB = C['brazo'][0]
    anillo = dentro(ANILLO_DELTOIDES, th, y)
    vale = {
        'tronco': ~brazo & ((y > 8.3) | ~pierna),
        'brazo': brazo & (tA < 0.02) & ~(pa['mano'] > 0.5),
        'antebrazo': brazo & ~(pa['mano'] > 0.5),
        'muslo': (pierna | (y < 9.3)) & ~brazo & (tP < 0.0) & (y < 10.0),
        'pierna': pierna & (tP >= -0.04) & ~(pa['pie'] > 0.5),
    }
    n = len(P)
    ident = np.zeros(n, np.uint8); sub = np.zeros(n, np.uint8)
    for nom, carta, pts in POLIS:
        a, b = C[carta]
        m = vale[carta]
        if nom.startswith('deltoides'):
            # sobre el brazo, el polígono; sobre el tronco, el anillo repartido por el ángulo del brazo
            lim = {'deltoides_ant': (-60, 28), 'deltoides_lat': (28, 118), 'deltoides_post': (118, 240)}[nom]
            fB2 = np.where(fB < -60, fB + 360, fB)
            en = (vale['brazo'] & (dentro(pts, a, b) | dentro(pts, a + 360, b))) | (~brazo & anillo & (fB2 >= lim[0]) & (fB2 < lim[1]))
        else:
            en = m & (dentro(pts, a, b) | (dentro(pts, a + 360, b) if carta != 'tronco' else False))
        libre = (ident == 0) & en
        ident[libre] = ID[nom]
    for nom, segs in SURCOS.items():
        carta = [c for (n2, c, _) in POLIS if n2 == nom][0]
        a, b = C[carta]
        m = ident == ID[nom]
        for k, ((a0, b0), (a1, b1)) in enumerate(segs):
            lado = (a1 - a0) * (b - b0) - (b1 - b0) * (a - a0) > 0
            sub[m & lado] += 1 << k
    return ident, sub


def hornea(vp, mapa, uv, tri, pa_v, hit, S=1024):
    """Devuelve (ids S×S uint8, distancia S×S uint8, escala dm/texel media)."""
    idx, ys, xs, t, w = rasteriza(uv, tri, S)
    Pv = vp[mapa]
    P = Pv[t[:, 0]] * w[:, 0:1] + Pv[t[:, 1]] * w[:, 1:2] + Pv[t[:, 2]] * w[:, 2:3]
    lado_izq = P[:, 0] > 0
    def interp(a):
        av = a[mapa]
        return av[t[:, 0]] * w[:, 0] + av[t[:, 1]] * w[:, 1] + av[t[:, 2]] * w[:, 2]
    pa = dict(brazo=np.where(lado_izq, interp(pa_v['brazoL']), interp(pa_v['brazoR'])),
              pierna=np.where(lado_izq, interp(pa_v['piernaL']), interp(pa_v['piernaR'])),
              cabeza=interp(pa_v['cabeza']),
              mano=np.where(lado_izq, interp(pa_v['manoL']), interp(pa_v['manoR'])),
              pie=np.where(lado_izq, interp(pa_v['pieL']), interp(pa_v['pieR'])))
    ident, sub = regiones(P, pa, hit)
    img = np.zeros((S, S), np.uint8); img[ys, xs] = ident
    clave = np.zeros((S, S), np.int32); clave[ys, xs] = ident.astype(np.int32) * 256 + sub
    valido = idx >= 0
    # bordes: texeles vecinos válidos con distinto id
    borde = np.zeros((S, S), bool)
    for dy, dx in ((0, 1), (1, 0)):
        a = clave[:S - dy, :S - dx]; b = clave[dy:, dx:]
        va = valido[:S - dy, :S - dx] & valido[dy:, dx:]
        dif = va & (a != b)
        borde[:S - dy, :S - dx] |= dif; borde[dy:, dx:] |= dif
    d_tex = cv2.distanceTransform((~borde).astype(np.uint8), cv2.DIST_L2, 5)
    # escala local (dm por texel) de cada triángulo
    A3 = np.linalg.norm(np.cross(Pv[tri[:, 1]] - Pv[tri[:, 0]], Pv[tri[:, 2]] - Pv[tri[:, 0]]), axis=1) / 2
    u = uv * S
    A2 = np.abs((u[tri[:, 1], 0] - u[tri[:, 0], 0]) * (u[tri[:, 2], 1] - u[tri[:, 0], 1]) - (u[tri[:, 2], 0] - u[tri[:, 0], 0]) * (u[tri[:, 1], 1] - u[tri[:, 0], 1])) / 2
    esc_t = np.sqrt(A3 / np.maximum(A2, 1e-9))
    esc = np.zeros((S, S), np.float32); esc[ys, xs] = esc_t[idx[ys, xs]]
    esc = cv2.GaussianBlur(esc, (0, 0), 3) / np.maximum(cv2.GaussianBlur(valido.astype(np.float32), (0, 0), 3), 1e-3)
    d_dm = d_tex * esc
    dist = np.clip(d_dm / 0.16, 0, 1)
    # relleno fuera de las islas: el valor del texel válido más cercano
    _, etiquetas = cv2.distanceTransformWithLabels((~valido).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    yy, xx = np.nonzero(valido)
    # las etiquetas numeran los píxeles a cero (válidos) en orden de recorrido
    orden = np.zeros(etiquetas.max() + 1, np.int64)
    orden[etiquetas[yy, xx]] = np.arange(len(yy))
    cerca = orden[etiquetas]
    img_r = img[yy[cerca], xx[cerca]]
    dist_r = dist[yy[cerca], xx[cerca]]
    return img_r, (dist_r * 255).round().astype(np.uint8), float(esc_t.mean()), ident
