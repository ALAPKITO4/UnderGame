/* ============================================================
   UNDER — SISTEMA DE TRAYECTORIA Y LEGADO (FASE 5)
   La evolución de tu sonido y los documentales construyen
   tu legado: una marca que trasciende los números.
   ============================================================ */

window.Under = window.Under || {};

Under.LEGADO = {

  _pendienteEvol: null,
  _pendienteDoc: null,

  /* ---------- Evolución del sonido (cada ~3 años) ---------- */
  crearEventoEvolucion: function (state) {
    if (Under.LEGADO._pendienteEvol) return Under.LEGADO._pendienteEvol;

    var gen = Under.DATA.GENRES[state.artista.genero];
    var opciones = [
      {
        texto: "🔄 Reinventarte a fondo",
        desc: "Un salto al vacío: puede relanzarte… o salir caro.",
        efectos: function (s) {
          var exitoso = Math.random() < 0.5;
          s.flags.evolucionEsteAnio = true;
          s.ultimaReinvencion = s.año;
          Under.LEGADO._pendienteEvol = null;
          if (exitoso) {
            s.reinvenciones += 1;
            s.flags.tuvoReinvencion = true;
            return { popularity: 8, fans: Under.SYSTEMS.fansEscala(s, 8000), talent: 3, _energia: -15, _legado: 10 };
          }
          return { popularity: -6, fans: -Under.SYSTEMS.fansEscala(s, 3000), _energia: -15 };
        },
        resultado: function (s, efectos) {
          if (efectos.popularity >= 0) {
            return "Te reinventás y la apuesta sale perfecta.\n\nLa crítica renace con tu nuevo sonido y hasta los que te dejaron de seguir vuelven.";
          }
          return "Te reinventás… y tu público no entiende nada.\n\nEl nuevo sonido divide: perdés gente y te queda el cansancio de empezar de nuevo.";
        },
        log: "Se reinventó musicalmente."
      },
      {
        texto: "🎛️ Evolucionar con sutileza",
        desc: "Un paso a la vez, sin romper nada.",
        efectos: function (s) {
          s.flags.evolucionEsteAnio = true;
          s.ultimaReinvencion = s.año;
          Under.LEGADO._pendienteEvol = null;
          return { popularity: 2, talent: 2, fans: Under.SYSTEMS.fansEscala(s, 2000), _energia: -5, _legado: 3 };
        },
        resultado: "Tu sonido madura de forma natural.\n\nSin estridencias, el público nota que crecés y te sigue el viaje.",
        log: "Evolucionó su sonido con sutileza."
      },
      {
        texto: "🔒 Mantener tu esencia",
        desc: "El que cambia de sonido, pierde su lugar.",
        efectos: function (s) {
          s.flags.evolucionEsteAnio = true;
          s.ultimaReinvencion = s.año;
          Under.LEGADO._pendienteEvol = null;
          return { fans: Under.SYSTEMS.fansEscala(s, 1000), _legado: 1 };
        },
        resultado: "No tocás nada: tu sonido es tu firma.\n\nLos que te bancan te bancan por eso.",
        log: "Mantuvo su esencia musical."
      }
    ];

    var ev = {
      id: "evolucion",
      recurrente: true,
      importante: true,
      titulo: "Tu sonido quiere crecer",
      texto: "Después de " + (state.ultimaReinvencion ? (state.año - state.ultimaReinvencion) + " años " : "varios años ") + "con el mismo estilo, sentís que tu música necesita otro aire.\n\n" +
        "Tu gente (" + gen.nombre + ") no está segura de qué esperar.\n\n¿Qué hacés?",
      opciones: opciones
    };

    Under.LEGADO._pendienteEvol = ev;
    return ev;
  },

  /* ---------- Documental (una vez en la carrera) ---------- */
  crearEventoDocumental: function (state) {
    if (Under.LEGADO._pendienteDoc) return Under.LEGADO._pendienteDoc;

    var opciones = [
      {
        texto: "🎬 Aceptar el documental",
        desc: "Tu historia contada para siempre. Costo de tiempo, ganancia de legado.",
        efectos: function (s) {
          s.documentales += 1;
          s.flags.tuvoDocumental = true;
          Under.LEGADO._pendienteDoc = null;
          return { money: Under.SYSTEMS.dineroEscala(s, 2500), popularity: 4, _energia: -12, _legado: 15 };
        },
        resultado: "El documental se estrena y tu historia queda grabada.\n\nGana un premio de la crítica y tu nombre se convierte en relato.",
        log: "Estrenó su documental."
      },
      {
        texto: "🚫 Dejarlo pasar",
        desc: "Tu historia todavía la escribís vos.",
        efectos: function (s) {
          s.documentales = s.documentales || 0;
          s.flags.tuvoDocumental = true;
          Under.LEGADO._pendienteDoc = null;
          return {};
        },
        resultado: "Decidís que todavía no es el momento de mirar atrás.\n\nEl documental se lo ofrecen a otro.",
        log: "Rechazó el documental."
      }
    ];

    var ev = {
      id: "documental",
      recurrente: false,
      importante: true,
      titulo: "Un documental sobre vos",
      texto: "Un director reconocido quiere contar tu historia: los inicios, las caídas y la música.\n\nTendrías que dar entrevistas y abrir tu vida durante un año.\n\n¿Aceptás?",
      opciones: opciones
    };

    Under.LEGADO._pendienteDoc = ev;
    return ev;
  }
};
