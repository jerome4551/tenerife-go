"""Lo que tiene que leer el navegador, byte a byte, y la variante en color del PNG gris.
Solo para la prueba de WebKit de la rama de trabajo (no va a main). python3 prueba-webkit/variantes.py"""
import os
from PIL import Image
os.makedirs('prueba-webkit/out', exist_ok=True)
rel = Image.open('mapa/tenerife-relieve.png')
ao = Image.open('mapa/tenerife-relieve-ao.png')
assert rel.mode == 'RGB' and ao.mode == 'L', (rel.mode, ao.mode)
open('prueba-webkit/out/esperado-relieve.bin', 'wb').write(rel.tobytes())
open('prueba-webkit/out/esperado-ao.bin', 'wb').write(ao.tobytes())
ao.convert('RGB').save('prueba-webkit/out/ao-rgb.png', optimize=True)
print('relieve', rel.size, rel.mode, '· ao', ao.size, ao.mode, '· ao-rgb', os.path.getsize('prueba-webkit/out/ao-rgb.png'), 'bytes')
