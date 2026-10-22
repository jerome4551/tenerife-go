#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
auditar_reservas.py — el texto «de reserva» que sale cuando falta la traduccion.

    python3 tools/auditar_reservas.py

POR QUE EXISTE
  En index.html hay muchos `L.clave || 'texto en castellano'`: si la clave no
  existe en el idioma, sale el castellano. Es una red de seguridad... que tapa
  el fallo. `L.favAdd || 'Favorito'` llevaba saliendo en castellano en LOS DIEZ
  idiomas, tambien en ingles, porque `favAdd` no estaba definida en NINGUNO. Lo
  encontro una foto de la ficha en chino, no un control.

QUE MIRA
  Cada `<objeto>.clave || '…'` del fuente cuya clave pertenezca a los objetos de
  idioma: la clave tiene que estar definida en los DIEZ. Una clave que no esta
  en ninguno tambien es fallo: es exactamente el caso de favAdd.

  Y el texto que el codigo escribe A MANO en la pagina (22 de octubre de 2026):
  `el.textContent = 'Tenerife GO · Planificador'` no pasa por ninguna tabla de
  idioma, asi que ningun control lo veia. Asi salian en castellano, en los diez
  idiomas, la cabecera del planificador («Tenerife GO · Planificador», «Mañana
  (2–3h)») y los avisos del panel de administracion («Inicia sesión con tu
  cuenta de administrador», ademas de tu). Toda asignacion de un texto con
  letras a textContent, innerText, title, placeholder o ariaLabel, en
  index.html y en los modulos, es fallo salvo que este en LITERALES_FIJOS con
  su motivo.
"""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Lo que el codigo escribe a mano y se queda asi, con su motivo.
LITERALES_FIJOS = {
    'Abrir Tenerife Go': 'el enlace que sale si otra web mete la app en un marco: corre antes '
                         'que la app y sus tablas de idioma (index.html, al principio)',
    '📡 GPS': 'el boton de posicion del panel de administracion: GPS se dice igual en los diez idiomas',
}


def main():
    s = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    # Los objetos de idioma se reconocen por shareBtn, que tienen los diez.
    usos = {}
    for m in re.finditer(r"\b(?:L|t\(\)|T|tx|lang|LL)\.(\w+)\s*\|\|\s*(['\"`])((?:(?!\2).){0,60})\2", s):
        usos.setdefault(m.group(1), set()).add(m.group(3))
    defin = {}
    for k in usos:
        # La clave puede ir sola en su linea o compartirla: «lifeguardNow: '…',
        # lifeguardHours: '…'». Contando solo las de principio de linea, salia
        # que lifeguardHours estaba en 2 de 10 y esta en los diez.
        defin[k] = len(re.findall(r'(?<![\w.])"?%s"?\s*:\s*[\'"\[`]' % re.escape(k), s))
    def es_texto(r):
        return bool(re.search(r'[A-Za-zÀ-ÿ]{3,}', r))
    # Una reserva que no es texto («A→B», o vacia) y cuya clave no existe en
    # ningun idioma es un valor fijo a proposito, no una traduccion que falta.
    mal = {k: v for k, v in defin.items()
           if v < 10 and not (v == 0 and not any(es_texto(r) for r in usos[k]))}
    print('=== texto de reserva en castellano ===')
    print('  claves con reserva en el fuente ........ %d' % len(usos))
    print('  definidas en los diez idiomas .......... %d' % (len(usos) - len(mal)))
    print('  FALTAN EN ALGUN IDIOMA ................. %d' % len(mal))
    for k in sorted(mal):
        print('    %-22s en %d de 10 · sale «%s»' % (k, mal[k], ' / '.join(sorted(usos[k]))))

    fuentes = [('index.html', s)] + [
        (os.path.join('modulos', f), open(os.path.join(RAIZ, 'modulos', f), encoding='utf-8').read())
        for f in sorted(os.listdir(os.path.join(RAIZ, 'modulos'))) if f.endswith('.js')]
    literales, fijos = [], 0
    for nombre, txt in fuentes:
        for m in re.finditer(r"\.(textContent|innerText|title|placeholder|ariaLabel)\s*=\s*(['\"`])((?:(?!\2)[^\\\n]|\\.)*?)\2", txt):
            t = m.group(3)
            if m.group(2) == '`' and '${' in t:
                continue    # una plantilla que compone partes ya traducidas
            if not re.search(r'[^\W\d_]{3,}', re.sub(r'\\u[0-9a-fA-F]{4}', '', t)):
                continue    # un emoji o un signo, sin palabras
            if t in LITERALES_FIJOS:
                fijos += 1
                continue
            literales.append('%s:%d  %s = «%s»' % (nombre, txt.count('\n', 0, m.start()) + 1, m.group(1), t[:80]))
    print('  texto escrito a mano desde el codigo ... %d (fijos con su motivo: %d)' % (len(literales), fijos))
    for x in literales:
        print('    ' + x)
    return 1 if (mal or literales) else 0


if __name__ == '__main__':
    sys.exit(main())
