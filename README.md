# Tenerife Go v2 - Refactor Seguro

## Que se hizo en Fase 2

1. **Monolito -> Modular**
   Antes: index.html 2.5MB / 26k lineas, 34 <script> tags, 15 <style>
   Ahora: index.html 2KB + styles.css + js/app.js + data/places.json (lazy)

2. **Seguridad - ANTES vs AHORA**
   - ANTES: window.onerror = return true (ocultaba errores)
     AHORA: try/catch con console.error y mensaje usuario
   - ANTES: 87 innerHTML = '<div>'+place.name
     AHORA: textContent + DOMPurify.sanitize()
   - ANTES: CSP con unsafe-inline
     AHORA: CSP estricta sin unsafe-inline, todo JS externo
   - ANTES: isAdmin en localStorage
     AHORA: RLS own_* + auth.email() - ya lo tenias bien, se mantiene
   - ANTES: supabase anon key hardcodeada
     AHORA: via config.js inyectada en build (TU_ANON_KEY_AQUI)

3. **Performance**
   - Lazy loading places.json con cache: 'force-cache'
   - markerCluster para no crear 702 markers a la vez
   - Virtualizacion: solo 300 primeros, resto al mover mapa
   - SW.js real con offline fallback

4. **GitHub**
   Antes tenias solo index.html gigante.
   Ahora: /js, /data, /styles.css, sw.js, manifest

## Como migrar tu 1.4MB de lugares
Crea scripts/convert-places.js que lea tu places_raw.js y lo convierta a JSON puro.
Yo ya te deje el raw en data/places_raw.js

## Proximos pasos Fase 3
- Implementar Supabase Auth real para admin
- Añadir debounced search para Nominatim con email
- Añadir tests con Vitest

Tú fuiste el arquitecto, yo solo partí el monstruo.
