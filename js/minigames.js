/* ============================================================
   UNDER — MINI-JUEGOS (PRIORIDAD 13)
   Antes de lanzar un tema, el juego te pone frente a una
   decisión creativa: letra, beat, video, portada o estrategia.
   Tres opciones, dos buenas y una mala. Si elegís bien, tu
   próximo tema rinde un 10% más. Si fallás, el tema fracasa.
   ============================================================ */

window.Under = window.Under || {};

Under.MINIGAMES = {

  _pendiente: null,

  /* Cada mini-juego: titulo, texto, 3 opciones (2 correctas, 1 mala),
     y el texto de resultado para el feedback visual. */
  _escenarios: [
    {
      id: "minijuego_letra",
      titulo: "Elegí la letra de tu próximo tema",
      texto: "Tu próximo tema necesita una letra que conecte. ¿Cuál elegís?",
      opciones: [
        { texto: "Escribir desde lo que viviste en la calle", correcta: true },
        { texto: "Copiar la estructura del hit del momento", correcta: false },
        { texto: "Contar una historia que nadie cuenta", correcta: true }
      ],
      ganaste: "✅ Elegiste bien. La letra tiene alma y la gente la va a sentir.",
      perdiste: "❌ Copiaste la estructura del hit del momento. Tu tema suena genérico y la gente lo salta."
    },
    {
      id: "minijuego_beat",
      titulo: "Elegí el beat de tu próximo tema",
      texto: "Tenés tres beats en la mesa. ¿Cuál le ponés a tu tema?",
      opciones: [
        { texto: "El que tiene un sample raro que encontraste", correcta: true },
        { texto: "El beat de moda que usan todos", correcta: false },
        { texto: "El que armaste vos a las 3 de la mañana", correcta: true }
      ],
      ganaste: "✅ El beat tiene identidad. Tu tema suena distinto y la gente lo nota.",
      perdiste: "❌ Elegiste el beat de moda. Tu tema se pierde entre miles iguales."
    },
    {
      id: "minijuego_video",
      titulo: "Elegí el concepto del videoclip",
      texto: "Tu tema necesita video. ¿Qué concepto le das?",
      opciones: [
        { texto: "Un video casero grabado en el barrio", correcta: true },
        { texto: "Un video con efectos caros pero sin historia", correcta: false },
        { texto: "Un video que cuenta la historia de la canción", correcta: true }
      ],
      ganaste: "✅ El video tiene alma. La gente lo comparte y tu tema crece solo.",
      perdiste: "❌ El video es caro pero vacío. Nadie lo mira dos veces."
    },
    {
      id: "minijuego_portada",
      titulo: "Elegí la portada de tu próximo single",
      texto: "La portada es lo primero que ve la gente. ¿Cuál elegís?",
      opciones: [
        { texto: "Una foto tuya en el lugar donde nació el tema", correcta: true },
        { texto: "Una imagen genérica de stock", correcta: false },
        { texto: "Un diseño hecho por un amigo artista", correcta: true }
      ],
      ganaste: "✅ La portada tiene identidad. La gente la reconoce al instante.",
      perdiste: "❌ La portada es genérica. Tu tema se pierde en el feed."
    },
    {
      id: "minijuego_estrategia",
      titulo: "Elegí la estrategia de lanzamiento",
      texto: "Tu tema está listo. ¿Cómo lo lanzás?",
      opciones: [
        { texto: "Lanzarlo un viernes a medianoche con teaser previo", correcta: true },
        { texto: "Subirlo sin aviso un martes a las 3 de la tarde", correcta: false },
        { texto: "Lanzarlo con un snippet en redes antes", correcta: true }
      ],
      ganaste: "✅ La estrategia funcionó. El teaser generó expectativa y el tema pega fuerte.",
      perdiste: "❌ Lanzaste sin aviso en el peor horario. Nadie lo vio."
    }
  ],

  /* Devuelve el mini-juego activo, eligiendo un escenario al azar. */
  crear: function (s) {
    if (this._pendiente) return this._pendiente;
    var esc = this._escenarios[Math.floor(Math.random() * this._escenarios.length)];
    var ev = {
      id: "minijuego",
      recurrente: true,
      importante: true,
      titulo: esc.titulo,
      texto: esc.texto,
      opciones: esc.opciones.map(function (op) {
        return {
          texto: op.texto,
          desc: op.correcta ? "Suena bien." : "Mmm…",
          correcta: op.correcta,
          efectos: function (state) {
            state.minijuegoResultado = op.correcta ? "ganado" : "perdido";
            state.minijuegoBonus = op.correcta ? 1.1 : 0.3;
            Under.MINIGAMES._pendiente = null;
            return {};
          },
          resultado: function () {
            return op.correcta ? esc.ganaste : esc.perdiste;
          },
          log: op.correcta
            ? "Acertó el mini-juego: " + esc.titulo
            : "Falló el mini-juego: " + esc.titulo
        };
      })
    };
    this._pendiente = ev;
    return ev;
  }
};
