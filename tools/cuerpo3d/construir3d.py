"""Construye los datos del cuerpo 3D para el navegador (datos3d.js)."""
import base64
import io
import json
import os
import sys
import numpy as np
from PIL import Image
import mh
import cuerpo as C
import piezas as P
import ropa as RP
import musculos as MU
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
MJS = P.MJS
SALIDA = os.path.join(AQUI, 'datos3d.js')

PELOS = {           # peinado de la app → pieza oficial de MakeHuman
    'corto': 'short02', 'medio': 'bob02', 'largo': 'long01', 'afro': 'afro01',
    'coleta': 'ponytail01', 'trenzas': 'Braid01',
}
CEJAS = 'eyebrow010'
PESTANAS = 'eyelashes02'
CALZADO = {'zapatillas': 'shoes05'}


def b64(a):
    return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()


def cuantiza(lista):
    """Varias mallas de posiciones (n×3) → uint16 con la misma caja."""
    todo = np.concatenate(lista)
    o = todo.min(0); r = todo.max(0) - o
    s = float(r.max() / 65535.0)
    return [np.round((p - o) / s).astype(np.uint16) for p in lista], [s] + [float(x) for x in o]


def imagen(ruta_o_img, calidad=86, alfa=False, lado=None, fmt='WEBP'):
    im = Image.open(ruta_o_img) if isinstance(ruta_o_img, str) else ruta_o_img
    if im.mode != 'L':
        im = im.convert('RGBA' if alfa else 'RGB')
    if lado and im.size[0] != lado:
        im = im.resize((lado, lado), Image.LANCZOS)
    buf = io.BytesIO()
    if fmt == 'WEBP':
        im.save(buf, 'WEBP', quality=calidad, method=6)
        return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), len(buf.getvalue())
    im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), len(buf.getvalue())


