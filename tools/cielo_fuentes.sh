#!/usr/bin/env bash
# Trae, en versiones fijas, las fuentes con las que tools/cielo_construir.js
# hace datos/cielo.json (el catalogo del panel «Cielo de Tenerife»).
#
#     bash tools/cielo_fuentes.sh [carpeta]        # por defecto /tmp/fuentes-cielo
#     node tools/cielo_construir.js [carpeta]
#
# POR QUE VERSIONES FIJAS. Un catalogo que se regenera contra «lo ultimo» de
# cinco repositorios cambia sin que nadie haya tocado un dato, y entonces el
# diff de datos/cielo.json deja de decir nada. Cada fuente va clavada a un
# commit; para actualizar una, se cambia aqui su commit y se mira el diff.
#
# Solo se bajan los ficheros que se usan (sparse checkout): el repositorio de
# Stellarium entero son gigas.
#
# QUE SE USA DE CADA UNA
#   HYG-Database v4.1 (CC BY-SA 4.0)   estrellas: posicion, brillo, color,
#                                      nombre IAU, Bayer, distancia
#   OpenNGC (CC BY-SA 4.0)             cielo profundo: Messier, Caldwell,
#                                      tipo, posicion, tamano, nombres comunes
#   d3-celestial (BSD-3)               lineas de las constelaciones, sus
#                                      limites (para saber cuanto sale), la Via
#                                      Lactea y las magnitudes visuales del SAC
#                                      y del SEDS para el cielo profundo
#   Stellarium (GPL-2.0+)              variables (extracto del GCVS 5.1) y los
#                                      nombres en los diez idiomas (.po)
#   Yale Bright Star Catalogue 5       estrellas dobles: separacion, diferencia
#     (JSON de brettonw, MIT)          de brillo y notas de cada sistema
#   Astronomy Engine (MIT)             el calculo: va en vendor/ tal cual
set -eu
DEST=${1:-/tmp/fuentes-cielo}
mkdir -p "$DEST"

traer() {   # traer <carpeta> <repo> <commit> <ruta>...
  local dir="$DEST/$1" repo="$2" commit="$3"; shift 3
  if [ ! -d "$dir/.git" ]; then
    git init -q "$dir"
    git -C "$dir" remote add origin "https://github.com/$repo"
  fi
  git -C "$dir" sparse-checkout init --no-cone >/dev/null 2>&1 || true
  printf '%s\n' "$@" > "$dir/.git/info/sparse-checkout"
  # --filter=blob:none: sin el, el commit de Stellarium baja medio giga de
  # ficheros que no se usan; con el, solo los de la lista de arriba.
  git -C "$dir" fetch -q --depth 1 --filter=blob:none origin "$commit"
  git -C "$dir" checkout -q FETCH_HEAD
  echo "  $repo @ ${commit:0:10}"
}

echo "Bajando fuentes del cielo a $DEST"
traer hyg      astronexus/HYG-Database   c7f7f883fe678cc7680169a50ccd7dcc49b060ce \
  /hyg/CURRENT/hygdata_v41.csv /hyg/CURRENT/LICENSE /hyg/version-info.md
traer openngc  mattiaverga/OpenNGC       4e2398a263de663d83f7b86be80c368c34335764 \
  /database_files/NGC.csv /database_files/addendum.csv /LICENSES/
traer d3c      ofrohn/d3-celestial       7e720a3de062059d4c5400a379146a601d9010e0 \
  /data/constellations.json /data/constellations.lines.json /data/constellations.bounds.json \
  /data/mw.json /data/messier.json /data/dsos.14.json /data/starnames.json /LICENSE
traer stel     Stellarium/stellarium     8184399cd363a5fea10e5fb7703a4687752812ae \
  /stars/hip_gaia3/wds_hip_part.dat /stars/hip_gaia3/gcvs.cat /stars/hip_gaia3/name.fab \
  /skycultures/modern/index.json /COPYING /plugins/MeteorShowers/resources/MeteorShowers.json \
  /po/stellarium-sky/es.po /po/stellarium-sky/fr.po /po/stellarium-sky/de.po \
  /po/stellarium-sky/it.po /po/stellarium-sky/nl.po /po/stellarium-sky/zh_CN.po \
  /po/stellarium-sky/zh_TW.po /po/stellarium-sky/bg.po /po/stellarium-sky/pl.po \
  /po/stellarium-skycultures/es.po /po/stellarium-skycultures/fr.po /po/stellarium-skycultures/de.po \
  /po/stellarium-skycultures/it.po /po/stellarium-skycultures/nl.po /po/stellarium-skycultures/zh_CN.po \
  /po/stellarium-skycultures/zh_TW.po /po/stellarium-skycultures/bg.po /po/stellarium-skycultures/pl.po \
  /po/stellarium/es.po /po/stellarium/fr.po /po/stellarium/de.po /po/stellarium/it.po \
  /po/stellarium/nl.po /po/stellarium/zh_CN.po /po/stellarium/zh_TW.po /po/stellarium/bg.po /po/stellarium/pl.po
traer astro    cosinekitty/astronomy     865d3da7d8112bbc7911238052c6af4aaf877181 \
  /source/js/astronomy.browser.min.js /source/js/astronomy.js /LICENSE
# El Bright Star Catalogue (Yale, 5.a ed., 1991) en JSON: de ahi salen la
# separacion y la diferencia de brillo de las estrellas dobles, con sus notas.
traer bsc      brettonw/YaleBrightStarCatalog abffb3b7223ae37e879b0a3ff5b49ad06aed5576 \
  /bsc5-all.json /LICENSE
echo "Hecho."
