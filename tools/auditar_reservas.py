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
"""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


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
    return 1 if mal else 0


if __name__ == '__main__':
    sys.exit(main())
