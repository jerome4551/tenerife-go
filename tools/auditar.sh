#!/usr/bin/env bash
# Auditoria completa. Levanta el servidor, pasa todo y termina.
#     bash tools/auditar.sh
set -u
# Cada control suma a $fallos con su PROPIO estado. Si hay que recortar la
# salida, se guarda primero y se filtra despues: "herramienta | tail" devuelve
# el estado de tail, y entonces el control no puede ponerse rojo nunca.
cd "$(dirname "$0")/.."
PUERTO=${1:-8766}
python3 -m http.server "$PUERTO" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 2
fallos=0
rotos=0
# UN CONTROL QUE NO ARRANCA NO ES UN CONTROL QUE ENCUENTRA ALGO.
# Los dos salen con estado != 0, asi que si se cuentan en el mismo sitio un
# `pip install` que falta se lee exactamente igual que un hallazgo. Paso: en un
# contenedor nuevo faltaban pmtiles y mapbox_vector_tile, auditar_ubicacion.py y
# auditar_en_el_mar.py reventaban con un Traceback, y el resumen dijo «3
# bloque(s) con fallo» durante dos dias como si hubiera tres cosas que mirar.
# Ahora se cuentan aparte y se dicen aparte. Un control roto es PEOR que uno en
# rojo: el rojo enseña algo, el roto no enseña nada y lo parece.
# Lo que delata a un control que no ha llegado a mirar nada.
reventado() {
  printf '%s' "$1" | grep -qE "^Traceback \(most recent call last\)|^ModuleNotFoundError|Cannot find module|^ +at .*:[0-9]+:[0-9]+\)?$"
}
roto() { echo "  *** $1 NO SE PUDO EJECUTAR: le falta algo. No es un hallazgo. ***"; rotos=$((rotos+1)); }
control() {
  local nombre="$1"; shift
  local salida rc
  salida=$("$@" 2>&1); rc=$?
  printf '%s\n' "$salida"
  if reventado "$salida"; then roto "$nombre"; else
    [ "$rc" = 0 ] || fallos=$((fallos+1))
  fi
}
echo "════════ sintaxis ════════"
python3 tools/extract_js.py >/dev/null 2>&1
mal=0; for f in chk/*.js; do node --check "$f" >/dev/null 2>&1 || { mal=$((mal+1)); echo "  FALLO $f"; }; done
echo "  scripts en linea: $(ls chk/*.js 2>/dev/null | wc -l), con fallo: $mal"
for f in sw.js enviar-notificacion.js; do
  if node --check "$f"; then echo "  $f ok"; else mal=$((mal+1)); fi
done
[ "$mal" != 0 ] && fallos=$((fallos+1))
echo; echo "════════ red ════════"
salida=$(node tools/verificar_red.js 2>&1); rc=$?
printf '%s\n' "$salida" | grep -E "^\s+(OK|FALLO)|lineas |controles" | sed 's/·.*paradas ->.*//' | cut -c1-120
if reventado "$salida"; then printf '%s\n' "$salida" | tail -5; roto verificar_red.js
else [ "$rc" = 0 ] || fallos=$((fallos+1)); fi
echo; echo "════════ datos ════════"
control auditar_datos.js node tools/auditar_datos.js
echo; echo "════════ seguridad y codificacion ════════"
control auditar_seguridad.py python3 tools/auditar_seguridad.py
echo; echo "════════ regresion XSS ════════"
control auditar_xss.js node tools/auditar_xss.js "$PUERTO"
echo; echo "════════ service worker · mapa sin conexion ════════"
control auditar_sw.js node tools/auditar_sw.js "$PUERTO"
echo; echo "════════ ubicacion ════════"
control auditar_ubicacion.py python3 tools/auditar_ubicacion.py
echo; echo "════════ lugares en el mar ════════"
control auditar_en_el_mar.py python3 tools/auditar_en_el_mar.py

