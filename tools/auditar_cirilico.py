#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Nombres propios transliterados al cirilico: la errata muda.

Transliterar un nombre propio se hace a mano y la errata no se ve: nadie que
lea bulgaro va a notar que un sitio pone "Гранадиля" y otro "Гранадия",
porque suenan casi igual. Pero son dos cadenas distintas: el buscador no las
encuentra juntas y el lector de pantalla las pronuncia mal. Y como cada una
esta en una ficha distinta, nunca se ven una al lado de la otra.

El control busca variantes RARAS muy parecidas a una variante FRECUENTE.

Dos decisiones que importan:

1. Que es nombre propio y que es palabra comun. En bulgaro no se puede saber
   por la mayuscula, porque toda frase abre con una. Lo que si vale: un
   nombre propio NO se escribe nunca en minuscula. Asi se cae "Спокойна" y se
   queda "Гайетас". No se mira la POSICION de la palabra: una errata aparece
   una sola vez, y si justo esa vez abre frase el control se quedaria ciego.

2. Que diferencia es errata y cual no. El bulgaro declina por el final, y el
   castellano hace el plural igual: "Америка"/"Америкас", "Уебкамера"/
   "Уебкамери". Por eso NO se mira una diferencia que este solo en la ultima
   letra. La errata de transliteracion cae en medio de la palabra, que es
   donde estaban "Гранадия", "Фаняабе" y "Галетас".

Excepciones declaradas en el fuente:  CIRILICO-OK: <palabra>  <motivo>
"""
import io, re, sys, collections

RUTA = 'index.html'
src = io.open(RUTA, encoding='utf-8').read()

OK = set(re.findall(r'CIRILICO-OK:\s*(\S+)', src))

# Los comentarios del fuente estan en castellano, pero explican las erratas y
# para eso las escriben. Si no se quitan, el control se caza a si mismo.
sinCom = re.sub(r'/\*[\s\S]*?\*/', ' ', src)

MAYUS = re.compile(r'[А-Я][а-я]{4,}')
MINUS = re.compile(r'(?<![А-я])([а-я]{5,})')

comunes = set(MINUS.findall(sinCom))
cuenta = collections.Counter(p for p in MAYUS.findall(sinCom)
                             if p.lower() not in comunes)

def dist(a, b):
    """Levenshtein con corte en 2: mas lejos ya no nos interesa."""
    if abs(len(a) - len(b)) > 2:
        return 3
    ant = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        act = [i]
        for j, cb in enumerate(b, 1):
            act.append(min(ant[j] + 1, act[j - 1] + 1, ant[j - 1] + (ca != cb)))
        if min(act) > 2:
            return 3
        ant = act
    return ant[-1]

def soloElFinal(a, b):
    """La diferencia esta solo en la ultima letra: declinacion o plural."""
    return a[:-1] == b[:-1] or a == b[:-1] or b == a[:-1]

raras = sorted(p for p, n in cuenta.items() if n <= 2 and p not in OK)
firmes = sorted(p for p, n in cuenta.items() if n >= 4)

mal = []
for r in raras:
    for f in firmes:
        if r == f or r[:2] != f[:2] or soloElFinal(r, f):
            continue
        if cuenta[f] < cuenta[r] * 4:
            continue          # no hay una clara mayoritaria: no opinamos
        if dist(r, f) <= 1:
            mal.append('%s (%d) se parece a %s (%d)' % (r, cuenta[r], f, cuenta[f]))
            break

print('nombres propios en cirilico: %d · variantes sospechosas: %d'
      % (len(cuenta), len(mal)))
for m in mal:
    print('   ' + m)
sys.exit(1 if mal else 0)
