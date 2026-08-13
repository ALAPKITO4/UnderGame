/* ============================================================
   UNDER — SISTEMAS DEL JUEGO
   Motor de eventos, decisiones, ciclo anual, logros y finales.
   ============================================================ */

window.Under = window.Under || {};

Under.SYSTEMS = {

  /* ---------- Escalado de valores según nivel de carrera ---------- */
  escala: function (state) {
    return 1 + Under.STATE.nivelCarrera(state).nivel * 0.35;
  },
  efectivoEscala: function (state, base) {
    return Math.round(base * Under.SYSTEMS.escala(state));
  },
  fansEscala: function (state, base) {
    return Math.round(base * Under.SYSTEMS.escala(state));
  },
  dineroEscala: function (state, base) {
    return Math.round(base * Under.SYSTEMS.escala(state) * 1.5);
  },

  /* ---------- Efectos especiales (con suerte controlada) ---------- */
  ESPECIALES: {
    /* Un video viral: la probabilidad depende de la popularidad,
       nunca del azar puro. */
    viral: function (state) {
      var prob = 0.25 + state.stats.popularity / 200;
      if (Math.random() < prob) {
        return { fans: Under.SYSTEMS.fansEscala(state, 5000), popularity: 12, money: 300, _hype: 15 };
      }
      return { fans: Under.SYSTEMS.fansEscala(state, 300), popularity: 3 };
    }
  },

  /* ---------- Cantidad de decisiones importantes por año ----------
     Ritmo adaptativo: una carrera en llamas genera más decisiones
     que una carrera tranquila. Nunca menos de 2: aunque estés bajo
     tierra, la escena siempre te trae algo. */
  decisionesParaAnio: function (state) {
    var base = 2;
    /* El under es un hervidero: mientras no saliste de la escena
       bajo tierra, cada año te llueven toques, radios, cyphers y
       apuestas. Ahí ocurren MÁS cosas por año. */
    if (Under.STATE.nivelCarrera(state).nivel <= 3) base += 1;
    if (state.stats.popularity >= 60) base += 1;
    if (state.stats.popularity >= 85) base += 1;
    return Under.STATE.clamp(base, 2, 4);
  },

  /* ---------- Selección de eventos ---------- */
  eventosDisponibles: function (state) {
    var era = Under.STATE.eraActual(state);
    var lista = Under.DATA.EVENTS.filter(function (ev) {
      if (state.eventosUsados.indexOf(ev.id) !== -1) return false;
      if (ev.era && ev.era.indexOf(era.id) === -1) return false;
      if (ev.añoMin && state.año < ev.añoMin) return false;
      if (ev.añoMax && state.año > ev.añoMax) return false;
      if (ev.condiciones) {
        var c = ev.condiciones;
        if (c.flags) {
          for (var k in c.flags) {
            if (!!state.flags[k] !== !!c.flags[k]) return false;
          }
        }
        if (c.noFlags) {
          for (var i = 0; i < c.noFlags.length; i++) {
            if (state.flags[c.noFlags[i]]) return false;
          }
        }
        if (c.minPopularidad != null && state.stats.popularity < c.minPopularidad) return false;
      }
      return true;
    });
    return lista;
  },

  /* Baraja del guion por partida: los eventos guionados (EVENTS)
     se ofrecen en un orden barajado distinto en cada carrera, así
     el año 1 y el año 2 no son siempre los mismos. El primer tema
     siempre abre la historia. */
  _crearOrdenGuion: function () {
    var ids = [];
    for (var i = 0; i < Under.DATA.EVENTS.length; i++) {
      if (Under.DATA.EVENTS[i].id !== "primer_tema") ids.push(Under.DATA.EVENTS[i].id);
    }
    for (var j = ids.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = ids[j]; ids[j] = ids[k]; ids[k] = t;
    }
    ids.unshift("primer_tema");
    return ids;
  },

  seleccionarEvento: function (state) {
    /* Hook de cobertura para el smoke test: agenda un evento exacto
       una vez (p. ej. el documental). Se consume en el flujo normal,
       así el generador limpia su pendiente al resolver la opción. */
    if (Under.SYSTEMS._eventoForzado) {
      var forzado = Under.SYSTEMS._eventoForzado;
      Under.SYSTEMS._eventoForzado = null;
      var evForzado = Under.DATA.buscarEvento(forzado, state);
      if (evForzado) return evForzado;
    }
    /* La bifurcación (PRIORIDAD 10): en cuanto la carrera cruza al
       nivel 4 (la industria empieza a mirarte), el camino se elige
       y SIEMPRE aparece: mainstream o quedarse en el under. */
    if (!state.flags.camino && Under.STATE.nivelCarrera(state).nivel >= 4) {
      var evCamino = Under.DATA.buscarEvento("camino_carrera", state);
      if (evCamino) return evCamino;
    }
    /* Desde el año 2 la música sale sola (Under.MUSIC.lanzarAutomatico
       se ejecuta en iniciarAnio). Las decisiones de cada año son los
       otros eventos de la escena: giras, sellos, shows, crisis… */
    if (!state.ordenGuion) state.ordenGuion = Under.SYSTEMS._crearOrdenGuion();
    var scripted = Under.SYSTEMS.eventosDisponibles(state);
    if (scripted.length) {
      /* Rotación (PRIORIDAD: variedad de partida). En los primeros
         años los eventos guionados compiten con los dinámicos: a lo
         sumo la mitad de las decisiones del año son de guion, en el
         orden barajado de esta partida. Así cada carrera ve un guion
         distinto y se mezcla con la vida del under (toques, radios,
         cyphers…). En años avanzados el guion se completa igual. */
      var capGuion = state.año <= 3
        ? Math.max(1, Math.ceil(Under.SYSTEMS.decisionesParaAnio(state) / 2))
        : scripted.length;
      if ((state.scriptedEsteAnio || 0) < capGuion) {
        for (var i = 0; i < state.ordenGuion.length; i++) {
          var id = state.ordenGuion[i];
          for (var j = 0; j < scripted.length; j++) {
            if (scripted[j].id === id) {
              state.scriptedEsteAnio = (state.scriptedEsteAnio || 0) + 1;
              return scripted[j];
            }
          }
        }
      }
    }
    return Under.SYSTEMS.seleccionarTemplate(state);
  },

  /* Pools de plantillas + eventos dinámicos (lanzamientos, giras,
     colaboraciones, premios, sellos). peso = cuántas veces entra
     al pozo (puede ser un número o una función del estado, para
     que el contexto módule qué tan probable es cada evento).
     Los dinámicos respetan su condición de disponibilidad. */
  seleccionarTemplate: function (state) {
    var pool = [];
    for (var i = 0; i < Under.DATA.TEMPLATES.length; i++) {
      pool.push(Under.DATA.TEMPLATES[i].id);
    }
    Under.DATA.DINAMICOS.forEach(function (d) {
      if (d.disponible && !d.disponible(state)) return;
      /* Peso dinámico (PRIORIDAD 6): si el peso es una función,
         el contexto del momento decide qué tan probable es. */
      var peso = typeof d.peso === "function" ? d.peso(state) : d.peso;
      peso = Math.max(0, Math.round(peso || 0));
      /* La amiga trae la vida del under: en los primeros años las
         misiones de la escena (under_*) salen mucho más que el resto.
         Pero quien eligió quedarse en el under no se queda sin
         carrera: sus giras, premios y colabs siguen teniendo aire. */
      if (d.id.indexOf("under_") === 0) {
        if (state.año <= 3) peso *= 3;
        else if (state.flags && state.flags.camino === "under") peso = Math.max(1, Math.round(peso / 2));
      }
      for (var w = 0; w < peso; w++) pool.push(d.id);
    });

    var ultimo = state.ultimoTemplate;
    var filtrado = pool.filter(function (id) { return id !== ultimo; });

    var id = filtrado[Math.floor(Math.random() * filtrado.length)];
    state.ultimoTemplate = id;
    return Under.DATA.buscarEvento(id, state);
  },

  /* ---------- Resolución de efectos ---------- */
  resolverEfecto: function (state, efecto) {
    if (typeof efecto === "function") return efecto(state);
    /* Copia (nunca la referencia): los efectos de las opciones se
       suman y pueden mutarse al aplicarlos; si devolvemos el objeto
       original, el mismo evento duplicaría efectos en la siguiente
       partida (y a lo largo de una sesión del navegador). */
    return Object.assign({}, efecto || {});
  },

  resolverEspecial: function (state, id) {
    var fn = Under.SYSTEMS.ESPECIALES[id];
    return fn ? fn(state) : {};
  },

  aplicarEfectos: function (state, efectos) {
    var stats = state.stats;
    for (var k in efectos) {
      /* Campos especiales de Fase 4: energía y vida personal */
      if (k === "_energia") {
        state.energia = Under.STATE.clamp(state.energia + efectos[k], 0, 100);
        continue;
      }
      if (k === "_relaciones") {
        state.relaciones = Under.STATE.clamp(state.relaciones + efectos[k], 0, 100);
        continue;
      }
      /* Campo especial de Fase 5: legado (sin tope) */
      if (k === "_legado") {
        state.legado = Math.max(0, state.legado + efectos[k]);
        continue;
      }
      /* El público (PRIORIDAD 3): el hype es interno y se apaga
         solo; los haters se suman (y se regulan) solos. */
      if (k === "_hype") {
        state.hype = Under.STATE.clamp(state.hype + efectos[k], 0, 100);
        if (state.hype >= 45) state.flags.hypeVivido = true;
        continue;
      }
      if (k === "_haters") {
        if (Under.PUBLICO) Under.PUBLICO.agregarHaters(state, efectos[k]);
        continue;
      }
      if (!(k in stats)) continue;
      var v = efectos[k];
      /* Mientras estás bajo tierra (PRIORIDAD 10), tu nombre llega
         a poca gente: los saltos de popularidad rinden menos hasta
         que salís. Acá viven todas las vías (decisiones, misiones,
         premios…), así el freno es parejo. */
      if (k === "popularity" && v > 0 && !state.flags.salioDelUnderground) {
        v = Math.max(1, Math.round(v * (Under.DATA.CONFIG.UNDER_POP_FACTOR || 1)));
      }
      stats[k] += v;
      if (k === "fans") {
        /* Tope de fama (PRIORIDAD 10): en los primeros años el
           under no crece de golpe: los fans se frenan en el techo
           del año para que la fama no explote antes de tiempo. */
        var tope = Under.STATE.topeFama(state);
        stats[k] = tope === null ? Math.max(0, stats[k]) : Math.min(tope, Math.max(0, stats[k]));
      } else if (k === "money") {
        stats[k] = Math.max(0, stats[k]);
      } else {
        stats[k] = Under.STATE.clamp(stats[k], 0, 100);
      }
    }
  },

  resolverTexto: function (state, x, efectos) {
    if (typeof x === "function") return x(state, efectos);
    return x || "";
  },

  /* ---------- Peso real de cada decisión ----------
     Elegir mal duele de verdad y elegir bien se nota:
     - Los fans ganados o perdidos escalan con el nivel de carrera
       (un error a nivel alto te cuesta una multitud).
     - Todo golpe deja haters: perder popularidad o espantar fans
       crea gente que te mira mal.
     - Los éxitos grandes encienden el hype; las caídas lo apagan.
     Esto corre sobre TODAS las decisiones (estáticas o dinámicas),
     sin tocar la narrativa original de cada opción. */
  consecuencias: function (state, efectos) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var f = 1 + nivel * 0.25;
    var res = {};
    for (var k in efectos) {
      var v = efectos[k];
      if (k === "fans" || k === "money") v = Math.round(v * f);
      else if (k === "_haters") v = Math.round(v * f);
      res[k] = v;
    }

    /* Camino under (PRIORIDAD 10): los que te escuchan te aman.
       Cada oído nuevo que gana le cuesta más que al mainstream,
       pero el que llega, llega para quedarse: +30% fans. */
    if (state.flags && state.flags.camino === "under" && res.fans && res.fans > 0) {
      res.fans = Math.round(res.fans * 1.3);
    }

    /* Las consecuencias visibles: los golpes generan odio, los
       momentos grandes generan ruido. */
    if (res.fans && res.fans < 0) {
      res._haters = (res._haters || 0) + Math.round(-res.fans * 0.12);
    }
    if (res.popularity && res.popularity < 0) {
      res._haters = (res._haters || 0) + Math.round(-res.popularity * 3);
      res._hype = Math.max((res._hype || 0) - 2, -10);
    }
    if (res.money && res.money < 0) {
      /* Perder plata también deja una mala espina, no tan fuerte. */
      res._haters = (res._haters || 0) + Math.round(Math.min(6, -res.money / 800));
    }
    if (res.fans && res.fans >= 1500) {
      res._hype = (res._hype || 0) + Math.min(8, 2 + Math.round(res.fans / 2500));
    }
    return res;
  },

  /* ---------- Ejecutar una decisión ---------- */
  ejecutarDecision: function (state, evento, opcion) {
    var antes = {};
    for (var k in state.stats) antes[k] = state.stats[k];

    /* Opciones con riesgo real: si falla la tirada, pasa lo que
       dice riesgoEfectos/riesgoResultado en vez del resultado
       normal. Así las apuestas pueden salir muy caras. */
    var opcionReal = opcion;
    if (opcion.riesgo && Math.random() < opcion.riesgo) {
      opcionReal = {
        efectos: opcion.riesgoEfectos || {},
        resultado: opcion.riesgoResultado || opcion.resultado,
        log: opcion.riesgoLog || opcion.log,
        flags: opcion.riesgoFlags || opcion.flags
      };
    }

    var efectos = Under.SYSTEMS.resolverEfecto(state, opcionReal.efectos);
    if (opcionReal.especial) {
      var especial = Under.SYSTEMS.resolverEspecial(state, opcionReal.especial);
      for (var k2 in especial) {
        efectos[k2] = (efectos[k2] || 0) + especial[k2];
      }
    }

    /* Aplico las consecuencias con peso real (escala + haters/hype).
       La narrativa se construye con los efectos originales para no
       tocar los textos de cada evento. */
    var aplicados = Under.SYSTEMS.consecuencias(state, efectos);
    Under.SYSTEMS.aplicarEfectos(state, aplicados);

    /* ---- Progresión anual (PRIORIDAD 1) ----
       Cada decisión suma madurez artística. Y los movimientos de
       popularidad cargan o drenan la inercia de la fama: un gran
       salto te deja "en llamas" (el próximo lanzamiento lo nota),
       una caída o un año quieto te apagan. */
    /* Carreras por género (PRIORIDAD 5): las escenas de culto
       (rap/rock) te forman más con cada movimiento del under. */
    var expGanada = Under.DATA.CONFIG.EXPERIENCIA_POR_DECISION;
    if (Under.GENEROS && evento && evento.id && evento.id.indexOf("under_") === 0) {
      expGanada *= Under.GENEROS.escena(state);
    }
    state.experiencia = Under.STATE.clamp(state.experiencia + expGanada, 0, 100);
    var deltaPop = state.stats.popularity - antes.popularity;
    if (deltaPop !== 0) {
      state.momentum = Under.STATE.clamp(state.momentum + deltaPop * 2.5, 0, 100);
    }
    /* Un error grande también lastima el momento: la inercia a favor
       se frena y cuesta recuperarla. */
    var deltaFans = state.stats.fans - antes.fans;
    if (deltaFans < 0) {
      state.momentum = Under.STATE.clamp(state.momentum + deltaFans / 500, 0, 100);
    }

    if (opcionReal.flags) {
      for (var k3 in opcionReal.flags) state.flags[k3] = opcionReal.flags[k3];
    }

    /* Memoria de decisiones (PRIORIDAD 2): las decisiones que
       activan flags de memoria se registran y ajustan la reputación. */
    if (Under.MEMORIA) Under.MEMORIA._decisión(state, opcion);

    /* Diario de decisiones: toda opción elegida queda registrada
       para que misiones y eventos futuros puedan referirse a ella
       (Under.MISIONES._decidio / _decisiones). */
    if (evento && evento.id) {
      if (!state.decisiones) state.decisiones = [];
      state.decisiones.push({ id: evento.id, opcion: opcion.texto, año: state.año });
    }

    if (opcionReal.log) {
      state.historial.push({
        año: state.año,
        texto: typeof opcionReal.log === "function" ? opcionReal.log(state, efectos) : opcionReal.log
      });
    }

    if (evento && !evento.recurrente && state.eventosUsados.indexOf(evento.id) === -1) {
      state.eventosUsados.push(evento.id);
    }

    state.decisionesTomadas += 1;

    /* Misiones: cada decisión del underground suma al grind y todas
       las misiones se revisan cuando cambian las estadísticas. */
    if (Under.MISIONES) {
      if (evento && evento.id && evento.id.indexOf("under_") === 0) {
        Under.MISIONES.sumar(state, "grind", 1);
      } else if (evento && evento.id && evento.id.indexOf("extra_") === 0) {
        Under.MISIONES.sumar(state, "puertas", 1);
      } else if (evento && evento.id && evento.id.indexOf("fan_") === 0) {
        Under.MISIONES.sumar(state, "fandom", 1);
      }
      Under.MISIONES.chequear(state);
    }

    Under.SYSTEMS.chequearSalidaUnderground(state);

    var resultado = Under.SYSTEMS.resolverTexto(state, opcionReal.resultado, efectos);

    return {
      antes: antes,
      efectos: efectos,
      aplicados: aplicados,
      resultado: resultado,
      logros: Under.SYSTEMS.chequearLogros(state)
    };
  },

  /* ---------- Logros ---------- */
  chequearLogros: function (state) {
    var nuevos = [];
    for (var i = 0; i < Under.DATA.LOGROS.length; i++) {
      var l = Under.DATA.LOGROS[i];
      var ya = state.logros.some(function (x) { return x.id === l.id; });
      if (ya) continue;
      if (l.check(state)) {
        state.logros.push({ id: l.id, nombre: l.nombre, icono: l.icono, año: state.año });
        nuevos.push(l);
      }
    }
    return nuevos;
  },

  /* ---------- Salida del underground (FASE 6) ----------
     Cruzar al nivel 4 es el gran hito del juego: significa que
     dejaste la escena bajo tierra y la industria te mira.
     Se registra una sola vez y se guarda el nivel máximo. */
  chequearSalidaUnderground: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    state.maxNivel = Math.max(state.maxNivel || 0, nivel);
    if (!state.flags.salioDelUnderground && nivel >= 4) {
      state.flags.salioDelUnderground = true;
      state.historial.push({
        año: state.año,
        texto: "🌅 Saliste del underground. La industria empieza a mirarte."
      });
    }
  },

  /* ---------- Ciclo anual ---------- */
  iniciarAnio: function (state) {
    /* Tope de fama (PRIORIDAD 10): al arrancar el año, los fans se
       ajustan al techo del año (red de seguridad para cualquier
       ganancia que no pase por aplicarEfectos). */
    var tope = Under.STATE.topeFama(state);
    if (tope !== null && state.stats.fans > tope) state.stats.fans = tope;
    var decisiones = Under.SYSTEMS.decisionesParaAnio(state);
    state.planAnio = {
      decisiones: decisiones,
      hechas: 0,
      inicioStats: {},
      momentos: []
    };
    /* Rotación del guion: cuántos eventos guionados se ofrecieron
       ya este año (el tope lo decide seleccionarEvento). */
    state.scriptedEsteAnio = 0;
    for (var k in state.stats) state.planAnio.inicioStats[k] = state.stats[k];
    /* La música ya no es una decisión: el artista publica un tema
       por año solo. Desde el segundo año (el primero lo cubre la
       decisión del primer tema). */
    state.flags.lanzamientoEsteAnio = false;
    /* Los sistemas de Fase 3 se ofrecen una vez por año */
    state.flags.giraEsteAnio = false;
    state.flags.colabEsteAnio = false;
    state.flags.premioEsteAnio = false;
    state.flags.selloOfrecidoEsteAnio = false;
    /* Los sistemas de Fase 4 se ofrecen una vez por año */
    state.flags.albumEsteAnio = false;
    state.flags.escandaloEsteAnio = false;
    state.flags.equipoOfrecidoEsteAnio = false;
    state.flags.inversionOfrecidaEsteAnio = false;
    state.flags.vidaEsteAnio = false;
    /* Los sistemas de Fase 5 se ofrecen una vez por año */
    state.flags.plataformaEsteAnio = false;
    state.flags.mercadoEsteAnio = false;
    state.flags.festivalEsteAnio = false;
    state.flags.evolucionEsteAnio = false;
    state.flags.creditoEsteAnio = false;
    state.flags.catalogoEsteAnio = false;
    /* Rivalidad persistente: un evento de rivales por año y el beef
       se enfría naturalmente. Si el fuego se apaga, el rival sigue
       su camino y la escena puede traer uno nuevo. */
    state.flags.rivalEsteAnio = false;
    /* Canciones y éxito (PRIORIDAD 4): un resurgimiento del
       catálogo como mucho una vez por año. */
    state.flags.revivalEsteAnio = false;
    /* Memoria de decisiones: el balance de la escena se revisa
       como mucho una vez por año. */
    state.flags.memEscenaEsteAnio = false;
    if (state.rivales && state.rivales.length) {
      for (var ri = state.rivales.length - 1; ri >= 0; ri--) {
        var rv = state.rivales[ri];
        if (!rv.activo) continue;
        rv.beef = Under.STATE.clamp(rv.beef - 8, 0, 100);
        if (!rv.reconciliado && rv.beef <= 0) {
          rv.activo = false;
          state.historial.push({ año: state.año, texto: "La rivalidad con " + rv.nombre + " se enfrió y cada uno siguió su camino." });
        }
      }
    }
    state.eventoActualId = null;

    /* ---- Progresión anual (PRIORIDAD 1) ----
       La madurez crece con cada año que pasás en la música.
       La inercia de la fama se desinfla sola: si el momento se
       enfría y no lo alimentás con movimiento, tu nombre pierde
       temperatura (la gente empieza a olvidarte). */
    state.experiencia = Under.STATE.clamp(state.experiencia + Under.DATA.CONFIG.EXPERIENCIA_POR_ANIO, 0, 100);
    state.momentum = Under.STATE.clamp(state.momentum - Under.DATA.CONFIG.MOMENTUM_DECAY, 0, 100);
    if (state.año > 1 && state.momentum < Under.DATA.CONFIG.MOMENTUM_FRIO && state.stats.popularity > 2) {
      state.stats.popularity = Under.STATE.clamp(state.stats.popularity - 1, 0, 100);
      state.planAnio.momentos.push("Tu nombre se enfrió: sin movimiento constante, la gente te empieza a olvidar.");
    }

    /* Misiones: cada año se rotan las que llevan mucho clavadas
       para que siempre aparezcan las que todavía no salieron. */
    if (Under.MISIONES && Under.MISIONES.rotar) Under.MISIONES.rotar(state);

    /* La música sale sola. Si el tema es un hit, la UI salta la
       animación de oyentes al arrancar el año. */
    if (Under.MUSIC && state.año >= 2) Under.MUSIC.lanzarAutomatico(state);

    return state.planAnio;
  },

  cerrarAnio: function (state) {
    var plan = state.planAnio;

    /* El público (PRIORIDAD 3): el hype se apaga solo, la base
       de fans se afianza y los casuales huyen si el ruido murió.
       Se procesa antes del streaming para que la fidelidad de la
       base se refleje en lo que el catálogo genera. */
    if (Under.PUBLICO) Under.PUBLICO.cerrarAnio(state);

    /* Canciones y éxito (PRIORIDAD 4): la discografía envejece y
       los clásicos siguen sumando oídos solos. */
    if (Under.CANCIONES) Under.CANCIONES.cerrarAnio(state);

    /* Fase 5: el streaming reemplaza al crecimiento orgánico pasivo.
       Tu catálogo se reproduce solo cada año: cuánto (streams) y a
       cuánto (dinero) lo definen tus plataformas, mercados y si
       vendiste tus derechos. Una base fiel paga mejor por oído y
       los haters hacen que cada fan nuevo cueste más caro. */
    if (state.stats.popularity > 15) {
      var plat = state.plataforma ? Under.DATA.PLATAFORMAS.filter(function (p) { return p.id === state.plataforma.id; })[0] : null;
      var streamsMult = plat ? plat.streamsMult : 1;
      var dineroMult = plat ? plat.dineroMult : 1;
      if (state.vendioCatalogo) dineroMult *= 0.5;
      var mercadosBoost = 1 + state.mercados.length * 0.12;

      var catalogo = Math.max(state.totalReproducciones, state.stats.fans * 15);
      /* La inercia también empuja el catálogo: un artista en llamas
         se sigue reproduciendo más aunque no saque nada nuevo.
         Y la novedad importa: si dejaste de sacar música, los temas
         viejos rinden menos (los clásicos sostienen el valor). */
      var impulso = 1 + state.momentum / 300;
      var novedad = Under.CANCIONES ? Under.CANCIONES.factorNovedad(state) : 1;
      var streams = Math.round(catalogo * 0.25 * streamsMult * impulso * novedad * (0.8 + Math.random() * 0.4));
      var fidelidad = Under.PUBLICO ? Under.PUBLICO.fidelidad(state) : 1;
      var haterF = Under.PUBLICO ? Under.PUBLICO.haterFactor(state) : 1;
      /* Carreras por género (PRIORIDAD 5): la escena fiel paga
         mejor por oído. Rap/rock rinden más por stream. */
      var genIngreso = Under.GENEROS ? Under.GENEROS.ingreso(state) : 1;
      var ingreso = Math.round(streams * Under.DATA.CONFIG.REGALIA * dineroMult * mercadosBoost * fidelidad * haterF * genIngreso);

      state.stats.fans += Math.round(streams * 0.01);
      state.stats.money += ingreso;
      plan.momentos.push((plat ? "Tu estrategia " + plat.emoji + " " + plat.nombre + " generó " : "Tu catálogo generó ") +
        Under.UI.fmtDinero(ingreso) + " en streaming (" + Under.UI.fmt(streams) + " repros).");
    }

    /* Fase 4: ingresos pasivos de las inversiones y honorarios del equipo */
    if (Under.INVERSIONES) Under.INVERSIONES.cerrarAnio(state);
    if (Under.EQUIPO) Under.EQUIPO.cerrarAnio(state);

    /* Fase 5: se pagan las cuotas de los créditos; si no alcanza, quiebra */
    if (state.deudas.length) {
      for (var i = state.deudas.length - 1; i >= 0; i--) {
        var d = state.deudas[i];
        if (state.quiebra) { state.deudas.splice(i, 1); continue; }
        if (state.stats.money >= d.cuota) {
          state.stats.money -= d.cuota;
          d.restante -= 1;
          plan.momentos.push("Pagaste la cuota de " + d.nombre + " (" + Under.UI.fmtDinero(d.cuota) + ").");
          if (d.restante <= 0) {
            state.deudas.splice(i, 1);
            if (state.deudas.length === 0 && !state.quiebra) {
              state.flags.deudasSaldadas = true;
              plan.momentos.push("Saldaste todas tus deudas. La banca vuelve a mirarte de frente.");
            }
          }
        } else {
          state.quiebra = true;
          state.stats.money = 0;
          state.stats.popularity = Under.STATE.clamp(state.stats.popularity - 12, 0, 100);
          state.legado = Math.max(0, state.legado - 15);
          plan.momentos.push("No pudiste pagar " + d.nombre + ". La quiebra golpea tu reputación.");
          state.deudas = [];
        }
      }
    }

    /* Fase 4: la energía se recupera con el descanso anual */
    state.energia = Under.STATE.clamp(state.energia + 25, 0, 100);

    /* Burnout: si terminás el año agotado, tu cuerpo te obliga a parar */
    if (state.energia <= 20) {
      state.flags.agotado = true;
      var perdidaFans = Math.round(Under.SYSTEMS.fansEscala(state, 1500));
      state.stats.fans = Math.max(0, state.stats.fans - perdidaFans);
      state.stats.popularity = Under.STATE.clamp(state.stats.popularity - 2, 0, 100);
      state.energia = Under.STATE.clamp(state.energia + 30, 0, 100);
      plan.momentos.push("El agotamiento te obligó a una pausa forzada. Perdiste terreno.");
    }

    /* Fase 5: el legado crece con los años en la música */
    state.legado += 1 + Math.floor(Under.STATE.nivelCarrera(state).nivel / 3);

    /* Fase 6: registrar salida del underground (por si el streaming
       empuja el nivel sin pasar por una decisión) */
    Under.SYSTEMS.chequearSalidaUnderground(state);

    /* Misiones: los hitos que crecen solos (fans, discografía) */
    if (Under.MISIONES) Under.MISIONES.chequear(state);

    /* Memoria de decisiones (PRIORIDAD 2): la reputación deriva
       hacia el perfil construido y las viejas cuentas se cobran. */
    if (Under.MEMORIA) Under.MEMORIA.cerrarAnio(state);

    /* Red de contactos (PRIORIDAD 7): los vínculos se enfrían si
       se descuidan y una red fuerte trabaja por vos. */
    if (Under.RELACIONES) Under.RELACIONES.cerrarAnio(state);

    /* Contratos y economía (PRIORIDAD 8): si el contrato venció
       y no se renegoció, quedás libre. */
    if (Under.CONTRATOS) Under.CONTRATOS.cerrarAnio(state);

    /* Crisis, recuperación y evolución (PRIORIDAD 9): el estado
       de la carrera deja marca en el legado y en la historia. */
    if (Under.CRISIS) Under.CRISIS.cerrarAnio(state);

    /* Fase 5: si quebraste pero volvés a tener plata, la historia es de recuperación */
    if (state.quiebra && state.stats.money >= 10000) {
      state.flags.superoQuiebra = true;
      plan.momentos.push("Volviste a poner la cabeza fuera del agua después de la quiebra.");
    }

    /* Los momentos del año quedan registrados en el historial,
       no interrumpen el juego con un resumen. */
    state.historial.push({ año: state.año, texto: "Fin del año " + state.año + "." });
    for (var i = 0; i < plan.momentos.length; i++) {
      state.historial.push({ año: state.año, texto: plan.momentos[i] });
    }
    /* Gráfico de trayectoria: un punto por año terminado.
       Se guardan también madurez y momento para análisis futuro. */
    state.trayectoria.push({
      año: state.año,
      popularity: Math.round(state.stats.popularity),
      fans: state.stats.fans,
      money: state.stats.money,
      nivel: Under.STATE.nivelCarrera(state).nivel,
      experiencia: Math.round(state.experiencia),
      momentum: Math.round(state.momentum),
      hype: Math.round(state.hype)
    });
    state.planAnio = null;
    state.eventoActualId = null;
  },

  avanzarAnio: function (state) {
    state.año += 1;
    state.artista.edad += 1;
    if (state.año > Under.DATA.CONFIG.AÑOS_MAX) {
      Under.SYSTEMS.finalizarCarrera(state);
      return false;
    }
    Under.SYSTEMS.iniciarAnio(state);
    return true;
  },

  /* ---------- Final de la carrera ---------- */
  /* Los finales alternos (retiro, burnout, imperio, familia…) los
     decide Under.RETIRO según el perfil de la carrera. */
  finalizarCarrera: function (state) {
    state.resultadoFinal = Under.RETIRO.calcularFinal(state, { retiro: false });
    state.terminada = true;
    state.fase = "final";
    state.historial.push({ año: state.año, texto: "Fin de la carrera. Resultado: " + state.resultadoFinal.titulo + "." });
    Under.SAVE.registrarFinal(state.resultadoFinal.tipo);
    Under.SYSTEMS.chequearLogros(state);
  }
};
