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
# Los nombres de lo que falla, no solo cuantos. El 11 de octubre el resumen
# dijo «1 bloque(s) con fallo» y hubo que buscarlo a mano entre 40 bloques:
# era una cifra de AUDITORIA-FINAL.md que coteja auditar_web.js.
fallidos=""
falla() { fallos=$((fallos+1)); fallidos="$fallidos $1"; echo "  *** $1: EN ROJO ***"; }
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
    [ "$rc" = 0 ] || falla "$nombre"
  fi
}
echo "════════ sintaxis ════════"
python3 tools/extract_js.py >/dev/null 2>&1
mal=0; for f in chk/*.js; do node --check "$f" >/dev/null 2>&1 || { mal=$((mal+1)); echo "  FALLO $f"; }; done
echo "  scripts en linea: $(ls chk/*.js 2>/dev/null | wc -l), con fallo: $mal"
# datos/titsa.js: la red de guaguas, fuera de index.html desde el 9 de octubre
# de 2026. extract_js.py solo saca los bloques en linea, asi que va aqui.
for f in sw.js enviar-notificacion.js datos/titsa.js; do
  if node --check "$f"; then echo "  $f ok"; else mal=$((mal+1)); fi
done
[ "$mal" != 0 ] && falla sintaxis
echo; echo "════════ red ════════"
salida=$(node tools/verificar_red.js 2>&1); rc=$?
printf '%s\n' "$salida" | grep -E "^\s+(OK|FALLO)|lineas |controles" | sed 's/·.*paradas ->.*//' | cut -c1-120
if reventado "$salida"; then printf '%s\n' "$salida" | tail -5; roto verificar_red.js
else [ "$rc" = 0 ] || falla verificar_red.js; fi
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
echo "════════ Norte o Sur de cada lugar, por el poligono de su municipio ════════"
# Desde el 13 de octubre de 2026: «Organiza tu día» deja elegir Norte, Sur o
# «Me da igual», y la zona de cada lugar la escribe tools/zonas_lugares.py. Un
# lugar dado de alta sin pasarlo no saldria ni en el Norte ni en el Sur.
control zonas_lugares.py python3 tools/zonas_lugares.py --comprobar
echo; echo "════════ las gasolineras del registro ════════"
control auditar_gasolineras.js node tools/auditar_gasolineras.js
echo "════════ cada gasolinera, contra el registro, campo a campo ════════"
control revisar_gasolineras.py python3 tools/revisar_gasolineras.py
echo "════════ los precios de las gasolineras (las mas baratas de cada municipio, y la de cada una) ════════"
control auditar_precios_gasolineras.py python3 tools/auditar_precios_gasolineras.py
echo "════════ el boton «la gasolinera mas barata cerca de mi», en los diez idiomas ════════"
control auditar_gas_cerca.js node tools/auditar_gas_cerca.js "$PUERTO"
echo; echo "════════ el municipio que dice cada ficha ════════"
control auditar_municipio.js node tools/auditar_municipio.js
echo; echo "════════ lo que se sale de la pantalla, y el popup ════════"
control auditar_desborde.js node tools/auditar_desborde.js "$PUERTO"
echo; echo "════════ las 212 fichas de gasolinera, en pantalla, en los diez idiomas ════════"
control verificar_fichas_app.js node tools/verificar_fichas_app.js "$PUERTO"
echo; echo "════════ texto de reserva en castellano ════════"
control auditar_reservas.py python3 tools/auditar_reservas.py
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
[ -n "$IDIOMAS" ] || { echo "  FALLO: no encuentro SUPPORTED_LANGS en index.html"; falla SUPPORTED_LANGS; }
# Con `| head -4` el estado que llegaba era el de head: este bloque no podia
# ponerse rojo, y un idioma sin fila en ESCRITURA reventaba en silencio.
for L in $IDIOMAS; do
  salida=$(node tools/auditar_idioma.js "$L" 2>&1); rc=$?
  printf '%s\n' "$salida" | head -4
  if reventado "$salida"; then roto "auditar_idioma.js $L"
  elif [ "$rc" != 0 ]; then falla "auditar_idioma.js $L"; fi
