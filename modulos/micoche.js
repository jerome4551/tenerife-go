/* modulos/micoche.js — «Mi coche y mi posición» (20 de noviembre de 2026).

   QUE ES. Jerome, el 19 de noviembre de 2026: «Si prepáralo». Dos cosas
   pequeñas y practicas, sin datos de nadie, solo el GPS del movil:
     · «Aparqué aquí»: guarda donde se deja el coche (y una nota: planta,
       plaza, calle…), lo marca en el mapa con 🚗 y lleva de vuelta a pie con
       la app de mapas del movil (Mapas de Apple en iPhone; Google Maps en lo
       demas, como el «Cómo llegar» de las fichas).
     · «Enviar mi posición»: las coordenadas y un enlace al mapa, para
       mandarlas a quien uno elija (la hoja de compartir del movil; sin ella,
       WhatsApp, SMS o copiar). La app no envia nada por su cuenta.
   El boton 🚗 vive en el mapa, en la columna de la derecha, debajo del «3D»;
   la pantalla es una hoja que sube desde abajo, encima del mapa.

   LO QUE SE GUARDA. Solo en el dispositivo, en localStorage (CLAVE): la
   posicion del coche, su precision, la hora y la nota. Se valida campo a
   campo al leerla (dentro de Tenerife, numeros de verdad, nota de texto
   corto) y se borra con «Borrar». Nada sale del movil: ni a Supabase ni a
   ningun servidor (privacidad, «Mi coche (opcional)»).

   LA UBICACION. Se pide solo al tocar «Aparqué aquí» o «Buscar mi posición».
   Al abrir la hoja, si el permiso ya esta concedido (Permissions API), se
   pide una posicion aproximada para decir a cuanto queda el coche; si no lo
   esta, no se pregunta nada.

   COMO SE PINTA. Como el SOS: createElement y textContent; la nota la
   escribe la persona y va siempre por value y textContent. innerHTML solo
   para el 🚗 del marcador (una cadena fija de este fichero). Los textos, de
   COCHE_UI (once idiomas) o de UI_TX (tx). Al cambiar de idioma se repinta
   la hoja y el marcador (TG_IDIOMA). El boton «atras» del movil cierra la
   hoja (una entrada de historial, como el SOS). */
