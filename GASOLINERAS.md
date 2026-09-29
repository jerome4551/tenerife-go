# Gasolineras · estado

## Lo primero: la descarga está bloqueada

Probé los dos dominios del registro del Ministerio y los dos dan `000`:

```
sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/…/FiltroProvincia/38   000
energia.serviciosmin.gob.es/ServiciosRESTCarburantes/…/FiltroProvincia/38       000
```

El LEEME dice parar ahí, y paro. **Bájalo tú del navegador y súbelo a
`datos/gasolineras/miteco_provincia38_AAAA-MM-DD.json`.**

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/38
```

Con eso, `python3 tools/gasolineras.py` hace todo lo demás de una vez.

---

## Lo que sí he podido hacer sin el registro

He cruzado las **20 gasolineras de la app** con el polígono del Cabildo y con los
surtidores que hay de verdad en el mapa, **de cualquier marca**. No sustituye al
registro, pero ya señala dónde está el problema.

### 14 tienen un surtidor encima (≤ 31 m)

`gas-tf1-abades` (PCAN a 1 m) · `gas-tf1-granadilla` (Repsol a 7 m) ·
`gas-tf1-guaza` (BP a 3 m) · `gas-tf1-guimar` (BP a 23 m) ·
`gas-tf2-aeropuerto` (BP a 5 m) · `gas-tf2-lalaguna` (Moeve a 7 m) ·
`gas-tf21-aguamansa` (Moeve a 11 m) · `gas-tf5-el-bohio` (DISA a 31 m) ·
`gas-tf5-el-sauzal` (a 13 m) · `gas-tf5-lalaguna` (a 18 m) ·
`gas-tf5-los-realejos` (DISA a 2 m) · `gas-tf5-ptocz` (BP a 6 m) ·
`gas-tf5-tacoronte` (Moeve a 8 m) · `gas-tf51-vilaflor` (DISA a 12 m) ·
`gas-tf82-guia-isora` (Shell a 13 m)

Las tres que dicen **Cepsa** tienen un **Moeve** encima. Es la misma marca con el
nombre nuevo, así que están bien.

### 6 tienen algo que mirar

| ficha | qué pasa |
|---|---|
| **`gas-tf1-guaza2`** | **la que tú viste.** Dice «Cepsa Los Cristianos (TF-1 km 19)» y el pin está junto al **Centro de Golf Los Palos** y **Guaza del Medio**. El único surtidor en 2 km es un **BP a 685 m** — y ese BP ya es otra ficha de la app, `gas-tf1-guaza`. Puede ser un duplicado fantasma. |
| **`gas-tf82-los-gigantes`** | «DISA Los Gigantes» y **no hay ningún surtidor en 1,5 km**. El DISA más cercano está a **2,5 km**, en Santiago del Teide, y hay un Cepsa a 1,8 km en Guía de Isora. |
| **`gas-tf1-adeje`** | «Repsol Costa Adeje». Moeve a 707 m y a 873 m, BP a 1,8 km. **Repsol, ninguno hasta 4,8 km.** |
| **`gas-tf5-icod`** | «Repsol Icod». DISA a 694 m, Moeve a 1,3 km, Shell a 1,4 km. **Repsol, ninguno hasta 6,8 km.** |
| **`gas-tf1-candelaria`** | «Cepsa Candelaria». DISA a 892 m y nada más en 2 km; el Moeve más cercano, a 5,4 km. |
| **`gas-tf1-guimar`** | «BP Güímar» y el polígono dice **Arafo**. El BP está a 23 m, o sea que el pin está bien y **el municipio del nombre no**. |

**`gas-tf1-guimar` es un hallazgo nuevo y explica un hueco del bloque 4**: aquel
control lee el municipio del `cat` y del paréntesis del nombre, y esta ficha se
llama «BP Güímar **(TF-1)**» con el `cat` «Gasolinera · TF-1 Este». Nunca declaró
municipio, así que nunca se comprobó. Lo mismo puede pasarle a otras.

---

## Lo que haré en cuanto suba el registro

`tools/gasolineras.py` está escrito y probado (para limpio si falta el fichero):

1. Se queda con Tenerife (la provincia 38 trae también La Palma, La Gomera y El
   Hierro), con las de **venta al público**, y convierte la coma decimal.
2. Asigna municipio **por point-in-polygon** y marca dónde discrepa del campo
   `Municipio` del registro.
3. Clasifica cada ficha: `confirmada` · `corregir_coordenada` ·
   `marca_distinta` · `no_existe_en_registro`, guardando el **IDEESS**.
4. Localiza tus 20 capturas en el registro por CP + marca.
5. Escribe `gasolineras_verificacion.json` y `gasolineras_altas.json`.

**No toca `index.html`.** Los precios no entran nunca: son datos perecederos.

---

## Las capturas: qué son y qué dan (29 de septiembre)

Aclarado: **no son el registro**, son tu recorrido — fuiste una por una por todas
las gasolineras de la isla, y en vez de 60 capturas tienes la lista transcrita.
Lo que llegó es el **lote 1: 20 estaciones**.

He escrito `python3 tools/gasolineras.py --sin-registro`, que empareja cada
captura con los surtidores del mapa del repositorio: misma marca, mismo municipio
y la calle de la dirección comprobada contra la red de calles.

**Resultado del lote 1:**

| | |
|---|---|
| identificadas con la calle coincidiendo | **4** |
| varias candidatas con la calle | 3 |
| ninguna casa por calle | 13 |

Las cuatro claras: **Petroprix** en C. Anaga (Los Realejos), **Shell Las Dehesas**
en C. El Toscal, **DISA** en C. Virgen de Begoña (La Laguna) y **DISA** de la Av.
Trinidad. Las otras fallan casi siempre porque la dirección de Google y el nombre
de la calle en el mapa no se escriben igual («Carr. Gral. del Nte.» contra lo que
ponga OSM), no porque la estación no exista.

### Lo que esto NO da

**Ninguna coordenada.** Lo que sale de aquí es de OpenStreetMap, no del registro,
y no trae **IDEESS**. Sirve para saber *cuál* es cada estación, no para escribir
nada en la app. Por eso el fichero se llama
`capturas_contra_el_mapa_PROVISIONAL.json` y lleva el aviso dentro.

### Y algo que no esperaba

Los municipios del lote 1 y los de las fichas de la app **casi no se tocan**:

- **Lote 1**: La Laguna, Santa Cruz, Los Realejos, El Sauzal, El Rosario.
- **Las 20 de la app**: repartidas por **17 municipios**, casi todas en autopista.
- **En los dos lados: sólo 2** — El Sauzal y Los Realejos.

O sea que **el lote 1 apenas sirve para verificar las fichas que ya hay**: es
sobre todo inventario de estaciones nuevas.

## Entonces, ¿mando las otras tandas?

**Sí.** Por dos razones:

1. Es donde van a aparecer las gasolineras que la app ya tiene, que están en el
   sur y en las autopistas. El lote 1 no las toca.
2. Es el inventario de lo que existe de verdad, y eso es lo que dice cuáles de
   las 20 de la app son fantasmas.

**Pero el registro sigue haciendo falta**, y vale más que las 60 capturas: es lo
único que da coordenada oficial e IDEESS. Las capturas dicen *qué* hay; el
registro dice *dónde* está y permite volver a sincronizar mañana.
