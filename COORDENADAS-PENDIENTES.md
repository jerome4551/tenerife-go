# Coordenadas que faltan

Ocho lugares tienen el pin en el agua. Para cada uno hace falta la
coordenada de verdad: **aquí no se inventan**.

Cómo mandarlas: cualquier formato vale, pero lo más cómodo es una línea por
sitio con `id lat lng`. Se aplican con

```
python3 tools/fijar_coordenada.py --fichero nuevas.txt
```

que **comprueba cada una antes de escribir** (que el id exista, que caiga
dentro de Tenerife, que **caiga en tierra**, y cuántos metros se mueve) y no
escribe nada si alguna falla.

Para sacar una coordenada en Google Maps: pulsación larga sobre el punto →
aparecen los dos números → el primero es `lat`, el segundo `lng`.

---

## Las cuatro que rompen la auditoría

### 1 · `montana-colorada` — Montaña Colorada (Fasnia)
- **Ahora**: `28.2215, -16.3869` → **2.220 m mar adentro**
- **La ficha dice**: «Cono volcánico de un rojo intenso, visible desde la
  autopista del sur. Uno de los más fotogénicos de la costa este.»
- **El problema**: OpenStreetMap tiene **cinco** montañas llamadas «Montaña
  Colorada» en Tenerife y **ninguna cerca de Fasnia**. La más próxima a ese
  punto es **Montaña de Fasnia**, a 4,5 km, que es otro cerro con otro
  nombre.
- **Lo que necesito**: la coordenada del cono. Y antes de eso, **confirmar
  que existe y se llama así**: puede ser el mismo caso que el
  `charco-infierno-arafo`, que resultó no existir y se quitó.

### 2 · `windsurf-el-poris` — El Porís de Abona, kitesurf avanzado
- **Ahora**: `28.1540, -16.4160` → **1.003 m mar adentro**
- **La ficha dice**: «spot de kitesurf para avanzados, viento NNE fuerte,
  municipio de Arico»
- **El problema**: hay tres playas candidatas cerca —Playa Grande, Playa el
  Porís y Playa Cardones— y no sé en cuál se hace.
- **Lo que necesito**: la coordenada de la playa desde la que se entra al
  agua. (Si el pin debe ir en el agua porque es un spot de mar, dímelo y lo
  declaro como los puertos.)

### 3 · `faro-santa-cruz-puerto` — Faro del Puerto de Santa Cruz
- **Ahora**: `28.4789, -16.2289` → **444 m mar adentro**
- **La ficha dice**: «Torre cilíndrica blanca con franja roja **situada en
  el dique de abrigo**, en la bocana del puerto»
- **El problema**: la capa de puntos de OpenStreetMap del proyecto tiene
  **cero faros** en toda la isla.
- **Lo que necesito**: la coordenada de la punta del dique donde está la
  torre.

### 4 · `pk-poris-abona` — Aparcamiento Porís de Abona
- **Ahora**: `28.1631, -16.4308` → **82 m mar adentro**
- **La ficha dice**: «estacionamiento en superficie y batería **frente al
  mar**, acceso desde la bajada de la autopista por la Calle Real»
- **El problema**: OpenStreetMap no tiene **ningún** aparcamiento a menos de
  1,5 km de ahí.
- **Lo que necesito**: un punto en la Calle Real, del lado de tierra.

---

## Las cuatro que están justo en la orilla

Estas se salen por poco. Puede ser el dibujo generalizado de la costa, o
puede ser que estén mal de verdad: **en tus capturas la ermita se veía en el
agua**, así que al menos esa lo está.

| id | ahora | se sale | qué dice la ficha |
|---|---|---|---|
| `lidl-puerto-cruz` | `28.4200, -16.5450` | 46 m | «en la Carretera General Icod-Santa Cruz». Hay **dos** Lidl a 2,2 km del centro y no sé cuál es |
| `pk-bajamar-piscinas` | `28.5562, -16.3458` | 28 m | «bajando por la Avenida Gran Poder hasta el paseo marítimo» |
| `whale-watching` | `28.0780, -16.7364` | 23 m | sale de Puerto Colón; si el pin va en el muelle, dime dónde |
| `ermita-san-telmo` | `28.4176, -16.5472` | 19 m | «junto al mar en el barrio de La Ranilla»; el Paseo de San Telmo está 70 m al este |

---

## Los ocho que están en el agua a propósito

No hace falta tocarlos, pero **dime si prefieres que el pin vaya en el
muelle** en vez de en la dársena. Hoy el control los lista aparte y no los
cuenta como fallo.

| id | se mete | qué es |
|---|---|---|
| `puertito-poris-abona` | 241 m | embarcadero de Porís |
| `puerto-granadilla-comercial` | 216 m | puerto industrial, sin acceso público |
| `puerto-colon-adeje` | 150 m | puerto deportivo de Costa Adeje |
| `puerto-los-cristianos` | 47 m | puerto de ferris |
| `puerto-garachico` | 14 m | puerto de Garachico |
| `puerto-marina-tenerife-sc` | 5 m | Marina Tenerife |
| `piscina-hidalgo-norte` | 3 m | piscina natural |
| `puertito-fasnia` | 1 m | puertito de Fasnia |

---

## Ya corregidas, por si quieres revisarlas

Estas seis se movieron con el dato de OpenStreetMap, que tiene el sitio con
el mismo nombre y el tipo compatible:

| id | de | a |
|---|---|---|
| `golf-del-sur` | 28.0170, −16.5770 | **28.03749, −16.60762** |
| `lidl-santa-cruz` | 28.4500, −16.2600 | **28.45818, −16.25843** |
| `nucleo-los-gigantes` | 28.2475, −16.8422 | **28.24564, −16.84014** |
| `wc-gigantes` | 28.2475, −16.8422 | **28.24564, −16.84014** |
| `nucleo-san-andres` | 28.50291, −16.19195 | **28.50550, −16.19250** |
| `nucleo-costa-adeje` | 28.0910, −16.7450 | **28.08698, −16.73580** |
