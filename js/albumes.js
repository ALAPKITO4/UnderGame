/* ============================================================
   UNDER — SISTEMA DE PROYECTOS / ÁLBUMES (FASE 4)
   Proyectos a largo plazo (EP o álbum): cuestan plata y energía,
   pero tienen un impacto mayor que un single. Sus cortes se
   desprenden como singles de forma natural.
   ============================================================ */

window.Under = window.Under || {};

Under.ALBUMS = {

  _pendiente: null,

  /* Nombre de proyecto (evita repetir entre proyectos) */
  _elegirNombre: function (state) {
    var nombres = Under.DATA.ALBUM_NAMES;
    var usados = {};
    for (var i = 0; i < state.albums.length; i++) {
      usados[state.albums[i].nombre] = true;
    }
    var pool = nombres.filter(function (n) { return !usados[n]; });
    if (pool.length === 0) pool = nombres;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* El proyecto más grande que tu nivel permite */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var mejor = null;
    for (var i = 0; i < Under.DATA.PROYECTOS.length; i++) {
      var p = Under.DATA.PROYECTOS[i];
      if (p.nivelMin <= nivel && (!mejor || p.nivelMin > mejor.nivelMin)) mejor = p;
    }
    return mejor;
  },

  crearEventoProyecto: function (state) {
    if (Under.ALBUMS._pendiente) return Under.ALBUMS._pendiente;

    var nombre = Under.ALBUMS._elegirNombre(state);

    var opciones = Under.DATA.PROYECTOS
      .filter(function (p) { return p.nivelMin <= Under.STATE.nivelCarrera(state).nivel; })
      .map(function (proy) {
        var costo = Under.SYSTEMS.efectivoEscala(state, proy.costo);

        return {
          texto: proy.nombre + " · " + Under.UI.fmtDinero(costo),
          desc: proy.desc + (proy.cortes ? " Sus cortes se convierten en singles." : ""),
          soloSi: function (s) { return s.stats.money >= costo; },
          efectos: function (s) {
            var est = { calidad: proy.calidad, viral: 0, texto: "proyecto " + proy.nombre };
            var L = Under.MUSIC._calcular(s, nombre, est);

            /* Un proyecto multiplica el alcance de un single */
            var cortesBonus = 1 + (proy.cortes || 0) * 0.25;
            L.repros = Math.round(L.repros * proy.base * cortesBonus);
            L.fans = Math.round(L.fans * proy.base * cortesBonus);
            L.dinero = Math.round(L.dinero * proy.base);
            L.tipo = proy.id;
            L.canciones = proy.canciones;

            s.totalReproducciones += L.repros;
            s.albums.push({
              año: s.año, tipo: proy.id, nombre: L.nombre, canciones: L.canciones,
              costo: costo, tier: L.tier, repros: L.repros, fans: L.fans,
              dinero: L.dinero, critica: L.critica
            });
            s.totalAlbums += 1;
            s.flags.albumEsteAnio = true;
            s.flags.tuvoAlbum = true;
            if (L.tier === "hit" || L.tier === "viral" || L.tier === "global") s.flags.tuvoHit = true;
            if (L.tier === "viral" || L.tier === "global") s.flags.tuvoViral = true;
            if (L.critica >= 4.5) s.flags.tuvoCritica = true;

            s.historial.push({
              año: s.año,
              texto: "Publicó el " + proy.nombre.toLowerCase() + " «" + L.nombre + "» (" + L.canciones + " canciones): " +
                L.tierIcono + " " + L.tierNombre + " — " + Under.UI.fmtExacto(L.repros) + " reproducciones."
            });

            Under.ALBUMS._pendiente = null;
            return {
              fans: L.fans, popularity: L.popularidad, talent: L.talento,
              money: L.dinero - costo, _energia: -15, _esAlbum: true, _lanzamiento: L
            };
          },
          resultado: function (s, efectos) {
            var L = efectos._lanzamiento;
            var cortesTxt = proy.cortes
              ? "\n\nSus cortes se desprenden como singles y la radio los rota por semanas."
              : "";
            return "Trabajaste meses en el " + proy.nombre.toLowerCase() + " «" + L.nombre + "» (" + L.canciones + " canciones).\n\n" +
              Under.MUSIC.TIER_FLAVOR[L.tier] + "\n\n" +
              L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones." + cortesTxt;
          },
          log: "Publicó el " + proy.nombre.toLowerCase() + " «" + nombre + "»."
        };
      });

    opciones.push({
      texto: "No trabajar en un proyecto este año",
      desc: "Preferís enfocarte en singles, giras y colaboraciones.",
      efectos: function (s) {
        s.flags.albumEsteAnio = true;
        Under.ALBUMS._pendiente = null;
        return {};
      },
      log: "No trabajó en ningún proyecto este año.",
      resultado: "Decidís que este año no hay proyecto. Los singles y el directo ocupan tu agenda."
    });

    var ev = {
      id: "album",
      recurrente: true,
      importante: true,
      titulo: "Un proyecto a largo plazo",
      texto: "Tenés en mente un proyecto grande: un EP o un álbum completo.\n\nImplica meses de trabajo, plata y energía.\n\n¿Te lanzás?",
      opciones: opciones
    };

    Under.ALBUMS._pendiente = ev;
    return ev;
  }
};
