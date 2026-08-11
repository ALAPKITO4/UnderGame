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
      /* Fase 5: plataformas, mercados, festivales, legado y economía */
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
    if (s.giras === undefined) s.giras = [];
    if (s.totalGiras === undefined) s.totalGiras = 0;
    if (s.colaboraciones === undefined) s.colaboraciones = [];
    if (s.totalColabs === undefined) s.totalColabs = 0;
    if (s.premios === undefined) s.premios = [];
    if (s.totalPremios === undefined) s.totalPremios = 0;
    if (s.nominaciones === undefined) s.nominaciones = [];
    if (s.rivales === undefined) s.rivales = [];
    if (s.trayectoria === undefined) s.trayectoria = [];
    if (s.misiones === undefined) s.misiones = {};
    if (s.contadores === undefined) s.contadores = {};
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
  }
};
