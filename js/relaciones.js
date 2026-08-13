/* ============================================================
   UNDER — RED DE RELACIONES (PRIORIDAD 7)
   El under se mueve con contactos. Cada persona que conocés
   (productores, colegas, aliados) queda en tu red con un vínculo
   que crece o se enfría según lo que hagas con ella.

   Los contactos son persistentes: repetir una sesión fortalece
   el vínculo, dejarlos enfriar los apaga. Las colaboraciones que
   aceptás construyen la red; las puertas que abriste (o cerraste)
   vuelven años después.

   simple de jugar: son decisiones de 2-4 opciones sin correcta.
   profundo por dentro: cada vínculo que trabajaste (o descuidaste)
   decide qué te llega a la mesa y en qué condiciones.
   ============================================================ */

window.Under = window.Under || {};

Under.RELACIONES = {

  _pendientes: {},

  _crear: function (id, titulo, textos, opciones) {
    if (Under.RELACIONES._pendientes[id]) return Under.RELACIONES._pendientes[id];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };
    Under.RELACIONES._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.RELACIONES._pendientes[id] = null;
  },

  /* ---------- Acceso a la red ---------- */

  contactos: function (state) {
    return (state.red || []).filter(function (c) { return c.activo; });
  },

  contar: function (state, rol) {
    return Under.RELACIONES.contactos(state).filter(function (c) { return c.rol === rol; }).length;
  },

  buscar: function (state, id) {
    return (state.red || []).filter(function (c) { return c.id === id; })[0] || null;
  },

  mejorVinculo: function (state, rol) {
    var lista = Under.RELACIONES.contactos(state).filter(function (c) { return c.rol === rol; });
    if (!lista.length) return null;
    lista.sort(function (a, b) { return b.vinculo - a.vinculo; });
    return lista[0];
  },

  /* Registrar un contacto nuevo en la red */
  agregar: function (state, id, nombre, rol, vinculoInicial) {
    if (Under.RELACIONES.buscar(state, id)) return Under.RELACIONES.buscar(state, id);
    var c = {
      id: id,
      nombre: nombre,
      rol: rol,
      vinculo: Under.STATE.clamp(vinculoInicial || 20, 0, 100),
      desde: state.año,
      ultima: state.año,
      activo: true
    };
    state.red.push(c);
    return c;
  },

  /* Fortalecer (o enfriar) un vínculo existente */
  mover: function (state, id, delta) {
    var c = Under.RELACIONES.buscar(state, id);
    if (!c) return;
    c.vinculo = Under.STATE.clamp(c.vinculo + delta, 0, 100);
    c.ultima = state.año;
    if (c.vinculo <= 10 && c.rol !== "productor") c.activo = false;
  },

  /* Vínculo promedio de la red (0-100): qué tan integrado estás */
  fuerzaRed: function (state) {
    var c = Under.RELACIONES.contactos(state);
    if (!c.length) return 0;
    var total = 0;
    c.forEach(function (x) { total += x.vinculo; });
    return Math.round(total / c.length);
  },

  /* ---------- Eventos ---------- */

  /* ---------- Productor: la sesión que repite ---------- */
  crearEventoProductor: function (state) {
    var prod = Under.RELACIONES.mejorVinculo(state, "productor");
    var primero = !prod;
    /* Nombre real de la escena para el productor nuevo (alterna). */
    var nombreNuevo = Under.DATA.escena({ rol: "artista" }).nombre;

    var textos = primero ? [
      nombreNuevo + " te busca después de escuchar tu maqueta. Tiene un estudio chico pero sabe sacar lo mejor de cada voz.",
      nombreNuevo + ", del barrio, propone grabar una sesión con vos. Trabaja con sonido crudo y sin vueltas."
    ] : [
      prod.nombre + " te propone una sesión nueva en su estudio. Ya se conocen: el vínculo que construyeron se nota.",
      "Tu productor de confianza tiene una idea para un tema nuevo. Su estudio ya es casi tu casa."
    ];

    var costo = Math.round(Under.SYSTEMS.efectivoEscala(state, prod ? 120 : 150) * (prod ? 1 - prod.vinculo / 400 : 1));
    var talento = 1 + Math.floor((prod ? prod.vinculo : 0) / 25);

    var opciones = [];

    opciones.push({
      texto: "Grabar la sesión · " + Under.UI.fmtDinero(costo),
      desc: "El vínculo crece y tu sonido se afina.",
      soloSi: function (s) { return s.stats.money >= costo; },
      efectos: function (s) {
        var idProd = prod ? prod.id : "prod_" + Under.STATE.randInt(100, 999);
        var nombre = prod ? prod.nombre : nombreNuevo;
        if (!prod) Under.RELACIONES.agregar(s, idProd, nombre, "productor", 25);
        Under.RELACIONES.mover(s, idProd, 12);
        s.flags.relProductorEsteAnio = true;
        Under.RELACIONES._limpiar("rel_productor");
        return { talent: talento, _energia: -8, _relaciones: 2 };
      },
      resultado: function (s) {
        var nombre = prod ? prod.nombre : nombreNuevo;
        return "La sesión sale redonda. " + nombre + " ya es parte estable de tu circuito: el sonido se nota más cada vez.";
      },
      log: "Grabó una sesión con " + (prod ? prod.nombre : nombreNuevo) + "."
    });

    opciones.push({
      texto: "Probar una sesión corta",
      desc: "Menos compromiso, menos costos.",
      efectos: function (s) {
        var idProd = prod ? prod.id : "prod_" + Under.STATE.randInt(100, 999);
        var nombre = prod ? prod.nombre : nombreNuevo;
        if (!prod) Under.RELACIONES.agregar(s, idProd, nombre, "productor", 15);
        Under.RELACIONES.mover(s, idProd, 5);
        s.flags.relProductorEsteAnio = true;
        Under.RELACIONES._limpiar("rel_productor");
        return { talent: 1, _energia: -4 };
      },
      resultado: "Hacen una sesión de prueba. Queda la puerta abierta para volver, sin atarte a nada.",
      log: "Probó una sesión corta con un productor."
    });

    opciones.push({
      texto: "Declinar por ahora",
      desc: "Tu agenda ya está llena.",
      efectos: function (s) {
        s.flags.relProductorEsteAnio = true;
        if (prod) Under.RELACIONES.mover(s, prod.id, -3);
        Under.RELACIONES._limpiar("rel_productor");
        return {};
      },
      resultado: "Le decís que no por ahora. La puerta queda entreabierta, aunque el vínculo se enfría un poco.",
      log: "Declinó una sesión con un productor."
    });

    return Under.RELACIONES._crear("rel_productor",
      primero ? "Un productor te busca" : "Sesión con tu productor",
      textos, opciones);
  },

  /* ---------- Colega: trabajar juntos fortalece la red ---------- */
  crearEventoColega: function (state) {
    var colega = Under.RELACIONES.mejorVinculo(state, "colega");
    var primero = !colega;

    var textos = primero ? [
      "Un colega de tu misma escena te propone componer juntos un tema para una fecha de bar.",
      "Otro artista del circuito quiere armar un proyecto a medias con vos. Hay buena onda y se puede sumar algo lindo."
    ] : [
      colega.nombre + " te busca para hacer algo juntos de nuevo. El vínculo que tienen hace que trabajar sea fácil.",
      "Tu colega del under quiere que compartan cartel en su fecha. Con él, todo es más simple."
    ];

    var opciones = [];

    opciones.push({
      texto: "Componer a medias",
      desc: "El colega suma a tu sonido y la red crece.",
      efectos: function (s) {
        var idC = colega ? colega.id : "colega_" + Under.STATE.randInt(100, 999);
        var nombre = colega ? colega.nombre : "Killpay";
        if (!colega) Under.RELACIONES.agregar(s, idC, nombre, "colega", 30);
        Under.RELACIONES.mover(s, idC, 10);
        s.flags.relColegaEsteAnio = true;
        Under.RELACIONES._limpiar("rel_colega");
        return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 400), _relaciones: 3, _energia: -6 };
      },
      resultado: "La sesión a medias sale bien. Tu colega se lleva una idea y vos otra: la escena lo va a notar.",
      log: "Compuso a medias con un colega."
    });

    opciones.push({
      texto: "Compartir cartel",
      desc: "Menos música, más presencia compartida.",
      efectos: function (s) {
        var idC = colega ? colega.id : "colega_" + Under.STATE.randInt(100, 999);
        var nombre = colega ? colega.nombre : "Killpay";
        if (!colega) Under.RELACIONES.agregar(s, idC, nombre, "colega", 20);
        Under.RELACIONES.mover(s, idC, 8);
        s.flags.relColegaEsteAnio = true;
        Under.RELACIONES._limpiar("rel_colega");
        return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 600), _relaciones: 4, _energia: -5 };
      },
      resultado: "Compartís fecha. Su gente te conoce y la tuya lo conoce a él: la escena se cruza y crece.",
      log: "Compartió cartel con un colega."
    });

    opciones.push({
      texto: "Seguir cada uno por su lado",
      desc: "No todo vínculo necesita un proyecto.",
      efectos: function (s) {
        s.flags.relColegaEsteAnio = true;
        if (colega) Under.RELACIONES.mover(s, colega.id, -2);
        Under.RELACIONES._limpiar("rel_colega");
        return {};
      },
      resultado: "Prefieres cuidar tu proceso. La relación queda, sin proyecto de por medio.",
      log: "Declinó componer con un colega."
    });

    return Under.RELACIONES._crear("rel_colega",
      primero ? "Un colega del under" : "Tu colega vuelve",
      textos, opciones);
  },

  /* ---------- Aliado: alguien que te cubre las espaldas ---------- */
  crearEventoAliado: function (state) {
    var aliado = Under.RELACIONES.mejorVinculo(state, "aliado");
    var primero = !aliado;

    var textos = primero ? [
      "Alguien con peso en la escena dijo una buena palabra tuya en una entrevista. La gente empezó a mirarte distinto.",
      "Un referente local te invitó a su círculo. Esa puerta vale más que cualquier promoción."
    ] : [
      aliado.nombre + " salió a bancarte en público cuando te estaban criticando. Un aliado así no se encuentra todos los días.",
      "Tu aliado en la escena te avisó antes que nadie de un movimiento que te convenía. La información vale oro."
    ];

    var opciones = [];

    opciones.push({
      texto: "Aceptar el respaldo",
      desc: "Dejarse ayudar también es inteligencia.",
      efectos: function (s) {
        var idA = aliado ? aliado.id : "aliado_" + Under.STATE.randInt(100, 999);
        var nombre = aliado ? aliado.nombre : "René Fierro";
        if (!aliado) Under.RELACIONES.agregar(s, idA, nombre, "aliado", 35);
        Under.RELACIONES.mover(s, idA, 10);
        s.reputacion = Under.STATE.clamp(s.reputacion + 4, 0, 100);
        s.flags.relAliadoEsteAnio = true;
        Under.RELACIONES._limpiar("rel_aliado");
        return { popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 800), _relaciones: 4 };
      },
      resultado: "Aceptás el gesto. Su palabra te abre puertas que la plata no compra.",
      log: "Aceptó el respaldo de un aliado."
    });

    opciones.push({
      texto: "Devolver el gesto",
      desc: "Las alianzas se pagan con hechos.",
      efectos: function (s) {
        var idA = aliado ? aliado.id : "aliado_" + Under.STATE.randInt(100, 999);
        var nombre = aliado ? aliado.nombre : "René Fierro";
        if (!aliado) Under.RELACIONES.agregar(s, idA, nombre, "aliado", 30);
        Under.RELACIONES.mover(s, idA, 14);
        s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
        s.flags.relAliadoEsteAnio = true;
        Under.RELACIONES._limpiar("rel_aliado");
        return { talent: 1, _relaciones: 6, _energia: -5 };
      },
      resultado: "Le devolvés el gesto con un hecho concreto. La alianza se vuelve a prueba de fuego.",
      log: "Devolvió el gesto a un aliado."
    });

    opciones.push({
      texto: "Agradecer y seguir",
      desc: "Cortesía sin compromiso.",
      efectos: function (s) {
        s.flags.relAliadoEsteAnio = true;
        if (aliado) Under.RELACIONES.mover(s, aliado.id, 3);
        Under.RELACIONES._limpiar("rel_aliado");
        return { _relaciones: 2 };
      },
      resultado: "Agradecés con una palabra justa. La puerta queda abierta, sin deudas de lado a lado.",
      log: "Agradeció el gesto de un aliado."
    });

    return Under.RELACIONES._crear("rel_aliado",
      primero ? "Un referente te respalda" : "Tu aliado te cubre",
      textos, opciones);
  },

  /* ---------- Cerrar el año: la red envejece sola ---------- */
  cerrarAnio: function (state) {
    if (!state.red) return;
    for (var i = 0; i < state.red.length; i++) {
      var c = state.red[i];
      if (state.año - c.ultima >= 3) {
        c.vinculo = Under.STATE.clamp(c.vinculo - 8, 0, 100);
        if (c.vinculo <= 10 && c.rol !== "productor") c.activo = false;
      }
      if (state.año - c.ultima >= 1) {
        c.vinculo = Under.STATE.clamp(c.vinculo - 1, 0, 100);
      }
    }
    /* El vínculo promedio alto se refleja en vida personal y reputación */
    var fuerza = Under.RELACIONES.fuerzaRed(state);
    if (fuerza >= 50) {
      state.reputacion = Under.STATE.clamp(state.reputacion + 1, 0, 100);
      state.relaciones = Under.STATE.clamp(state.relaciones + 2, 0, 100);
      state.planAnio.momentos.push("Tu red te sostiene: los vínculos que cuidaste trabajan por vos.");
    }
  }
};
