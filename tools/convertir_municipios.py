#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convertir_municipios.py — del shapefile del Cabildo al fichero que lee la app.

    pip install pyshp pyproj
    python3 tools/convertir_municipios.py tools/datos/municipios-tenerife-2015.shp.zip

QUE HACE, Y POR QUE ESTA AQUI
  El shapefile municipal viene en UTM 28N (EPSG:32628) y en cinco ficheros
  dentro de un zip. Leerlo en cada control obligaria a tener pyshp y pyproj
  instalados, y a repetir la conversion de coordenadas 2.500 veces.

  Asi que se convierte UNA vez a lon/lat y se guarda comprimido:
      tools/datos/municipios-tenerife.json.gz
  Eso es lo que lee tools/municipio.py, que no necesita ninguna libreria.

  El zip original se queda al lado, sin tocar, para que se pueda repetir la
  conversion y comprobar que el derivado sale de el y no de otra parte.

LO QUE NO SE HACE: SIMPLIFICAR
  Ni un vertice. La geometria se usa para decidir de que lado de una raya cae
  un punto: simplificarla mueve la raya, que es exactamente lo que no puede
  pasar. Son 143.737 vertices y 802 kB comprimidos; cabe.
"""
import gzip, io, json, os, sys, zipfile, tempfile

def main():
    if len(sys.argv) < 2:
        print(__doc__); return 2
    zp = sys.argv[1]
    import shapefile
    from pyproj import Transformer
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(zp) as z:
        z.extractall(tmp)
    base = next(os.path.join(tmp, f[:-4]) for f in os.listdir(tmp) if f.endswith('.shp'))
    r = shapefile.Reader(base)
    campos = [f[0] for f in r.fields[1:]]
    if 'NOMBRE' not in campos:
        print('  el shapefile no trae el campo NOMBRE, trae: %s' % campos); return 1
    i = campos.index('NOMBRE')
    tr = Transformer.from_crs('EPSG:32628', 'EPSG:4326', always_xy=True)
    por, anillos, vertices = {}, 0, 0
    for sh, rec in zip(r.shapes(), r.records()):
        partes = list(sh.parts) + [len(sh.points)]
        for k in range(len(partes) - 1):
            pts = sh.points[partes[k]:partes[k + 1]]
            if len(pts) < 4:
                continue
            lon, lat = tr.transform([p[0] for p in pts], [p[1] for p in pts])
            por.setdefault(rec[i], []).append(
                [[round(x, 6), round(y, 6)] for x, y in zip(lon, lat)])
            anillos += 1
            vertices += len(pts)
    salida = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          'datos', 'municipios-tenerife.json.gz')
    with gzip.open(salida, 'wt', encoding='utf-8') as f:
        json.dump(por, f, separators=(',', ':'))
    print('  %d municipios · %d anillos · %d vertices' % (len(por), anillos, vertices))
    print('  escrito %s (%d kB)' % (salida, os.path.getsize(salida) // 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main())
