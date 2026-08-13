/* ============================================================
   UNDER — BIOGRAFÍA Y LEGADO FINAL (PRIORIDAD 10)
   Al terminar la carrera, el juego no solo muestra números:
   cuenta una biografía. Un relato que arma el legado con los
   hitos reales de la partida (era en la que arrancó, premios,
   documental, mercados, crisis superadas, el público que quedó).

   El legado final no es un número crudo: es un título que la
   historia le pone a la carrera. La biografía se arma sola,
   leyendo el estado, y cada carrera tiene la suya.

   simple de jugar: es la recompensa de leer al final.
   profundo por dentro: la biografía refleja exactamente lo
   que viviste en la partida.
   ============================================================ */

window.Under = window.Under || {};

Under.BIOGRAFIA = {

  /* ---------- Título del legado según la carrera ---------- */

  rangoLegado: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var fans = state.stats.fans;
    var legado = state.legado || 0;
    var premios = state.totalPremios || 0;
    var mercados = (state.mercados || []).length;
    var documentales = state.documentales || 0;

    /* Los rangos se ordenan de menor a mayor legado. */
    if (nivel >= 8 || (fans >= 3000000 && premios >= 2)) {
      return { icono: "🌍", nombre: "Inmortal", desc: "Tu nombre ya es parte de la historia de la música." };
    }
    if (legado >= 60 && nivel >= 6) {
      return { icono: "👑", nombre: "Leyenda", desc: "Más que números: dejaste una huella que la industria cita." };
    }
    if (mercados >= 3 || documentales >= 1) {
      return { icono: "🌎", nombre: "Trascendente", desc: "Tu historia cruzó fronteras y se contó sola." };
    }
    if (nivel >= 6 || fans >= 500000) {
      return { icono: "⭐", nombre: "Grande", desc: "Llenaste escenarios y la gente te ubicó apenas escuchaba tu nombre." };
    }
    if (nivel >= 4) {
      return { icono: "🏛️", nombre: "Referente", desc: "La escena de tu país te respeta: fuiste de los que marcaron el camino." };
    }
    if (legado >= 25 || fans >= 50000) {
      return { icono: "🎛️", nombre: "Respetado", desc: "Los que te siguieron de cerca saben lo que construiste." };
    }
    if (state.stats.talent >= 70) {
      return { icono: "🕯️", nombre: "Culto", desc: "Poca masividad, enorme influencia: tu música marcó a los que te encontraron." };
    }
    return { icono: "🎵", nombre: "Propio", desc: "La carrera fue tuya, de principio a fin, a tu manera." };
  },

  /* ---------- Momentos destacados de la carrera ---------- */

  hitos: function (state) {
    var h = [];
    if (state.totalPremios) {
      var mayores = state.premios.filter(function (p) {
        return p.id === "trayectoria" || p.id === "global" || p.id === "album";
      });
      if (mayores.length) h.push("🏆 Levantó " + mayores.length + " premio" + (mayores.length === 1 ? "" : "s") + " mayor" + (mayores.length === 1 ? "" : "es"));
      else h.push("🏆 Ganó " + state.totalPremios + " premio" + (state.totalPremios === 1 ? "" : "s"));
    }
    if (state.documentales) h.push("🎬 Su historia se contó en pantalla");
    if (state.mercados.length) h.push("🌎 Conquistó " + state.mercados.length + " mercado" + (state.mercados.length === 1 ? "" : "s") + " internacional" + (state.mercados.length === 1 ? "" : "es"));
    if (state.flags.tuvoHit) h.push("🔥 Firmó su primer gran hit");
    if (state.flags.tuvoGiraMundial) h.push("🌏 Hizo una gira mundial");
    if (state.reinvenciones) h.push("🔄 Se reinventó " + state.reinvenciones + " vez" + (state.reinvenciones === 1 ? "" : "es"));
    if (state.flags.superoQuiebra) h.push("🧯 Sobrevivió a la quiebra y volvió");
    if (state.flags.superoCrisis) h.push("🧗 Salió del fondo cuando todo se apagaba");
    if (state.vendioCatalogo) h.push("📀 Vendió su catálogo");
    if (state.flags.tuvoHit && state.totalReproducciones >= 1000000) h.push("🎧 Pasó el millón de reproducciones");
    if (state.sello && state.sello.renegociado) h.push("🤝 Renegoció su contrato con " + state.sello.nombre);
    if (Under.RELACIONES && state.red) {
      var fuertes = state.red.filter(function (c) { return c.vinculo >= 60; }).length;
      if (fuertes) h.push("🕸️ Cuidó " + fuertes + " vínculo" + (fuertes === 1 ? "" : "s") + " que le abrieron puertas");
    }
    if (!h.length) h.push("🎵 Vivió la música de punta a punta");
    return h.slice(0, 4);
  },

  /* ---------- La biografía en sí ---------- */

  generar: function (state) {
    var rango = Under.BIOGRAFIA.rangoLegado(state);
    var era = Under.STATE.eraActual(state);
    var etapa = Under.STATE.etapaActual(state);
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var fans = state.stats.fans;

    var parrafo =
      "Arrancó en " + era.nombre + " con rap/trap/under y una " + state.artista.personalidad +
      " que lo llevó a " + etapa.nombre.toLowerCase() + ". ";

    if (state.stats.talent >= 80) {
      parrafo += "El talento le sobró desde el primer tema: los que lo escucharon una vez no lo soltaron. ";
    } else if (state.stats.talent >= 60) {
      parrafo += "Con oficio y oído, construyó un sonido que la escena aprendió a reconocer. ";
    } else {
      parrafo += "Sin ser un virtuoso, entendió algo más valioso: cómo llegarle a la gente. ";
    }

    if (nivel >= 6) {
      parrafo += "Su carrera cruzó las fronteras del under y se instaló donde muy pocos llegan. ";
    } else if (nivel >= 3) {
      parrafo += "Se hizo un lugar propio en la escena y lo defendió con trabajo. ";
    } else {
      parrafo += "Mantuvo la llama encendida donde otros se apagan: la escena lo recuerda. ";
    }

    if (state.stats.money >= 100000) {
      parrafo += "Terminó con la plata que el under promete a muy pocos. ";
    } else if (state.stats.money >= 20000) {
      parrafo += "Vivió de su música, que ya es más de lo que la mayoría consigue. ";
    } else {
      parrafo += "La plata nunca fue el centro: la música lo fue. ";
    }

    parrafo += "Frente a " + Under.UI.fmt(fans) + " fans y " + Under.UI.fmt(state.totalReproducciones) +
      " reproducciones en total.";

    return {
      rango: rango,
      hitos: Under.BIOGRAFIA.hitos(state),
      parrafo: parrafo
    };
  }
};
