/* ============================================================
   UNDER — SISTEMA DE PLATAFORMAS Y STREAMING (FASE 5)
   Elegís en qué plataformas apoyar tu música. La estrategia
   define cuánto reproducís y cuánto cobrás cada año.
   ============================================================ */

window.Under = window.Under || {};

Under.PLATAFORMAS = {

  _pendiente: null,

  /* La mejor estrategia disponible que todavía no usás */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var lista = Under.DATA.PLATAFORMAS.filter(function (p) {
      if (p.nivelMin > nivel) return false;
      return !state.plataforma || p.id !== state.plataforma.id;
    });
    if (!lista.length) return null;
    lista.sort(function (a, b) { return b.nivelMin - a.nivelMin || b.bono - a.bono; });
    return lista[0];
  },

  crearEventoPlataforma: function (state) {
    if (Under.PLATAFORMAS._pendiente) return Under.PLATAFORMAS._pendiente;

    var opcion = Under.PLATAFORMAS._mejorOfrecible(state);
    if (!opcion) return null;

    var actual = state.plataforma;
    var opciones = [
      {
        texto: opcion.emoji + " Adoptar: " + opcion.nombre,
        desc: opcion.desc + " (" + Math.round(opcion.streamsMult * 100) + "% repros · " + Math.round(opcion.dineroMult * 100) + "% ingreso).",
        efectos: function (s) {
          s.plataforma = { id: opcion.id, nombre: opcion.nombre, emoji: opcion.emoji };
          s.flags.plataformaEsteAnio = true;
          Under.PLATAFORMAS._pendiente = null;
          return opcion.bono ? { money: Under.SYSTEMS.dineroEscala(s, opcion.bono) } : {};
        },
        resultado: function (s, efectos) {
          var txt = "Apostás tu música a " + opcion.emoji + " " + opcion.nombre + ".\n\nA partir de ahora tu difusión y tus ingresos cambian de forma.";
          if (opcion.bono) txt += "\n\nRecibís un pago de " + Under.UI.fmtDinero(efectos.money) + " por la exclusiva.";
          return txt;
        },
        log: "Cambió su estrategia a " + opcion.nombre + "."
      }
    ];

    if (actual) {
      opciones.push({
        texto: actual.emoji + " Mantener " + actual.nombre,
        desc: "Lo que funciona, no se toca.",
        efectos: function (s) {
          s.flags.plataformaEsteAnio = true;
          Under.PLATAFORMAS._pendiente = null;
          return {};
        },
        resultado: "Decidís seguir con la estrategia actual. Si funciona, no la toques.",
        log: "Mantuvo su estrategia de plataformas."
      });
    }

    var ev = {
      id: "plataforma",
      recurrente: true,
      importante: true,
      titulo: "Tu música, tus plataformas",
      texto: "Tu distribuidor te muestra cómo se comporta tu catálogo y te propone reorientar la estrategia.\n\n" + opcion.emoji + " " + opcion.nombre + ": " + opcion.desc + "\n\n¿Cambiás?",
      opciones: opciones
    };

    Under.PLATAFORMAS._pendiente = ev;
    return ev;
  }
};
