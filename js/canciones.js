/* ============================================================
   UNDER — CANCIONES Y ÉXITO (PRIORIDAD 4)
   Un tema no es solo el día que sale: tiene vida propia.

   - El catálogo envejece: si dejás de sacar música, tus temas
     viejos rinden menos (pero los clásicos sostienen el valor).
   - Cada canción tiene un destino: hay éxitos que duran para
     siempre (clásicos), hits que fueron de su momento (efímeros)
     y canciones que un día, sin aviso, vuelven a sonar.
   - El público no olvida los grandes éxitos: un hit de hace
     años puede resurgir y volver a pagar.
   - One-hit wonder: un solo golpe de suerte no sostiene una
     carrera. La escena lo pregunta cuando los siguientes temas
     no dan la talla.

   simple de jugar, profundo por dentro: el jugador solo ve la
   discografía y, a veces, un evento; el resto vive en el estado.
   ============================================================ */

window.Under = window.Under || {};

Under.CANCIONES = {

  _pendientes: {},

  /* ---------- Vida del catálogo ----------
     Los temas viejos se escuchan menos con los años. El factor
     de novedad devalúa el streaming si no sacás música nueva.
     Tener un clásico sostiene el valor: la gente sigue volviendo. */
  factorNovedad: function (state) {
    var dg = state.discografia || [];
    if (dg.length === 0) return 1;
    var ult = dg[dg.length - 1];
    var anios = state.año - (ult.año || state.año);
    var f = anios === 0 ? 1 : anios === 1 ? 0.85 : 0.7;
    var tieneClasico = dg.some(function (d) { return d.tipo === "clasico"; });
    if (tieneClasico) f = Math.max(f, 0.85);
    return f;
  },

  /* ---------- Sumar reproducciones a un tema ----------
     Toda reproducción nueva que "cae" sobre una canción concreta
     se suma al tema Y al total, para que el total siga siendo la
     suma exacta de la discografía (lo verifica el smoke test). */
  _sumarRepros: function (state, cancion, n) {
    var add = Math.round(n);
    cancion.repros = (cancion.repros || 0) + add;
    state.totalReproducciones = (state.totalReproducciones || 0) + add;
  },

  /* ---------- Destino de cada canción ----------
     Pasados dos años, cada tema tiene un destino. La crítica
     separa el éxito comercial del éxito que perdura: un HIT con
     crítica alta se vuelve clásico; un HIT sin sostén, efímero. */
  _clasificar: function (state) {
    var dg = state.discografia || [];
    /* Carreras por género (PRIORIDAD 5): las escenas más
       respetadas por la crítica vuelven clásico más fácil. */
    var genCritica = Under.GENEROS ? Under.GENEROS.criticaBonus(state) : 0;
    for (var i = 0; i < dg.length; i++) {
      var d = dg[i];
      if (d.tipo || state.año - (d.año || state.año) < 2) continue;
      if (d.tier === "cult" || (d.critica && d.critica + genCritica * 0.6 >= 4.5)) {
        d.tipo = "clasico";
      } else if (d.tier === "hit" || d.tier === "viral" || d.tier === "global") {
        d.tipo = "efimero";
      } else {
        d.tipo = "comun";
      }
    }
  },

  /* ---------- Crecimiento de los clásicos ----------
     Las canciones que envejecen bien siguen sumando oídos año a
     año: la gente las descubre, las usa en bandas sonoras, las
     versiona. El largo aliento paga. */
  _crecerClasicos: function (state) {
    var dg = state.discografia || [];
    for (var i = 0; i < dg.length; i++) {
      var d = dg[i];
      if (d.tipo === "clasico" && state.año - (d.año || state.año) >= 2) {
        Under.CANCIONES._sumarRepros(state, d, d.repros * 0.06);
      }
    }
  },

  /* ---------- Cierre de año ---------- */
  cerrarAnio: function (state) {
    if (!state.discografia || !state.discografia.length) return;
    Under.CANCIONES._clasificar(state);
    Under.CANCIONES._crecerClasicos(state);
  },

  /* ---------- Último gran éxito ---------- */
  _ultimoHit: function (state) {
    var dg = state.discografia || [];
    for (var i = dg.length - 1; i >= 0; i--) {
      var t = dg[i].tier;
      if (t === "hit" || t === "viral" || t === "global") return dg[i];
    }
    return null;
  },

  /* Temas flojos consecutivos desde el último gran éxito */
  _flojosDesdeHit: function (state) {
    var dg = state.discografia || [];
    var n = 0;
    for (var i = dg.length - 1; i >= 0; i--) {
      var t = dg[i].tier;
      if (t === "hit" || t === "viral" || t === "global") break;
      if (t === "fracaso" || t === "normal" || t === "exito") n++;
    }
    return n;
  },

  /* ---------- Candidato a resurgir ----------
     Un tema con pasado que ya tiene unos años y que nunca volvió
     a sonar. Los efímeros tienen más historias que contar. */
  _candidatoRevival: function (state) {
    var dg = state.discografia || [];
    var buenos = ["hit", "viral", "global", "cult"];
    var candidatos = [];
    for (var i = 0; i < dg.length; i++) {
      var d = dg[i];
      if (d.resurgio) continue;
      if (buenos.indexOf(d.tier) === -1) continue;
      if (state.año - (d.año || state.año) < 3) continue;
      candidatos.push(d);
    }
    if (candidatos.length === 0) return null;
    /* Preferencia por los efímeros ya clasificados: más nostalgia */
    var efimeros = candidatos.filter(function (d) { return d.tipo === "efimero"; });
    var pool = efimeros.length ? efimeros : candidatos;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* ---------- Evento: un tema viejo vuelve a sonar ---------- */
  crearEventoRevival: function (state) {
    if (Under.CANCIONES._pendientes.revival) return Under.CANCIONES._pendientes.revival;
    var cancion = Under.CANCIONES._candidatoRevival(state);
    if (!cancion) return null;

    var ev = {
      id: "cat_revival",
      recurrente: true,
      importante: true,
      titulo: "Un tema viejo volvió a sonar",
      texto: "«" + cancion.nombre + "», que sacaste hace años, empezó a sonar de nuevo. Un reto, una película, una playlist nostálgica… nadie sabe bien por qué, pero la gente lo está escuchando otra vez.\n\nEl momento es de vos.",
      opciones: [
        {
          texto: "Aprovecharlo con una reedición",
          desc: "Costo de producción, pero el momento es ahora.",
          soloSi: function (s) { return s.stats.money >= Under.SYSTEMS.efectivoEscala(s, 300); },
          efectos: function (s) {
            Under.CANCIONES._pendientes.revival = null;
            s.flags.revivalEsteAnio = true;
            s.flags.ultimoRevival = s.año;
            cancion.resurgio = s.año;
            cancion.tipo = "clasico";
            Under.CANCIONES._sumarRepros(s, cancion, Under.SYSTEMS.efectivoEscala(s, 250000));
            return {
              money: -Under.SYSTEMS.efectivoEscala(s, 300),
              fans: Under.SYSTEMS.fansEscala(s, 1800),
              popularity: 3,
              _hype: 8,
              _energia: -8
            };
          },
          resultado: function (s) {
            return "Reeditás «" + cancion.nombre + "» con un sonido nuevo. El tema vuelve a las playlists y tu catálogo entero se beneficia.";
          },
          log: "Reeditó «" + cancion.nombre + "» en pleno resurgimiento."
        },
        {
          texto: "Soltar un video casero",
          desc: "Costo chico, menos alcance.",
          efectos: function (s) {
            Under.CANCIONES._pendientes.revival = null;
            s.flags.revivalEsteAnio = true;
            s.flags.ultimoRevival = s.año;
            cancion.resurgio = s.año;
            cancion.tipo = "clasico";
            Under.CANCIONES._sumarRepros(s, cancion, Under.SYSTEMS.efectivoEscala(s, 90000));
            return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 1, _hype: 4, _energia: -3 };
          },
          resultado: "Subís un video casero tocando «" + cancion.nombre + "» en tu estudio. La nostalgia hace el resto.",
          log: "Acompañó el resurgimiento de «" + cancion.nombre + "» con un video casero."
        },
        {
          texto: "No intervenir",
          desc: "Dejalo fluir solo.",
          efectos: function (s) {
            Under.CANCIONES._pendientes.revival = null;
            s.flags.revivalEsteAnio = true;
            s.flags.ultimoRevival = s.año;
            cancion.resurgio = s.año;
            cancion.tipo = "clasico";
            Under.CANCIONES._sumarRepros(s, cancion, Under.SYSTEMS.efectivoEscala(s, 40000));
            return { fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 1, _hype: 2 };
          },
          resultado: "No hacés nada y el tema resuena solo. La gente descubre (o recuerda) tu música.",
          log: "Dejó fluir el resurgimiento de «" + cancion.nombre + "»."
        }
      ]
    };

    Under.CANCIONES._pendientes.revival = ev;
    return ev;
  },

  /* ---------- Evento: ¿one-hit wonder? ----------
     Tuviste un gran éxito y después, varios temas flojos. La
     prensa empieza a preguntarse si fue un golpe de suerte. */
  crearEventoOneHit: function (state) {
    if (Under.CANCIONES._pendientes.onehit) return Under.CANCIONES._pendientes.onehit;
    var hit = Under.CANCIONES._ultimoHit(state);
    if (!hit) return null;

    var ev = {
      id: "cat_onehit",
      recurrente: true,
      importante: true,
      titulo: "¿Fue un golpe de suerte?",
      texto: "«" + hit.nombre + "» fue enorme. Pero los temas que vinieron después no dieron la talla, y ya hay notas hablando de one-hit wonder.\n\nLa pregunta flota en el aire: ¿cómo respondés?",
      opciones: [
        {
          texto: "Repetir la fórmula del éxito",
          desc: "El público quiere eso. La escena te mira distinto.",
          efectos: function (s) {
            Under.CANCIONES._pendientes.onehit = null;
            s.flags.oneHitUsado = true;
            s.flags.replicoHit = true;
            return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _hype: 6 };
          },
          resultado: "Vas a la segura: el sonido que funcionó, de nuevo. El público responde, aunque la crítica arquea la ceja.",
          log: "Repitió la fórmula de su gran éxito para callar el one-hit wonder."
        },
        {
          texto: "Reinventarte del todo",
          desc: "Arriesgado, pero te jugás la carrera de verdad.",
          efectos: function (s) {
            Under.CANCIONES._pendientes.onehit = null;
            s.flags.oneHitUsado = true;
            s.flags.seReinventoDelOneHit = true;
            s.reputacion = Under.STATE.clamp(s.reputacion + 3, 0, 100);
            return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 1, _energia: -6 };
          },
          resultado: "Cambiás de sonido, de imagen, de todo. Sale gente, queda otra. La crítica te aplaude el coraje.",
          log: "Se reinventó del todo para callar el one-hit wonder."
        },
        {
          texto: "Aguantar y seguir laburando",
          desc: "Ni fórmula ni revolución: constancia.",
          efectos: function (s) {
            Under.CANCIONES._pendientes.onehit = null;
            s.flags.oneHitUsado = true;
            s.experiencia = Under.STATE.clamp(s.experiencia + 3, 0, 100);
            return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 500) };
          },
          resultado: "No le das letra a la pregunta. Seguís grabando, y con el tiempo el título se cae solo.",
          log: "Aguantó el one-hit wonder con constancia."
        }
      ]
    };

    Under.CANCIONES._pendientes.onehit = ev;
    return ev;
  }
};
