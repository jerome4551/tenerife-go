#!/usr/bin/env python3
"""
orientacion.py — deduce la orientacion de una playa desde la geometria de costa.

No inventa nada: lee la linea de costa real y calcula hacia donde mira la playa.
Sin dependencias externas, solo stdlib.

USO
  python3 tools/orientacion.py [id ...]        # sin ids: solo el control

DE DONDE SALE LA COSTA
  tools/datos/costa_tenerife.json — GSHHG v2.3.7 a resolucion «full», el
  poligono 206 de la isla, sacado del paquete PyPI basemap-data-hires 2.0.0.
  1.542 vertices, 282,8 km de perimetro, separacion mediana 126 m (p90 368 m).
  El shapefile municipal del Cabildo seria mejor, pero datos.canarias.es no pasa
  el proxy del contenedor; si algun dia se puede, se cambia la fuente y se
  vuelve a pasar el control, que es quien decide si la fuente sirve.

CONTROL OBLIGATORIO
  Antes de dar por buena ninguna orientacion nueva, recalcula las entradas que
  ya llevan deducida:true y compara. Si no las reproduce, el metodo no vale y no
  se usa. Si reproduce unas y falla otras, eso tambien es un hallazgo.

  Se informa por separado el acierto EXACTO y el acierto a +/-1 rumbo, porque
  con 8 rumbos una tolerancia de 45 grados deja pasar un metodo corrido un
  puesto entero: es justo el error que hay que cazar, no el que hay que
  perdonar.

RESULTADO DEL CONTROL, 1/9/2026 — NO SE USA
  Con esta costa: 10 exactas de 22, 6 a un rumbo y 6 que no salen. El control
  manda, asi que ninguna orientacion nueva de aqui entra en el fichero.

  El metodo no es el problema; la costa si. El corte es limpio: TODAS las que
  acierta estan a 210 m o menos del poligono, y TODAS las que fallan a 247 m o
  mas. GSHHG a resolucion «full» se come las calas de Tenerife —las 5 que
  devuelven None estan entre 250 y 541 m tierra adentro del poligono, asi que
  las dos normales caen en tierra y no hay lado de mar; playa-americas cae
  directamente FUERA del poligono, en lo que GSHHG cree que es mar—. Y no es
  cuestion de afinar el radio: de 100 a 800 m el mejor resultado es 13 de 22,
  y a 800 m la ventana ya se ha comido la bahia que se queria medir.

  Lo que lo desbloquea es una costa mejor, no otro algoritmo: el shapefile
  municipal del Cabildo (el mismo del cruce de municipios) o cualquier linea de
  costa con fidelidad de 50 m o menos. Se cambia costa_tenerife.json y se
  vuelve a pasar el control.

  De paso: acc-playa-troya (311 m del poligono) y acc-playa-poris (541 m) caen
  de lleno en la zona mala, y devuelven None. Solo acc-playa-los-cristianos
  (100 m) da un valor, y no se acepta un valor suelto de un metodo suspendido.
"""
import sys, math, re, json, os

RADIO_M = 250.0   # ventana de suavizado de la tangente, a cada lado
ORI_DEG = {'N':0, 'NE':45, 'E':90, 'SE':135, 'S':180, 'SW':225, 'W':270, 'NW':315}
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

R = 6371000.0

def metros(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = math.radians(b[0]-a[0]), math.radians(b[1]-a[1])
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(h))

def plano(p, ref):
    """A metros locales (x=este, y=norte) alrededor de ref."""
    k = math.cos(math.radians(ref[0]))
    return (math.radians(p[1]-ref[1])*R*k, math.radians(p[0]-ref[0])*R)

def dist_segmento(p, a, b):
    """Distancia de p al SEGMENTO ab, y el pie de la perpendicular.

    Al VERTICE no: es el error que ya ha producido tres bloqueantes falsos en
    este proyecto. En un tramo recto y largo la distancia al vertice puede ser
    treinta veces la real, y es justo donde el error de verdad es menor.
    """
    px, py = plano(p, p); ax, ay = plano(a, p); bx, by = plano(b, p)
    dx, dy = bx-ax, by-ay
    L = dx*dx + dy*dy
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px-ax)*dx + (py-ay)*dy)/L))
    fx, fy = ax + t*dx, ay + t*dy
    return math.hypot(px-fx, py-fy), t

def a_rumbo(deg):
    deg %= 360
    mejor, dif = None, 999
    for k, v in ORI_DEG.items():
        d = abs(((deg - v + 540) % 360) - 180)
        if d < dif:
            dif, mejor = d, k
    return mejor

def separacion(x, y):
    if x is None or y is None: return 999
    return abs(((ORI_DEG[x] - ORI_DEG[y] + 540) % 360) - 180)

