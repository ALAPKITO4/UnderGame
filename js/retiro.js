/* ============================================================
   UNDER — SISTEMA DE RETIRO Y FINALES ALTERNOS (FASE 4)
   El final de la carrera depende del perfil: nivel, plata,
   energía, vida personal e inversiones. También podés
   retirarte antes del año 25.
   ============================================================ */

window.Under = window.Under || {};

Under.RETIRO = {

  /* Calcula el final según el perfil de la carrera.
     opts.retiro = true → retiro temprano (decisión del jugador). */
  calcularFinal: function (state, opts) {
    opts = opts || {};
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var talento = state.stats.talent;
    var energia = state.energia;
    var vida = state.relaciones;
    var money = state.stats.money;
    var titulo, historia, tipo;

    if (opts.retiro) {
      if (nivel >= 7) {
        titulo = "SE RETIRÓ EN LA CIMA";
        tipo = "retiro_cima";
        historia = "El mundo entero te escuchaba y elegiste irte cuando tu nombre valía más que nunca.\n\nDicen que los genios se van antes. Vos decidiste el cuándo.";
      } else if (nivel >= 5 && money >= 30000) {
        titulo = "RETIRO DORADO";
        tipo = "retiro_dorado";
        historia = "Dejaste la música con plata, prestigio y el respeto de la industria.\n\nNadie dice que llegaste tarde: decís que te fuiste siendo dueño de tu historia.";
      } else if (vida >= 65) {
        titulo = "SE FUE A VIVIR";
        tipo = "retiro_vida";
        historia = "Le dijiste adiós a los escenarios para vivir tu vida.\n\nNo lo veas como un final: es la decisión de alguien que entendió lo que de verdad importa.";
      } else if (nivel >= 3) {
        titulo = "RETIRO TEMPRANO";
        tipo = "retiro_temprano";
        historia = "Te retiraste con una carrera sólida y la cabeza en alto.\n\nPodrías haber seguido, pero elegiste tu propio final.";
      } else {
        titulo = "UNA CARRERA CORTA";
        tipo = "retiro_corto";
        historia = "No duró mucho, pero fue tuya.\n\nA veces la decisión más valiente es saber cuándo decir basta.";
      }
      return { titulo: titulo, historia: historia, nivel: nivel, tipo: tipo };
    }

    /* Fin natural en el año 25 */
    if (energia <= 15) {
      titulo = "SE APAGÓ EN LA CIMA";
      tipo = "burnout";
      historia = "Llegaste lejos, pero la maquinaria te consumió.\n\nTu carrera terminó en silencio, agotado, con el mundo todavía pidiendo más.";
    } else if (state.quiebra && money < 5000) {
      titulo = "BANCARROTA";
      tipo = "quiebra";
      historia = "La deuda te ganó la partida.\n\nLa música siguió sonando, pero tu nombre quedó como una advertencia para los que juegan con plata que no tienen.";
    } else if (state.flags.superoQuiebra) {
      titulo = "SOBREVIVIÓ A LA QUIEBRA";
      tipo = "supero_quiebra";
      historia = "Tocaste fondo, vendiste todo y volviste.\n\nReconstruiste tu carrera desde las cenizas. Esa historia vale más que cualquier récord.";
    } else if (nivel >= 8) {
      titulo = "FAMA MUNDIAL";
      tipo = "leyenda";
      historia = "Empezaste grabando en tu habitación y terminaste siendo escuchado por el mundo entero.\n\nTu nombre ya es parte de la historia de la música.";
    } else if (state.legado >= 60 && nivel >= 6) {
      titulo = "LEYENDA DE LA INDUSTRIA";
      tipo = "legado";
      historia = "Más que números: dejaste una huella.\n\nDocumentales, reinvenciones y un nombre que la industria cita como ejemplo. Tu legado trasciende tus ventas.";
    } else if (state.inversiones.length >= 2 && money >= 50000) {
      titulo = "EMPRESARIO DE LA MÚSICA";
      tipo = "imperio";
      historia = "La música te abrió las puertas y vos construiste un imperio.\n\nCatálogo, propiedades y negocios: sos más que un artista.";
    } else if (vida >= 70 && nivel >= 5) {
      titulo = "FAMA Y FAMILIA";
      tipo = "familia";
      historia = "Llenaste estadios y aun así nunca perdiste a los tuyos.\n\nEsa es la combinación que casi nadie logra.";
    } else if (nivel >= 7) {
      titulo = "SUPERESTRELLA";
      tipo = "estrella";
      historia = "Tu nombre cruza fronteras. Llenás escenarios, rompés récords y el planeta entero te escucha.";
    } else if (nivel >= 6) {
      titulo = "ESTRELLA";
      tipo = "estrella";
      historia = "Conseguiste una audiencia enorme y una carrera sólida. La gente te ubica apenas escucha tu nombre.";
    } else if (nivel >= 5) {
      titulo = "ARTISTA RELEVANTE";
      tipo = "relevante";
      historia = "La industria te respeta y tu carrera es seria. No llegaste a la cima, pero construiste algo real.";
    } else if (nivel >= 4) {
      titulo = "ESTRELLA NACIONAL";
      tipo = "nacional";
      historia = "Tu país entero conoce tu música. Podrías no haber conquistado el mundo, pero conquistaste tu casa.";
    } else if (talento >= 70 && nivel >= 2 && state.stats.popularity < 60) {
      titulo = "ARTISTA DE CULTO";
      tipo = "culto";
      historia = "Nunca llenaste estadios, pero tu influencia es enorme. Tu música marcó a una generación que la defiende con fiereza.";
    } else if (nivel >= 2) {
      titulo = "LEYENDA UNDERGROUND";
      tipo = "underground";
      historia = "La fama masiva te esquivó, pero la escena te respeta. Tu carrera fue tuya, de principio a fin.";
    } else {
      titulo = "UNA CARRERA DISCRETA";
      tipo = "discreta";
      historia = "No todas las carreras terminan en estadios. Viviste la música a tu manera, y eso también es una historia.";
    }

    return { titulo: titulo, historia: historia, nivel: nivel, tipo: tipo };
  },

  /* Retiro temprano: el jugador decide terminar su carrera */
  retirarse: function (state) {
    state.retirado = true;
    state.añoRetiro = state.año;
    state.resultadoFinal = Under.RETIRO.calcularFinal(state, { retiro: true });
    state.terminada = true;
    state.fase = "final";
    state.historial.push({ año: state.año, texto: "Anunció su retiro de la música." });
    Under.SYSTEMS.chequearLogros(state);
  }
};
