/* perfil_nube_de_prueba.js — SOLO PARA LAS PRUEBAS (tools/probar_perfil.js): no va a
   la app, ni a sw.js, ni a la app de la tienda. Es demo-nube.js del encargo del perfil
   (22 de octubre de 2026), igual salvo esta primera frase; probar_perfil.js lo pega en la
   pagina ya cargada, y entonces es el window.AppAuth de la app.
   Hace de window.AppAuth (la sesión, el administrador y el cliente de Supabase) con
   una nube de mentira guardada en este navegador (localStorage 'tgp.demo-nube'), que
   se porta como supabase/perfil.sql, probado en Postgres:
   · solo se lee y se toca lo de la cuenta con sesión (RLS); sin sesión, nada (anon
     no tiene permisos);
   · pesos y caminatas no pueden existir sin su fila de perfiles (23503);
   · borrar la fila de perfiles se lleva sus pesos y caminatas (on delete cascade);
   · los mismos límites que los check de perfil.sql (23514), la clave repetida en un
     insert (23505);
   · sin red, cada petición devuelve lo que devuelve supabase-js cuando no hay
     conexión: { data: null, error: { message: 'TypeError: Failed to fetch' } }.
   · como Supabase, una consulta devuelve como mucho 1.000 filas (Max rows del
     proyecto; TGP_DEMO_NUBE.maxFilas() lo cambia), en el orden de order() y con
     range() y la cuenta de select(cols, { count: 'exact' }) (23 de octubre de 2026:
     sin esto, las pruebas no veian lo que pasa con mas de 1.000 pesos).
   Las llamadas son las mismas que usa perfil.js con supabase-js 2:
   from().select().eq().maybeSingle(), select(cols, { count }).eq().order().range(),
   insert(), upsert(filas, { onConflict }), update().eq().select(), delete().eq().in(). */
