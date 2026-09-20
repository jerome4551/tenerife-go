# Planificador de día · decidido y pendiente

**20 de septiembre de 2026.** Las 16 referencias rotas de `suggestionIds` están
resueltas con tus decisiones, más dos faros del sur que estaban en la lista del
norte. Las tres zonas ofrecen **exactamente lo que listan**.

```
        antes          ahora
norte   80 de 91  ->   77 de 77
sur     63 de 67  ->   64 de 64
cumbre  20 de 21  ->   17 de 17
```

**Ninguno de los 16 ids existió jamás como ficha**: `git log -S` sobre todo el
historial de `index.html` no encuentra ni uno. Se escribieron mal el día que se
creó la lista. No había nada que restaurar.

---

## 1 · Cerrado con tu decisión

| id | zona | qué se ha hecho |
|---|---|---|
| `santiago-teide` | norte | **quitado, sin sustituto** |
| `buenavista` | centro | **quitado, sin sustituto** |
| `guachinche` | norte | **quitado** |
| `fajana` | norte | **quitado**, y anotado abajo como candidata a alta |
| `farola-mar-santa-cruz` | norte | **quitado**, con la regla que diste escrita abajo |
| `faro-rasca` | norte | **quitado del norte**, sigue en el sur |
| `faro-abona` | norte | **quitado del norte**, sigue en el sur |

Y de la tanda anterior, ya aplicadas: diez quitadas sin perder nada (la zona ya
ofrecía el sitio con otro id) y una cambiada, `los-cristianos` →
`nucleo-los-cristianos`.

**Tu regla del patrón, comprobada.** Dijiste que las listas usan `ciudad-*`
para las cabeceras municipales y `nucleo-*` solo para núcleos que no lo son.
Se cumple: los **30** `ciudad-*` son cabeceras, y de los **41** `nucleo-*`,
**25** son núcleos que no son cabecera (Bajamar, Los Cristianos, Taganana, San
Andrés, La Caleta, Las Galletas…). Los otros 16 son el duplicado del que
hablas. Con dos excepciones que salen abajo.

**Los dos faros, confirmado por la coordenada:** `faro-rasca` está en
28.0012, −16.6943 (Punta de la Rasca, Arona) y `faro-abona` en
28.148, −16.4272 (Arico). Los dos estaban en las **dos** listas.

## 2 · `farola-mar-santa-cruz` · la regla, corregida

Tenías razón y yo lo dije mal: **el parche «auditoria-mar-8» no crea ese id**.
Conserva `faro-santa-cruz-puerto` y solo le cambia el `name`, los textos y la
coordenada. Así que la referencia no vuelve sola. Lo que hay que hacer cuando
se resuelva esa ficha:

- **Si sale APLICADA** → poner **`faro-santa-cruz-puerto`** en la lista norte,
  en el sitio donde estaba la rota.
- **Si queda PENDIENTE** → no poner nada, que es lo que hay ahora. Sugerir la
  ficha vieja sería mandar a alguien a un pin que está **444 m mar adentro**.

Hoy `faro-santa-cruz-puerto` **no está en ninguna de las tres listas**, que es
lo correcto mientras siga pendiente.

## 3 · Candidata a alta: Playa de la Fajana (Los Realejos)

Quitada de la lista y anotada aquí. Lo que hay:

- **Existe**, pero **no tiene ficha** en la app. Buscado «fajana» en los 803
  ids, los 803 nombres, los alias y las descripciones: cero resultados.
- **No entra hasta tener coordenada de fuente oficial** — Censo de aguas de
  baño, Ayuntamiento de Los Realejos o Turismo de Tenerife. Aquí no se
  inventan.
- **Que no se confunda con La Fajana de Barlovento**, que es un complejo de
  tres piscinas naturales en el noreste de **La Palma**. Otro sitio y otra
  isla.

## 4 · A revisar en otra tanda, sin tocar: `charco-verde-realejos`

No se ha tocado, como dijiste. Lo que se ve desde aquí:

- Su coordenada es **28.3963, −16.659**, y su `cat` dice «Piscina Natural ·
  Los Realejos».
- Ese punto cae **a poco más de 1 km al oeste del casco de San Juan de la
  Rambla**, o sea en otro municipio.
- El control de costa lo mide a **297 m de la orilla**, tierra adentro, que
  para una piscina natural ya es raro de por sí.

## 5 · La tanda de los duplicados, ya inventariada

Confirmado y con una corrección al alza: **son 17 pares, no 16**.

Los 16 que dices, con **nombre idéntico y coordenada idéntica (0 m)**:

| cabecera | se queda | se borra |
|---|---|---|
| Arafo | `ciudad-arafo` | `nucleo-arafo` |
| Arico | `ciudad-arico` | `nucleo-arico` |
| Buenavista del Norte | `ciudad-buenavista` | `nucleo-buenavista` |
| El Rosario | `ciudad-rosario` | `nucleo-el-rosario` |
| El Sauzal | `ciudad-sauzal` | `nucleo-el-sauzal` |
| El Tanque | `ciudad-tanque` | `nucleo-el-tanque` |
| Fasnia | `ciudad-fasnia` | `nucleo-fasnia` |
| Granadilla de Abona | `ciudad-granadilla` | `nucleo-granadilla` |
| La Guancha | `ciudad-guancha` | `nucleo-la-guancha` |
| La Matanza de Acentejo | `ciudad-matanza` | `nucleo-la-matanza` |
| La Victoria de Acentejo | `ciudad-victoria` | `nucleo-la-victoria` |
| Los Silos | `ciudad-silos` | `nucleo-los-silos` |
| San Juan de la Rambla | `ciudad-san-juan-rambla` | `nucleo-san-juan-rambla` |
| Santa Úrsula | `ciudad-santa-ursula` | `nucleo-santa-ursula` |
| Santiago del Teide | `ciudad-santiago-teide` | `nucleo-santiago-teide` |
| Tegueste | `ciudad-tegueste` | `nucleo-tegueste` |

