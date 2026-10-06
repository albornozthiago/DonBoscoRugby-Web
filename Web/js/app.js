/* Don Bosco Rugby — datos y comportamiento */
(function () {
  var MES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
  var MESL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function pd(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, ""); }
  function crest(name) {
    var ini = name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    return '<span class="rc"><img src="assets/clubs/' + slug(name) + '.png" alt="" loading="lazy" onerror="this.hidden=true;this.parentNode.classList.add(\'nf\')"><span class="i" aria-hidden="true">' + ini + '</span></span>';
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* [fecha, fecha ISO, rival, L/V, tantos DB, tantos rival, hora] — Fuente: URBA, Primera B 2026 */
  var M = [
    [1,"2026-03-14","Delta","L",27,17],
    [2,"2026-03-21","Manuel Belgrano","V",13,17],
    [3,"2026-03-28","Mariano Moreno","L",22,26],
    [4,"2026-04-11","Monte Grande","V",17,19],
    [5,"2026-04-18","San Martín","L",38,30],
    [6,"2026-04-25","Banco Nación","L",23,32],
    [7,"2026-05-09","Argentino","V",25,17],
    [8,"2026-05-16","C.U. de Quilmes","L",22,33],
    [9,"2026-05-23","Liceo Naval","V",14,10],
    [10,"2026-06-06","Italiano","L",37,15],
    [11,"2026-06-13","San Patricio","V",27,31],
    [12,"2026-06-20","Liceo Militar","L",31,23],
    [13,"2026-07-04","Vicentinos","V",34,15],
    [14,"2026-07-11","Delta","V",27,18],
    [15,"2026-07-18","Manuel Belgrano","L",27,17],
    [16,"2026-08-01","Mariano Moreno","V",23,16],
    [17,"2026-08-15","Monte Grande","L",40,24],
    [18,"2026-08-22","San Martín","V",30,24],
    [19,"2026-08-29","Banco Nación","V",17,38],
    [20,"2026-09-05","Argentino","L",43,31],
    [21,"2026-09-12","C.U. de Quilmes","V",7,26],
    [22,"2026-09-26","Liceo Naval","L",26,28],
    [23,"2026-10-03","Italiano","V",28,10],
    [24,"2026-10-10","San Patricio","L",null,null,"15:30"],
    [25,"2026-10-17","Liceo Militar","V",null,null,"15:30"],
    [26,"2026-10-24","Vicentinos","L",null,null,"15:30"]
  ];
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function played(m) { return m[4] !== null; }
  var nextIdx = -1;
  M.forEach(function (m, i) { if (nextIdx < 0 && !played(m) && pd(m[1]) >= today) nextIdx = i; });

  /* portada */
  var last = null;
  M.forEach(function (m) { if (played(m)) last = m; });
  if (nextIdx >= 0) {
    var n = M[nextIdx], d = pd(n[1]);
    document.getElementById("nx-tab").innerHTML = '<span class="d">' + pad(d.getDate()) + '</span><span class="m">' + MES[d.getMonth()] + '</span>';
    document.getElementById("nx-vs").innerHTML = crest(n[2]) + "<span>vs " + esc(n[2]) + "</span>";
    document.getElementById("nx-sub").textContent = "Fecha " + n[0] + " · " + (n[3] === "L" ? "Local · Predio de Bernal" : "Visitante") + " · " + n[6] + " hs";
    var diff = Math.round((d - today) / 86400000);
    document.getElementById("nx-days").textContent = diff <= 0 ? "Se juega hoy" : (diff === 1 ? "Falta 1 día" : "Faltan " + diff + " días");
  } else {
    document.getElementById("nx-vs").textContent = "Temporada completa";
    document.getElementById("nx-sub").textContent = "Gracias por acompañar al Bosco";
  }
  if (last) {
    document.getElementById("nx-last").textContent = "Último resultado: " + (last[3] === "L" ? "Don Bosco " + last[4] + " – " + last[5] + " " + last[2] : last[2] + " " + last[5] + " – " + last[4] + " Don Bosco") + " (fecha " + last[0] + ")";
  }

  /* estadísticas y racha */
  var pj = 0, g = 0, p = 0, pf = 0, pc = 0;
  M.forEach(function (m) { if (played(m)) { pj++; pf += m[4]; pc += m[5]; if (m[4] > m[5]) g++; else p++; } });
  var dif = pf - pc;
  document.getElementById("tiles").innerHTML =
    '<div class="tile dk"><b>' + pj + '</b><span>Jugados</span></div>' +
    '<div class="tile"><b>' + g + '</b><span>Ganados</span></div>' +
    '<div class="tile red"><b>' + p + '</b><span>Perdidos</span></div>' +
    '<div class="tile dk"><b>' + pf + '</b><span>Tantos a favor</span></div>' +
    '<div class="tile dk"><b>' + pc + '</b><span>Tantos en contra</span></div>' +
    '<div class="tile"><b>' + (dif > 0 ? "+" : "") + dif + '</b><span>Diferencia</span></div>';
  document.getElementById("formstrip").innerHTML = M.map(function (m) {
    if (!played(m)) return '<i class="p" title="Fecha ' + m[0] + ': por jugar">' + m[0] + '</i>';
    var w = m[4] > m[5];
    return '<i class="' + (w ? "" : "l") + '" title="Fecha ' + m[0] + ' vs ' + esc(m[2]) + ': ' + m[4] + ' a ' + m[5] + '">' + (w ? "G" : "P") + '</i>';
  }).join("");

  /* fixture con filtros */
  var round = nextIdx >= 0 && nextIdx < 13 ? 1 : 2, filt = "all";
  function renderFx() {
    var items = M.filter(function (m) {
      if ((round === 1) !== (m[0] <= 13)) return false;
      if (filt === "L" || filt === "V") return m[3] === filt;
      if (filt === "G") return played(m) && m[4] > m[5];
      if (filt === "P") return played(m) && m[4] < m[5];
      return true;
    });
    var html = items.map(function (m) {
      var d = pd(m[1]), local = m[3] === "L", i = m[0] - 1, sc;
      if (played(m)) {
        var w = m[4] > m[5];
        sc = '<div class="score' + (w ? "" : " loss") + '">' + m[4] + ' – ' + m[5] + '<small>' + (w ? "Ganó" : "Perdió") + '</small></div>';
      } else {
        sc = '<div class="score todo">' + m[6] + ' hs</div>';
      }
      return '<li class="fx ' + (local ? "local" : "visit") + (i === nextIdx ? " up" : "") + '">' +
        '<div class="tab"><span class="d">' + pad(d.getDate()) + '</span><span class="m">' + MES[d.getMonth()] + '</span></div>' +
        '<div><div class="tag"><b>Fecha ' + m[0] + '</b><em>' + (local ? "Local vs." : "Visitante vs.") + '</em></div><p class="rival">' + crest(m[2]) + '<span>' + esc(m[2]) + '</span></p></div>' + sc + '</li>';
    }).join("");
    document.getElementById("fixture-list").innerHTML = html || '<li class="empty">No hay partidos con este filtro en esta ronda.</li>';
    document.getElementById("round-label").textContent = round === 1 ? "Primera ronda" : "Segunda ronda";
  }
  function bind(id, attr, cb) {
    var box = document.getElementById(id);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      Array.prototype.forEach.call(box.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cb(b.getAttribute(attr));
    });
  }
  bind("seg-round", "data-r", function (v) { round = +v; renderFx(); });
  bind("seg-filter", "data-f", function (v) { filt = v; renderFx(); });
  (function () {
    var bs = document.querySelectorAll("#seg-round button");
    Array.prototype.forEach.call(bs, function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-r") === round ? "true" : "false"); });
  })();
  renderFx();

  /* formación XV vs Italiano */
  var IMG = {
    1: "assets/players/p1.jpg", 2: "assets/players/p2.jpg", 3: "assets/players/p3.jpg", 4: "assets/players/p4.jpg", 5: "assets/players/p5.jpg", 6: "assets/players/p6.jpg", 7: "assets/players/p7.jpg", 8: "assets/players/p8.jpg",
    9: "assets/players/p9.jpg", 10: "assets/players/p10.jpg", 11: "assets/players/p11.jpg", 12: "assets/players/p12.jpg", 13: "assets/players/p13.jpg", 14: "assets/players/p14.jpg", 15: "assets/players/p15.jpg"
  };
  var XV = [
    [1,"Joaquín","Salguero","Pilar izquierdo"],
    [2,"Fernando","Gabba (C)","Hooker"],
    [3,"Xavier","Villalba","Pilar derecho"],
    [4,"Mauro","Ferradas","Segunda línea"],
    [5,"Guido","Goyak","Segunda línea"],
    [6,"Tomás","Gori","Ala"],
    [7,"Mauricio","Gori","Ala"],
    [8,"Marian","Biondo","Número 8"],
    [9,"Lisandro","Bigliardi","Medio scrum"],
    [10,"Franco","Villano","Apertura"],
    [11,"Santiago","De Elorduy","Wing"],
    [12,"Teo","Gonzalez Bigliardi","Primer centro"],
    [13,"Gonzalo","Gadano","Segundo centro"],
    [14,"Joaquín","Sempe","Wing"],
    [15,"Juan","Berutti (VC)","Fullback"]
  ];
  function xvRow(x) {
    return '<li><span class="n">' + pad(x[0]) + '</span><span class="who">' + esc(x[1]) + '<b>' + esc(x[2]) + '</b><small>' + x[3] + '</small></span>' +
      '<img src="' + IMG[x[0]] + '" alt="' + esc(x[1] + " " + x[2]) + '" width="120" height="88" loading="lazy"></li>';
  }
  document.getElementById("xv-f").innerHTML = XV.slice(0, 8).map(xvRow).join("");
  document.getElementById("xv-b").innerHTML = XV.slice(8).map(xvRow).join("");

  /* portal de noticias */
  var N = [
    {c:"Infraestructura", d:"2026-09-27", t:"Master Plan Don Bosco Rugby: ordenar el club para crecer", x:"El Ateneo presentó su Master Plan 2026, una herramienta de planificación para ordenar el crecimiento de la infraestructura deportiva, social e institucional.", u:"https://donboscorugby.org/master-plan-don-bosco-rugby-infraestructura/"},
    {c:"Hockey", d:"2026-09-23", t:"Hockey: encuentro de escuelita y mayores", x:"El 23 de septiembre a las 18:15 hs, Don Bosco, Hockey Muni y el Polideportivo Solano se encontraron en el Estadio Nacional de Hockey Quilmes.", u:"#hockey"},
    {c:"Eventos", d:"2026-09-05", t:"Un Encuentro de Otra Galaxia", x:"El predio de Bernal se llenó de personajes de Star Wars, con fotos, sables de luz y una colecta solidaria para el Jardín de Infantes del Hogar Escuela Don Bosco.", u:"https://donboscorugby.org/encuentro-de-otra-galaxia-2026/"},
    {c:"Infraestructura", d:"2026-04-24", t:"Inauguramos el nuevo ingreso al predio de Bernal", x:"Una mejora de infraestructura largamente anhelada que refleja el crecimiento del club y el compromiso de toda la comunidad.", u:"https://donboscorugby.org/inauguracion-nuevo-ingreso-predio-bernal/"},
    {c:"Comunidad", d:"2026-01-02", t:"Arranca el Verano en Don Bosco 2026", x:"Desde el 12 de enero, lunes y miércoles de 18:30 a 20:00, para chicos y chicas de 4 a 13 años. Juegos, deportes, campamentos y un amigo invitado gratis.", u:"https://twitter.com/rugbydonbosco/status/2007173689662652666"},
    {c:"Rugby", d:"2025-05-25", t:"¡Histórico debut del rugby femenino!", x:"El Rugby Femenino Mayor escribió su primera página en URBA, con triunfo en la primera jornada del circuito 2025 de Seven.", u:"https://donboscorugby.org/debut-femenino-urba"},
    {c:"Club", d:"2024-12-14", t:"2024: balance de un año brillante", x:"El repaso del año en el club.", u:"https://donboscorugby.org/2024-balance-de-un-ano-brillante/"},
    {c:"Rugby", d:"2023-05-20", t:"Fecha URBA de rugby infantil en Don Bosco", x:"El club recibió a las divisiones infantiles de Varela Jr, Los Matreros, Centro Naval, Lanús RC, CAR y CUQ.", u:"https://donboscorugby.org/fecha-urba-2023-rugby-infantil/"},
    {c:"Comunidad", d:"2023-04-01", t:"Don Bosco y Ciudad impulsan la campaña del Respeto", x:"Una campaña conjunta para cuidar el respeto dentro y fuera de la cancha.", u:"https://donboscorugby.org/don-bosco-y-ciudad-impulsan-respeto/"}
  ];
  var CATS = ["Todas", "Rugby", "Hockey", "Eventos", "Infraestructura", "Comunidad", "Club"];
  var ncat = "Todas", nq = "", nshow = 6;
  var segN = document.getElementById("seg-news");
  segN.innerHTML = CATS.map(function (c, i) { return '<button type="button" data-c="' + c + '" aria-pressed="' + (i === 0) + '">' + c + '</button>'; }).join("");
  function fdate(iso) { var d = pd(iso); return d.getDate() + " " + MESL[d.getMonth()] + " " + d.getFullYear(); }
  function renderNews() {
    var q = norm(nq);
    var list = N.filter(function (n) {
      return (ncat === "Todas" || n.c === ncat) && (!q || norm(n.t + " " + n.x + " " + n.c).indexOf(q) >= 0);
    });
    var out = list.slice(0, nshow).map(function (n, i) {
      var ext = n.u.charAt(0) !== "#";
      var link = '<a class="more" href="' + n.u + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '>' + (ext ? "Leer nota" : "Ver sección") + '</a>';
      var meta = '<div class="meta"><span class="cat-t">' + n.c + '</span><time datetime="' + n.d + '">' + fdate(n.d) + '</time></div>';
      if (i === 0 && !q) {
        return '<article class="card f"><div class="art" aria-hidden="true"><span>' + n.c + '</span></div><div style="display:grid;gap:12px;align-content:center">' + meta + '<h3>' + esc(n.t) + '</h3><p>' + esc(n.x) + '</p>' + link + '</div></article>';
      }
      return '<article class="card">' + meta + '<h3>' + esc(n.t) + '</h3><p>' + esc(n.x) + '</p>' + link + '</article>';
    }).join("");
    document.getElementById("news").innerHTML = out || '<p class="empty" style="grid-column:1/-1">No encontramos notas con esa búsqueda.</p>';
    document.getElementById("nmore").hidden = list.length <= nshow;
  }
  segN.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    Array.prototype.forEach.call(segN.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    ncat = b.getAttribute("data-c"); nshow = 6; renderNews();
  });
  document.getElementById("nsearch").addEventListener("input", function (e) { nq = e.target.value; nshow = 6; renderNews(); });
  document.getElementById("nmore").addEventListener("click", function () { nshow += 6; renderNews(); });
  renderNews();
})();

