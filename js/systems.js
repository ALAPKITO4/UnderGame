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
        return { fans: Under.SYSTEMS.fansEscala(state, 5000), popularity: 12, money: 300 };
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

  seleccionarEvento: function (state) {
    /* El lanzamiento se ofrece sí o sí una vez por año, antes que
       cualquier otro evento, para que la carrera siempre tenga música. */
    if (!state.flags.lanzamientoEsteAnio) {
      state.flags.lanzamientoEsteAnio = true;
      return Under.DATA.buscarEvento("lanzamiento", state);
    }
    var disponibles = Under.SYSTEMS.eventosDisponibles(state);
    if (disponibles.length > 0) {
      disponibles.sort(function (a, b) {
        return (a.prioridad - b.prioridad) || (a.añoMin - b.añoMin);
      });
      return disponibles[0];
    }
    return Under.SYSTEMS.seleccionarTemplate(state);
  },

  /* Pools de plantillas + eventos dinámicos (lanzamientos, giras,
     colaboraciones, premios, sellos). peso = cuántas veces entra
     al pozo. Los dinámicos respetan su condición de disponibilidad. */
  seleccionarTemplate: function (state) {
    var pool = [];
    for (var i = 0; i < Under.DATA.TEMPLATES.length; i++) {
      pool.push(Under.DATA.TEMPLATES[i].id);
    }
    Under.DATA.DINAMICOS.forEach(function (d) {
      if (d.disponible && !d.disponible(state)) return;
      for (var w = 0; w < d.peso; w++) pool.push(d.id);
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
    return efecto || {};
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
      if (!(k in stats)) continue;
      stats[k] += efectos[k];
      if (k === "fans" || k === "money") {
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

  /* ---------- Ejecutar una decisión ---------- */
  ejecutarDecision: function (state, evento, opcion) {
    var antes = {};
    for (var k in state.stats) antes[k] = state.stats[k];

    var efectos = Under.SYSTEMS.resolverEfecto(state, opcion.efectos);
    if (opcion.especial) {
      var especial = Under.SYSTEMS.resolverEspecial(state, opcion.especial);
      for (var k2 in especial) {
        efectos[k2] = (efectos[k2] || 0) + especial[k2];
      }
    }

    Under.SYSTEMS.aplicarEfectos(state, efectos);

    if (opcion.flags) {
      for (var k3 in opcion.flags) state.flags[k3] = opcion.flags[k3];
    }

    if (opcion.log) {
      state.historial.push({
        año: state.año,
        texto: typeof opcion.log === "function" ? opcion.log(state, efectos) : opcion.log
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

    var resultado = Under.SYSTEMS.resolverTexto(state, opcion.resultado, efectos);

    return {
      antes: antes,
      efectos: efectos,
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
    var decisiones = Under.SYSTEMS.decisionesParaAnio(state);
    state.planAnio = {
      decisiones: decisiones,
      hechas: 0,
      inicioStats: {},
      momentos: []
    };
    for (var k in state.stats) state.planAnio.inicioStats[k] = state.stats[k];
    /* El lanzamiento es el corazón del juego: se garantiza una vez
       por año como primera decisión (el jugador puede rechazarlo). */
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
    return state.planAnio;
  },

  cerrarAnio: function (state) {
    var plan = state.planAnio;

    /* Fase 5: el streaming reemplaza al crecimiento orgánico pasivo.
       Tu catálogo se reproduce solo cada año: cuánto (streams) y a
       cuánto (dinero) lo definen tus plataformas, mercados y si
       vendiste tus derechos. */
    if (state.stats.popularity > 15) {
      var plat = state.plataforma ? Under.DATA.PLATAFORMAS.filter(function (p) { return p.id === state.plataforma.id; })[0] : null;
      var streamsMult = plat ? plat.streamsMult : 1;
      var dineroMult = plat ? plat.dineroMult : 1;
      if (state.vendioCatalogo) dineroMult *= 0.5;
      var mercadosBoost = 1 + state.mercados.length * 0.12;

      var catalogo = Math.max(state.totalReproducciones, state.stats.fans * 15);
      var streams = Math.round(catalogo * 0.25 * streamsMult * (0.8 + Math.random() * 0.4));
      var ingreso = Math.round(streams * Under.DATA.CONFIG.REGALIA * dineroMult * mercadosBoost);

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
    /* Gráfico de trayectoria: un punto por año terminado */
    state.trayectoria.push({
      año: state.año,
      popularity: Math.round(state.stats.popularity),
      fans: state.stats.fans,
      money: state.stats.money,
      nivel: Under.STATE.nivelCarrera(state).nivel
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
    Under.SYSTEMS.chequearLogros(state);
  }
};
