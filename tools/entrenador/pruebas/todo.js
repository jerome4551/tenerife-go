/* todo.js — en las páginas de prueba, detrás de modulos/entrenador.js: trae todos sus trozos antes de seguir.
   (16 de noviembre de 2026) Las coreografías van por grupos en modulos/entrenador/ y en la app se piden al abrir una ficha
   (TG_ENTRENADOR.pedir). Estas páginas las quieren todas desde el principio y sin esperar a nada: aquí se escribe la
   etiqueta de cada trozo mientras la página se lee, así que el script que venga después ya las encuentra.
       <script src="../../../modulos/entrenador.js"></script>
       <script src="todo.js"></script>
   Solo para estas páginas (document.write): la app no lo usa. */
(function () {
  var E = window.TG_ENTRENADOR, yo = document.currentScript;
  if (!E || typeof E.trozos !== 'function' || !yo || document.readyState !== 'loading') return;
  var motor = yo.previousElementSibling, base = motor && motor.src ? String(motor.src).replace(/\.js(?:[?#].*)?$/, '/') : '../../../modulos/entrenador/';
  E.trozos().forEach(function (f) { document.write('<script src="' + base + f + '.js"><\/script>'); });
})();
