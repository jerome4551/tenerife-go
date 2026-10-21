#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La politica de privacidad, de idiomas/privacidad/*.json a dos sitios en la
misma pasada:

  · index.html: las filas pp* de UI_TX y el panel (#privacy-panel), en
    castellano y con data-tx, que la app traduce al vuelo;
  · privacidad.html: la pagina publica que pide Google Play
    (LANZAMIENTO-PLAY.md 1.3, 16 de octubre de 2026), con los diez idiomas
    enteros y legibles sin JavaScript (tools/pagina_fija.py).

Los dos salen de la misma funcion, cuerpo(), asi que no pueden decir cosas
distintas.

La politica es texto legal: tiene que decir lo que la app hace, y lo que la
app hace cambia. Por eso vive en diez ficheros revisables y no suelta dentro
de 37.000 lineas de HTML. Si un idioma no tiene todas las claves, no escribe
nada.

    python3 tools/generar_privacidad.py              escribe los dos
    python3 tools/generar_privacidad.py --comprobar  solo comprueba que esten
                                                     al dia (auditar.sh)
"""
import html, json, os, sys, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR  = os.path.join(RAIZ, 'idiomas', 'privacidad')
LANGS = ['es','en','fr','de','it','nl','zh','zht','bg','pl']
COMPROBAR = '--comprobar' in sys.argv

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

# Lo que la politica cita de la app no se escribe en los JSON: se lee de
# index.html en cada idioma, como hace borrar-cuenta.html, para que diga
# siempre lo que dice la app. Los botones de borrar la cuenta (ppConsCuenta:
# «Cuenta» → «Eliminar cuenta») y la etiqueta de los pines de pago
# (ppPubQue: la de adRecommend, la que se ve en el mapa).
# Un hueco que un idioma no tenga, o una llave que quede sin rellenar, para.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagina_fija import rotulos, pagina, escribir_o_comprobar, textos
BOTONES = {'cuenta': 'UI.navAccount', 'eliminar': 'UI.cuentaBorrarBtn', 'patrocinado': 'UI.adRecommend'}
ROT = rotulos(list(BOTONES.values()) + ['UI.cuentaBorrarPagina'])
# Los huecos que se quedan en la fila: un enlace o un enfasis que va DENTRO
# de la frase, cada idioma en su sitio («bei der {aepd} beschweren», «向
# {aepd} 投诉»). En el panel los rellena la app al cambiar de idioma
# (data-tx-hueco, en applyUiTx); en la pagina, cuerpo(). Cada uno, una vez.
VIVOS = {'aepd', 'interes', 'contrato'}
huecos = lambda v: sorted(set(re.findall(r'\{(\w+)\}', v)))
for k in claves:
    h_es = huecos(tab['es'][k])
    for L in LANGS:
        if huecos(tab[L][k]) != h_es:
            print(f'{L}: {k} tiene los huecos {huecos(tab[L][k])} y el castellano {h_es}'); sys.exit(1)
    for L in LANGS:
        v = tab[L][k]
        for h, clave in BOTONES.items():
            v = v.replace('{' + h + '}', ROT[clave][L])
        resto = re.sub(r'\{(?:%s)\}' % '|'.join(sorted(VIVOS)), '', v)
        if '{' in resto or '}' in resto:
            print(f'{L}: {k} con una llave sin rellenar: {v}'); sys.exit(1)
        if any(v.count('{' + h + '}') > 1 for h in VIVOS):
            print(f'{L}: {k} lleva un hueco dos veces: {v}'); sys.exit(1)
        tab[L][k] = v

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
original = open(p, encoding='utf-8').read()
s = original

# El bloque empieza por la primera clave del castellano (era ppCerrar; desde
# que entro ppEnlace ya no lo encontraba). Y se corta desde el comentario que
# escribe este mismo guion, si esta justo encima: si no, cada pasada dejaba
# otra copia del comentario.
ini = s.find('Object.assign(UI_TX, {\n  "%s"' % claves[0])
if ini < 0: print('no encuentro el bloque pp* de UI_TX'); sys.exit(1)
com = s.rfind('/* La politica de privacidad, en los diez idiomas.', 0, ini)
if com >= 0 and not s[com:ini].split('*/', 1)[1].strip():
    ini = com
fin = s.find('\n});\n', ini) + len('\n});\n')
s = s[:ini] + bloque + s[fin:]

# ── el texto, para el panel o para la pagina ──────────────────────────
MAIL_DIR = 'tenerife.go.app@gmail.com'
# Los terceros: el nombre (no se traduce), la direccion de su politica y la
# clave de lo que reciben.
TERCEROS = [
    ('Supabase', 'https://supabase.com/privacy', 'ppTercSupabase'),
    ('OpenStreetMap · ArcGIS', 'https://osmfoundation.org/wiki/Privacy_Policy', 'ppTercMapas'),
    ('OSRM', 'https://project-osrm.org/', 'ppTercOsrm'),
    ('Nominatim', 'https://osmfoundation.org/wiki/Privacy_Policy', 'ppTercNominatim'),
    ('Open-Meteo', 'https://open-meteo.com/en/terms', 'ppTercMeteo'),
    # AEMET salio de esta lista el 12/10/2026: la app ya no le pide nada desde
    # el dispositivo. Los avisos los baja GitHub (.github/workflows/avisos-aemet.yml)
    # y la app los lee de su propio dominio, asi que AEMET no recibe ni la IP.
    ('Ministerio para la Transición Ecológica y el Reto Demográfico', 'https://geoportalgasolineras.es/', 'ppTercCarburantes'),
    # Wikipedia: las fotos de los lugares y, desde el 20/10/2026, el resumen
    # del astro que se abre en el panel del cielo (modulos/cielo.js, wikiResumen).
    ('Wikipedia · Wikimedia', 'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy', 'ppTercWiki'),
    # Las tipografias viven en vendor/fuentes/ desde hace tiempo: Google
    # Fonts no recibe nada. jsDelivr sirve la libreria de Supabase
    # (index.html, el <script> de supabase-js). LANZAMIENTO-PLAY.md 1.3.
    ('jsDelivr', 'https://www.jsdelivr.com/terms/privacy-policy', 'ppTercCdn'),
    ('Google Analytics', 'https://policies.google.com/privacy', 'ppTercGa'),
]


def cuerpo(L, panel):
    """La politica en el idioma L, sin el titulo.

    panel=True: el marcado de #privacy-panel en index.html, en castellano y
    con data-tx para que la app lo traduzca (L es siempre 'es'); lo que no se
    traduce lleva data-sin-traducir, que es lo que leen los controles.
    panel=False: la seccion de ese idioma en privacidad.html, texto llano.
    Panel y pagina salen de aqui y solo de aqui."""
    T = tab[L]
    e = lambda k: html.escape(T[k], quote=False)
    sangria = (lambda n: ' ' * n) if panel else (lambda n: '')

    def t(k):                                    # un trozo traducido
        return f'<span data-tx="{k}">{e(k)}</span>' if panel else e(k)

    def par(k):                                  # un parrafo entero
        return f'    <p data-tx="{k}">{e(k)}</p>' if panel else f'<p>{e(k)}</p>'

    def sin(que, texto):                         # algo que no se traduce
        return f'<span data-sin-traducir="{que}">{texto}</span>' if panel else texto

    def fuera(url, texto, que, hueco=None):      # enlace a fuera, sin traducir
        extra = f' data-sin-traducir="{que}"' if panel else ''
        if panel and hueco:
            extra += f' data-hueco="{hueco}"'
        return f'<a href="{url}" target="_blank" rel="noopener"{extra}>{texto}</a>'

    correo = (f'<a href="mailto:{MAIL_DIR}"'
              + (' data-sin-traducir="direccion de correo"' if panel else '')
              + f'>{MAIL_DIR}</a>')

    def h(n, k):
        # el numero del apartado va fuera del texto traducido: renumerar un
        # apartado no puede obligar a retocar diez traducciones
        if panel:
            return (f'    <h3><span data-sin-traducir="numero de apartado">{n}.</span> '
                    f'<span data-tx="{k}">{e(k)}</span></h3>')
        return f'<h2>{n}. {e(k)}</h2>'

    def li(lk, tk):
        if panel:
            return f'      <li><strong data-tx="{lk}">{e(lk)}</strong> {t(tk)}</li>'
        return f'<li><strong>{e(lk)}</strong> {e(tk)}</li>'

    def em(k, hueco):
        return (f'<em data-hueco="{hueco}" data-tx="{k}">{e(k)}</em>' if panel
                else f'<em>{e(k)}</em>')

    def con_huecos(k, hijos, tag):
        """Una frase con elementos DENTRO: cada idioma los pone en su sitio.
        En el panel el contenedor lleva data-tx-hueco y cada elemento
        data-hueco, y la app rehace el texto de alrededor al cambiar de
        idioma; en la pagina va ya montada. tag None: sin contenedor."""
        trozos = re.split(r'\{(\w+)\}', T[k])
        dentro = ''.join(hijos[x] if i % 2 else html.escape(x, quote=False)
                         for i, x in enumerate(trozos))
        if panel:
            return f'<{tag or "span"} data-tx-hueco="{k}">{dentro}</{tag or "span"}>'
        return f'<{tag}>{dentro}</{tag}>' if tag else dentro

    # La pagina para borrar la cuenta (Google Play, LANZAMIENTO-PLAY.md 1.2).
    # En el panel, su rotulo es el de UI_TX y la pagina se abre sola en el
    # idioma de la app; en privacidad.html, ya en el idioma de la seccion.
    if panel:
        borrar = ('<a href="borrar-cuenta.html" target="_blank" rel="noopener" data-tx="cuentaBorrarPagina">'
                  + ROT['UI.cuentaBorrarPagina']['es'] + '</a>')
    else:
        borrar = (f'<a href="borrar-cuenta.html#{L}">'
                  + html.escape(ROT['UI.cuentaBorrarPagina'][L], quote=False) + '</a>')

    marca = ' data-sin-traducir="marca"' if panel else ''
    m = [f'{sangria(4)}<p><strong{marca}>Tenerife Go</strong> {t("ppActualizado")}</p>', '']
    m += [h(1, 'ppRespTitulo'),
          f'{sangria(4)}<p>{sin("nombre del responsable", "Jérôme Bourgeois ·")} {correo} {t("ppRespDir")}</p>', '']
    m += [h(2, 'ppDatosTitulo'), f'{sangria(4)}<ul>', li('ppDatosGeo', 'ppDatosGeoTxt')]
    fuerte = (f'<strong data-tx="ppDatosCuenta">{e("ppDatosCuenta")}</strong>' if panel
              else f'<strong>{e("ppDatosCuenta")}</strong>')
    m.append(f'{sangria(6)}<li>{fuerte} {t("ppDatosCuentaTxt")} '
             f'{fuera("https://supabase.com/privacy", "Supabase", "nombre del proveedor")}{t("ppDatosRls")}</li>')
    # Los sensores y la camara (20 de octubre de 2026): «Apunta al cielo» del
    # panel del cielo los usa en el dispositivo y nada sale de el.
    for a, b in (('ppDatosFav', 'ppDatosFavTxt'), ('ppDatosPref', 'ppDatosPrefTxt'),
                 ('ppDatosPush', 'ppDatosPushTxt'), ('ppDatosSensores', 'ppDatosSensoresTxt'),
                 ('ppDatosCamara', 'ppDatosCamaraTxt'), ('ppDatosStats', 'ppDatosStatsTxt')):
        m.append(li(a, b))
    m += [f'{sangria(4)}</ul>', '']
    m += [h(3, 'ppStatsTitulo')] + [par(k) for k in ('ppStatsAntes', 'ppStatsSi', 'ppStatsConsent', 'ppStatsGuarda')] + ['']
    m += [h(4, 'ppPubTitulo')] + [par(k) for k in ('ppPubQue', 'ppPubNoDatos')] + ['']
    m += [h(5, 'ppTercTitulo'), par('ppTercIntro'), f'{sangria(4)}<ul>']
    for nombre, url, k in TERCEROS:
        m.append(f'{sangria(6)}<li>{fuera(url, nombre, "nombre del proveedor")} — {t(k)}</li>')
    m += [f'{sangria(4)}</ul>', par('ppTercNoVenta'), '']
    m += [h(6, 'ppBaseTitulo'), f'{sangria(4)}<ul>',
          sangria(6) + con_huecos('ppBaseLi1', {'interes': em('ppBaseInteres', 'interes'),
                                                'contrato': em('ppBaseContrato', 'contrato')}, 'li'),
          f'      <li data-tx="ppBaseLi2">{e("ppBaseLi2")}</li>' if panel else f'<li>{e("ppBaseLi2")}</li>',
          f'{sangria(4)}</ul>', '']
    m += [h(7, 'ppConsTitulo'), f'{sangria(4)}<p>{t("ppConsCuenta")} {borrar}</p>', par('ppConsDispositivo'), '']
    m += [h(8, 'ppDerTitulo'),
          f'{sangria(4)}<p>{t("ppDerTxt")} {correo}'
          + con_huecos('ppDerReclamar', {'aepd': fuera('https://www.aepd.es', 'AEPD',
                                                       'nombre oficial del organismo', 'aepd')}, None)
          + '</p>', '']
    m += [h(9, 'ppSegTitulo'), par('ppSegTxt'), '']
    m += [h(10, 'ppContTitulo'), f'{sangria(4)}<p>{correo}</p>']
    if not panel:
        m = [x for x in m if x]                  # la pagina, sin lineas vacias
    return '\n'.join(m)


# ── el panel, en index.html ───────────────────────────────────────────
marcado = '\n'.join([
    '<div id="privacy-panel" role="dialog" data-tx-aria="ariaPrivacidad" aria-label="Política de privacidad" aria-modal="true">',
    '  <div class="pp-sheet">',
    f'    <button class="pp-close" onclick="closePrivacyPanel()" data-tx-aria="ariaCerrar" aria-label="Cerrar" data-tx="ppCerrar">{tab["es"]["ppCerrar"]}</button>',
    f'    <h2 data-tx="ppTitulo">{tab["es"]["ppTitulo"]}</h2>',
    cuerpo('es', True),
    '  </div>',
    '</div>'])

i2 = s.find('<div id="privacy-panel"')
if i2 < 0: print('no encuentro el panel de privacidad'); sys.exit(1)
# hasta el comentario del pie que va justo despues
f2 = s.find('<!-- Enlace pie de privacidad -->', i2)
if f2 < 0: print('no encuentro el final del panel'); sys.exit(1)
s = s[:i2] + marcado + '\n\n' + s[f2:]

bien = True
if COMPROBAR:
    if s != original:
        print('index.html: la politica no esta al dia con idiomas/privacidad '
              'o con los botones de la app: python3 tools/generar_privacidad.py')
        bien = False
    else:
        print(f'index.html: la politica al dia ({len(claves)} claves x {len(LANGS)} idiomas)')
else:
    open(p, 'w', encoding='utf-8').write(s)
    print(f'{len(claves)} claves x {len(LANGS)} idiomas = {len(claves)*len(LANGS)} textos')

# ── la pagina, privacidad.html ────────────────────────────────────────
# El titulo, sin el candado del principio; al pie, la pagina para borrar la
# cuenta en el mismo idioma.
titulo = {L: re.sub(r'^\W+', '', tab[L]['ppTitulo']) for L in LANGS}
pag = pagina(titulo, {L: cuerpo(L, False) for L in LANGS},
             'Generada por tools/generar_privacidad.py desde idiomas/privacidad/*.json, '
             'en la misma pasada que el panel de index.html. No se edita a mano.',
             pie=[('borrar-cuenta.html', ROT['UI.cuentaBorrarPagina'])])
bien = escribir_o_comprobar('privacidad.html', pag, 'generar_privacidad.py') and bien
sys.exit(0 if bien else 1)
