#!/usr/bin/env python3
"""
orientacion_playa.py — deduce `ori` desde el POLIGONO DE ARENA, no desde el agua.

Por que este metodo y no los tres anteriores:
  Los tres intentos previos median DONDE HAY AGUA. En una cala hay agua por casi
  todos lados, asi que el promedio no significa nada — y por eso acercarse a 50 m
  lo empeoraba en vez de mejorarlo. `ori` no es "por donde hay mar": es hacia donde
  da el frente de la playa. Ese frente es la orilla, y la orilla es el eje largo
  del poligono de arena. Es un dato distinto, y OSM lo tiene (`natural=beach`,
  en Protomaps la capa `landuse` con `kind=beach`).

  El agua se usa para UNA sola cosa: decidir cual de las dos perpendiculares
  apunta al mar. Esa pregunta es binaria y gruesa, y ahi el agua si vale.

REGLA DE ORO
  Ante cualquier duda devuelve None con el motivo. Nunca un angulo a medias.
  Una orientacion inventada no se nota y manda a alguien con el mar de cara.

USO
    python3 orientacion_playa.py playas.geojson agua.geojson index.html
    python3 orientacion_playa.py ... --todas    # ademas propone las que faltan

Sin dependencias: solo stdlib. Los dos geojson salen de
tools/extraer_geojson.py, que es quien lee el pmtiles.

RESULTADO DEL CONTROL, 7 de septiembre de 2026 — NO APRUEBA
  Reproduce 7 de las 12 escritas a mano. El umbral, fijado antes de mirar,
  era 10. No se ha movido.

    7  OK        dentro de 45 grados
    1  DIF       teresitas: a mano NE, calculado SE (152,5 grados, 90 de
                 separacion). Los otros dos metodos geometricos tambien
                 dijeron SE, ~155. Tres metodos independientes coinciden
                 entre si y discrepan de lo escrito a mano.
    4  None      playa-amarilla (arena a 338 m, limite 300), playa-jardin
                 (los dos lados en agua), playa-puertito-adeje (ningun lado
                 en agua a 150 m), san-juan (poligono casi redondo, 1,69)

  Comprobado que los cuatro None NO son un fallo de la extraccion: hay agua
  y arena a menos de 400 m de los cuatro. Son las puertas del metodo
  disparando sobre geometria real.

  La forma del fallo es distinta a la de los tres metodos anteriores, que
  devolvian un angulo seguro y equivocado siempre. Este se calla cuando
  duda: de las 8 que contesto, acerto 7. Pero la regla contaba un "no
  contesto" como fallo, y la regla se fijo antes. Por la regla, es que NO.

REAUDITORIA DE LAS 22 `deducida:true` — esto si sirvio
  No es una propuesta -el metodo no aprobo-, es un recuento de en cuantas
  discrepan dos metodos independientes:

    16 coinciden dentro de 45 grados
     2 discrepan 90: playa-americas (fichero SW, arena NW) y
                     san-marcos     (fichero N,  arena W)
     4 sin decidir
"""
import sys, json, math, re

R = 6371000.0
DIST_MAX_POLIGONO = 300.0   # m: mas lejos, el poligono no es de esa playa
ECC_MIN           = 1.8     # relacion de ejes minima para que haya "frente"
PASO_MAR          = 150.0   # m que se avanza para decidir el lado de mar
SEP_APROBADO      = 45.0    # grados: dentro de un rumbo se considera acierto
ORI_DEG = {'N':0,'NE':45,'E':90,'SE':135,'S':180,'SW':225,'W':270,'NW':315}


# ───────────────────────── geometria basica ─────────────────────────
def a_metros(lat, lng, lat0, lng0):
    k = math.cos(math.radians(lat0))
    return (math.radians(lng - lng0) * k * R, math.radians(lat - lat0) * R)

def dist_punto_segmento(p, a, b):
    (px,py),(ax,ay),(bx,by) = p,a,b
    dx,dy = bx-ax, by-ay
    L2 = dx*dx + dy*dy
    if L2 == 0: return math.hypot(px-ax, py-ay)
    t = max(0.0, min(1.0, ((px-ax)*dx + (py-ay)*dy)/L2))
    return math.hypot(px-(ax+t*dx), py-(ay+t*dy))

def dist_a_anillo(p, anillo):
    return min(dist_punto_segmento(p, anillo[i], anillo[i+1])
               for i in range(len(anillo)-1))

def dentro(p, anillo):
    x,y = p; d=False; n=len(anillo); j=n-1
    for i in range(n):
        xi,yi = anillo[i]; xj,yj = anillo[j]
        if (yi>y) != (yj>y):
            if x < xi + (y-yi)*(xj-xi)/(yj-yi): d = not d
        j=i
    return d

