#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mete la politica de privacidad de idiomas/privacidad/*.json en index.html.

La politica es texto legal: tiene que decir lo que la app hace, y lo que la
app hace cambia. Por eso vive en diez ficheros revisables y no suelta dentro
de 37.000 lineas de HTML. Este script la vuelca; si un idioma no tiene todas
las claves, no escribe nada.
"""
import json, os, sys, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR  = os.path.join(RAIZ, 'idiomas', 'privacidad')
LANGS = ['es','en','fr','de','it','nl','zh','zht','bg','pl']

tab = {}
for L in LANGS:
    f = os.path.join(DIR, L + '.json')
    if not os.path.exists(f):
        print('falta ' + f); sys.exit(1)
    tab[L] = json.load(open(f, encoding='utf-8'))

claves = list(tab['es'])
for L in LANGS:
    fal = [k for k in claves if not str(tab[L].get(k, '')).strip()]
    if fal: print(f'{L}: sin texto en {fal}'); sys.exit(1)
    ext = [k for k in tab[L] if k not in claves]
    if ext: print(f'{L}: claves que el castellano no tiene: {ext}'); sys.exit(1)

# ── la tabla para UI_TX ───────────────────────────────────────────────
filas = []
for k in claves:
    fila = ', '.join(f'"{L}":{json.dumps(tab[L][k], ensure_ascii=False)}' for L in LANGS)
    filas.append(f'  "{k}": {{{fila}}}')
bloque = ('/* La politica de privacidad, en los diez idiomas.\n'
          '   El texto vive en idiomas/privacidad/<lang>.json y lo vuelca aqui\n'
          '   tools/generar_privacidad.py. Es texto legal y tiene que decir lo que\n'
          '   la app hace de verdad: editarlo suelto dentro de 37.000 lineas de HTML\n'
          '   era como se quedo diciendo que no habia publicidad ni terceros. */\n'
          'Object.assign(UI_TX, {\n' + ',\n'.join(filas) + '\n});\n')

p = os.path.join(RAIZ, 'index.html')
s = open(p, encoding='utf-8').read()

ini = s.find('Object.assign(UI_TX, {\n  "ppCerrar"')
if ini < 0: print('no encuentro el bloque pp* de UI_TX'); sys.exit(1)
fin = s.find('\n});\n', ini) + len('\n});\n')
s = s[:ini] + bloque + s[fin:]

# ── el marcado ────────────────────────────────────────────────────────
def t(k, tag='span', extra=''):
    return f'<{tag} data-tx="{k}"{extra}>{tab["es"][k]}</{tag}>'

MAIL = '<a href="mailto:tenerife.go.app@gmail.com" data-sin-traducir="direccion de correo">tenerife.go.app@gmail.com</a>'
def h3(n, k):
    # el numero del apartado va fuera del texto traducido: renumerar un
    # apartado no puede obligar a retocar diez traducciones
    return (f'    <h3><span data-sin-traducir="numero de apartado">{n}.</span> '
            f'<span data-tx="{k}">{tab["es"][k]}</span></h3>')
def li(lk, tk):
    return f'      <li><strong data-tx="{lk}">{tab["es"][lk]}</strong> {t(tk)}</li>'
def terc(nombre, url, k, nota=''):
    a = f'<a href="{url}" target="_blank" rel="noopener" data-sin-traducir="nombre del proveedor">{nombre}</a>'
    return f'      <li>{a} — {t(k)}</li>'

m = []
m.append('<div id="privacy-panel" role="dialog" data-tx-aria="ariaPrivacidad" aria-label="Política de privacidad" aria-modal="true">')
m.append('  <div class="pp-sheet">')
m.append(f'    <button class="pp-close" onclick="closePrivacyPanel()" data-tx-aria="ariaCerrar" aria-label="Cerrar" data-tx="ppCerrar">{tab["es"]["ppCerrar"]}</button>')
m.append(f'    <h2 data-tx="ppTitulo">{tab["es"]["ppTitulo"]}</h2>')
m.append(f'    <p><strong data-sin-traducir="marca">Tenerife Go</strong> {t("ppActualizado")}</p>')
m.append('')
m.append(h3(1, 'ppRespTitulo'))
m.append(f'    <p><span data-sin-traducir="nombre del responsable">Jérôme Bourgeois ·</span> {MAIL} {t("ppRespDir")}</p>')
m.append('')
m.append(h3(2, 'ppDatosTitulo'))
m.append('    <ul>')
m.append(li('ppDatosGeo', 'ppDatosGeoTxt'))
m.append(f'      <li><strong data-tx="ppDatosCuenta">{tab["es"]["ppDatosCuenta"]}</strong> {t("ppDatosCuentaTxt")} '
         '<a href="https://supabase.com/privacy" target="_blank" rel="noopener" data-sin-traducir="nombre del proveedor">Supabase</a>'
         f'{t("ppDatosRls")}</li>')
m.append(li('ppDatosFav', 'ppDatosFavTxt'))
m.append(li('ppDatosPref', 'ppDatosPrefTxt'))
m.append(li('ppDatosPush', 'ppDatosPushTxt'))
m.append(li('ppDatosStats', 'ppDatosStatsTxt'))
m.append('    </ul>')
m.append('')
m.append(h3(3, 'ppStatsTitulo'))
for k in ('ppStatsAntes', 'ppStatsSi', 'ppStatsConsent', 'ppStatsGuarda'):
    m.append(f'    <p data-tx="{k}">{tab["es"][k]}</p>')
m.append('')
m.append(h3(4, 'ppPubTitulo'))
for k in ('ppPubQue', 'ppPubNoDatos'):
    m.append(f'    <p data-tx="{k}">{tab["es"][k]}</p>')
m.append('')
m.append(h3(5, 'ppTercTitulo'))
m.append(f'    <p data-tx="ppTercIntro">{tab["es"]["ppTercIntro"]}</p>')
m.append('    <ul>')
m.append(terc('Supabase', 'https://supabase.com/privacy', 'ppTercSupabase'))
m.append(terc('OpenStreetMap · ArcGIS', 'https://osmfoundation.org/wiki/Privacy_Policy', 'ppTercMapas'))
m.append(terc('OSRM', 'https://project-osrm.org/', 'ppTercOsrm'))
m.append(terc('Nominatim', 'https://osmfoundation.org/wiki/Privacy_Policy', 'ppTercNominatim'))
m.append(terc('Open-Meteo', 'https://open-meteo.com/en/terms', 'ppTercMeteo'))
m.append(terc('AEMET', 'https://www.aemet.es/es/nota_legal', 'ppTercAemet'))
m.append(terc('Wikipedia · Wikimedia', 'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy', 'ppTercWiki'))
m.append(terc('Google Fonts · jsDelivr', 'https://policies.google.com/privacy', 'ppTercCdn'))
m.append(terc('Google Analytics', 'https://policies.google.com/privacy', 'ppTercGa'))
m.append('    </ul>')
m.append(f'    <p data-tx="ppTercNoVenta">{tab["es"]["ppTercNoVenta"]}</p>')
m.append('')
m.append(h3(6, 'ppBaseTitulo'))
m.append('    <ul>')
m.append(f'      <li>{t("ppBaseLi1a")}<em data-tx="ppBaseInteres">{tab["es"]["ppBaseInteres"]}</em> / '
         f'<em data-tx="ppBaseContrato">{tab["es"]["ppBaseContrato"]}</em>).</li>')
m.append(f'      <li data-tx="ppBaseLi2">{tab["es"]["ppBaseLi2"]}</li>')
m.append('    </ul>')
m.append('')
m.append(h3(7, 'ppConsTitulo'))
for k in ('ppConsCuenta', 'ppConsDispositivo'):
    m.append(f'    <p data-tx="{k}">{tab["es"][k]}</p>')
m.append('')
m.append(h3(8, 'ppDerTitulo'))
m.append(f'    <p>{t("ppDerTxt")} {MAIL}{t("ppDerReclamar")} '
         '<a href="https://www.aepd.es" target="_blank" rel="noopener" data-sin-traducir="nombre oficial del organismo">AEPD</a>.</p>')
m.append('')
m.append(h3(9, 'ppSegTitulo'))
m.append(f'    <p data-tx="ppSegTxt">{tab["es"]["ppSegTxt"]}</p>')
m.append('')
m.append(h3(10, 'ppContTitulo'))
m.append(f'    <p>{MAIL}</p>')
m.append('  </div>')
m.append('</div>')
marcado = '\n'.join(m)

i2 = s.find('<div id="privacy-panel"')
if i2 < 0: print('no encuentro el panel de privacidad'); sys.exit(1)
f2 = s.find('\n</div>\n', s.find('</div>\n  </div>', i2)) + len('\n</div>\n')
# mas robusto: cortar hasta el comentario del pie que va justo despues
f2 = s.find('<!-- Enlace pie de privacidad -->', i2)
if f2 < 0: print('no encuentro el final del panel'); sys.exit(1)
s = s[:i2] + marcado + '\n\n' + s[f2:]

open(p, 'w', encoding='utf-8').write(s)
print(f'{len(claves)} claves x {len(LANGS)} idiomas = {len(claves)*len(LANGS)} textos')
