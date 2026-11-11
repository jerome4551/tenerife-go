# El vídeo de varios ejercicios, en una hoja: dos fotogramas de la escena por paso (al 35 % y al 78 %).
#   python3 pruebas/flujo.py salida.png "id1,id2,…" [lang] [tema] [js]
import os, sys, asyncio, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
AQUI = 'file://' + os.path.dirname(os.path.abspath(__file__))
async def main():
    out, ids = sys.argv[1], sys.argv[2].split(',')
    lang = sys.argv[3] if len(sys.argv) > 3 else 'es'
    tema = sys.argv[4] if len(sys.argv) > 4 else 'dia'
    js = sys.argv[5] if len(sys.argv) > 5 else None
    K = 0.55
    filas = []
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}), args=['--no-sandbox', '--disable-gpu'])
        pg = await b.new_page(viewport={'width': 390, 'height': 760}, device_scale_factor=1)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        for eid in ids:
            await pg.goto(AQUI + '/ver.html?id=%s&lang=%s&tema=%s' % (eid, lang, tema))
            await pg.wait_for_timeout(250)
            if js: await pg.evaluate(js)
            durs = await pg.evaluate('R.tramos.map(function (t) { return t.dur; })')
            ini = [sum(durs[:i]) for i in range(len(durs))]
            ts = []
            for i in range(1, len(durs) - 1): ts += [ini[i] + durs[i] * 0.35, ini[i] + durs[i] * 0.78]
            fotos, t0 = [], 0.0
            esc = pg.locator('.tgv-escena')
            for t in ts:
                await pg.evaluate('adelanta(%f)' % (t - t0)); t0 = t
                await pg.wait_for_timeout(120)
                im = Image.open(io.BytesIO(await esc.screenshot()))
                fotos.append(im.resize((int(im.width * K), int(im.height * K)), Image.LANCZOS))
            filas.append((eid, fotos))
        for e in errs[:12]: print('  consola:', e)
        await b.close()
    w = max(sum(f.width + 3 for f in fs) for _, fs in filas) + 4
    h = sum(fs[0].height + 16 for _, fs in filas) + 4
    hoja = Image.new('RGB', (w, h), (20, 24, 32)); d = ImageDraw.Draw(hoja); y = 2
    for eid, fs in filas:
        d.text((4, y + 1), eid, fill=(255, 255, 255)); y += 14; x = 2
        for f in fs: hoja.paste(f, (x, y)); x += f.width + 3
        y += fs[0].height + 2
    hoja.save(out)
asyncio.run(main())