**Y el decimoséptimo, que no salía por nombre: Vilaflor.**
`ciudad-vilaflor` se llama «Vilaflor de Chasna» (el nombre del municipio) y
`nucleo-vilaflor` se llama «Vilaflor» (el del pueblo). **Misma coordenada
exacta**, 28.1589, −16.637, y las dos descripciones dicen lo mismo: «el pueblo
más alto de España a 1.400 m». Buscando por nombre no aparecía; buscando por
distancia, sí.

**Buena noticia para la tanda: no hay nada que reapuntar.** Dijiste de
reapuntar a `ciudad-*` las referencias que tuvieran los `nucleo-*`
duplicados. He mirado uno por uno: **los 17 tienen cero referencias** en todo
`index.html`. Así que la tanda es solo borrar: la ficha y sus textos en los
nueve `idiomas/*.json`. Sin efectos colaterales.

### Dos cosas más para esa misma tanda

**Guía de Isora no tiene `ciudad-*`.** Es cabecera municipal y está solo como
`nucleo-guia-isora` (28.2111, −16.7788), con 1 referencia en la lista sur. Por
eso hay **30** `ciudad-*` y no 31: es el municipio que falta. Es la otra cara
del mismo desorden y rompe tu regla. Decide si se renombra o se acepta.

**`nucleo-puerto-cruz-old`.** El sufijo `-old` canta. Se llama «La Ranilla
(Puerto Cruz)» y está a **69 m** de `ciudad-puerto-cruz`. El nombre es
distinto y La Ranilla es un barrio de verdad, así que puede ser legítimo,
pero conviene mirarlo con los demás.

---

## 6 · Dos controles nuevos, los dos inventario

Ninguno suspende. Salen impresos cada vez para que no sean un silencio.

**Rótulos repetidos dentro de una zona** — dos fichas con el mismo nombre se
leen como un duplicado en el catálogo:

| zona | rótulo | las dos fichas |
|---|---|---|
| norte | «Mesa del Mar» | `mesa-mar` (piscinas) · `nucleo-mesa-mar` (municipio) |
| sur | «Playa San Juan» | `san-juan` (playa) · `nucleo-playa-san-juan` (municipio) |

**Sitios ofrecidos en más de una zona** — este es el que cazó a los dos faros
del sur, y después a cuatro más. Quedan **4**, y los cuatro se sostienen:

```
ciudad-rosario          north + cumbre    su propia ficha dice «Cumbre Dorsal»
riscos-chio             south + cumbre    lavas del Chio de 1798, con vistas al Teide
ciudad-santiago-teide   south + cumbre    925 m, puerta oeste del parque
ciudad-vilaflor         south + cumbre    1.400 m, puerta sur del parque
```

### Lo que salió de esa lista y ya está arreglado

**`masca` estaba en norte y sur.** No era cuestión de elegir: en la costa
oeste las listas tienen una costura clara, y Masca cae por debajo de ella.

```
lat      ficha                    zona     su propia cat
28.374   montana-taco             norte    Volcán · La Laguna
28.3718  ciudad-buenavista        norte    Isla Baja · Teno
28.371   charco-diablo            norte    Piscinas · Buenavista
28.3655  ciudad-silos             norte    Pueblo · Isla Baja
28.3421  faro-teno                norte    Buenavista del Norte
───────────────────── la costura ─────────────────────
28.306   mirador-maska            sur      Mirador · Teno
28.3054  masca                    ← estaba en las dos
28.2974  ciudad-santiago-teide    sur      Pueblo de Montaña · Oeste
28.2947  ruta-masca-playa         sur      Barranco · Masca
28.2744  acantilados-gigantes     sur      Acantilados · Oeste
28.2456  nucleo-los-gigantes      sur      Puerto · Oeste
```

Su mirador está a **70 m**, su barranco y su propio municipio están en el sur.
Masca era la única ficha del sitio que además estaba en el norte. **Fuera del
norte.**

**Y tres no eran «Cumbre».** La zona Cumbre es el Parque Nacional y sus
puertas; estas tres son costa y macizo de Teno, y ya estaban en el sur:

| ficha | lo que dice su propia ficha |
|---|---|
| `acantilados-gigantes` | «acantilados de hasta **600 m**, la forma más espectacular de verlos es **desde el mar en barco**» |
| `mirador-maska` | «Mirador · **Teno**» |
| `ruta-masca-playa` | «Barranco · Masca», el que **baja hasta la playa** |

Las tres siguen en el sur, que es donde caen. La cumbre pasa de 20 a 17.

**Si la zona Cumbre estaba pensada como el circuito «Teide + Masca en un
día»** —que es una excursión real, bajando por la TF-38— dímelo y las vuelvo
a poner. No lo he encontrado escrito en ninguna ficha: ninguna de las tres
menciona el Teide ni la carretera del parque.
