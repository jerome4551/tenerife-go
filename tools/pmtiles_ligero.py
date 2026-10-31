#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmtiles_ligero.py — leer mapa/*.pmtiles y sus teselas MVT sin instalar nada.

Lo usa tools/relieve_construir.py (la costa del relieve de «La isla en 3D»,
31 de octubre de 2026). tools/costa.py hace lo mismo con los paquetes
pmtiles y mapbox_vector_tile; este no necesita ninguno, porque el relieve se
genera en un workflow y se coteja en auditar.sh, y en ninguno de los dos
sitios tiene que depender de un pip install para saber donde esta la costa.

LA Y VA HACIA ABAJO. Las coordenadas que devuelve decodificar() son las de la
tesela tal cual vienen en el MVT: (0,0) arriba a la izquierda y la y crece
hacia el sur, como los pixeles. No hay que voltear nada (la trampa de
costa.py era de mapbox_vector_tile, que la devuelve con el origen abajo).

    from pmtiles_ligero import PMTiles, decodificar
    p = PMTiles('mapa/tenerife-osm.pmtiles')
    capas = decodificar(p.tesela(13, 3709, 3437))   # {'earth': (4096, [(tipo, props, partes)]), ...}
"""
import gzip
import json
import math
import struct


def _varint(b, p):
    r = s = 0
    while True:
        x = b[p]
        p += 1
        r |= (x & 0x7f) << s
        if not (x & 0x80):
            return r, p
        s += 7


def _descomprimir(raw, modo):
    if modo in (0, 1):        # desconocida / sin comprimir
        return raw
    if modo == 2:             # gzip
        return gzip.decompress(raw)
    raise ValueError('compresion PMTiles %d no soportada (solo gzip)' % modo)


def _leer_directorio(buf):
    n, p = _varint(buf, 0)
    ids, tid = [], 0
    for _ in range(n):
        d, p = _varint(buf, p)
        tid += d
        ids.append(tid)
    runs, largos, offs = [], [], []
    for _ in range(n):
        v, p = _varint(buf, p)
        runs.append(v)
    for _ in range(n):
        v, p = _varint(buf, p)
        largos.append(v)
    for i in range(n):
        v, p = _varint(buf, p)
        offs.append(offs[i - 1] + largos[i - 1] if (v == 0 and i > 0) else v - 1)
    return list(zip(ids, runs, offs, largos))


def zxy_a_id(z, x, y):
    """El indice de Hilbert de PMTiles v3."""
    base = 0
    for t in range(z):
        base += (1 << t) * (1 << t)
    n = 1 << z
    d, tx, ty = 0, x, y
    s = n // 2
    while s > 0:
        rx = 1 if (tx & s) else 0
        ry = 1 if (ty & s) else 0
        d += s * s * ((3 * rx) ^ ry)
        if ry == 0:
            if rx == 1:
                tx, ty = s - 1 - tx, s - 1 - ty
            tx, ty = ty, tx
        s //= 2
    return base + d


class PMTiles:
    def __init__(self, ruta):
        self.f = open(ruta, 'rb')
        b = self.f.read(127)
        if len(b) < 127 or b[:7] != b'PMTiles' or b[7] != 3:
            raise ValueError('%s no es un PMTiles v3' % ruta)
        u = lambda o: struct.unpack('<Q', b[o:o + 8])[0]
        i = lambda o: struct.unpack('<i', b[o:o + 4])[0]
        self.cab = dict(raiz_off=u(8), raiz_len=u(16), meta_off=u(24), meta_len=u(32),
                        hojas_off=u(40), hojas_len=u(48), datos_off=u(56), datos_len=u(64),
                        comp_interna=b[97], comp_tesela=b[98], tipo=b[99], zmin=b[100], zmax=b[101],
                        lon_min=i(102) / 1e7, lat_min=i(106) / 1e7,
                        lon_max=i(110) / 1e7, lat_max=i(114) / 1e7)
        self._dirs = {}

    def cerrar(self):
        self.f.close()

    def _leer(self, off, n):
        self.f.seek(off)
        return self.f.read(n)

    def _dir(self, off, n):
        k = (off, n)
        if k not in self._dirs:
            self._dirs[k] = _leer_directorio(_descomprimir(self._leer(off, n), self.cab['comp_interna']))
        return self._dirs[k]

    def metadatos(self):
        return json.loads(_descomprimir(self._leer(self.cab['meta_off'], self.cab['meta_len']),
                                        self.cab['comp_interna']))

    def tesela(self, z, x, y):
        """Los bytes MVT ya descomprimidos, o None si la tesela no esta."""
        tid = zxy_a_id(z, x, y)
        off, n = self.cab['raiz_off'], self.cab['raiz_len']
        for _ in range(4):
            ents = self._dir(off, n)
            lo, hi, e = 0, len(ents) - 1, None
            while lo <= hi:
                m = (lo + hi) // 2
                if ents[m][0] <= tid:
                    e = ents[m]
                    lo = m + 1
                else:
                    hi = m - 1
            if e is None:
                return None
            eid, run, eoff, elen = e
            if run == 0:                       # un directorio hoja
                off, n = self.cab['hojas_off'] + eoff, elen
                continue
            if tid < eid + run:
                return _descomprimir(self._leer(self.cab['datos_off'] + eoff, elen), self.cab['comp_tesela'])
            return None
        return None


# ─────────────────────────── MVT ───────────────────────────
def _campos(b):
    p, n = 0, len(b)
    while p < n:
        k, p = _varint(b, p)
        f, t = k >> 3, k & 7
        if t == 0:
            v, p = _varint(b, p)
            yield f, v
        elif t == 2:
            L, p = _varint(b, p)
            yield f, b[p:p + L]
            p += L
        elif t == 1:
            yield f, b[p:p + 8]
            p += 8
        elif t == 5:
            yield f, b[p:p + 4]
            p += 4
        else:
            raise ValueError('MVT: tipo de campo %d' % t)


def _empaquetados(b):
    p, out = 0, []
    while p < len(b):
        v, p = _varint(b, p)
        out.append(v)
    return out


def _valor(b):
    for f, v in _campos(b):
        if f == 1:
            return v.decode('utf-8')
        if f == 2:
            return struct.unpack('<f', v)[0]
        if f == 3:
            return struct.unpack('<d', v)[0]
        if f == 4:
            return v if v < (1 << 63) else v - (1 << 64)
        if f == 5:
            return v
        if f == 6:
            return (v >> 1) ^ -(v & 1)
        if f == 7:
            return bool(v)
    return None


def _geometria(cmds, tipo):
    """Partes de la geometria: puntos (tipo 1), lineas (2) o anillos cerrados (3)."""
    i, x, y = 0, 0, 0
    partes, actual = [], []
    while i < len(cmds):
        c = cmds[i]
        i += 1
        cid, cnt = c & 7, c >> 3
        if cid == 1:                                   # MoveTo
            for _ in range(cnt):
                dx, dy = cmds[i], cmds[i + 1]
                i += 2
                x += (dx >> 1) ^ -(dx & 1)
                y += (dy >> 1) ^ -(dy & 1)
                if actual:
                    partes.append(actual)
                actual = [(x, y)]
                if tipo == 1:
                    partes.append(actual)
                    actual = []
        elif cid == 2:                                 # LineTo
            for _ in range(cnt):
                dx, dy = cmds[i], cmds[i + 1]
                i += 2
                x += (dx >> 1) ^ -(dx & 1)
                y += (dy >> 1) ^ -(dy & 1)
                actual.append((x, y))
        elif cid == 7:                                 # ClosePath
            if actual:
                actual.append(actual[0])
                partes.append(actual)
                actual = []
    if actual:
        partes.append(actual)
    return partes


def decodificar(buf):
    """{capa: (extension, [(tipo, props, partes), ...])}. Tipos: 1 punto, 2 linea, 3 poligono."""
    capas = {}
    if not buf:
        return capas
    for f, v in _campos(buf):
        if f != 3:
            continue
        nombre, claves, valores, crudos, ext = None, [], [], [], 4096
        for g, w in _campos(v):
            if g == 1:
                nombre = w.decode('utf-8')
            elif g == 2:
                crudos.append(w)
            elif g == 3:
                claves.append(w.decode('utf-8'))
            elif g == 4:
                valores.append(_valor(w))
            elif g == 5:
                ext = w
        feats = []
        for w in crudos:
            tags, tipo, cmds = [], 0, []
            for g, z in _campos(w):
                if g == 2:
                    tags = _empaquetados(z)
                elif g == 3:
                    tipo = z
                elif g == 4:
                    cmds = _empaquetados(z)
            props = {claves[tags[k]]: valores[tags[k + 1]] for k in range(0, len(tags) - 1, 2)}
            feats.append((tipo, props, _geometria(cmds, tipo)))
        capas[nombre] = (ext, feats)
    return capas


def area_firmada(anillo):
    """Area con signo en coordenadas de tesela (y hacia abajo): > 0 = horario en
    pantalla, que en MVT v2 es un anillo EXTERIOR."""
    a = 0.0
    for k in range(len(anillo) - 1):
        x1, y1 = anillo[k]
        x2, y2 = anillo[k + 1]
        a += x1 * y2 - x2 * y1
    return a / 2.0


def tesela_de(lon, lat, z):
    """(x, y) fraccionarios de la tesela que contiene el punto."""
    n = 1 << z
    x = (lon + 180.0) / 360.0 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y
