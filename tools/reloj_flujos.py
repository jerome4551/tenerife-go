#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
reloj_flujos.py — ¿llegan a su hora los flujos programados?

    python3 tools/reloj_flujos.py            los precios, franja a franja (git log)
    python3 tools/reloj_flujos.py --github   ademas, cuantas veces lanzo GitHub cada
                                             flujo y por que via (necesita `gh api`)

POR QUE EXISTE. El 7 de octubre los precios de las 15:00 no llegaban. Medido:
desde el 26 de agosto de 2026 el programador de GitHub esta roto para todo el
mundo (github.com/orgs/community/discussions/207346 y 209514): aqui la
notificacion diaria salia de 5 a 7 horas tarde y el cron horario de los
precios solo corria una vez cada ~8 horas. La solucion es un reloj de fuera
(RELOJ-EXTERNO.md). Esto dice si funciona: con el reloj de fuera, cada franja
tiene que llegar a los pocos minutos; con el cron de GitHub solo, horas tarde
o nunca.

No escribe nada.
"""
import collections
import datetime as dt
import json
import os
import subprocess
import sys
from zoneinfo import ZoneInfo

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANARIAS = ZoneInfo('Atlantic/Canary')
REPO = 'jerome4551/tenerife-go'
FLUJOS = ('precios-gasolineras.yml', 'notificacion-diaria.yml')


def franjas_desde(primera, hasta):
    """Las franjas de las 7:00 y las 15:00 de Canarias entre dos instantes."""
    d = primera.astimezone(CANARIAS).date()
    while True:
        for h in (7, 15):
            f = dt.datetime(d.year, d.month, d.day, h, tzinfo=CANARIAS)
            if f < primera:
                continue
            if f > hasta:
                return
            yield f
        d += dt.timedelta(days=1)


def precios():
    o = subprocess.run(['git', 'log', '--format=%aI\t%s', '--grep=^Precios gasolineras: franja'],
                       cwd=RAIZ, capture_output=True, text=True)
    hechas = {}
    for linea in o.stdout.splitlines():
        cuando, asunto = linea.split('\t', 1)
        etiqueta = asunto.split('franja ', 1)[1].split(' (')[0]          # «2026-10-07 07:00»
        f = dt.datetime.strptime(etiqueta, '%Y-%m-%d %H:%M').replace(tzinfo=CANARIAS)
        hechas.setdefault(f, dt.datetime.fromisoformat(cuando))
    print('=== los precios, franja a franja (hora de Canarias) ===')
    if not hechas:
        print('  aun no hay ningun commit de precios')
        return
    ahora = dt.datetime.now(CANARIAS)
    for f in franjas_desde(min(hechas), ahora):
        c = hechas.get(f)
        if c:
            m = int((c - f).total_seconds() // 60)
            txt = '%d min tarde' % m if m < 120 else '%.1f h tarde' % (m / 60)
            print('  %s  llego a las %s  · %s' % (f.strftime('%a %d %H:%M'), c.astimezone(CANARIAS).strftime('%H:%M'), txt))
        else:
            print('  %s  NO LLEGO (la siguiente pasada ya bajo la franja de despues, o aun no ha pasado nadie)'
                  % f.strftime('%a %d %H:%M'))


def github(dias=7):
    desde = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=dias)
    print('\n=== lo que lanzo GitHub en los ultimos %d dias (hora de Canarias) ===' % dias)
    for wf in FLUJOS:
        o = subprocess.run(['gh', 'api', 'repos/%s/actions/workflows/%s/runs?per_page=100' % (REPO, wf)],
                           capture_output=True, text=True)
        if o.returncode:
            print('  %s: no se pudo preguntar a GitHub (%s)' % (wf, (o.stderr or o.stdout).strip()[:120]))
            continue
        porDia = collections.defaultdict(lambda: collections.defaultdict(list))
        for r in json.loads(o.stdout).get('workflow_runs', []):
            t = dt.datetime.fromisoformat(r['created_at'].replace('Z', '+00:00'))
            if t < desde:
                continue
            via = 'cron de GitHub' if r['event'] == 'schedule' else ('a mano o reloj de fuera' if r['event'] == 'workflow_dispatch' else r['event'])
            porDia[t.astimezone(CANARIAS).date()][via].append(t.astimezone(CANARIAS).strftime('%H:%M'))
        print('  ' + wf)
        for d in sorted(porDia):
            print('    %s  ' % d.strftime('%a %d') + ' · '.join('%s: %s' % (v, ' '.join(sorted(h))) for v, h in sorted(porDia[d].items())))


if __name__ == '__main__':
    precios()
    if '--github' in sys.argv[1:]:
        github()
