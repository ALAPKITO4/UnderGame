/* ============================================================
   UNDER — SISTEMA DE PREMIOS (FASE 3 + GRAN ACTUALIZACIÓN)
   Ser nominado y ganar son cosas distintas: podés ir a la
   ceremonia y volver con las manos vacías. Cuanto más
   popularidad, más chances de llevártelo.

   ganado: true → el popup usa una animación dorada especial.
   ganado: false → la nominación quedó en nada (o no fuiste).
   ============================================================ */

window.Under = window.Under || {};

Under.PREMIOS = {

  _pendiente: null,

  _elegibles: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    return Under.DATA.PREMIOS.filter(function (p) {
      if (nivel < p.nivelMin || state.año < p.añoMin) return false;
      return !state.nominaciones.some(function (x) { return x.id === p.id; });
    });
  },

  hayElegible: function (state) {
    return Under.PREMIOS._elegibles(state).length > 0;
  },

  _elegirPremio: function (state) {
    var lista = Under.PREMIOS._elegibles(state);
    lista.sort(function (a, b) { return (b.nivelMin - a.nivelMin) || (b.premio - a.premio); });
    return lista[0] || null;
  },

  /* Probabilidad de ganar: arranca baja y crece con la
     popularidad. Asistir suma un poco de ventaja. Nunca es
     un pase libre: incluso arriba, la categoría puede jugarte
     en contra. */
  _probabilidadGanar: function (state, asistio) {
    var prob = 0.42 + state.stats.popularity / 170;
    if (asistio) prob += 0.07;
    return Under.STATE.clamp(prob, 0.3, 0.88);
  },

  _registrarNominacion: function (s, premio, ganado) {
    s.nominaciones.push({ año: s.año, id: premio.id, nombre: premio.nombre, ganado: ganado });
    s.flags.premioEsteAnio = true;
  },

  _ganar: function (s, premio, money, fans) {
    s.premios.push({ año: s.año, id: premio.id, nombre: premio.nombre, premio: money });
    s.totalPremios += 1;
    if (premio.id === "global") s.flags.tuvoPremioMayor = true;
    /* Ganar un premio enciende el hype: el nombre suena en todos lados. */
    return { money: money, fans: fans, popularity: premio.popularidad, _hype: 8 };
  },

  _crearResultado: function (s, premio, ganado, money, fans, asistio) {
    Under.PREMIOS._registrarNominacion(s, premio, ganado);
    if (!ganado) {
      return {
        _premio: { ganado: false, nombre: premio.nombre },
        texto: "La noche se alarga y, cuando anuncian la categoría, el nombre que suena no es el tuyo.\n\nTe felicitan, te sacan una foto de consuelo y prometés volver. La nominación ya es un paso: la industria te anotó.",
        log: "Fue nominado a " + premio.nombre + " pero no lo ganó."
      };
    }
    var ef = Under.PREMIOS._ganar(s, premio, money, fans);
    ef._premio = { ganado: true, nombre: premio.nombre };
    ef._log = "Ganó " + premio.nombre + (asistio ? "." : " sin asistir a la ceremonia.");
    return ef;
  },

  crearEventoPremio: function (state) {
    if (Under.PREMIOS._pendiente) return Under.PREMIOS._pendiente;

    var premio = Under.PREMIOS._elegirPremio(state);
    if (!premio) return null;

    var opciones = [];

    opciones.push({
      texto: "Asistir a la ceremonia",
      desc: "Te jugás la noche: podés volver con el premio… o sin él.",
      efectos: function (s) {
        Under.PREMIOS._pendiente = null;
        /* Hook de test: fuerzo una derrota determinista para
           cubrir el camino "nominado y no ganó" en el smoke test. */
        var forzarDerrota = Under.PREMIOS._forzarDerrota &&
          Under.PREMIOS._contadorNominaciones === Under.PREMIOS._forzarDerrota;
        var ganado = forzarDerrota ? false : Math.random() < Under.PREMIOS._probabilidadGanar(s, true);
        Under.PREMIOS._contadorNominaciones = (Under.PREMIOS._contadorNominaciones || 0) + 1;
        var res = Under.PREMIOS._crearResultado(s, premio, ganado, premio.premio, premio.fans, true);
        if (ganado) {
          res.resultado = "Viajás, te sentás en la fila de nominados y aguantás la respiración.\n\nCuando anuncian tu nombre, la sala estalla.\n\nGanás " + premio.nombre + ".";
        }
        return res;
      },
      resultado: function (s, efectos) {
        if (efectos._premio && efectos._premio.ganado) {
          return "Viajás, te sentás en la fila de nominados y aguantás la respiración.\n\nCuando anuncian tu nombre, la sala estalla. En la mesa de la escena, " + Under.DATA.escena({ grupo: "family racks" }).nombre + " y " + Under.DATA.publico(1) + " aplauden de pie.\n\nGanás " + premio.nombre + ".";
        }
        return "La noche se alarga y, cuando anuncian la categoría, el nombre que suena no es el tuyo.\n\nTe felicitan, te sacan una foto de consuelo y prometés volver. La nominación ya es un paso: la industria te anotó.";
      },
      log: function (s, efectos) {
        return efectos._premio && efectos._premio.ganado
          ? "Ganó " + premio.nombre + "."
          : "Fue nominado a " + premio.nombre + " pero no lo ganó.";
      }
    });

    opciones.push({
      texto: "Agradecer a distancia",
      desc: "No viajás. Si lo ganás, lo recibís con un video.",
      efectos: function (s) {
        Under.PREMIOS._pendiente = null;
        var ganado = Math.random() < Under.PREMIOS._probabilidadGanar(s, false);
        var res = Under.PREMIOS._crearResultado(s, premio, ganado, Math.round(premio.premio * 0.5), Math.round(premio.fans * 0.6), false);
        return res;
      },
      resultado: function (s, efectos) {
        if (efectos._premio && efectos._premio.ganado) {
          return "No viajás a la ceremonia, pero el premio es tuyo.\n\nAgradecés con un video grabado desde tu estudio.";
        }
        return "No viajás y no ganás. A los pocos días, la ceremonia ya es historia y tu nombre apenas se menciona.";
      },
      log: function (s, efectos) {
        return efectos._premio && efectos._premio.ganado
          ? "Ganó " + premio.nombre + " sin asistir."
          : "No asistió y no ganó " + premio.nombre + ".";
      }
    });

    opciones.push({
      texto: "No presentarte",
      desc: "Los premios no son lo tuyo.",
      efectos: function (s) {
        Under.PREMIOS._registrarNominacion(s, premio, false);
        Under.PREMIOS._pendiente = null;
        return { popularity: -2, _premio: { ganado: false, nombre: premio.nombre } };
      },
      log: "No asistió a la entrega de " + premio.nombre + ".",
      resultado: "No te presentás. El premio lo levanta otra persona y la industria anota tu ausencia."
    });

    var ev = {
      id: "premio",
      recurrente: true,
      importante: true,
      titulo: "Nominación a " + premio.nombre,
      texto: "Te nominan a " + premio.nombre + ".\n\nLa ceremonia es en unos meses y tu agenda está llena.\n\nGanar no está asegurado: la categoría está dura.\n\n¿Qué hacés?",
      opciones: opciones
    };

    Under.PREMIOS._pendiente = ev;
    return ev;
  }
};
