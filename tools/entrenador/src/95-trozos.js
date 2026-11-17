  /* ───────────────────────── las coreografías, por trozos (16 de noviembre de 2026) ─────────────────────────
     Este fichero lleva el motor y las coreografías del bloque 1 (70-coreografias.js). Las demás van aparte, un fichero por
     grupo en modulos/entrenador/, y se piden cuando hacen falta: pedir(id) trae el trozo de ese ejercicio (una promesa) y
     hasta entonces tiene(id) dice que no. Así el motor no crece con cada bloque, y al abrir una ficha el móvil solo
     lee las coreografías de su grupo.
     Cada trozo lleva en el nombre la huella de su contenido (pecho.1a2b3c4d.js): este motor pide siempre los suyos, y
     un trozo que cambia es otro fichero. Por eso el service worker los guarda con lo de por defecto («cache primero»,
     como las mallas del 3D) y un motor nunca se junta con un trozo que no se auditó con él.
     Un trozo es una función: recibe del motor lo que usa (NUCLEO: nombres de este fichero), define sus COREO y devuelve
     las huellas de sus pasos. TROZOS y NUCLEO los escribe tools/entrenador/construir.py. */
  var TROZOS = {/*__TROZOS__*/};          /* { nombre: [el fichero, sin «.js», [sus ejercicios]] }, en el orden de los fuentes */
  var NUCLEO = {/*__NUCLEO__*/};
  var IDS_NUCLEO = Object.keys(COREO), TROZO_DE = {}, TROZO_ESTA = {}, TROZO_BASE = '';
  Object.keys(TROZOS).forEach(function (n) { TROZOS[n][1].forEach(function (id) { TROZO_DE[id] = n; }); });
  /* de dónde se piden: de la carpeta que se llama como este fichero (…/modulos/entrenador.js → …/modulos/entrenador/).
     Sin dirección (pegado en una página, o fuera de un navegador), los trozos tienen que venir detrás de él */
  (function () {
    var s = typeof document !== 'undefined' && document.currentScript, u = s && s.src ? String(s.src) : '';
    if (/\.js(?:[?#].*)?$/.test(u)) TROZO_BASE = u.replace(/\.js(?:[?#].*)?$/, '/');
  })();
  function esDe(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function trozoListo(n) { return TROZO_ESTA[n] === true; }
  /* lo llama el fichero del trozo al cargarse: TG_ENTRENADOR._trozo(nombre, función) */
  function recibirTrozo(n, hacer) {
    if (!esDe(TROZOS, n) || trozoListo(n) || typeof hacer !== 'function') return;
    var h = hacer(NUCLEO) || {};
    Object.keys(h).forEach(function (id) { HUELLAS[id] = h[id]; });
    TROZO_ESTA[n] = true;
  }
  function pedirTrozo(n) {
    if (trozoListo(n)) return Promise.resolve(true);
    if (TROZO_ESTA[n]) return TROZO_ESTA[n];
    var p = new Promise(function (ok, mal) {
      if (!TROZO_BASE || typeof document === 'undefined' || !document.head) { mal(new Error('trozo ' + n)); return; }
      var s = document.createElement('script');
      s.src = TROZO_BASE + TROZOS[n][0] + '.js';
      s.onload = function () { if (trozoListo(n)) ok(true); else { s.remove(); mal(new Error('trozo ' + n)); } };
      s.onerror = function () { s.remove(); mal(new Error('trozo ' + n)); };
      document.head.appendChild(s);
    });
    TROZO_ESTA[n] = p;
    /* si no llega, no se queda apuntado: la ficha siguiente lo vuelve a pedir */
    p.then(null, function () { if (TROZO_ESTA[n] === p) delete TROZO_ESTA[n]; });
    return p;
  }
  /* ¿está la coreografía de este ejercicio? (las del bloque 1, siempre; las demás, cuando ha llegado su trozo entero) */
  function coreoDe(id) { return esDe(COREO, id) && (!esDe(TROZO_DE, id) || trozoListo(TROZO_DE[id])) ? COREO[id] : null; }
  /* trae la coreografía de un ejercicio: una promesa que dice si la hay (y falla si su trozo no llega) */
  function pedirCoreo(id) { return esDe(TROZO_DE, id) ? pedirTrozo(TROZO_DE[id]) : Promise.resolve(esDe(COREO, id)); }
  function idsTodos() { var l = IDS_NUCLEO.slice(); Object.keys(TROZOS).forEach(function (n) { l = l.concat(TROZOS[n][1]); }); return l; }
