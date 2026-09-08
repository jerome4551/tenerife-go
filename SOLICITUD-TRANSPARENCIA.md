# Solicitud de acceso a la información pública — borrador

**No enviar sin leer «Antes de enviar».** Hay tres datos que faltan y cuatro
citas legales sin verificar. Este borrador se escribe justo después de cazar
una carta que citaba un artículo derogado; repetir eso sería el peor final
posible.

---

## Antes de enviar

**Rellenar:**

| | |
|---|---|
| Destinatario exacto | Dirección General de Seguridad y Emergencias, Gobierno de Canarias — confirmar denominación vigente y sede electrónica |
| Datos del solicitante | nombre, DNI/NIE, dirección a efectos de notificación, correo |
| Fecha | |

**Verificar antes de citar** (no están comprobadas aquí, y es el error que se
acaba de corregir):

- Ley 19/2013, de transparencia, acceso a la información pública y buen
  gobierno — y **si aplica además la ley canaria de transparencia**, que para
  un órgano del Gobierno de Canarias suele ser la que rige el procedimiento.
- Ley 37/2007 de reutilización de la información del sector público.
- El plazo de resolución y el sentido del silencio.
- El órgano ante el que reclamar si no contestan: en Canarias existe un
  Comisionado de Transparencia propio.
- Que la administración esté obligada a **remitir al órgano competente** lo que
  no sea suyo, en vez de archivarlo.

**Lo que NO hay que citar:** el Decreto 116/2018 ni ninguno de sus artículos.
Está anulado (Tribunal Supremo, 27/9/2023, BOC 82 de 25/4/2024). La carta
anterior se apoyaba en su artículo 19.3, que ya no existe. Los planes que se
piden existen como documentos; lo que ya no existe es la obligación de haberlos
hecho. **Se piden como documentos que obran en poder de la administración, no
como algo que la administración deba tener.**

---

## Cuerpo de la solicitud

> **Asunto:** solicitud de acceso a información pública — planes de seguridad y
> salvamento en zonas de baño de Tenerife y datos de socorrismo
>
> Al amparo de la legislación de transparencia y acceso a la información
> pública, y sin necesidad de motivar la solicitud, se solicita el acceso a la
> siguiente información, **que obra en poder de esa administración**:
>
> **Primero.** Copia de los **Planes de Seguridad y Salvamento** de las zonas de
> baño de la isla de Tenerife que consten inscritos en el registro de esa
> Dirección General, o, si se prefiere, **relación de las zonas de baño de
> Tenerife para las que existe plan registrado**, indicando fecha de
> inscripción. De cada plan interesa en particular el capítulo de descripción
> del emplazamiento y análisis del riesgo: **orientación de la zona de baño,
> vientos dominantes y corrientes**.
>
> **Segundo.** Respecto del socorrismo en las zonas de baño de Tenerife, y para
> el año en curso: **relación de las zonas que cuentan con servicio de
> socorrismo y su horario y temporada de prestación**. Si esa información obra
> en poder de los ayuntamientos y no de esa Dirección General, se solicita que
> se indique así expresamente, y que la solicitud se remita al órgano
> competente.
>
> **Formato.** Se solicita la entrega en **formato electrónico reutilizable**
> —CSV, XLSX o similar— cuando la información esté en base de datos, y en PDF
> cuando se trate de documentos. Si algún documento contiene datos personales o
> información sujeta a límite legal, se solicita el **acceso parcial** al resto.
>
> **Entrega parcial.** Los dos puntos son independientes. Se solicita que **no
> se demore la entrega de uno esperando al otro**.
>
> **Finalidad** (no es obligatorio indicarla, y se hace por cortesía): los datos
> se usarán en una guía gratuita y sin ánimo de lucro de la isla, con atribución
> a la fuente.

---

## Por qué esta vez puede cambiar algo

No por optimismo. Por dos motivos concretos:

1. **La carta anterior tenía un defecto citable.** Se apoyaba en el artículo
   19.3 de un decreto anulado. Una solicitud sobre esa base se puede rechazar
   por la forma sin entrar en el fondo. Esta no depende de ese decreto.
2. **Una sola solicitud cierra los dos bloqueos.** El mismo canal tiene la
   orientación de playa —capítulo 1 de los planes— y el socorrismo. Hasta ahora
   se pedían por separado.

Y una expectativa realista, que también conviene escrita:

- De 750 zonas de baño en Canarias, 365 requerían plan y **solo 126 llegaron a
  estar elaborados y registrados**. Es probable que varias de nuestras 99 no
  tengan plan.
- La orientación, cuando aparezca, vendrá **en prosa**, no como campo.
- El acceso puede limitarse por seguridad pública. Por eso se pide el acceso
  parcial de forma expresa.
- **Los 27 charcos y piscinas naturales probablemente no estén cubiertos**: no
  son playas censadas ni rompientes, y ninguna de las fuentes públicas
  revisadas los recoge.

Lo que se gana aunque salga mal: una **respuesta en plazo** que deja por
escrito qué existe y qué no, y con eso se cierra la pregunta en vez de dejarla
abierta otros seis meses.

---

## Qué hacer con lo que llegue

- **Orientación de una playa** → sustituye a la fila `deducida: true` y pasa a
  escrita a mano, sin `deducida`, que es la rama de `scorePlaya` donde manda el
  conocimiento local.
- **Socorrista sí/no** → `lifeguard: true` o `false`. Hoy hay **61 zonas sin
  dato**, y ausente no afirma nada; `false` sí afirma.
- **Horario** → **no cabe en ninguna ficha: el campo no existe.** Habría que
  añadirlo, en los ocho idiomas, con su temporada. Es trabajo de código, no
  solo de dato.
