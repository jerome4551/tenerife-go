#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El armazon de las paginas fijas de la raiz: borrar-cuenta.html y, desde
la 1.3 de LANZAMIENTO-PLAY.md, privacidad.html.

Google Play las pide en una direccion publica y las abre desde su ficha y
desde la Consola, con lo que sea. Por eso se leen enteras SIN JavaScript:
cada idioma es una <section> y se cambia con enlaces (#en, #de...) y solo
CSS:

    .idioma              { display: none }    todas escondidas...
    #es                  { display: block }   ...menos el castellano;
    .idioma:target       { display: block }   la del enlace tocado se ve
    .idioma:target ~ #es { display: none }    y el castellano se va.

Lo ultimo funciona porque #es va la ultima. El JavaScript solo ayuda: sin
almohadilla abre el idioma de la app (tg_lang, el mismo dominio) o el del
navegador, como hace la app, y pone el <title> y el lang de la pagina en el
idioma que se ve. Sin el, el titulo se queda en castellano y el texto se lee
igual.
"""
import html, json, os, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']
# el nombre de cada idioma en su idioma: no se traduce
NOMBRES = {'es': 'Español', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch',
           'it': 'Italiano', 'nl': 'Nederlands', 'zh': '简体中文', 'zht': '繁體中文',
           'bg': 'Български', 'pl': 'Polski'}
# el lang de HTML, el mismo que pone la app (setLang)
HTML_LANG = {'zh': 'zh-Hans', 'zht': 'zh-Hant'}
CORREO = 'tenerife.go.app@gmail.com'


def esc(t):
    return html.escape(t, quote=False)


def textos(carpeta):
    """{idioma: {clave: texto}} de idiomas/<carpeta>/<idioma>.json. Para si a
    un idioma le falta una clave, trae una de mas o la deja vacia."""
    tab = {}
    for L in LANGS:
        f = os.path.join(RAIZ, 'idiomas', carpeta, L + '.json')
        if not os.path.exists(f):
            sys.exit('falta ' + f)
        tab[L] = json.load(open(f, encoding='utf-8'))
    claves = list(tab['es'])
    for L in LANGS:
        fal = [k for k in claves if not str(tab[L].get(k, '')).strip()]
        if fal:
            sys.exit(f'{carpeta}/{L}: sin texto en {fal}')
        ext = [k for k in tab[L] if k not in claves]
        if ext:
            sys.exit(f'{carpeta}/{L}: claves que el castellano no tiene: {ext}')
    return tab


def rotulos(claves):
    """Los rotulos de la app, tal y como se pintan, leidos de index.html con
    tools/rotulos_app.js: {'UI.navAccount': {'es': 'Cuenta', ...}, ...}.
    Para si alguno falta en algun idioma: la pagina cita botones de la app
    y tiene que decir exactamente lo que el boton dice."""
    js = ("const R=require('./tools/rotulos_app');const o={};"
          "for(const k of JSON.parse(process.argv[1])){o[k]={};"
          "for(const L of JSON.parse(process.argv[2]))o[k][L]=R.valor(k,L)||'';}"
          "process.stdout.write(JSON.stringify(o));")
    r = subprocess.run(['node', '-e', js, json.dumps(claves), json.dumps(LANGS)],
                       cwd=RAIZ, capture_output=True, text=True)
    if r.returncode:
        sys.exit('no se han podido leer los rotulos de index.html:\n' + r.stderr)
    o = json.loads(r.stdout)
    for k in claves:
        fal = [L for L in LANGS if not o[k][L].strip()]
        if fal:
            sys.exit(f'el rotulo {k} no tiene texto en {fal}')
    return o


def rellenar(texto, valores, donde):
    """Cambia {clave} por su valor (ya en HTML). Para si queda alguna llave:
    una que no se rellena saldria tal cual en la pagina."""
    t = esc(texto)
    for k, v in valores.items():
        t = t.replace('{' + k + '}', v)
    if '{' in t or '}' in t:
        sys.exit(f'{donde}: queda una llave sin rellenar: {t}')
    return t


CSS = """
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: #0F1117; color: #e8e6e1;
  font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif; }
main { max-width: 680px; margin: 0 auto; padding: 20px 16px 48px; }
.marca { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #fff; }
.marca img { width: 36px; height: 36px; border-radius: 9px; }
.idiomas { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 14px 0 22px;
  padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.12); font-size: 0.88rem; }
