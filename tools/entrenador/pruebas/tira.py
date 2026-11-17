# Una tira de fotogramas del reproductor de verdad. Uso:
#   python3 pruebas/tira.py salida.png id "t1,t2,…" [lang] [tema] [amb] [ancho] [js]
import os, sys, asyncio, io
from playwright.async_api import async_playwright
from PIL import Image
AQUI = 'file://' + os.path.dirname(os.path.abspath(__file__))
async def main():
    out, eid, ts = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
    lang = sys.argv[4] if len(sys.argv) > 4 else 'es'
    tema = sys.argv[5] if len(sys.argv) > 5 else 'dia'
    amb = sys.argv[6] if len(sys.argv) > 6 else ''
    w = int(sys.argv[7]) if len(sys.argv) > 7 else 390
    js = sys.argv[8] if len(sys.argv) > 8 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}), args=['--no-sandbox', '--disable-gpu'])
        pg = await b.new_page(viewport={'width': w, 'height': 760}, device_scale_factor=1)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.goto(AQUI + '/ver.html?id=%s&lang=%s&tema=%s%s' % (eid, lang, tema, ('&amb=' + amb) if amb else ''))
        await pg.wait_for_timeout(350)
        if js: await pg.evaluate(js)
        fotos, t0 = [], 0.0
        durs = await pg.evaluate('R.tramos.map(function (t) { return t.dur; })')
        ini = [sum(durs[:i]) for i in range(len(durs))]
        def abs_t(x):
            # 'p2+1.5' (a 1,5 s de empezar el paso 2) · 'c+1' (el cierre) · '12.3' (absoluto)
            if x[0] == 'p': n, _, d = x[1:].partition('+'); return ini[int(n)] + float(d or 0)
            if x[0] == 'c': return ini[-1] + float(x[1:].lstrip('+') or 0)
            return float(x)
        ts = [abs_t(x) for x in ts]
        for t in ts:
            await pg.evaluate('adelanta(%f)' % max(0.0, t - t0)); t0 = t
            await pg.wait_for_timeout(260)
            fotos.append(Image.open(io.BytesIO(await pg.screenshot())))
        W = sum(f.width for f in fotos) + 6 * (len(fotos) - 1)
        tira = Image.new('RGB', (W, fotos[0].height), (20, 24, 32)); x = 0
        for f in fotos: tira.paste(f, (x, 0)); x += f.width + 6
        tira.save(out)
        for e in errs[:12]: print('  consola:', e)
        await b.close()
asyncio.run(main())
