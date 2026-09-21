#!/usr/bin/env python3
"""
fijar_coordenada.py — cambia la coordenada de un lugar, comprobandola antes.

    python3 tools/fijar_coordenada.py <id> <lat> <lng> ["de donde sale"]
    python3 tools/fijar_coordenada.py --fichero nuevas.txt

    nuevas.txt: una por linea,   id  lat  lng  # de donde sale
    Las lineas vacias y las que empiezan por # se saltan.

    El texto detras de la # es la FUENTE y se guarda. Sin el, la coordenada
    se escribe pero no se apunta como verificada, y el aviso lo dice.

POR QUE EXISTE
  Una coordenada mala no da error: se dibuja igual y el pin sale en el mar.
  Asi llegaron un Lidl, un parking y una ermita al agua sin que nadie se
  enterara. Esta herramienta comprueba ANTES de escribir:

    1. que el id existe en places[]
    2. que la coordenada esta dentro de la caja de Tenerife
    3. que CAE EN TIERRA, contra la linea de costa de tools/costa.py
    4. y dice cuanto se mueve el punto, para que un dedazo de un grado
       -que son 111 km- se vea antes de guardarlo

  Si algo de eso falla NO ESCRIBE NADA. Mas vale dejar el punto donde
  estaba que moverlo a otro sitio equivocado sin que se note.

  Y APUNTA LA VERIFICACION en datos/verificado.json, con la fecha y la
  fuente. Eso es la mitad del trabajo: antes se verificaba y no se guardaba
  en ninguna parte, asi que el siguiente control volvia a sacar en la lista
  un sitio ya comprobado, y parecia que todo fallaba siempre. Si hay que
  acordarse de apuntarlo a mano, no se apunta. Sin fuente no se escribe: una
  marca de «verificado» sin fuente calla el control y no deja rastro.

  Las categorias que estan en el agua a proposito -puertos, marinas,
  charcos- se avisan pero no se bloquean: un embarcadero SI esta sobre el
  agua, y quien lo mueve sabe lo que hace.
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import costa

RAIZ = costa.RAIZ
HTML = os.path.join(RAIZ, 'index.html')
CAJA = (27.90, 28.70, -17.00, -16.05)   # lat min, lat max, lng min, lng max
DEL_AGUA = {'puerto_ocio', 'puerto_comercial', 'piscinas', 'buceo', 'avistamiento'}

metros = costa.metros


def main():
    args = sys.argv[1:]
    cambios = []
    if args and args[0] == '--fichero':
        if len(args) < 2:
            print('falta el fichero'); return 2
        for linea in io.open(args[1], encoding='utf-8'):
            if not linea.strip() or linea.lstrip().startswith('#'):
                continue
            # lo de detras de la # es la FUENTE y se guarda: tirarla era
            # perder justo el dato por el que existe el registro
            datos, _, fuente = linea.partition('#')
            p = datos.split()
            if len(p) < 3:
                print('linea que no entiendo: ' + linea.strip()); return 2
            cambios.append((p[0], float(p[1]), float(p[2]), fuente.strip()))
    elif len(args) >= 3:
        cambios.append((args[0], float(args[1]), float(args[2]), args[3] if len(args) > 3 else ''))
    else:
        print(__doc__); return 2

    s = io.open(HTML, encoding='utf-8').read()
    analiza = costa.abrir()
    if analiza is None:
        print('  --  sin mapa/tenerife-osm.pmtiles no puedo comprobar que caiga en tierra.')
        print('      No escribo nada: esa comprobacion es el motivo de esta herramienta.')
        return 1

    # Todo se valida ANTES de tocar el fichero. Escribir la mitad seria peor
    # que no escribir nada.
    plan = []
    for pid, la, lo, fuente in cambios:
        i = s.find('id:"%s"' % pid)
        if i < 0:
            print('  MAL  %s no existe en places[]' % pid); return 1
        tro = s[i:i + 2600]
        m = re.search(r'lat:(-?[\d.]+),\s*lng:(-?[\d.]+)', tro)
        if not m:
            print('  MAL  %s no tiene lat/lng donde deberia' % pid); return 1
        cat = (re.search(r'category:"([a-z_]+)"', tro) or [None, ''])[1]
        vla, vlo = float(m.group(1)), float(m.group(2))
        if not (CAJA[0] <= la <= CAJA[1] and CAJA[2] <= lo <= CAJA[3]):
            print('  MAL  %s: %.5f,%.5f cae fuera de Tenerife' % (pid, la, lo)); return 1
        tierra = analiza(la, lo)[0]
        d = metros(vla, vlo, la, lo)
        if not tierra and cat not in DEL_AGUA:
            print('  MAL  %s [%s]: %.5f,%.5f SIGUE EN EL AGUA. No lo escribo.' % (pid, cat, la, lo)); return 1
        plan.append((pid, i, m, tro, vla, vlo, la, lo, d, cat, tierra, fuente))

    for pid, i, m, tro, vla, vlo, la, lo, d, cat, tierra, fuente in sorted(plan, key=lambda x: -x[1]):
        s = s[:i] + tro[:m.start()] + ('lat:%s, lng:%s' % (la, lo)) + tro[m.end():] + s[i + 2600:]
        aviso = '' if tierra else '   (en el agua, pero es %s: se permite)' % cat
        print('  OK   %-28s %.5f,%.5f -> %.5f,%.5f   se mueve %.0f m%s'
              % (pid, vla, vlo, la, lo, d, aviso))
        if fuente:
            print('       fuente: %s' % fuente)
    io.open(HTML, 'w', encoding='utf-8').write(s)
    print('  escritas %d coordenada(s) en index.html' % len(plan))

    # y el apunte de que estan verificadas, que es lo que evita volver a pedirlas
    import datetime, json
    reg = os.path.join(RAIZ, 'datos', 'verificado.json')
    doc = json.load(io.open(reg, encoding='utf-8')) if os.path.exists(reg) else {'coordenada': {}}
    doc.setdefault('coordenada', {})
    hoy = datetime.date.today().isoformat()
    apuntadas, sinFuente = 0, []
    for pid, i, m, tro, vla, vlo, la, lo, d, cat, tierra, fuente in plan:
        if not fuente.strip():
            sinFuente.append(pid); continue
        doc['coordenada'][pid] = {'fecha': hoy, 'fuente': fuente.strip()}
        apuntadas += 1
    doc['coordenada'] = dict(sorted(doc['coordenada'].items()))
    io.open(reg, 'w', encoding='utf-8').write(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    print('  apuntadas %d como verificadas en datos/verificado.json' % apuntadas)
    for pid in sinFuente:
        print('  --   %s se ha escrito pero NO se apunta: no dijiste de donde sale' % pid)
    return 0


if __name__ == '__main__':
    sys.exit(main())
