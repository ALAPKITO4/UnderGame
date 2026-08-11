/* ============================================================
   UNDER — SISTEMA DE ECONOMÍA AVANZADA (FASE 5)
   Créditos con interés, venta del catálogo y la quiebra.
   La plata prestada se paga sola cada año… si podés.
   ============================================================ */

window.Under = window.Under || {};

Under.ECONOMIA = {

  _pendienteCredito: null,
  _pendienteCatalogo: null,

  /* ---------- Créditos ---------- */

  _creditoOfrecible: function (state) {
    var lista = Under.DATA.CREDITOS.filter(function (c) {
      return !state.deudas.some(function (d) { return d.id === c.id; });
    });
    if (!lista.length) return null;
    lista.sort(function (a, b) { return a.monto - b.monto; });
    return lista[0];
  },

  crearEventoCredito: function (state) {
    if (Under.ECONOMIA._pendienteCredito) return Under.ECONOMIA._pendienteCredito;

    var credito = Under.ECONOMIA._creditoOfrecible(state);
    if (!credito) return null;

    var cuota = Math.round(credito.monto * (1 + credito.interes) / credito.años);

    var opciones = [
      {
        texto: "💳 Pedir: " + credito.nombre + " · " + Under.UI.fmtDinero(credito.monto),
        desc: "Devolvés " + Under.UI.fmtDinero(cuota) + " por año durante " + credito.años + " años.",
        efectos: function (s) {
          s.deudas.push({ id: credito.id, nombre: credito.nombre, monto: credito.monto, interes: credito.interes, restante: credito.años, cuota: cuota });
          s.flags.creditoEsteAnio = true;
          s.flags.tuvoCredito = true;
          Under.ECONOMIA._pendienteCredito = null;
          return { money: credito.monto };
        },
        resultado: "Recibís " + Under.UI.fmtDinero(credito.monto) + " de golpe.\n\nLa banca empieza a descontarte " + Under.UI.fmtDinero(cuota) + " cada año. No lo olvides.",
        log: "Sacó " + credito.nombre + "."
      },
      {
        texto: "No pedir nada",
        desc: "La plata que no tenés, tampoco la debés.",
        efectos: function (s) {
          s.flags.creditoEsteAnio = true;
          Under.ECONOMIA._pendienteCredito = null;
          return {};
        },
        log: "Rechazó un crédito.",
        resultado: "Decidís vivir sin deudas. Tu espalda duerme mejor."
      }
    ];

    var ev = {
      id: "credito",
      recurrente: true,
      importante: true,
      titulo: "Un crédito sobre la mesa",
      texto: "Tu banco te ofrece " + Under.UI.fmtDinero(credito.monto) + " de una.\n\nLa devolución es de " + Under.UI.fmtDinero(cuota) + " por año durante " + credito.años + " años.\n\n¿Lo tomás?",
      opciones: opciones
    };

    Under.ECONOMIA._pendienteCredito = ev;
    return ev;
  },

  /* ---------- Venta del catálogo ---------- */

  crearEventoCatalogo: function (state) {
    if (Under.ECONOMIA._pendienteCatalogo) return Under.ECONOMIA._pendienteCatalogo;

    var oferta = Math.round(state.totalReproducciones * 0.08);

    var opciones = [
      {
        texto: "📀 Vender tu catálogo · " + Under.UI.fmtDinero(oferta),
        desc: "Mucha plata ahora, pero tus regalías futuras se reducen a la mitad.",
        efectos: function (s) {
          s.vendioCatalogo = true;
          s.flags.catalogoEsteAnio = true;
          s.flags.tuvoVentaCatalogo = true;
          Under.ECONOMIA._pendienteCatalogo = null;
          return { money: oferta, _legado: -5 };
        },
        resultado: "Vendés los derechos de tu catálogo por " + Under.UI.fmtDinero(oferta) + ".\n\nEl cheque es enorme. Tus regalías futuras ya no serán las mismas.",
        log: "Vendió su catálogo."
      },
      {
        texto: "🤝 Conservar tus derechos",
        desc: "Tu música es tuya, siempre.",
        efectos: function (s) {
          s.flags.catalogoEsteAnio = true;
          Under.ECONOMIA._pendienteCatalogo = null;
          return {};
        },
        resultado: "Rechazás la oferta. Tu catálogo sigue siendo tuyo y las regalías no se tocan.",
        log: "Rechazó vender su catálogo."
      }
    ];

    var ev = {
      id: "catalogo",
      recurrente: false,
      importante: true,
      titulo: "Oferta por tu catálogo",
      texto: "Un fondo de inversión quiere comprar tus derechos de autor.\n\nTe ofrecen " + Under.UI.fmtDinero(oferta) + " por todo lo que publicaste hasta hoy.\n\nTus regalías futuras se reducirían a la mitad. ¿Aceptás?",
      opciones: opciones
    };

    Under.ECONOMIA._pendienteCatalogo = ev;
    return ev;
  }
};
