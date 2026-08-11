/* ============================================================
   UNDER — INTERFAZ
   Renderiza todas las pantallas. Sin frameworks, HTML en strings.
   ============================================================ */

window.Under = window.Under || {};

Under.UI = {

  /* ---------- Helpers básicos ---------- */
  esc: function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  },

  txt: function (state, x) {
    if (typeof x === "function") return x(state);
    return x == null ? "" : String(x);
  },

  fmt: function (n) {
    n = Math.round(n);
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  },

  fmtDinero: function (n) {
    return "$" + Under.UI.fmt(n);
  },

  fmtExacto: function (n) {
    return Math.round(n).toLocaleString("es-AR");
  },

  bar: function (valor, cls) {
    var pct = Math.round(Under.STATE.clamp(valor, 0, 100));
    return '<div class="bar ' + (cls || "") + '"><div style="width:' + pct + '%"></div></div>';
  },

  /* ---------- Metadatos de estadísticas ---------- */
  NAMES: {
    popularity: "Popularidad", fans: "Fans", talent: "Talento", money: "Dinero"
  },

  STATS: [
    { key: "popularity", icono: "⭐", nombre: "Popularidad" },
    { key: "talent",     icono: "🎯", nombre: "Talento" },
    { key: "money",      icono: "💰", nombre: "Dinero" }
  ],

  DESC: {
    popularity: ["Nadie te conoce todavía.", "En tu barrio ya hablan de vos.", "La escena local te ubica.", "Tu nombre llega a todo el país.", "Sos una figura nacional.", "Tu música cruzó fronteras."],
    fans: ["Cero seguidores.", "Una comunidad chica que te banca.", "Tenés un público fiel.", "Tu audiencia es grande.", "Millones te escuchan.", "El mundo entero te sigue."],
    money: ["Vivís al día.", "Algo de plata para reinvertir.", "Podés financiar tus proyectos.", "Vivís de la música cómodo.", "Sos rico.", "Nivel estrella mundial."],
    talent: ["Todavía estás aprendiendo.", "Tenés condiciones.", "Sos un buen músico.", "Tu talento es evidente.", "Sos de los mejores.", "Un talento generacional."]
  },

  descTier: function (statKey, value) {
    var tiers = Under.UI.DESC[statKey];
    if (!tiers) return "";
    var idx = value < 20 ? 0 : value < 40 ? 1 : value < 60 ? 2 : value < 80 ? 3 : value < 95 ? 4 : 5;
    return tiers[idx];
  },

  /* Valor normalizado para las barras (fans y dinero usan log) */
  barValue: function (state, key) {
    var v = state.stats[key];
    if (key === "fans") return Math.min(100, Math.log10(1 + v) * 12);
    if (key === "money") return Math.min(100, Math.log10(1 + v) * 10);
    return v;
  },

  statLabel: function (state, key) {
    var v = state.stats[key];
    if (key === "money") return Under.UI.fmtDinero(v);
    if (key === "fans") return Under.UI.fmt(v);
    return Math.round(v) + " / 100";
  },

  /* ---------- Render principal ---------- */
  render: function () {
    var m = Under.MAIN;
    var app = document.getElementById("app");
    var ov = document.getElementById("overlay");

    if (m.fase === "inicio") {
      app.innerHTML = Under.UI.tplInicio();
      ov.innerHTML = "";
    } else if (m.fase === "creacion") {
      app.innerHTML = Under.UI.tplCreacion();
      ov.innerHTML = "";
    } else if (m.fase === "dashboard") {
      app.innerHTML = Under.UI.tplDashboard();
      ov.innerHTML = m.overlay ? Under.UI.tplOverlay() : "";
    } else if (m.fase === "final") {
      app.innerHTML = Under.UI.tplFinal();
      ov.innerHTML = m.overlay ? Under.UI.tplOverlay() : "";
      Under.UI.dibujarTrayectoria(m.estado);
    }
  },

  /* ---------- Pantalla de inicio ---------- */
  tplInicio: function () {
    var hayGuardado = Under.SAVE.hay();
    var terminada = false;
    var s = Under.SAVE.cargar();
    if (s && s.terminada) terminada = true;
    if (s && s.terminada) Under.SAVE.borrar();

    var continuarBtn = (hayGuardado && !terminada)
      ? '<button class="btn principal" onclick="Under.MAIN.continuarPartida()">▶ Continuar carrera</button>'
      : '';

    return (
      '<div class="logo-wrap">' +
        '<div class="logo-note">🎧</div>' +
        '<div class="logo">UNDER</div>' +
        '<div class="logo-sub">Simulador de carrera musical</div>' +
      '</div>' +
      '<div class="menu">' +
        continuarBtn +
        '<button class="btn" onclick="Under.MAIN.nuevaCarrera()">✨ Nueva carrera</button>' +
      '</div>' +
      '<div class="menu-hint">Empezás siendo un artista desconocido.<br>Vos decidís si terminás como leyenda underground, estrella nacional… o la próxima fama mundial.</div>'
    );
  },

  /* ---------- Creación del artista ---------- */
  tplCreacion: function () {
    var html =
      '<div class="form-header">' +
        '<h1>CREÁ TU ARTISTA</h1>' +
        '<p>Todas las historias empiezan igual: con alguien y un micrófono.</p>' +
      '</div>';

    /* Nombre */
    html +=
      '<div class="field">' +
        '<label>Nombre artístico</label>' +
        '<input class="input" id="inp-nombre" maxlength="24" placeholder="Tu nombre artístico" value="' + Under.UI.esc(Under.MAIN.form.nombre) + '" oninput="Under.MAIN.nombreChanged(this.value)">' +
      '</div>';

    /* Ciudad */
    html +=
      '<div class="field">' +
        '<label>Ciudad de origen</label>' +
        '<select class="input select" onchange="Under.MAIN.ciudadChanged(this.value)">';
    for (var i = 0; i < Under.DATA.CIUDADES.length; i++) {
      var c = Under.DATA.CIUDADES[i];
      html += '<option value="' + Under.UI.esc(c) + '">' + Under.UI.esc(c) + '</option>';
    }
    html += '</select></div>';

    /* Géneros */
    html += '<div class="field"><label>Género principal</label><div class="grid-gen">';
    var gids = Object.keys(Under.DATA.GENRES);
    for (var g = 0; g < gids.length; g++) {
      var gen = Under.DATA.GENRES[gids[g]];
      var checked = Under.MAIN.form.genero === gen.id ? " checked" : "";
      html +=
        '<input type="radio" name="genero" id="gen-' + gen.id + '" value="' + gen.id + '"' + checked + ' onchange="Under.MAIN.pickGenero(this.value)">' +
        '<label class="sel-card" for="gen-' + gen.id + '" style="--a:' + gen.color + '">' +
          '<div class="em">' + gen.emoji + '</div>' +
          '<div class="nm">' + Under.UI.esc(gen.nombre) + '</div>' +
          '<div class="ds">' + Under.UI.esc(gen.ventaja) + '</div>' +
          '<div class="vd"><span class="ok">✓ ' + Under.UI.esc(gen.ventaja) + '</span><br><span class="no">✗ ' + Under.UI.esc(gen.desventaja) + '</span></div>' +
        '</label>';
    }
    html += '</div></div>';

    /* Personalidades */
    html += '<div class="field"><label>Personalidad</label><div class="grid-per">';
    var pids = Object.keys(Under.DATA.PERSONALITIES);
    for (var p = 0; p < pids.length; p++) {
      var per = Under.DATA.PERSONALITIES[pids[p]];
      var checkedP = Under.MAIN.form.personalidad === per.id ? " checked" : "";
      html +=
        '<input type="radio" name="personalidad" id="per-' + per.id + '" value="' + per.id + '"' + checkedP + ' onchange="Under.MAIN.pickPersonalidad(this.value)">' +
        '<label class="sel-card" for="per-' + per.id + '">' +
          '<div class="em">' + per.emoji + '</div>' +
          '<div class="nm">' + per.nombre + '</div>' +
          '<div class="ds">' + Under.UI.esc(per.desc) + '</div>' +
        '</label>';
    }
    html += '</div></div>';

    html +=
      '<div class="btn-start-wrap">' +
        '<button class="btn principal" id="btn-empezar" disabled onclick="Under.MAIN.empezar()">🎤 Empezar la carrera</button>' +
      '</div>';

    return html;
  },

  /* ---------- Dashboard ---------- */
  tplDashboard: function () {
    var s = Under.MAIN.estado;
    var gen = Under.DATA.GENRES[s.artista.genero];
    var per = Under.DATA.PERSONALITIES[s.artista.personalidad];
    var nivel = Under.STATE.nivelCarrera(s);
    var era = Under.STATE.eraActual(s);
    var inicial = Under.UI.esc((s.artista.nombre[0] || "?").toUpperCase());
    var añoPct = ((s.año - 1) / (Under.DATA.CONFIG.AÑOS_MAX - 1)) * 100;
    var acc = " style='--a:" + gen.color + "'";

    var html =
      /* Topbar */
      '<div class="topbar">' +
        '<div class="avatar"' + acc + '>' + inicial + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="artista">' + Under.UI.esc(s.artista.nombre) + '</div>' +
          '<div class="sub-artista">' + Under.UI.esc(s.artista.ciudad) + ' · ' + Under.UI.esc(gen.nombre) + '</div>' +
          '<div class="chips">' +
            '<span class="chip accent" style="color:' + gen.color + ';border-color:' + gen.color + '66">' + Under.UI.esc(gen.nombre) + '</span>' +
            '<span class="chip">' + per.nombre + '</span>' +
            (s.sello ? '<span class="chip">🏢 ' + Under.UI.esc(s.sello.nombre) + '</span>' : "") +
            '<span class="chip">' + Under.UI.fmtExacto(s.decisionesTomadas) + ' decisiones</span>' +
          '</div>' +
        '</div>' +
        '<button class="btn-mini" onclick="Under.MAIN.historial()" title="Historial">📜</button>' +
      '</div>' +

      /* Nivel de carrera */
      '<div class="card nivel-card"' + acc + '>' +
        '<div class="nivel-nombre">' + nivel.nombre + '</div>' +
        '<div class="nivel-desc">' + Under.UI.esc(nivel.desc) + '</div>' +
        Under.UI.bar(nivel.puntaje) +
        '<div class="nivel-pie"><span>NIVEL ' + nivel.nivel + ' / 8</span><span>' + Under.UI.fmtExacto(nivel.puntaje) + ' XP</span></div>' +
        (s.flags.salioDelUnderground
          ? '<div class="nivel-sub">🌅 Salió del underground</div>'
          : (nivel.nivel <= 3
            ? '<div class="nivel-sub">🌑 Bajo tierra</div>'
            : '<div class="nivel-sub">🌆 Ascenso</div>')) +
      '</div>' +

      /* Barra de año */
      '<div class="anio-row"><span><b>AÑO ' + s.año + '</b> / ' + Under.DATA.CONFIG.AÑOS_MAX + '</span><span>' + era.nombre + ' · ' + s.artista.edad + ' años</span></div>' +
      '<div class="bar bar-año"><div style="width:' + Math.round(añoPct) + '%"></div></div>';

    /* Stats principales (solo 3: Popularidad, Talento, Dinero) */
    html += '<div class="stats-grid">';
    for (var i = 0; i < Under.UI.STATS.length; i++) {
      var meta = Under.UI.STATS[i];
      var extra = meta.key === "popularity"
        ? '<div class="stat-extra">👥 ' + Under.UI.fmt(s.stats.fans) + ' fans</div>'
        : '';
      html +=
        '<div class="card stat"' + acc + '>' +
          '<div class="stat-top">' +
            '<span class="stat-nm">' + meta.icono + ' ' + meta.nombre + '</span>' +
            '<span class="stat-vl">' + Under.UI.statLabel(s, meta.key) + '</span>' +
          '</div>' +
          '<div class="stat-ds">' + Under.UI.descTier(meta.key, s.stats[meta.key]) + '</div>' +
          extra +
          Under.UI.bar(Under.UI.barValue(s, meta.key)) +
        '</div>';
    }
    html += '</div>';

    /* Logros y discografía NO estorban el dashboard: se ven
       completos en el resumen final de la carrera. */

    /* Energía y vida personal (Fase 4) */
    var colorEnergia = s.energia >= 60 ? "var(--green)" : (s.energia >= 30 ? "var(--amber)" : "var(--red)");
    html +=
      '<div class="card vig-row">' +
        '<div class="vig">' +
          '<span>⚡ Energía</span><span class="vig-lbl">' + Under.UI.energiaLabel(s) + '</span>' +
          '<div class="bar"><div style="width:' + Math.round(s.energia) + '%;background:linear-gradient(90deg,' + colorEnergia + ',color-mix(in srgb,' + colorEnergia + ' 60%,#fff))"></div></div>' +
        '</div>' +
        '<div class="vig">' +
          '<span>💚 Vida personal</span><span class="vig-lbl">' + Under.UI.vidaLabel(s) + '</span>' +
          '<div class="bar"><div style="width:' + Math.round(s.relaciones) + '%;background:linear-gradient(90deg,#34d399,#22d3ee)"></div></div>' +
        '</div>' +
      '</div>';

    /* Actividad de la carrera (giras, proyectos, premios, etc.) */
    var act = [];
    if (s.totalAlbums) act.push('💿 ' + s.totalAlbums + ' proyecto' + (s.totalAlbums === 1 ? "" : "s"));
    if (s.totalGiras) act.push('🎪 ' + s.totalGiras + ' gira' + (s.totalGiras === 1 ? "" : "s"));
    if (s.totalColabs) act.push('🤝 ' + s.totalColabs + ' colaboraciones');
    if (s.totalPremios) act.push('🏆 ' + s.totalPremios + ' premio' + (s.totalPremios === 1 ? "" : "s"));
    if (s.totalEscandalos) act.push('⚠️ ' + s.totalEscandalos + ' escándalo' + (s.totalEscandalos === 1 ? "" : "s"));
    if (s.inversiones.length) act.push('📈 ' + s.inversiones.length + ' inversión' + (s.inversiones.length === 1 ? "" : "es"));
    if (s.equipo.length) act.push('🛠️ ' + s.equipo.length + ' en el equipo');
    if (s.totalFestivales) act.push('🎪 ' + s.totalFestivales + ' festival' + (s.totalFestivales === 1 ? "" : "es"));
    if (s.mercados.length) act.push('🌎 ' + s.mercados.length + ' mercado' + (s.mercados.length === 1 ? "" : "s"));
    if (s.plataforma) act.push(s.plataforma.emoji + ' ' + s.plataforma.nombre);
    if (act.length) {
      html += '<div class="act-row">' + act.map(function (a) {
        return '<span class="chip accent">' + a + '</span>';
      }).join("") + '</div>';
    }

    /* Misiones activas: objetivos con progreso visible */
    html += Under.UI.tplMisiones(s);

    /* Evento / decisión actual */
    var ev = s.eventoActualId ? Under.DATA.buscarEvento(s.eventoActualId, s) : null;
    if (ev && s.planAnio) {
      html += Under.UI.tplEvento(ev, s.planAnio.hechas + 1, s.planAnio.decisiones);
    }

    /* Acciones */
    html +=
      '<div class="footer-actions">' +
        '<button class="btn ghost" onclick="Under.MAIN.confirmarRetiro()">🏁 Retirarse</button>' +
        '<button class="btn ghost" onclick="Under.MAIN.confirmarReinicio()">↺ Reiniciar carrera</button>' +
      '</div>';

    return html;
  },

  /* Misiones activas: objetivos con progreso visible */
  tplMisiones: function (s) {
    if (!Under.MISIONES || !s.misiones) return "";
    var activas = Under.MISIONES._activas(s);
    if (activas.length === 0) return "";
    var items = activas.slice(0, 3).map(function (def) {
      var prog = Under.MISIONES._progreso(def, s);
      var pct = Math.min(100, Math.round((prog / def.meta) * 100));
      return (
        '<div class="mision">' +
          '<div class="mision-top"><span>' + def.icono + ' ' + Under.UI.esc(def.titulo) + '</span><b>' +
            Under.UI.fmt(prog) + ' / ' + Under.UI.fmt(def.meta) + '</b></div>' +
          '<div class="mision-desc">' + Under.UI.esc(def.desc) + '</div>' +
          Under.UI.bar(pct) +
        '</div>'
      );
    }).join("");
    return '<div class="card misiones-card"><div class="misiones-h">🎯 Misiones</div>' + items + '</div>';
  },

  tplEvento: function (ev, num, total) {
    var s = Under.MAIN.estado;
    var texto = Under.UI.txt(s, ev.texto);
    var opciones = ev.opciones.map(function (o, i) {
      var letras = ["A", "B", "C", "D", "E"];
      var habilitada = !o.soloSi || o.soloSi(s);
      var desc = o.desc ? '<span class="opcion-desc">' + Under.UI.esc(Under.UI.txt(s, o.desc)) + '</span>' : "";
      return (
        '<button class="opcion' + (habilitada ? "" : " disabled") + '"' +
          (habilitada ? ' onclick="Under.MAIN.elegir(' + i + ')"' : ' disabled') + '>' +
          '<span class="letra">' + letras[i] + '</span>' +
          '<span class="opcion-txt">' +
            '<span>' + Under.UI.esc(Under.UI.txt(s, o.texto)) + '</span>' +
            desc +
          '</span>' +
        '</button>'
      );
    }).join("");

    return (
      '<div class="card evento">' +
        '<div class="evento-tag">Decisión ' + num + ' de ' + total + '</div>' +
        '<h2>' + Under.UI.esc(Under.UI.txt(s, ev.titulo)) + '</h2>' +
        '<p class="evento-texto">' + Under.UI.esc(texto) + '</p>' +
        '<div class="opciones">' + opciones + '</div>' +
      '</div>'
    );
  },

  /* ---------- Overlay (resultado, fin de año, historial, confirmación) ---------- */
  tplOverlay: function () {
    var m = Under.MAIN;
    if (m.overlay === "resultado") return Under.UI.tplResultado();
    if (m.overlay === "historial") return Under.UI.tplHistorial();
    if (m.overlay === "confirmar") return Under.UI.tplConfirmar();
    return "";
  },

  tplResultado: function () {
    var res = Under.MAIN.ultimaResultado;
    if (!res) return "";
    var L = res.efectos._lanzamiento;
    var esLanzamiento = !!L;
    var esAlbum = !!res.efectos._esAlbum;
    var premio = res.efectos._premio || null;
    var esPremioGanado = premio && premio.ganado;
    var esPremioPerdido = premio && !premio.ganado;
    var items = "";
    var extraNombre = { _energia: "Energía", _relaciones: "Vida personal", _legado: "Legado" };
    var keys = Object.keys(res.efectos);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = res.efectos[k];
      if (k === "_premio") continue;
      if (!(k in Under.MAIN.estado.stats) && !extraNombre[k]) continue;
      if (Math.round(v) === 0) continue;
      var signo = v > 0 ? "+" : "-";
      var val = (k === "money") ? Under.UI.fmtDinero(Math.abs(v)) : (k === "fans") ? Under.UI.fmt(Math.abs(v)) : Math.round(Math.abs(v));
      var nombre = Under.UI.NAMES[k] || extraNombre[k] || k;
      var clase = v > 0 ? "pos" : "neg";
      items += '<div class="delta"><span>' + Under.UI.esc(nombre) + '</span><b class="' + clase + '">' + signo + ' ' + val + '</b></div>';
    }
    if (items === "") items = '<div class="delta"><span>Sin cambios visibles… por ahora.</span></div>';

    var banner = esLanzamiento
      ? '<div class="tier-banner tier tier-' + L.tier + '">' + L.tierIcono + ' ' + Under.UI.esc(L.tierNombre) + ' · ' + Under.UI.fmtExacto(L.repros) + ' reproducciones</div>'
      : '';

    var icono = esAlbum ? "💽" : esLanzamiento ? "🎵" : esPremioGanado ? "🏆" : esPremioPerdido ? "🎟️" : "✓";
    var titulo = esAlbum ? "Proyecto publicado" : esLanzamiento ? "Tema publicado" : esPremioGanado ? "¡GANASTE!" : esPremioPerdido ? "Solo nominación" : "Decisión tomada";
    var claseCheck = (esLanzamiento ? " check-disco" : "") +
      (esPremioGanado ? " check-premio-ganado" : "") +
      (esPremioPerdido ? " check-premio-perdido" : "");

    var confetti = "";
    if (esPremioGanado) {
      var colores = ["#ffd54a", "#f5b301", "#fff", "#ff9d5c", "#7cf7d4"];
      for (var c = 0; c < 12; c++) {
        var left = Math.round(10 + Math.random() * 80);
        var delay = (Math.random() * 1.6).toFixed(2);
        var color = colores[c % colores.length];
        confetti += '<i class="confetti" style="left:' + left + '%;background:' + color + ';animation-delay:' + delay + 's"></i>';
      }
    }

    return (
      '<div class="modal">' +
        '<div class="modal-card' + (esPremioGanado ? " modal-premio" : "") + '">' +
          confetti +
          '<div class="check' + claseCheck + '">' + icono + '</div>' +
          '<h3>' + titulo + '</h3>' +
          (esPremioGanado ? '<div class="premio-nombre">' + Under.UI.esc(premio.nombre) + '</div>' : '') +
          '<p class="resultado-texto">' + Under.UI.esc(res.resultado) + '</p>' +
          banner +
          '<div class="deltas">' + items + '</div>' +
          '<button class="btn principal" onclick="Under.MAIN.continuarResultado()">Continuar</button>' +
        '</div>' +
      '</div>'
    );
  },

  tplHistorial: function () {
    var s = Under.MAIN.estado;
    var porAnio = {};
    for (var i = 0; i < s.historial.length; i++) {
      var h = s.historial[i];
      if (!porAnio[h.año]) porAnio[h.año] = [];
      porAnio[h.año].push(h.texto);
    }
    var anios = Object.keys(porAnio).sort(function (a, b) { return a - b; });
    var body = anios.map(function (anio) {
      return (
        '<div class="hist-anio">Año ' + anio + '</div>' +
        porAnio[anio].map(function (t) {
          return '<div class="hist-item">' + Under.UI.esc(t) + '</div>';
        }).join("")
      );
    }).join("");

    return (
      '<div class="modal sheet">' +
        '<div class="sheet-head"><h3>📜 Historial de carrera</h3><button class="btn-mini" onclick="Under.MAIN.cerrarHistorial()">✕</button></div>' +
        '<div class="sheet-body">' + body + '</div>' +
      '</div>'
    );
  },

  tplConfirmar: function () {
    var retiro = Under.MAIN._confirmAccion === "retiro";
    return (
      '<div class="modal">' +
        '<div class="modal-card">' +
          '<h3>' + (retiro ? "¿Retirarte de la música?" : "¿Reiniciar la carrera?") + '</h3>' +
          '<p class="confirm-text">' +
            (retiro
              ? "Tu carrera termina acá. El resultado queda guardado como tu final."
              : "Se borra todo el progreso guardado y volvés al inicio.") +
          '</p>' +
          '<div class="btn-row">' +
            '<button class="btn" onclick="Under.MAIN.cancelar()">Cancelar</button>' +
            '<button class="btn principal" onclick="Under.MAIN.reiniciar()">' + (retiro ? "Sí, retirarme" : "Sí, reiniciar") + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  },

  /* ---------- Pantalla final ---------- */
  energiaLabel: function (s) {
    if (s.energia >= 60) return "Descansado";
    if (s.energia >= 30) return "Cansado";
    return "Agotado";
  },

  vidaLabel: function (s) {
    if (s.relaciones >= 70) return "Fuerte";
    if (s.relaciones >= 40) return "Estable";
    return "En riesgo";
  },

  sec: function (titulo, body) {
    return '<div class="card final-section"><div class="final-sec-h">' + titulo + '</div>' + body + '</div>';
  },

  sumRow: function (nombre, meta) {
    return '<div class="sum-item"><span class="sum-nombre">' + Under.UI.esc(nombre) + '</span><span class="sum-meta">' + Under.UI.esc(meta) + '</span></div>';
  },

  tplFinal: function () {
    var s = Under.MAIN.estado;
    var rf = s.resultadoFinal || { titulo: "FIN DE CARRERA", historia: "" };
    var aniosCarrera = s.retirado ? (s.añoRetiro - 1) : (s.año - 1);

    /* ---------- Resumen completo: logros, discografía, proyectos y más ---------- */
    var resumen = "";

    if (s.logros.length) {
      resumen += '<div class="logros-row" style="justify-content:center;margin:18px 0">' + s.logros.map(function (l) {
        return '<span class="chip accent">' + l.icono + ' ' + Under.UI.esc(l.nombre) + '</span>';
      }).join("") + '</div>';
    }

    if (s.lanzamientos) {
      var discos = s.discografia.slice().reverse().map(function (d) {
        var tier = Under.DATA.TIERS[d.tier] || { nombre: d.tier, icono: "🎵" };
        return Under.UI.sumRow(d.nombre + " · Año " + d.año,
          tier.icono + " " + tier.nombre + " · " + Under.UI.fmtExacto(d.repros) + " repros");
      }).join("");
      resumen += Under.UI.sec("💿 Discografía · " + s.lanzamientos + " tema" + (s.lanzamientos === 1 ? "" : "s"), discos);
    }

    if (s.totalAlbums) {
      var alb = s.albums.slice().reverse().map(function (a) {
        var tier = Under.DATA.TIERS[a.tier] || { nombre: a.tier, icono: "💿" };
        return Under.UI.sumRow(a.nombre + " · " + a.canciones + " canciones · Año " + a.año,
          tier.icono + " " + tier.nombre + " · " + Under.UI.fmtExacto(a.repros) + " repros");
      }).join("");
      resumen += Under.UI.sec("💽 Proyectos · " + s.totalAlbums, alb);
    }

    if (s.totalGiras) {
      var giras = s.giras.slice().reverse().map(function (g) {
        return Under.UI.sumRow(g.nombre + " · Año " + g.año,
          "Neto " + Under.UI.fmtDinero(g.neto) + " · " + Under.UI.fmt(g.fans) + " fans");
      }).join("");
      resumen += Under.UI.sec("🎪 Giras · " + s.totalGiras, giras);
    }

    if (s.totalColabs) {
      var colabs = s.colaboraciones.slice().reverse().map(function (c) {
        var tier = Under.DATA.TIERS[c.tier] || { nombre: c.tier, icono: "🤝" };
        return Under.UI.sumRow(c.nombre, tier.icono + " " + tier.nombre + " · " + Under.UI.fmtExacto(c.repros) + " repros");
      }).join("");
      resumen += Under.UI.sec("🤝 Colaboraciones · " + s.totalColabs, colabs);
    }

    if (s.totalPremios) {
      var premios = s.premios.map(function (p) {
        return Under.UI.sumRow(p.nombre + " · Año " + p.año, Under.UI.fmtDinero(p.premio));
      }).join("");
      resumen += Under.UI.sec("🏆 Premios · " + s.totalPremios, premios);
    }

    if (s.totalEscandalos) {
      var esc = s.escandalos.map(function (e) {
        return Under.UI.sumRow(e.nombre + " · Año " + e.año, "Lo manejó con " + e.resolucion);
      }).join("");
      resumen += Under.UI.sec("⚠️ Escándalos superados · " + s.totalEscandalos, esc);
    }

    if (s.inversiones.length) {
      var inv = s.inversiones.map(function (i) {
        return Under.UI.sumRow(i.emoji + " " + i.nombre, Under.UI.fmtDinero(i.costo) + " invertidos");
      }).join("");
      resumen += Under.UI.sec("📈 Inversiones · " + s.inversiones.length, inv);
    }

    if (s.equipo.length) {
      var eq = s.equipo.map(function (m) {
        return Under.UI.sumRow(m.emoji + " " + m.nombre, Under.UI.fmtDinero(m.costoAnual) + "/año");
      }).join("");
      resumen += Under.UI.sec("🛠️ Equipo · " + s.equipo.length, eq);
    }

    if (s.totalFestivales) {
      var fest = s.festivales.slice().reverse().map(function (f) {
        return Under.UI.sumRow(f.emoji + " " + f.nombre + " · Año " + f.año,
          "Neto " + Under.UI.fmtDinero(f.neto) + " · " + Under.UI.fmt(f.fans) + " fans");
      }).join("");
      resumen += Under.UI.sec("🎪 Festivales · " + s.totalFestivales, fest);
    }

    if (s.mercados.length) {
      var merc = s.mercados.map(function (m) {
        return Under.UI.sumRow(m.emoji + " " + m.nombre, "Conquistado en el año " + m.año);
      }).join("");
      resumen += Under.UI.sec("🌎 Mercados conquistados · " + s.mercados.length, merc);
    }

    if (s.plataforma) {
      resumen += Under.UI.sec("🎧 Estrategia de streaming",
        Under.UI.sumRow(s.plataforma.emoji + " " + s.plataforma.nombre, "Su difusión principal"));
    }

    if (s.documentales) {
      resumen += Under.UI.sec("🎬 Documental",
        Under.UI.sumRow("Su historia se contó en pantalla", s.documentales + " documental" + (s.documentales === 1 ? "" : "es")));
    }

    /* Gráfico de trayectoria: la evolución año a año de la carrera */
    var tray = "";
    if (s.trayectoria && s.trayectoria.length >= 2) {
      tray =
        '<div class="card final-section trayectoria-card">' +
          '<div class="final-sec-h">📈 Trayectoria</div>' +
          '<canvas id="grafico-trayectoria" width="900" height="300"></canvas>' +
          '<div class="tray-legenda">' +
            '<span class="lg lg-pop">Popularidad</span>' +
            '<span class="lg lg-fans">Fans</span>' +
            '<span class="lg lg-money">Dinero</span>' +
          '</div>' +
        '</div>';
    }

    if (s.deudas.length) {
      var deu = s.deudas.map(function (d) {
        return Under.UI.sumRow(d.nombre, Under.UI.fmtDinero(d.cuota) + "/año · " + d.restante + " año" + (d.restante === 1 ? "" : "s") + " restante" + (d.restante === 1 ? "" : "s"));
      }).join("");
      resumen += Under.UI.sec("💳 Deudas pendientes · " + s.deudas.length, deu);
    }

    return (
      '<div class="final-hero">' +
        '<div class="final-title">' + Under.UI.esc(rf.titulo) + '</div>' +
        '<div class="final-name">' + Under.UI.esc(s.artista.nombre) + '</div>' +
        (s.retirado ? '<div class="sello-line">🏁 Se retiró en el año ' + s.añoRetiro + '.</div>' : "") +
      '</div>' +
      '<div class="final-stats">' +
        '<div class="card fin-stat"><div class="v">' + aniosCarrera + ' años</div><div class="k">De carrera</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Under.UI.fmt(s.stats.fans) + '</div><div class="k">Fans</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Under.UI.fmtDinero(s.stats.money) + '</div><div class="k">Plata</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Under.UI.fmtExacto(s.decisionesTomadas) + '</div><div class="k">Decisiones</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Math.round(s.stats.popularity) + '</div><div class="k">Popularidad</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Math.round(s.stats.talent) + '</div><div class="k">Talento</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.lanzamientos + '</div><div class="k">Temas lanzados</div></div>' +
        '<div class="card fin-stat"><div class="v">' + (Under.DATA.CAREER_LEVELS[s.maxNivel || 0].nombre) + '</div><div class="k">Pico de nivel</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Under.UI.fmt(s.totalReproducciones) + '</div><div class="k">Reproducciones</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalAlbums + '</div><div class="k">Proyectos</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalGiras + '</div><div class="k">Giras</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalColabs + '</div><div class="k">Colaboraciones</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalPremios + '</div><div class="k">Premios</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalInversiones + '</div><div class="k">Inversiones</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalEscandalos + '</div><div class="k">Escándalos</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Math.round(s.energia) + '</div><div class="k">Energía final</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Math.round(s.relaciones) + '</div><div class="k">Vida personal</div></div>' +
        '<div class="card fin-stat"><div class="v">' + Math.round(s.legado) + '</div><div class="k">Legado</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.totalFestivales + '</div><div class="k">Festivales</div></div>' +
        '<div class="card fin-stat"><div class="v">' + s.mercados.length + '</div><div class="k">Mercados</div></div>' +
        (s.deudas.length
          ? '<div class="card fin-stat"><div class="v">' + s.deudas.length + '</div><div class="k">Deudas</div></div>'
          : '') +
      '</div>' +
      tray +
      '<div class="card final-historia">' +
        '<h4>Tu historia</h4>' +
        '<p>' + Under.UI.esc(rf.historia) + '</p>' +
        (s.sello ? '<div class="sello-line">🏢 Bajo el sello ' + Under.UI.esc(s.sello.nombre) + '.</div>' : "") +
      '</div>' +
      resumen +
      '<div class="divider"></div>' +
      '<div class="footer-actions">' +
        '<button class="btn" onclick="Under.MAIN.historial()">📜 Ver carrera completa</button>' +
        '<button class="btn principal" onclick="Under.MAIN.nuevaCarrera()">✨ Nueva carrera</button>' +
      '</div>'
    );
  },

  /* ---------- Toast de logros ---------- */
  toast: function (msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(Under.UI._toastT);
    Under.UI._toastT = setTimeout(function () {
      t.classList.remove("show");
    }, 3400);
  },

  /* ---------- Gráfico de trayectoria (pantalla final) ----------
     Dibuja la evolución año a año de popularidad, fans (log) y
     dinero (log) sobre el mismo lienzo. Se normalizan fans y
     dinero por su máximo de la carrera. */
  dibujarTrayectoria: function (s) {
    var cv = document.getElementById("grafico-trayectoria");
    if (!cv || typeof cv.getContext !== "function") return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var padL = 46, padR = 14, padT = 18, padB = 30;
    var pts = s.trayectoria || [];
    if (pts.length < 2) return;
    var iw = W - padL - padR, ih = H - padT - padB;
    var maxFans = 1, maxMoney = 1;
    pts.forEach(function (p) {
      if (p.fans > maxFans) maxFans = p.fans;
      if (p.money > maxMoney) maxMoney = p.money;
    });
    function x(i) { return padL + (i / (pts.length - 1)) * iw; }
    function yPop(v) { return padT + ih - (v / 100) * ih; }
    function yVal(v, max) { return padT + ih - (v / max) * ih; }

    ctx.fillStyle = "rgba(7,10,18,0.45)";
    ctx.fillRect(padL, padT, iw, ih);

    /* Grilla horizontal + etiquetas del eje */
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.font = "10px system-ui, sans-serif";
    for (var g = 0; g <= 4; g++) {
      var yy = padT + (g / 4) * ih;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + iw, yy); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round((1 - g / 4) * 100)), padL - 6, yy + 3);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(padL, padT, iw, ih);

    /* Años: primero, medio y último */
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    [0, Math.floor((pts.length - 1) / 2), pts.length - 1].forEach(function (i) {
      ctx.fillText("Año " + pts[i].año, x(i), H - 8);
    });

    function trazar(fn, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var yy = Under.STATE.clamp(fn(pts[i]), padT, padT + ih);
        if (i === 0) ctx.moveTo(x(i), yy); else ctx.lineTo(x(i), yy);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      for (var j = 0; j < pts.length; j++) {
        ctx.beginPath();
        ctx.arc(x(j), Under.STATE.clamp(fn(pts[j]), padT, padT + ih), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    trazar(function (p) { return yPop(p.popularity); }, "#ffd54a");
    trazar(function (p) { return yVal(Math.max(1, p.fans), maxFans); }, "#22d3ee");
    trazar(function (p) { return yVal(Math.max(1, p.money), maxMoney); }, "#34d399");
  }
};
