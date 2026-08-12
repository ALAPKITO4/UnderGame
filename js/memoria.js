/* ============================================================
   UNDER — MEMORIA DE DECISIONES (PRIORIDAD 2)
   La escena no olvida. Cada decisión que deja huella se registra
   en state.memorias y alimenta una reputación (0-100) que se
   construye o se quema con los años.

   Consecuencias a largo plazo:
   - Las buenas acciones de hace tiempo siguen pagando dividendos
     cada año (y las puertas que cerraste siguen pesando).
   - Los hilos narrativos vuelven: el productor que rechazaste,
     la colaboración que se enfrió y el respeto (o el recelo) de
     toda la escena reaparecen cuando la carrera ya cambió.

   El registro es automático: al resolver una decisión, se mira
   qué flags de memoria activó y se guarda (systems.ejecutarDecision).
   ============================================================ */

window.Under = window.Under || {};

Under.MEMORIA = {

  _pendientes: {},

  /* ---------- Tabla de memoria: flag → recuerdo ----------
     Cada decisión memorable activa un flag; al activarlo se
     registra el recuerdo y se ajusta la reputación. tono:
     "buena" (la escena lo valora) / "mala" (la escena no lo
     olvida) / "neutra" (ambivalente). */
  TABLA: [
    { flag: "primeroPulido",    titulo: "Puliste tu primer tema hasta que sonó bien",       tono: "buena",  rep: 2 },
    { flag: "primeroCrudo",     titulo: "Publicaste tu primer tema crudo y directo",        tono: "neutra", rep: 0 },
    { flag: "primeroPrivado",   titulo: "Mostraste tu primer tema solo a tus amigos",       tono: "neutra", rep: 0 },
    { flag: "trabajoConProductor", titulo: "Trabajaste con el productor local",             tono: "buena",  rep: 3 },
    { flag: "rechazoProductor", titulo: "Rechazaste al productor local",                    tono: "mala",   rep: -2 },
    { flag: "tratoPuntual",     titulo: "Negociaste un trato puntual con el productor",     tono: "neutra", rep: 1 },
    { flag: "temaApresurado",   titulo: "Apuraste un tema por el momento",                  tono: "mala",   rep: -1 },
    { flag: "subioEscena",      titulo: "Improvisaste frente a la escena",                  tono: "neutra", rep: 1 },
    { flag: "hizoMerch",        titulo: "Empezaste a vender tu merch",                      tono: "buena",  rep: 1 },
    { flag: "condicionesDuras", titulo: "Pusiste condiciones duras en una colaboración",    tono: "mala",   rep: -3 },
    { flag: "independiente",    titulo: "Seguiste independiente",                           tono: "neutra", rep: 2 },
    { flag: "contratoUnDisco",  titulo: "Firmaste un contrato de un solo disco",            tono: "neutra", rep: 1 }
  ],

  /* ---------- Acceso a las memorias ---------- */
  recuerda: function (state, id) {
    if (!state.memorias) return false;
    for (var i = 0; i < state.memorias.length; i++) {
      if (state.memorias[i].id === id) return true;
    }
    return false;
  },

  cuantas: function (state) {
    return (state.memorias || []).length;
  },

  /* ---------- Registro manual (para decisiones fuera de la tabla) ---------- */
  registrar: function (state, id, titulo, tono, deltaRep) {
    if (Under.MEMORIA.recuerda(state, id)) return;
    state.memorias.push({ id: id, año: state.año, titulo: titulo, tono: tono });
    if (deltaRep) {
      state.reputacion = Under.STATE.clamp(state.reputacion + deltaRep, 0, 100);
    }
  },

  /* ---------- Registro automático desde una decisión ----------
     Se llama en systems.ejecutarDecision con la opción elegida.
     Por cada flag de la tabla que la opción activó, se guarda
     el recuerdo (una sola vez) y se ajusta la reputación. */
  _decisión: function (state, opcion) {
    if (!state.memorias || !opcion || !opcion.flags) return;
    for (var i = 0; i < Under.MEMORIA.TABLA.length; i++) {
      var t = Under.MEMORIA.TABLA[i];
      if (opcion.flags[t.flag]) {
        Under.MEMORIA.registrar(state, t.flag, t.titulo, t.tono, t.rep);
      }
    }
  },

  /* ---------- Consecuencias al cerrar el año (PRIORIDAD 2) ----------
     La reputación deriva lentamente hacia el perfil que construiste
     y lo sembrado (o lo quemado) hace años se cobra cada año. */
  cerrarAnio: function (state) {
    if (!state.memorias || !state.planAnio) return;

    var deriva = 0;
    for (var i = 0; i < state.memorias.length; i++) {
      var m = state.memorias[i];
      deriva += m.tono === "buena" ? 0.5 : m.tono === "mala" ? -0.5 : 0;
    }
    if (deriva !== 0) {
      state.reputacion = Under.STATE.clamp(state.reputacion + deriva, 0, 100);
    }

    /* Lo que sembraste hace tres o más años sigue dando frutos;
       las puertas que cerraste, todavía pesan. */
    var sembrado = 0, deudasViejas = 0;
    for (var j = 0; j < state.memorias.length; j++) {
      var mm = state.memorias[j];
      if (state.año - mm.año < 3) continue;
      if (mm.tono === "buena") sembrado++;
      if (mm.tono === "mala") deudasViejas++;
    }

    if (sembrado > 0) {
      var frutos = Math.round(Under.SYSTEMS.fansEscala(state, 60 * sembrado));
      state.stats.fans += frutos;
      state.planAnio.momentos.push("La escena recuerda tus buenos gestos de hace años: +" + Under.UI.fmt(frutos) + " fans.");
    }
    if (deudasViejas > 0) {
      var costo = Math.round(Under.SYSTEMS.fansEscala(state, 40 * deudasViejas));
      state.stats.fans = Math.max(0, state.stats.fans - costo);
      state.planAnio.momentos.push("Algunas puertas que cerraste años atrás siguen pesando: -" + Under.UI.fmt(costo) + " fans.");
    }
  },

  /* ---------- Cache de eventos (patrón de UNDER/GRANDE/EXTRA) ---------- */
  _crear: function (id, titulo, textos, opciones) {
    if (Under.MEMORIA._pendientes[id]) return Under.MEMORIA._pendientes[id];

    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: true,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };

    Under.MEMORIA._pendientes[id] = ev;
    return ev;
  },

  _limpiar: function (id) {
    Under.MEMORIA._pendientes[id] = null;
  },

  /* ---------- El productor que rechazaste (años 5-8) ----------
     El productor local al que le dijiste que no ahora es alguien.
     La escena cambió y las cuentas viejas vuelven a la mesa. */
  crearEventoProductor: function (state) {
    /* La misma persona que te ofreció grabar al comienzo: el nombre
       quedó guardado en la partida. */
    var nombre = (state.flags && state.flags.productorNombre) || Under.DATA.escena({ rol: "artista" }).nombre;
    return Under.MEMORIA._crear("mem_productor", "El productor que rechazaste", [
      nombre + ", ese productor local que te ofreció grabar hace años, ahora produce a una estrella nacional. Te lo cruzaste en un estudio y te miró dos veces.",
      "El productor al que le dijiste que no cuando arrancabas ahora maneja un estudio grande. " + nombre + " está al mando y tu manager te avisa que hay una sesión abierta."
    ], [
      {
        texto: "Reconocerlo y pedir disculpas",
        desc: "La humildad puede abrir la puerta que cerraste.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_productor");
          s.flags.memProductorUsado = true;
          Under.MEMORIA.registrar(s, "memProductorPaz", "Te reconciliaste con el productor que habías rechazado", "buena", 4);
          var efectos = { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _energia: -5 };
          if (Math.random() < 0.5) efectos.talent = 1;
          return efectos;
        },
        resultado: "Se lo decís de frente. Hace una pausa larga y después sonríe: 'Tenías razón en cuidar tu sonido'. La sesión queda abierta para vos.",
        log: "Se reconcilió con el productor que había rechazado."
      },
      {
        texto: "Hacer como que no te acordás",
        desc: "El orgullo tiene precio.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_productor");
          s.flags.memProductorUsado = true;
          Under.MEMORIA.registrar(s, "memProductorDesdén", "Se hizo el que no se acordaba del productor", "mala", -3);
          return { popularity: 1 };
        },
        resultado: "Lo saludás como a un desconocido. Él entiende todo y la puerta se cierra un poco más fuerte que antes.",
        log: "Se hizo el que no se acordaba del productor."
      },
      {
        texto: "Reconocerlo sin excusas",
        desc: "Ni disculpa ni desdén: la verdad cruda.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_productor");
          s.flags.memProductorUsado = true;
          Under.MEMORIA.registrar(s, "memProductorFranco", "Reconoció al productor sin pedir nada", "neutra", 1);
          return { talent: 1 };
        },
        resultado: "Lo reconocés y le decís la verdad: 'No era tu música, era mi control'. Él lo respeta, aunque sin abrir la puerta.",
        log: "Reconoció al productor sin pedir nada."
      }
    ]);
  },

  /* ---------- La escena se acuerda (reputación, cada ~3 años) ----------
     Cuando tu reputación se dispara o se desploma, la escena te
     lo hace saber: la gente que ayudaste sale a bancarte, o la
     gente a la que le diste la espalda sale a cobrar. */
  crearEventoEscena: function (state) {
    var alta = state.reputacion >= 55;

    if (alta) {
      return Under.MEMORIA._crear("mem_escena", "La escena te respalda", [
        "Los artistas a los que ayudaste cuando nadie los miraba salieron a bancarte en público. 'El de verdad nos dio una mano', dicen.",
        "Una leyenda de la escena contó cómo lo ayudaste hace años. La historia corre y te deja en otro lugar."
      ], [
        {
          texto: "Aceptar el respaldo",
          desc: "Lo sembrado vuelve.",
          efectos: function (s) {
            Under.MEMORIA._limpiar("mem_escena");
            s.flags.memEscenaEsteAnio = true;
            s.ultimaMemEscena = s.año;
            Under.MEMORIA.registrar(s, "memEscenaRespaldo", "La escena te respaldó en público", "buena", 2);
            return { fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 2, _relaciones: 3 };
          },
          resultado: "Aceptás el reconocimiento con la cabeza gacha. La escena confirma lo que ya sabía: sos de los nuestros.",
          log: "Recibió el respaldo de la escena."
        },
        {
          texto: "Devolverlo con un gesto",
          desc: "El respaldo se devuelve.",
          efectos: function (s) {
            Under.MEMORIA._limpiar("mem_escena");
            s.flags.memEscenaEsteAnio = true;
            s.ultimaMemEscena = s.año;
            Under.MEMORIA.registrar(s, "memEscenaDevolvio", "Devolvió el gesto a la escena", "buena", 3);
            return { fans: Under.SYSTEMS.fansEscala(s, 800), talent: 1, _relaciones: 5 };
          },
          resultado: "Lo convertís en un gesto concreto: una fecha gratis, un verso regalado. La escena lo va a repetir años.",
          log: "Devolvió el respaldo de la escena con un gesto."
        },
        {
          texto: "Esquivar el momento",
          desc: "El elogio también incomoda.",
          efectos: function (s) {
            Under.MEMORIA._limpiar("mem_escena");
            s.flags.memEscenaEsteAnio = true;
            s.ultimaMemEscena = s.año;
            return { fans: Under.SYSTEMS.fansEscala(s, 300) };
          },
          resultado: "No le das bola al elogio. La escena igual lo tomó bien, aunque un poco frío.",
          log: "Esquivó el respaldo de la escena."
        }
      ]);
    }

    return Under.MEMORIA._crear("mem_escena", "La escena no se olvida", [
      "En un evento, varios artistas te saludaron de lejos sin acercarse. Las cuentas viejas todavía se sienten en el aire.",
      "Un productor comentó en una juntada que 'con ese ya fue'. La escena tiene memoria larga y vos lo sabés."
    ], [
      {
        texto: "Afrontarlo de frente",
        desc: "Las cuentas se pagan o se cierran.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_escena");
          s.flags.memEscenaEsteAnio = true;
          s.ultimaMemEscena = s.año;
          Under.MEMORIA.registrar(s, "memEscenaAfronto", "Afrontó la bronca de la escena", "buena", 3);
          return { popularity: 1, _relaciones: 4 };
        },
        resultado: "Lo encarás. No es fácil, pero la escena anota que tuviste el valor de mirarla de frente.",
        log: "Afrontó la bronca de la escena."
      },
      {
        texto: "Gestionarlo en silencio",
        desc: "Apagar el fuego con plata y favores.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_escena");
          s.flags.memEscenaEsteAnio = true;
          s.ultimaMemEscena = s.año;
          return { money: -Under.SYSTEMS.efectivoEscala(s, 150) };
        },
        resultado: "Arreglás lo que se puede arreglar con favores y plata. El fuego baja, aunque la memoria queda.",
        log: "Apagó el conflicto de la escena en silencio."
      },
      {
        texto: "Enfrentarlo con orgullo",
        desc: "La escena puede esperar.",
        efectos: function (s) {
          Under.MEMORIA._limpiar("mem_escena");
          s.flags.memEscenaEsteAnio = true;
          s.ultimaMemEscena = s.año;
          Under.MEMORIA.registrar(s, "memEscenaOrgullo", "Se enfrentó a la escena con orgullo", "mala", -2);
          return { popularity: 2 };
        },
        resultado: "Le das la espalda a la escena. El ruido se nota, pero seguís con tu nombre en alto.",
        log: "Se enfrentó a la escena con orgullo."
      }
    ]);
  }
};
