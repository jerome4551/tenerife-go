# El repaso de un ejercicio contra su ficha, paso a paso: una hoja con una fila por paso (el texto del paso, lo que la
# coreografía hace en él, y cinco fotogramas de ese tramo del vídeo: al 8, 30, 52, 74 y 95 %) y, debajo, cinco momentos
# de todo el vídeo desde la vista de «Girar». Es la hoja con la que se coteja «si el paso 2 dice que sube, sube en el 2».
#   python3 pruebas/repaso.py carpeta_de_salida "id1,id2,…" [lang] [escala]
import os, sys, asyncio, io, textwrap
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
AQUI = 'file://' + os.path.dirname(os.path.abspath(__file__))
async def main():
    out, ids = sys.argv[1], sys.argv[2].split(',')
    lang = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else 'es'
    K = float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 0.5
    os.makedirs(out, exist_ok=True)
    try: letra = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except Exception: letra = ImageFont.load_default()
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}), args=['--no-sandbox', '--disable-gpu'])
        pg = await b.new_page(viewport={'width': 390, 'height': 760}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        async def foto(esc):
            im = Image.open(io.BytesIO(await esc.screenshot()))
            return im.resize((int(im.width * K), int(im.height * K)), Image.LANCZOS)
        for eid in ids:
            filas = []
            for vista in (0, 1):
                await pg.goto(AQUI + '/ver.html?id=%s&lang=%s' % (eid, lang))
                await pg.wait_for_timeout(250)
                if vista: await pg.evaluate('R.dir.girar()')
                durs = await pg.evaluate('R.tramos.map(function (t) { return t.dur; })')
                rotulos = await pg.evaluate('R.tramos.map(function (t) { return t.tipo === "paso" ? (t.i + 1) + ". " + t.texto + "   [" + (typeof t.accion === "string" ? t.accion : JSON.stringify(t.accion)).slice(0, 150) + "]" : t.tipo; })')
                ini = [sum(durs[:i]) for i in range(len(durs))]
                t0 = 0.0; esc = pg.locator('.tgv-escena')
                async def hasta(t):
                    nonlocal t0
                    await pg.evaluate('adelanta(%f)' % (t - t0)); t0 = t
                    await pg.wait_for_timeout(60)
                if vista:
                    fotos = []
                    for f in (0.05, 0.27, 0.5, 0.73, 0.96):
                        await hasta(ini[1] + (ini[-1] - ini[1]) * f); fotos.append(await foto(esc))
                    filas.append(('la vista de «Girar»: cinco momentos de todo el vídeo', fotos))
                    continue
                for i in range(1, len(durs) - 1):
                    fotos = []
                    for f in (0.08, 0.30, 0.52, 0.74, 0.95):
                        await hasta(ini[i] + durs[i] * f); fotos.append(await foto(esc))
                    filas.append((rotulos[i] + '  (%.1f s)' % durs[i], fotos))
            W = sum(f.width + 3 for f in filas[0][1]) + 4
            H = sum(fs[0].height + 34 for _, fs in filas) + 22
            hoja = Image.new('RGB', (W, H), (20, 24, 32)); d = ImageDraw.Draw(hoja); y = 2
            d.text((4, y), eid, fill=(245, 199, 107), font=letra); y += 18
            for tx, fs in filas:
                for n, l in enumerate(textwrap.wrap(tx, int(W / 7.4))[:2]): d.text((4, y + n * 15), l, fill=(255, 255, 255), font=letra)
                y += 32; x = 2
                for f in fs: hoja.paste(f, (x, y)); x += f.width + 3
                y += fs[0].height + 2
            hoja.save(os.path.join(out, eid + '.png'))
            print(eid, hoja.size)
        for e in errs[:8]: print('  ', e)
        await b.close()
asyncio.run(main())
