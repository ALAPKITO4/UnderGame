/* ============================================================
   UNDER — SISTEMA DE SELLOS DISCOGRÁFICOS (FASE 3)
   Firmás con un sello y mejorás la distribución de tus
   lanzamientos a cambio de retención. Los sellos escalan
   con el nivel de carrera.
   ============================================================ */

window.Under = window.Under || {};

Under.SELLO = {

  _pendiente: null,

  _elegirNombre: function (tipo) {
    var def = Under.DATA.SELLOS[tipo];
    return def.nombres[Under.STATE.randInt(0, def.nombres.length - 1)];
  },

  /* Crea el objeto sello. nombre es opcional (para que coincida
     con el que se le mostró al jugador en la oferta). */
  crear: function (tipo, año, nombre) {
    var def = Under.DATA.SELLOS[tipo];
    return {
      tipo: tipo,
      nombre: nombre || Under.SELLO._elegirNombre(tipo),
      retencion: def.retencion,
      distribucion: def.distribucion,
      adelanto: def.adelanto,
      año: año
    };
  },

  /* El sello más grande que te ofrecerían según tu nivel */
  mejorTipo: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    if (nivel >= 6) return "grande";
    if (nivel >= 4) return "medio";
    return "pequeno";
  },

  /* Evento dinámico: oferta de sello o mejora de sello */
  crearEventoSello: function (state) {
    if (Under.SELLO._pendiente) return Under.SELLO._pendiente;

    var tipo = Under.SELLO.mejorTipo(state);
    var def = Under.DATA.SELLOS[tipo];
    var nombre = Under.SELLO._elegirNombre(tipo);
    var adelanto = Under.SYSTEMS.efectivoEscala(state, def.adelanto);
    var yaTiene = !!state.sello;
    var opciones = [];

    if (yaTiene) {
      var actual = state.sello.nombre;
      opciones.push({
        texto: "Cambiar a " + nombre + " · " + Under.UI.fmtDinero(adelanto) + " de adelanto",
        desc: "Dejás " + actual + " por un sello más grande: mejor distribución y menos retención.",
        efectos: function (s) {
          s.sello = Under.SELLO.crear(tipo, s.año, nombre);
          s.flags.selloOfrecidoEsteAnio = true;
          Under.SELLO._pendiente = null;
          return { money: adelanto, fans: Under.SYSTEMS.fansEscala(s, 4000), popularity: 3 };
        },
        log: "Cambió de sello y firmó con " + nombre + ".",
        resultado: "Firmás con " + nombre + ". La distribución mejora de inmediato y el adelanto cae en tu cuenta.\n\nCambiar de sello siempre es un riesgo… pero el tuyo paga."
      });
      opciones.push({
        texto: "Quedarte en " + actual,
        desc: "La confianza también vale.",
        efectos: function (s) {
          s.flags.selloOfrecidoEsteAnio = true;
          Under.SELLO._pendiente = null;
          return { talent: 1 };
        },
        log: "Rechazó cambiar de sello y siguió en " + actual + ".",
        resultado: "Decidís quedarte donde estás. Tu sello te banca y vos lo bancás."
      });
    } else {
      opciones.push({
        texto: "Firmar el contrato · " + Under.UI.fmtDinero(adelanto) + " de adelanto",
        desc: "Mejor distribución, pero parte de tus ingresos pasa a ser del sello.",
        efectos: function (s) {
          s.sello = Under.SELLO.crear(tipo, s.año, nombre);
          s.flags.selloOfrecidoEsteAnio = true;
          Under.SELLO._pendiente = null;
          return { money: adelanto, fans: Under.SYSTEMS.fansEscala(s, 3000), popularity: 4 };
        },
        log: "Firmó con el sello " + nombre + ".",
        resultado: "Firmás con " + nombre + ". Te dan un adelanto de plata y tu música llega a más gente.\n\nPero ahora algo de lo que hacés ya no es solo tuyo."
      });
      opciones.push({
        texto: "Seguir independiente",
        desc: "Todo tuyo, todo a pulmón.",
        efectos: function (s) {
          s.flags.selloOfrecidoEsteAnio = true;
          Under.SELLO._pendiente = null;
          return { talent: 1, popularity: 1 };
        },
        log: "Seguiste independiente, sin sello.",
        resultado: "Preferís no firmar. Tu música sigue siendo 100% tuya, aunque el camino sea más lento."
      });
    }

    var ev = {
      id: "sello",
      recurrente: true,
      importante: true,
      titulo: yaTiene ? "Un sello más grande te busca" : "Una oferta de sello discográfico",
      texto: yaTiene
        ? "Los números de " + nombre + " superan a los de tu sello actual.\n\nTe ofrecen cambiar: más distribución, menos retención y un adelanto.\n\n¿Qué hacés?"
        : "Un sello importante se contacta con vos. Ofrecen financiar y distribuir tus próximos lanzamientos a cambio de un porcentaje.\n\n¿Qué hacés?",
      opciones: opciones
    };

    Under.SELLO._pendiente = ev;
    return ev;
  }
};
