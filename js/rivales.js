/* ============================================================
   UNDER — RIVALIDAD PERSISTENTE (GRAN ACTUALIZACIÓN)
   Un rival aparece en tu escena y NO se olvida de vos: te
   bardeá en redes, cruza diss tracks, puede reconciliarse y
   hasta terminar en una colaboración. El beef sube y baja con
   tus decisiones y se enfría con los años.

   Es un hilo narrativo largo: cada encuentro queda registrado
   en el rival (historial) y reaparece con memoria. Hasta que
   no se reconcilia (o el fuego se apaga del todo), sigue
   entrando al pozo de eventos.

   Cada rival vive en state.rivales y se referencia por id.
   ============================================================ */

window.Under = window.Under || {};

Under.RIVALES = {

  _pendientes: {},

  _limpiar: function (id) {
    Under.RIVALES._pendientes[id] = null;
  },

  /* Rival con beef en curso (y que ya fue presentado) */
  _activo: function (state) {
    if (!state.rivales) return null;
    for (var i = 0; i < state.rivales.length; i++) {
      var r = state.rivales[i];
      if (r.activo && !r.reconciliado && !r.pendienteNuevo) return r;
    }
    return null;
  },

  /* Rival reconciliado que todavía no colaboró con vos */
  _reconciliadoSinColab: function (state) {
    if (!state.rivales) return null;
    for (var i = 0; i < state.rivales.length; i++) {
      var r = state.rivales[i];
      if (r.reconciliado && !r.colabo) return r;
    }
    return null;
  },

  _anotar: function (state, r, tipo, texto) {
    if (!r.historial) r.historial = [];
    r.historial.push({ año: state.año, tipo: tipo, texto: texto });
    r.ultimaAparicion = state.año;
  },

  /* Crea un rival nuevo: nombre único de la escena, género y beef inicial */
  _generar: function (state, num) {
    var usados = {};
    (state.rivales || []).forEach(function (r) { usados[r.nombre] = true; });
    var pool = Under.DATA.RIVAL_NAMES.filter(function (n) { return !usados[n.nombre]; });
    var n = pool[Under.STATE.randInt(0, pool.length - 1)];
    var gens = Object.keys(Under.DATA.GENRES);
    var genero = gens[Under.STATE.randInt(0, gens.length - 1)];
    return {
      id: "rival_" + num,
      nombre: n.nombre,
      apodo: n.apodo,
      genero: genero,
      beef: 30,
      reconciliado: false,
      colabo: false,
      activo: true,
      anioPresentacion: state.año,
      ultimaAparicion: state.año,
      historial: []
    };
  },

  /* ---------- Un rival aparece (presentación) ---------- */
  crearEventoNuevo: function (state) {
    if (Under.RIVALES._pendientes["rival_nuevo"]) return Under.RIVALES._pendientes["rival_nuevo"];

    /* Si ya hay un rival generado esperando la decisión (por una
       recarga a mitad del evento), se reutiliza para no duplicar. */
    var r = null;
    for (var i = 0; i < (state.rivales || []).length; i++) {
      if (state.rivales[i].pendienteNuevo) { r = state.rivales[i]; break; }
    }
    if (!r) {
      r = Under.RIVALES._generar(state, (state.rivales || []).length + 1);
      r.pendienteNuevo = true;
      state.rivales.push(r);
    }

    var textos = [
      "Un artista de otra zona de la ciudad está armando su nombre. En su última nota te mencionó dos veces: te comparó con él y no para bien.",
      "Un MC de la escena dice en un programa que tu último tema 'es un clon de lo que él ya hizo'. La gente empieza a elegir bando.",
      "Un cantante nuevo de tu ciudad te bardeó en una historia y sus seguidores te llenaron los comentarios."
    ];

    var ev = {
      id: "rival_nuevo",
      recurrente: true,
      importante: true,
      titulo: "Un rival aparece: " + r.nombre,
      texto: textos[Under.STATE.randInt(0, textos.length - 1)] +
        "\n\nSu nombre ya empieza a sonar, y ahora el tuyo suena pegado al suyo.\n\n¿Cómo respondés?",
      opciones: [
        {
          texto: "Responder con una diss track",
          desc: "Le contestás con un tema. El fuego arranca fuerte.",
          efectos: function (s) {
            Under.RIVALES._limpiar("rival_nuevo");
            r.pendienteNuevo = false;
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef + 25, 0, 100);
            Under.RIVALES._anotar(s, r, "presentacion", "Le respondió con una diss track.");
            return { popularity: 3, talent: 1, fans: Under.SYSTEMS.fansEscala(s, 500), _energia: -8 };
          },
          resultado: "El tema sale y la escena elige bando. Ya no sos 'el nuevo': sos el que tiene guerra.",
          log: "Se enemistó con " + r.nombre + " con una diss track."
        },
        {
          texto: "Responder con altura",
          desc: "Le contestás en serio, sin bajar el nivel.",
          efectos: function (s) {
            Under.RIVALES._limpiar("rival_nuevo");
            r.pendienteNuevo = false;
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef + 5, 0, 100);
            Under.RIVALES._anotar(s, r, "presentacion", "Respondió con altura a la provocación.");
            return { popularity: 2 };
          },
          resultado: "Respondés con una frase medida. Hasta él tiene que admitir que quedaste bien.",
          log: "Respondió con altura a " + r.nombre + "."
        },
        {
          texto: "Ignorarlo",
          desc: "El ruido se apaga solo. O no.",
          efectos: function (s) {
            Under.RIVALES._limpiar("rival_nuevo");
            r.pendienteNuevo = false;
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef - 10, 0, 100);
            Under.RIVALES._anotar(s, r, "presentacion", "Ignoró la provocación.");
            return { popularity: -1 };
          },
          resultado: "No le das pelota. Él lo cuenta como una victoria, y un poco lo es.",
          log: "Ignoró la provocación de " + r.nombre + "."
        }
      ]
    };

    Under.RIVALES._pendientes["rival_nuevo"] = ev;
    return ev;
  },

  /* ---------- El duelo (beef alto, escalada) ---------- */
  crearEventoDuelo: function (state) {
    var r = Under.RIVALES._activo(state);
    if (!r) return null;
    var id = "rival_duelo:" + r.id;
    if (Under.RIVALES._pendientes[id]) return Under.RIVALES._pendientes[id];

    var textos = [
      r.nombre + " sacó una diss que se está compartiendo. La gente espera tu respuesta.",
      "Te cruzaste con " + r.nombre + " en una radio. Se agarraron en vivo y el audio ya circula.",
      r.nombre + " se burló de tu último video en su programa y sus seguidores te invadieron."
    ];

    var ev = {
      id: "rival_duelo",
      recurrente: true,
      importante: true,
      titulo: "La guerra con " + r.nombre,
      texto: textos[Under.STATE.randInt(0, textos.length - 1)] +
        "\n\nTu rival subió el nivel. Si no respondés, el beef se enfría; si respondés, puede explotar en las dos direcciones.\n\n¿Qué hacés?",
      opciones: [
        {
          texto: "Subir la apuesta con un tema",
          desc: "Otra diss, más filosa. Todo o nada.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef + 20, 0, 100);
            Under.RIVALES._anotar(s, r, "duelo", "Subió la apuesta con una diss track.");
            if (Math.random() < 0.5) {
              return { talent: 2, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 900), _energia: -10 };
            }
            return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -10 };
          },
          resultado: "Respondés con un tema cargado. La escena se divide: unos te aplauden, otros te descartan.",
          log: "Subió la apuesta en el duelo con " + r.nombre + "."
        },
        {
          texto: "Buscar la paz en vivo",
          desc: "Un gesto público para bajar el fuego.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef - 30, 0, 100);
            Under.RIVALES._anotar(s, r, "duelo", "Intentó bajar la tensión en público.");
            return { popularity: 1 };
          },
          resultado: "Le tendés la mano en un evento. El gesto se ve, aunque el fuego sigue humeando.",
          log: "Intentó hacer las paces con " + r.nombre + "."
        },
        {
          texto: "Dejarlo pasar",
          desc: "No le das pelota. El beef se enfría.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef - 10, 0, 100);
            Under.RIVALES._anotar(s, r, "duelo", "Ignoró la provocación de su rival.");
            return {};
          },
          resultado: "No respondés. La ola pasa y el duelo queda a medias.",
          log: "No le respondió a " + r.nombre + "."
        }
      ]
    };

    Under.RIVALES._pendientes[id] = ev;
    return ev;
  },

  /* ---------- La reconciliación ---------- */
  crearEventoReconciliar: function (state) {
    var r = Under.RIVALES._activo(state);
    if (!r) return null;
    var id = "rival_reconciliar:" + r.id;
    if (Under.RIVALES._pendientes[id]) return Under.RIVALES._pendientes[id];

    var textos = [
      "Después de meses de fuego, " + r.nombre + " te manda un mensaje privado: '¿Le damos un corte a esto? La escena se está cansando'.",
      "Un productor común los junta en un estudio y los deja solos en la sala. El silencio es pesado.",
      "En un evento, " + r.nombre + " se acerca y te ofrece la mano delante de todos."
    ];

    var ev = {
      id: "rival_reconciliar",
      recurrente: true,
      importante: true,
      titulo: "Tender la mano a " + r.nombre,
      texto: textos[Under.STATE.randInt(0, textos.length - 1)] +
        "\n\nEnterrar el hacha puede abrir una puerta… o es una trampa. ¿Qué hacés?",
      opciones: [
        {
          texto: "Aceptar la reconciliación",
          desc: "Bajan las armas y la escena respira.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = 0;
            r.reconciliado = true;
            Under.RIVALES._anotar(s, r, "reconciliacion", "Enterraron el hacha.");
            return { _relaciones: 5, popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 300) };
          },
          resultado: "Aceptás. La noticia corre por la escena y hasta los que elegían bando se relajan. Ahora hay una puerta abierta.",
          log: "Se reconcilió con " + r.nombre + "."
        },
        {
          texto: "Pedirle un gesto primero",
          desc: "Que él demuestre que va en serio.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = Under.STATE.clamp(r.beef - 10, 0, 100);
            Under.RIVALES._anotar(s, r, "reconciliacion", "Le pidió un gesto antes de aceptar.");
            return { popularity: 1 };
          },
          resultado: "Le pedís algo concreto. El lo piensa, pero el gesto queda en el aire por ahora.",
          log: "Puso condiciones para reconciliarse con " + r.nombre + "."
        },
        {
          texto: "Rechazar: la guerra sigue",
          desc: "No olvidás tan fácil.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.beef = 100;
            Under.RIVALES._anotar(s, r, "reconciliacion", "Rechazó la mano tendida. El fuego quedó al máximo.");
            return { popularity: 2, _relaciones: -3 };
          },
          resultado: "Le soltás la mano y le das la espalda. La escena se entera: la guerra sigue, y más fuerte.",
          log: "Rechazó la reconciliación con " + r.nombre + "."
        }
      ]
    };

    Under.RIVALES._pendientes[id] = ev;
    return ev;
  },

  /* ---------- La colaboración con el ex rival ---------- */
  crearEventoColab: function (state) {
    var r = Under.RIVALES._reconciliadoSinColab(state);
    if (!r) return null;
    var id = "rival_colab:" + r.id;
    if (Under.RIVALES._pendientes[id]) return Under.RIVALES._pendientes[id];

    var textos = [
      "Tu ex rival " + r.nombre + " te propone grabar un tema juntos 'para la historia'.",
      r.nombre + " te manda una demo pensada para sus dos voces. El tema tiene fuego.",
      "Un productor les ofrece una sesión conjunta a vos y a " + r.nombre + ", tu viejo enemigo."
    ];

    var ev = {
      id: "rival_colab",
      recurrente: true,
      importante: true,
      titulo: "Colaborar con " + r.nombre,
      texto: textos[Under.STATE.randInt(0, textos.length - 1)] +
        "\n\nLo que antes era una guerra ahora puede ser un temazo. ¿Lo hacés?",
      opciones: [
        {
          texto: "Grabar el tema juntos",
          desc: "La historia completa: enemigos a colaboradores.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.colabo = true;
            Under.RIVALES._anotar(s, r, "colab", "Grabó un tema juntos.");
            s.totalColabs += 1;
            s.colaboraciones.push({
              partner: r.nombre,
              nombre: "Paz y guerra (feat. " + r.nombre + ")",
              tier: "exito",
              año: s.año,
              repros: Under.SYSTEMS.fansEscala(s, 40000),
              retencion: 0.5
            });
            return { money: Under.SYSTEMS.dineroEscala(s, 500), fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4, _relaciones: 5, _legado: 1, _energia: -8 };
          },
          resultado: "El tema sale y rompe: los que elegían bando ahora cantan los dos nombres juntos. La historia se cierra como se debe.",
          log: "Colaboró con su ex rival " + r.nombre + "."
        },
        {
          texto: "Solo un feat en vivo",
          desc: "Sin grabarlo: un momento, no un producto.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            r.colabo = true;
            Under.RIVALES._anotar(s, r, "colab", "Compartieron escenario una vez.");
            return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _relaciones: 3 };
          },
          resultado: "Comparten escenario una noche. La gente lo filma todo, pero el momento queda solo en eso.",
          log: "Compartió escenario con su ex rival " + r.nombre + "."
        },
        {
          texto: "No mezclar la música con el pasado",
          desc: "Paz, pero cada uno con lo suyo.",
          efectos: function (s) {
            Under.RIVALES._limpiar(id);
            s.flags.rivalEsteAnio = true;
            Under.RIVALES._anotar(s, r, "colab", "Declinó grabar con su ex rival.");
            return { talent: 1 };
          },
          resultado: "Le decís que no con respeto. La paz queda, pero la historia no se cierra con un temazo.",
          log: "Declinó colaborar con " + r.nombre + "."
        }
      ]
    };

    Under.RIVALES._pendientes[id] = ev;
    return ev;
  }
};
