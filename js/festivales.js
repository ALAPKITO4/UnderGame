/* ============================================================
   UNDER — SISTEMA DE FESTIVALES (FASE 5)
   Grandes escenarios de una sola noche: plata, fans,
   popularidad y un empujón de legado.
   ============================================================ */

window.Under = window.Under || {};

Under.FESTIVALES = {

  _pendiente: null,

  /* El festival más grande que tu nivel permite */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var mejor = null;
    for (var i = 0; i < Under.DATA.FESTIVALES.length; i++) {
      var f = Under.DATA.FESTIVALES[i];
      if (f.nivelMin <= nivel && (!mejor || f.nivelMin > mejor.nivelMin)) mejor = f;
    }
    return mejor;
  },

  crearEventoFestival: function (state) {
    if (Under.FESTIVALES._pendiente) return Under.FESTIVALES._pendiente;

    var festival = Under.FESTIVALES._mejorOfrecible(state);
    if (!festival) return null;

    var opciones = [
      {
        texto: festival.emoji + " Tocar en " + festival.nombre,
        desc: festival.desc + " " + Under.UI.fmtDinero(festival.base) + " de recaudación estimada.",
        efectos: function (s) {
          var costo = Under.SYSTEMS.efectivoEscala(s, festival.costo);
          var bruto = Math.round(festival.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
          var neto = bruto - costo;
          var fans = Under.SYSTEMS.fansEscala(s, festival.fans);

          s.festivales.push({ id: festival.id, año: s.año, nombre: festival.nombre, emoji: festival.emoji, costo: costo, bruto: bruto, neto: neto, fans: fans });
          s.totalFestivales += 1;
          s.flags.festivalEsteAnio = true;
          s.flags.tuvoFestival = true;
          Under.FESTIVALES._pendiente = null;
          return { money: neto, fans: fans, popularity: festival.popularidad, _energia: -20, _legado: festival.legado };
        },
        resultado: function (s, efectos) {
          return "Tocás en " + festival.emoji + " " + festival.nombre + " ante miles de personas.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
        },
        log: "Tocó en " + festival.nombre + "."
      },
      {
        texto: "No participar este año",
        desc: "Los festivales son una paliza.",
        efectos: function (s) {
          s.flags.festivalEsteAnio = true;
          Under.FESTIVALES._pendiente = null;
          return {};
        },
        log: "Declinó la invitación a " + festival.nombre + ".",
        resultado: "Decidís que este año no hay festival. El estudio también es un escenario."
      }
    ];

    var ev = {
      id: "festival",
      recurrente: true,
      importante: true,
      titulo: "Invitación a un festival",
      texto: "Te invitan a tocar en " + festival.emoji + " " + festival.nombre + ".\n\n" + festival.desc + "\n\nEs una noche enorme. ¿La agarrás?",
      opciones: opciones
    };

    Under.FESTIVALES._pendiente = ev;
    return ev;
  }
};
