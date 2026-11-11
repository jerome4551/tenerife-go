# Graba el vídeo de un ejercicio, cuadro a cuadro (30 por segundo), a 1080 x 1920.
#   python3 pruebas/graba.py salida.mp4 id [lang] [--prueba t1,t2,…]
import sys, asyncio, subprocess, time, os
from playwright.async_api import async_playwright
FPS = 30
AQUI = 'file://' + os.path.dirname(os.path.abspath(__file__))
async def main():
    out, eid = sys.argv[1], sys.argv[2]
    lang = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else 'es'
    prueba = None
    if '--prueba' in sys.argv: prueba = [float(x) for x in sys.argv[sys.argv.index('--prueba') + 1].split(',')]
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': '/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}), args=['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'])
        ctx = await b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2)
        pg = await ctx.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.goto(AQUI + '/graba.html?id=%s&lang=%s' % (eid, lang))
        await pg.evaluate('document.fonts.ready')
        await pg.wait_for_timeout(400)
        total = await pg.evaluate('total')
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send('Animation.enable')
        await pg.evaluate('empieza()')
        if prueba:
            t0 = 0.0
            for i, t in enumerate(prueba):
                n = round((t - t0) * FPS); t0 = t
                await pg.evaluate('(function (n) { for (var i = 0; i < n; i++) paso(1 / %d); })(%d)' % (FPS, n))
                await pg.wait_for_timeout(500)
                await pg.screenshot(path=out.replace('.mp4', '') + '_%d.jpg' % i, type='jpeg', quality=92)
            print('total', round(total, 1), 's'); await b.close(); return
        tmp = out.replace('.mp4', '.parcial.mp4')
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
        # las transiciones de la hoja de estilos, al paso de la grabación (se mide lo que tarda un cuadro)
        t_ini = time.time(); n = 0; fin = False; cola = int(0.7 * FPS); ritmo = 0.25
        await cdp.send('Animation.setPlaybackRate', {'playbackRate': ritmo})
        foto = None
        while True:
            foto = await pg.screenshot(type='jpeg', quality=92)
            ff.stdin.write(foto); n += 1
            if fin:
                cola -= 1
                if cola <= 0: break
            else:
                fin = await pg.evaluate('paso(1 / %d)' % FPS)
            if n % 45 == 0:
                real = (time.time() - t_ini) / n
                nuevo = max(0.05, min(1.0, (1.0 / FPS) / real))
                if abs(nuevo - ritmo) > 0.03:
                    ritmo = nuevo; await cdp.send('Animation.setPlaybackRate', {'playbackRate': ritmo})
        ff.stdin.close(); rc = ff.wait()
        await b.close()
        if rc == 0: os.replace(tmp, out)
        print(out, n, 'cuadros', round(n / FPS, 1), 's', 'ffmpeg', rc, 'ritmo', round(ritmo, 2), 'en', round(time.time() - t_ini), 's')
        for e in errs[:8]: print('  consola:', e)
asyncio.run(main())