def remuestrea(anillo, paso=5.0):
    """Puntos cada `paso` metros a lo largo del contorno.

    Sin esto, un tramo con muchos vertices pesa mas que uno con pocos y el eje
    sale sesgado hacia donde OSM mapeo con mas detalle. Es un fallo silencioso:
    da un angulo plausible y equivocado."""
    out = []
    for i in range(len(anillo)-1):
        (x0,y0),(x1,y1) = anillo[i], anillo[i+1]
        L = math.hypot(x1-x0, y1-y0)
        n = max(1, int(L/paso))
        for k in range(n):
            t = k/n
            out.append((x0+(x1-x0)*t, y0+(y1-y0)*t))
    out.append(anillo[-1])
    return out

def eje_principal(pts):
    """(rumbo del eje largo en grados, excentricidad). PCA de 2x2 a mano."""
    n = len(pts)
    cx = sum(p[0] for p in pts)/n
    cy = sum(p[1] for p in pts)/n
    sxx = sum((p[0]-cx)**2 for p in pts)/n
    syy = sum((p[1]-cy)**2 for p in pts)/n
    sxy = sum((p[0]-cx)*(p[1]-cy) for p in pts)/n
    tr, det = sxx+syy, sxx*syy - sxy*sxy
    disc = max(0.0, tr*tr/4 - det)
    l1 = tr/2 + math.sqrt(disc)
    l2 = tr/2 - math.sqrt(disc)
    if l2 <= 1e-9: ecc = float('inf')
    else: ecc = math.sqrt(l1/l2)
    # autovector de l1
    if abs(sxy) > 1e-12: vx, vy = l1 - syy, sxy
    else: vx, vy = (1.0, 0.0) if sxx >= syy else (0.0, 1.0)
    rumbo = math.degrees(math.atan2(vx, vy)) % 180.0   # eje, no direccion
    return rumbo, ecc

def a_rumbo(deg):
    deg %= 360
    return min(ORI_DEG, key=lambda k: abs(((deg-ORI_DEG[k]+540) % 360)-180))

def sep(a, b):
    if a not in ORI_DEG or b not in ORI_DEG: return 999
    return abs(((ORI_DEG[a]-ORI_DEG[b]+540) % 360)-180)


# ───────────────────────── el calculo ─────────────────────────
def orientar(lat, lng, playas, aguas):
    """(rumbo, grados, dict de confianza) o (None, None, motivo)."""
    # 1 · poligono de arena mas cercano, medido al contorno
    mejor, dmin = None, float('inf')
    p0 = (0.0, 0.0)
    for anillo_ll in playas:
        an = [a_metros(la, lo, lat, lng) for la, lo in anillo_ll]
        if len(an) < 4: continue
        if an[0] != an[-1]: an.append(an[0])
        d = 0.0 if dentro(p0, an) else dist_a_anillo(p0, an)
        if d < dmin: dmin, mejor = d, an
    if mejor is None:
        return None, None, {'motivo': 'no hay ningun poligono de arena en el fichero'}
    if dmin > DIST_MAX_POLIGONO:
        return None, None, {'motivo': f'el poligono de arena mas cercano esta a {dmin:.0f} m '
                                      f'(limite {DIST_MAX_POLIGONO:.0f} m): no es esta playa'}

    # 2 · eje largo del contorno, remuestreado
    pts = remuestrea(mejor)
    if len(pts) < 8:
        return None, None, {'motivo': f'poligono con solo {len(pts)} puntos: muy tosco'}
    eje, ecc = eje_principal(pts)
    if ecc < ECC_MIN:
        return None, None, {'motivo': f'poligono casi redondo (ejes {ecc:.2f}, minimo {ECC_MIN}): '
                                      'no tiene un frente definido'}

    # 3 · de las dos perpendiculares, la que da al mar
    cand = [(eje+90) % 360, (eje-90) % 360]
    puntua = []
    for c in cand:
        r = math.radians(c)
        px, py = PASO_MAR*math.sin(r), PASO_MAR*math.cos(r)
        en_agua = any(dentro((px,py), [a_metros(la,lo,lat,lng) for la,lo in ag])
                      for ag in aguas if len(ag) >= 4)
        en_arena = dentro((px,py), mejor)
        puntua.append((c, en_agua, en_arena))
    con_agua = [c for c,ag,ar in puntua if ag and not ar]
    if len(con_agua) == 0:
        return None, None, {'motivo': 'ninguno de los dos lados cae en agua a 150 m: '
                                      'no se puede decidir cual mira al mar'}
    if len(con_agua) == 2:
        return None, None, {'motivo': 'los dos lados caen en agua: playa en istmo o punta, '
                                      'hay que mirarla a mano'}
    ang = con_agua[0]
    return a_rumbo(ang), round(ang, 1), {
        'dist_poligono_m': round(dmin, 1),
        'excentricidad': round(ecc, 2),
        'puntos_contorno': len(pts),
    }


# ───────────────────────── lectura ─────────────────────────
def anillos(geo):
    out = []
    def g(o):
        t, c = o.get('type'), o.get('coordinates')
        if t == 'Polygon':
            for r in c: out.append([(p[1], p[0]) for p in r])
        elif t == 'MultiPolygon':
            for poly in c:
                for r in poly: out.append([(p[1], p[0]) for p in r])
        elif t == 'GeometryCollection':
            for s in o.get('geometries', []): g(s)
    if geo.get('type') == 'FeatureCollection':
        for f in geo['features']:
            if f.get('geometry'): g(f['geometry'])
    elif geo.get('type') == 'Feature': g(geo['geometry'])
    else: g(geo)
    return out

