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
echo "════════ sintaxis ════════"
python3 tools/extract_js.py >/dev/null 2>&1
mal=0; for f in chk/*.js; do node --check "$f" >/dev/null 2>&1 || { mal=$((mal+1)); echo "  FALLO $f"; }; done
echo "  scripts en linea: $(ls chk/*.js 2>/dev/null | wc -l), con fallo: $mal"
for f in sw.js enviar-notificacion.js; do
  if node --check "$f"; then echo "  $f ok"; else mal=$((mal+1)); fi
done
[ "$mal" != 0 ] && fallos=$((fallos+1))
echo; echo "════════ red ════════"
salida=$(node tools/verificar_red.js); rc=$?
printf '%s\n' "$salida" | grep -E "^\s+(OK|FALLO)|lineas |controles" | sed 's/·.*paradas ->.*//' | cut -c1-120
[ "$rc" = 0 ] || fallos=$((fallos+1))
echo; echo "════════ datos ════════"
node tools/auditar_datos.js || fallos=$((fallos+1))
echo; echo "════════ seguridad y codificacion ════════"
python3 tools/auditar_seguridad.py || fallos=$((fallos+1))
echo; echo "════════ regresion XSS ════════"
node tools/auditar_xss.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ service worker · mapa sin conexion ════════"
node tools/auditar_sw.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ ubicacion ════════"
python3 tools/auditar_ubicacion.py || fallos=$((fallos+1))
echo; echo "════════ lugares en el mar ════════"
python3 tools/auditar_en_el_mar.py || fallos=$((fallos+1))
echo; echo "════════ mapa sin conexion ════════"
node tools/auditar_mapa.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ idiomas, arranque y rendimiento ════════"
node tools/auditar_web.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ filas de idioma en todo el fuente ════════"
node tools/barrido_idiomas.js bg || fallos=$((fallos+1))
echo; echo "════════ los idiomas que viven fuera de index.html ════════"
node tools/auditar_idiomas_fuera.js "$PUERTO" || fallos=$((fallos+1))
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
  [ "$rc" = 0 ] || { echo "  FALLO en $L"; fallos=$((fallos+1)); }
done
echo; echo "════════ etiquetas del globo ════════"
node tools/auditar_etiquetas.js || fallos=$((fallos+1))
echo; echo "════════ base de conocimiento del asistente ════════"
node tools/auditar_faq.js || fallos=$((fallos+1))
echo; echo "════════ preguntas de prueba al asistente ════════"
salida=$(node tools/probar_faq.js); rc=$?
printf '%s\n' "$salida" | tail -3
[ "$rc" = 0 ] || fallos=$((fallos+1))

echo "════════ erratas al transliterar al cirilico ════════"
python3 tools/auditar_cirilico.py || fallos=$((fallos+1))
echo; echo "════════ texto que se queda en el idioma de arranque ════════"
node tools/auditar_arranque.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ texto que no cambia al cambiar de idioma ════════"
node tools/auditar_sin_traducir.js "$PUERTO" || fallos=$((fallos+1))
echo
[ "$fallos" = 0 ] && echo "AUDITORIA EN VERDE" || echo "*** $fallos bloque(s) con fallo ***"
exit $fallos
