/* corre en el <head>: marca que hay JS para que el CSS oculte lo que va a animarse antes del primer dibujo (evita el parpadeo).
   Si app.js no llega a cargar (no suma .js-ok), a los 4 s se muestra todo igual. */
document.documentElement.classList.add("js");
setTimeout(function () { if (!document.documentElement.classList.contains("js-ok")) document.documentElement.classList.add("js-late"); }, 4000);