def lee_app(ruta):
    s = open(ruta, encoding='utf-8').read()
    coords = {m.group(1): (float(m.group(2)), float(m.group(3)))
              for m in re.finditer(r'\{ id:"([a-z0-9-]+)",[^\n]*?lat:(-?[\d.]+), lng:(-?[\d.]+)', s)}
    b = s[s.index('const PLAYAS_ORIENTACION'):]
    b = b[:b.index('\n};')]
    ori = {}
    for m in re.finditer(r"'([a-z0-9-]+)':\s*\{([^}]*)\}", b):
        o = re.search(r"ori:\s*'([A-Z]+)'", m.group(2))
        if o: ori[m.group(1)] = (o.group(1), 'deducida' in m.group(2))
    return coords, ori


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    todas = '--todas' in sys.argv
    if len(args) < 3:
        print(__doc__); sys.exit(1)
    playas = anillos(json.load(open(args[0], encoding='utf-8')))
    aguas  = anillos(json.load(open(args[1], encoding='utf-8')))
    coords, ori = lee_app(args[2])
    print(f'poligonos de arena: {len(playas)} · poligonos de agua: {len(aguas)} · '
          f'POI: {len(coords)} · con orientacion: {len(ori)}\n')
    if len(playas) < 5:
        print('  >>> Muy pocos poligonos de arena. Revisa la extraccion. Abortado.')
        sys.exit(2)

    mano = {k:v for k,(v,d) in ori.items() if not d}
    ded  = {k:v for k,(v,d) in ori.items() if d}

    print(f'=== CONTROL · las {len(mano)} escritas a mano ===')
    print('Umbral fijado ANTES de mirar el resultado: aprueba con >= 10 de 12 '
          f'dentro de {SEP_APROBADO:.0f} grados.\n')
    ok = nulos = 0
    for pid, v in sorted(mano.items()):
        if pid not in coords:
            print(f'  ---  {pid:<26} no esta en places[]'); continue
        c, deg, info = orientar(*coords[pid], playas, aguas)
        if c is None:
            nulos += 1
            print(f'  ???  {pid:<26} a mano {v:<3} -> None  ({info["motivo"]})')
            continue
        s = sep(c, v)
        if s <= SEP_APROBADO: ok += 1; marca = 'OK '
        else: marca = 'DIF'
        print(f'  {marca}  {pid:<26} a mano {v:<3} calculado {c:<3} ({deg}°, sep {s}°, '
              f'arena a {info["dist_poligono_m"]} m, ejes {info["excentricidad"]})')
    print(f'\n  Reproduce {ok} de {len(mano)} · sin decidir {nulos}')
    aprueba = ok >= 10
    print(f'  {"APRUEBA" if aprueba else "NO APRUEBA"}: {ok} >= 10 es {aprueba}')
    if not aprueba:
        print('\n  El metodo del poligono de arena tampoco vale. No se propone nada.')
        print('  Con esto quedan descartados los cuatro metodos geometricos y la')
        print('  respuesta pasa a ser definitivamente NO.')
        sys.exit(3)

    print(f'\n=== REAUDITORIA · las {len(ded)} marcadas deducida:true ===')
    print('Vienen de un metodo basado en agua que acierta la mitad de las veces.')
    print('Si el de arena aprueba el control, estas hay que RECALCULARLAS, no conservarlas.\n')
    coincide = discrepa = 0
    for pid, v in sorted(ded.items()):
        if pid not in coords: continue
        c, deg, info = orientar(*coords[pid], playas, aguas)
        if c is None:
            print(f'  ???  {pid:<26} fichero {v:<3} -> None  ({info["motivo"]})'); continue
        s = sep(c, v)
        if s <= SEP_APROBADO: coincide += 1
        else:
            discrepa += 1
            print(f'  CAMBIA  {pid:<26} fichero {v:<3} -> {c:<3} ({deg}°, sep {s}°)')
    print(f'\n  Coinciden {coincide} · cambian {discrepa}')

    if todas:
        print('\n=== PROPUESTA · las que no tienen orientacion ===')
        prop = nada = 0
        for pid, (la, lo) in sorted(coords.items()):
            if pid in ori: continue
            c, deg, info = orientar(la, lo, playas, aguas)
            if c is None:
                nada += 1; continue
            prop += 1
            print(f"  '{pid}': {{ ori: '{c}', badWind: [], deducida: true }},   "
                  f"# {deg}° · arena a {info['dist_poligono_m']} m · ejes {info['excentricidad']}")
        print(f'\n  Propone {prop} · sin poligono utilizable {nada}')
        print('  badWind se deja vacio a proposito: no es geometrico y no se inventa.')
        print('  Las Vistas tampoco lo lleva y puntua igual.')

    print('\nEste script no escribe en index.html.')


if __name__ == '__main__':
    main()
