#!/usr/bin/env bash
# Auditoria completa. Levanta el servidor, pasa todo y termina.
#     bash tools/auditar.sh
set -u
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
node --check sw.js && echo "  sw.js ok"
node --check enviar-notificacion.js && echo "  enviar-notificacion.js ok"
[ "$mal" != 0 ] && fallos=$((fallos+1))
echo; echo "════════ red ════════"
node tools/verificar_red.js | grep -E "^\s+(OK|FALLO)|lineas |controles" | sed 's/·.*paradas ->.*//' | cut -c1-120 || fallos=$((fallos+1))
echo; echo "════════ datos ════════"
node tools/auditar_datos.js || fallos=$((fallos+1))
echo; echo "════════ seguridad y codificacion ════════"
python3 tools/auditar_seguridad.py || fallos=$((fallos+1))
echo; echo "════════ regresion XSS ════════"
node tools/auditar_xss.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ service worker · mapa sin conexion ════════"
node tools/auditar_sw.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ mapa sin conexion ════════"
node tools/auditar_mapa.js "$PUERTO" || fallos=$((fallos+1))
echo; echo "════════ idiomas, arranque y rendimiento ════════"
node tools/auditar_web.js "$PUERTO" || fallos=$((fallos+1))
echo
[ "$fallos" = 0 ] && echo "AUDITORIA EN VERDE" || echo "*** $fallos bloque(s) con fallo ***"
exit $fallos
