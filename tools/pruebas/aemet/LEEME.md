# Copias de AEMET para probar `tools/avisos_aemet.py`

Ficheros tal cual los sirvió AEMET el 12 de octubre de 2026 (bajados desde
GitHub Actions, que sí llega a aemet.es; este entorno no). Son datos reales y
públicos de AEMET (https://www.aemet.es/es/nota_legal). La app no los lee: solo
los usa `tools/probar_avisos_aemet.py`.

| Fichero | Qué es |
|---|---|
| `CAP_AFAP6596_RSS.xml` | Canal de avisos de la isla de Tenerife. Dice «No hay avisos para Tenerife». |
| `Z_CAP_C_LEMM_20261011215001_AFAP6596.tar.gz` | Su estado completo: los nueve mensajes de nivel verde (sin aviso) de Canarias, del 11/10 a las 22:50 al 14/10 a las 23:59. |
| `Z_CAP_C_LEMM_20261012091605_AFAZ645403PRP11217.xml` | Un aviso amarillo REAL de lluvias en el interior de Mallorca (zona 645403), con texto en castellano e inglés, probabilidad y `references`. En Tenerife no había ninguno ese día. |
| `CAP_AFAE_RSS.xml` | Canal de toda España: sirve para comprobar que el lector rechaza un canal que no es el de Tenerife. |

El aviso de Mallorca **no se toca en disco**. Las pruebas lo copian en memoria y
le cambian lo que cada caso necesita (la zona a una de Tenerife, el fin, el
título del canal); cada cambio está escrito en el propio caso. Nada de eso
llega nunca a `datos/avisos-aemet.json`: las pruebas escriben en una carpeta
temporal.
