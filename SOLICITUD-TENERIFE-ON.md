# Solicitud del estado de los senderos — Cabildo de Tenerife (Tenerife ON)

**A quién:** al Área de Medio Natural del Cabildo de Tenerife, que es la que
lleva Tenerife ON (la puso en marcha en febrero de 2023 y firma las
resoluciones de cierre y reapertura de senderos). Su correo,
`medionatural@tenerife.es`, es el que da como contacto la web del Parque
Nacional del Teide del Gobierno de Canarias. Y, como lo que se pide es un
conjunto de datos abiertos, el mismo texto por el formulario «Sugiere» del
portal de datos abiertos del Cabildo, `https://datos.tenerife.es/es/sugiere`.

Redactada el 20 de noviembre de 2026.

---

## Antes de enviar

| | |
|---|---|
| Correo | `medionatural@tenerife.es` |
| Y además | `https://datos.tenerife.es/es/sugiere` (formulario «Sugiere»), el mismo texto |
| A la atención de | Área de Medio Natural, Sostenibilidad, Seguridad y Emergencias — Tenerife ON |
| Datos del solicitante | nombre, correo y el enlace a la app (`https://tenerifego.app`) |
| Comprobar antes | buscar «senderos» en datos.tenerife.es: si la red de senderos ya está publicada, citar ese conjunto en el punto 1 («añadirle el estado») |

---

## Cuerpo

> **Asunto:** Solicitud de un fichero abierto con el estado de los senderos y
> las alertas de Tenerife ON
>
> A la atención del Área de Medio Natural, Sostenibilidad, Seguridad y
> Emergencias (Tenerife ON).
>
> Mantengo Tenerife Go (https://tenerifego.app), una guía gratuita de
> Tenerife en diez idiomas que funciona también sin conexión. En cada
> sendero, la app enseña su estado oficial —abierto, cerrado, restringido o
> solo con reserva— con la fecha en que se comprobó y un enlace a Tenerife ON
> para reservar. Hoy ese estado lo copio a mano de sus resoluciones y
> noticias (por ejemplo, las restricciones por hielo y nieve en siete
> senderos del Teide desde el 1 de noviembre de 2026), y eso tiene un riesgo:
> que una reapertura o un cierre nuevo tarde en llegar a quien está a punto
> de salir.
>
> Solicito, si es posible, que el estado de la red se publique en un formato
> que una app pueda leer (JSON, CSV o GeoJSON):
>
> **1. El estado de cada sendero:** código (PNT 10, PR-TF 51…), nombre,
> estado (abierto, cerrado, cerrado en un tramo, restringido, con
> autorización), el tramo afectado, desde cuándo, el motivo y el enlace a la
> resolución o la noticia. Si la red de senderos ya está publicada en
> datos.tenerife.es, bastaría con añadirle el estado y su fecha.
>
> **2. Las alertas e incidencias** que publica Tenerife ON (temporales, hielo,
> incendios…), con su fecha de inicio y, cuando la haya, de fin.
>
> **3. Qué senderos y espacios piden autorización,** con su cupo diario si lo
> tienen (por ejemplo, los 45 permisos diarios de La Ensillada – Cabezo del
> Tejo, PRA 72) y el enlace para reservar.
>
> Les agradecería también que indicaran la licencia y la fórmula de
> atribución, incluida la reutilización con fines comerciales, y cada cuánto
> se actualizaría.
>
> Por mi parte, la app citará a Tenerife ON como fuente, enlazará siempre a
> su web para reservar (no gestiona reservas), enseñará la fecha de cada dato
> y avisará cuando un dato tenga más de dos semanas.
>
> Muchas gracias.
>
> [Nombre y apellidos] · [correo] · https://tenerifego.app

---

## Qué está ya resuelto y no hace falta pedir

- **El estado de hoy ya está en la app,** a mano y con fuente y fecha en cada
  ficha (`estado`, `fuente`, `verificado`), y desde «Antes de salir» se ve
  todo junto. El planificador ya no propone un sitio cerrado o restringido.
- **Las reservas** no se piden: la app enlaza a Tenerife ON y a la Central de
  Reservas del Cabildo (acampadas), que son las vías oficiales.

## Si responden

- **Con un fichero o un servicio abierto:** un robot como los de AEMET y el
  Gobierno de Canarias (`.github/workflows/`) lo bajaría, lo comprobaría y
  escribiría `datos/senderos-estado.json`; «Antes de salir» y las fichas lo
  leerían con su fecha. Un bloque para Claude Code.
- **Con un «no por ahora»:** se sigue a mano, como hasta hoy.
