/* ============================================================
   UNDER — EVENTOS DE CONTEXTO (PRIORIDAD 6)
   La escena no ofrece lo mismo siempre: el momento del artista
   condiciona qué puertas se abren.

   Cada evento de este módulo tiene un "disponible" que lee el
   estado real (reputación, momentum, legado, hype) y un peso
   dinámico: cuando la condición se cumple, el evento entra con
   fuerza al pozo; cuando no, desaparece. Así el mismo juego se
   siente distinto según cómo vaya la carrera: una carrera en
   llamas vive en la prensa, una fría sobrevive a la temporada
   baja, un referente paga su rol, un quemado cosecha lo sembrado.

   simple de jugar (son decisiones de 2-4 opciones sin correcta),
   profundo por dentro: el contexto decide qué se te ofrece.
   ============================================================ */

window.Under = window.Under || {};

Under.CONTEXTO = {

  _pendientes: {},

  _crear: function (id, titulo, textos, opciones) {
    if (Under.CONTEXTO._pendientes[id]) return Under.CONTEXTO._pendientes[id];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };
    Under.CONTEXTO._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.CONTEXTO._pendientes[id] = null;
  },

  /* ============================================================
     REPUTACIÓN: la escena te respeta… o te dio la espalda
     ============================================================ */

  /* ---------- Referente: te piden guiar ---------- */
  crearEventoReputacionAlta: function (state) {
    return Under.CONTEXTO._crear("ctx_reputacion_alta", "La escena te pide guía", [
      "Los pibes que arrancan te piden un taller de lo que sabés.",
      "Un colectivo de la escena quiere que prologues su compilado.",
      "Te invitan a curar una fecha de artistas nuevos: tu palabra abre puertas."
    ], [
      {
        texto: "Dar el taller",
        desc: "Enseñar también te forma.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_alta");
          s.reputacion = Under.STATE.clamp(s.reputacion + 2, 0, 100);
          return { fans: Under.SYSTEMS.fansEscala(s, 600), talent: 1, _energia: -8, _relaciones: 4 };
        },
        resultado: "El taller se llena. Los pibes repiten tus frases: tu conocimiento ya no es solo tuyo.",
        log: "Dio un taller para la escena nueva."
      },
      {
        texto: "Curar la fecha",
        desc: "Con tu cartel, les abrís la puerta.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_alta");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          return { money: Under.SYSTEMS.efectivoEscala(s, 200), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 2, _energia: -10 };
        },
        resultado: "La fecha que curás es un semillero. Los artistas que armaste te lo agradecen con su música.",
        log: "Curó una fecha de artistas nuevos."
      },
      {
        texto: "Seguir en lo tuyo",
        desc: "Tu obra también es un ejemplo.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_alta");
          return { talent: 1 };
        },
        resultado: "No te metés. La escena sigue igual y tu ejemplo queda en tu música.",
        log: "Declinó guiar a la escena nueva."
      }
    ]);
  },

  /* ---------- Quemado: la escena te dio la espalda ---------- */
  crearEventoReputacionBaja: function (state) {
    var p = Under.DATA.escena({ rol: "admin" });
    return Under.CONTEXTO._crear("ctx_reputacion_baja", "La escena te da la espalda", [
      "En los bares de la escena ya no te ofrecen fecha, y el rumor dice que sos complicado.",
      "Un ciclo te saca del cartel sin aviso: " + p.nombre + " no quiere tu nombre pegado al evento.",
      p.nombre + ", que antes te llamaba, ahora no te devuelve los mensajes."
    ], [
      {
        texto: "Enfrentarlo cara a cara",
        desc: "Recuperar la palabra es recuperar el lugar.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_baja");
          if (Math.random() < 0.55) {
            s.reputacion = Under.STATE.clamp(s.reputacion + 8, 0, 100);
            return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 500), _energia: -10 };
          }
          return { _energia: -8, _relaciones: -2 };
        },
        resultado: "Vas a hablar con la gente. A veces alcanza para destrabar; a veces el rencor ya se instaló.",
        log: "Enfrentó cara a cara el rechazo de la escena."
      },
      {
        texto: "Demostrarlo con música",
        desc: "Tu trabajo responde por vos.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_baja");
          s.reputacion = Under.STATE.clamp(s.reputacion + 5, 0, 100);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 300), _energia: -6 };
        },
        resultado: "No hablás: componés. Cuando lo nuevo suena, la escena empieza a olvidar el porqué del enojo.",
        log: "Respondió al rechazo de la escena con música."
      },
      {
        texto: "Soltarlo y seguir",
        desc: "Hay más escenas que la que te cerró la puerta.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_reputacion_baja");
          return { _relaciones: 3, talent: 1 };
        },
        resultado: "No peleás. Cambiás de aire y tu carrera sigue, aunque en ese circuito ya no te esperen.",
        log: "Dejó atrás a una escena que le dio la espalda."
      }
    ]);
  },

  /* ============================================================
     MOMENTUM: la racha abre puertas; el frío las cierra
     ============================================================ */

  /* ---------- En racha ---------- */
  crearEventoMomentumAlto: function (state) {
    return Under.CONTEXTO._crear("ctx_momentum_alto", "Estás en racha", [
      "Todo lo que tocás funciona. La gente ya espera tu próximo movimiento.",
      "Tu nombre está en boca de todos y te llueven propuestas.",
      "El momento te encuentra: los programas te buscan, no al revés."
    ], [
      {
        texto: "Aprovechar el envión",
        desc: "Grabar y publicar mientras el momento te lleva.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_alto");
          s.momentum = Under.STATE.clamp(s.momentum + 5, 0, 100);
          return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _energia: -10, _hype: 5 };
        },
        resultado: "Soltás material mientras el río te lleva. La racha se convierte en ola.",
        log: "Aprovechó la racha para publicar más."
      },
      {
        texto: "Guardar el momento",
        desc: "El silencio también es una declaración.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_alto");
          s.reputacion = Under.STATE.clamp(s.reputacion + 1, 0, 100);
          return { talent: 2, _relaciones: 3 };
        },
        resultado: "No forzás nada. El momento espera y vos llegás cuando el material esté listo.",
        log: "Guardó el momento de racha sin forzar nada."
      },
      {
        texto: "Hacer una pausa pública",
        desc: "Irte en la cima del momento… por un rato.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_alto");
          return { _energia: 10, fans: Under.SYSTEMS.fansEscala(s, 300) };
        },
        resultado: "Anunciás un respiro justo cuando todos esperaban más. La gente lo respeta: lo entendés como nadie.",
        log: "Hizo una pausa pública en plena racha."
      }
    ]);
  },

  /* ---------- Temporada baja ---------- */
  crearEventoMomentumBajo: function (state) {
    return Under.CONTEXTO._crear("ctx_momentum_bajo", "Temporada baja", [
      "Nadie habla de vos hace rato y los programas dejaron de llamarte.",
      "Tu nombre se enfrió: los que antes te escribían ahora responden con demora.",
      "La escena sigue, pero sin vos. El ruido de la temporada tapó tu música."
    ], [
      {
        texto: "Laburar en silencio",
        desc: "El frío también es tiempo de estudio.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_bajo");
          s.momentum = Under.STATE.clamp(s.momentum + 8, 0, 100);
          return { talent: 2, _energia: -5 };
        },
        resultado: "No salís a buscar ruido: grabás. Cuando la temporada cambie, vas a tener material.",
        log: "Usó la temporada baja para laburar en silencio."
      },
      {
        texto: "Volver a las bases",
        desc: "Un toque chico, una radio de barrio, la gente que nunca se fue.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_bajo");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          s.momentum = Under.STATE.clamp(s.momentum + 6, 0, 100);
          return { fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 1, _energia: -8 };
        },
        resultado: "Volvés a donde te conocieron. La base que quedó te recibe y el frío empieza a ceder.",
        log: "Volvió a las bases durante la temporada baja."
      },
      {
        texto: "Aguantar sin hacer nada",
        desc: "Dejarlo pasar también es una decisión.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_momentum_bajo");
          return { _relaciones: 2 };
        },
        resultado: "No forzás el momento. La temporada pasa y tu nombre sigue esperando su verano.",
        log: "Aguantó la temporada baja sin moverse."
      }
    ]);
  },

  /* ============================================================
     LEGADO: lo que hiciste ya se cuenta
     ============================================================ */

  /* ---------- Tu legado se cita ---------- */
  crearEventoLegado: function (state) {
    return Under.CONTEXTO._crear("ctx_legado", "Tu legado se cita", [
      "Un museo de música popular quiere una vitrina con tus primeras cosas.",
      "Un libro de la historia del under local te dedica un capítulo entero.",
      "Un ciclo de documentales quiere registrar tu camiseta, tu estudio y tu historia."
    ], [
      {
        texto: "Prestar tu historia",
        desc: "Que lo que hiciste sirva de referencia.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_legado");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          s.legado = Math.max(0, s.legado + 5);
          return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 2, _relaciones: 4 };
        },
        resultado: "Tu historia queda expuesta para siempre. Los pibes se sacan fotos con tu nombre.",
        log: "Prestó su historia al museo."
      },
      {
        texto: "Ceder solo una pieza",
        desc: "Un recuerdo alcanza para contar quién fuiste.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_legado");
          s.legado = Math.max(0, s.legado + 3);
          return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 1 };
        },
        resultado: "Cedés una guitarra o un cuaderno. A veces una pieza cuenta más que todo el resto.",
        log: "Cedió una pieza de su historia."
      },
      {
        texto: "Guardarlo todo",
        desc: "Tu historia se queda con vos.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_legado");
          return { talent: 1 };
        },
        resultado: "No prestás nada. Tu historia se queda donde creció, y eso también es una decisión.",
        log: "Guardó su historia para sí."
      }
    ]);
  },

  /* ============================================================
     HYPE: el ruido también trabaja
     ============================================================ */

  /* ---------- La prensa no para ---------- */
  crearEventoHype: function (state) {
    return Under.CONTEXTO._crear("ctx_hype", "La prensa no te suelta", [
      "Tu nombre está en la tapa de todos los medios: el ruido es enorme.",
      "Cada publicación tuya se multiplica sola y la prensa pide más.",
      "El momento es tuyo: todos quieren un pedazo de tu historia."
    ], [
      {
        texto: "Gira de prensa",
        desc: "Cansador, pero el momento se riega solo.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_hype");
          s.hype = Under.STATE.clamp(s.hype + 6, 0, 100);
          return { popularity: 4, fans: Under.SYSTEMS.fansEscala(s, 1500), _energia: -15 };
        },
        resultado: "Entrevista tras entrevista. El ruido crece y tu nombre se instala en la agenda.",
        log: "Hizo una gira de prensa en pleno auge."
      },
      {
        texto: "Una sola nota grande",
        desc: "Un relato, bien contado.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_hype");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          return { popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 800), _energia: -6, _hype: 3 };
        },
        resultado: "Elegís una sola revista y contás tu historia completa. La nota queda para siempre.",
        log: "Dio una sola nota grande en pleno auge."
      },
      {
        texto: "Desaparecer del radar",
        desc: "El misterio también es una estrategia.",
        efectos: function (s) {
          Under.CONTEXTO._limpiar("ctx_hype");
          return { talent: 1, _relaciones: 3 };
        },
        resultado: "No das ninguna nota. El silencio genera más preguntas que cualquier entrevista.",
        log: "Desapareció del radar en pleno auge."
      }
    ]);
  }
};
