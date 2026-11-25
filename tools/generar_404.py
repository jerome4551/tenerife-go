#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escribe 404.html desde idiomas/404/<idioma>.json (nota 48, punto 4b, 16 de noviembre de 2026).

GitHub Pages enseña 404.html, si esta en la raiz del sitio publicado, a quien llega por un enlace roto.
Es una pagina fija mas, con el armazon de tools/pagina_fija.py (cada idioma en su <section>, se cambia
con #en, #de... y solo CSS; el JavaScript abre el idioma de la app o el del navegador), con dos
diferencias: GitHub la sirve en la direccion rota, sea la que sea (/a/b/c), asi que el icono y el
enlace a la app van con ruta absoluta (/icon-192.png, /), y lleva su propio titulo, distinto de su
<h1>. Los textos vienen en los once idiomas (el rumano, desde el interruptor del rumano, 22-11-2026).

    python3 tools/generar_404.py              escribe la pagina
    python3 tools/generar_404.py --comprobar  solo comprueba (lo corre auditar.sh)
"""
import html, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagina_fija import (LANGS, NOMBRES, HTML_LANG, CSS, JS, esc, textos,
                         escribir_o_comprobar)

T = textos('404')
C = textos('paginas')
for L in LANGS[1:]:
    for k in T['es']:
        if T[L][k] == T['es'][k]:
            sys.exit(f'404/{L}.json, {k}: es el texto en castellano')

CSS404 = CSS + """
.boton { display: inline-block; margin-top: 18px; padding: 10px 18px; border-radius: 10px;
  background: #c9a84c; color: #0F1117; font-weight: 700; text-decoration: none; }"""

secciones = []
for L in LANGS[1:] + LANGS[:1]:          # el castellano, la ultima (lo pide el CSS)
    nav = ' '.join(
        f'<a href="#{o}" lang="{HTML_LANG.get(o, o)}" hreflang="{HTML_LANG.get(o, o)}"'
        + (' aria-current="page"' if o == L else '') + f'>{NOMBRES[o]}</a>'
        for o in LANGS)
    secciones.append(
        f'<section class="idioma" id="{L}" lang="{HTML_LANG.get(L, L)}" '
        f'data-titulo="{html.escape(T[L]["titulo"])}">\n'
        f'<nav class="idiomas" aria-label="{html.escape(C[L]["idioma"])}">{nav}</nav>\n'
        f'<h1>{esc(T[L]["h1"])}</h1>\n'
        f'<p>{esc(T[L]["texto"])}</p>\n'
        f'<p><a class="boton" href="/">{esc(T[L]["boton"])}</a></p>\n</section>')

pagina = (
    '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
    '<!-- Generada por tools/generar_404.py desde idiomas/404/*.json. No se edita a mano. -->\n'
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    '<meta name="theme-color" content="#0F1117">\n'
    f'<title>{esc(T["es"]["titulo"])}</title>\n'
    '<link rel="icon" href="/icon-192.png">\n'
    f'<style>\n{CSS404}\n</style>\n</head>\n<body>\n<main>\n'
    '<div class="marca"><img src="/icon-192.png" alt="" width="36" height="36">'
    '<span>Tenerife Go</span></div>\n'
    + '\n'.join(secciones) +
    f'\n</main>\n<script>\n{JS}\n</script>\n</body>\n</html>\n')

sys.exit(0 if escribir_o_comprobar('404.html', pagina, 'generar_404.py') else 1)