def dentro(p, anillo):
    """Punto en poligono, por cruces. El anillo es la isla: fuera = mar."""
    x, y = p[1], p[0]
    d = False
    n = len(anillo)
    j = n-1
    for i in range(n):
        yi, xi = anillo[i]; yj, xj = anillo[j]
        if (xi > x) != (xj > x):
            if y < (yj-yi)*(x-xi)/(xj-xi) + yi:
                d = not d
        j = i
    return d

def orientacion(lat, lng, anillo):
    """Normal a la costa que apunta al mar, en el punto mas cercano a la playa."""
    P = (lat, lng)
    mejor = (1e18, None, None)
    n = len(anillo)
    for i in range(n-1):
        a, b = anillo[i], anillo[i+1]
        # descarte barato antes de la trigonometria
        if min(a[0], b[0]) - 0.02 > lat or max(a[0], b[0]) + 0.02 < lat: continue
        if min(a[1], b[1]) - 0.02 > lng or max(a[1], b[1]) + 0.02 < lng: continue
        d, t = dist_segmento(P, a, b)
        if d < mejor[0]:
            mejor = (d, i, t)
    dmin, i, t = mejor
    if i is None:
        return None, None, None

    # tangente: se camina por el anillo hacia los dos lados desde el segmento
    # mas cercano, acumulando longitud de arco hasta RADIO_M. Recorrido
    # CONTIGUO a proposito: coger «todos los vertices a menos de 250 m» mezcla
    # los del otro lado de una punta y da una tangente que cruza el cabo.
    def caminar(ini, paso):
        acc, k, ult = 0.0, ini, anillo[ini]
        while 0 <= k+paso < n and acc < RADIO_M:
            acc += metros(anillo[k], anillo[k+paso])
            k += paso
            ult = anillo[k]
        return ult
    p0 = caminar(i, -1)
    p1 = caminar(min(i+1, n-1), +1)

    x0, y0 = plano(p0, P); x1, y1 = plano(p1, P)
    tang = math.degrees(math.atan2(x1-x0, y1-y0))   # rumbo geografico

    # de las dos normales se queda la que cae en el MAR: se avanza 300 m y se
    # mira si el punto sale del poligono de la isla. Es una prueba exacta; el
    # centroide del anillo no lo es en una isla con Anaga y Teno.
    salida = None
    for cand in (tang+90, tang-90):
        r = math.radians(cand)
        k = math.cos(math.radians(lat))
        pl = lat + math.degrees(300*math.cos(r)/R)
        pg = lng + math.degrees(300*math.sin(r)/(R*k))
        if not dentro((pl, pg), anillo):
            salida = cand if salida is None else None   # si las dos: ambiguo
            if salida is None: break
    if salida is None:
        return None, None, round(dmin, 1)
    return a_rumbo(salida), round(salida % 360, 1), round(dmin, 1)


def main():
    costa = json.load(open(os.path.join(RAIZ, 'tools/datos/costa_tenerife.json'), encoding='utf-8'))
    anillo = [tuple(p) for p in costa['anillo']]
    print('Costa: %s' % costa['fuente'])
    print('  %d vertices\n' % len(anillo))

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    coords = {m.group(1): (float(m.group(2)), float(m.group(3)))
              for m in re.finditer(r'\{ id:"([^"]+)",[^\n]*?lat:(-?[\d.]+), lng:(-?[\d.]+)', src)}
    bloque = src[src.index('const PLAYAS_ORIENTACION'):]
    bloque = bloque[:bloque.index('\n};')]
    existentes = {}
    for m in re.finditer(r"'([a-z0-9-]+)':\s*\{([^}]*)\}", bloque):
        ori = re.search(r"ori:\s*'([A-Z]+)'", m.group(2))
        if ori:
            existentes[m.group(1)] = (ori.group(1), bool(re.search(r'deducida:\s*true', m.group(2))))

    print('=== CONTROL: reproducir las entradas deducida:true ===')
    exacto = vecino = lejos = 0
    for pid, (ori_actual, ded) in sorted(existentes.items()):
        if not ded or pid not in coords: continue
        calc, deg, d = orientacion(*coords[pid], anillo)
        sep = separacion(calc, ori_actual)
        marca = 'OK ' if sep == 0 else ('~1 ' if sep <= 45 else 'DIF')
        if sep == 0: exacto += 1
        elif sep <= 45: vecino += 1
        else: lejos += 1
        print('  %s %-28s fichero:%-3s calculado:%-4s (%5s grados, costa a %6s m, sep %d)'
              % (marca, pid, ori_actual, calc, deg, d, sep))
    tot = exacto + vecino + lejos
    print('\n  exactas %d/%d · a un rumbo %d · discrepan %d' % (exacto, tot, vecino, lejos))

    ids = sys.argv[1:]
    if not ids: return
    print('\n=== NUEVAS ===')
    for pid in ids:
        if pid not in coords:
            print('  %s: no esta en places[]' % pid); continue
        calc, deg, d = orientacion(*coords[pid], anillo)
        print('  %-28s ori:%-4s (%s grados, costa a %s m)' % (pid, calc, deg, d))


if __name__ == '__main__':
    main()
