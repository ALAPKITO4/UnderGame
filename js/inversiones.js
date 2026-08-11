/* ============================================================
   UNDER — SISTEMA DE INVERSIONES (FASE 4)
   Cuando sobra plata, se invierte en propiedad, marca o
   derechos de catálogo. Cada año generan ingresos pasivos
   con un pequeño riesgo de bache.
   ============================================================ */

window.Under = window.Under || {};

Under.INVERSIONES = {

  _pendiente: null,

  /* La inversión más accesible que no tenés todavía */
  _ofrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var lista = Under.DATA.INVERSIONES.filter(function (inv) {
      if (inv.nivelMin > nivel) return false;
      return !state.inversiones.some(function (x) { return x.id === inv.id; });
    });
    if (lista.length === 0) return null;
    lista.sort(function (a, b) { return a.costo - b.costo; });
    var asequible = lista.filter(function (inv) {
      return state.stats.money >= Under.SYSTEMS.efectivoEscala(state, inv.costo);
    });
    return (asequible.length ? asequible : lista)[0];
  },

  crearEventoInversion: function (state) {
    if (Under.INVERSIONES._pendiente) return Under.INVERSIONES._pendiente;

    var inv = Under.INVERSIONES._ofrecible(state);
    if (!inv) return null;

    var costo = Under.SYSTEMS.efectivoEscala(state, inv.costo);

    var opciones = [
      {
        texto: inv.emoji + " Comprar: " + inv.nombre + " · " + Under.UI.fmtDinero(costo),
        desc: inv.desc + " Retorno anual estimado del " + Math.round(inv.retorno * 100) + "%.",
        soloSi: function (s) { return s.stats.money >= costo; },
        efectos: function (s) {
          s.inversiones.push({
            id: inv.id, nombre: inv.nombre, emoji: inv.emoji,
            costo: costo, retorno: inv.retorno, riesgo: inv.riesgo, año: s.año
          });
          s.totalInversiones += 1;
          s.flags.inversionOfrecidaEsteAnio = true;
          s.flags.tuvoInversion = true;
          Under.INVERSIONES._pendiente = null;
          return { money: -costo, _energia: -5 };
        },
        resultado: "Invertís " + Under.UI.fmtDinero(costo) + " en " + inv.emoji + " " + inv.nombre + ".\n\nA partir de ahora te genera ingresos pasivos cada año.",
        log: "Invirtió en " + inv.nombre + "."
      },
      {
        texto: "No invertir por ahora",
        desc: "La plata segura también es plata.",
        efectos: function (s) {
          s.flags.inversionOfrecidaEsteAnio = true;
          Under.INVERSIONES._pendiente = null;
          return {};
        },
        log: "Rechazó la oportunidad de invertir.",
        resultado: "Decidís no arriesgar tu plata por ahora."
      }
    ];

    var ev = {
      id: "inversion",
      recurrente: true,
      importante: true,
      titulo: "Una oportunidad de inversión",
      texto: "Te presentan una oportunidad: " + inv.emoji + " " + inv.nombre + ".\n\n" + inv.desc + "\n\n¿Invertís?",
      opciones: opciones
    };

    Under.INVERSIONES._pendiente = ev;
    return ev;
  },

  /* Ingresos pasivos anuales de todas las inversiones */
  cerrarAnio: function (state) {
    if (state.inversiones.length === 0) return;
    for (var i = 0; i < state.inversiones.length; i++) {
      var inv = state.inversiones[i];
      var asesor = Under.EQUIPO && Under.EQUIPO.tiene(state, "asesor");
      var retornoMult = asesor ? 1.15 : 1;
      var riesgo = asesor ? inv.riesgo * 0.5 : inv.riesgo;

      var ganancia = Math.round(inv.costo * inv.retorno * retornoMult * (0.8 + Math.random() * 0.4));
      var perdida = Math.random() < riesgo ? Math.round(inv.costo * inv.riesgo) : 0;
      var neto = ganancia - perdida;

      state.stats.money = Math.max(0, state.stats.money + neto);
      state.planAnio.momentos.push(
        (neto >= 0 ? "📈 " : "📉 ") + inv.nombre +
        (neto >= 0 ? " generó " : " tuvo un bache de ") + Under.UI.fmtDinero(Math.abs(neto)) + "."
      );
    }
  }
};