done
echo; echo "════════ castellano que se queda dentro de cada idioma, y frases que faltan ════════"
# Desde el 10 de octubre de 2026: palabras castellanas sueltas («fincas»,
# «monteverde», «Malpaís»), frases del castellano que la traduccion no tiene
# y fichas resumidas. Los nueve de una vez: lo aceptado «para todos» solo se
# puede dar por sobrante si se han mirado todos.
control castellano_suelto.js node tools/castellano_suelto.js
echo; echo "════════ palabras escritas sin sus letras (waehle, carre avec fleche) ════════"
control auditar_letras.js node tools/auditar_letras.js
echo; echo "════════ la frase diaria, en los diez idiomas ════════"
control auditar_frases.js node tools/auditar_frases.js
echo; echo "════════ filas que el codigo pide con tx() y no existen ════════"
# Desde el 12 de octubre de 2026: tx() devuelve '' sin avisar si falta la fila.
control auditar_claves_tx.js node tools/auditar_claves_tx.js
echo; echo "════════ etiquetas del globo ════════"
control auditar_etiquetas.js node tools/auditar_etiquetas.js
echo; echo "════════ base de conocimiento del asistente ════════"
control auditar_faq.js node tools/auditar_faq.js
echo; echo "════════ preguntas de prueba al asistente ════════"
salida=$(node tools/probar_faq.js 2>&1); rc=$?
printf '%s\n' "$salida" | tail -3
if reventado "$salida"; then roto probar_faq.js
else [ "$rc" = 0 ] || falla probar_faq.js; fi
echo; echo "════════ el asistente en un movil de verdad, en su idioma ════════"
control probar_movil.js node tools/probar_movil.js "$PUERTO"
echo; echo "════════ avisos de AEMET: el lector, con copias reales de AEMET ════════"
# Desde el 12 de octubre de 2026. La pildora de avisos estuvo meses sin salir
# nunca y nadie lo vio: «no hay avisos» y «no funciona» se pintaban igual.
control probar_avisos_aemet.py python3 tools/probar_avisos_aemet.py
echo; echo "════════ avisos de AEMET en la app, en los diez idiomas ════════"
control probar_avisos.js node tools/probar_avisos.js "$PUERTO"
echo; echo "════════ rutas: guaguas a hora fija y lo que se ve al usarlas, en los diez idiomas ════════"
# Desde el 12 de octubre de 2026. Ningun control pedia una ruta: de noche
# «A→B» decia que no habia guagua entre La Laguna y el Puerto de la Cruz, con
# la frase de la guagua del Teide, y varios textos salian en castellano.
control probar_rutas.js node tools/probar_rutas.js "$PUERTO"
echo; echo "════════ «Organiza tu día» entero, en los diez idiomas, con los tramos calculados ════════"
# Desde el 13 de octubre de 2026: el tiempo entre paradas era un rotulo fijo
# («En guagua ~25 min» para cualquier tramo) y varios titulos salian sin traducir.
control probar_organiza.js node tools/probar_organiza.js "$PUERTO"

echo "════════ erratas al transliterar al cirilico ════════"
control auditar_cirilico.py python3 tools/auditar_cirilico.py
echo; echo "════════ texto que se queda en el idioma de arranque ════════"
control auditar_arranque.js node tools/auditar_arranque.js "$PUERTO"
echo; echo "════════ texto que no cambia al cambiar de idioma ════════"
control auditar_sin_traducir.js node tools/auditar_sin_traducir.js "$PUERTO"
echo; echo "════════ lo que se ve en pantalla, en los diez idiomas (paneles y fichas) ════════"
control barrido_pantallas.js node tools/barrido_pantallas.js "$PUERTO"
echo; echo "════════ el tour de bienvenida, entero, en los diez idiomas y cuatro moviles ════════"
# Desde el 11 de octubre de 2026: el tour lo recorre de verdad, paso a paso.
# Sus textos estuvieron un mes en listas que ningun control leia.
control auditar_tour.js node tools/auditar_tour.js "$PUERTO"
echo
# Los rotos van PRIMERO y con su propio nombre: son los que no han mirado nada.
[ "$rotos" = 0 ] || echo "*** $rotos control(es) QUE NO SE PUDIERON EJECUTAR (pip install -r tools/requisitos.txt) ***"
[ "$fallos" = 0 ] || echo "*** $fallos bloque(s) con fallo:$fallidos ***"
[ "$fallos" = 0 ] && [ "$rotos" = 0 ] && echo "AUDITORIA EN VERDE"
exit $((fallos + rotos))
