  /* ───────────────────────── lo que sale del módulo ───────────────────────── */
  window.TG_ENTRENADOR = {
    version: 4,
    /* (16-11-2026) trae la coreografía de un ejercicio, si no está ya: las del bloque 1 van con el motor y las demás
       por grupos, en modulos/entrenador/ (95-trozos.js). Una promesa: dice si el ejercicio tiene coreografía, y falla si
       su trozo no llega (sin conexión y sin haberlo guardado). Se llama antes de tiene() y de montar(). */
    pedir: function (id) { return pedirCoreo(id); },
    /* ¿tiene vídeo este ejercicio? Con n (los pasos que trae su ficha), solo si son los mismos que se
       coreografiaron: si la ficha cambia de pasos, el vídeo deja de salir hasta que se revise.
       Dice que no mientras su trozo no haya llegado (pedir). */
    tiene: function (id, n) { var co = coreoDe(id); return !!co && (n == null || (co.pasos || []).length === n); },
    /* todos los ejercicios con coreografía, hayan llegado o no sus trozos */
    ids: function () { return idsTodos(); },
    /* los ficheros de los trozos (sin «.js»), y todos de una vez (para las herramientas y la muestra) */
    trozos: function () { return Object.keys(TROZOS).map(function (n) { return TROZOS[n][0]; }); },
    todo: function () { return Promise.all(Object.keys(TROZOS).map(pedirTrozo)).then(function () { return true; }); },
    _trozo: recibirTrozo,
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
    _: { resolver: resolver, mezclar: mezclar, clavar: clavar, munecaPara: munecaPara, armar: armar, Escenario: Escenario, Director: Director, Camara: Camara, D: D, C: C, CURVA: CURVA, COREO: COREO, MATERIAL: MATERIAL, PRESENTA: PRESENTA, GESTOS: GESTOS, GESTOS_DE: GESTOS_DE, Vida: Vida, bajoZapa: bajoZapa, manoAPlano: manoAPlano, bolasMano: bolasMano, zapaAPlano: zapaAPlano, miembroAPlano: miembroAPlano, troncoAPlano: troncoAPlano, cabezaAPlano: cabezaAPlano, cabezaACilindro: cabezaACilindro, piezaAEsfera: piezaAEsfera, huecoPelota: huecoPelota, pelotaContra: pelotaContra, Cilindro: Cilindro, Esfera: Esfera, Disco: Disco, manoEnMuslo: manoEnMuslo, apartaMano: apartaMano, BUSTO: BUSTO, ANCHO: ANCHO, ALTO: ALTO, PUNTOS: PUNTOS, EMO: EMO, Reproductor: Reproductor, SECC: SECC, MARCA_DUR: MARCA_DUR }
  };
