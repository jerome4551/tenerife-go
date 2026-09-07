# Las 65 zonas de baño sin orientación

Generado, no escrito a mano: `node tools/faltan_orientacion.js --md`. En cuanto
entre una orientación nueva la lista se acorta sola.

De los **99 puntos de baño** de la app (73 playas + 26 charcos), **34 tienen
orientación** en `PLAYAS_ORIENTACION` y **65 no**. Estos son los 65: 39 playas
y 26 charcos.

## Qué hay que rellenar

Dos casillas por fila:

- **mira a…** — hacia dónde da la playa: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW` (en inglés, como en el código: `W`, no `O`).
  Es la dirección hacia el mar mirando desde la arena.
- **vientos malos** — los rumbos que la estropean, separados por coma. Va en
  `badWind`. Puede quedar vacío: Las Vistas mira al S y al SE y **no** tiene
  `badWind`, porque el alisio del NE entra ahí de tierra a mar y encima lo
  frenan el relieve y la Montaña de Guaza.

No hace falta que las rellenes todas de una vez. Cada fila que llegue entra en
«¿dónde me baño hoy?» sin tocar nada más.

## Cómo se lee la tabla

| columna | de dónde sale |
|---|---|
| **coordenadas** | de `places[]`, tal cual |
| **al mar** | distancia al anillo de costa GSHHG, **al segmento**. Es tosca (250–500 m en las calas) y sirve para saber si el pin es bueno |
| **municipio** | **no está en `places[]`**: sale de la marquesina de TITSA más cercana. Con ⚠️ cuando esa parada está a más de 1,5 km, y entonces es una pista, no un dato |
| **agua** | `aguaCalidad` del censo oficial 2025, con su año |
| **socorr.** | `si` / `no` / `?`. La interrogación es *no se sabe*, y no afirma nada |

## Uno menos que ayer

Esta lista tenía 66. `charco-infierno-arafo` estaba a 10,2 km del mar, y al
buscarlo **no existe**: no hay ningún «Charco del Infierno» en Arafo. El
Barranco del Infierno es de Adeje, es un barranco de senderismo, y ya está en
la app aparte. Se ha quitado el punto — no se corrige lo que no existe.

## Por qué no te las puedo rellenar yo

Lo intenté con la costa de OSM que la app ya lleva —mucho mejor que la GSHHG
del primer intento— y **tampoco pasa el control**:

| método | exactas de las 12 escritas a mano |
|---|---|
| GSHHG, abanico de rayos *(el primer intento)* | 10 de 22 |
| OSM, media circular de por dónde hay agua | **6 de 12** |
| OSM, normal a la línea de costa | **5 de 12** |

Los tres rondan el 45–50 %. Y lo que lo aclara es el barrido de radios: la
media circular acierta 6 de 12 mirando a 200–500 m, y **baja a 1 de 12 mirando
a 50 m**. Si el problema fuera la fidelidad de la costa, acercarse tendría que
mejorarlo. Lo empeora.

Así que mi diagnóstico anterior era el equivocado. No falta «una costa con
fidelidad ≤ 50 m»: esa costa lleva en el repositorio desde septiembre y no
arregla nada. Lo que pasa es que **`ori` no es «por dónde hay mar»** — es hacia
dónde da el frente de la playa, que lo decide el trazado de la orilla y por
dónde entra la mar de fondo. Y `badWind` no es geométrico en absoluto: Las
Vistas no lleva `NE` porque el alisio entra allí de tierra a mar y encima lo
frenan el relieve y la Montaña de Guaza. Eso no está en ningún polígono.

Es conocimiento del sitio. Por eso la tabla tiene casillas y no propuestas: una
orientación inventada no se nota, y manda a alguien a una playa con el mar de
cara.

**Dos que sí conviene que mires**, porque los dos métodos de OSM coinciden
entre sí y discrepan de lo escrito a mano: `teresitas` (a mano `NE`, geometría
`SE` ~155°) y `playa-amarilla` (a mano `SW`, geometría `SE` ~141°). No las he
tocado — las escritas a mano son el control por decisión del proyecto.

Se vuelve a medir con:

```bash
python3 tools/orientacion_osm.py            # solo el control
python3 tools/orientacion_osm.py --todas    # y qué propondría para las 66
```

---

| # | punto | tipo | municipio | coordenadas | al mar | agua | socorr. | aviso | mira a… | vientos malos |
|---:|---|---|---|---|---:|---|:---:|---|---|---|
| 1 | **Playa de El Bobo**<br><code>playa-bobo</code> | playa | Adeje | `28.0718, -16.733` | 172 m | excelente 2025 | ? | — | ☐ | ☐ |
| 2 | **Playa de la Enramada**<br><code>playa-enramada</code> | playa | Adeje | `28.0982, -16.752` | 123 m | excelente 2025 | ? | — | ☐ | ☐ |
| 3 | **Playa de Troya ♿**<br><code>acc-playa-troya</code> | playa | Adeje | `28.0682, -16.7329` | 311 m | excelente 2025 | ? | — | ☐ | ☐ |
| 4 | **Playa El Beril**<br><code>playa-beril</code> | playa | Adeje | `28.0932, -16.748` | 16 m | — | ? | — | ☐ | ☐ |
| 5 | **Playa La Pinta**<br><code>playa-pinta</code> | playa | Adeje | `28.0799, -16.7353` | 231 m | excelente 2025 | ? | — | ☐ | ☐ |
| 6 | **Piscinas Porís de Abona**<br><code>piscinas-poris</code> | charco | Arico | `28.1553, -16.4367` | 614 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 7 | **Playa de la Jaca**<br><code>playa-jaca</code> | playa | Arico | `28.1197, -16.4633` | 563 m | — | ? | — | ☐ | ☐ |
| 8 | **Playa de Los Abriguitos (Abades)**<br><code>playa-abriguitos</code> | playa | Arico | `28.1431, -16.4386` | 467 m | excelente 2025 | ? | — | ☐ | ☐ |
| 9 | **Playa del Porís ♿**<br><code>acc-playa-poris</code> | playa | Arico | `28.1643, -16.4318` | 541 m | excelente 2025 | ? | — | ☐ | ☐ |
| 10 | **Playa Grande (Abades)**<br><code>playa-grande-abades</code> | playa | Arico | `28.1525, -16.4318` | 162 m | — | ? | — | ☐ | ☐ |
| 11 | **Playa de Los Cristianos ♿**<br><code>acc-playa-los-cristianos</code> | playa | Arona | `28.0504, -16.7188` | 100 m | excelente 2025 | ? | — | ☐ | ☐ |
| 12 | **Playa Las Galletas**<br><code>playa-galletas</code> | playa | Arona | `28.0089, -16.6618` | 342 m | excelente 2025 | ? | — | ☐ | ☐ |
| 13 | **Charco del Diablo**<br><code>charco-diablo</code> | charco | Buenavista del Norte | `28.371, -16.8591` | 493 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 14 | **Charco Roque**<br><code>charco-roque</code> | charco | Buenavista del Norte | `28.3701, -16.8766` | 215 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 15 | **Playa Punta del Fraile**<br><code>playa-punta-fraile</code> | playa | Buenavista del Norte | `28.3688, -16.8788` | 26 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 16 | **Playa de Candelaria**<br><code>playa-candelaria</code> | playa | Candelaria | `28.3543, -16.3698` | 429 m | buena 2025 | ? | — | ☐ | ☐ |
| 17 | **Playa de Punta Larga**<br><code>playa-punta-larga</code> | playa | Candelaria | `28.3689, -16.3615` | 351 m | excelente 2025 | ? | — | ☐ | ☐ |
| 18 | **Playa de La Nea**<br><code>playa-nea</code> | playa | El Rosario | `28.4043, -16.3181` | 330 m | excelente 2025 | ? | — | ☐ | ☐ |
| 19 | **Playa de Radazul**<br><code>playa-radazul</code> | playa | El Rosario | `28.4017, -16.3261` | 51 m | — | ? | — | ☐ | ☐ |
| 20 | **Playa Tabaiba**<br><code>playa-tabaiba</code> | playa | El Rosario | `28.4021, -16.3304` | 225 m | — | ? | — | ☐ | ☐ |
| 21 | **Playa de Rojas**<br><code>playa-rojas</code> | playa | El Sauzal | `28.4685, -16.4557` | 216 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 22 | **Charcos de El Gomero**<br><code>charco-gomero</code> | charco | Garachico | `28.3734, -16.7809` | 314 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 23 | **Piscinas El Caletón (Garachico)**<br><code>piscinas-garachico</code> | charco | Garachico | `28.3735, -16.7661` | 67 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 24 | **Playa del Guincho**<br><code>playa-guincho</code> | playa | Garachico | `28.3781, -16.7405` | 173 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 25 | **Playa del Muelle Viejo (Garachico)**<br><code>playa-muelle-garachico</code> | playa | Garachico | `28.3723, -16.7683` | 163 m | excelente 2025 | ? | — | ☐ | ☐ |
| 26 | **Charco de Los Abrigos**<br><code>charco-abrigos</code> | charco | Granadilla de Abona | `28.0292, -16.5826` | 331 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 27 | **Playa de la Jaquita · El Médano**<br><code>playa-jaquita-medano</code> | playa | Granadilla de Abona | `28.0505, -16.5302` | 391 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 28 | **Playa del Cabezo (El Médano)**<br><code>playa-cabezo-medano</code> | playa | Granadilla de Abona | `28.0455, -16.5337` | 389 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 29 | **Piscinas Naturales Alcalá — Charcos La Jaquita**<br><code>piscinas-alcala-jaquita</code> | charco | Guía de Isora | `28.2046, -16.8341` | 298 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 30 | **Charco de Golete**<br><code>charco-golete</code> | charco | Güímar | `28.2708, -16.3855` | 269 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 31 | **Piscina Natural de Güímar**<br><code>piscina-guimar</code> | charco | Güímar ⚠️ | `28.2601, -16.3925` | 380 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 32 | **Playa de Chimisay**<br><code>playa-chimisay</code> | playa | Güímar | `28.3272, -16.3632` | 434 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 33 | **Playa El Socorro · Güímar**<br><code>playa-socorro-guimar</code> | playa | Güímar | `28.3291, -16.363` | 411 m | — | ? | — | ☐ | ☐ |
| 34 | **Playa La Charcada · Puertito de Güímar**<br><code>playa-charcada</code> | playa | Güímar | `28.295, -16.3745` | 359 m | buena 2025 | ? | — | ☐ | ☐ |
| 35 | **Charco de La Laja (San Juan de la Rambla)**<br><code>charco-laja</code> | charco | La Guancha | `28.3963, -16.6519` | 133 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 36 | **Charco del Viento**<br><code>charco-viento</code> | charco | La Guancha | `28.4007, -16.674` | 187 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 37 | **Charco Verde (Los Realejos)**<br><code>charco-verde-realejos</code> | charco | La Guancha | `28.3963, -16.659` | 362 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 38 | **Playa del Caletón · El Sauzal**<br><code>playa-caleton-sauzal</code> | playa | La Matanza de Acentejo | `28.4583, -16.464` | 42 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 39 | **Playa El Rincón**<br><code>playa-rincon</code> | playa | La Orotava | `28.4172, -16.5232` | 65 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 40 | **Charco del Faro de Buenavista (El Rayo)**<br><code>charco-faro-buenavista</code> | charco | Los Silos ⚠️ | `28.3922, -16.8324` | 129 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 41 | **Charco Don Gabino**<br><code>charco-don-gabino</code> | charco | Los Silos ⚠️ | `28.3828, -16.8173` | 295 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 42 | **Charco Los Chochos (Los Silos)**<br><code>charco-chochos</code> | charco | Los Silos ⚠️ | `28.3812, -16.8146` | 276 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 43 | **Playa de Agua Dulce**<br><code>playa-agua-dulce</code> | playa | Los Silos | `28.3762, -16.8087` | 272 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 44 | **Piscina Natural El Muelle (Pto. Cruz)**<br><code>piscinas-muelle</code> | charco | Puerto de la Cruz | `28.416, -16.5513` | 129 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 45 | **Playa de Martiánez**<br><code>playa-martianez</code> | playa | Puerto de la Cruz | `28.4176, -16.5413` | 113 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 46 | **Playa de San Telmo**<br><code>playa-san-telmo</code> | playa | Puerto de la Cruz | `28.4174, -16.5467` | 147 m | excelente 2025 | ? | — | ☐ | ☐ |
| 47 | **Playa del Castillo (Puerto de la Cruz)**<br><code>playa-castillo-pcruz</code> | playa | Puerto de la Cruz | `28.413, -16.5591` | 129 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 48 | **Charco de La Laja (Bajamar)**<br><code>charco-laja-bajamar</code> | charco | San Cristóbal de La Laguna | `28.5498, -16.3562` | 210 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 49 | **Piscina Natural Jóver (Tejina)**<br><code>piscina-jover-tejina</code> | charco | San Cristóbal de La Laguna | `28.5472, -16.3705` | 99 m | excelente 2025 | si | ⚠️ mar | ☐ | ☐ |
| 50 | **Piscina Natural Punta del Hidalgo (Norte)**<br><code>piscina-hidalgo-norte</code> | charco | San Cristóbal de La Laguna | `28.5706, -16.3335` | 341 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 51 | **Piscinas Naturales de Bajamar**<br><code>piscinas-bajamar</code> | charco | San Cristóbal de La Laguna | `28.5564, -16.3445` | 279 m | excelente 2025 | si | ⚠️ mar | ☐ | ☐ |
| 52 | **Piscinas Punta del Hidalgo**<br><code>punta-hidalgo</code> | charco | San Cristóbal de La Laguna | `28.5663, -16.332` | 262 m | excelente 2025 | si | ⚠️ mar | ☐ | ☐ |
| 53 | **Playa de los Troches**<br><code>playa-los-troches</code> | playa | San Cristóbal de La Laguna | `28.57123, -16.3118898` | 12 m | — | no | ⚠️ mar | ☐ | ☐ |
| 54 | **Playa de San Juan (Bajamar)**<br><code>playa-san-juan-bajamar</code> | playa | San Cristóbal de La Laguna | `28.5562903, -16.3414677` | 100 m | excelente 2025 | no | ⚠️ mar | ☐ | ☐ |
| 55 | **Playa del Arenal (Bajamar)**<br><code>playa-arenal-bajamar</code> | playa | San Cristóbal de La Laguna | `28.5564871, -16.3358937` | 120 m | — | no | ⚠️ mar | ☐ | ☐ |
| 56 | **Playa del Arenisco**<br><code>playa-arenisco</code> | playa | San Cristóbal de La Laguna | `28.5665557, -16.3317236` | 223 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 57 | **Playa de Las Aguas**<br><code>playa-las-aguas</code> | playa | San Juan de la Rambla | `28.3944, -16.6385` | 328 m | — | ? | — | ☐ | ☐ |
| 58 | **Playa de Los Roques**<br><code>playa-roques-rambla</code> | playa | San Juan de la Rambla | `28.3956, -16.6489` | 88 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 59 | **Charco de Archile**<br><code>charco-archile</code> | charco | San Miguel de Abona | `28.0193, -16.6204` | 341 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 60 | **Playa Benijo**<br><code>benijo</code> | playa | Santa Cruz de Tenerife | `28.5759, -16.1852` | 179 m | — | si | ⚠️ mar | ☐ | ☐ |
| 61 | **Zona de Baño de Valleseco (Santa Cruz)**<br><code>bano-valleseco</code> | charco | Santa Cruz de Tenerife | `28.4863321, -16.235747` | 492 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 62 | **Zona de Baño El Bloque (Valleseco)**<br><code>bano-valleseco-bloque</code> | playa | Santa Cruz de Tenerife | `28.487, -16.2333` | 401 m | excelente 2025 | ? | — | ☐ | ☐ |
| 63 | **Piscina Natural de Los Gigantes**<br><code>piscina-gigantes</code> | charco | Santiago del Teide | `28.2417, -16.8433` | 214 m | — | ? | ⚠️ mar | ☐ | ☐ |
| 64 | **Charco El Pris**<br><code>el-pris</code> | charco | Tacoronte | `28.5096, -16.4214` | 182 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |
| 65 | **Mesa del Mar**<br><code>mesa-mar</code> | charco | Tacoronte | `28.5038, -16.4245` | 345 m | excelente 2025 | ? | ⚠️ mar | ☐ | ☐ |

