# Planificador de día · lo que queda pendiente

**20 de septiembre de 2026.** Las 16 referencias rotas de `suggestionIds` están
arregladas: las tres zonas ofrecen ahora **exactamente lo que listan**.

```
        antes          ahora
norte   80 de 91  ->   80 de 80
sur     63 de 67  ->   64 de 64
centro  20 de 21  ->   20 de 20
```

Probado en el navegador abriendo el planificador zona por zona: 80, 64 y 20
fichas pintadas, ningún nombre vacío, 0 errores de página. El control de
`auditar_datos.js` está en verde.

**Lo que hay que saber antes de nada:** ninguno de los 16 ids existió jamás
como ficha. Lo dice el historial completo de `index.html`: `git log -S` no
encuentra ni uno solo. No fue un renombrado que dejó cabos sueltos — se
escribieron mal el día que se creó la lista, probablemente de memoria en vez
de copiando. Así que **no se ha perdido nada que funcionara**: esas entradas
llevaban rotas desde el principio.

---

## A · Quitadas sin perder nada (10)

La misma zona ya ofrecía ese sitio con otro id. Quitar el id roto no cambia
una sola línea de lo que ve el usuario.

| id roto | zona | lo que ya se ofrecía en la misma lista |
|---|---|---|
| `taganana` | norte | `nucleo-taganana` «Taganana» |
| `san-andres` | norte | `nucleo-san-andres` «San Andrés» |
| `buenavista` | norte | `ciudad-buenavista` «Buenavista del Norte» |
| `el-sauzal` | norte | `ciudad-sauzal` «El Sauzal» |
| `los-silos` | norte | `ciudad-silos` «Los Silos» |
| `piscinas-bajamar-norte` | norte | `piscinas-bajamar` «Piscinas Naturales de Bajamar» |
| `faro-buenavista` | norte | `faro-teno` «Faro de Teno» |
| `arico` | sur | `ciudad-arico` «Arico» |
| `arafo` | sur | `ciudad-arafo` «Arafo» |
| `granadilla` | sur | `ciudad-granadilla` «Granadilla de Abona» |

Dos merecen una nota, porque no se ven por el id:

- **`faro-buenavista` = `faro-teno`.** No lo he deducido por el nombre: la
  propia ficha de `faro-teno` lleva `cat: "Faro Histórico · Buenavista del
  Norte"`. Es el mismo faro, el de Punta de Teno, y ya estaba en la lista.
- **`el-sauzal` y `los-silos` casi cuelan.** Mi primer arreglo los cambió por
  `nucleo-el-sauzal` y `nucleo-los-silos`, que existen. Al mirar el resultado
  vi que la lista del norte ya llevaba `ciudad-sauzal` y `ciudad-silos` —sin el
  «el» y sin el «los», por eso no cuadraban por patrón de id— y el catálogo
  habría mostrado **el mismo pueblo dos veces**. Rehecho, y el guardia que lo
  detectó está ahora dentro del script: compara por **nombre**, no por id.

## B · Arreglada con el único destino posible (1)

| id roto | zona | ahora | por qué no es adivinar |
|---|---|---|---|
| `los-cristianos` | sur | **`nucleo-los-cristianos`** «Los Cristianos» | es la única ficha de localidad con ese nombre en toda la app, la zona no la ofrecía ya de ninguna otra forma, y sus hermanos del mismo patrón (`taganana`, `san-andres`, `arico`…) apuntan todos al núcleo o a la ciudad |

## C · Pendientes: necesito que elijas (5)

Estas cinco **sí cambian lo que se ofrece**. Están quitadas para que la lista
no mienta, pero dime qué va en cada una y la pongo.

### 1 · `santiago-teide` (zona norte)

Hay **dos fichas y las dos se llaman igual**:

| id | categoría | nombre |
|---|---|---|
| `nucleo-santiago-teide` | `municipio` | Santiago del Teide |
| `ciudad-santiago-teide` | `ciudad` | Santiago del Teide |

No hay forma de saber cuál querías, y el patrón no ayuda: en las mismas listas
unos pueblos entran como `nucleo-` y otros como `ciudad-`. Dato que puede
decidirlo: **`ciudad-santiago-teide` ya está en las zonas sur y centro.**

### 2 · `buenavista` (zona **centro**)

