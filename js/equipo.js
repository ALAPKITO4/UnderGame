/* ============================================================
   UNDER — SISTEMA DE EQUIPO (FASE 4)
   Manager, agente, jefe de prensa y asesor financiero.
   Cada uno cobra un retainer anual y aporta un beneficio distinto.
   ============================================================ */

window.Under = window.Under || {};

Under.EQUIPO = {

  _pendiente: null,

  tiene: function (state, id) {
    return state.equipo.some(function (m) { return m.id === id; });
  },

  /* Un rol libre que el nivel de carrera permite contratar */
  _ofrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var libres = Under.DATA.EQUIPO.filter(function (m) {
      return m.nivelMin <= nivel && !Under.EQUIPO.tiene(state, m.id);
    });
    if (libres.length === 0) return null;
    return libres[Under.STATE.randInt(0, libres.length - 1)];
  },

  crearEventoEquipo: function (state) {
    if (Under.EQUIPO._pendiente) return Under.EQUIPO._pendiente;

    var rol = Under.EQUIPO._ofrecible(state);
    if (!rol) return null;

    var costo = Under.SYSTEMS.efectivoEscala(state, rol.costoAnual);

    var opciones = [
      {
        texto: "Contratar: " + rol.emoji + " " + rol.nombre + " · " + Under.UI.fmtDinero(costo) + "/año",
        desc: rol.desc,
        soloSi: function (s) { return s.stats.money >= costo; },
        efectos: function (s) {
          s.equipo.push({ id: rol.id, nombre: rol.nombre, emoji: rol.emoji, costoAnual: costo, año: s.año });
          s.flags.equipoOfrecidoEsteAnio = true;
          Under.EQUIPO._pendiente = null;
          return { popularity: 1, _energia: -3 };
        },
        resultado: "Sumás a tu equipo " + rol.emoji + " " + rol.nombre + ".\n\nTu operación profesionaliza un escalón más.",
        log: "Contrató a " + rol.nombre + "."
      },
      {
        texto: "No por ahora",
        desc: "Preferís manejarlo sin más gastos.",
        efectos: function (s) {
          s.flags.equipoOfrecidoEsteAnio = true;
          Under.EQUIPO._pendiente = null;
          return {};
        },
        log: "Rechazó sumar a " + rol.nombre + " al equipo.",
        resultado: "Decidís que todavía no es el momento. La estructura sigue siendo vos y los tuyos."
      }
    ];

    var ev = {
      id: "equipo",
      recurrente: true,
      importante: true,
      titulo: "Una incorporación al equipo",
      texto: "Te recomiendan sumar a " + rol.emoji + " " + rol.nombre + " a tu equipo.\n\n" + rol.desc + "\n\n¿La sumás?",
      opciones: opciones
    };

    Under.EQUIPO._pendiente = ev;
    return ev;
  },

  /* Honorarios anuales del equipo (se pagan cada fin de año) */
  cerrarAnio: function (state) {
    if (state.equipo.length === 0) return;
    for (var i = 0; i < state.equipo.length; i++) {
      state.stats.money = Math.max(0, state.stats.money - state.equipo[i].costoAnual);
    }
    state.planAnio.momentos.push("Tu equipo cobró sus honorarios anuales.");
  }
};