.idiomas a { color: #c9a84c; text-decoration: none; }
.idiomas a[aria-current] { color: #fff; font-weight: 700; }
h1 { font-size: 1.5rem; line-height: 1.3; color: #fff; margin: 0 0 12px; }
h2 { font-size: 1.05rem; color: #c9a84c; margin: 26px 0 6px; }
p, li { color: #d7d4cc; }
ul { padding-left: 1.2em; }
a { color: #c9a84c; }
.pie { margin-top: 30px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.12); }
.idioma { display: none; }
#es { display: block; }
.idioma:target { display: block; }
.idioma:target ~ #es { display: none; }
""".strip('\n')

JS = """
(function () {
  var LISTA = %s;
  function vista() {
    var s = document.getElementById(location.hash.slice(1));
    return (s && s.className === 'idioma') ? s : document.getElementById('es');
  }
  function poner() {
    var s = vista();
    document.title = s.getAttribute('data-titulo');
    document.documentElement.lang = s.getAttribute('lang');
  }
  if (!location.hash) {
    var l = null;
    try { l = localStorage.getItem('tg_lang'); } catch (e) {}
    if (LISTA.indexOf(l) < 0) {
      l = (navigator.language || 'es').slice(0, 2).toLowerCase();
      if (LISTA.indexOf(l) < 0) l = 'en';
    }
    if (l !== 'es') location.replace('#' + l);
  }
  window.addEventListener('hashchange', poner);
  poner();
})();
""".strip('\n') % json.dumps(LANGS)


def pagina(titulo, cuerpo, aviso, pie=()):
    """titulo y cuerpo: {idioma: ...}. titulo es texto (el <title> y el
    <h1>); cuerpo, HTML ya escapado. aviso: el comentario de cabecera (de
    donde sale la pagina). pie: las otras paginas fijas que se enlazan al
    final, [(fichero, {idioma: rotulo})], cada una en el mismo idioma.
    La barra de idiomas y «Volver a Tenerife Go» son comunes a todas las
    paginas: idiomas/paginas/<idioma>.json."""
    comun = textos('paginas')
    secciones = []
    for L in LANGS[1:] + LANGS[:1]:          # el castellano, la ultima
        nav = ' '.join(
            f'<a href="#{o}" lang="{HTML_LANG.get(o, o)}" hreflang="{HTML_LANG.get(o, o)}"'
            + (' aria-current="page"' if o == L else '') + f'>{NOMBRES[o]}</a>'
            for o in LANGS)
        enlaces = [f'<a href="./">{esc(comun[L]["volver"])}</a>'] + [
            f'<a href="{fichero}#{L}">{esc(rotulo[L])}</a>' for fichero, rotulo in pie]
        secciones.append(
            f'<section class="idioma" id="{L}" lang="{HTML_LANG.get(L, L)}" '
            f'data-titulo="{html.escape("Tenerife Go — " + titulo[L])}">\n'
            f'<nav class="idiomas" aria-label="{html.escape(comun[L]["idioma"])}">{nav}</nav>\n'
            f'<h1>{esc(titulo[L])}</h1>\n{cuerpo[L]}\n'
            f'<p class="pie">{" · ".join(enlaces)}</p>\n</section>')
    return (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
        f'<!-- {aviso} -->\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="theme-color" content="#0F1117">\n'
        f'<title>Tenerife Go — {esc(titulo["es"])}</title>\n'
        '<link rel="icon" href="icon-192.png">\n'
        f'<style>\n{CSS}\n</style>\n</head>\n<body>\n<main>\n'
        '<div class="marca"><img src="icon-192.png" alt="" width="36" height="36">'
        '<span>Tenerife Go</span></div>\n'
        + '\n'.join(secciones) +
        f'\n</main>\n<script>\n{JS}\n</script>\n</body>\n</html>\n')


def escribir_o_comprobar(nombre, contenido, generador):
    """Con --comprobar no escribe: para si el fichero no es lo que saldria
    ahora (alguien lo toco a mano, o cambio un texto o un boton de la app y
    no se volvio a generar)."""
    p = os.path.join(RAIZ, nombre)
    if '--comprobar' in sys.argv:
        hay = open(p, encoding='utf-8').read() if os.path.exists(p) else None
        if hay != contenido:
            print(f'{nombre} no esta al dia: python3 tools/{generador}')
            return False
        print(f'{nombre} al dia con sus textos y con los botones de la app')
        return True
    open(p, 'w', encoding='utf-8').write(contenido)
    print(f'{nombre} escrito')
    return True
