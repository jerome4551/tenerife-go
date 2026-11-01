#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""revisar_traduccion.py — revisa una tanda TRADUCIDA antes de meterla.

    python3 tools/revisar_traduccion.py tanda.json
    (fichero JSON: { "texto en castellano": "texto traducido", ... })

NO mira si la traduccion suena bien: eso lo lee una persona. Mira lo que se
puede PERDER sin que nadie lo note, que es lo que de verdad hace dano:

  · un ⚠️ que desaparece            -> el aviso de peligro deja de estar
  · una cifra que cambia            -> 300 plazas pasan a ser 30
  · un horario distinto             -> el turista llega y esta cerrado
  · una traduccion sin cirilico     -> se quedo sin traducir
  · castellano dentro del bulgaro   -> media frase sin traducir
  · letras que no son del alfabeto  -> se cuela una j serbia o una y rusa
  · una traduccion mucho mas corta  -> se ha comido una frase

Lo que SI se queda en castellano a proposito y el control respeta: la
direccion postal detras del 📍 -hay que poder leerla en la calle y teclearla
en el GPS- y los nombres propios.

Sale con codigo 1 si encuentra algo, para poder encadenarlo con &&.
"""
import json, re, sys, os
S = os.environ['S']
t = json.load(open(sys.argv[1], encoding='utf-8'))
mal = []

def cifras(s):
    # 3.715 (es) y 3 715 (bg) son el mismo numero: se quita el separador
    s = re.sub(r'(?<=\d)[\s\u00a0\u202f](?=\d{3}\b)', '', s)
    s = s.replace('.', '').replace(',', '')
    return sorted(x for x in re.findall(r'\d{2,}', s))

def horas(s):
    # solo los dos puntos: "3.715 m" es una altura, no las 3 y 71
    return sorted(re.findall(r'\d{1,2}:\d{2}', s))

ES = re.compile(r'(?:^|\s)(?:de|la|el|los|las|con|para|por|una|uno|desde|hasta|muy|todo|todos|donde|cuando|pero|que|más|aquí|sin|entre|sobre|hay)(?=\s|[.,;:])', re.I)

for e, b in t.items():
    if ('⚠️' in e) != ('⚠️' in b):
        mal.append('AVISO perdido o inventado: ' + e[:60])
    ce, cb = cifras(e), cifras(b)
    if ce != cb:
        mal.append('cifras distintas %s vs %s: %s' % (ce, cb, e[:50]))
    he, hb = horas(e), horas(b)
    if he != hb:
        mal.append('horarios distintos %s vs %s: %s' % (he, hb, e[:50]))
    if not re.search(r'[Ѐ-ӿ]', b):
        mal.append('sin cirilico: ' + e[:60])
    # La DIRECCION no se traduce: el turista tiene que poder leerla en la
    # calle y teclearla en el GPS tal cual. Se quita antes de buscar
    # castellano, igual que los nombres propios con "de" dentro.
    sinDir = re.sub(r'📍[^·]*', ' ', b)
    # nombre propio o marca: "Valle de La Orotava", "La Solana", "El Esquilon"
    sinDir = re.sub(r'(?:[A-ZÁÉÍÓÚÑ][\w.\-\u00c0-\u024f]*\s+)*(?:[Dd]e|[Dd]el|[Ll]a|[Ll]os|[Ll]as|[Ee]l)\s+[A-ZÁÉÍÓÚÑ][\w.\-\u00c0-\u024f]*', ' ', sinDir)
    n = len(ES.findall(' ' + sinDir))
    if n >= 2:
        mal.append('parece castellano dentro del bulgaro (%d): %s' % (n, sinDir[:70]))
    # LATIN PEGADO A CIRILICO DENTRO DE LA MISMA PALABRA. Se cuela al
    # teclear -la c, la o, la a, la e y la p se ven igual en los dos
    # alfabetos- y a ojo es invisible: "Лас Дееcас" lleva una c latina.
    # Rompe la busqueda y el lector de pantalla.
    mezcla = re.findall(r'[\u0400-\u04FF]+[A-Za-z]|[A-Za-z]+[\u0400-\u04FF]', b)
    if mezcla:
        mal.append('latin pegado a cirilico %s: %s' % (sorted(set(mezcla)), b[:60]))
    # letras cirilicas que NO existen en bulgaro: se cuelan del ruso, del
    # serbio o del ucraniano y pasan desapercibidas porque "parecen" bien
    fuera = set(re.findall(r'[ёыэіїєјљњћџѐўґЁЫЭІЇЄЈЉЊЋЏЎҐ]', b))
    if fuera:
        mal.append('letras que no son del alfabeto bulgaro %s: %s' % (sorted(fuera), b[:60]))
    if len(b) < len(e) * 0.45:
        mal.append('demasiado corta (%d vs %d): %s' % (len(b), len(e), e[:50]))

print('filas:', len(t), '· problemas:', len(mal))
for m in mal:
    print('   ' + m)
sys.exit(1 if mal else 0)
