# Solicitud de datos de playas — GESPLAN

**El canal ya no se adivina: lo dio la propia administración.** La
Subdirección de Protección Civil y Emergencias (Dirección General de
Emergencias, Gobierno de Canarias) indicó que las peticiones de datos de
playas van **por el portal web de GESPLAN**, a la atención de la **Directora
Técnica del Encargo de Playas del Gobierno de Canarias**.

Es además quien tiene los servicios ArcGIS `cat_playas_zbm`, que es donde
estarían tanto la orientación como el socorrismo. Esto sustituye al borrador
anterior, que planteaba una solicitud de transparencia genérica: **una vía
nominal señalada por la administración es mejor que un procedimiento formal
dirigido a quien no lleva el dato.**

---

## Antes de enviar

| | |
|---|---|
| Portal | formulario de solicitud de GESPLAN — confirmar la URL vigente |
| A la atención de | Directora Técnica del Encargo de Playas del Gobierno de Canarias |
| Datos del solicitante | nombre, correo, y el enlace a la app |

**No citar el Decreto 116/2018 ni ninguno de sus artículos.** Está anulado
(Tribunal Supremo 27/9/2023, BOC 82 de 25/4/2024) y la propia Subdirección
reconoce que siga apareciendo en Infoplayas es un error a corregir. La carta
anterior se apoyaba en su artículo 19.3. Aquí no hace falta ningún fundamento
legal: es una petición de datos por el canal que ellos mismos indicaron.

---

## Cuerpo

> **Asunto:** solicitud de datos del catálogo de playas y zonas de baño de
> Tenerife
>
> A la atención de la Directora Técnica del Encargo de Playas.
>
> Me dirijo a ustedes por indicación de la Subdirección de Protección Civil y
> Emergencias, que señaló este portal como el canal para solicitar datos de
> playas.
>
> Mantengo una guía gratuita y sin ánimo de lucro de Tenerife, con 99 zonas de
> baño fichadas. Solicito, si es posible en formato reutilizable:
>
> **1. Del catálogo de playas y zonas de baño (servicios `cat_playas_zbm`):**
> la relación de zonas de baño de Tenerife con los campos descriptivos
> disponibles, y **en particular la orientación de cada zona** —hacia dónde da
> la playa— junto con vientos dominantes y corrientes, si constan.
>
> **2. Del socorrismo:** la relación de zonas de baño de Tenerife con servicio
> de socorrismo, con su horario y temporada, en la versión más reciente de que
> dispongan. Entiendo que la comunicación anual dejó de ser obligatoria al
> anularse el decreto y que los datos publicados están congelados en 2023; si
> es así, **basta con que me lo confirmen**, y no hará falta nada más.
>
> **Atribución.** La app citará como fuente a la Subdirección de Protección
> Civil y Emergencias del Gobierno de Canarias y como portal de origen
> Infoplayas Canarias, según la fórmula que me indicaron. Si prefieren otra
> redacción o que se nombre a GESPLAN, díganmelo y la ajusto.
>
> Los dos puntos son independientes: agradecería no demorar uno esperando al
> otro.

---

## Qué está ya resuelto y no hace falta pedir

- **Los horarios de socorrismo dejan de estar pendientes.** La tabla oficial
  está congelada en septiembre de 2023 y ya se sabe por qué: la comunicación
  anual que la alimentaba dejó de ser obligatoria al anularse el decreto. **No
  van a llegar datos de 2024, 2025 ni 2026** mientras no se apruebe el nuevo
  modelo. La app ya hace lo correcto: etiqueta neutra —«🚩 Bandera y
  socorristas (oficial)»— y enlace al visor oficial centrado en la playa, sin
  horarios grabados. Eso pasa de *pendiente* a **resuelto hasta donde se
  puede**, y el punto 2 de arriba solo busca confirmación.
- **La atribución ya está puesta**, en los ocho idiomas: fuente y **portal de
  origen**, que es la fórmula que pidieron.

## Expectativa realista

- Los **27 charcos y piscinas naturales** probablemente no estén en el
  catálogo: no son playas censadas.
- Si la orientación existe como campo del `cat_playas_zbm`, sustituiría a las
  87 filas `deducida: true`, que es el objetivo. Si viene en prosa dentro de un
  plan, hay que leerla a mano.
- Lo que se gana aunque no haya dato: **una confirmación por escrito de que no
  lo hay**, que cierra la pregunta en vez de dejarla abierta.

## Qué hacer con lo que llegue

- **Orientación oficial** → sustituye la fila `deducida: true` y pasa a escrita
  a mano, sin `deducida`: es la rama de `scorePlaya` donde manda el
  conocimiento local.
- **Socorrista sí/no** → `lifeguard: true` o `false`. Hoy hay **61 zonas sin
  dato**; ausente no afirma nada, `false` sí afirma.
- **Horario** → **no cabe en ninguna ficha: el campo no existe.** Habría que
  añadirlo en los ocho idiomas, con su temporada. Es trabajo de código.
