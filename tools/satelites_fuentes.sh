#!/usr/bin/env bash
# Trae, en versiones fijas, las fuentes con las que tools/satelites_construir.js
# hace vendor/satellite.js (el motor SGP4 de los pasos de la Estacion Espacial
# y los satelites brillantes del panel «Cielo de Tenerife») y
# tools/sgp4_verificacion.json (los vectores con los que se comprueba).
#
#     bash tools/satelites_fuentes.sh [carpeta]        # por defecto /tmp/fuentes-satelites
#     node tools/satelites_construir.js [carpeta]
#
# Como tools/cielo_fuentes.sh: cada fuente clavada a un commit, y solo los
# ficheros que se usan (sparse checkout). Para actualizar el motor se cambia
# aqui su commit, se reconstruye y se mira el diff.
#
# QUE SE USA DE CADA UNA
#   satellite.js (MIT)                 el motor SGP4/SDP4 y las transformaciones
#     shashwatak/satellite-js 7.1.0    TEME/ECF, el Sol y la sombra de la Tierra:
#                                      src/ (sin wasm/), LICENSE.md, package.json
#   python-sgp4 (MIT)                  SGP4-VER.TLE y tcppver.out: los 33 casos
#     brandon-rhodes/python-sgp4       de verificacion oficiales de SGP4 (Vallado,
#                                      Crawford, Hujsak y Kelso, AIAA 2006-6753),
#                                      tal como los distribuye python-sgp4
set -eu
DEST=${1:-/tmp/fuentes-satelites}
mkdir -p "$DEST"

traer() {   # traer <carpeta> <repo> <commit> <ruta>...
  local dir="$DEST/$1" repo="$2" commit="$3"; shift 3
  if [ ! -d "$dir/.git" ]; then
    git init -q "$dir"
    git -C "$dir" remote add origin "https://github.com/$repo"
  fi
  git -C "$dir" sparse-checkout init --no-cone >/dev/null 2>&1 || true
  printf '%s\n' "$@" > "$dir/.git/info/sparse-checkout"
  git -C "$dir" fetch -q --depth 1 --filter=blob:none origin "$commit"
  git -C "$dir" checkout -q FETCH_HEAD
  echo "  $repo @ ${commit:0:10}"
}

echo "Bajando las fuentes de los satelites a $DEST"
traer satjs   shashwatak/satellite-js     582a72ecf9cb22fd3c210f1e497d8565517f1d6d \
  /src/ '!/src/wasm/' /LICENSE.md /package.json
traer pysgp4  brandon-rhodes/python-sgp4  8126f773923c2902719d45aab8bdb5cce86cf39d \
  /sgp4/SGP4-VER.TLE /sgp4/tcppver.out /LICENSE
echo "Listo. Ahora: node tools/satelites_construir.js $DEST"
