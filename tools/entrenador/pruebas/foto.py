# Abre una pagina local en Chrome sin cabeza y guarda capturas. Uso:
#   python3 pruebas/foto.py URL salida.png [ancho alto] [espera_ms] [js a evaluar antes]
import os, sys, asyncio
from playwright.async_api import async_playwright
async def main():
    url, out = sys.argv[1], sys.argv[2]
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 900
    h = int(sys.argv[4]) if len(sys.argv) > 4 else 700
    espera = int(sys.argv[5]) if len(sys.argv) > 5 else 300
    js = sys.argv[6] if len(sys.argv) > 6 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}), args=['--no-sandbox', '--disable-gpu'])
        pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.goto(url)
        if js: await pg.evaluate(js)
        await pg.wait_for_timeout(espera)
        await pg.screenshot(path=out)
        for e in errs[:12]: print('  consola:', e)
        await b.close()
asyncio.run(main())
