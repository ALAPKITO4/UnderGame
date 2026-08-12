/* ============================================================
   UNDER — SHOWS EN EL UNDER (antes "festivales")
   No hay festivales: hay lugares de la escena. Cuanto mejor te
   va, más arriba tocás en los lugares del under (de La Sobre a
   Club Paraguay). Plata, fans, popularidad y legado según el
   lugar y tu tamaño.
   ============================================================ */

window.Under = window.Under || {};

Under.FESTIVALES = {

  _pendiente: null,

  /* Las stats de cada nivel de lugar del under. */
  _stats: [
    { costo: 300,  base: 900,  fans: 600,  popularidad: 3, legado: 2 },
    { costo: 400,  base: 1400, fans: 900,  popularidad: 3, legado: 2 },
    { costo: 600,  base: 2200, fans: 1600, popularidad: 4, legado: 3 },
    { costo: 1000, base: 3800, fans: 2800, popularidad: 5, legado: 3 },
    { costo: 2000, base: 7000, fans: 5500, popularidad: 6, legado: 4 }
  ],

  /* El mejor lugar del under que tu nivel permite: mientras mejor
     te va, más arriba tocás en la escena (La Sobre → Club
     Paraguay). Arriba del nivel 4, Club Paraguay es el techo. */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var piso = Math.max(0, Math.min(4, nivel));
    var pool = Under.DATA.LUGARES.filter(function (l) { return l.nivel === piso; });
    if (!pool.length) pool = Under.DATA.LUGARES;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* Alguien del público activo de la escena, para que el show se
     sienta de verdad. */
  _publico: function () {
    var a = Under.DATA.escena({ rol: "público activo" });
    var b = Under.DATA.escena({ rol: "público activo" });
    return a.nombre === b.nombre ? a.nombre : a.nombre + " y " + b.nombre;
  },

  crearEventoFestival: function (state) {
    if (Under.FESTIVALES._pendiente) return Under.FESTIVALES._pendiente;

    var lugar = Under.FESTIVALES._mejorOfrecible(state);
    if (!lugar) return null;
    var st = Under.FESTIVALES._stats[Math.min(4, lugar.nivel)];

    var opciones = [
      {
        texto: "🎤 Tocar en " + lugar.nombre,
        desc: "Un show en el under " + Under.UI.fmtDinero(st.base) + " de recaudación estimada.",
        efectos: function (s) {
          var costo = Under.SYSTEMS.efectivoEscala(s, st.costo);
          var bruto = Math.round(st.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
          var neto = bruto - costo;
          var fans = Under.SYSTEMS.fansEscala(s, st.fans);

          s.festivales.push({ id: lugar.nombre, año: s.año, nombre: lugar.nombre, emoji: "🎤", costo: costo, bruto: bruto, neto: neto, fans: fans });
          s.totalFestivales += 1;
          s.flags.festivalEsteAnio = true;
          s.flags.tuvoFestival = true;
          Under.FESTIVALES._pendiente = null;
          return { money: neto, fans: fans, popularity: st.popularidad, _energia: -20, _legado: st.legado };
        },
        resultado: function (s, efectos) {
          var gente = Under.FESTIVALES._publico();
          return "Tocás en " + lugar.nombre + " y el lugar está lleno. Entre el público están " + gente + ", y el fotógrafo de undercba saca las fotos de la noche.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
        },
        log: "Tocó en " + lugar.nombre + "."
      },
      {
        texto: "No tocar este año",
        desc: "El under también cansa.",
        efectos: function (s) {
          s.flags.festivalEsteAnio = true;
          Under.FESTIVALES._pendiente = null;
          return {};
        },
        log: "Declinó tocar en " + lugar.nombre + ".",
        resultado: "Decidís que este año no hay show. El estudio también es un escenario."
      }
    ];

    var ev = {
      id: "festival",
      recurrente: true,
      importante: true,
      titulo: "Un show en el under",
      texto: "Te proponen tocar en " + lugar.nombre + ", un lugar de la escena que respeta tu nombre.\n\nCon tu nivel, ese escenario ya es tuyo. ¿Lo agarrás?",
      opciones: opciones
    };

    Under.FESTIVALES._pendiente = ev;
    return ev;
  }
};
