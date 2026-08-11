/* ============================================================
   UNDER — SISTEMA DE MERCADOS INTERNACIONALES (FASE 5)
   Conquistar regiones cuesta plata, suma fans y popularidad,
   y multiplica tus ingresos por streaming para siempre.
   ============================================================ */

window.Under = window.Under || {};

Under.MERCADOS = {

  _pendiente: null,

  /* El mercado más grande que podés conquistar (sin repetir) */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var lista = Under.DATA.MERCADOS.filter(function (m) {
      if (m.nivelMin > nivel) return false;
      return !state.mercados.some(function (x) { return x.id === m.id; });
    });
    if (!lista.length) return null;
    lista.sort(function (a, b) { return b.nivelMin - a.nivelMin || b.costo - a.costo; });
    return lista[0];
  },

  crearEventoMercado: function (state) {
    if (Under.MERCADOS._pendiente) return Under.MERCADOS._pendiente;

    var mercado = Under.MERCADOS._mejorOfrecible(state);
    if (!mercado) return null;

    var costo = Under.SYSTEMS.efectivoEscala(state, mercado.costo);

    var opciones = [
      {
        texto: mercado.emoji + " Conquistar " + mercado.nombre + " · " + Under.UI.fmtDinero(costo),
        desc: mercado.desc + " Suma fans y multiplica tu streaming un 12% para siempre.",
        soloSi: function (s) { return s.stats.money >= costo; },
        efectos: function (s) {
          s.mercados.push({ id: mercado.id, nombre: mercado.nombre, emoji: mercado.emoji, año: s.año });
          s.flags.mercadoEsteAnio = true;
          s.flags.tuvoMercado = true;
          Under.MERCADOS._pendiente = null;
          return { money: -costo, fans: Under.SYSTEMS.fansEscala(s, mercado.fans), popularity: mercado.popularidad, _energia: -8, _legado: 5 };
        },
        resultado: "Tu música llega a " + mercado.emoji + " " + mercado.nombre + ".\n\nLas playlists locales te suman y cada año esa región agranda tu streaming.",
        log: "Conquistó el mercado de " + mercado.nombre + "."
      },
      {
        texto: "Enfocar todo en casa",
        desc: "Expandirse también cansa.",
        efectos: function (s) {
          s.flags.mercadoEsteAnio = true;
          Under.MERCADOS._pendiente = null;
          return {};
        },
        log: "Dejó pasar la expansión a " + mercado.nombre + ".",
        resultado: "Decidís que por ahora tu país y tu región alcanzan. El mundo puede esperar."
      }
    ];

    var ev = {
      id: "mercado",
      recurrente: true,
      importante: true,
      titulo: "Nuevo mercado para conquistar",
      texto: "Un sello regional te propone expandir tu música a " + mercado.emoji + " " + mercado.nombre + ".\n\n" + mercado.desc + "\n\nCuesta " + Under.UI.fmtDinero(costo) + ". ¿Vas por él?",
      opciones: opciones
    };

    Under.MERCADOS._pendiente = ev;
    return ev;
  }
};
