/* ============================================================
   UNDER — CRISIS, RECUPERACIÓN Y EVOLUCIÓN (PRIORIDAD 9)
   Una carrera no es una línea recta: es un electrocardiograma.
   Hay momentos de crisis (todo se apaga), momentos de rebote
   (volver del fondo) y momentos de evolución (cambiar sin
   romper lo que sos).

   El módulo lee el estado real de la carrera (momentum,
   popularidad, año) y ofrece los eventos que corresponden:
   cuando estás en el fondo, la escena te pone a prueba;
   cuando volvés, se nota; cuando sos estable, tu sonido
   tiene la libertad de madurar.

   simple de jugar: 2-3 opciones, sin respuesta correcta.
   profundo por dentro: el estado de carrera decide qué
   te pasa, y cada crisis deja una marca que no se borra.
   ============================================================ */

window.Under = window.Under || {};

Under.CRISIS = {

  _pendientes: {},

  _crear: function (id, titulo, textos, opciones) {
    if (Under.CRISIS._pendientes[id]) return Under.CRISIS._pendientes[id];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };
    Under.CRISIS._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.CRISIS._pendientes[id] = null;
  },

  /* ---------- Estado de la carrera ---------- */

  estadoCarrera: function (state) {
    var bajo = state.momentum <= 22 && state.stats.popularity <= 38;
    if (bajo && state.año >= 3) return "crisis";
    if (state.flags.estuvoEnCrisis && state.momentum >= 45) return "recuperacion";
    if (state.momentum >= 62 && state.stats.popularity >= 68) return "cima";
    return "estable";
  },

  /* ---------- Tocar fondo ---------- */
  crearEventoFondo: function (state) {
    var textos = [
      "La escena sigue sin vos. Las fechas se cancelan, los mensajes quedan sin respuesta y hasta el estudio te pesa.",
      "El momento es frío. La gente no te espera y la sensación de que esto se acabó no te suelta.",
      "Te cruzás con artistas que arrancaron después que vos y están más arriba. La carrera se siente en pausa."
    ];

    var opciones = [];

    opciones.push({
      texto: "Encerrarte en el estudio",
      desc: "Convertir el dolor en obra. Sin excusas.",
      efectos: function (s) {
        s.flags.crisFondoEsteAnio = true;
        s.flags.estuvoEnCrisis = true;
        s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
        Under.CRISIS._limpiar("cris_fondo");
        return { talent: 3, _energia: -10, _relaciones: -2 };
      },
      resultado: "Te encerrás a componer. Del fondo salen tus mejores canciones: el dolor, laburado.",
      log: "Convirtió la crisis en obra de estudio."
    });

    opciones.push({
      texto: "Volver a las raíces",
      desc: "Un toque chico, la gente de siempre, cero pretensiones.",
      efectos: function (s) {
        s.flags.crisFondoEsteAnio = true;
        s.flags.estuvoEnCrisis = true;
        s.momentum = Under.STATE.clamp(s.momentum + 8, 0, 100);
        s.reputacion = Under.STATE.clamp(s.reputacion + 2, 0, 100);
        Under.CRISIS._limpiar("cris_fondo");
        return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 1, _energia: -5, _relaciones: 4 };
      },
      resultado: "Volvés a tocar donde arrancaste. La gente que nunca se fue te recibe y el frío empieza a ceder.",
      log: "Volvió a las raíces durante la crisis."
    });

    opciones.push({
      texto: "Desaparecer un tiempo",
      desc: "Irte de todo y volver con aire nuevo.",
      efectos: function (s) {
        s.flags.crisFondoEsteAnio = true;
        s.flags.estuvoEnCrisis = true;
        Under.CRISIS._limpiar("cris_fondo");
        return { _energia: 12, talent: 1, _relaciones: 3 };
      },
      resultado: "Te borrás del mapa unos meses. Cuando volvés, el mundo giró y vos también.",
      log: "Desapareció un tiempo durante la crisis."
    });

    return Under.CRISIS._crear("cris_fondo", "Tocar fondo", textos, opciones);
  },

  /* ---------- Rebote: volver del fondo ---------- */
  crearEventoRebote: function (state) {
    var textos = [
      "Después de la temporada de mierda, algo se destraba: una fecha, una nota, un buen demo. La carrera respira de nuevo.",
      "La gente vuelve a hablar de vos, y esta vez con el respeto de los que aguantaron. El rebote se siente distinto.",
      "Un tema que dejaste guardado encuentra su momento. Lo que sembraste en el fondo empieza a dar frutos."
    ];

    var opciones = [];

    opciones.push({
      texto: "Cabalgar el rebote",
      desc: "El vuelto del fondo se aprovecha ya.",
      efectos: function (s) {
        s.flags.crisReboteEsteAnio = true;
        s.momentum = Under.STATE.clamp(s.momentum + 6, 0, 100);
        s.hype = Under.STATE.clamp(s.hype + 8, 0, 100);
        Under.CRISIS._limpiar("cris_rebote");
        return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 4, _energia: -8 };
      },
      resultado: "No dejás pasar el envión. Publicás, tocás, aparecés: el rebote se vuelve ola.",
      log: "Cabalgo el rebote después de la crisis."
    });

    opciones.push({
      texto: "Tomarlo con calma",
      desc: "Sabés que el rebote también puede ser espejismo.",
      efectos: function (s) {
        s.flags.crisReboteEsteAnio = true;
        s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
        Under.CRISIS._limpiar("cris_rebote");
        return { talent: 2, _relaciones: 3, _energia: 5 };
      },
      resultado: "No te dejás llevar. Construís de a poco: el rebote se vuelve cimiento.",
      log: "Tomó el rebote con calma."
    });

    opciones.push({
      texto: "Sospechar del momento",
      desc: "La última vez que vinieron con todo, te quemaste.",
      efectos: function (s) {
        s.flags.crisReboteEsteAnio = true;
        Under.CRISIS._limpiar("cris_rebote");
        return { _relaciones: 2, fans: Under.SYSTEMS.fansEscala(s, 300) };
      },
      resultado: "Desconfiás del momento. No está mal: el que se quemó aprende a medir el fuego.",
      log: "Desconfió del rebote tras la crisis."
    });

    return Under.CRISIS._crear("cris_rebote", "El rebote", textos, opciones);
  },

  /* ---------- Evolución: madurar sin romper el sonido ---------- */
  crearEventoEvolucion: function (state) {
    var gen = Under.DATA.GENRES[state.artista.genero];
    var p = Under.DATA.escena({ rol: "artista" });
    var textos = [
      "Tu sonido ya no te representa del todo. La música que hacés está bien, pero la que te gustaría hacer quedó en el camino.",
      "Escuchás tus primeros temas y los sentís lejanos. Creciste: la pregunta es si tu música creció con vos.",
      p.nombre + " te muestra una dirección nueva para tu " + gen.nombre + ". Podrías seguir igual… o dar el paso."
    ];

    var opciones = [];

    opciones.push({
      texto: "Sumar una capa nueva",
      desc: "Mismo corazón, sonido más grande.",
      efectos: function (s) {
        s.flags.crisEvoEsteAnio = true;
        s.flags.tuvoEvolucion = true;
        s.ultimaReinvencion = s.año;
        s.reputacion = Under.STATE.clamp(s.reputacion + 2, 0, 100);
        Under.CRISIS._limpiar("cris_evolucion");
        return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 2, _energia: -6, _legado: 3 };
      },
      resultado: "Sumás instrumentos, texturas, otra producción: tu sonido crece sin dejar de ser tuyo. La gente lo nota en el primer tema.",
      log: "Sumó una capa nueva a su sonido."
    });

    opciones.push({
      texto: "Explorar en secreto",
      desc: "Probar lo nuevo sin exponerlo todavía.",
      efectos: function (s) {
        s.flags.crisEvoEsteAnio = true;
        s.flags.tuvoEvolucion = true;
        s.ultimaReinvencion = s.año;
        Under.CRISIS._limpiar("cris_evolucion");
        return { talent: 3, _energia: -8 };
      },
      resultado: "Experimentás en silencio. Nadie lo escucha todavía, pero vos ya sabés hacia dónde va tu música.",
      log: "Exploró un sonido nuevo en secreto."
    });

    opciones.push({
      texto: "Seguir como estás",
      desc: "Si funciona, no se toca.",
      efectos: function (s) {
        s.flags.crisEvoEsteAnio = true;
        Under.CRISIS._limpiar("cris_evolucion");
        return { fans: Under.SYSTEMS.fansEscala(s, 600), _relaciones: 2 };
      },
      resultado: "Decidís que tu sonido es tu casa. No cambiás por cambiar: el que te escucha sabe qué esperar.",
      log: "Mantuvo su sonido sin cambios."
    });

    return Under.CRISIS._crear("cris_evolucion", "Tu sonido madura", textos, opciones);
  },

  /* ---------- Cerrar el año: el estado de la carrera deja marca ---------- */
  cerrarAnio: function (state) {
    var estado = Under.CRISIS.estadoCarrera(state);
    if (estado === "crisis") {
      state.flags.estuvoEnCrisis = true;
      state.aniosEnCrisis = (state.aniosEnCrisis || 0) + 1;
      if (state.aniosEnCrisis >= 3) {
        state.legado = Math.max(0, state.legado - 2);
        state.planAnio.momentos.push("La crisis se prolonga: el mercado empieza a borrar tu nombre.");
      }
    } else if (estado === "recuperacion" && state.aniosEnCrisis) {
      state.flags.superoCrisis = true;
      state.planAnio.momentos.push("Saliste del fondo. La escena lo registra y tu historia gana una página.");
    }
  }
};
