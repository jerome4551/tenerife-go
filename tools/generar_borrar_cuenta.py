#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escribe borrar-cuenta.html desde idiomas/borrar-cuenta/<idioma>.json.

Google Play exige una pagina web, con el nombre de la app, que explique
como borrar la cuenta (LANZAMIENTO-PLAY.md 1.2, 16 de octubre de 2026). Los
botones que cita -Cuenta, Cerrar sesion, Eliminar cuenta y la
confirmacion- no se escriben aqui: se leen de index.html en cada idioma,
asi que la pagina dice siempre lo mismo que la app. Si un boton cambia de
nombre, `--comprobar` (lo corre auditar.sh) avisa de que hay que volver a
generarla.

    python3 tools/generar_borrar_cuenta.py              escribe la pagina
    python3 tools/generar_borrar_cuenta.py --comprobar  solo comprueba
"""
import os, re, sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pagina_fija import (LANGS, CORREO, esc, textos, rotulos, rellenar,
                         pagina, escribir_o_comprobar)

T = textos('borrar-cuenta')
R = rotulos(['UI.cuentaBorrarPagina', 'UI.navAccount', 'LANGS.authLogoutBtn',
             'UI.cuentaBorrarBtn', 'UI.cuentaBorrarSi', 'UI.ppTitulo'])

# Los huecos de cada texto, iguales en los diez idiomas: un idioma que se
# comiera {correo} dejaria la pagina sin la direccion a la que escribir.
for k in T['es']:
    huecos = sorted(set(p.split('}')[0] for p in T['es'][k].split('{')[1:]))
    for L in LANGS[1:]:
        otros = sorted(set(p.split('}')[0] for p in T[L][k].split('{')[1:]))
        if otros != huecos:
            sys.exit(f'borrar-cuenta/{L}.json, {k}: huecos {otros}, el castellano {huecos}')
        if T[L][k] == T['es'][k]:
            sys.exit(f'borrar-cuenta/{L}.json, {k}: es el texto en castellano')

cuerpo, titulo = {}, {}
for L in LANGS:
    t = T[L]
    titulo[L] = R['UI.cuentaBorrarPagina'][L]
    boton = {'cuenta': esc(R['UI.navAccount'][L]),
             'cerrar': esc(R['LANGS.authLogoutBtn'][L]),
             'eliminar': esc(R['UI.cuentaBorrarBtn'][L]),
             'confirmar': esc(R['UI.cuentaBorrarSi'][L])}
    correo = (f'<a href="mailto:{CORREO}?subject={quote(t["asunto"])}">{CORREO}</a>')
    cuerpo[L] = '\n'.join([
        f'<p>{rellenar(t["intro"], {}, L)}</p>',
        f'<h2>{esc(t["appTitulo"])}</h2>',
        f'<p>{rellenar(t["appTxt"], boton, L + " appTxt")}</p>',
        f'<h2>{esc(t["correoTitulo"])}</h2>',
        f'<p>{rellenar(t["correoTxt"], {"correo": correo, "asunto": esc(t["asunto"])}, L + " correoTxt")}</p>',
        f'<h2>{esc(t["borraTitulo"])}</h2>',
        f'<p>{rellenar(t["borraTxt"], {}, L)}</p>',
        f'<h2>{esc(t["noTitulo"])}</h2>',
        '<ul>',
        f'<li>{rellenar(t["noPush"], {}, L)}</li>',
        f'<li>{rellenar(t["noDispositivo"], {}, L)}</li>',
        '</ul>',
    ])

# al pie, la politica de privacidad (privacidad.html), con su titulo sin el
# candado del principio
politica = {L: re.sub(r'^\W+', '', R['UI.ppTitulo'][L]) for L in LANGS}
html = pagina(titulo, cuerpo,
              'Generada por tools/generar_borrar_cuenta.py desde '
              'idiomas/borrar-cuenta/*.json y los botones de index.html. '
              'No se edita a mano.',
              pie=[('privacidad.html', politica)])
sys.exit(0 if escribir_o_comprobar('borrar-cuenta.html', html,
                                   'generar_borrar_cuenta.py') else 1)