def tex_pelo(ruta, uv, tri):
    """Textura de pelo empaquetada: R = detalle de claridad, G/B = dirección del mechón (ángulo doble), A = alfa."""
    im = np.asarray(Image.open(ruta).convert('RGBA'), np.float32) / 255.0
    H, Wd = im.shape[:2]
    lum = cv2.cvtColor((im[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    alfa = im[..., 3].copy()
    # fuera de la zona que usa la malla, transparente (quita la marca de agua de las esquinas)
    cob = np.zeros((H, Wd), np.uint8)
    pts = (uv[tri] * [Wd, H]).astype(np.int32)
    cv2.fillPoly(cob, list(pts), 255)
    cob = cv2.dilate(cob, np.ones((5, 5), np.uint8))
    alfa[cob == 0] = 0
    s = cv2.GaussianBlur(lum, (0, 0), 1.0)
    gx = cv2.Sobel(s, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(s, cv2.CV_32F, 0, 1, ksize=3)
    Jxx = cv2.GaussianBlur(gx * gx, (0, 0), 7); Jyy = cv2.GaussianBlur(gy * gy, (0, 0), 7); Jxy = cv2.GaussianBlur(gx * gy, (0, 0), 7)
    ang = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy) + np.pi / 2
    # coherencia: 1 donde los mechones van todos en una dirección, 0 donde no hay dirección clara
    coh = np.sqrt((Jxx - Jyy) ** 2 + 4 * Jxy ** 2) / (Jxx + Jyy + 1e-6)
    coh = np.clip(coh * 1.6, 0, 1)
    c2 = np.cos(2 * ang) * coh * 0.5 + 0.5; s2 = np.sin(2 * ang) * coh * 0.5 + 0.5
    m = alfa > 0.5
    media = float(lum[m].mean()) if m.any() else 0.2
    # el detalle es la claridad de cada hebra respecto a la de su zona: las luces y los degradados que la
    # textura trae pintados (un brillo arriba, las puntas oscuras) se quitan casi del todo, porque la luz
    # la pone el motor; si se dejan, las capas del pelo salen a manchas en los tonos oscuros
    mk = m.astype(np.float32)
    zona = cv2.GaussianBlur(lum * mk, (0, 0), ZONA_PELO) / (cv2.GaussianBlur(mk, (0, 0), ZONA_PELO) + 1e-4)
    zona = np.where(cv2.GaussianBlur(mk, (0, 0), ZONA_PELO) > 0.02, zona, media)
    ref = np.maximum(zona, 0.02) ** 0.82 * max(media, 0.02) ** 0.18
    det = np.clip(lum / ref * 0.5, 0, 1)
    det = np.where(alfa > 0.02, det, 0.5)
    out = np.stack([det, c2, s2, alfa], -1)
    return Image.fromarray((out * 255).round().astype(np.uint8), 'RGBA')


def tex_ojo(ruta):
    """El iris de MakeHuman es rojizo: se lleva a un castaño natural."""
    im = np.asarray(Image.open(ruta).convert('RGBA')).copy()
    hsv = cv2.cvtColor(im[..., :3], cv2.COLOR_RGB2HSV).astype(np.float32)
    iris = (hsv[..., 1] > 90)
    hsv[..., 0] = np.where(iris, 13, hsv[..., 0])            # tono (0-179): castaño
    hsv[..., 1] = np.where(iris, hsv[..., 1] * 0.72, hsv[..., 1] * 0.55)
    hsv[..., 2] = np.where(iris, hsv[..., 2] * 0.62, np.minimum(hsv[..., 2] * 1.04, 255))
    im[..., :3] = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2RGB)
    return Image.fromarray(im, 'RGBA')


def relaja(B, idx, vecinos, pasos=300):
    """Relleno de membrana: los vértices de `idx` pasan a la media de sus vecinos (el borde queda fijo)."""
    B = B.copy()
    vs = [np.array(sorted(vecinos[i])) for i in idx]
    for _ in range(pasos):
        nuevo = np.array([B[v].mean(0) for v in vs])
        B[idx] = nuevo
    return B


# Gestos de la cara: suma de «unidades de expresión» de MakeHuman (peso por unidad).
GESTOS = {
    'parp': [('eye-left-closure', 1.0), ('eye-right-closure', 1.0)],
    'sonr': [('mouth-corner-puller', 1.0), ('eye-left-slit', 0.30), ('eye-right-slit', 0.30)],
}


def delta_gesto(base, lista):
    """Desplazamiento en reposo (19158×3) de un gesto: la misma mezcla de tercios que el cuerpo."""
    d = np.zeros_like(base.v)
    for n, w in lista:
        for r in ('caucasian', 'african', 'asian'):
            t = mh.target(f'expression/units/{r}/{n}')
            assert t is not None, n
            d[t[0]] += t[1] * (w / 3)
    return d


def disperso(d, umbral=2e-4):
    """Desplazamientos (nv×3) → solo los vértices que se mueven: índices uint16 + int16 con su escala."""
    idx = np.nonzero(np.linalg.norm(d, axis=1) > umbral)[0]
    if not len(idx):
        return None
    s = float(np.abs(d[idx]).max() / 32767.0)
    return dict(i=b64(idx.astype(np.uint16)), d=b64(np.round(d[idx] / s).astype(np.int16)), s=s, n=int(len(idx)))


def malla_cuerpo(base):
    m = base.caras_de('body')
    fv, ft = base.fv[m], base.ft[m]
    pares = np.stack([fv.reshape(-1), ft.reshape(-1)], 1)
    uniq, inv = np.unique(pares, axis=0, return_inverse=True)
    q = inv.reshape(-1, 4)
    tri = np.concatenate([q[:, [0, 1, 2]], q[:, [0, 2, 3]]])
    uv = base.vt[uniq[:, 1]].copy(); uv[:, 1] = 1 - uv[:, 1]
    return uniq[:, 0], uv, tri


def empaqueta(nombre, mapa, uv, tri, posiciones, mat, extra=None):
    """posiciones: dict variante → (n_original×3); mapa: vértice partido → original."""
    claves = list(posiciones)
    qs, q = cuantiza([posiciones[k][mapa] for k in claves])
    # soldadura: índice compacto del vértice original (para las normales suaves)
    orig, sold = np.unique(mapa, return_inverse=True)
    nv = len(mapa)
    d = dict(nv=int(nv), nt=int(len(tri)), ns=int(len(orig)), q=q, mat=mat,
             pos={k: b64(a) for k, a in zip(claves, qs)},
             uv=b64(np.round(np.clip(uv, 0, 1) * 65535).astype(np.uint16)),
             tri=b64(tri.astype(np.uint16 if nv < 65536 else np.uint32)),
             sold=b64(sold.astype(np.uint16)))
    if extra:
        d.update(extra)
    return d


def main():
    base = mh.Base(); esq = mh.Esqueleto(); W = esq.matriz_pesos()
    v_def, _ = mh.cuerpo(base)
    D = dict(v=1, variantes=C.ORDEN, mallas={}, tex={}, alto={}, media={})
    reposo, posado, RT = {}, {}, {}
    # los pezones se alisan en la malla (la ropa y el maniquí de músculos van sobre un pecho liso)
    m = base.caras_de('body'); fvb = base.fv[m]
    vecinos = [set() for _ in range(RP.NB)]
    for q in fvb:
        for i in range(4):
            vecinos[q[i]].add(int(q[(i + 1) % 4])); vecinos[q[(i + 1) % 4]].add(int(q[i]))
    pezon = set()
    for n in ('breast/nipple-size-incr', 'breast/nipple-size-decr', 'breast/nipple-point-incr', 'breast/nipple-point-decr'):
        t = mh.target(n); pezon.update(int(i) for i, dl in zip(t[0], t[1]) if np.linalg.norm(dl) > 0.004 and i < RP.NB)
    pezon = pezon | {j for i in pezon for j in vecinos[i]}
    # en la silueta b la zona alisada es dos anillos más ancha: bajo un top ceñido no debe marcarse nada
    pezon_b = set(pezon)
    for _ in range(2):
        pezon_b |= {j for i in pezon_b for j in vecinos[i]}
    pezon, pezon_b = sorted(pezon), sorted(pezon_b)
    print('pecho alisado: vértices', len(pezon), '(a),', len(pezon_b), '(b)')
    for k in C.ORDEN:
        v0, vp, R, T = C.construye(base, esq, k, W, torsion=TORSION)
        vp[:RP.NB] = relaja(vp[:RP.NB], pezon_b if k[0] == 'b' else pezon, vecinos)
        reposo[k], posado[k], RT[k] = v0, vp, (R, T)
        D['alto'][k] = float(vp[:13380, 1].max())
    # --- cuerpo
    mapa, uv, tri = malla_cuerpo(base)
    D['mallas']['cuerpo'] = empaqueta('cuerpo', mapa, uv, tri, posado, 'piel')
    # --- gestos de la cara (parpadeo, sonrisa): el desplazamiento ya posado, igual en todas las variantes
    DG = {g: delta_gesto(base, lista) for g, lista in GESTOS.items()}
    def gira(d, k):
        R, _ = RT[k]; out = np.zeros_like(d)
        for b in np.nonzero(W.sum(axis=0) > 0)[0]:
            out += W[:, b:b + 1] * (d @ R[b].T)
        return out
    D['gestos'] = {'cuerpo': {}}
    for g, d in DG.items():
        da, db = gira(d, 'a1')[mapa], gira(d, 'b0')[mapa]
        print('gesto', g, 'cuerpo: vértices', int((np.linalg.norm(da, axis=1) > 2e-4).sum()), 'máx', round(float(np.abs(da).max()) * 100, 2), 'mm; a1≠b0', round(float(np.abs(da - db).max()) * 100, 4), 'mm')
        D['gestos']['cuerpo'][g] = disperso(da)
    # --- músculos: se hornean sobre el cuerpo a1 posado
    Ja = lambda h: esq.cabeza(posado['a1'], h)
    hit_a = dict(hom=Ja('upperarm01.L'), cod=Ja('lowerarm01.L'), mun=Ja('wrist.L'), cad=Ja('upperleg01.L'), rod=Ja('lowerleg01.L'), tob=Ja('foot.L'))
    ids, dist, esc, _ = MU.hornea(posado['a1'], mapa, uv, tri, RP.partes(esq, W), hit_a, S=MUS_S)
    D['tex']['mus_id'], n1 = imagen(Image.fromarray(ids, 'L'), fmt='PNG')
    D['tex']['mus_dist'], n2 = imagen(Image.fromarray(dist, 'L'), calidad=92)
    D['musculos'] = [list(m) for m in MU.MUSCULOS]
    D['grupos'] = MU.GRUPOS
    print('músculos: ids', n1 // 1024, 'KB, distancia', n2 // 1024, 'KB; texel medio', round(esc * 10, 2), 'mm; ids presentes', len(np.unique(ids)) - 1)
    Image.fromarray(ids, 'L').save(os.path.join(mh.CACHE, 'mus_id.png'))
    # --- piezas
    def pieza(clave, pz, mat, extra=None, gestos=False):
        pos = {}
        for k in C.ORDEN:
            p0 = pz.ajusta(reposo[k], v_def)
            R, T = RT[k]
            pos[k] = pz.posa(p0, W, R, T)
        mp, uvp, trip, _ = pz.malla()
        D['mallas'][clave] = empaqueta(clave, mp, uvp, trip, pos, mat, extra)
        if gestos:                      # la pieza sigue a la cara: su desplazamiento en cada gesto
            R, T = RT['a1']; p0 = pz.ajusta(reposo['a1'], v_def); D['gestos'][clave] = {}
            for g, d in DG.items():
                dg = pz.posa(pz.ajusta(reposo['a1'] + d, v_def), W, R, T) - pz.posa(p0, W, R, T)
                sp = disperso(dg[mp])
                if sp:
                    D['gestos'][clave][g] = sp
                    print('gesto', g, clave, sp['n'], 'vértices, máx', round(float(np.abs(dg).max()) * 100, 2), 'mm')
        return pos

    ojos = P.de_mhclo(f'{mh.MH}/eyes/high-poly/high-poly.mhclo')
    pieza('ojos', ojos, 'ojo', dict(tex='ojo'))
    D['tex']['ojo'], n = imagen(tex_ojo(f'{mh.MH}/eyes/materials/brown_eye.png'), alfa=True, lado=256, calidad=92)
    pz = P.de_json('eyebrows', CEJAS); pieza('cejas', pz, 'vello', dict(tex='cejas'), gestos=True)
    D['tex']['cejas'], n = imagen(pz.tex, alfa=True, calidad=90)
    pz = P.de_json('eyelashes', PESTANAS); pieza('pestanas', pz, 'vello', dict(tex='pestanas'), gestos=True)
    D['tex']['pestanas'], n = imagen(pz.tex, alfa=True, calidad=90)
    for pelo, nombre in PELOS.items():
        pz = P.de_json('hair', nombre)
        pieza('pelo_' + pelo, pz, 'pelo', dict(tex='pelo_' + pelo))
        _, uvp, trip, _ = pz.malla()
        D['tex']['pelo_' + pelo], n = imagen(tex_pelo(pz.tex, uvp, trip), alfa=True, calidad=90)
    y_calc = {}
    for cz, nombre in CALZADO.items():
        pz = P.de_json('clothes', nombre)
        pos = pieza('cz_' + cz, pz, 'calzado')
        y_calc = {k: float(pos[k][:, 1].max()) for k in C.ORDEN}
        # el pie izquierdo de cada variante: centro, eje (talón → punta) y extremos a lo largo del eje, para dibujar la zapatilla
        pie = {}
        for k in C.ORDEN:
            s = pos[k][(pos[k][:, 0] > 0) & (pos[k][:, 1] < 0.32)][:, [0, 2]]
            c = s.mean(0); _, _, vt = np.linalg.svd(s - c); e = vt[0] if vt[0][1] > 0 else -vt[0]
            t = (pos[k][pos[k][:, 0] > 0][:, [0, 2]] - c) @ e
            pie[k] = [round(float(x), 4) for x in (c[0], c[1], e[0], e[1], t.min(), t.max())]
        print('pie a1', pie['a1'], 'b0', pie['b0'])
    # --- ropa: el navegador calcula los campos con estos hitos (por variante) y estas partes (por vértice)
    def J(k, h):
        return [round(float(x), 4) for x in esq.cabeza(posado[k], h)]
    pa = RP.partes(esq, W)
    def sien(k):
        Bk = posado[k][:RP.NB]; ey = esq.cabeza(posado[k], 'eye.L')[1]
        m = (pa['cabeza'] > 0.9) & (np.abs(Bk[:, 1] - ey) < 0.08) & (Bk[:, 0] > 0)
        return [round(float(x), 4) for x in Bk[m][np.argmax(Bk[m, 0])]]
    D['hitos'] = {k: dict(nk=J(k, 'neck01'), hom=J(k, 'upperarm01.L'), cod=J(k, 'lowerarm01.L'), mun=J(k, 'wrist.L'),
                          cad=J(k, 'upperleg01.L'), rod=J(k, 'lowerleg01.L'), tob=J(k, 'foot.L'), cab=J(k, 'head'), ojo=J(k, 'eye.L'), sien=sien(k), calz=round(y_calc[k], 4), pie=pie[k])
                  for k in C.ORDEN}
    pa = RP.partes(esq, W)
    u8 = lambda a: b64(np.round(np.clip(a, 0, 1) * 255).astype(np.uint8))
    # el cuero cabelludo: los vértices de la cabeza que tienen pelo (el corte «short04», de nacimiento limpio) justo encima
    from scipy.spatial import cKDTree
    pz = P.de_json('hair', 'short04')
    ph = pz.posa(pz.ajusta(reposo['a1'], v_def), W, *RT['a1'])
    alfa = np.asarray(Image.open(pz.tex).convert('RGBA'))[..., 3]
    uvh = np.clip(pz.vt, 0, 0.9999)
    # alfa de cada vértice del pelo (por cualquiera de sus UV)
    a_v = np.zeros(len(pz.v))
    for cv, ct in zip(pz.fv, pz.ft):
        for iv, it in zip(cv, ct):
            a_v[iv] = max(a_v[iv], alfa[min(alfa.shape[0] - 1, int((1 - uvh[it, 1]) * alfa.shape[0])), int(uvh[it, 0] * alfa.shape[1])])
    opaco = ph[a_v > 140]
    Ba = posado['a1'][:RP.NB]
    tri_s = np.concatenate([base.fv[base.caras_de('body')][:, [0, 1, 2]], base.fv[base.caras_de('body')][:, [0, 2, 3]]])
    Na = mh.normales(posado['a1'], tri_s)[:RP.NB]
    arbol = cKDTree(opaco)
    cuero = np.zeros(RP.NB)
    cab_i = np.nonzero(pa['cabeza'] > 0.5)[0]
    for i in cab_i:
        js = arbol.query_ball_point(Ba[i], 0.55)
        if not js:
            continue
        d = opaco[js] - Ba[i]
        fuera = d @ Na[i] > -0.02
        if fuera.any():
            cuero[i] = np.clip((0.42 - np.linalg.norm(d[fuera], axis=1).min()) / 0.16, 0, 1)
    for _ in range(2):
        cuero[cab_i] = [0.5 * cuero[i] + 0.5 * np.mean([cuero[j] for j in vecinos[i]]) for i in cab_i]
    D['partes'] = dict(brazoL=u8(pa['brazoL']), brazoR=u8(pa['brazoR']), pierna=u8(pa['piernaL'] + pa['piernaR']), cabeza=u8(pa['cabeza']), cuero=u8(cuero))
    # --- pieles
    for clave, ruta in (('piel_a', 'young_caucasian_male/textures/young_lightskinned_male_diffuse.png'),
                        ('piel_b', 'young_caucasian_female/textures/young_lightskinned_female_diffuse.png'),
                        ('piel_ao', 'young_african_male/textures/young_darkskinned_male_diffuse.png'),
                        ('piel_bo', 'young_african_female/textures/young_darkskinned_female_diffuse.png')):
        D['tex'][clave], n = imagen(f'{MJS}/skins/{ruta}', calidad=90)
        a = np.asarray(Image.open(f'{MJS}/skins/{ruta}').convert('RGB'), float) / 255.0
        D['media'][clave] = [float(x) for x in (a ** 2.2).reshape(-1, 3).mean(0)]
    txt = 'window.TG_C3D_DATOS=' + json.dumps(D, separators=(',', ':')) + ';'
    open(SALIDA, 'w').write(txt)
    print('datos3d.js', round(len(txt) / 1024), 'KB;', {k: (m['nv'], m['nt']) for k, m in D['mallas'].items()})


TORSION = 0.0
ZONA_PELO = 14.0          # px (de una textura de 512): el tamaño de «zona» para el detalle del pelo
MUS_S = 1024
if __name__ == '__main__':
    main()
    if '--empaquetar' in sys.argv:
        import empaqueta3d
        empaqueta3d.main(SALIDA, os.path.join(os.path.dirname(os.path.dirname(AQUI)), 'datos', 'cuerpo3d'))
