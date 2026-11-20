# Solicitud de datos en tiempo real — TITSA

**El canal no se adivina: es el que TITSA tiene registrado para sus datos
abiertos.** En el catálogo nacional de datos abiertos (datos.gob.es), la
iniciativa «Datos abiertos de Transportes Interurbanos de Tenerife S.A.» da
como **canal de solicitud** el formulario «Sugiere» del portal de datos
abiertos del Cabildo, `https://datos.tenerife.es/es/sugiere`. Es el mismo
portal donde está su GTFS («Información sobre el sistema de transporte de
TITSA en Tenerife», licencia CC BY), del que sale la red de guaguas de la app.

Redactada el 20 de noviembre de 2026.

---

## Antes de enviar

| | |
|---|---|
| Portal | `https://datos.tenerife.es/es/sugiere` (formulario «Sugiere») |
| A la atención de | TITSA — Transportes Interurbanos de Tenerife |
| Datos del solicitante | nombre, correo y el enlace a la app (`https://tenerifego.app`) |
| Comprobar antes | que en la ficha del GTFS de TITSA en datos.tenerife.es no haya aparecido ya un recurso de tiempo real. Si lo hay, no hace falta pedirlo: basta con preguntar la licencia y el CORS (punto «Para poder usarlo bien») |

El formulario puede tener un límite de caracteres. Si no cabe, enviar el
cuerpo hasta «Para poder usarlo bien» incluido y dejar el último párrafo.

---

## Cuerpo

> **Asunto:** Solicitud de publicación de los datos en tiempo real de TITSA
> (GTFS-Realtime)
>
> A la atención de TITSA.
>
> Mantengo Tenerife Go (https://tenerifego.app), una guía gratuita de
> Tenerife en diez idiomas que funciona también sin conexión. Su red de
> guaguas sale del GTFS de TITSA publicado en este portal (181 líneas con sus
> paradas y horarios).
>
> Lo que más necesita quien espera en una parada es saber cuándo llega la
> guagua. La app oficial de TITSA ya ofrece los tiempos de espera en cada
> parada, así que el dato existe. Solicito, si es posible, que se publique
> como dato abierto:
>
> **1. Las llegadas previstas a cada parada,** en GTFS-Realtime (TripUpdates),
> con los mismos identificadores de líneas, viajes y paradas que el GTFS ya
> publicado.
>
> **2. Las incidencias del servicio** (desvíos, paradas anuladas, cambios de
> horario…), en GTFS-Realtime (ServiceAlerts), en los idiomas en que se
> redacten.
>
> **3. Si es posible, la posición de los vehículos** (VehiclePositions).
>
> Si GTFS-Realtime no fuera viable a corto plazo, me serviría igual un acceso
> documentado al servicio que usa la app de TITSA para los tiempos de espera.
>
> **Para poder usarlo bien,** les agradecería que indicaran:
>
> - la licencia y la fórmula de atribución (si es la misma CC BY del GTFS,
>   perfecto), incluida la reutilización con fines comerciales;
> - cada cuánto se puede consultar y si hace falta una clave;
> - si el servidor puede enviar la cabecera CORS
>   (`Access-Control-Allow-Origin`). La app es una web que se abre en el
>   navegador del móvil, y sin esa cabecera el navegador no le deja leer los
>   datos.
>
> Por mi parte, la app solo pediría datos cuando alguien tenga una parada
> abierta en pantalla, no de forma continua; mostraría siempre la hora de la
> última actualización; y, sin datos recientes, volvería al horario del GTFS
> diciendo que es el horario previsto y no el tiempo real.
>
> Muchas gracias.
>
> [Nombre y apellidos] · [correo] · https://tenerifego.app

---

## Qué está ya resuelto y no hace falta pedir

- **El GTFS (líneas, paradas, horarios y trazados)** ya es abierto y la app
  lo usa: está en datos.tenerife.es con licencia CC BY y su fichero es
  `https://www.titsa.com/Google_transit.zip`. `tools/gtfs_red.py` lo
  convierte en `datos/titsa.js`.

## Una cosa que hay que hacer ANTES de enviarla

**La app no cita todavía el GTFS como pide su licencia.** Enlaza a
titsa.com («horarios oficiales»), pero la licencia CC BY pide reconocer la
fuente: algo como «Datos de guaguas: TITSA · datos.tenerife.es · CC BY», con
el enlace a la licencia, en el panel de guaguas. Es el bloque 4 de la nota
para Claude Code (mirar antes en la ficha del conjunto qué versión de CC BY
es). Mejor tenerlo puesto cuando TITSA mire la app.

## Si responden

- **Con GTFS-Realtime y CORS:** es un bloque para Claude Code (leer el
  protobuf en el navegador, al abrir una parada; la hora de la última
  actualización; volver al horario si el dato es viejo).
- **Con GTFS-Realtime sin CORS:** haría falta un intermediario (un servidor
  propio o una función en la nube) que lo lea y lo sirva con CORS. Es un
  coste y una pieza más que mantener: decidirlo antes de construirlo.
- **Con una clave por aplicación:** la clave no puede ir dentro de la web
  (cualquiera la vería). También haría falta el intermediario.
