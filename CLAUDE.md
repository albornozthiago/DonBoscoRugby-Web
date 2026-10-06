# Don Bosco Rugby — sitio web

Web del Ateneo Cultural y Deportivo Don Bosco (Bernal, URBA Primera B). Sitio estático en HTML, CSS y JS puros, sin build ni dependencias. Se sirve con Live Server en `127.0.0.1:5500/Web/index.html`.

## Estructura

- `index.html`: todo el contenido y las secciones (inicio, sponsors, fixture, formación, una sección por categoría, noticias, el club y sus páginas, sumate).
- `css/styles.css`: estilos. Tokens de color y tipografía en `:root` al principio del archivo.
- `js/app.js`: datos y comportamiento (fixture, formación, noticias, carrusel de sponsors).
- `assets/`: `crest.png` (escudo), `hockey.jpg`, `players/p1.jpg` a `p15.jpg` (fotos por número de camiseta) y `sponsors/*.png` (un logo por sponsor).

## Estilo

Basado en los flyers del club: franjas azul, blanco y rojo en V, hoja blanca al centro, bloques azules, fechas y números en pestañas rojas inclinadas.

- Titulares: Bebas Neue. Texto: Montserrat (Google Fonts).
- En los titulares, la primera palabra usa `--accent-text` (azul oscuro en claro, blanco en oscuro) y la segunda `--red`.
- Colores solo con variables CSS (`--navy`, `--red`, `--paper`, `--ink`, etc.). No poner colores sueltos en los componentes.
- Hay tema claro y oscuro: se define en `:root`, en `prefers-color-scheme: dark` y en `[data-theme="dark"]`. Cualquier color nuevo debe existir en los tres.
- Mobile primero hasta 400 px, sin scroll horizontal. Los breakpoints están al final del CSS (900 px y 560 px).
- Táctil (Android e iOS): zonas de toque de 44 px y campos de texto a 16 px (si no, iOS hace zoom). Está en el bloque `@media (pointer: coarse)` al final del CSS. Los textos grandes usan `clamp()` para no desbordar a 320 px.
- Español rioplatense, tono directo, sin frases de relleno.

## Cómo se actualiza el contenido (todo en `js/app.js`)

- **Resultados**: array `M`, un partido por fila: `[fecha, "AAAA-MM-DD", rival, "L"|"V", tantos DB, tantos rival, hora]`. Los partidos por jugar llevan `null, null` y la hora. Los tantos de Don Bosco van siempre primero, sin importar si fue local o visitante.
- **Próximo partido, racha y estadísticas**: se calculan solos desde `M` y la fecha de hoy. No se editan a mano.
- **Formación XV**: array `XV` (`[número, nombre, apellido, puesto]`). La foto de cada jugador es `assets/players/p{número}.jpg`.
- **Noticias**: array `N` (`c` categoría, `d` fecha ISO, `t` título, `x` resumen, `u` link). El destacado es la primera nota. Las categorías del filtro están en `CATS`.
- **Fotos en las secciones**: en un panel `.sport`, `<div class="vis ph"><img ...></div>` reemplaza el escudo por una foto. Usar versiones livianas (máx. 1400 px de ancho, unos 300 KB), como `assets/dbr/juveniles-web.jpg`.
- **Banner de portada**: si existe `assets/dbr/bandera-web.jpg` se muestra esa foto; si no, el escudo sobre las franjas.
- **Escudos de rivales**: `assets/clubs/{nombre}.png`, con el nombre del rival en minúsculas y sin tildes, espacios ni puntos (`cudequilmes.png`, `sanmartin.png`). Sin archivo se muestran las iniciales.
- **Pestañas**: "Categorías" y "El club" muestran un panel a la vez para evitar scroll. Cada panel es un `<div class="panel" id="...">` con un `.sport` adentro, y su botón está en la barra `.tabs` (`data-p` = id del panel). Un link `#id` a un panel lo abre solo. Paneles de categorías: plantel superior, femenino, infantil, juvenil, Ocelotes, hockey. Paneles de El club: historia, predio, El Ceibo (sede social), Consejo Directivo, presidentes, capitanes, Decálogo, contacto. Los datos salieron de donboscorugby.org; si cambian, se actualizan a mano. Las listas usan `<ul class="rows">`. Fechas y encuentros van como noticia en `N`.
- **Sponsors**: agregar el logo en `assets/sponsors/` y un `<li class="car-item">` en `index.html`. El JS duplica los ítems para el bucle infinito.
- **Rondas del fixture**: fechas 1 a 13 son la primera ronda y 14 a 26 la segunda.

## Fuente de datos

Los resultados salen del fixture de la URBA (Primera B 2026): https://urba.org.ar/fixture?year=2026&id=2025178. Ante cualquier diferencia con la web histórica del club (donboscorugby.org), vale el dato de la URBA.

## Reglas de trabajo

- Solo se muestra la Primera. Intermedia y Pre A, B y C no van por ahora.
- El carrusel de sponsors va arriba, justo después de la portada. No se pausa con el mouse, no tiene botón de pausa ni flechas (solo se frena al tocarlo en el celular). No agregar ninguno.
- No hay tarjetas de categorías ni secciones apiladas: se evita el scroll largo con pestañas.
- No hay tabla de posiciones propia (los puntos de bonus no están claros). Se enlaza a la tabla de la URBA.
- Las posiciones de la formación se asignaron por número de camiseta y pueden diferir del puesto real de cada jugador.
- Los links de noticias apuntan a la web histórica del club hasta que haya contenido propio. No hay sección de media.
- Mantener HTML, CSS y JS separados. No volver a meter estilos ni scripts dentro del HTML.
- Pendiente (próxima sesión): páginas HTML propias para reemplazar las de la web histórica del club (donboscorugby.org, que se va a dar de baja) y cambiar las fotos de Noticias por las nuevas. Faltan también fotos reales de partidos.

## Contacto y redes del club

- Sede social "El Ceibo": 9 de Julio 345, Bernal.
- Instagram `rugbydonbosco`, Facebook `rugby.don.bosco`, X `@RugbyDonBosco`, YouTube `@DonBoscoRugbyOficial`.
