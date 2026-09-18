#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mete labelPl en las filas que usan claves con sufijo (labelEs, labelEn...).

Esta forma de fila de idioma NO la ve barrido_idiomas.js, que busca objetos
con `es`, `en`, `fr` como claves directas. Son 34 filas -las categorias del
mapa y los once grupos del panel de filtros- que estaban completas en los
nueve idiomas por casualidad, porque nadie las tocaba; el polaco las dejo al
descubierto. El barrido aprende esta forma en el mismo cambio, para que no
pueda volver a dar verde sobre lo que no ha mirado.

Se empareja por el texto castellano, no por posicion: si un labelEs cambia,
esto se planta en vez de escribir el polaco de otra fila.
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(RAIZ, 'index.html')
s = open(p, encoding='utf-8').read()

PL = {
  'Museos': 'Muzea',
  'Veterinarios 24h': 'Weterynarze 24 h',
  'Gasolineras': 'Stacje paliw',
  'Friendly Zone': 'Friendly Zone',
  'Accesible': 'Dostępne',
  'Puertos Comerciales': 'Porty handlowe',
  'Puertos & Marinas': 'Porty i mariny',
  'Deporte Público': 'Sport publiczny',
  'Ciclismo': 'Kolarstwo',
  'Parapente': 'Paralotniarstwo',
  'Golf': 'Golf',
  'Escalada': 'Wspinaczka',
  'Windsurf & Kitesurf': 'Windsurfing i kitesurfing',
  'Kayak & SUP': 'Kajak i SUP',
  'Buceo & Snorkel': 'Nurkowanie i snorkeling',
  'Pesca Deportiva': 'Wędkarstwo sportowe',
  'Barbacoa & Picnic': 'Grill i piknik',
  'Miradores': 'Punkty widokowe',
  'Mercadillos': 'Targi lokalne',
  'Surf & Agua': 'Surfing i sporty wodne',
  'Supermercados': 'Supermarkety',
  'Oficinas de Turismo': 'Biura informacji turystycznej',
  'Campings': 'Kempingi',
  'Naturaleza & Playas': 'Przyroda i plaże',
  'Cultura & Ocio': 'Kultura i rozrywka',
  'Ciudades & Municipios': 'Miasta i gminy',
  'Servicios': 'Usługi',
  'Puertos & Marina': 'Porty i mariny',
  'Pets Friendly': 'Pets Friendly',
  'Deporte': 'Sport',
  'Lo Práctico': 'Praktyczne',
}

# cada labelBg va seguido, en la misma fila, de donde tiene que entrar el pl
RE = re.compile(r"labelEs:\s*'((?:[^'\\]|\\.)*)'")
casos = []
for m in RE.finditer(s):
    es = m.group(1)
    # el final de esa fila: el labelBg que le corresponde
    bg = re.compile(r"labelBg:\s*'(?:[^'\\]|\\.)*'").search(s, m.end())
    if not bg:
        print(f'la fila «{es}» no tiene labelBg'); sys.exit(1)
    if re.search(r"labelPl\s*:", s[m.end():bg.end()+40]):
        continue                                  # ya lo tiene
    if es not in PL:
        print(f'no tengo el polaco de «{es}»'); sys.exit(1)
    casos.append((bg.end(), PL[es], es))

if not casos:
    print('nada que hacer: todas tienen labelPl'); sys.exit(0)

for fin, txt, es in sorted(casos, reverse=True):     # de atras hacia delante
    s = s[:fin] + ", labelPl: " + json.dumps(txt, ensure_ascii=False).replace('"', "'") + s[fin:]

# y el buscador de rotulos, que se quedo con un "?" literal
v = """    zh: group.labelZh, zht: group.labelZht, bg: group.labelBg, pl: "?"
  };"""
n = """    zh: group.labelZh, zht: group.labelZht, bg: group.labelBg, pl: group.labelPl
  };"""
if s.count(v) != 1:
    print('no encuentro el pl:"?" del buscador de rotulos'); sys.exit(1)
s = s.replace(v, n)

open(p, 'w', encoding='utf-8').write(s)
print(f'{len(casos)} filas con labelPl')
