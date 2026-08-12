/* ============================================================
   UNDER — SISTEMA DE LANZAMIENTOS (FASE 2)
   El corazón de la carrera: elegís cómo lanzar un tema
   y el juego simula sus reproducciones, fans y dinero.

   El resultado (tier) no es azar puro: depende del talento,
   la popularidad, el nivel de carrera y la estrategia elegida.
   ============================================================ */

window.Under = window.Under || {};

Under.MUSIC = {

  /* Evento pendiente generado: se reutiliza entre renders
     para que el nombre del tema no cambie a mitad de decisión. */
  _pendiente: null,

  /* Narrativa por resultado */
  TIER_FLAVOR: {
    fracaso: "Pasó sin hacer demasiado ruido, pero quedó guardado en tu discografía.",
    normal: "Sumó oídos nuevos sin despegar del todo.",
    exito: "El público respondió bien y quedó en varias playlists.",
    hit: "Se convirtió en un éxito rotundo. Todo el mundo lo tarareaba.",
    viral: "Se esparció como pólvora: en pocas semanas estaba en todos lados.",
    cult: "No explotó masivamente, pero los que lo conocen lo tratan como oro.",
    global: "Cruzó fronteras y se escuchó en cada rincón del planeta."
  },

  /* ---------- Elección de nombre (evita repetir seguidos) ---------- */
  _elegirNombre: function (state) {
    var nombres = Under.DATA.SONG_NAMES[state.artista.genero] || Under.DATA.SONG_NAMES.pop;
    var usados = {};
    for (var i = 0; i < state.discografia.length; i++) {
      usados[state.discografia[i].nombre] = true;
    }
    var pool = nombres.filter(function (n) { return !usados[n]; });
    if (pool.length === 0) pool = nombres;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* ---------- Cálculo del resultado del lanzamiento (FASE 6) ----------
     Salir del underground es difícil: mientras tu nivel de carrera
     sea de underground (0-3), tus temas sufren un castigo de difusión.
     Los umbrales para llegar a HIT/VIRAL son más altos: hace falta
     talento, plata y constancia para que algo explote. */
  _calcular: function (state, nombre, est) {
    var t = state.stats.talent;
    var p = state.stats.popularity;
    var nivel = Under.STATE.nivelCarrera(state).nivel;

    /* Castigo por estar bajo tierra: a menor nivel, menos ruido
       logra tu música por sí sola. */
    var bajo = nivel <= 3 ? (3 - nivel) * 3 : 0;

    /* Puntaje del tema: talento + popularidad + nivel de carrera
       + la estrategia (calidad y viral) + ruido acotado.
       El piso es bajo: los primeros temas casi siempre fallan. */
    var base = 18 + t * 0.34 + p * 0.13 + nivel * 2 + est.calidad * 0.8 + est.viral * 0.6 - bajo;
    /* Progresión anual (PRIORIDAD 1): la madurez y el momento
       cuentan. Un veterano lee mejor su música y su momento; el
       mismo tema pega distinto según la etapa de la carrera. */
    base += state.experiencia * 0.06 + state.momentum * 0.04;
    base += Math.random() * 26 - 10;

    var tier;
    if (base >= 90) tier = "global";
    else if (base >= 80) tier = "viral";
    else if (base >= 68) tier = "hit";
    else if (base >= 56) tier = "exito";
    else if (base >= 40) tier = "normal";
    else tier = "fracaso";

    /* Cult classic: la excepción artística. Poco masivo,
       pero enorme para el talento. */
    if (base >= 48 && t >= 70 && p < 60 && Math.random() < 0.35) tier = "cult";

    var data = Under.DATA.TIER_DATA[tier];

    /* El sello mejora la distribución pero retiene parte de tus ingresos */
    var sello = state.sello;
    var distMult = sello ? sello.distribucion : 1;
    var retencion = sello ? sello.retencion : 1;

    /* Era de la carrera: el mismo tier no vale lo mismo para un pibe
       del under que para una estrella. En años tempranos (nivel 0-1)
       hasta un viral queda en un rango realista y no pasa el millón
       de vistas; después el alcance crece con la carrera. */
    var ERA_REPROS = [0.32, 0.38, 0.6, 0.85, 1.2, 1.6, 2.2, 2.9, 3.8];
    var eraMult = ERA_REPROS[Math.min(nivel, ERA_REPROS.length - 1)];

    var multRepros = 1 + nivel * 0.5 + p / 250 + state.momentum / 300;
    /* Carreras por género (PRIORIDAD 5): cada escena convierte
       oídos distinto. Urban/pop multiplican el alcance comercial;
       rap/rock convierten más lento pero la crítica los juzga
       con otra vara (más abajo). */
    var genComercial = Under.GENEROS ? Under.GENEROS.comercial(state) : 1;
    var repros = Math.round(data.repros * eraMult * multRepros * distMult * genComercial * (0.75 + Math.random() * 0.5));
    var multFans = 1 + nivel * 0.15;
    /* El público (PRIORIDAD 3): los haters encarecen cada oído
       nuevo. El odio no frena los streams del todo, pero sí
       convierte mucho peor. */
    var haterF = Under.PUBLICO ? Under.PUBLICO.haterFactor(state) : 1;
    var fans = Math.round(data.fans * multFans * (0.8 + Math.random() * 0.4) * haterF * genComercial);
    /* El manager negocia mejor: +10% de la plata */
    var bonusManager = (Under.EQUIPO && Under.EQUIPO.tiene(state, "manager")) ? 1.1 : 1;
    var dinero = Math.round(repros * Under.DATA.CONFIG.REGALIA * retencion * bonusManager);

    /* La crítica: responde al talento y a la apuesta artística.
       El género (PRIORIDAD 5) le pone su vara: la escena juzga
       a un rapero o a un rockero distinto que a un pop. */
    var genCritica = Under.GENEROS ? Under.GENEROS.criticaBonus(state) : 0;
    var critica = Under.STATE.clamp(2 + t * 0.045 + (tier === "cult" ? 2.5 : 0) + genCritica + Math.random() * 1.1, 1, 5);
    var talentoGanado = data.talento + (critica >= 4.5 ? 1 : 0);

    return {
      nombre: nombre,
      tier: tier,
      tierNombre: Under.DATA.TIERS[tier].nombre,
      tierIcono: Under.DATA.TIERS[tier].icono,
      repros: repros,
      fans: fans,
      popularidad: data.popularidad,
      talento: talentoGanado,
      dinero: dinero,
      critica: critica,
      retencion: retencion,
      selloNombre: sello ? sello.nombre : null
    };
  },

  /* ---------- Registra el lanzamiento en el estado ---------- */
  _registrar: function (state, L, est, costo) {
    state.lanzamientos += 1;
    state.totalReproducciones += L.repros;
    /* El público (PRIORIDAD 3): el resultado se mide contra lo que
       el público esperaba (hype, reputación y casuales) y queda en
       el historial reciente que alimenta la próxima expectativa. */
    if (Under.PUBLICO) {
      Under.PUBLICO.aplicarHypeLanzamiento(state, L);
      Under.PUBLICO.registrarTier(state, L.tier);
    }
    state.discografia.push({
      año: state.año,
      nombre: L.nombre,
      estrategia: est.texto,
      costo: costo,
      tier: L.tier,
      repros: L.repros,
      fans: L.fans,
      dinero: L.dinero,
      critica: L.critica
    });

    if (L.tier === "hit" || L.tier === "viral" || L.tier === "global") state.flags.tuvoHit = true;
    if (L.tier === "viral" || L.tier === "global") state.flags.tuvoViral = true;
    if (L.tier === "global") state.flags.tuvoGlobal = true;
    if (L.critica >= 4.5) state.flags.tuvoCritica = true;

    state.historial.push({
      año: state.año,
      texto: "Lanzó «" + L.nombre + "» (" + est.texto + "): " + L.tierIcono + " " + L.tierNombre +
        " — " + Under.UI.fmtExacto(L.repros) + " reproducciones" +
        (L.selloNombre ? " vía " + L.selloNombre : "") + "."
    });
  },

  /* ---------- Lanzamiento automático ----------
     Desde el año 2 la música sale sola: el artista publica un tema
     por año sin que el jugador tenga que decidirlo. El jugador lo
     ve en el historial y, si el tema explota (hit/viral/global),
     la UI salta la animación de oyentes. */
  lanzarAutomatico: function (state) {
    var nombre = Under.MUSIC._elegirNombre(state);

    /* Elige la mejor estrategia que puede pagar (calidad + viral),
       sin gastarse más del 60% de lo que tiene. */
    var dinero = state.stats.money;
    var mejor = null;
    for (var i = 0; i < Under.DATA.ESTRATEGIAS.length; i++) {
      var e = Under.DATA.ESTRATEGIAS[i];
      var costo = e.costo ? Under.SYSTEMS.efectivoEscala(state, e.costo) : 0;
      if (costo > dinero * 0.6) continue;
      var score = e.calidad * 1.4 + e.viral;
      if (!mejor || score > mejor.score) mejor = { e: e, costo: costo, score: score };
    }
    var est = mejor ? mejor.e : Under.DATA.ESTRATEGIAS[0];
    var costo = mejor ? mejor.costo : 0;

    var L = Under.MUSIC._calcular(state, nombre, est);
    Under.MUSIC._registrar(state, L, est, costo);
    state.stats.money = Math.max(0, state.stats.money + L.dinero - costo);
    state.energia = Under.STATE.clamp(state.energia - 6, 0, 100);

    var esHit = (L.tier === "hit" || L.tier === "viral" || L.tier === "global");
    state.ultimoLanzamiento = {
      año: state.año,
      nombre: L.nombre,
      tier: L.tier,
      tierNombre: L.tierNombre,
      tierIcono: L.tierIcono,
      repros: L.repros,
      fans: L.fans,
      dinero: L.dinero,
      critica: L.critica,
      estrategia: est.texto,
      esHit: esHit
    };
    state.flags.lanzamientoEsteAnio = true;

    if (Under.MISIONES) Under.MISIONES.chequear(state);
    return state.ultimoLanzamiento;
  },

  /* ---------- Construye el evento de lanzamiento ---------- */
  crearEventoLanzamiento: function (state) {
    if (Under.MUSIC._pendiente) return Under.MUSIC._pendiente;

    var nombre = Under.MUSIC._elegirNombre(state);

    var opciones = Under.DATA.ESTRATEGIAS.map(function (est) {
      var costo = est.costo ? Under.SYSTEMS.efectivoEscala(state, est.costo) : 0;

      return {
        texto: est.texto + (costo ? " · " + Under.UI.fmtDinero(costo) : " · gratis"),
        desc: est.desc,
        soloSi: function (s) { return s.stats.money >= costo; },
        efectos: function (s) {
          var L = Under.MUSIC._calcular(s, nombre, est);
          Under.MUSIC._registrar(s, L, est, costo);
          Under.MUSIC._pendiente = null;
          return {
            fans: L.fans,
            popularity: L.popularidad,
            talent: L.talento,
            money: L.dinero - costo,
            _energia: -10,
            _lanzamiento: L
          };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "Lanzaste «" + L.nombre + "» " + est.frase + ".\n\n" +
            Under.MUSIC.TIER_FLAVOR[L.tier] + "\n\n" +
            L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones en su primer año.";
        }
      };
    });

    /* Salida: siempre disponible, por si el jugador no quiere lanzar */
    opciones.push({
      texto: "Dejarlo para más adelante",
      desc: "El material todavía no está listo.",
      efectos: function (s) {
        Under.MUSIC._pendiente = null;
        return {};
      },
      log: "Decidió no lanzar nada este año.",
      resultado: "Decidís que el material todavía no está listo.\n\nNo lanzás nada este año."
    });

    var ev = {
      id: "lanzamiento",
      recurrente: true,
      importante: true,
      titulo: "Un nuevo lanzamiento",
      texto: "Tenés material nuevo para grabar y publicar.\n\n¿Cómo lo lanzás?",
      opciones: opciones
    };

    Under.MUSIC._pendiente = ev;
    return ev;
  }
};