# Inventario, no puerta: lista lo impreciso, no lo suspende.
echo; echo "════════ coordenadas provisionales (informativo) ════════"
python3 tools/auditar_redondeo.py
echo; echo "════════ el municipio, contra el poligono del Cabildo ════════"
control municipio.py python3 tools/municipio.py
control municipio.py python3 tools/municipio.py --calibrar
echo; echo "════════ las gasolineras del registro ════════"
control auditar_gasolineras.js node tools/auditar_gasolineras.js
echo; echo "════════ el municipio que dice cada ficha ════════"
control auditar_municipio.js node tools/auditar_municipio.js
echo; echo "════════ lo que se sale de la pantalla, y el popup ════════"
control auditar_desborde.js node tools/auditar_desborde.js "$PUERTO"
echo; echo "════════ mapa sin conexion ════════"
control auditar_mapa.js node tools/auditar_mapa.js "$PUERTO"
echo; echo "════════ idiomas, arranque y rendimiento ════════"
control auditar_web.js node tools/auditar_web.js "$PUERTO"
echo; echo "════════ filas de idioma en todo el fuente ════════"
control barrido_idiomas.js node tools/barrido_idiomas.js bg
echo; echo "════════ el polaco por bloques, contra pl.json ════════"
control auditar_fuente_pl.js node tools/auditar_fuente_pl.js
echo; echo "════════ los idiomas que viven fuera de index.html ════════"
control auditar_idiomas_fuera.js node tools/auditar_idiomas_fuera.js "$PUERTO"
echo; echo "════════ cada idioma, uno por uno ════════"
# La lista sale del fuente, no escrita aqui: a mano se quedo en nueve y el
# idioma decimo no pasaba por este bloque.
IDIOMAS=$(sed -n "s/.*SUPPORTED_LANGS *= *\[\([^]]*\)\].*/\1/p" index.html | head -1 | tr -d "'\" " | tr ',' ' ')
[ -n "$IDIOMAS" ] || { echo "  FALLO: no encuentro SUPPORTED_LANGS en index.html"; fallos=$((fallos+1)); }
# Con `| head -4` el estado que llegaba era el de head: este bloque no podia
# ponerse rojo, y un idioma sin fila en ESCRITURA reventaba en silencio.
for L in $IDIOMAS; do
  salida=$(node tools/auditar_idioma.js "$L" 2>&1); rc=$?
  printf '%s\n' "$salida" | head -4
  if reventado "$salida"; then roto "auditar_idioma.js $L"
  elif [ "$rc" != 0 ]; then echo "  FALLO en $L"; fallos=$((fallos+1)); fi
done
echo; echo "════════ la frase diaria, en los diez idiomas ════════"
control auditar_frases.js node tools/auditar_frases.js
echo; echo "════════ etiquetas del globo ════════"
control auditar_etiquetas.js node tools/auditar_etiquetas.js
echo; echo "════════ base de conocimiento del asistente ════════"
control auditar_faq.js node tools/auditar_faq.js
echo; echo "════════ preguntas de prueba al asistente ════════"
salida=$(node tools/probar_faq.js 2>&1); rc=$?
printf '%s\n' "$salida" | tail -3
if reventado "$salida"; then roto probar_faq.js
else [ "$rc" = 0 ] || fallos=$((fallos+1)); fi

echo "════════ erratas al transliterar al cirilico ════════"
control auditar_cirilico.py python3 tools/auditar_cirilico.py
echo; echo "════════ texto que se queda en el idioma de arranque ════════"
control auditar_arranque.js node tools/auditar_arranque.js "$PUERTO"
echo; echo "════════ texto que no cambia al cambiar de idioma ════════"
control auditar_sin_traducir.js node tools/auditar_sin_traducir.js "$PUERTO"
echo
# Los rotos van PRIMERO y con su propio nombre: son los que no han mirado nada.
[ "$rotos" = 0 ] || echo "*** $rotos control(es) QUE NO SE PUDIERON EJECUTAR (pip install -r tools/requisitos.txt) ***"
[ "$fallos" = 0 ] || echo "*** $fallos bloque(s) con fallo ***"
[ "$fallos" = 0 ] && [ "$rotos" = 0 ] && echo "AUDITORIA EN VERDE"
exit $((fallos + rotos))
