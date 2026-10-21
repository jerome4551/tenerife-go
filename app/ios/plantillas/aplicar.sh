#!/usr/bin/env bash
# aplicar.sh — pone en el proyecto de Xcode que genera «npx cap add ios» lo
# que Tenerife Go necesita y Capacitor no sabe: los permisos con sus frases en
# los diez idiomas, el manifiesto de privacidad, el icono de 1024 y el arranque.
# Se pasa en un Mac, desde app/, DESPUES de «npx cap add ios» (y se puede
# repetir: cada paso deja lo mismo). Comprobado en seco (sin Mac) el 21 de
# octubre de 2026: si un paso no encuentra lo que espera, lo dice y sigue.
#
#     cd app && npm install && npx cap add ios && bash ios/plantillas/aplicar.sh
set -u
cd "$(dirname "$0")/../.."          # app/
P=ios/plantillas
IOS=ios/App/App
PB=/usr/libexec/PlistBuddy
avisos=0
aviso() { echo "  *** $1 ***"; avisos=$((avisos+1)); }

[ -f "$IOS/Info.plist" ] || { echo "No encuentro $IOS/Info.plist: antes, «npx cap add ios»"; exit 1; }
[ -x "$PB" ] || { echo "No encuentro PlistBuddy ($PB): esto se pasa en un Mac"; exit 1; }

echo "== 1. Info.plist: los permisos, los idiomas, el cifrado exento, las orientaciones"
# Merge no pisa las claves que ya estan: las que trae la plantilla de
# Capacitor y aqui se redefinen se quitan antes.
for k in CFBundleDevelopmentRegion CFBundleLocalizations UISupportedInterfaceOrientations "UISupportedInterfaceOrientations~ipad" \
         NSLocationWhenInUseUsageDescription NSMotionUsageDescription NSCameraUsageDescription ITSAppUsesNonExemptEncryption; do
  "$PB" -c "Delete :$k" "$IOS/Info.plist" >/dev/null 2>&1 || true
done
"$PB" -c "Merge $P/Info.plist.fragmento.plist" "$IOS/Info.plist" && echo "  Info.plist: fragmento aplicado" || aviso "no se pudo aplicar el fragmento al Info.plist"
for k in NSLocationWhenInUseUsageDescription NSMotionUsageDescription NSCameraUsageDescription CFBundleLocalizations; do
  "$PB" -c "Print :$k" "$IOS/Info.plist" >/dev/null 2>&1 && echo "  $k: ok" || aviso "$k no esta en el Info.plist"
done

echo "== 2. Las frases de los permisos en los diez idiomas (InfoPlist.strings) y el manifiesto de privacidad"
n=0
for d in "$P"/*.lproj; do
  [ -d "$d" ] || continue
  mkdir -p "$IOS/$(basename "$d")" && cp "$d/InfoPlist.strings" "$IOS/$(basename "$d")/" && n=$((n+1))
done
echo "  $n carpetas .lproj copiadas a $IOS/"
cp "$P/PrivacyInfo.xcprivacy" "$IOS/PrivacyInfo.xcprivacy" && echo "  PrivacyInfo.xcprivacy copiado"

echo "== 3. El icono (1024, sin transparencia) y el arranque (2732x2732)"
ICONS=$(ls "$IOS"/Assets.xcassets/AppIcon.appiconset/*.png 2>/dev/null | wc -l | tr -d ' ')
if [ "$ICONS" = 1 ]; then
  cp "$P/AppIcon-1024.png" "$(ls "$IOS"/Assets.xcassets/AppIcon.appiconset/*.png)" && echo "  icono puesto"
else
  aviso "la plantilla trae $ICONS png en AppIcon.appiconset (esperaba 1): poner $P/AppIcon-1024.png a mano en Xcode (AppIcon, 1024x1024)"
fi
SPL=0
for f in "$IOS"/Assets.xcassets/Splash.imageset/*.png; do
  [ -f "$f" ] || continue
  cp "$P/Splash-2732.png" "$f" && SPL=$((SPL+1))
done
[ "$SPL" -gt 0 ] && echo "  arranque puesto ($SPL ficheros de Splash.imageset)" || aviso "no encuentro Splash.imageset: poner $P/Splash-2732.png a mano en Xcode (Splash)"

echo "== 4. Meter los .lproj y PrivacyInfo.xcprivacy en el proyecto"
if command -v bundle >/dev/null 2>&1 && bundle exec ruby -e 'require "xcodeproj"' >/dev/null 2>&1; then
  bundle exec ruby "$P/incluir.rb" || aviso "incluir.rb no pudo meter los ficheros en el proyecto"
else
  echo "  (sin la gema xcodeproj -viene con fastlane: bundle install-: hacerlo en Xcode)"
  echo "  · Si los .lproj y PrivacyInfo.xcprivacy no salen en el navegador del proyecto: File > Add Files to «App»… (marcar el target App)."
  echo "  · Project > Info > Localizations: que esten los diez idiomas."
fi
echo "== 5. Lo que queda en Xcode (o lo hace el workflow, sin Mac)"
echo "  · Target App > General: Team, el Bundle Identifier de capacitor.config.json, Minimum Deployments iOS 15.0."
echo "  · Product > Archive, y en el organizador «Generate Privacy Report»: tiene que decir lo mismo que PrivacyInfo.xcprivacy."
[ "$avisos" = 0 ] && echo "hecho" || echo "hecho, con $avisos aviso(s) arriba"
