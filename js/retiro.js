/* ============================================================
   UNDER — SISTEMA DE RETIRO Y FINALES (FASE 4 + FINALES 2.0)
   El final de la carrera depende del perfil completo: nivel,
   plata, energía, vida personal, inversiones, crisis, escándalos,
   giras y catálogo. Cada final tiene un grado (legendario,
   dorado, propio, trágico o discreto) que la pantalla final
   muestra como un banner.

   simple de jugar: un título y un relato al terminar.
   profundo por dentro: hay más de veinte finales distintos y
   cada uno refleja una forma real de vivir la carrera.
   ============================================================ */

window.Under = window.Under || {};

Under.RETIRO = {

  /* Galería de finales: cada tipo con su ícono y nombre corto.
     Se usa en la pantalla de inicio para mostrar cuántos finales
     descubriste jugando (persiste entre partidas). */
  FINALES_INDEX: {
    retiro_mito:     { icono: "🌟", titulo: "Se fue como mito" },
    retiro_cima:     { icono: "👑", titulo: "Retiro en la cima" },
    retiro_dorado:   { icono: "🥇", titulo: "Retiro dorado" },
    retiro_vida:     { icono: "🌅", titulo: "Se fue a vivir" },
    retiro_temprano: { icono: "🛬", titulo: "Retiro temprano" },
    retiro_corto:    { icono: "🕊️", titulo: "Carrera corta" },
    burnout:         { icono: "🕯️", titulo: "Se apagó" },
    quiebra:         { icono: "💸", titulo: "Bancarrota" },
    cancelado:       { icono: "🚫", titulo: "Cancelado por la escena" },
    fantasma:        { icono: "👻", titulo: "El fantasma del under" },
    mito:            { icono: "🌟", titulo: "Mito vivo" },
    leyenda:         { icono: "🌍", titulo: "Fama mundial" },
    legado:          { icono: "👑", titulo: "Leyenda de la industria" },
    imperio:         { icono: "🏙️", titulo: "Empresario de la música" },
    familia:         { icono: "👨‍👩‍👧‍👦", titulo: "Fama y familia" },
    renacer:         { icono: "🌄", titulo: "El resurgido" },
    estrella:        { icono: "⭐", titulo: "Estrella" },
    sabio:           { icono: "🧙", titulo: "El sabio del sonido" },
    navegante:       { icono: "🧭", titulo: "Ciudadano del mundo" },
    maquina:         { icono: "⚙️", titulo: "Máquina de hits" },
    relevante:       { icono: "🎙️", titulo: "Artista relevante" },
    nacional:        { icono: "🏛️", titulo: "Estrella nacional" },
    supero_quiebra:  { icono: "🧯", titulo: "Sobrevivió a la quiebra" },
    escuela:         { icono: "🎓", titulo: "El maestro" },
    culto:           { icono: "🕯️", titulo: "Artista de culto" },
    underground:     { icono: "🎤", titulo: "Leyenda del under" },
    discreta:        { icono: "🎵", titulo: "Carrera discreta" }
  },

  /* Construye el resultado de un final.
     tipo: id estable (los logros lo usan)
     grado: legendario | dorado | propio | tragico | discreto
     icono: emoji del banner */
  _final: function (tipo, grado, icono, titulo, historia, nivel) {
    return { titulo: titulo, historia: historia, nivel: nivel, tipo: tipo, grado: grado, icono: icono };
  },

  /* Calcula el final según el perfil de la carrera.
     opts.retiro = true → retiro temprano (decisión del jugador). */
  calcularFinal: function (state, opts) {
    opts = opts || {};
    var s = state;
    var nivel = Under.STATE.nivelCarrera(s).nivel;
    var talento = s.stats.talent;
    var energia = s.energia;
    var vida = s.relaciones;
    var money = s.stats.money;
    var legado = s.legado || 0;
    var contadores = s.contadores || {};

    /* ---------- Retiro temprano: el jugador elige su final ---------- */
    if (opts.retiro) {
      if (nivel >= 8 && legado >= 70) {
        return this._final("retiro_mito", "legendario", "🌟", "SE FUE COMO MITO",
          "El mundo entero te escuchaba y elegiste irte cuando tu nombre ya era historia.\n\nDicen que los genios se van antes. Vos te fuiste siendo inmortal.", nivel);
      }
      if (nivel >= 7) {
        return this._final("retiro_cima", "legendario", "👑", "SE RETIRÓ EN LA CIMA",
          "El mundo entero te escuchaba y elegiste irte cuando tu nombre valía más que nunca.\n\nDicen que los genios se van antes. Vos decidiste el cuándo.", nivel);
      }
      if (nivel >= 5 && money >= 30000) {
        return this._final("retiro_dorado", "dorado", "🥇", "RETIRO DORADO",
          "Dejaste la música con plata, prestigio y el respeto de la industria.\n\nNadie dice que llegaste tarde: decís que te fuiste siendo dueño de tu historia.", nivel);
      }
      if (vida >= 65) {
        return this._final("retiro_vida", "propio", "🌅", "SE FUE A VIVIR",
          "Le dijiste adiós a los escenarios para vivir tu vida.\n\nNo lo veas como un final: es la decisión de alguien que entendió lo que de verdad importa.", nivel);
      }
      if (nivel >= 3) {
        return this._final("retiro_temprano", "propio", "🛬", "RETIRO TEMPRANO",
          "Te retiraste con una carrera sólida y la cabeza en alto.\n\nPodrías haber seguido, pero elegiste tu propio final.", nivel);
      }
      return this._final("retiro_corto", "discreto", "🕊️", "UNA CARRERA CORTA",
        "No duró mucho, pero fue tuya.\n\nA veces la decisión más valiente es saber cuándo decir basta.", nivel);
    }

    /* ---------- Fin natural en el año 25 ---------- */

    /* Finales trágicos: las carreras que se apagan de verdad.
       Si la energía se consumió del todo, el dinero no alcanzó,
       los escándalos comieron la música o la crisis se llevó el
       nombre, la historia termina en voz baja por más que alguna
       vez haya pesado. */
    if (energia <= 15) {
      return this._final("burnout", "tragico", "🕯️", "SE APAGÓ",
        "Llegaste lejos, pero la maquinaria te consumió.\n\nTu carrera terminó en silencio, agotado, con el mundo todavía pidiendo más. Hay nombres que el ritmo apaga.", nivel);
    }
    if (s.quiebra && money < 5000) {
      return this._final("quiebra", "tragico", "💸", "BANCARROTA",
        "La deuda te ganó la partida.\n\nLa música siguió sonando, pero tu nombre quedó como una advertencia para los que juegan con plata que no tienen.", nivel);
    }
    if ((s.totalEscandalos || 0) >= 4 && (s.haters || 0) >= 60 && nivel < 4) {
      return this._final("cancelado", "tragico", "🚫", "CANCELADO POR LA ESCENA",
        "Los escándalos terminaron comiéndose la música.\n\nLa escena que te aplaudía cambió de canal. Tu nombre pasó a ser una advertencia que nadie quiere seguir.", nivel);
    }
    if ((s.aniosEnCrisis || 0) >= 3 && nivel < 3) {
      return this._final("fantasma", "tragico", "👻", "EL FANTASMA DEL UNDER",
        "La escena te dejó de esperar y vos dejaste de aparecer.\n\nNadie sabe con certeza qué pasó: solo queda una leyenda urbana sobre un artista que se apagó sin despedirse.", nivel);
    }

    /* Finales legendarios: la cima absoluta */
    if (nivel >= 8 && legado >= 70) {
      return this._final("mito", "legendario", "🌟", "MITO VIVO",
        "Empezaste grabando en tu habitación y terminaste como un nombre que se cita en voz baja, con respeto.\n\nNo sos una estrella: sos parte de la historia de la música. Los que vengan después te van a descubrir como se descubre a los grandes.", nivel);
    }
    if (nivel >= 8) {
      return this._final("leyenda", "legendario", "🌍", "FAMA MUNDIAL",
        "Empezaste grabando en tu habitación y terminaste siendo escuchado por el mundo entero.\n\nTu nombre ya es parte de la historia de la música.", nivel);
    }
    if (legado >= 60 && nivel >= 6) {
      return this._final("legado", "dorado", "👑", "LEYENDA DE LA INDUSTRIA",
        "Más que números: dejaste una huella.\n\nDocumentales, reinvenciones y un nombre que la industria cita como ejemplo. Tu legado trasciende tus ventas.", nivel);
    }
    if ((s.inversiones || []).length >= 2 && money >= 50000) {
      return this._final("imperio", "dorado", "🏙️", "EMPRESARIO DE LA MÚSICA",
        "La música te abrió las puertas y vos construiste un imperio.\n\nCatálogo, propiedades y negocios: sos más que un artista.", nivel);
    }
    if (vida >= 70 && nivel >= 5) {
      return this._final("familia", "dorado", "👨‍👩‍👧‍👦", "FAMA Y FAMILIA",
        "Llenaste estadios y aun así nunca perdiste a los tuyos.\n\nEsa es la combinación que casi nadie logra.", nivel);
    }
    if (s.flags.superoCrisis && nivel >= 5) {
      return this._final("renacer", "dorado", "🌄", "EL RESURGIDO",
        "Tocaste fondo, todos te dieron por terminado y volviste más fuerte.\n\nTu historia vale más que tus récords: el que cae y vuelve escribe el mejor capítulo.", nivel);
    }
    if (nivel >= 7) {
      return this._final("estrella", "dorado", "⭐", "SUPERESTRELLA",
        "Tu nombre cruza fronteras. Llenás escenarios, rompés récords y el planeta entero te escucha.", nivel);
    }

    /* Carreras con una forma propia: las define algo concreto */
    if ((s.reinvenciones || 0) >= 2 || (s.documentales || 0) >= 2) {
      return this._final("sabio", "propio", "🧙", "EL SABIO DEL SONIDO",
        "Tu carrera no fue una línea: fue un camino que se reescribió solo.\n\nTe reinventaste, cambiaste, creciste, y la gente aprendió a esperar lo que nadie esperaba.", nivel);
    }
    if ((s.totalGiras || 0) >= 4 || s.flags.tuvoGiraMundial) {
      return this._final("navegante", "propio", "🧭", "CIUDADANO DEL MUNDO",
        "Tu música te llevó por cada rincón del planeta.\n\nNo te definió una ciudad: te definió un escenario distinto en cada país.", nivel);
    }
    if ((s.lanzamientos || 0) >= 15 && (s.totalReproducciones || 0) >= 1000000 && nivel >= 4) {
      return this._final("maquina", "propio", "⚙️", "LA MÁQUINA DE HITS",
        "Tema tras tema, tu catálogo no paró de crecer.\n\nNo construiste una canción: construiste una máquina que la gente no dejaba de escuchar.", nivel);
    }

    if (nivel >= 6) {
      return this._final("estrella", "propio", "✨", "ESTRELLA",
        "Conseguiste una audiencia enorme y una carrera sólida. La gente te ubica apenas escucha tu nombre.", nivel);
    }
    if (nivel >= 5) {
      return this._final("relevante", "propio", "🎙️", "ARTISTA RELEVANTE",
        "La industria te respeta y tu carrera es seria. No llegaste a la cima, pero construiste algo real.", nivel);
    }
    if (nivel >= 4) {
      return this._final("nacional", "propio", "🏛️", "ESTRELLA NACIONAL",
        "Tu país entero conoce tu música. Podrías no haber conquistado el mundo, pero conquistaste tu casa.", nivel);
    }

    /* Carreras del under y de la memoria */
    if (s.flags.superoQuiebra) {
      return this._final("supero_quiebra", "propio", "🧯", "SOBREVIVIÓ A LA QUIEBRA",
        "Tocaste fondo, vendiste todo y volviste.\n\nReconstruiste tu carrera desde las cenizas. Esa historia vale más que cualquier récord.", nivel);
    }
    if ((contadores.taller || 0) >= 4) {
      return this._final("escuela", "propio", "🎓", "EL MAESTRO",
        "No llenaste estadios, pero formaste a los que sí.\n\nTalleres y consejos: tu música sigue viva en cada pibe que enseñaste.", nivel);
    }
    if (talento >= 70 && nivel >= 2 && s.stats.popularity < 60) {
      return this._final("culto", "propio", "🕯️", "ARTISTA DE CULTO",
        "Nunca llenaste estadios, pero tu influencia es enorme. Tu música marcó a una generación que la defiende con fiereza.", nivel);
    }
    if (nivel >= 2) {
      return this._final("underground", "propio", "🎤", "LEYENDA UNDERGROUND",
        "La fama masiva te esquivó, pero la escena te respeta. Tu carrera fue tuya, de principio a fin.", nivel);
    }
    return this._final("discreta", "discreto", "🎵", "UNA CARRERA DISCRETA",
      "No todas las carreras terminan en estadios. Viviste la música a tu manera, y eso también es una historia.", nivel);
  },

  /* Retiro temprano: el jugador decide terminar su carrera */
  retirarse: function (state) {
    state.retirado = true;
    state.añoRetiro = state.año;
    state.resultadoFinal = Under.RETIRO.calcularFinal(state, { retiro: true });
    state.terminada = true;
    state.fase = "final";
    state.historial.push({ año: state.año, texto: "Anunció su retiro de la música." });
    Under.SAVE.registrarFinal(state.resultadoFinal.tipo);
    Under.SYSTEMS.chequearLogros(state);
  }
};
