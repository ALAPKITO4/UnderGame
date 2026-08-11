/* ============================================================
   UNDER — SISTEMA DE ESCÁNDALOS (FASE 4)
   Crisis de imagen que escalan con el nivel de carrera.
   Cómo respondés define cuánto te duele y cómo te recuerdan.
   ============================================================ */

window.Under = window.Under || {};

Under.ESCANDALOS = {

  _pendiente: null,

  /* Elige un escándalo según el nivel (ponderado por peso) */
  _elegirNivel: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var pool = [];
    var keys = Object.keys(Under.DATA.ESCANDALOS);
    for (var i = 0; i < keys.length; i++) {
      var def = Under.DATA.ESCANDALOS[keys[i]];
      if (def.nivelMin > nivel) continue;
      for (var w = 0; w < def.peso; w++) pool.push(def);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* Aplica el daño del escándalo y lo registra */
  _aplicar: function (s, def, resolucion, mult, costo, energia) {
    var prensaMult = (Under.EQUIPO && Under.EQUIPO.tiene(s, "prensa")) ? 0.6 : 1;
    var danoPop = Math.round(def.popularidad * mult * prensaMult);
    var danoFans = Math.round(def.fans * mult * prensaMult);

    s.escandalos.push({
      año: s.año, id: def.id, nombre: def.nombre, gravedad: def.gravedad, resolucion: resolucion
    });
    s.totalEscandalos += 1;
    s.flags.escandaloEsteAnio = true;
    s.flags.tuvoEscandalo = true;

    Under.ESCANDALOS._pendiente = null;

    return {
      popularity: danoPop,
      fans: danoFans,
      money: -costo,
      _energia: energia,
      _escalo: mult >= 1.2
    };
  },

  crearEventoEscandalo: function (state) {
    if (Under.ESCANDALOS._pendiente) return Under.ESCANDALOS._pendiente;

    var def = Under.ESCANDALOS._elegirNivel(state);
    if (!def) return null;
    var texto = def.textos[Under.STATE.randInt(0, def.textos.length - 1)];

    var opciones = [
      {
        texto: "Pedir disculpas públicamente",
        desc: "Cuesta plata en PR, pero calma las aguas.",
        efectos: function (s) {
          return Under.ESCANDALOS._aplicar(s, def, "disculpas", 0.5, Under.SYSTEMS.efectivoEscala(s, 500), -10);
        },
        resultado: "Publicás un comunicado honesto. Duele, pero la gente valora el gesto.\n\nEl escándalo pierde fuerza rápido.",
        log: "Enfrentó el escándalo pidiendo disculpas."
      },
      {
        texto: "Negarlo y defenderte",
        desc: "Un riesgo: puede apagarse… o avivarse.",
        efectos: function (s) {
          var mult = Math.random() < 0.5 ? 0.4 : 1.5;
          return Under.ESCANDALOS._aplicar(s, def, "negación", mult, 0, -15);
        },
        resultado: function (s, efectos) {
          if (efectos._escalo) {
            return "Lo negás con furia. La mitad del público se olvida… y la otra mitad lo agranda. Las redes prenden fuego.";
          }
          return "Lo negás y por suerte la gente pasa de página. En una semana nadie lo menciona.";
        },
        log: "Negó el escándalo y se defendió."
      },
      {
        texto: "Silencio y perfil bajo",
        desc: "No alimentar la polémica. El daño queda igual.",
        efectos: function (s) {
          return Under.ESCANDALOS._aplicar(s, def, "silencio", 0.8, 0, -5);
        },
        resultado: "No decís nada y desaparecés un tiempo. La polémica se enfría, pero el daño ya está hecho.",
        log: "Enfrentó el escándalo con silencio."
      }
    ];

    /* Con jefe de prensa, aparece la opción profesional */
    if (Under.EQUIPO && Under.EQUIPO.tiene(state, "prensa")) {
      opciones.unshift({
        texto: "Dejarlo en manos de tu equipo de prensa",
        desc: "Profesionales que ya manejaron esto antes.",
        efectos: function (s) {
          return Under.ESCANDALOS._aplicar(s, def, "equipo de prensa", 0.25, Under.SYSTEMS.efectivoEscala(s, 300), -5);
        },
        resultado: "Tu jefe de prensa toma el control: comunicado medido, silencio estratégico, notas positivas.\n\nEn un mes el escándalo es un pie de página.",
        log: "Dejó el escándalo en manos de su equipo."
      });
    }

    var ev = {
      id: "escandalo",
      recurrente: true,
      importante: true,
      titulo: "Escándalo: " + def.nombre,
      texto: texto + "\n\n¿Cómo lo manejás?",
      opciones: opciones
    };

    Under.ESCANDALOS._pendiente = ev;
    return ev;
  }
};
