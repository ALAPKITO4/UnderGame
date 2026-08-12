/* ============================================================
   UNDER — SISTEMA DE GIRAS (FASE 3)
   Oportunidades de gira que escalan con el nivel de carrera.
   Aceptar: gastás, recaudás y sumás fans.
   ============================================================ */

window.Under = window.Under || {};

Under.GIRAS = {

  _pendiente: null,

  /* La gira más grande que tu nivel permite */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var mejor = null;
    for (var i = 0; i < Under.DATA.GIRAS.length; i++) {
      var g = Under.DATA.GIRAS[i];
      if (g.nivel <= nivel && (!mejor || g.nivel > mejor.nivel)) mejor = g;
    }
    return mejor;
  },

  crearEventoGira: function (state) {
    if (Under.GIRAS._pendiente) return Under.GIRAS._pendiente;

    var gira = Under.GIRAS._mejorOfrecible(state);
    if (!gira) return null;

    var opciones = [];

    opciones.push({
      texto: "Aceptar: " + gira.nombre,
      desc: gira.desc,
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, gira.costo);
        var bruto = Math.round(gira.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        /* El agente consigue mejores fechas (+20% fans) y el manager
           mejores contratos (+10% de ganancia) */
        var agente = (Under.EQUIPO && Under.EQUIPO.tiene(s, "agente")) ? 1.2 : 1;
        var manager = (Under.EQUIPO && Under.EQUIPO.tiene(s, "manager")) ? 1.1 : 1;
        /* hongo TV en el equipo consigue mejores fechas (+20% fans) */
        var hongo = (s.flags && s.flags.hongoTvEquipo) ? 1.2 : 1;
        var neto = Math.round((bruto - costo) * manager);
        var fans = Math.round(Under.SYSTEMS.fansEscala(s, gira.fans) * agente * hongo);

        s.giras.push({ año: s.año, nombre: gira.nombre, costo: costo, bruto: bruto, neto: neto, fans: fans });
        s.totalGiras += 1;
        s.flags.giraEsteAnio = true;
        if (gira.id === "mundial") s.flags.tuvoGiraMundial = true;

        Under.GIRAS._pendiente = null;
        return { money: neto, fans: fans, popularity: gira.popularidad, _energia: -20 };
      },
      resultado: function (s, efectos) {
        return "La " + gira.nombre + " es un éxito.\n\n" +
          "Recaudaste " + Under.UI.fmtExacto(efectos.money) + " de ganancia y sumaste " +
          Under.UI.fmtExacto(efectos.fans) + " fans nuevos.\n\nLa escena habla de vos.";
      },
      log: "Hizo la " + gira.nombre + "."
    });

    opciones.push({
      texto: "Dejarla para otro momento",
      desc: "Este año preferís no salir de gira.",
      efectos: function (s) {
        s.flags.giraEsteAnio = true;
        Under.GIRAS._pendiente = null;
        return {};
      },
      log: "Dejó pasar la oportunidad de una gira.",
      resultado: "Decidís que este año no hay gira. La música sigue trabajando por vos desde el estudio."
    });

    var ev = {
      id: "gira",
      recurrente: true,
      importante: true,
      titulo: "Oportunidad de gira",
      texto: "Te ofrecen hacer la " + gira.nombre + ".\n\n" + gira.desc + "\n\n¿La tomás?",
      opciones: opciones
    };

    Under.GIRAS._pendiente = ev;
    return ev;
  }
};
