/* ============================================================
   UNDER — CONTRATOS Y ECONOMÍA (PRIORIDAD 8)
   Firmar con un sello ya no es aceptar lo que te dan: es un
   contrato con duración, vencimiento y cláusulas que podés
   negociar o patear. Cuando el contrato vence, hay que
   renegociar o quedarse afuera.

   La retención y la distribución no son fijas para siempre:
   un contrato que renegociás bien paga mejor; uno que
   descuidás (o que firmaste apurado) te ata más.

   simple de jugar: 2-3 opciones, sin respuesta correcta.
   profundo por dentro: la duración y las cláusulas cambian
   cuánto te queda de cada peso que genera tu música.
   ============================================================ */

window.Under = window.Under || {};

Under.CONTRATOS = {

  _pendientes: {},

  _crear: function (id, titulo, textos, opciones) {
    if (Under.CONTRATOS._pendientes[id]) return Under.CONTRATOS._pendientes[id];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };
    Under.CONTRATOS._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.CONTRATOS._pendientes[id] = null;
  },

  /* ---------- Ayudas ---------- */

  /* ¿El contrato actual está cerca de vencer? */
  cercaDeVencer: function (state) {
    if (!state.sello || !state.sello.vencimiento) return false;
    return state.año >= state.sello.vencimiento - 1;
  },

  /* ---------- Renegociación al vencer ---------- */
  crearEventoRenegociar: function (state) {
    var sello = state.sello;
    var nombre = sello.nombre;

    var opciones = [];

    opciones.push({
      texto: "Renovar mejorado",
      desc: "Tu crecimiento es tu poder de negociación.",
      efectos: function (s) {
        s.sello.retencion = Math.max(0.45, s.sello.retencion - 0.05);
        s.sello.distribucion += 0.08;
        s.sello.duracion = Under.DATA.SELLOS[s.sello.tipo].duracion;
        s.sello.vencimiento = s.año + s.sello.duracion;
        s.sello.renegociado = (s.sello.renegociado || 0) + 1;
        s.flags.selloRenegociadoEsteAnio = true;
        s.flags.tuvoRenegociacion = true;
        Under.CONTRATOS._limpiar("ctr_renegociar");
        return { money: Under.SYSTEMS.efectivoEscala(s, 600), _relaciones: 2 };
      },
      resultado: "Renovás con " + nombre + " en mejores condiciones: retenés más de cada peso y la distribución mejora.\n\nTu crecimiento les conviene y lo saben.",
      log: "Renegoció su contrato con " + nombre + " en mejores condiciones."
    });

    opciones.push({
      texto: "Renovar igual",
      desc: "Misma letra, misma confianza.",
      efectos: function (s) {
        s.sello.duracion = Under.DATA.SELLOS[s.sello.tipo].duracion;
        s.sello.vencimiento = s.año + s.sello.duracion;
        s.flags.selloRenegociadoEsteAnio = true;
        Under.CONTRATOS._limpiar("ctr_renegociar");
        return { money: Under.SYSTEMS.efectivoEscala(s, 300) };
      },
      resultado: "Firmás la renovación sin tocar nada. El sello se conforma y vos también: sin sorpresas.",
      log: "Renovó su contrato con " + nombre + " sin cambios."
    });

    opciones.push({
      texto: "Pedir un adelanto grande",
      desc: "Plata hoy, retención más alta mañana.",
      efectos: function (s) {
        var adelanto = Under.SYSTEMS.efectivoEscala(s, 3000);
        s.sello.retencion = Math.min(0.9, s.sello.retencion + 0.08);
        s.sello.duracion = Under.DATA.SELLOS[s.sello.tipo].duracion + 1;
        s.sello.vencimiento = s.año + s.sello.duracion;
        s.flags.selloRenegociadoEsteAnio = true;
        Under.CONTRATOS._limpiar("ctr_renegociar");
        return { money: adelanto };
      },
      resultado: "Conseguís un adelanto grande, pero a cambio retenés menos de tus ingresos y el contrato se estira un año más.\n\nLa plata de hoy se paga con tu futuro.",
      log: "Renegoció su contrato pidiendo un adelanto grande."
    });

    opciones.push({
      texto: "No renovar",
      desc: "Quedar libre vale más que la plata.",
      efectos: function (s) {
        s.flags.selloRenegociadoEsteAnio = true;
        s.sello = null;
        Under.CONTRATOS._limpiar("ctr_renegociar");
        return { talent: 1, _relaciones: 2 };
      },
      resultado: "No renovás. Quedás libre, sin sello que te rete ni te empuje.\n\nTu música vuelve a ser toda tuya.",
      log: "No renovó su contrato y quedó libre."
    });

    return Under.CONTRATOS._crear("ctr_renegociar", "Tu contrato vence", [
      "Tu contrato con " + nombre + " vence este año. El sello quiere renovar, pero esta vez tenés más cartas que antes.",
      "Se acerca el fin de tu contrato con " + nombre + ". Ellos proponen renovar; vos podés pedir condiciones."
    ], opciones);
  },

  /* ---------- Cláusulas que te ofrecen a mitad de contrato ---------- */
  crearEventoClausulas: function (state) {
    var sello = state.sello;
    var nombre = sello.nombre;

    var opciones = [];

    opciones.push({
      texto: "Firmar la cláusula",
      desc: "Distribución extra a cambio de ceder derechos.",
      efectos: function (s) {
        s.sello.distribucion += 0.15;
        s.sello.retencion = Math.max(0.45, s.sello.retencion - 0.03);
        s.sello.exclusivo = true;
        s.flags.ctrClausulaEsteAnio = true;
        s.flags.tuvoClausula = true;
        Under.CONTRATOS._limpiar("ctr_clausulas");
        return { money: Under.SYSTEMS.efectivoEscala(s, 1500), fans: Under.SYSTEMS.fansEscala(s, 800) };
      },
      resultado: "Firmás la cláusula de exclusividad. " + nombre + " empuja tu distribución a más lugares, pero tus derechos quedan más atados.",
      log: "Firmó una cláusula de exclusividad con " + nombre + "."
    });

    opciones.push({
      texto: "Negociarla a la baja",
      desc: "Un poco de exclusividad, menos derechos cedidos.",
      efectos: function (s) {
        s.sello.distribucion += 0.06;
        s.flags.ctrClausulaEsteAnio = true;
        Under.CONTRATOS._limpiar("ctr_clausulas");
        return { money: Under.SYSTEMS.efectivoEscala(s, 500) };
      },
      resultado: "Negociás una versión más chica de la cláusula. " + nombre + " acepta a regañadientes: algo mejora, sin atarte del todo.",
      log: "Negoció a la baja una cláusula con " + nombre + "."
    });

    opciones.push({
      texto: "Rechazarla",
      desc: "Tu letra, tus reglas.",
      efectos: function (s) {
        s.flags.ctrClausulaEsteAnio = true;
        Under.CONTRATOS._limpiar("ctr_clausulas");
        return { _relaciones: 2 };
      },
      resultado: "Rechazás la cláusula. " + nombre + " la toma con frialdad, pero la ley no te obliga a ceder.",
      log: "Rechazó una cláusula de " + nombre + "."
    });

    return Under.CONTRATOS._crear("ctr_clausulas", "Una cláusula sobre la mesa", [
      nombre + " quiere sumar una cláusula a tu contrato: exclusividad de distribución a cambio de un bono y mejor alcance.\n\nTu libertad también se negocia.",
      "En pleno contrato, " + nombre + " propone una cláusula nueva. Dicen que te conviene. Las letras chicas dirán la verdad."
    ], opciones);
  },

  /* ---------- Cerrar el año: si vence y no renovaste, quedás libre ---------- */
  cerrarAnio: function (state) {
    if (!state.sello || !state.sello.vencimiento) return;
    if (state.año > state.sello.vencimiento) {
      var libre = state.sello.nombre;
      state.sello = null;
      state.planAnio.momentos.push("Tu contrato con " + libre + " terminó y quedaste libre.");
    }
  }
};