/* carrusel de sponsors */
(function () {
  var view = document.getElementById("car-view"), track = document.getElementById("car-track");
  if (!view || !track) return;
  Array.prototype.slice.call(track.children).forEach(function (li) {
    var c = li.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.querySelector("img").alt = "";
    track.appendChild(c);
  });
  var paused = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hold = false, last = 0, carry = 0, holdTimer = null;
  function half() { return track.scrollWidth / 2; }
  function tick(t) {
    var dt = last ? Math.min(t - last, 64) : 0; last = t;
    if (!paused && !hold) {
      carry += 0.045 * dt;
      var s = Math.floor(carry);
      if (s >= 1) { view.scrollLeft += s; carry -= s; }
    }
    var h = half();
    if (h > 0 && view.scrollLeft >= h) view.scrollLeft -= h;
    requestAnimationFrame(tick);
  }
  view.addEventListener("touchstart", function () { hold = true; clearTimeout(holdTimer); }, { passive: true });
  view.addEventListener("touchend", function () { clearTimeout(holdTimer); holdTimer = setTimeout(function () { hold = false; }, 2500); }, { passive: true });
  requestAnimationFrame(tick);
})();

/* pestañas */
(function () {
  var groups = Array.prototype.slice.call(document.querySelectorAll(".tabs")).map(function (bar) {
    return { bar: bar, btns: Array.prototype.slice.call(bar.querySelectorAll("button")), panels: Array.prototype.slice.call(bar.parentNode.querySelectorAll(".panel")) };
  });
  function show(g, id) {
    g.panels.forEach(function (p) { p.hidden = p.id !== id; });
    g.btns.forEach(function (b) { var on = b.getAttribute("data-p") === id; b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-selected", String(on)); });
  }
  function find(id) { for (var i = 0; i < groups.length; i++) if (groups[i].panels.some(function (p) { return p.id === id; })) return groups[i]; return null; }
  groups.forEach(function (g) {
    show(g, g.panels[0].id);
    g.bar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(g, b.getAttribute("data-p")); });
  });
  function go(id, smooth) {
    var g = find(id); if (!g) return false;
    show(g, id);
    g.bar.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    if (go(a.getAttribute("href").slice(1), true)) e.preventDefault();
  });
  if (location.hash) go(location.hash.slice(1), false);
})();
/* flechas del menú de arriba (solo se ven en celulares): mueven los ítems y se apagan en los extremos */
(function () {
  var nav = document.querySelector("nav.menu"); if (!nav) return;
  var ul = nav.querySelector("ul"), prev = nav.querySelector(".nv.prev"), next = nav.querySelector(".nv.next");
  if (!ul || !prev || !next) return;
  function upd() {
    prev.classList.toggle("off", ul.scrollLeft <= 2);
    next.classList.toggle("off", ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2);
  }
  function move(dir) { ul.scrollBy({ left: dir * ul.clientWidth * 0.7, behavior: "smooth" }); }
  prev.addEventListener("click", function () { move(-1); });
  next.addEventListener("click", function () { move(1); });
  ul.addEventListener("scroll", upd, { passive: true });
  window.addEventListener("resize", upd);
  upd();
})();
