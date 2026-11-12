  /* ───────────────────────── lo que sale del módulo ───────────────────────── */
  window.TG_ENTRENADOR = {
    version: 3,
    /* ¿tiene vídeo este ejercicio? Con n (los pasos que trae su ficha), solo si son los mismos que se
       coreografiaron: si la ficha cambia de pasos, el vídeo deja de salir hasta que se revise. */
    tiene: function (id, n) { var co = Object.prototype.hasOwnProperty.call(COREO, id) ? COREO[id] : null; return !!co && (n == null || (co.pasos || []).length === n); },
    ids: function () { return Object.keys(COREO); },
    /* monta el vídeo de un ejercicio en una caja; devuelve el reproductor (reproducir, pausar, irA, tema, quitar) o null */
    montar: function (caja, datos, opc) { return datos && this.tiene(datos.id, (datos.pasos || []).length) ? new Reproductor(caja, datos, opc) : null; },
    textos: ENT_UI,
    /* ¿se pinta en un canvas? (Samsung Internet: 85-lienzo.js) */
    samsung: EN_SAMSUNG,
    /* qué voz usaría el vídeo en este aparato para un idioma, y cuáles enseña el navegador (para saber por qué suena como suena) */
    voces: function (idioma) {
      var v = vocesDe(idioma);
      return { locale: v.locale, elegida: v.voz ? String(v.voz.name) : null, sistema: v.sistema,
        lista: v.lista.map(function (q) { return { nombre: String(q.name), lang: String(q.lang), uri: String(q.voiceURI), local: q.localService !== false, nota: notaVoz(q, v.locale.toLowerCase()) }; }) };
    },
    /* la huella de los pasos en castellano con los que se hizo cada coreografía (la coteja tools/auditar_entrenador.js) */
    huellas: HUELLAS,
    _: { resolver: resolver, mezclar: mezclar, clavar: clavar, armar: armar, Escenario: Escenario, Director: Director, Camara: Camara, D: D, C: C, CURVA: CURVA, COREO: COREO, MATERIAL: MATERIAL, PRESENTA: PRESENTA, GESTOS: GESTOS, GESTOS_DE: GESTOS_DE, Vida: Vida, bajoZapa: bajoZapa, BUSTO: BUSTO, ANCHO: ANCHO, ALTO: ALTO, PUNTOS: PUNTOS, EMO: EMO, Reproductor: Reproductor, SECC: SECC, MARCA_DUR: MARCA_DUR }
  };
