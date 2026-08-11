/* ============================================================
   UNDER — SISTEMA DE MISIONES (GRAN ACTUALIZACIÓN)
   Objetivos con progreso visible y recompensa. Cada misión
   escucha un contador del estado (state.contadores) o una
   estadística global (fans, lanzamientos…). Al completarse
   aplica su recompensa, la registra en el historial y avisa
   con un toast.

   Contadores: los eventos los incrementan con
   Under.MISIONES.sumar(state, "clave", n). Cada vez que un
   contador cambia, chequear() revisa todas las misiones.
   ============================================================ */

window.Under = window.Under || {};

Under.MISIONES = {

  DEFS: [
    /* ---- Grind bajo tierra: se completan viviendo la escena ---- */
    {
      id: "m_grind",
      icono: "🎛️",
      titulo: "La escena te conoce",
      desc: "Tomá 10 decisiones del underground",
      contador: "grind",
      meta: 10,
      recompensa: { talent: 2, popularity: 3, _relaciones: 3 },
      recompensaTexto: "🎯 Misión completada: La escena te conoce. +2 talento, +3 popularidad y +3 vida personal."
    },
    {
      id: "m_toques",
      icono: "🎤",
      titulo: "Cara a cara",
      desc: "Tocá en 3 toques de la escena",
      contador: "toques",
      meta: 3,
      recompensa: { fans: 2500, popularity: 4, _energia: 5 },
      recompensaTexto: "🎯 Misión completada: Cara a cara. El público de los bares ya canta tus temas."
    },
    {
      id: "m_aire",
      icono: "📻",
      titulo: "Salir al aire",
      desc: "Dá 2 entrevistas en radios de la escena",
      contador: "radio",
      meta: 2,
      recompensa: { fans: 1500, popularity: 3 },
      recompensaTexto: "🎯 Misión completada: Salir al aire. Tu voz ya suena en la radio de tu barrio."
    },
    {
      id: "m_maqueta",
      icono: "💽",
      titulo: "Algo para repartir",
      desc: "Grabá tu primera maqueta",
      contador: "maqueta",
      meta: 1,
      recompensa: { fans: 2000, popularity: 3, talent: 1 },
      recompensaTexto: "🎯 Misión completada: Algo para repartir. Tu maqueta corre por los bares de la zona."
    },
    {
      id: "m_freestyle",
      icono: "🔥",
      titulo: "La plaza es tuya",
      desc: "Ganá una batalla de freestyle",
      contador: "freestyle",
      meta: 1,
      recompensa: { talent: 2, popularity: 4, fans: 3000 },
      recompensaTexto: "🎯 Misión completada: La plaza es tuya. Tu barra corre de boca en boca."
    },
    /* ---- Hitos de la carrera (ayudan a salir del underground) ---- */
    {
      id: "m_fama",
      icono: "🌱",
      titulo: "Primer público",
      desc: "Llegá a 10.000 fans",
      meta: 10000,
      actual: function (s) { return s.stats.fans; },
      recompensa: { money: 3000, popularity: 4, _relaciones: 3 },
      recompensaTexto: "🎯 Misión completada: Primer público. 10.000 personas te escuchan."
    },
    {
      id: "m_discografia",
      icono: "💿",
      titulo: "No parar",
      desc: "Lanzá 5 temas",
      meta: 5,
      actual: function (s) { return s.lanzamientos; },
      recompensa: { talent: 1, popularity: 2, money: 1500 },
      recompensaTexto: "🎯 Misión completada: No parar. Cinco temas y la disciplina se nota."
    },
    /* ---- La vida alrededor de la música (gran actualización 3) ---- */
    {
      id: "m_puertas",
      icono: "🚪",
      titulo: "La música abre puertas",
      desc: "Viví 3 momentos fuera de la música",
      contador: "puertas",
      meta: 3,
      recompensa: { money: 2000, popularity: 3, _relaciones: 3 },
      recompensaTexto: "🎯 Misión completada: La música abre puertas. Tu nombre ya trasciende los escenarios."
    },
    {
      id: "m_fandom",
      icono: "💜",
      titulo: "Un público con vida propia",
      desc: "Viví 3 momentos de fandom",
      contador: "fandom",
      meta: 3,
      recompensa: { fans: 3000, popularity: 3, _relaciones: 4 },
      recompensaTexto: "🎯 Misión completada: Un público con vida propia. Tus fans ya son parte de la historia."
    }
  ],

  /* Crea el estado de misiones de una partida nueva */
  _inicializar: function (state) {
    state.misiones = {};
    state.contadores = {};
    Under.MISIONES.DEFS.forEach(function (def) {
      state.misiones[def.id] = { completada: false, año: null };
    });
  },

  /* Progreso actual de una misión */
  _progreso: function (def, state) {
    if (def.actual) return def.actual(state);
    return (state.contadores || {})[def.contador] || 0;
  },

  /* Incrementa un contador y revisa misiones */
  sumar: function (state, clave, n) {
    if (!state.contadores) state.contadores = {};
    state.contadores[clave] = (state.contadores[clave] || 0) + (n || 1);
    Under.MISIONES.chequear(state);
  },

  /* Revisa todas las misiones y completa las que corresponda */
  chequear: function (state) {
    if (!state.misiones) return;
    for (var i = 0; i < Under.MISIONES.DEFS.length; i++) {
      var def = Under.MISIONES.DEFS[i];
      var mis = state.misiones[def.id];
      if (!mis || mis.completada) continue;
      if (Under.MISIONES._progreso(def, state) < def.meta) continue;

      mis.completada = true;
      mis.año = state.año;
      if (def.recompensa) Under.SYSTEMS.aplicarEfectos(state, def.recompensa);
      state.historial.push({ año: state.año, texto: def.recompensaTexto });
      if (Under.UI && Under.UI.toast) {
        setTimeout(function () {
          Under.UI.toast(def.icono + " Misión completada: " + def.titulo);
        }, 600);
      }
    }
  },

  /* Misiones activas (no completadas) */
  _activas: function (state) {
    if (!state.misiones) return [];
    return Under.MISIONES.DEFS.filter(function (def) {
      return state.misiones[def.id] && !state.misiones[def.id].completada;
    });
  }
};
