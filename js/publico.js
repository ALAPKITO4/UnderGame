/* ============================================================
   UNDER — EL PÚBLICO (PRIORIDAD 3)
   Popularidad, fans, hype y reputación son cosas distintas:

   - popularidad (stat visible): cuánta gente te conoce. Es
     estructural: lo que queda cuando el ruido se apaga.
   - hype (0-100, interno): el ruido transitorio alrededor de tu
     nombre. Sube con los éxitos y se apaga solo: no podés vivir
     de él, pero empuja tus siguientes movimientos.
   - fans: se segmentan por dentro en casuales, fieles y
     hardcore. Los casuales vienen y se van con el hype; los
     fieles y hardcore son tu base real y la que mejor paga.
   - haters: el público que se volvió en contra. Crecen con las
     polémicas y limitan cuánto crece todo lo demás.
   - expectativas: lo que el público espera de tu próximo
     lanzamiento según tu historial reciente. Superarlas premia;
     defraudarlas se paga caro.

   simple de jugar (siguen viéndose 3 stats + fans), profundo
   por dentro: todo vive en el estado y modula resultados.
   ============================================================ */

window.Under = window.Under || {};

Under.PUBLICO = {

  /* ---------- Puntos de éxito por resultado ----------
     Sirven para medir expectativas: el promedio de tus últimos
     lanzamientos define el piso que el público espera. */
  TIER_PUNTOS: {
    fracaso: 10,
    normal: 30,
    exito: 45,
    hit: 62,
    viral: 80,
    cult: 55,
    global: 95
  },

  /* ---------- Expectativa actual (0-100) ----------
     Promedio de los últimos lanzamientos. Sin historial,
     el público arranca con una expectativa modesta. */
  expectativa: function (state) {
    var tiers = state.ultimosTiers || [];
    if (tiers.length === 0) return Under.DATA.CONFIG.EXPECTATIVA_DEFAULT;
    var suma = 0;
    for (var i = 0; i < tiers.length; i++) {
      suma += Under.PUBLICO.TIER_PUNTOS[tiers[i]] || 30;
    }
    return suma / tiers.length;
  },

  /* ---------- Registra un resultado en el historial reciente ---------- */
  registrarTier: function (state, tier) {
    if (!state.ultimosTiers) state.ultimosTiers = [];
    state.ultimosTiers.push(tier);
    if (state.ultimosTiers.length > 3) state.ultimosTiers.shift();
  },

  /* ---------- Chequeo de expectativas al lanzar ----------
     Compara el resultado del lanzamiento con lo que el público
     esperaba. Superarlo de sobra levanta el hype; quedar por
     debajo baja el hype, la reputación y espanta casuales. */
  aplicarHypeLanzamiento: function (state, L) {
    var pts = Under.PUBLICO.TIER_PUNTOS[L.tier] || 30;
    var exp = Under.PUBLICO.expectativa(state);
    var delta = pts - exp;
    var cfg = Under.DATA.CONFIG;

    if (delta >= cfg.HYPE_UMBRAL_BUENO) {
      var bonus = Under.STATE.clamp(Math.round(delta * 0.4), 2, 15);
      state.hype = Under.STATE.clamp(state.hype + bonus, 0, 100);
      if (state.hype >= 45) state.flags.hypeVivido = true;
    } else if (delta <= cfg.HYPE_UMBRAL_MALO) {
      var pena = cfg.HYPE_PENA + (state.hype >= 70 ? cfg.HYPE_PENA_SUBIDO : 0);
      state.hype = Under.STATE.clamp(state.hype - pena, 0, 100);
      state.reputacion = Under.STATE.clamp(state.reputacion - 2, 0, 100);
      var casuales = Math.max(0, state.stats.fans - (state.fansFieles || 0) - (state.fansHardcore || 0));
      var perdida = Math.round(casuales * 0.04);
      if (perdida > 0 && state.stats.fans > 0) {
        state.stats.fans = Math.max(0, state.stats.fans - perdida);
        state.fansFieles = Math.min(state.fansFieles || 0, state.stats.fans);
        state.fansHardcore = Math.min(state.fansHardcore || 0, Math.max(0, state.stats.fans - (state.fansFieles || 0)));
      }
      if (state.planAnio) {
        state.planAnio.momentos.push("El público esperaba más de «" + L.nombre + "». El hype bajó y parte del público se enfrió.");
      }
    }
    return delta;
  },

  /* ---------- Haters ----------
     El público que se volvió en contra. Cada polémica suma;
     con el tiempo algunos se aburren, pero nunca del todo. */
  agregarHaters: function (state, n) {
    if (!n || n <= 0) return;
    state.haters = Math.max(0, Math.round((state.haters || 0) + n));
    var cap = Math.max(0, Math.round((state.stats.fans || 0) * Under.DATA.CONFIG.HATERS_CAP));
    if (state.haters > cap) state.haters = cap;
  },

  /* ---------- Fidelidad de la base ----------
     Los fieles y hardcore compran más: la misma cantidad de
     streams rinde más cuando tenés base leal. */
  fidelidad: function (state) {
    var fieles = state.fansFieles || 0;
    var hard = state.fansHardcore || 0;
    return 1 + ((fieles + hard * 2) / (state.stats.fans + 1)) * 0.15;
  },

  /* ---------- Freno de los haters ----------
     Cuanto mayor es el número de haters frente a tus fans,
     más caro sale ganar cada oído nuevo. Nunca llega a 0:
     el odio también mueve gente, pero no de la buena. */
  haterFactor: function (state) {
    var f = 1 - Math.min(0.3, ((state.haters || 0) / (state.stats.fans + 1)) * 0.5);
    return Math.max(0.6, f);
  },

  /* ---------- Cierre de año ----------
     El hype se apaga solo, la base se afianza, los haters
     se enfrían un poco y, si el ruido murió, los casuales
     empiezan a buscar la próxima novedad. */
  cerrarAnio: function (state) {
    if (!state.planAnio) return;
    var cfg = Under.DATA.CONFIG;

    /* El hype vuela: se apaga rápido aunque la popularidad quede. */
    state.hype = Under.STATE.clamp(Math.round(state.hype * cfg.HYPE_DECAY), 0, 100);

    /* Balance de la base: los casuales que se quedaron se vuelven
       fieles, y los fieles de años, hardcore. Los que crecen no
       superan nunca el total de fans. Las escenas de culto
       (PRIORIDAD 5) fidelizan más rápido. */
    var total = state.stats.fans;
    var fieles = state.fansFieles || 0;
    var hard = state.fansHardcore || 0;
    var casuales = Math.max(0, total - fieles - hard);
    var genFid = Under.GENEROS ? Under.GENEROS.fidelidad(state) : 1;
    var f = Math.min(total, fieles + Math.round(casuales * cfg.FIDELIDAD_CASUAL * genFid));
    var h = Math.min(total - f, hard + Math.round(f * cfg.FIDELIDAD_HARDCORE));
    state.fansFieles = f;
    state.fansHardcore = h;

    /* Los haters no olvidan del todo, pero algunos se aburren. */
    state.haters = Math.round((state.haters || 0) * 0.92);
    var cap = Math.max(0, Math.round(total * cfg.HATERS_CAP));
    if (state.haters > cap) state.haters = cap;

    /* Hype muerto: el público casual se va a buscar otra novedad.
       Solo duele si alguna vez hubo hype de verdad (flags). */
    if (state.hype <= cfg.HYPE_FRIO && state.flags.hypeVivido) {
      var cas = Math.max(0, state.stats.fans - state.fansFieles - state.fansHardcore);
      var perdida = Math.round(cas * 0.08);
      if (perdida > 0 && state.stats.fans > 0) {
        state.stats.fans = Math.max(0, state.stats.fans - perdida);
        state.fansFieles = Math.min(state.fansFieles, state.stats.fans);
        state.fansHardcore = Math.min(state.fansHardcore, Math.max(0, state.stats.fans - state.fansFieles));
        state.planAnio.momentos.push("El hype se apagó y parte del público casual se fue: -" + Under.UI.fmt(perdida) + " fans.");
      }
    }
  },

  /* ---------- Etiqueta de hype para la interfaz ---------- */
  etiqueta: function (state) {
    var h = state.hype || 0;
    if (h >= 70) return { icono: "🛰️", texto: "En auge" };
    if (h >= 45) return { icono: "📡", texto: "Con ruido" };
    if (h >= 20) return { icono: "🔊", texto: "Tibio" };
    return { icono: "🔇", texto: "Apagado" };
  }
};
