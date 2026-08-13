/* ============================================================
   UNDER — ESTADO DE LA PARTIDA
   Crea el estado inicial, maneja estadísticas y calcula
   el nivel de carrera.

   SOLO EXISTEN 3 ESTADÍSTICAS:
   - popularity (0-100) + fans (cuántos seguidores)
   - talent (0-100)
   - money
   ============================================================ */

window.Under = window.Under || {};

Under.STATE = {

  clamp: function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  /* Estadísticas base antes de aplicar género y personalidad */
  statsBase: function () {
    return {
      popularity: 2,                // cuánta gente te conoce
      talent: 0,                    // capacidad musical (se define con RNG + modificadores)
      fans: 0,                      // cantidad de seguidores
      money: Under.DATA.CONFIG.DINERO_INICIAL
    };
  },

  aplicarMods: function (stats, mods) {
    for (var k in mods) {
      if (!(k in stats)) continue;
      stats[k] += mods[k];
      if (k === "fans" || k === "money") {
        stats[k] = Math.max(0, stats[k]);
      } else {
        stats[k] = Under.STATE.clamp(stats[k], 0, 100);
      }
    }
  },

  /* Crea el estado completo de una partida nueva */
  crearJuego: function (opciones) {
    var gen = Under.DATA.GENRES[opciones.genero];
    var per = Under.DATA.PERSONALITIES[opciones.personalidad];
    var stats = Under.STATE.statsBase();

    stats.talent = Under.STATE.randInt(55, 72);
    Under.STATE.aplicarMods(stats, gen.stats);
    Under.STATE.aplicarMods(stats, per.stats);

    return {
      version: Under.DATA.CONFIG.SAVE_VERSION,
      artista: {
        nombre: opciones.nombre,
        ciudad: opciones.ciudad || "Tu ciudad",
        genero: opciones.genero,
        personalidad: opciones.personalidad,
        edad: Under.DATA.CONFIG.EDAD_INICIAL
      },
      stats: stats,
      año: 1,
      flags: {},
      /* Diario de decisiones: cada opción elegida se registra con
         su evento, su texto y el año. Las misiones y eventos
         futuros pueden leerlo (Under.MISIONES._decidio) para que
         las decisiones pasadas tengan consecuencias más adelante. */
      decisiones: [],
      historial: [
        { año: 1, texto: "Arrancó su carrera como " + opciones.nombre + "." }
      ],
      logros: [],
      eventosUsados: [],
      ultimoTemplate: null,
      decisionesTomadas: 0,
      /* Fase 2: lanzamientos */
      lanzamientos: 0,
      totalReproducciones: 0,
      discografia: [],
      /* Fase 3: giras, colaboraciones, premios y sello */
      sello: null,
      giras: [],
      totalGiras: 0,
      giraActiva: null,
      colaboraciones: [],
      totalColabs: 0,
      premios: [],
      totalPremios: 0,
      nominaciones: [],
      /* Rivalidad persistente + gráfico de trayectoria */
      rivales: [],
      trayectoria: [],
      /* Sistema de misiones: objetivos con progreso y recompensa.
         misiones: { id: { completada, año } }; contadores: { clave: n } */
      misiones: {},
      contadores: {},
      /* Progresión anual (PRIORIDAD 1): madurez artística (0-100)
         e inercia de la fama (0-100). No son stats visibles: viven
         en el estado y se reflejan en resultados y narrativa. */
      experiencia: 0,
      momentum: Under.DATA.CONFIG.MOMENTUM_INICIAL,
      /* Memoria de decisiones (PRIORIDAD 2): la escena no olvida.
         memorias: [{ id, año, titulo, tono }] con las decisiones
         que dejan huella. reputacion (0-100): cuánto te respeta
         la escena; se construye o se quema y abre/cierra puertas. */
      memorias: [],
      reputacion: Under.DATA.CONFIG.REPUTACION_INICIAL,
      /* El público (PRIORIDAD 3): el hype es el ruido transitorio
         alrededor de tu nombre (se apaga solo); los fans se
         segmentan por dentro en fieles y hardcore (los casuales
         son el resto); los haters crecen con las polémicas y
         frenan el crecimiento. ultimosTiers alimenta lo que el
         público espera de tu próximo lanzamiento. */
      hype: Under.DATA.CONFIG.HYPE_INICIAL,
      haters: 0,
      fansFieles: 0,
      fansHardcore: 0,
      ultimosTiers: [],
      /* Fase 4: proyectos, equipo, inversiones, escándalos, vida y retiro */
      energia: 100,
      relaciones: 50,
      albums: [],
      totalAlbums: 0,
      equipo: [],
      inversiones: [],
      totalInversiones: 0,
      escandalos: [],
      totalEscandalos: 0,
      retirado: false,
      añoRetiro: null,
      /* Fase 5: plataformas, mercados, shows, legado y economía */
      plataforma: null,
      mercados: [],
      festivales: [],
      totalFestivales: 0,
      legado: 0,
      documentales: 0,
      reinvenciones: 0,
      ultimaReinvencion: null,
      deudas: [],
      vendioCatalogo: false,
      quiebra: false,
      /* Fase 6: el nivel más alto alcanzado y la salida del underground */
      maxNivel: 0,
      /* Red de contactos (PRIORIDAD 7): personas persistentes
         con un vínculo que crece o se enfría. red: [{ id, nombre,
         rol, vinculo, desde, ultima, activo }] */
      red: [],
      /* Crisis y recuperación (PRIORIDAD 9): cuántos años seguidos
         llevás tocando fondo y si alguna vez saliste. */
      aniosEnCrisis: 0,
      planAnio: null,
      eventoActualId: null,
      fase: "anio",
      terminada: false,
      resultadoFinal: null
    };
  },

  /* Migra partidas guardadas de versiones anteriores
     (les agrega los campos que faltan de fases nuevas). */
  migrar: function (s) {
    if (!s) return s;
    if (s.decisiones === undefined) s.decisiones = [];
    /* El género pop/electrónica se eliminó del juego: una partida
       vieja con ese género se remapea al urbano (el más cercano). */
    if (!s.artista || !Under.DATA.GENRES[s.artista.genero]) {
      if (s.artista) s.artista.genero = "urban";
    }
    if (s.giras === undefined) s.giras = [];
    if (s.totalGiras === undefined) s.totalGiras = 0;
    if (s.giraActiva === undefined) s.giraActiva = null;
    if (s.colaboraciones === undefined) s.colaboraciones = [];
    if (s.totalColabs === undefined) s.totalColabs = 0;
    if (s.premios === undefined) s.premios = [];
    if (s.totalPremios === undefined) s.totalPremios = 0;
    if (s.nominaciones === undefined) s.nominaciones = [];
    if (s.rivales === undefined) s.rivales = [];
    if (s.trayectoria === undefined) s.trayectoria = [];
    if (s.misiones === undefined) s.misiones = {};
    if (s.contadores === undefined) s.contadores = {};
    if (s.misionesUsadas === undefined) s.misionesUsadas = {};
    if (s.sello === undefined) s.sello = null;
    if (s.energia === undefined) s.energia = 100;
    if (s.relaciones === undefined) s.relaciones = 50;
    if (s.albums === undefined) s.albums = [];
    if (s.totalAlbums === undefined) s.totalAlbums = 0;
    if (s.equipo === undefined) s.equipo = [];
    if (s.inversiones === undefined) s.inversiones = [];
    if (s.totalInversiones === undefined) s.totalInversiones = 0;
    if (s.escandalos === undefined) s.escandalos = [];
    if (s.totalEscandalos === undefined) s.totalEscandalos = 0;
    if (s.retirado === undefined) s.retirado = false;
    if (s.añoRetiro === undefined) s.añoRetiro = null;
    if (s.plataforma === undefined) s.plataforma = null;
    if (s.mercados === undefined) s.mercados = [];
    if (s.festivales === undefined) s.festivales = [];
    if (s.totalFestivales === undefined) s.totalFestivales = 0;
    if (s.legado === undefined) s.legado = 0;
    if (s.documentales === undefined) s.documentales = 0;
    if (s.reinvenciones === undefined) s.reinvenciones = 0;
    if (s.ultimaReinvencion === undefined) s.ultimaReinvencion = null;
    if (s.deudas === undefined) s.deudas = [];
    if (s.vendioCatalogo === undefined) s.vendioCatalogo = false;
    if (s.quiebra === undefined) s.quiebra = false;
    if (s.maxNivel === undefined) s.maxNivel = 0;
    if (s.experiencia === undefined) s.experiencia = 0;
    if (s.momentum === undefined) s.momentum = Under.DATA.CONFIG.MOMENTUM_INICIAL;
    if (s.memorias === undefined) s.memorias = [];
    if (s.reputacion === undefined) s.reputacion = Under.DATA.CONFIG.REPUTACION_INICIAL;
    if (s.hype === undefined) s.hype = Under.DATA.CONFIG.HYPE_INICIAL;
    if (s.haters === undefined) s.haters = 0;
    if (s.fansFieles === undefined) s.fansFieles = 0;
    if (s.fansHardcore === undefined) s.fansHardcore = 0;
    if (s.ultimosTiers === undefined) s.ultimosTiers = [];
    if (s.red === undefined) s.red = [];
    if (s.aniosEnCrisis === undefined) s.aniosEnCrisis = 0;
    /* Camino de carrera (PRIORIDAD 10): una partida guardada antes
       de la bifurcación que ya cruzó la puerta grande se asume
       mainstream; las que estaban más abajo la eligen al llegar. */
    if (s.flags && s.flags.camino === undefined && (s.maxNivel || 0) >= 6) {
      s.flags.camino = "mainstream";
      s.flags.abandonoElUnder = true;
    }
    /* Contratos (PRIORIDAD 8): un sello guardado de una versión
       vieja no tiene duración ni vencimiento: se le asigna uno. */
    if (s.sello && s.sello.vencimiento === undefined) {
      var sdef = Under.DATA.SELLOS[s.sello.tipo];
      s.sello.duracion = sdef ? sdef.duracion : 2;
      s.sello.vencimiento = (s.sello.año || 1) + s.sello.duracion;
    }
    return s;
  },

  randInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /* Nivel de carrera = combinación de popularidad + fans */
  nivelCarrera: function (state) {
    var fansScore = Math.min(100, Math.log10(1 + state.stats.fans) * 12);
    var score = state.stats.popularity * 0.5 + fansScore * 0.5;
    score = Under.STATE.clamp(score, 0, 100);

    var nivel = Under.DATA.CAREER_LEVELS[0];
    for (var i = 0; i < Under.DATA.CAREER_LEVELS.length; i++) {
      if (score >= Under.DATA.CAREER_LEVELS[i].puntaje) {
        nivel = Under.DATA.CAREER_LEVELS[i];
      }
    }
    /* Camino under (PRIORIDAD 10): quien eligió quedarse en la
       escena no cruza la puerta de la fama grande: su nivel de
       carrera queda topeado en el under (nivel 3). */
    if (state.flags && state.flags.camino === "under" && nivel.nivel > 3) {
      for (var j = 0; j < Under.DATA.CAREER_LEVELS.length; j++) {
        if (Under.DATA.CAREER_LEVELS[j].nivel === 3) {
          nivel = Under.DATA.CAREER_LEVELS[j];
          break;
        }
      }
    }
    return {
      nivel: nivel.nivel,
      nombre: nivel.nombre,
      desc: nivel.desc,
      puntaje: score
    };
  },

  /* Era narrativa según el año actual */
  eraActual: function (state) {
    var eras = Under.DATA.ERAS;
    for (var i = 0; i < eras.length; i++) {
      if (state.año >= eras[i].añoMin && state.año <= eras[i].añoMax) {
        return eras[i];
      }
    }
    return eras[eras.length - 1];
  },

  /* Tope de fama (PRIORIDAD 10): el under crece lento y se queda
     abajo mucho tiempo. Los fans se frenan en el techo del año:
     2k · 4k · 7k · 11k · 16k · 24k · 34k · 46k. Salir de la escena
     es cosa de años (en promedio 6 a 8); recién desde el año 9
     la carrera puede explotar. */
  topeFama: function (state) {
    var año = state.año || 1;
    if (año < 1 || año >= 9) return null;
    return [0, 2000, 4000, 7000, 11000, 16000, 24000, 34000, 46000][año];
  },

  /* Etapa de la carrera según la madurez artística (PRIORIDAD 1) */
  etapaActual: function (state) {
    var etapas = Under.DATA.ETAPAS;
    var etapa = etapas[0];
    for (var i = 0; i < etapas.length; i++) {
      if (state.experiencia >= etapas[i].exp) etapa = etapas[i];
    }
    return etapa;
  }
};