Mismo empate: `nucleo-buenavista` y `ciudad-buenavista`, las dos «Buenavista
del Norte». Pero aquí hay una pregunta antes que esa: **¿pinta algo Buenavista
del Norte en la zona del Teide?** El norte ya la ofrece como
`ciudad-buenavista`. Si estaba en el centro por Masca y Teno Alto —que sí son
de ese municipio— tiene sentido; si fue un copia y pega, se queda fuera y ya
está.

### 3 · `guachinche` (zona norte)

No existe ninguna ficha con ese id. Hay **20 guachinches** y había que elegir
uno (o varios). Estos son:

| `guachinche-talegazo` | Guachinche El Talegazo |
| `guachinche-casa-pedro` | Casa Pedro (Los Realejos) |
| `guachinche-ramon` | Guachinche Ramón |
| `guachinche-cubano` | Guachinche El Cubano |
| `guachinche-romance` | Guachinche Romance |
| `guachinche-ramal` | Guachinche El Ramal |
| `guachinche-ana-eva` | La Huerta de Ana y Eva |
| `guachinche-bodega-sursula` | Guachinche La Bodega (Santa Úrsula) |
| `guachinche-guayero` | Guachinche El Guayero (Tegueste) |
| `guachinche-cordero` | Guachinche El Cordero (Sur) |
| `guachinche-el-primero` | Bodegón El Primero (Santa Úrsula) |
| `guachinche-casa-lito` | Guachinche Casa Lito (Santa Úrsula) |
| `guachinche-corujera` | Guachinche La Corujera (Santa Úrsula) |
| `guachinche-el-patio` | Guachinche El Patio (Tacoronte) |
| `guachinche-basilio` | Guachinche Basilio (La Matanza) |
| `guachinche-parralito` | Guachinche El Parralito (La Matanza) |
| `guachinche-casa-yayi` | Guachinche Casa Yayi (La Matanza) |
| `guachinche-vilaflor` | Guachinche Vi La Flor de Chasna (Vilaflor) |
| `guachinche-san-juan-rambla` | Guachinche San Juan de la Rambla |
| `guachinche-los-silos` | Guachinche El Origen del Trigo (Los Silos) |

Mi sospecha es que se quiso meter «un guachinche» como categoría y se escribió
como si fuera un sitio. Si quieres que la zona norte ofrezca guachinches, dime
cuáles y los pongo; si prefieres que el planificador ofrezca la **categoría**
entera, eso es otra cosa y hay que tocar código, no la lista.

### 4 · `fajana` (zona norte)

**No hay nada en la app que se llame así**, ni parecido: he buscado «fajana»
en los 803 nombres y en los 803 ids y no sale. Las que hay cerca en el mismo
tramo de la lista son charcos del norte (`charco-laja`, `charco-viento`,
`charco-verde-realejos`). Dime qué era y, si no está en la app, si quieres que
lo demos de alta — con su fuente, como siempre.

### 5 · `farola-mar-santa-cruz` (zona norte)

Esta se arregla sola. Alguien quiso ofrecer **la Farola del Mar** en el
planificador antes de que existiera la ficha, y es exactamente la ficha que el
parche «auditoria-mar-8» quiere crear a partir de
`faro-santa-cruz-puerto`. Sigue pendiente por la coordenada (cae en tierra
pero a 1,4 m de la costa, y el parche exige 3 m). **Cuando llegue esa
coordenada, la entrada vuelve al norte con el id que tenga la ficha.**

---

## Y de propina: dos nombres repetidos que ya estaban

No es un fallo y no suspende nada, pero el catálogo muestra dos veces el mismo
rótulo y no hay manera de saber cuál es cuál:

| zona | rótulo | las dos fichas |
|---|---|---|
| norte | «Mesa del Mar» | `mesa-mar` (piscinas) · `nucleo-mesa-mar` (municipio) |
| sur | «Playa San Juan» | `san-juan` (playa) · `nucleo-playa-san-juan` (municipio) |

Puede ser correcto —una playa y un pueblo pueden llamarse igual— pero en una
lista de sugerencias se leen como un duplicado. Si quieres, se distinguen
poniéndole al núcleo el rótulo del municipio. Dímelo y lo hago.

El control lo lista cada vez, en `auditar_datos.js`, para que no se pierda de
vista.
