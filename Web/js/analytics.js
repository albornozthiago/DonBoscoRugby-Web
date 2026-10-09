/* Google Analytics 4: pegar acá el ID de medición (G-XXXXXXXXXX). Vacío, no carga nada. */
(function () {
  var ID = "";
  if (!ID) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", ID);
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
  document.head.appendChild(s);
})();
