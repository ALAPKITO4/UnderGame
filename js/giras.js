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
          Under.UI.fmtExacto(efectos.fans) + " fans nuevos.\n\n" +
          "Entre el público están " + Under.DATA.publico(2) + ", y el fotógrafo de undercba te dedica una postal de la gira.";
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

/* ============================================================
   UNDER — ESTADIOS GRANDES (FASE 5)
   Cuando tu público ya es gigante (600.000 fans o más) los
   estadios de 50.000+ de capacidad te abren las puertas.
   ============================================================ */

Under.ESTADIOS = {

  _pendiente: null,

  /* El estadio que tu público puede llenar: con 600.000 fans o
     más, cualquiera de los grandes (todos piden mínimo 600k). */
  _mejorOfrecible: function (state) {
    var fama = state.stats && state.stats.fans;
    var pool = Under.DATA.ESTADIOS.filter(function (e) { return fama >= e.fansMin; });
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  crearEventoEstadio: function (state) {
    if (Under.ESTADIOS._pendiente) return Under.ESTADIOS._pendiente;

    var est = Under.ESTADIOS._mejorOfrecible(state);
    if (!est) return null;

    var opciones = [];

    opciones.push({
      texto: "🎫 Tocar en " + est.nombre,
      desc: "Un estadio de " + est.capacidad + " personas, con tu nombre en el cartel.",
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, est.costo);
        var bruto = Math.round(est.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        var neto = bruto - costo;
        var fans = Under.SYSTEMS.fansEscala(s, est.fans);

        if (!s.estadios) s.estadios = [];
        s.estadios.push({ id: est.id, año: s.año, nombre: est.nombre, capacidad: est.capacidad, costo: costo, bruto: bruto, neto: neto, fans: fans });
        s.totalEstadios = (s.totalEstadios || 0) + 1;
        s.flags.estadioEsteAnio = true;

        Under.ESTADIOS._pendiente = null;
        return { money: neto, fans: fans, popularity: est.popularidad, _energia: -25, _legado: 8 };
      },
      resultado: function (s, efectos) {
        return "Llenás " + est.nombre + " (" + Under.UI.fmtExacto(est.capacidad) + " de capacidad). Entre el público están " + Under.DATA.publico(2) + ", y el fotógrafo de undercba filma la noche que pasó a la historia.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
      },
      log: "Tocó en " + est.nombre + "."
    });

    opciones.push({
      texto: "🎤 Llevar invitados",
      desc: "Sumás nombres al cartel y repartís el peso.",
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, est.costo);
        var bruto = Math.round(est.base * 0.6 * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        var neto = bruto - costo;
        var fans = Math.round(Under.SYSTEMS.fansEscala(s, est.fans) * 0.6);

        if (!s.estadios) s.estadios = [];
        s.estadios.push({ id: est.id, año: s.año, nombre: est.nombre, capacidad: est.capacidad, costo: costo, bruto: bruto, neto: neto, fans: fans, invitados: true });
        s.totalEstadios = (s.totalEstadios || 0) + 1;
        s.flags.estadioEsteAnio = true;

        Under.ESTADIOS._pendiente = null;
        return { money: neto, fans: fans, popularity: 5, _energia: -20, _legado: 5 };
      },
      resultado: function (s, efectos) {
        return "Subís al escenario de " + est.nombre + " con invitados. La noche es una fiesta colectiva y tu nombre es el que llenó.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
      },
      log: "Tocó en " + est.nombre + " con invitados."
    });

    opciones.push({
      texto: "Dejarlo para otro momento",
      desc: "Un estadio también puede esperar.",
      efectos: function (s) {
        s.flags.estadioEsteAnio = true;
        Under.ESTADIOS._pendiente = null;
        return {};
      },
      log: "Dejó pasar una fecha de estadio.",
      resultado: "Decidís que todavía no. El estadio te va a esperar, y lo sabés."
    });

    var ev = {
      id: "estadio",
      recurrente: true,
      importante: true,
      titulo: "Un estadio te abre las puertas",
      texto: "Con " + Under.UI.fmtExacto(state.stats.fans) + " de fans, " + est.nombre + " (" + est.ciudad + ", " + est.capacidad + " de capacidad) te ofrece una fecha.\n\nUn estadio de verdad. ¿Lo llenás?",
      opciones: opciones
    };

    Under.ESTADIOS._pendiente = ev;
    return ev;
  }
};