(function () {
  'use strict';
  var KEY = 'tgp.demo-nube';
  /* dos cuentas, para probar que a una cuenta no se le sube nada con el permiso de otra */
  var CUENTAS = [{ id: '0b7c1e5a-3d2f-4c8e-9a61-5f4d2e8b7c10', email: 'viajero@example.com' },
                 { id: '7d41c2b9-8e06-4f3a-b5c7-29e1d0a4f6b3', email: 'otra@example.com' }];
  var PK = { perfiles: ['user_id'], pesos: ['user_id', 'fecha'], caminatas: ['user_id', 'id'] };
  /* las columnas de perfil.sql: PostgREST rechaza las que no existen (PGRST204) */
  var COLUMNAS = {
    perfiles: ['user_id', 'consentido_en', 'nombre', 'avatar', 'unidades', 'altura_cm', 'nacimiento', 'objetivo_kg', 'creado', 'updated_at'],
    pesos: ['user_id', 'fecha', 'kg'],
    caminatas: ['user_id', 'id', 'fecha', 'km']
  };
  function nuevo() { return { sesion: true, cuenta: 0, admin: false, red: true, maxFilas: 1000, t: { perfiles: [], pesos: [], caminatas: [] } }; }
  function cargar() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.t && s.t.perfiles && s.t.pesos && s.t.caminatas) return s; } catch (e) {}
    return nuevo();
  }
  var s = cargar();
  function usuario() { return CUENTAS[s.cuenta === 1 ? 1 : 0]; }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} pintar(); }
  function fallo(code, message) { return { data: null, error: { code: code, message: message, details: null, hint: null }, status: code === '42501' ? 403 : 409 }; }
  /* los check de perfil.sql */
  function comprobar(t, f) {
    if (t === 'perfiles') {
      if (f.nombre != null && String(f.nombre).length > 24) return 'perfiles_nombre';
      if (f.avatar != null && !(f.avatar.length >= 4 && f.avatar.length <= 24 && /^[a-z]{2,3}-/.test(f.avatar) && !/[^a-z-]/.test(f.avatar))) return 'perfiles_avatar';
      if (['metric', 'imperial'].indexOf(f.unidades) < 0) return 'perfiles_unidades';
      if (f.altura_cm != null && !(f.altura_cm >= 80 && f.altura_cm <= 250)) return 'perfiles_altura';
      if (f.nacimiento != null && !(f.nacimiento >= 1900 && f.nacimiento <= 2100)) return 'perfiles_nacimiento';
      if (f.objetivo_kg != null && !(f.objetivo_kg >= 20 && f.objetivo_kg <= 400)) return 'perfiles_objetivo';
      if (!f.consentido_en) return 'consentido_en not null';
    }
    if (t === 'pesos' && !(f.kg >= 20 && f.kg <= 400)) return 'pesos_kg';
    if (t === 'caminatas') {
      if (!(String(f.id).length >= 8 && String(f.id).length <= 64)) return 'caminatas_id';
      if (!(f.km >= 0.1 && f.km <= 200)) return 'caminatas_km';
    }
    return null;
  }
  function misma(t, a, b) { return PK[t].every(function (k) { return String(a[k]) === String(b[k]); }); }
  function proyectar(f, cols) {
    if (!cols || cols === '*') return Object.assign({}, f);
    var o = {}; cols.split(',').forEach(function (c) { c = c.trim(); o[c] = f[c] === undefined ? null : f[c]; }); return o;
  }
  function Consulta(t) { this.t = t; this.op = 'select'; this.filtros = []; this.cols = null; this.devolver = false; this.una = false; this.orden = null; this.rango = null; this.contar = false; }
  Consulta.prototype.select = function (cols, o) { if (this.op === 'select') { this.cols = cols; this.contar = !!(o && o.count); } else { this.devolver = true; this.cols = cols; } return this; };
  Consulta.prototype.order = function (c, o) { this.orden = { c: c, asc: !(o && o.ascending === false) }; return this; };
  Consulta.prototype.range = function (a, b) { this.rango = [a, b]; return this; };
  Consulta.prototype.insert = function (v) { this.op = 'insert'; this.v = v; return this; };
  Consulta.prototype.upsert = function (v, o) { this.op = 'upsert'; this.v = v; this.o = o || {}; return this; };
  Consulta.prototype.update = function (v) { this.op = 'update'; this.v = v; return this; };
  Consulta.prototype.delete = function () { this.op = 'delete'; return this; };
  Consulta.prototype.eq = function (c, v) { this.filtros.push(function (f) { return String(f[c]) === String(v); }); return this; };
  Consulta.prototype.in = function (c, vs) { var set = vs.map(String); this.filtros.push(function (f) { return set.indexOf(String(f[c])) >= 0; }); return this; };
  Consulta.prototype.maybeSingle = function () { this.una = true; return this; };
  /* como supabase-js: la petición sale al hacer then (o await) */
  Consulta.prototype.then = function (ok, ko) {
    var q = this;
    return new Promise(function (res) { setTimeout(function () { res(ejecutar(q)); }, 120); }).then(ok, ko);
  };
  function ejecutar(q) {
    if (!s.red) return { data: null, error: { message: 'TypeError: Failed to fetch', details: '', hint: '', code: '' }, status: 0 };
    if (!s.sesion) return fallo('42501', 'permission denied for table ' + q.t);
    var tabla = s.t[q.t], UID = usuario().id;
    function pasa(f) { return f.user_id === UID && q.filtros.every(function (fn) { return fn(f); }); }   /* RLS: auth.uid() = user_id */
    var cols = (q.cols && q.cols !== '*') ? q.cols.split(',').map(function (c) { return c.trim(); }) : [];
    var escritas = q.v ? (Array.isArray(q.v) ? q.v : [q.v]) : [];
    var raras = cols.concat.apply(cols, escritas.map(Object.keys)).filter(function (c) { return COLUMNAS[q.t].indexOf(c) < 0; });
    if (raras.length) return fallo('PGRST204', "Could not find the '" + raras[0] + "' column of '" + q.t + "' in the schema cache");
    if (q.op === 'select') {
      var todas = tabla.filter(pasa);
      if (q.orden) { var oc = q.orden.c, sg = q.orden.asc ? 1 : -1; todas.sort(function (a, b) { return a[oc] < b[oc] ? -sg : a[oc] > b[oc] ? sg : 0; }); }
      var filas = todas.map(function (f) { return proyectar(f, q.cols); });
      if (q.una) return filas.length > 1 ? fallo('PGRST116', 'JSON object requested, multiple rows returned') : { data: filas[0] || null, error: null, status: 200 };
      /* lo que hace PostgREST: el trozo de range(), y nunca mas de Max rows */
      var desde = q.rango ? q.rango[0] : 0, hasta = q.rango ? q.rango[1] : Infinity;
      var tope = Math.max(1, s.maxFilas || 1000);
      var trozo = filas.slice(desde, Math.min(hasta + 1, desde + tope));
      return { data: trozo, count: q.contar ? filas.length : null, error: null, status: 200 };
    }
    if (q.op === 'insert' || q.op === 'upsert') {
      var nuevas = Array.isArray(q.v) ? q.v : [q.v], copia = tabla.slice(), hechas = [];
      for (var i = 0; i < nuevas.length; i++) {
        var f = Object.assign({}, nuevas[i]);
        if (f.user_id !== UID) return fallo('42501', 'new row violates row-level security policy for table "' + q.t + '"');
        if (q.t !== 'perfiles' && !s.t.perfiles.some(function (p) { return p.user_id === f.user_id; })) return fallo('23503', 'insert or update on table "' + q.t + '" violates foreign key constraint "' + q.t + '_user_id_fkey"');
        var j = copia.findIndex(function (x) { return misma(q.t, x, f); });
        if (j >= 0 && q.op === 'insert') return fallo('23505', 'duplicate key value violates unique constraint "' + q.t + '_pkey"');
        var g = j >= 0 ? Object.assign({}, copia[j], f) : f;
        if (q.t === 'perfiles') { if (!g.consentido_en) g.consentido_en = new Date().toISOString(); if (!g.updated_at) g.updated_at = new Date().toISOString(); if (!g.unidades) g.unidades = 'metric'; }
        var c = comprobar(q.t, g); if (c) return fallo('23514', 'new row for relation "' + q.t + '" violates check constraint "' + c + '"');
        if (j >= 0) copia[j] = g; else copia.push(g);
        hechas.push(g);
      }
      s.t[q.t] = copia; guardar();
      return { data: q.devolver ? hechas.map(function (f) { return proyectar(f, q.cols); }) : null, error: null, status: 201 };
    }
    if (q.op === 'update') {
      var out = [], copiaU = tabla.slice();
      for (var k = 0; k < copiaU.length; k++) if (pasa(copiaU[k])) {
        var h = Object.assign({}, copiaU[k], q.v);
        if (h.user_id !== UID) return fallo('42501', 'new row violates row-level security policy for table "' + q.t + '"');
        var cc = comprobar(q.t, h); if (cc) return fallo('23514', 'new row for relation "' + q.t + '" violates check constraint "' + cc + '"');
        copiaU[k] = h; out.push(h);
      }
      s.t[q.t] = copiaU; guardar();
      return { data: q.devolver ? out.map(function (f) { return proyectar(f, q.cols); }) : null, error: null, status: 200 };
    }
    if (q.op === 'delete') {
      var idos = tabla.filter(pasa);
      s.t[q.t] = tabla.filter(function (f) { return !pasa(f); });
      if (q.t === 'perfiles') idos.forEach(function (p) {   /* on delete cascade */
        ['pesos', 'caminatas'].forEach(function (t2) { s.t[t2] = s.t[t2].filter(function (f) { return f.user_id !== p.user_id; }); });
      });
      guardar();
      return { data: null, error: null, status: 204 };
    }
    return fallo('PGRST000', 'operación desconocida');
  }
  var cliente = { from: function (t) { if (!PK[t]) throw new Error('no hay tabla ' + t); return new Consulta(t); } };
  function avisar() { window.dispatchEvent(new Event('tg-sesion')); }
  window.AppAuth = {
    isConfigured: function () { return true; },
    isReady: function () { return true; },
    isLoggedIn: function () { return !!s.sesion; },
    getUser: function () { return s.sesion ? usuario() : null; },
    getClient: function () { return cliente; },
    isAdmin: function () { return !!(s.sesion && s.admin); },
    openLogin: function () { s.sesion = true; guardar(); avisar(); },
    logout: function () { s.sesion = false; guardar(); avisar(); }
  };

  /* El pie «Demo»: sesión, administrador, sin conexión y lo que hay en la nube de mentira. */
  function $(id) { return document.getElementById(id); }
  function pintar() {
    var cs = $('tgp-demo-sesion'), ca = $('tgp-demo-admin'), cr = $('tgp-demo-red'), n = $('tgp-demo-nube');
    if (cs) cs.checked = !!s.sesion; if (ca) ca.checked = !!s.admin; if (cr) cr.checked = !s.red;
    if (!n) return;
    var mio = function (f) { return f.user_id === usuario().id; };
    var p = s.t.perfiles.filter(mio).length, w = s.t.pesos.filter(mio).length, k = s.t.caminatas.filter(mio).length;
    n.textContent = 'Nube (simulada): ' + (p ? 'perfil · ' + w + ' pesos · ' + k + ' caminatas' : 'vacía');
  }
  if ($('tgp-demo-sesion')) $('tgp-demo-sesion').addEventListener('change', function () { s.sesion = this.checked; guardar(); avisar(); });
  if ($('tgp-demo-admin')) $('tgp-demo-admin').addEventListener('change', function () { s.admin = this.checked; guardar(); avisar(); });
  if ($('tgp-demo-red')) $('tgp-demo-red').addEventListener('change', function () { s.red = !this.checked; guardar(); if (s.red) window.dispatchEvent(new Event('online')); });
  pintar();

  /* Para las pruebas: mirar y tocar la nube «desde otro móvil». */
  window.TGP_DEMO_NUBE = {
    uids: CUENTAS.map(function (c) { return c.id; }),
    estado: function () { return JSON.parse(JSON.stringify(s)); },
    tabla: function (t) { return JSON.parse(JSON.stringify(s.t[t])); },
    poner: function (t, filas) { s.t[t] = JSON.parse(JSON.stringify(filas)); guardar(); },
    red: function (b, sinAviso) { s.red = !!b; guardar(); if (s.red && !sinAviso) window.dispatchEvent(new Event('online')); },
    sesion: function (b) { s.sesion = !!b; guardar(); avisar(); },
    cuenta: function (i) { s.cuenta = i === 1 ? 1 : 0; guardar(); avisar(); },
    maxFilas: function (n) { s.maxFilas = n > 0 ? n : 1000; guardar(); return s.maxFilas; },
    reiniciar: function () { try { localStorage.removeItem(KEY); } catch (e) {} s = nuevo(); guardar(); }
  };
})();
