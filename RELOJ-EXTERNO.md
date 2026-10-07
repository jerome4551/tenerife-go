# Reloj de fuera para los flujos de GitHub

> **Actualización del 7 de octubre, por la noche.** Los precios de las
> gasolineras ya no dependen de esto: la app los pide en vivo al Ministerio,
> como el tiempo a Open-Meteo (ver `GASOLINERAS-PLAN.md`). Para los precios,
> la tarea 1 solo mantendría al día el fichero de respaldo; es opcional.
> **Lo que sí lo necesita es la notificación diaria (tarea 2)**: la envía un
> servidor, no el móvil, y con el retraso de GitHub sale hacia mediodía.

**7 de octubre de 2026.** Los precios de las gasolineras (7:00 y 15:00) y la
notificación diaria (por la mañana) los lanza GitHub con su programador
(`schedule`). Desde el **26 de agosto de 2026** ese programador está roto para
todo el mundo: los flujos salen con horas de retraso o no salen, y GitHub no
ha dicho nada
([discusión 207346](https://github.com/orgs/community/discussions/207346),
[discusión 209514](https://github.com/orgs/community/discussions/209514)).

Medido en este repo con `python3 tools/reloj_flujos.py --github`:

| | lo que se pidió | lo que hizo GitHub |
|---|---|---|
| Notificación diaria | 5 horarios entre las 5:07 y las 8:07 de Canarias | la última semana salió entre las **10:47 y las 16:56**, todos los días; el retraso medio pasó de ~5 h en septiembre a ~7 h en octubre |
| Precios gasolineras | una vez cada hora | **2 veces en 16 horas** (3:26 y 11:21), casi 8 horas una de otra |

Lo que sí funciona en segundos es lanzarlos por la API (`workflow_dispatch`).
Así que un reloj de fuera llama a la API a la hora buena. Los dos flujos
están preparados para que esa llamada no repita trabajo:

- con `"forzar":"no"`, **precios** solo baja los precios si la franja de las
  7:00 o de las 15:00 aún no está; si ya está, termina en segundos sin
  escribir nada;
- con `"forzar":"no"`, la **notificación** solo envía si hoy no se ha enviado
  (la tabla `push_sends` de Supabase), y dentro de su ventana horaria.

Por eso cada tarea llama **dos veces** (en punto y a y media): la segunda
solo trabaja si la primera falló. Y el programador de GitHub se queda de
respaldo: si el reloj de fuera dejara de llamar, GitHub los seguiría
lanzando, tarde, como ahora.

---

## Lo que hay que hacer una vez (unos 10 minutos)

### 1 · Un token de GitHub que solo sirve para lanzar flujos de este repo

1. En github.com: tu foto (arriba a la derecha) → **Settings** →
   **Developer settings** (abajo del todo) → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `reloj tenerife-go`.
   **Expiration:** la más larga que te deje (como mucho un año). Apunta la
   fecha.
3. **Repository access:** *Only select repositories* →
   `jerome4551/tenerife-go`.
4. **Permissions** → *Repository permissions* → **Actions: Read and
   write**. Nada más (*Metadata: Read-only* lo pone GitHub solo).
5. **Generate token** y copia el token (empieza por `github_pat_`). Solo se
   ve una vez.

Con ese token solo se pueden lanzar, parar, activar o borrar ejecuciones de
los flujos de este repo. No puede cambiar el código, ni la web, ni leer los
secretos (las claves de Supabase y de las notificaciones).

### 2 · Dos tareas en cron-job.org (gratis)

Crea una cuenta en <https://cron-job.org> y pulsa **Create cronjob**.

**Tarea 1 · Precios gasolineras**

| campo | valor |
|---|---|
| Title | `Precios gasolineras` |
| URL | `https://api.github.com/repos/jerome4551/tenerife-go/actions/workflows/precios-gasolineras.yml/dispatches` |
| Execution schedule | *Custom*: todos los días, **horas 7 y 15**, **minutos 5 y 35** |
| Time zone | `Atlantic/Canary` |

En la pestaña **Advanced**:

| campo | valor |
|---|---|
| Request method | `POST` |
| Headers | `Accept: application/vnd.github+json` |
| | `Authorization: Bearer github_pat_…` (el token del paso 1) |
| | `X-GitHub-Api-Version: 2022-11-28` |
| | `Content-Type: application/json` |
| Request body | `{"ref":"main","inputs":{"forzar":"no"}}` |

En **Notifications**: que te avise cuando falle.

Guarda y pulsa **Test run**: tiene que responder **204**. Al momento sale en
GitHub, pestaña *Actions*, una ejecución de «Precios gasolineras».

**Tarea 2 · Notificación diaria**

Igual que la 1, cambiando solo:

| campo | valor |
|---|---|
| Title | `Notificacion diaria` |
| URL | `https://api.github.com/repos/jerome4551/tenerife-go/actions/workflows/notificacion-diaria.yml/dispatches` |
| Execution schedule | todos los días, **hora 9**, **minutos 5 y 35** |

(El *Test run* de esta no envía nada si hoy ya salió: dirá «Ya se envió hoy».)

---

## Cómo saber que funciona

- `python3 tools/reloj_flujos.py` dice, franja a franja, a qué hora llegaron
  los precios: con el reloj de fuera, a las 7:05 y a las 15:05.
- En GitHub, *Actions*: las ejecuciones de las 7:05, 9:05 y 15:05 salen como
  `workflow_dispatch`.
- En cron-job.org, el historial de cada tarea: respuesta **204**.

## Cuando caduque el token

cron-job.org te escribe (la llamada empieza a fallar con 401). Haz otro token
igual (paso 1) y pégalo en las dos tareas. Mientras tanto no se rompe nada:
GitHub sigue lanzando los flujos, tarde, y la app no enseña precios de más de
2 días.
