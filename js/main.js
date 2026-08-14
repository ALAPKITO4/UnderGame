/* ============================================================
   UNDER — MAIN
   Máquina de estados del juego + guardado automático.
   ============================================================ */

window.Under = window.Under || {};

Under.SAVE = {
  clave: function () { return Under.DATA.CONFIG.SAVE_KEY; },
  claveFinales: function () { return "under_finales_descubiertos"; },
  claveDesbloqueos: function () { return "under_desbloqueos"; },

  guardar: function (estado) {
    try {
      localStorage.setItem(Under.SAVE.clave(), JSON.stringify(estado));
    } catch (e) {
      /* almacenamiento no disponible: se ignora */
    }
  },

  cargar: function () {
    try {
      var raw = localStorage.getItem(Under.SAVE.clave());
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  hay: function () {
    return !!localStorage.getItem(Under.SAVE.clave());
  },

  borrar: function () {
    try {
      localStorage.removeItem(Under.SAVE.clave());
    } catch (e) { /* noop */ }
  },

  /* ---------- Finales descubiertos ----------
     Galería persistente entre partidas: cada carrera termina con
     un final distinto y esta lista guarda cuáles viste, para que
     haya una razón más para volver a empezar. */
  finales: function () {
    try {
      var raw = localStorage.getItem(Under.SAVE.claveFinales());
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  },

  registrarFinal: function (tipo) {
    if (!tipo) return;
    try {
      var arr = Under.SAVE.finales();
      if (arr.indexOf(tipo) === -1) {
        arr.push(tipo);
        localStorage.setItem(Under.SAVE.claveFinales(), JSON.stringify(arr));
      }
    } catch (e) { /* noop */ }
  },

  /* ---------- Desbloqueos (metaprogreso, PRIORIDAD 11) ----------
     Cada arco de final desbloquea contenido para la próxima
     partida (hoy, nuevas personalidades). Persiste entre
     partidas, separado del save activo. */
  desbloqueos: function () {
    try {
      var raw = localStorage.getItem(Under.SAVE.claveDesbloqueos());
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  },

  /* ¿Este arco ya estaba desbloqueado antes de la partida actual?
     Se pregunta ANTES de registrar, para saber si el desbloqueo es
     nuevo para esa carrera. */
  desbloqueoNuevo: function (arco) {
    if (!arco) return false;
    return Under.SAVE.desbloqueos().indexOf(arco) === -1;
  },

  registrarDesbloqueo: function (arco) {
    if (!arco) return;
    try {
      var arr = Under.SAVE.desbloqueos();
      if (arr.indexOf(arco) === -1) {
        arr.push(arco);
        localStorage.setItem(Under.SAVE.claveDesbloqueos(), JSON.stringify(arr));
      }
    } catch (e) { /* noop */ }
  },

  desbloqueado: function (arco) {
    return !!arco && Under.SAVE.desbloqueos().indexOf(arco) !== -1;
  }
};

Under.MAIN = {
  estado: null,
  fase: "inicio",
  overlay: null,
  ultimaResultado: null,
  _confirmAccion: null,
  showMisiones: false,
  form: { nombre: "", genero: "rap", personalidad: null },

  /* ---------- Arranque ---------- */
  init: function () {
    Under.UI.render();
  },

  /* ---------- Navegación ---------- */
  nuevaCarrera: function () {
    Under.SAVE.borrar();
    this.fase = "creacion";
    this.overlay = null;
    this.estado = null;
    this.ultimaResultado = null;
    this.showMisiones = false;
    this.form = { nombre: "", genero: "rap", personalidad: null };
    document.body.style.removeProperty("--accent");
    Under.UI.render();
  },

  continuarPartida: function () {
    var s = Under.SAVE.cargar();
    if (!s) return;
    /* Guardados de versión vieja: se descartan y se empieza de nuevo */
    if (s.version !== Under.DATA.CONFIG.SAVE_VERSION) {
      Under.SAVE.borrar();
      this.fase = "inicio";
      this.overlay = null;
      Under.UI.render();
      return;
    }
    this.estado = Under.STATE.migrar(s);
    this.fase = "dashboard";
    /* Partidas de esta versión sin misiones inicializadas: se crean */
    if (!s.misiones || Object.keys(s.misiones).length === 0) {
      Under.MISIONES._inicializar(s);
    }
    this.reanudar();
  },

  /* Reanuda donde quedó la partida guardada */
  reanudar: function () {
    var s = this.estado;

    if (s.fase === "final" || s.terminada) {
      this.fase = "final";
      this.overlay = null;
      Under.UI.render();
      return;
    }

    if (s.fase === "finAnio") {
      this.continuarAnio();
      return;
    }

    if (!s.planAnio) {
      Under.SYSTEMS.iniciarAnio(s);
      s.fase = "anio";
      this.siguienteEvento();
      Under.SAVE.guardar(s);
      Under.UI.render();
      return;
    }

    if (s.planAnio.hechas >= s.planAnio.decisiones) {
      Under.SYSTEMS.cerrarAnio(s);
      this.continuarAnio();
      return;
    }

    /* Continúa con la próxima decisión */
    this.siguienteEvento();
    this.overlay = null;
    Under.UI.render();
  },

  /* ---------- Formulario de creación ---------- */
  nombreChanged: function (v) {
    this.form.nombre = v;
    this.checkCreacion();
  },
  pickPersonalidad: function (v) {
    this.form.personalidad = v;
    this.checkCreacion();
  },
  checkCreacion: function () {
    var ok = !!this.form.nombre.trim() && !!this.form.personalidad;
    var b = document.getElementById("btn-empezar");
    if (b) b.disabled = !ok;
  },

  empezar: function () {
    var f = this.form;
    if (!f.nombre.trim() || !f.personalidad) return;
    /* El cantante es siempre rap/trap/under: forzamos el género sin
       importar lo que diga el formulario (save viejo, tamper, etc.). */
    f.genero = "rap";
    /* Guard (PRIORIDAD 11): si por alguma razón se eligió una
       personalidad bloqueada (save viejo, tamper), se cae a una
       base desbloqueada en vez de bloquear el arranque. */
    var perDef = Under.DATA.PERSONALITIES[f.personalidad];
    if (perDef && perDef.unlock && !Under.SAVE.desbloqueado(perDef.unlock)) {
      var base = Object.keys(Under.DATA.PERSONALITIES).filter(function (k) {
        return !Under.DATA.PERSONALITIES[k].unlock;
      });
      f.personalidad = base[0] || f.personalidad;
    }

    var estado = Under.STATE.crearJuego({
      nombre: f.nombre.trim(),
      genero: f.genero,
      personalidad: f.personalidad
    });

    /* Misiones: objetivos con progreso y recompensa */
    if (Under.MISIONES) Under.MISIONES._inicializar(estado);

    Under.SYSTEMS.iniciarAnio(estado);
    estado.fase = "anio";
    Under.SAVE.guardar(estado);

    this.estado = estado;
    this.fase = "dashboard";
    this.overlay = null;
    this.siguienteEvento();
    Under.UI.render();
  },

  /* ---------- Flujo de juego ---------- */
  siguienteEvento: function () {
    var s = this.estado;
    var ev = Under.SYSTEMS.seleccionarEvento(s);
    s.eventoActualId = ev ? ev.id : null;
  },

  elegir: function (i) {
    var s = this.estado;
    var ev = s.eventoActualId ? Under.DATA.buscarEvento(s.eventoActualId, s) : null;
    if (!ev || !ev.opciones[i]) return;

    var opcion = ev.opciones[i];
    var res = Under.SYSTEMS.ejecutarDecision(s, ev, opcion);

    s.planAnio.hechas += 1;
    this.ultimaResultado = res;
    this.overlay = null;

    /* Guarda el progreso en la próxima decisión (por si se recarga) */
    s.eventoActualId = null;
    s.fase = "dashboard";
    Under.SAVE.guardar(s);

    /* Solo las decisiones importantes muestran el resultado;
       el resto se nota en las estadísticas. */
    if (ev.importante) {
      this.overlay = "resultado";
    } else {
      this.ultimaResultado = null;
      this.continuarFlujo();
    }

    Under.UI.render();

    if (res.logros.length) {
      setTimeout(function () {
        res.logros.forEach(function (l) {
          Under.UI.toast(l.icono + " Logro desbloqueado: " + l.nombre);
        });
      }, 400);
    }
  },

  /* Avanza a la próxima decisión o cierra el año */
  continuarFlujo: function () {
    var s = this.estado;

    if (s.planAnio && s.planAnio.hechas >= s.planAnio.decisiones) {
      Under.SYSTEMS.cerrarAnio(s);
      this.continuarAnio();
    } else {
      this.siguienteEvento();
      s.fase = "dashboard";
      Under.SAVE.guardar(s);
    }
  },

  continuarResultado: function () {
    this.overlay = null;
    this.ultimaResultado = null;
    this.continuarFlujo();
    Under.UI.render();
  },

  continuarAnio: function () {
    var s = this.estado;
    this.overlay = null;

    var sigue = Under.SYSTEMS.avanzarAnio(s);
    if (!sigue) {
      this.fase = "final";
      this.overlay = null;
      Under.SAVE.guardar(s);
      Under.UI.render();
      return;
    }

    s.fase = "anio";

    /* Si el lanzamiento automático del año explotó, salta la
       animación de oyentes antes de la próxima decisión. */
    if (s.ultimoLanzamiento && s.ultimoLanzamiento.esHit) {
      this.ultimaHit = s.ultimoLanzamiento;
      this.overlay = "hit";
      Under.SAVE.guardar(s);
      Under.UI.render();
      return;
    }

    this.overlay = null;
    this.siguienteEvento();
    Under.SAVE.guardar(s);
    Under.UI.render();
  },

  continuarHit: function () {
    this.overlay = null;
    this.ultimaHit = null;
    this.siguienteEvento();
    this.fase = "dashboard";
    Under.SAVE.guardar(this.estado);
    Under.UI.render();
  },

  /* ---------- Historial, misiones, retiro y reinicio ---------- */
  historial: function () {
    this.overlay = this.overlay === "historial" ? null : "historial";
    Under.UI.render();
  },

  /* Misiones: se muestran u ocultan detrás de un botón */
  toggleMisiones: function () {
    this.showMisiones = !this.showMisiones;
    Under.UI.render();
  },

  cerrarHistorial: function () {
    this.overlay = null;
    Under.UI.render();
  },

  confirmarReinicio: function () {
    this._confirmAccion = "reinicio";
    this.overlay = "confirmar";
    Under.UI.render();
  },

  confirmarRetiro: function () {
    this._confirmAccion = "retiro";
    this.overlay = "confirmar";
    Under.UI.render();
  },

  cancelar: function () {
    this.overlay = null;
    this._confirmAccion = null;
    Under.UI.render();
  },

  reiniciar: function () {
    var accion = this._confirmAccion;
    this._confirmAccion = null;

    /* Retiro: termina la carrera con un final de retiro */
    if (accion === "retiro" && this.estado) {
      Under.RETIRO.retirarse(this.estado);
      this.fase = "final";
      this.overlay = null;
      Under.SAVE.guardar(this.estado);
      Under.UI.render();
      return;
    }

    Under.SAVE.borrar();
    this.estado = null;
    this.fase = "inicio";
    this.overlay = null;
    this.ultimaResultado = null;
    document.body.style.removeProperty("--accent");
    Under.UI.render();
  }
};

/* Arranque */
document.addEventListener("DOMContentLoaded", function () {
  Under.MAIN.init();
});
