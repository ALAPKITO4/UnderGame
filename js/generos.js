/* ============================================================
   UNDER — CARRERAS POR GÉNERO (PRIORIDAD 5)
   Cada género no es solo un modificador inicial: es una carrera
   con su propio ADN.

   - El perfil del género modula lo que te sale natural:
       critica   → el respeto artístico (rap/rock son más
                   respetados por la crítica; urban/pop menos).
       comercial → la velocidad para convertir oídos en fans
                   (urban/pop convierten más rápido).
       escena    → cuánto te forma el under: rap/rock aprenden
                   más trabajando la escena y construyen una
                   base más fiel; urban/pop una base más amplia
                   pero más volátil.
   - Con la madurez (experiencia) tu lugar dentro del género
     cambia: de aprendiz a referente.
   - Cada género tiene su momento grande de carrera (eventos
     gen2_*) cuando la escena ya te mira como alguien.

   simple de jugar: el jugador solo ve su género y su etiqueta
   de identidad; el resto vive en los cálculos.
   ============================================================ */

window.Under = window.Under || {};

Under.GENEROS = {

  _pendientes: {},

  _crear: function (id, titulo, textos, opciones) {
    if (Under.GENEROS._pendientes[id]) return Under.GENEROS._pendientes[id];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };
    Under.GENEROS._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.GENEROS._pendientes[id] = null;
  },

  /* ---------- Perfil del género actual ---------- */
  perfil: function (state) {
    var gen = Under.DATA.GENRES[state.artista.genero] || Under.DATA.GENRES.pop;
    return gen.perfil || {};
  },

  /* ---------- Bonus de crítica ----------
     Algunas escenas son más exigentes: la crítica te juzga con
     otra vara según tu género. Se suma al puntaje de crítica. */
  criticaBonus: function (state) {
    return Under.GENEROS.perfil(state).critica || 0;
  },

  /* ---------- Factor comercial ----------
     Cuántos oídos nuevos convierte cada tema. Urban y pop
     convierten más rápido; rap y rock más lento. */
  comercial: function (state) {
    return Under.GENEROS.perfil(state).comercial || 1;
  },

  /* ---------- Factor de escena ----------
     Cuánto te forma el under: rap/rock absorben más de cada
     movimiento bajo tierra. */
  escena: function (state) {
    return Under.GENEROS.perfil(state).escena || 1;
  },

  /* ---------- Fidelidad del género ----------
     La base que construís: las escenas de culto fidelizan más
     y las comerciales se mantienen más frías. */
  fidelidad: function (state) {
    return Under.GENEROS.perfil(state).fidelidad || 1;
  },

  /* ---------- Ingreso por stream del género ----------
     Las escenas fieles pagan mejor por oído: la misma base
     rinde más cuando la relación es de culto. */
  ingreso: function (state) {
    var fid = Under.GENEROS.fidelidad(state);
    return 1 + (fid - 1) * 0.12;
  },

  /* ---------- Identidad dentro del género ----------
     Con la madurez dejás de ser un aprendiz del género. Es una
     etiqueta que se muestra en el dashboard, no una stat. */
  identidad: function (state) {
    var perfil = Under.GENEROS.perfil(state);
    if (state.experiencia >= 90) return { icono: "🏛️", texto: "Referente del " + perfil.afinidad };
    if (state.experiencia >= 60) return { icono: "🎙️", texto: "Voz del " + perfil.afinidad };
    if (state.experiencia >= 30) return { icono: "🌱", texto: "En la " + perfil.afinidad };
    return { icono: "🎧", texto: "Aprendiz del " + perfil.afinidad };
  },

  /* ============================================================
     SEGUNDA VUELTA POR GÉNERO (año 5+)
     El momento en que la escena ya no te ve como promesa:
     cada género tiene su gran movimiento.
     ============================================================ */

  /* ---------- Rap: la escena te corona ---------- */
  crearEventoGeneroRap2: function (state) {
    return Under.GENEROS._crear("gen2_rap", "La escena te corona", [
      "Arman una fecha homenaje al rap de tu ciudad y te dan el puesto central.",
      "Los veteranos que antes te bardearon ahora te citan en un álbum conjunto de la escena.",
      "Una batalla de leyendas termina con todos los micrófonos entregados a vos."
    ], [
      {
        texto: "Ser el anfitrión de la fecha",
        desc: "Tu nombre encabeza el cartel de la escena.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rap");
          s.reputacion = Under.STATE.clamp(s.reputacion + 4, 0, 100);
          return { money: Under.SYSTEMS.efectivoEscala(s, 400), fans: Under.SYSTEMS.fansEscala(s, 2500), popularity: 4, _energia: -12, _legado: 3 };
        },
        resultado: "La fecha es histórica. Los veteranos te ceden el escenario: la escena tiene nuevo referente.",
        log: "Fue anfitrión de la fecha que coronó su generación."
      },
      {
        texto: "Entregar un tema-manifiesto",
        desc: "Las palabras también son un hito.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rap");
          s.reputacion = Under.STATE.clamp(s.reputacion + 5, 0, 100);
          s.legado = Math.max(0, s.legado + 4);
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 3, talent: 2, _energia: -8 };
        },
        resultado: "Tu tema-manifiesto recorre la escena. Lo recitan de memoria: te convertiste en la voz de una generación.",
        log: "Entregó un tema-manifiesto para su escena."
      },
      {
        texto: "Seguir tu camino",
        desc: "El trono de la escena no es tu meta.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rap");
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 500) };
        },
        resultado: "Dejás que la fecha pase sin vos. La escena corona a otro, y tu nombre sigue creciendo en silencio.",
        log: "Dejó pasar la coronación de la escena."
      }
    ]);
  },

  /* ---------- Rock: tu sonido se vuelve referencia ---------- */
  crearEventoGeneroRock2: function (state) {
    return Under.GENEROS._crear("gen2_rock", "Tu sonido se vuelve referencia", [
      "Bandas nuevas de tu ciudad versionan tus temas en cada club.",
      "Un ciclo de música en vivo arma una noche entera tocando tu repertorio.",
      "Un fanzine especial de rock te dedica una edición completa como influencia."
    ], [
      {
        texto: "Abrir la noche de versiones",
        desc: "Tocás con las bandas que te homenajean.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rock");
          s.reputacion = Under.STATE.clamp(s.reputacion + 4, 0, 100);
          return { money: Under.SYSTEMS.efectivoEscala(s, 300), fans: Under.SYSTEMS.fansEscala(s, 2000), popularity: 3, _energia: -12, _legado: 3 };
        },
        resultado: "Compartís escenario con bandas que crecieron escuchándote. Tu nombre ya es parte del ADN del rock local.",
        log: "Abró la noche de versiones de sus influenciados."
      },
      {
        texto: "Grabar una versión con todas las bandas",
        desc: "Una grabación conjunta que queda para siempre.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rock");
          s.reputacion = Under.STATE.clamp(s.reputacion + 5, 0, 100);
          s.legado = Math.max(0, s.legado + 5);
          return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 2, talent: 2, money: -Under.SYSTEMS.efectivoEscala(s, 200) };
        },
        resultado: "La grabación queda como un documento de la escena. Las bandas cuentan con orgullo que tocaron con vos.",
        log: "Grabó una versión conjunta con las bandas que lo homenajean."
      },
      {
        texto: "No participar",
        desc: "Tu música ya habla por sí sola.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_rock");
          return { talent: 1 };
        },
        resultado: "No vas. La noche se hace igual y tu influencia se siente aunque no estés.",
        log: "No participó de la noche de versiones."
      }
    ]);
  },

  /* ---------- Pop: el mainstream te reclama ---------- */
  crearEventoGeneroPop2: function (state) {
    return Under.GENEROS._crear("gen2_pop", "El mainstream te reclama", [
      "La radio grande de tu país quiere tu tema en rotación pesada toda la temporada.",
      "Una productora de un megashow te ofrece un puesto en su lineup principal.",
      "Una marca global te ofrece ser la cara de su campaña del verano."
    ], [
      {
        texto: "Aceptar el trato grande",
        desc: "Exposición total, aunque tu imagen quede un poco más manejada.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_pop");
          s.reputacion = Under.STATE.clamp(s.reputacion + 2, 0, 100);
          return { money: Under.SYSTEMS.dineroEscala(s, 3000), fans: Under.SYSTEMS.fansEscala(s, 8000), popularity: 6, _energia: -10 };
        },
        resultado: "Tu tema no sale del aire y tu cara está en todas partes. El mainstream ya no es un sueño: es tu casa.",
        log: "Aceptó el gran trato del mainstream."
      },
      {
        texto: "Aceptar a medias",
        desc: "La exposición, sin entregar tu imagen del todo.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_pop");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          return { money: Under.SYSTEMS.dineroEscala(s, 1500), fans: Under.SYSTEMS.fansEscala(s, 4000), popularity: 4, talent: 1 };
        },
        resultado: "Negociás hasta el último detalle. Entrás al circuito grande sin perder el control de tu imagen.",
        log: "Aceptó a medias el trato del mainstream."
      },
      {
        texto: "Rechazar",
        desc: "Tu música no se entrega a la rotación.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_pop");
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 500) };
        },
        resultado: "Decís que no. El mainstream busca a otro, pero tu criterio queda intacto.",
        log: "Rechazó el gran trato del mainstream."
      }
    ]);
  },

  /* ---------- Urban: el continente baila ---------- */
  crearEventoGeneroUrban2: function (state) {
    return Under.GENEROS._crear("gen2_urban", "El continente baila", [
      "Una sesión urbana internacional arma un tema con los grandes del momento y quieren tu parte.",
      "Una fecha de playa te reserva el escenario principal para la noche de cierre.",
      "Drokerr, de Family Racks, quiere construir un tema completo alrededor de tu voz para el continente."
    ], [
      {
        texto: "Entrar a la sesión internacional",
        desc: "Su audiencia te adopta de una noche para la otra.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_urban");
          s.reputacion = Under.STATE.clamp(s.reputacion + 2, 0, 100);
          return { money: Under.SYSTEMS.dineroEscala(s, 2500), fans: Under.SYSTEMS.fansEscala(s, 10000), popularity: 7, _energia: -12, _legado: 3 };
        },
        resultado: "La sesión explota y tu parte queda en boca de medio continente. Tu nombre ya cruza fronteras.",
        log: "Entró a la sesión urbana internacional."
      },
      {
        texto: "Llevar tu propia sesión",
        desc: "El continente entra a tu casa.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_urban");
          s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
          s.legado = Math.max(0, s.legado + 4);
          return { money: Under.SYSTEMS.dineroEscala(s, 1200), fans: Under.SYSTEMS.fansEscala(s, 5000), popularity: 5, talent: 2 };
        },
        resultado: "Armás tu propia sesión con tu gente y tu sonido. El continente la mira y te sigue a vos, no a otro.",
        log: "Organizó su propia sesión urbana."
      },
      {
        texto: "Declinar",
        desc: "El momento internacional todavía no.",
        efectos: function (s) {
          Under.GENEROS._limpiar("gen2_urban");
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 1 };
        },
        resultado: "Dejás pasar la ola. La sesión sale sin vos, y el momento se lo lleva otro.",
        log: "Declinó la sesión urbana internacional."
      }
    ]);
  }
};