(function () {
  'use strict';

  var CLAVE = 'tenerife.coche';
  var NOTA_MAX = 60;
  var PRECISION_BAJA = 50;
  var WHATSAPP = 'WhatsApp';   /* la marca: no se traduce */
  var ZONA = 'Atlantic/Canary';
  /* SIN-TRADUCIR: COCHE_LOCALE codigos de idioma para Intl (fechas, horas y numeros), no textos */
  var COCHE_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL', ro: 'ro-RO' };

  var COCHE_UI = {
    "cocheIntro": {"es": "Guarde dónde aparca y vuelva a pie hasta su coche.", "en": "Save where you park and walk back to your car.", "fr": "Enregistrez l’endroit où vous vous garez et revenez à pied jusqu’à votre voiture.", "de": "Speichern Sie, wo Sie parken, und gehen Sie zu Fuß zu Ihrem Auto zurück.", "it": "Salvi dove parcheggia e torni a piedi fino all’auto.", "nl": "Sla op waar u parkeert en loop terug naar uw auto.", "zh": "保存停车位置，步行返回您的车。", "zht": "儲存停車位置，步行返回您的車。", "bg": "Запазете къде паркирате и се върнете пеша до колата си.", "pl": "Miejsce parkowania można zapisać i potem wrócić do samochodu pieszo.", "ro": "Salvați locul unde parcați și întoarceți-vă pe jos la mașină."},
    "cocheGuardar": {"es": "Aparqué aquí", "en": "I parked here", "fr": "Ma voiture est ici", "de": "Hier geparkt", "it": "Ho parcheggiato qui", "nl": "Hier geparkeerd", "zh": "我停在这里", "zht": "我停在這裡", "bg": "Паркирах тук", "pl": "Zapisać miejsce parkowania", "ro": "Am parcat aici"},
    "cocheGuardarOtra": {"es": "Guardar aquí de nuevo", "en": "Save here again", "fr": "Enregistrer ici à nouveau", "de": "Hier erneut speichern", "it": "Salvare di nuovo qui", "nl": "Hier opnieuw opslaan", "zh": "重新保存在这里", "zht": "重新儲存在這裡", "bg": "Запазете отново тук", "pl": "Zapisać tutaj ponownie", "ro": "Salvați din nou aici"},
    "cocheBuscando": {"es": "Buscando su posición…", "en": "Finding your location…", "fr": "Recherche de votre position…", "de": "Ihr Standort wird gesucht…", "it": "Ricerca della posizione…", "nl": "Uw locatie wordt gezocht…", "zh": "正在查找您的位置…", "zht": "正在查找您的位置…", "bg": "Търси се вашето местоположение…", "pl": "Ustalanie lokalizacji…", "ro": "Se caută locația dumneavoastră…"},
    "cocheErrorPos": {"es": "No se pudo saber dónde está. Compruebe que Tenerife Go puede usar la ubicación e inténtelo de nuevo.", "en": "We couldn’t find where you are. Check that Tenerife Go is allowed to use your location and try again.", "fr": "Impossible de trouver votre position. Vérifiez que Tenerife Go peut utiliser la localisation et réessayez.", "de": "Ihr Standort konnte nicht ermittelt werden. Prüfen Sie, ob Tenerife Go den Standort verwenden darf, und versuchen Sie es erneut.", "it": "Non è stato possibile trovare la sua posizione. Controlli che Tenerife Go possa usare la posizione e riprovi.", "nl": "Uw locatie kon niet worden bepaald. Controleer of Tenerife Go uw locatie mag gebruiken en probeer het opnieuw.", "zh": "无法确定您的位置。请确认已允许 Tenerife Go 使用定位，然后重试。", "zht": "無法確定您的位置。請確認已允許 Tenerife Go 使用定位，然後重試。", "bg": "Местоположението ви не можа да бъде определено. Проверете дали Tenerife Go има достъп до местоположението и опитайте отново.", "pl": "Nie udało się ustalić lokalizacji. Należy sprawdzić, czy Tenerife Go ma dostęp do lokalizacji, i spróbować ponownie.", "ro": "Locația dumneavoastră nu a putut fi aflată. Verificați dacă Tenerife Go poate folosi localizarea și încercați din nou."},
    "cocheFuera": {"es": "Esa posición queda fuera de Tenerife: no se ha guardado.", "en": "That location is outside Tenerife, so it hasn’t been saved.", "fr": "Cette position est en dehors de Tenerife : elle n’a pas été enregistrée.", "de": "Dieser Standort liegt außerhalb von Teneriffa und wurde nicht gespeichert.", "it": "Questa posizione è fuori da Tenerife: non è stata salvata.", "nl": "Die locatie ligt buiten Tenerife en is niet opgeslagen.", "zh": "该位置不在特内里费岛内，未保存。", "zht": "該位置不在特內里費島內，未儲存。", "bg": "Това местоположение е извън Тенерифе и не е запазено.", "pl": "Ta lokalizacja jest poza Teneryfą, więc nie została zapisana.", "ro": "Această locație este în afara insulei Tenerife, așa că nu a fost salvată."},
    "cocheNoCabe": {"es": "No se ha podido guardar en este dispositivo: puede que no quede sitio.", "en": "It couldn’t be saved on this device: it may be out of space.", "fr": "Impossible d’enregistrer sur cet appareil : il manque peut-être de place.", "de": "Auf diesem Gerät konnte nicht gespeichert werden: Möglicherweise ist kein Platz mehr frei.", "it": "Non è stato possibile salvare su questo dispositivo: forse non c’è più spazio.", "nl": "Opslaan op dit apparaat is niet gelukt: misschien is er geen ruimte meer.", "zh": "无法保存到本设备：可能存储空间不足。", "zht": "無法儲存到本裝置：可能儲存空間不足。", "bg": "Не можа да се запази на това устройство: може би няма място.", "pl": "Nie udało się zapisać na tym urządzeniu: być może brakuje miejsca.", "ro": "Nu s-a putut salva pe acest dispozitiv: poate nu mai este spațiu."},
    "cocheSu": {"es": "Su coche", "en": "Your car", "fr": "Votre voiture", "de": "Ihr Auto", "it": "La sua auto", "nl": "Uw auto", "zh": "您的车", "zht": "您的車", "bg": "Вашата кола", "pl": "Samochód", "ro": "Mașina dumneavoastră"},
    "cocheHoy": {"es": "Guardado hoy a las {h}", "en": "Saved today at {h}", "fr": "Enregistré aujourd’hui à {h}", "de": "Heute um {h} gespeichert", "it": "Salvato oggi alle {h}", "nl": "Vandaag om {h} opgeslagen", "zh": "今天 {h} 保存", "zht": "今天 {h} 儲存", "bg": "Запазено днес в {h}", "pl": "Zapisano dziś o {h}", "ro": "Salvat azi la ora {h}"},
    "cocheDia": {"es": "Guardado el {f}, a las {h}", "en": "Saved on {f} at {h}", "fr": "Enregistré le {f} à {h}", "de": "Gespeichert am {f} um {h}", "it": "Salvato il {f} alle {h}", "nl": "Opgeslagen op {f} om {h}", "zh": "{f} {h} 保存", "zht": "{f} {h} 儲存", "bg": "Запазено на {f} в {h}", "pl": "Zapisano {f} o {h}", "ro": "Salvat pe {f}, la ora {h}"},
    "cocheDistancia": {"es": "A {d} en línea recta", "en": "{d} away in a straight line", "fr": "À {d} à vol d’oiseau", "de": "{d} Luftlinie entfernt", "it": "A {d} in linea d’aria", "nl": "{d} hemelsbreed", "zh": "直线距离 {d}", "zht": "直線距離 {d}", "bg": "На {d} по права линия", "pl": "{d} w linii prostej", "ro": "La {d} în linie dreaptă"},
    "cochePrecision": {"es": "precisión ±{m} m", "en": "accuracy ±{m} m", "fr": "précision ±{m} m", "de": "Genauigkeit ±{m} m", "it": "precisione ±{m} m", "nl": "nauwkeurigheid ±{m} m", "zh": "精度 ±{m} 米", "zht": "精度 ±{m} 公尺", "bg": "точност ±{m} м", "pl": "dokładność ±{m} m", "ro": "precizie ±{m} m"},
    "cochePrecisionBaja": {"es": "Precisión baja (±{m} m). Si puede, guárdelo otra vez al aire libre.", "en": "Low accuracy (±{m} m). If you can, save it again outdoors.", "fr": "Précision faible (±{m} m). Si possible, enregistrez-la à nouveau en plein air.", "de": "Geringe Genauigkeit (±{m} m). Speichern Sie die Position wenn möglich im Freien erneut.", "it": "Precisione bassa (±{m} m). Se può, la salvi di nuovo all’aperto.", "nl": "Lage nauwkeurigheid (±{m} m). Sla de positie zo mogelijk opnieuw op in de open lucht.", "zh": "精度较低（±{m} 米）。如有可能，请到室外重新保存。", "zht": "精度較低（±{m} 公尺）。如有可能，請到室外重新儲存。", "bg": "Ниска точност (±{m} м). Ако можете, запазете отново на открито.", "pl": "Niska dokładność (±{m} m). Jeśli to możliwe, najlepiej zapisać ponownie na zewnątrz.", "ro": "Precizie scăzută (±{m} m). Dacă puteți, salvați din nou în aer liber."},
    "cocheNota": {"es": "Nota (planta, plaza, calle…)", "en": "Note (level, space, street…)", "fr": "Note (niveau, place, rue…)", "de": "Notiz (Ebene, Stellplatz, Straße…)", "it": "Nota (piano, posto, via…)", "nl": "Notitie (verdieping, plek, straat…)", "zh": "备注（楼层、车位、街道…）", "zht": "備註（樓層、車位、街道…）", "bg": "Бележка (ниво, място, улица…)", "pl": "Notatka (poziom, miejsce, ulica…)", "ro": "Notă (nivel, loc, stradă…)"},
    "cocheVolver": {"es": "Volver a pie", "en": "Walk back", "fr": "Revenir à pied", "de": "Zu Fuß zurück", "it": "Tornare a piedi", "nl": "Teruglopen", "zh": "步行返回", "zht": "步行返回", "bg": "Обратно пеша", "pl": "Wrócić pieszo", "ro": "Înapoi pe jos"},
    "cocheVerMapa": {"es": "Ver en el mapa", "en": "Show on the map", "fr": "Voir sur la carte", "de": "Auf der Karte ansehen", "it": "Vedere sulla mappa", "nl": "Op de kaart bekijken", "zh": "在地图上查看", "zht": "在地圖上查看", "bg": "Вижте на картата", "pl": "Zobaczyć na mapie", "ro": "Vedeți pe hartă"},
    "cocheBorrar": {"es": "Borrar", "en": "Delete", "fr": "Effacer", "de": "Löschen", "it": "Cancellare", "nl": "Wissen", "zh": "删除", "zht": "刪除", "bg": "Изтрийте", "pl": "Usunąć", "ro": "Ștergeți"},
    "cocheBorrarSeguro": {"es": "¿Borrar? Toque otra vez", "en": "Delete? Tap again", "fr": "Effacer ? Touchez à nouveau", "de": "Löschen? Noch einmal tippen", "it": "Cancellare? Tocchi di nuovo", "nl": "Wissen? Tik nogmaals", "zh": "删除？请再点一次", "zht": "刪除？請再點一次", "bg": "Изтриване? Докоснете отново", "pl": "Usunąć? Ponowne dotknięcie potwierdza", "ro": "Ștergeți? Atingeți din nou"},
    "cochePosTit": {"es": "Enviar mi posición", "en": "Send my location", "fr": "Envoyer ma position", "de": "Meinen Standort senden", "it": "Inviare la mia posizione", "nl": "Mijn locatie versturen", "zh": "发送我的位置", "zht": "傳送我的位置", "bg": "Изпратете местоположението си", "pl": "Wysłać moją lokalizację", "ro": "Trimiteți locația mea"},
    "cochePosIntro": {"es": "Mande dónde está a quien usted elija. La app no lo envía nunca por su cuenta.", "en": "Send where you are to whoever you choose. The app never sends it on its own.", "fr": "Envoyez l’endroit où vous êtes à qui vous voulez. L’app ne l’envoie jamais d’elle-même.", "de": "Senden Sie Ihren Standort, an wen Sie möchten. Die App verschickt ihn nie von selbst.", "it": "Mandi dove si trova a chi vuole. L’app non lo invia mai da sola.", "nl": "Stuur uw locatie naar wie u wilt. De app verstuurt die nooit uit zichzelf.", "zh": "把您的位置发给您选择的人。应用绝不会自行发送。", "zht": "把您的位置傳給您選擇的人。應用程式絕不會自行傳送。", "bg": "Изпратете къде сте на когото решите. Приложението никога не го изпраща само.", "pl": "Lokalizację można wysłać wybranej osobie. Aplikacja nigdy nie wysyła jej sama.", "ro": "Trimiteți locația dumneavoastră cui doriți. Aplicația nu o trimite niciodată singură."},
    "cocheBuscarPos": {"es": "Buscar mi posición", "en": "Find my location", "fr": "Trouver ma position", "de": "Meinen Standort bestimmen", "it": "Trovare la mia posizione", "nl": "Mijn locatie bepalen", "zh": "获取我的位置", "zht": "取得我的位置", "bg": "Намерете местоположението ми", "pl": "Ustalić moją lokalizację", "ro": "Aflați locația mea"},
    "cocheEnviar": {"es": "Enviar", "en": "Send", "fr": "Envoyer", "de": "Senden", "it": "Inviare", "nl": "Versturen", "zh": "发送", "zht": "傳送", "bg": "Изпратете", "pl": "Wysłać", "ro": "Trimiteți"},
    "cocheCopiar": {"es": "Copiar", "en": "Copy", "fr": "Copier", "de": "Kopieren", "it": "Copiare", "nl": "Kopiëren", "zh": "复制", "zht": "複製", "bg": "Копирайте", "pl": "Skopiować", "ro": "Copiați"},
    "cocheCopiado": {"es": "Copiado", "en": "Copied", "fr": "Copié", "de": "Kopiert", "it": "Copiato", "nl": "Gekopieerd", "zh": "已复制", "zht": "已複製", "bg": "Копирано", "pl": "Skopiowano", "ro": "Copiat"},
    "cocheSms": {"es": "SMS", "en": "Text message", "fr": "SMS", "de": "SMS", "it": "SMS", "nl": "Sms", "zh": "短信", "zht": "簡訊", "bg": "SMS съобщение", "pl": "SMS", "ro": "SMS"},
    "cocheSmsNota": {"es": "Sin datos móviles, el SMS sirve igual.", "en": "Without mobile data, a text message still works.", "fr": "Sans données mobiles, le SMS fonctionne quand même.", "de": "Ohne mobile Daten funktioniert eine SMS trotzdem.", "it": "Senza dati mobili, l’SMS funziona lo stesso.", "nl": "Zonder mobiele data werkt een sms toch.", "zh": "没有移动数据时，短信照样能发。", "zht": "沒有行動數據時，簡訊照樣能傳。", "bg": "Без мобилни данни SMS пак работи.", "pl": "Bez danych komórkowych SMS i tak działa.", "ro": "Fără date mobile, SMS-ul funcționează oricum."},
    "cocheMensaje": {"es": "Estoy aquí: {c} (±{m} m)\n{u}", "en": "I’m here: {c} (±{m} m)\n{u}", "fr": "Je suis ici : {c} (±{m} m)\n{u}", "de": "Ich bin hier: {c} (±{m} m)\n{u}", "it": "Sono qui: {c} (±{m} m)\n{u}", "nl": "Ik ben hier: {c} (±{m} m)\n{u}", "zh": "我在这里：{c}（±{m} 米）\n{u}", "zht": "我在這裡：{c}（±{m} 公尺）\n{u}", "bg": "Тук съм: {c} (±{m} м)\n{u}", "pl": "Jestem tutaj: {c} (±{m} m)\n{u}", "ro": "Sunt aici: {c} (±{m} m)\n{u}"},
    "cochePrecisionHora": {"es": "precisión ±{m} m · medida a las {h}", "en": "accuracy ±{m} m · measured at {h}", "fr": "précision ±{m} m · mesurée à {h}", "de": "Genauigkeit ±{m} m · gemessen um {h}", "it": "precisione ±{m} m · rilevata alle {h}", "nl": "nauwkeurigheid ±{m} m · gemeten om {h}", "zh": "精度 ±{m} 米 · 测量时间 {h}", "zht": "精度 ±{m} 公尺 · 測量時間 {h}", "bg": "точност ±{m} м · измерено в {h}", "pl": "dokładność ±{m} m · pomiar o {h}", "ro": "precizie ±{m} m · măsurată la ora {h}"},
    "cocheSoloAqui": {"es": "Se guarda solo en este dispositivo y no se envía a ningún servidor.", "en": "It is kept only on this device and is not sent to any server.", "fr": "Tout reste uniquement sur cet appareil et n’est envoyé à aucun serveur.", "de": "Das bleibt nur auf diesem Gerät und wird an keinen Server gesendet.", "it": "Tutto resta solo su questo dispositivo e non viene inviato a nessun server.", "nl": "Dit blijft alleen op dit apparaat en wordt naar geen enkele server gestuurd.", "zh": "仅保存在本设备上，不会发送到任何服务器。", "zht": "僅儲存在本裝置上，不會傳送到任何伺服器。", "bg": "Всичко остава само на това устройство и не се изпраща на никакъв сървър.", "pl": "Dane zostają tylko na tym urządzeniu i nie trafiają na żaden serwer.", "ro": "Totul se păstrează doar pe acest dispozitiv și nu se trimite la niciun server."}
  };

  var S = { abierto: false, historia: 0, cerrando: false, coche: null, pos: null,
            guardar: '', envio: null, envioEstado: '', borrar: 0, marca: null, copiado: 0 };

  /* ── TEXTOS ──────────────────────────────────────────────────────── */
  function idioma() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function loc() { return COCHE_LOCALE[idioma()] || 'es-ES'; }
  function t(k, vars) {
    var e = COCHE_UI[k], s;
    if (e) s = e[idioma()] || e.en || e.es || '';
    else s = (typeof tx === 'function') ? tx(k, vars) : '';
    if (e && vars) for (var v in vars) if (Object.prototype.hasOwnProperty.call(vars, v)) {
      if (typeof txLaUna === 'function' && typeof vars[v] === 'string' && /^0?1:\d\d/.test(vars[v])) s = txLaUna(s, '{' + v + '}');
      s = s.split('{' + v + '}').join(String(vars[v]));
    }
    return s;
  }
  function hora(d) {
    try { return d.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit', timeZone: ZONA }); } catch (e) { return ''; }
  }
  function dia(d) {
    try { return d.toLocaleDateString(loc(), { day: 'numeric', month: 'short', timeZone: ZONA }); } catch (e) { return ''; }
  }
  function mismoDia(a, b) {
    try {
      var f = function (d) { return d.toLocaleDateString('en-CA', { timeZone: ZONA }); };
      return f(a) === f(b);
    } catch (e) { return a.toDateString() === b.toDateString(); }
  }
  function metros(m) {
    if (m < 1000) return Math.max(10, Math.round(m / 10) * 10) + ' ' + (idioma() === 'bg' ? 'м' : (idioma() === 'zh' ? '米' : (idioma() === 'zht' ? '公尺' : 'm')));
    var km;
    try { km = (m / 1000).toLocaleString(loc(), { maximumFractionDigits: 1 }); } catch (e) { km = (m / 1000).toFixed(1); }
    return km + ' ' + (idioma() === 'bg' ? 'км' : (idioma() === 'zh' ? '公里' : (idioma() === 'zht' ? '公里' : 'km')));
  }

  /* ── LO GUARDADO ─────────────────────────────────────────────────── */
  function dentro(lat, lng) {
    try { if (typeof tenerifeBounds !== 'undefined' && tenerifeBounds && tenerifeBounds.contains) return tenerifeBounds.contains([lat, lng]); } catch (e) {}
    return lat > 27.9 && lat < 28.65 && lng > -16.98 && lng < -16.08;
  }
  function limpiaNota(s) { return String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NOTA_MAX); }
  function valido(v) {
    return !!v && v.v === 1 && typeof v.lat === 'number' && typeof v.lng === 'number' && isFinite(v.lat) && isFinite(v.lng) &&
           dentro(v.lat, v.lng) && typeof v.acc === 'number' && isFinite(v.acc) && v.acc >= 0 && v.acc < 100000 &&
           typeof v.t === 'string' && !isNaN(Date.parse(v.t)) && (v.nota === undefined || typeof v.nota === 'string');
  }
  /* Lo que no sea un coche valido se borra: si no, el cargador de index.html
     veria «hay algo guardado» y pediria este modulo en cada arranque. */
  function leer() {
    var crudo = null, v = null;
    try { crudo = localStorage.getItem(CLAVE); } catch (e) { return null; }
    if (crudo === null) return null;
    try { v = JSON.parse(crudo); } catch (e) { v = null; }
    if (!valido(v)) { try { localStorage.removeItem(CLAVE); } catch (e) {} return null; }
    v.nota = limpiaNota(v.nota);
    return v;
  }
  function escribir(c) { try { localStorage.setItem(CLAVE, JSON.stringify(c)); return true; } catch (e) { return false; } }
  function quitar() { try { localStorage.removeItem(CLAVE); } catch (e) {} }

  /* ── POSICION ────────────────────────────────────────────────────── */
  function pedirPos(alta, ok, mal) {
    if (!navigator.geolocation) { mal(); return; }
    try {
      navigator.geolocation.getCurrentPosition(function (p) {
        ok({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: new Date() });
      }, function () { mal(); },
      /* guardar el coche y enviar la posicion: una medida nueva (maximumAge 0),
         que una de hace unos segundos puede ser de antes de aparcar; la
         distancia al abrir la hoja: una de hace medio minuto como mucho */
      alta ? { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } : { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 });
    } catch (e) { mal(); }
  }
  /* sin preguntar: solo si el permiso ya esta dado */
  function posSinPreguntar() {
    try {
      if (!navigator.permissions || !navigator.permissions.query) return;
      navigator.permissions.query({ name: 'geolocation' }).then(function (r) {
        if (r && r.state === 'granted') pedirPos(false, function (p) { S.pos = p; if (S.abierto) pintar(); }, function () {});
      }, function () {});
    } catch (e) {}
  }
  function distancia(a, b) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function coordTxt(p) { return p.lat.toFixed(5) + ', ' + p.lng.toFixed(5); }
  function urlMapa(p) { return 'https://www.google.com/maps/search/?api=1&query=' + p.lat.toFixed(5) + ',' + p.lng.toFixed(5); }
  function esIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  /* como el «Cómo llegar» de las fichas (index.html), pero a pie */
  function urlAPie(c) {
    var coord = c.lat.toFixed(6) + ',' + c.lng.toFixed(6);
    return esIOS() ? 'https://maps.apple.com/?daddr=' + coord + '&dirflg=w'
                   : 'https://www.google.com/maps/dir/?api=1&destination=' + coord + '&travelmode=walking';
  }

  /* ── EL MARCADOR Y EL BOTON ──────────────────────────────────────── */
  function hayMapa() { try { return typeof L !== 'undefined' && L && typeof L.marker === 'function' && typeof map !== 'undefined' && map; } catch (e) { return false; } }
  function quitarMarca() {
    if (S.marca) { try { S.marca.remove(); } catch (e) {} S.marca = null; }
  }
  function ponerMarca() {
    quitarMarca();
    if (!S.coche || !hayMapa()) return;
    try {
      var icono = L.divIcon({ className: 'coche-marca', html: '<span aria-hidden="true">🚗</span>', iconSize: [38, 38], iconAnchor: [19, 19] });
      S.marca = L.marker([S.coche.lat, S.coche.lng], { icon: icono, zIndexOffset: 900, keyboard: true, title: t('cocheSu'), alt: t('cocheSu') });
      S.marca.on('click', function () { abrir(); });
      S.marca.addTo(map);
    } catch (e) { S.marca = null; }
  }
  function boton() {
    var b = document.getElementById('coche-btn');
    if (b) b.classList.toggle('guardado', !!S.coche);
  }

  /* ── PIEZAS ──────────────────────────────────────────────────────── */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function btn(cls, txt, fn) {
    var b = el('button', cls, txt);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }
  function enlace(url, txt, cls) {
    var a = el('a', cls, txt);
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }

  /* ── ESTILOS (una vez) ───────────────────────────────────────────── */
  var CSS = "/* ── MI COCHE: el cuerpo de la hoja (lo inyecta modulos/micoche.js) ── */\n" +
    "#coche-cuerpo .coche-caja { display: flex; flex-direction: column; gap: 10px; padding: 12px 13px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }\n" +
    "#coche-cuerpo .coche-t { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-weight: 700; font-size: 0.98rem; }\n" +
    "#coche-cuerpo .coche-t small { font-weight: 400; font-size: 0.78rem; color: var(--muted, rgba(240,236,228,0.6)); }\n" +
    "#coche-cuerpo .coche-p { margin: 0; font-size: 0.88rem; line-height: 1.45; color: var(--muted, rgba(240,236,228,0.66)); }\n" +
    "#coche-cuerpo .coche-dato { margin: 0; font-size: 0.95rem; line-height: 1.4; }\n" +
    "#coche-cuerpo .coche-aviso { margin: 0; font-size: 0.84rem; line-height: 1.4; color: #fdba74; }\n" +
    "#coche-cuerpo .coche-error { margin: 0; font-size: 0.86rem; line-height: 1.4; color: #fca5a5; }\n" +
    "#coche-cuerpo .coche-fila { display: flex; flex-wrap: wrap; gap: 8px; }\n" +
    "#coche-cuerpo .coche-b { min-height: 44px; padding: 10px 14px; border-radius: 12px; cursor: pointer; font: 600 0.9rem 'DM Sans', system-ui, sans-serif; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;\n" +
    "  border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); color: var(--text, #f0ece4); flex: 1 1 auto; }\n" +
    "#coche-cuerpo .coche-b.oro { background: var(--gold, #D4AF37); border-color: var(--gold, #D4AF37); color: #1a1407; }\n" +
    "#coche-cuerpo .coche-b.peligro { color: #fca5a5; }\n" +
    "#coche-cuerpo .coche-b[aria-disabled=\"true\"] { opacity: 0.6; cursor: default; }\n" +
    "#coche-cuerpo .coche-b:focus-visible, #coche-cuerpo input:focus-visible { outline: 2px solid #f5c76b; outline-offset: 2px; }\n" +
    "#coche-cuerpo .coche-grande { width: 100%; min-height: 52px; font-size: 1rem; }\n" +
    "#coche-cuerpo label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--muted, rgba(240,236,228,0.66)); }\n" +
    "#coche-cuerpo input { min-height: 42px; padding: 8px 11px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: rgba(0,0,0,0.25); color: var(--text, #f0ece4); font: 400 16px 'DM Sans', system-ui, sans-serif; }\n" +
    "#coche-cuerpo output { display: block; font: 700 1.05rem 'DM Sans', system-ui, sans-serif; font-variant-numeric: tabular-nums; letter-spacing: 0.01em; }\n" +
    "#coche-cuerpo .coche-pie { margin: 0; font-size: 0.76rem; line-height: 1.45; color: var(--muted, rgba(240,236,228,0.5)); }\n" +
    ".coche-marca { display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--gold, #D4AF37); border: 2px solid #1a1407;\n" +
    "  box-shadow: 0 4px 12px rgba(0,0,0,0.45); font-size: 20px; line-height: 1; }\n" +
    ".coche-marca.coche-late { animation: coche-late 900ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) 2; }\n" +
    "@keyframes coche-late { 0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.7); } 100% { box-shadow: 0 0 0 18px rgba(212,175,55,0); } }\n" +
    "@media (prefers-reduced-motion: reduce) { .coche-marca.coche-late { animation: none; } }\n";
  function estilos() {
    if (document.getElementById('coche-css')) return;
    var st = document.createElement('style');
    st.id = 'coche-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── ACCIONES ────────────────────────────────────────────────────── */
  /* Lo que cambia sin que se toque nada mas (buscando, guardado, error) se
     dice tambien en voz alta a quien usa un lector de pantalla: #coche-vivo
     esta en el armazon, fuera de lo que se repinta. */
  function anunciar(txt) {
    var v = document.getElementById('coche-vivo');
    if (!v) return;
    v.textContent = '';
    setTimeout(function () { v.textContent = txt; }, 60);
  }
  function guardarAqui() {
    if (S.guardar === 'buscando') return;
    S.guardar = 'buscando'; pintar(); anunciar(t('cocheBuscando'));
    pedirPos(true, function (p) {
      if (!dentro(p.lat, p.lng)) { S.guardar = 'fuera'; pintar(); anunciar(t('cocheFuera')); return; }
      var nota = S.coche ? S.coche.nota : '';
      var c = { v: 1, lat: Math.round(p.lat * 1e6) / 1e6, lng: Math.round(p.lng * 1e6) / 1e6, acc: Math.round(p.acc), t: p.t.toISOString(), nota: nota || '' };
      if (!escribir(c)) { S.guardar = 'nocabe'; pintar(); anunciar(t('cocheNoCabe')); return; }
      S.coche = c; S.pos = p; S.guardar = ''; S.borrar = 0;
      ponerMarca(); boton(); pintar();
      anunciar(t('cocheHoy', { h: hora(p.t) }));
    }, function () { S.guardar = 'error'; pintar(); anunciar(t('cocheErrorPos')); });
  }
  function cambiarNota(v) {
    if (!S.coche) return;
    S.coche.nota = limpiaNota(v);
    escribir(S.coche);
  }
  function borrarCoche(b) {
    if (!S.borrar || Date.now() - S.borrar > 4000) {
      S.borrar = Date.now();
      b.textContent = t('cocheBorrarSeguro');
      setTimeout(function () { if (S.borrar && Date.now() - S.borrar >= 4000 && S.abierto) { S.borrar = 0; pintar(); } }, 4100);
      return;
    }
    S.borrar = 0; quitar(); S.coche = null; quitarMarca(); boton(); pintar();
  }
  function verEnMapa() {
    if (!S.coche || !hayMapa()) return;
    var c = S.coche;
    cerrar();
    setTimeout(function () {
      try { map.setView([c.lat, c.lng], 17); } catch (e) {}
      try {
        var i = S.marca && S.marca.getElement && S.marca.getElement();
        if (i) { i.classList.remove('coche-late'); void i.offsetWidth; i.classList.add('coche-late'); }
      } catch (e) {}
    }, 460);
  }
  function buscarPos() {
    if (S.envioEstado === 'buscando') return;
    S.envioEstado = 'buscando'; pintar(); anunciar(t('cocheBuscando'));
    pedirPos(true, function (p) {
      S.envio = p; S.pos = p; S.envioEstado = 'ok'; pintar();
      anunciar(coordTxt(p) + ' · ' + t('cochePrecisionHora', { m: String(Math.round(p.acc)), h: hora(p.t) }));
    }, function () { S.envioEstado = 'error'; pintar(); anunciar(t('cocheErrorPos')); });
  }
  function mensaje() {
    var p = S.envio;
    return t('cocheMensaje', { c: coordTxt(p), m: String(Math.round(p.acc)), u: urlMapa(p) });
  }
  function compartir() {
    var txt = mensaje();
    try {
      var r = navigator.share({ text: txt });
      if (r && r.catch) r.catch(function () {});
    } catch (e) {}
  }
  function copiar(b, out) {
    var txt = mensaje();
    var hecho = function () { S.copiado = Date.now(); b.textContent = t('cocheCopiado'); anunciar(t('cocheCopiado')); };
    var aMano = function () { try { var r = document.createRange(); r.selectNodeContents(out); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} };
    try { navigator.clipboard.writeText(txt).then(hecho, aMano); } catch (e) { aMano(); }
  }

  /* ── PINTAR ──────────────────────────────────────────────────────── */
  function panel() { return document.getElementById('coche-panel'); }
  function cuerpo() { return document.getElementById('coche-cuerpo'); }
  function conId(e, id) { e.id = id; return e; }
  function cajaCoche() {
    var c = el('div', 'coche-caja');
    if (!S.coche) {
      c.appendChild(el('p', 'coche-p', t('cocheIntro')));
      var g = conId(btn('coche-b oro coche-grande', S.guardar === 'buscando' ? t('cocheBuscando') : '🚗 ' + t('cocheGuardar'), guardarAqui), 'coche-guardar');
      if (S.guardar === 'buscando') g.setAttribute('aria-disabled', 'true');
      c.appendChild(g);
    } else {
      var cab = el('div', 'coche-t', t('cocheSu'));
      var cuando = new Date(S.coche.t);
      cab.appendChild(el('small', null, mismoDia(cuando, new Date()) ? t('cocheHoy', { h: hora(cuando) })
                                                                      : t('cocheDia', { f: dia(cuando), h: hora(cuando) })));
      c.appendChild(cab);
      var datos = [];
      /* La distancia, solo con una medida posterior a la del coche y si es
         mayor que lo que pueden equivocarse las dos: recien guardado, o al
         lado del coche, «A 10 m» no dice nada. */
      if (S.pos && S.pos.t.getTime() - Date.parse(S.coche.t) > 2000) {
        var dm = distancia(S.pos, S.coche);
        if (dm > Math.max(15, (S.pos.acc || 0) + S.coche.acc)) datos.push(t('cocheDistancia', { d: metros(dm) }));
      }
      datos.push(t('cochePrecision', { m: String(S.coche.acc) }));
      c.appendChild(el('p', 'coche-dato', datos.join(' · ')));
      if (S.coche.acc > PRECISION_BAJA) c.appendChild(el('p', 'coche-aviso', t('cochePrecisionBaja', { m: String(S.coche.acc) })));
      var lab = el('label', null, t('cocheNota'));
      lab.setAttribute('for', 'coche-nota');
      var inp = el('input');
      inp.id = 'coche-nota'; inp.type = 'text'; inp.maxLength = NOTA_MAX; inp.autocomplete = 'off';
      inp.setAttribute('enterkeyhint', 'done');
      inp.value = S.coche.nota || '';
      inp.addEventListener('input', function () { cambiarNota(inp.value); });
      inp.addEventListener('change', function () { cambiarNota(inp.value); });
      inp.addEventListener('blur', function () { cambiarNota(inp.value); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
      lab.appendChild(inp);
      c.appendChild(lab);
      var fila = el('div', 'coche-fila');
      fila.appendChild(conId(enlace(urlAPie(S.coche), '🚶 ' + t('cocheVolver'), 'coche-b oro'), 'coche-volver'));
      if (hayMapa()) fila.appendChild(conId(btn('coche-b', t('cocheVerMapa'), verEnMapa), 'coche-ver'));
      c.appendChild(fila);
      var fila2 = el('div', 'coche-fila');
      var otra = conId(btn('coche-b', S.guardar === 'buscando' ? t('cocheBuscando') : t('cocheGuardarOtra'), guardarAqui), 'coche-otra');
      if (S.guardar === 'buscando') otra.setAttribute('aria-disabled', 'true');
      fila2.appendChild(otra);
      var b = conId(btn('coche-b peligro', S.borrar && Date.now() - S.borrar < 4000 ? t('cocheBorrarSeguro') : t('cocheBorrar'), function () { borrarCoche(b); }), 'coche-borrar');
      fila2.appendChild(b);
      c.appendChild(fila2);
    }
    if (S.guardar === 'error') c.appendChild(el('p', 'coche-error', t('cocheErrorPos')));
    if (S.guardar === 'fuera') c.appendChild(el('p', 'coche-error', t('cocheFuera')));
    if (S.guardar === 'nocabe') c.appendChild(el('p', 'coche-error', t('cocheNoCabe')));
    return c;
  }
  function cajaEnvio() {
    var c = el('div', 'coche-caja');
    c.appendChild(el('div', 'coche-t', t('cochePosTit')));
    c.appendChild(el('p', 'coche-p', t('cochePosIntro')));
    if (S.envioEstado !== 'ok' || !S.envio) {
      var b = conId(btn('coche-b coche-grande', S.envioEstado === 'buscando' ? t('cocheBuscando') : '📍 ' + t('cocheBuscarPos'), buscarPos), 'coche-buscar');
      if (S.envioEstado === 'buscando') b.setAttribute('aria-disabled', 'true');
      c.appendChild(b);
      if (S.envioEstado === 'error') c.appendChild(el('p', 'coche-error', t('cocheErrorPos')));
      return c;
    }
    var out = el('output', null, coordTxt(S.envio));
    out.setAttribute('translate', 'no');
    c.appendChild(out);
    c.appendChild(el('p', 'coche-p', t('cochePrecisionHora', { m: String(Math.round(S.envio.acc)), h: hora(S.envio.t) })));
    var fila = el('div', 'coche-fila');
    var msg = encodeURIComponent(mensaje());
    if (navigator.share) {
      fila.appendChild(conId(btn('coche-b oro', t('cocheEnviar'), compartir), 'coche-enviar'));
    } else {
      fila.appendChild(conId(enlace('https://wa.me/?text=' + msg, WHATSAPP, 'coche-b oro'), 'coche-enviar'));
      var sms = conId(el('a', 'coche-b', t('cocheSms')), 'coche-sms');
      sms.href = 'sms:?&body=' + msg;
      fila.appendChild(sms);
    }
    var cp = conId(btn('coche-b', S.copiado && Date.now() - S.copiado < 3000 ? t('cocheCopiado') : t('cocheCopiar'), function () { copiar(cp, out); }), 'coche-copiar');
    fila.appendChild(cp);
    c.appendChild(fila);
    if (!navigator.share) c.appendChild(el('p', 'coche-pie', t('cocheSmsNota')));
    c.appendChild(conId(btn('coche-b', t('cocheBuscarPos'), buscarPos), 'coche-buscar-otra'));
    return c;
  }
  /* Mientras se busca la posicion, los botones dicen «Buscando…» con
     aria-disabled y no con disabled: un boton disabled pierde el foco, y
     quien usa un lector de pantalla se quedaba sin saber donde estaba. */
  /* Si el boton que tenia el foco ya no esta tras repintar, el foco va al que
     ocupa su sitio: tras guardar el coche, a «Volver a pie»; tras buscar la
     posicion, a «Enviar»; tras borrar, a «Aparqué aquí». */
  var SUCESOR = { 'coche-guardar': 'coche-volver', 'coche-buscar': 'coche-enviar', 'coche-borrar': 'coche-guardar', 'coche-otra': 'coche-otra' };
  function pintar() {
    var c = cuerpo(); if (!c) return;
    estilos();
    var act = document.activeElement;
    if (act && act.id === 'coche-nota') return;   /* no repintar mientras se escribe la nota */
    var foco = act && c.contains(act) ? act.id : '';
    c.textContent = '';
    c.appendChild(cajaCoche());
    c.appendChild(cajaEnvio());
    c.appendChild(el('p', 'coche-pie', t('cocheSoloAqui')));
    var tit = document.getElementById('coche-titulo'); if (tit) tit.textContent = t('cocheTitulo');
    var x = document.getElementById('coche-cerrar'); if (x) x.setAttribute('aria-label', t('ariaCerrar'));
    if (foco) {
      var f = document.getElementById(foco) || document.getElementById(SUCESOR[foco] || '');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
    }
  }

  /* ── ABRIR Y CERRAR (con el boton «atras» del movil) ─────────────── */
  function enfocar() { var tit = document.getElementById('coche-titulo'); if (tit) { tit.setAttribute('tabindex', '-1'); try { tit.focus({ preventScroll: true }); } catch (e) {} } }
  function abrir() {
    var p = panel(); if (!p) return;
    estilos();
    S.coche = leer();
    if (!S.abierto) {
      S.abierto = true; S.historia = 0; S.guardar = ''; S.borrar = 0;
      if (S.envio && Date.now() - S.envio.t.getTime() > 10 * 60000) { S.envio = null; S.envioEstado = ''; }
      p.hidden = false;
      document.documentElement.classList.add('coche-abierto');
      try { history.pushState({ tgCoche: 1 }, ''); S.historia = 1; } catch (e) {}
      if (S.coche) posSinPreguntar();
    }
    pintar();
    enfocar();
  }
  function cerrar() {
    if (!S.abierto || S.cerrando) return;   /* dos toques seguidos: un solo «atras» */
    var inp = document.getElementById('coche-nota'); if (inp && S.coche) cambiarNota(inp.value);
    if (S.historia > 0) {
      S.cerrando = true;
      setTimeout(function () { if (S.cerrando) cerrarYa(); }, 450);
      try { history.back(); return; } catch (e) { S.cerrando = false; }
    }
    cerrarYa();
  }
  function cerrarYa() {
    S.abierto = false; S.cerrando = false; S.historia = 0;
    var p = panel(); if (p) p.hidden = true;
    document.documentElement.classList.remove('coche-abierto');
    var b = document.getElementById('coche-btn'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
  }
  function alAtras() { if (S.abierto) cerrarYa(); }
  /* El modulo se carga en un rato libre si hay un coche guardado, para
     pintarlo en el mapa: si el mapa aun no esta, se reintenta unas veces. */
  function marcaCuandoHayaMapa(n) {
    if (!S.coche || S.marca) return;
    if (hayMapa()) { ponerMarca(); return; }
    if (n > 0) setTimeout(function () { marcaCuandoHayaMapa(n - 1); }, 1500);
  }
  function iniciar() {
    S.coche = leer();
    marcaCuandoHayaMapa(8);
    boton();
    window.addEventListener('popstate', alAtras);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.abierto) cerrar(); });
    try { TG_IDIOMA.registrar('micoche', function () { ponerMarca(); if (S.abierto) pintar(); }); } catch (e) {}
  }
  iniciar();

  /* Para el cargador de index.html y para las herramientas de tools/ */
  window.TG_COCHE = {
    abrir: abrir, cerrar: cerrar, repintar: function () { if (S.abierto) pintar(); },
    estado: S, filas: COCHE_UI, clave: CLAVE, leer: leer, valido: valido, urlAPie: urlAPie, t: t
  };
})();
