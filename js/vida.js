/* ============================================================
   UNDER — SISTEMA DE VIDA PERSONAL (FASE 4)
   Eventos que ponen en la balanza la carrera contra el bienestar.
   Cada decisión mueve energía (agotamiento) y relaciones.
   ============================================================ */

window.Under = window.Under || {};

Under.VIDA = {

  _pendiente: null,

  crearEventoVida: function (state) {
    if (Under.VIDA._pendiente) return Under.VIDA._pendiente;

    var v = Under.DATA.VIDA[Under.STATE.randInt(0, Under.DATA.VIDA.length - 1)];

    var opciones = [
      {
        texto: "Ponerte la carrera por delante",
        desc: "La oportunidad no espera.",
        efectos: function (s) {
          Under.VIDA._pendiente = null;
          return { fans: Under.SYSTEMS.fansEscala(s, 2500), popularity: 2, _energia: -15, _relaciones: -6 };
        },
        resultado: "Elegís la música. Cuesta, pero esta vez la carrera gana.\n\nEl año te consume un poco.",
        log: "Priorizó la carrera sobre su vida personal."
      },
      {
        texto: "Elegir tu vida personal",
        desc: "Hay cosas que la plata no reemplaza.",
        efectos: function (s) {
          Under.VIDA._pendiente = null;
          return { fans: -Under.SYSTEMS.fansEscala(s, 600), popularity: -2, _energia: 30, _relaciones: 8 };
        },
        resultado: "Elegís a los tuyos. Recargás energía y tu vida personal florece.\n\nLa carrera espera un poco.",
        log: "Priorizó su vida personal."
      },
      {
        texto: "Buscar el equilibrio",
        desc: "Sin dejar nada en el camino.",
        efectos: function (s) {
          Under.VIDA._pendiente = null;
          return { fans: Under.SYSTEMS.fansEscala(s, 800), _energia: 12, _relaciones: 3 };
        },
        resultado: "Encontrás la forma de hacer ambas cosas. No es perfecto, pero funciona.",
        log: "Buscó el equilibrio entre carrera y vida."
      }
    ];

    var ev = {
      id: "vida",
      recurrente: true,
      importante: true,
      titulo: v.titulo,
      texto: v.texto + "\n\n¿Qué pesa más este año?",
      opciones: opciones
    };

    Under.VIDA._pendiente = ev;
    return ev;
  }
};
