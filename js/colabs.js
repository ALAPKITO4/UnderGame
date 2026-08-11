/* ============================================================
   UNDER — SISTEMA DE COLABORACIONES (FASE 3)
   Partners que escalan con tu nivel. Una colab genera un
   lanzamiento propio (con su tier) que suma fans, plata y
   talento según la audiencia y calidad del partner.
   ============================================================ */

window.Under = window.Under || {};

Under.COLABS = {

  _pendiente: null,

  /* Elige un partner acorde al nivel de carrera */
  _elegirPartner: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var tipo;
    if (nivel >= 6) tipo = Math.random() < 0.5 ? "estrella" : "culto";
    else if (nivel >= 3) tipo = "igual";
    else tipo = "emergente";
    var def = Under.DATA.PARTNERS[tipo];
    var nombre = def.nombres[Under.STATE.randInt(0, def.nombres.length - 1)];
    return {
      tipo: tipo,
      nombre: nombre,
      calidad: def.calidad,
      audiencia: def.audiencia,
      retencion: def.retencion,
      desc: def.desc
    };
  },

  crearEventoColab: function (state) {
    if (Under.COLABS._pendiente) return Under.COLABS._pendiente;

    var partner = Under.COLABS._elegirPartner(state);
    var nombreTema = Under.MUSIC._elegirNombre(state);
    var tituloTema = nombreTema + " (feat. " + partner.nombre + ")";
    var costo = Math.round(partner.calidad * 70 * Under.SYSTEMS.escala(state));

    var opciones = [];

    opciones.push({
      texto: "Grabar con " + partner.nombre + " · " + Under.UI.fmtDinero(costo),
      desc: partner.desc + ". Su audiencia puede descubrirte.",
      soloSi: function (s) { return s.stats.money >= costo; },
      efectos: function (s) {
        var est = { calidad: partner.calidad, viral: 0, texto: "colaboración con " + partner.nombre };
        var L = Under.MUSIC._calcular(s, tituloTema, est);

        /* La audiencia del partner multiplica el alcance y su retención
           deja menos dinero; su calidad se nota en el talento ganado. */
        L.repros = Math.round(L.repros * partner.audiencia);
        L.fans = Math.round(L.fans * partner.audiencia);
        L.dinero = Math.round(L.dinero * partner.retencion);
        L.talento = Math.floor(partner.calidad / 3) + (L.critica >= 4.5 ? 1 : 0);
        L.partner = partner.nombre;

        Under.MUSIC._registrar(s, L, est, costo);

        s.colaboraciones.push({
          año: s.año, nombre: L.nombre, partner: partner.nombre, tipo: partner.tipo,
          tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero
        });
        s.totalColabs += 1;
        s.flags.colabEsteAnio = true;

        Under.COLABS._pendiente = null;
        return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero - costo, _energia: -10, _lanzamiento: L };
      },
      resultado: function (s, efectos) {
        var L = efectos._lanzamiento;
        return "Grabás «" + L.nombre + "» junto a " + partner.nombre + ".\n\n" +
          Under.MUSIC.TIER_FLAVOR[L.tier] + "\n\n" +
          L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones en su primer año.";
      },
      log: "Colaboró con " + partner.nombre + " en «" + tituloTema + "»."
    });

    opciones.push({
      texto: "Declinar la propuesta",
      desc: "Guardás tu energía para tu carrera.",
      efectos: function (s) {
        s.flags.colabEsteAnio = true;
        Under.COLABS._pendiente = null;
        return {};
      },
      log: "Rechazó una colaboración con " + partner.nombre + ".",
      resultado: "Le decís que no por ahora. La oportunidad se pierde, pero tu agenda queda libre."
    });

    var ev = {
      id: "colab",
      recurrente: true,
      importante: true,
      titulo: "Una colaboración sobre la mesa",
      texto: partner.desc + ".\n\nProponen grabar un tema juntos.\n\n¿Qué hacés?",
      opciones: opciones
    };

    Under.COLABS._pendiente = ev;
    return ev;
  }
};
