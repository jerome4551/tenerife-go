#!/usr/bin/env bash
# Trae las fuentes de Google al proyecto. Se ejecuta a mano, cuando cambie
# la familia o los pesos; no hace falta en cada despliegue.
#
#     bash tools/bajar_fuentes.sh
#
# POR QUE ESTAN AQUI Y NO SE PIDEN A GOOGLE:
#   1. El <link> a fonts.googleapis.com BLOQUEA EL PRIMER PINTADO. En un
#      movil son DNS + TLS + la hoja + los woff2 desde otro dominio, antes
#      de que se vea nada.
#   2. La app es offline-first y las fuentes NO lo eran: sin cobertura, el
#      turista veia la app con la tipografia del sistema.
#   3. Es una peticion menos a un tercero desde el navegador del usuario.
#
# Se piden con User-Agent de movil moderno para que Google sirva woff2.
# Los rangos incluyen cirilico, que hace falta para el bulgaro.
set -eu
cd "$(dirname "$0")/.."
DEST=vendor/fuentes
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
URL='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap'

mkdir -p "$DEST"
tmp=$(mktemp)
curl -sS -A "$UA" "$URL" -o "$tmp"

# Cada woff2 se guarda con un nombre que se lee: familia-peso-rango.woff2
python3 - "$tmp" "$DEST" <<'PY'
import io, os, re, subprocess, sys
css_txt, dest = io.open(sys.argv[1], encoding='utf-8').read(), sys.argv[2]
bloques = re.findall(r'/\*\s*([a-z-]+)\s*\*/\s*@font-face\s*\{[\s\S]*?\}', css_txt)
partes, i, n = [], 0, 0
for m in re.finditer(r'(/\*\s*([a-z-]+)\s*\*/\s*)?@font-face\s*\{([\s\S]*?)\}', css_txt):
    rango, cuerpo = (m.group(2) or 'x'), m.group(3)
    fam = re.search(r"font-family:\s*'([^']+)'", cuerpo).group(1)
    peso = re.search(r'font-weight:\s*(\d+)', cuerpo).group(1)
    url = re.search(r'url\((https://[^)]+)\)', cuerpo).group(1)
    nom = '%s-%s-%s.woff2' % (fam.lower().replace(' ', ''), peso, rango)
    ruta = os.path.join(dest, nom)
    subprocess.run(['curl', '-sS', url, '-o', ruta], check=True)
    n += 1
    partes.append('@font-face {%s}' % cuerpo.replace(url, 'fuentes/' + nom))
io.open(os.path.join(dest, '..', 'fuentes.css'), 'w', encoding='utf-8').write(
    '/* Generado por tools/bajar_fuentes.sh — no editar a mano. */\n' + '\n'.join(partes) + '\n')
print('%d ficheros woff2' % n)
PY
du -sh "$DEST" vendor/fuentes.css
