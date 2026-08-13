/* ============================================================
   UNDER — SISTEMA DE GIRAS (FASE 3)
   Oportunidades de gira que escalan con el nivel de carrera.
   Aceptar: gastás, recaudás y sumás fans.
   ============================================================ */

window.Under = window.Under || {};

Under.GIRAS = {

  _pendiente: null,
  _fechaPendiente: null,

  /* La gira más grande que tu nivel permite */
  _mejorOfrecible: function (state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    var mejor = null;
    for (var i = 0; i < Under.DATA.GIRAS.length; i++) {
      var g = Under.DATA.GIRAS[i];
      if (g.nivel <= nivel && (!mejor || g.nivel > mejor.nivel)) mejor = g;
    }
    return mejor;
  },

  crearEventoGira: function (state) {
    if (Under.GIRAS._pendiente) return Under.GIRAS._pendiente;

    var gira = Under.GIRAS._mejorOfrecible(state);
    if (!gira) return null;

    var opciones = [];

    opciones.push({
      texto: "Aceptar: " + gira.nombre,
      desc: gira.desc,
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, gira.costo);
        var bruto = Math.round(gira.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        /* El agente consigue mejores fechas (+20% fans) y el manager
           mejores contratos (+10% de ganancia) */
        var agente = (Under.EQUIPO && Under.EQUIPO.tiene(s, "agente")) ? 1.2 : 1;
        var manager = (Under.EQUIPO && Under.EQUIPO.tiene(s, "manager")) ? 1.1 : 1;
        /* hongo TV en el equipo consigue mejores fechas (+20% fans) */
        var hongo = (s.flags && s.flags.hongoTvEquipo) ? 1.2 : 1;

        /* Giras que cruzan fronteras (FASE 5): aceptás el compromiso
           y la fecha del show decide el resultado. Se viaja a un
           lugar grande del exterior con su propia historia: la fecha
           puede salir redonda o convertirse en un desastre. */
        if (gira.id === "regional" || gira.id === "internacional" || gira.id === "mundial") {
          var venue = Under.GIRAS._elegirVenue(gira);
          s.giraActiva = {
            gira: gira,
            venue: venue,
            escenario: Under.GIRAS._elegirEscenario(),
            costo: costo,
            brutoBase: bruto,
            fansBase: Math.round(Under.SYSTEMS.fansEscala(s, gira.fans) * agente * hongo),
            manager: manager
          };
          s.totalGiras += 1;
          s.flags.giraEsteAnio = true;
          if (gira.id === "mundial") s.flags.tuvoGiraMundial = true;

          Under.GIRAS._pendiente = null;
          return { _energia: -5 };
        }

        var neto = Math.round((bruto - costo) * manager);
        var fans = Math.round(Under.SYSTEMS.fansEscala(s, gira.fans) * agente * hongo);

        s.giras.push({ año: s.año, nombre: gira.nombre, costo: costo, bruto: bruto, neto: neto, fans: fans });
        s.totalGiras += 1;
        s.flags.giraEsteAnio = true;
        if (gira.id === "mundial") s.flags.tuvoGiraMundial = true;

        Under.GIRAS._pendiente = null;
        return { money: neto, fans: fans, popularity: gira.popularidad, _energia: -20 };
      },
      resultado: function (s, efectos) {
        if (gira.id === "regional" || gira.id === "internacional" || gira.id === "mundial") {
          var ga = s.giraActiva;
          return "Aceptás la " + gira.nombre + ".\n\nViajás a " + ga.venue.pais + " para tocar en " +
            ga.venue.nombre + " (" + ga.venue.ciudad + ", " + Under.UI.fmtExacto(ga.venue.capacidad) +
            " de capacidad).\n\nTu equipo ya está allá y la fecha suena fuerte en la ciudad. Todo se define la noche del show.";
        }
        return "La " + gira.nombre + " es un éxito.\n\n" +
          "Recaudaste " + Under.UI.fmtExacto(efectos.money) + " de ganancia y sumaste " +
          Under.UI.fmtExacto(efectos.fans) + " fans nuevos.\n\n" +
          "Entre el público están " + Under.DATA.publico(2) + ", y el fotógrafo de undercba te dedica una postal de la gira.";
      },
      log: function (s, efectos) {
        if (gira.id === "regional" || gira.id === "internacional" || gira.id === "mundial") {
          var ga = s.giraActiva;
          return "Aceptó la " + gira.nombre + ": fecha en " + ga.venue.nombre + " (" + ga.venue.ciudad + ", " + ga.venue.pais + ").";
        }
        return "Hizo la " + gira.nombre + ".";
      }
    });

    opciones.push({
      texto: "Dejarla para otro momento",
      desc: "Este año preferís no salir de gira.",
      efectos: function (s) {
        s.flags.giraEsteAnio = true;
        Under.GIRAS._pendiente = null;
        return {};
      },
      log: "Dejó pasar la oportunidad de una gira.",
      resultado: "Decidís que este año no hay gira. La música sigue trabajando por vos desde el estudio."
    });

    var ev = {
      id: "gira",
      recurrente: true,
      importante: true,
      titulo: "Oportunidad de gira",
      texto: "Te ofrecen hacer la " + gira.nombre + ".\n\n" + gira.desc + "\n\n¿La tomás?",
      opciones: opciones
    };

    Under.GIRAS._pendiente = ev;
    return ev;
  },

  /* ============================================================
     GIRAS AL EXTERIOR — LA FECHA DEL SHOW (FASE 5)
     Aceptar una gira que cruza fronteras es solo el principio:
     la noche del show, en el estadio o lugar grande del exterior,
     pasa algo que puede hacer la fecha redonda... o un desastre
     (política, clima, mafias, fallas). Cada escenario se resuelve
     con una decisión propia.
     ============================================================ */

  ESCENARIOS: {

    /* ---------- Que la fecha salga muy bien ---------- */
    noche_perfecta: {
      titulo: "La noche es redonda",
      bueno: true,
      texto: function (ga) {
        return "El día del show, " + ga.venue.nombre + " (" + ga.venue.ciudad + ", " + ga.venue.pais + ") está impecable: el sonido suena cristalino, la producción llegó temprano y el clima acompaña.\n\nTodo conspira para que esta sea una noche de las que hacen historia.";
      },
      opciones: [
        { texto: "Darlo todo en el escenario", desc: "Una noche perfecta merece un set perfecto.",
          multMoney: 1.3, multFans: 1.25, extraPop: 2, extraHype: 10, extraLegado: 4, energia: -20,
          flavor: "Subís y la noche sale redonda, de esas que el público cuenta por años.",
          log: "dio todo en una noche perfecta." },
        { texto: "Sumar un invitado local", desc: "La escena local se suma al cartel.",
          multMoney: 1.15, multFans: 1.4, extraPop: 3, extraRel: 4, extraLegado: 3, energia: -18,
          flavor: "Invitás a un artista del país a cantar una parte. La escena local se enciende y los fans llegan por montones.",
          log: "sumó un invitado local en una noche perfecta." },
        { texto: "Guardar energía", desc: "No todo hay que exprimirlo.",
          multMoney: 1.05, multFans: 1.05, extraPop: 1, energia: -10,
          flavor: "Hacés un set sólido sin gastar toda la pólvora. Sano y prolijo.",
          log: "cuidó su energía en una noche perfecta." }
      ]
    },

    show_viral: {
      titulo: "El show se hace viral",
      bueno: true,
      texto: function (ga) {
        return "A mitad de la fecha en " + ga.venue.nombre + ", alguien filma un momento tuyo que explota en las redes en cuestión de horas. El nombre de " + ga.venue.ciudad + " y el del estadio se repiten en todos lados.";
      },
      opciones: [
        { texto: "Alimentar el momento", desc: "El clip pide más leña.",
          multMoney: 1.1, multFans: 1.5, extraPop: 4, extraHype: 20, extraLegado: 2, energia: -18,
          flavor: "Reposteás el clip, subís el detrás de escena y el video sigue explotando. El mundo quiere saber quién sos.",
          log: "alimentó el momento viral de la fecha." },
        { texto: "Mantenerlo simple", desc: "Dejás que el video respire solo.",
          multMoney: 1.0, multFans: 1.25, extraPop: 2, extraHype: 10, energia: -12,
          flavor: "No lo forzás, pero el momento ya es tuyo. La gente habla del show igual.",
          log: "dejó crecer el viral sin forzarlo." },
        { texto: "No subir nada", desc: "Lo que pasa en el escenario, queda en el escenario.",
          multMoney: 0.95, multFans: 1.1, extraPop: 1, energia: -10,
          flavor: "El video vive solo y crece despacio. Algo queda igual.",
          log: "no alimentó el viral de la fecha." }
      ]
    },

    invitado_sorpresa: {
      titulo: "Un invitado sorpresa",
      bueno: true,
      texto: function (ga) {
        return "Antes de salir, una figura enorme de " + ga.venue.pais + " aparece en el backstage de " + ga.venue.nombre + ": quiere cantar tu tema más fuerte con vos. El rumor corre y el público enloquece antes de que empiece la música.";
      },
      opciones: [
        { texto: "Compartir el escenario", desc: "Su nombre y el tuyo en el mismo cartel.",
          multMoney: 1.2, multFans: 1.45, extraPop: 4, extraRel: 5, extraLegado: 3, energia: -20,
          flavor: "Cantás con la figura local y el estadio estalla. Esa dupla se comenta durante meses.",
          log: "compartió escenario con una figura local." },
        { texto: "Solo un tema", desc: "Un pedacito de magia, sin robarse el show.",
          multMoney: 1.1, multFans: 1.3, extraPop: 3, extraRel: 3, energia: -15,
          flavor: "Hacen un solo tema juntos. Alcanza para que la noche sea inolvidable.",
          log: "hizo un tema con una figura local." },
        { texto: "Declinar con respeto", desc: "No querés que el foco se mueva.",
          multMoney: 0.95, multFans: 1.0, extraPop: 0, energia: -10,
          flavor: "Lo declinás con respeto. El gesto igual se valora y la puerta queda abierta.",
          log: "declinó a un invitado sorpresa con respeto." }
      ]
    },

    overbooking: {
      titulo: "Agotado y lleno",
      bueno: true,
      texto: function (ga) {
        return "La fecha en " + ga.venue.nombre + " está agotada desde hace semanas y hoy " + ga.venue.ciudad + " entera quiere entrar. La taquilla no da abasto y te ofrecen abrir más espacio.";
      },
      opciones: [
        { texto: "Abrir las tribunas extra", desc: "Más gente, más plata, más noche.",
          multMoney: 1.5, multFans: 1.1, extraPop: 1, extraHype: 8, energia: -20,
          flavor: "Llenás cada rincón disponible. El estadio no respira y vos tampoco.",
          log: "llenó las tribunas extra de la fecha." },
        { texto: "Bajar el precio de las últimas", desc: "El que queda afuera, entra igual.",
          multMoney: 1.3, multFans: 1.25, extraPop: 2, extraHype: 8, energia: -16,
          flavor: "Las últimas entradas vuelan baratas y la fecha queda de pie.",
          log: "abrió entradas a precio bajo en una fecha agotada." },
        { texto: "Dejarlo como está", desc: "Lo que estaba vendido, alcanza.",
          multMoney: 1.2, multFans: 1.0, extraPop: 1, energia: -12,
          flavor: "La fecha sale con lo que estaba vendido. Nadie se queja.",
          log: "dejó la fecha agotada tal cual estaba." }
      ]
    },

    /* ---------- Problemas políticos ---------- */
    politica_protestas: {
      titulo: "Protestas en la ciudad",
      bueno: false,
      texto: function (ga) {
        return "El día de la fecha, " + ga.venue.ciudad + " explota en protestas. Las calles están cortadas, la policía desvía todo el tránsito y " + ga.venue.nombre + " queda rodeado por un operativo de seguridad. El show puede caerse.";
      },
      opciones: [
        { texto: "Aguantar y tocar igual", desc: "La música como resistencia.",
          multMoney: 0.55, multFans: 0.7, extraPop: -1, extraLegado: 3, energia: -20,
          flavor: "Tocás para los que llegaron a pesar de todo. Mística de resistencia que la escena recuerda.",
          log: "aguantó y tocó en medio de las protestas." },
        { texto: "Reprogramar la fecha", desc: "La movés unas semanas.",
          multMoney: 0.4, multFans: 0.5, energia: -8,
          flavor: "La fecha se corre. Parte de la gente se entera tarde y el entusiasmo baja.",
          log: "reprogramó la fecha por las protestas." },
        { texto: "Cancelar", desc: "No hay show que valga el riesgo.",
          multMoney: 0.1, multFans: 0, extraPop: -3, extraLegado: -2, energia: -5,
          flavor: "Cancelás. Perdés lo invertido y la prensa local te olvida rápido.",
          log: "canceló la fecha por las protestas." }
      ]
    },

    politica_gobierno: {
      titulo: "El gobierno cancela el evento",
      bueno: false,
      texto: function (ga) {
        return "Por una decisión política de última hora, las autoridades de " + ga.venue.pais + " cancelan los eventos masivos en " + ga.venue.ciudad + ". " + ga.venue.nombre + " queda cerrado el mismo día de la fecha.";
      },
      opciones: [
        { texto: "Apelar con tus contactos", desc: "Tu equipo de prensa negocia hasta el final.",
          multMoney: 0.5, multFans: 0.6, extraPop: 0, energia: -12,
          flavor: "Tu equipo apela con contactos locales. A veces alcanza y la fecha se sostiene a medias.",
          log: "apeló la cancelación del gobierno.",
          riesgo: { prob: 0.35, multMoney: 0.2, multFans: 0.25, extraPop: -2, energia: -12,
            flavor: "La apelación no prospera: la orden del gobierno es final y la fecha se cae igual.",
            log: "fracasó en apelar la cancelación del gobierno." } },
        { texto: "Reprogramar", desc: "Esperar a que la tormenta política pase.",
          multMoney: 0.35, multFans: 0.45, energia: -8,
          flavor: "La fecha se corre para otro momento. El gobierno afloja y vos también.",
          log: "reprogramó la fecha por la decisión del gobierno." },
        { texto: "Cancelar", desc: "Contra el Estado no se puede.",
          multMoney: 0.1, multFans: 0, extraPop: -4, extraLegado: -3, energia: -5,
          flavor: "Cancelás. La política del país ganó y tu nombre queda en la lista negra de esa fecha.",
          log: "canceló la fecha por la decisión del gobierno." }
      ]
    },

    politica_visado: {
      titulo: "Problemas de visado en la frontera",
      bueno: false,
      texto: function (ga) {
        return "Al aterrizar en " + ga.venue.pais + " te retienen en migraciones: un problema de papeles con tu visado. Tu equipo mira el reloj y " + ga.venue.nombre + " espera lleno.";
      },
      opciones: [
        { texto: "Esperar a que se resuelva", desc: "Los papeles llegan... o no.",
          multMoney: 0.5, multFans: 0.6, extraPop: -1, energia: -10,
          flavor: "Los trámites se destraban tarde. Llegás a medias y la fecha arranca con demora.",
          log: "esperó el visado y llegó tarde a la fecha.",
          riesgo: { prob: 0.3, multMoney: 0.15, multFans: 0.2, extraPop: -2, energia: -10,
            flavor: "El visado no llega a tiempo: perdés el show y la noche queda en manos del telonero.",
            log: "no consiguió el visado a tiempo." } },
        { texto: "Llamar a la embajada", desc: "Que el peso de tu nombre mueva la burocracia.",
          multMoney: 0.65, multFans: 0.7, extraPop: 0, energia: -12,
          flavor: "Un llamado de la embajada destraba los papeles. La fecha sale, apretada pero sale.",
          log: "resolvió el visado con la embajada." },
        { texto: "Volver a casa", desc: "Otra frontera será.",
          multMoney: 0.1, multFans: 0, extraPop: -3, extraLegado: -2, energia: -5,
          flavor: "Volvés sin tocar. El sueño de esa ciudad espera un visado mejor.",
          log: "volvió a casa por el problema de visado." }
      ]
    },

    /* ---------- Problemas de clima ---------- */
    clima_tornado: {
      titulo: "Alerta de tornado",
      bueno: false,
      texto: function (ga) {
        return "Los meteorólogos de " + ga.venue.ciudad + " activan alerta por tornado. El cielo se pone verde, el viento tira lo que encuentra y " + ga.venue.nombre + " decide si abrir o no las puertas.";
      },
      opciones: [
        { texto: "Tocar igual, sin techo", desc: "La fecha legendaria del aguante.",
          multMoney: 0.5, multFans: 0.65, extraPop: -1, extraLegado: 3, energia: -22,
          flavor: "Tocás mientras el viento pelea. Los que quedaron lo cuentan como la fecha más salvaje de todas.",
          log: "tocó con alerta de tornado de fondo.",
          riesgo: { prob: 0.4, multMoney: 0.2, multFans: 0.3, extraPop: -3, extraLegado: 1, energia: -22,
            flavor: "El tornado pasa encima y la fecha se corta a la mitad. El susto queda grabado.",
            log: "el tornado cortó la fecha a la mitad." } },
        { texto: "Esperar a que pase", desc: "El cielo manda.",
          multMoney: 0.45, multFans: 0.5, energia: -8,
          flavor: "Esperás el despeje y tocás para los que no se fueron. La noche queda rara.",
          log: "esperó el tornado y tocó tarde." },
        { texto: "Cancelar", desc: "Nadie se juega la vida por un show.",
          multMoney: 0.1, multFans: 0, extraPop: -2, energia: -5,
          flavor: "Cancelás y la ciudad entiende: el clima no se negocia.",
          log: "canceló la fecha por la alerta de tornado." }
      ]
    },

    clima_tsunami: {
      titulo: "Alerta de tsunami en la costa",
      bueno: false,
      texto: function (ga) {
        return "Un sismo en el mar activa la alerta de tsunami para toda la costa donde está " + ga.venue.nombre + ". Las sirenas suenan y la gente evacúa las zonas bajas de " + ga.venue.ciudad + ".";
      },
      opciones: [
        { texto: "Tocar en altura", desc: "Movés la fecha a un punto seguro.",
          multMoney: 0.45, multFans: 0.55, extraLegado: 2, energia: -16,
          flavor: "Reacomodás el show en un punto alto. Pocos se enteran y toca menos gente.",
          log: "movió la fecha a un punto alto por el tsunami.",
          riesgo: { prob: 0.3, multMoney: 0.2, multFans: 0.25, extraPop: -2, energia: -16,
            flavor: "La evacuación total te gana de mano: no queda lugar seguro y la fecha se cae.",
            log: "el tsunami ganó y la fecha no salió." } },
        { texto: "Reprogramar", desc: "La costa decide cuándo vuelve.",
          multMoney: 0.4, multFans: 0.45, energia: -8,
          flavor: "La fecha se corre. La ciudad se recupera y vos volvés después.",
          log: "reprogramó la fecha por el tsunami." },
        { texto: "Cancelar", desc: "El mar no espera a nadie.",
          multMoney: 0.1, multFans: 0, extraPop: -3, energia: -5,
          flavor: "Cancelás. El mar se lleva la fecha y la promesa de otra vuelta.",
          log: "canceló la fecha por la alerta de tsunami." }
      ]
    },

    clima_huracan: {
      titulo: "Huracán sobre la ciudad",
      bueno: false,
      texto: function (ga) {
        return "Un huracán azota " + ga.venue.ciudad + " justo en la fecha. " + ga.venue.nombre + " resiste, pero la ciudad está bajo el agua y el transporte no corre.";
      },
      opciones: [
        { texto: "Esperar la ventana del ojo", desc: "El ojo del huracán deja un respiro.",
          multMoney: 0.45, multFans: 0.5, energia: -12,
          flavor: "Aprovechás el ojo del huracán para tocar a toda máquina. Poco público, mucho mito.",
          log: "tocó en la ventana del huracán.",
          riesgo: { prob: 0.35, multMoney: 0.2, multFans: 0.25, extraPop: -2, energia: -12,
            flavor: "El ojo se cierra antes de tiempo y la fecha se corta con el agua hasta las rodillas.",
            log: "el huracán cerró la fecha antes de tiempo." } },
        { texto: "Reprogramar", desc: "La tormenta pasa, la fecha queda.",
          multMoney: 0.4, multFans: 0.45, energia: -8,
          flavor: "La fecha se corre una semana. La ciudad se seca y vos también.",
          log: "reprogramó la fecha por el huracán." },
        { texto: "Cancelar", desc: "El agua manda.",
          multMoney: 0.1, multFans: 0, extraPop: -2, energia: -5,
          flavor: "Cancelás. Nadie puede contra el agua.",
          log: "canceló la fecha por el huracán." }
      ]
    },

    /* ---------- Problemas con mafias ---------- */
    mafia_extorsion: {
      titulo: "La mafia local quiere su parte",
      bueno: false,
      texto: function (ga) {
        return "La noche antes de la fecha, unos tipos pesados de " + ga.venue.ciudad + " se acercan a tu producción: la 'protección' de " + ga.venue.nombre + " tiene precio. Sin pagar, el show no sale.";
      },
      opciones: [
        { texto: "Pagar lo que piden", desc: "Plata por paz.",
          multMoney: 0.85, multFans: 1.0, costoExtra: 600, extraPop: 0, energia: -12,
          flavor: "Pagás y la fecha sale sin dramas. Duele en el bolsillo, pero el estadio se llena igual.",
          log: "pagó la extorsión para que salga la fecha." },
        { texto: "Llamar a la policía", desc: "Que la ley decida.",
          multMoney: 0.6, multFans: 0.7, extraPop: 0, extraLegado: 2, energia: -14,
          flavor: "Un operativo policial desarma a los extorsionadores y la fecha sale. La escena local te respeta.",
          log: "denunció a los extorsionadores y tocó igual.",
          riesgo: { prob: 0.4, multMoney: 0.2, multFans: 0.3, extraPop: -3, extraLegado: -3, energia: -14,
            flavor: "La denuncia se filtra y la mafia arma un boicot: el show queda desierto y tu equipo asustado.",
            log: "la mafia boicoteó la fecha tras la denuncia." } },
        { texto: "Cancelar", desc: "Nada vale ese precio.",
          multMoney: 0.1, multFans: 0, extraPop: -3, extraLegado: -3, energia: -5,
          flavor: "Cancelás. El lugar queda en manos de ellos y tu nombre también.",
          log: "canceló la fecha por la extorsión." }
      ]
    },

    mafia_robo: {
      titulo: "Te roban el equipo",
      bueno: false,
      texto: function (ga) {
        return "A la madrugada, roban el camión con tu equipo de sonido en " + ga.venue.ciudad + ". Sin los parlantes y las consolas, " + ga.venue.nombre + " no puede armar el show.";
      },
      opciones: [
        { texto: "Alquilar equipo nuevo", desc: "Plata de urgencia para salvar la noche.",
          multMoney: 0.75, multFans: 0.9, costoExtra: 400, extraPop: 0, energia: -14,
          flavor: "Pagás el alquiler de urgencia y la fecha sale. Caro, pero la noche se salva.",
          log: "alquiló equipo nuevo tras el robo." },
        { texto: "Armar un set acústico", desc: "Menos producción, más verdad.",
          multMoney: 0.5, multFans: 0.7, extraRel: 3, extraLegado: 2, energia: -12,
          flavor: "Armás un set acústico sobre la marcha. La escena local se lo cuenta a todos.",
          log: "armó un set acústico tras el robo." },
        { texto: "Cancelar", desc: "Sin sonido no hay show.",
          multMoney: 0.1, multFans: 0, extraPop: -2, energia: -5,
          flavor: "Cancelás. El camión robado y la fecha perdida quedan en el debe.",
          log: "canceló la fecha tras el robo del equipo." }
      ]
    },

    /* ---------- Otros problemas ---------- */
    falla_tecnica: {
      titulo: "Falla técnica mayor",
      bueno: false,
      texto: function (ga) {
        return "Minutos antes de abrir puertas, el escenario de " + ga.venue.nombre + " sufre una falla estructural. Los técnicos de " + ga.venue.ciudad + " no saben si se puede tocar.";
      },
      opciones: [
        { texto: "Arreglar a las apuradas", desc: "Plata y mano de obra contra el reloj.",
          multMoney: 0.7, multFans: 0.8, costoExtra: 300, extraPop: 0, energia: -16,
          flavor: "Salís tarde pero salís. La estructura aguanta y la fecha se sostiene.",
          log: "arregló la falla técnica a las apuradas.",
          riesgo: { prob: 0.3, multMoney: 0.3, multFans: 0.4, extraPop: -2, energia: -16,
            flavor: "El arreglo no aguanta y el escenario se cae a mitad de la noche. La fecha termina mal.",
            log: "la falla técnica terminó cortando la fecha." } },
        { texto: "Reprogramar", desc: "Mejor un estadio firme otro día.",
          multMoney: 0.45, multFans: 0.5, energia: -8,
          flavor: "La fecha se corre. El lugar queda clausurado por seguridad y vos esperás.",
          log: "reprogramó la fecha por la falla técnica." },
        { texto: "Cancelar", desc: "Nadie sube a un escenario inseguro.",
          multMoney: 0.1, multFans: 0, extraPop: -2, energia: -5,
          flavor: "Cancelás por seguridad. Se entiende, pero igual se pierde la fecha.",
          log: "canceló la fecha por la falla técnica." }
      ]
    },

    sin_voz: {
      titulo: "Perdés la voz",
      bueno: false,
      texto: function (ga) {
        return "El día del show te despertás sin voz. " + ga.venue.nombre + " está lleno y tu garganta dice que no. La decisión es tuya.";
      },
      opciones: [
        { texto: "Tocar igual", desc: "El público canta por vos.",
          multMoney: 0.6, multFans: 0.65, extraPop: -2, extraLegado: 1, energia: -20,
          flavor: "Cantás roto y el estadio canta por vos. No es tu mejor noche, pero nadie la olvida.",
          log: "tocó sin voz y el público cantó por él." },
        { texto: "Reprogramar", desc: "La garganta manda.",
          multMoney: 0.5, multFans: 0.55, energia: -6,
          flavor: "Reprogramás. La voz vuelve después y la fecha también.",
          log: "reprogramó la fecha por la voz." },
        { texto: "Cancelar", desc: "No hay peor show que el que no sale.",
          multMoney: 0.1, multFans: 0, extraPop: -3, energia: -5,
          flavor: "Cancelás. La prensa lo anota y el cuerpo lo paga.",
          log: "canceló la fecha por la voz." }
      ]
    },

    estadio_vacio: {
      titulo: "El estadio está medio vacío",
      bueno: false,
      texto: function (ga) {
        return "Abrís puertas y las gradas de " + ga.venue.nombre + " están a un tercio. La prensa de " + ga.venue.ciudad + " dice que tu nombre todavía no convoca en " + ga.venue.pais + ".";
      },
      opciones: [
        { texto: "Hacerlo íntimo", desc: "Cantás para los que están.",
          multMoney: 0.6, multFans: 0.8, extraRel: 4, extraLegado: 2, energia: -12,
          flavor: "Bajás al frente y cantás para los que vinieron. Esos pocos se vuelven fans para siempre.",
          log: "hizo un show íntimo con el estadio medio vacío." },
        { texto: "Tocar igual", desc: "El show es el show.",
          multMoney: 0.7, multFans: 0.7, energia: -14,
          flavor: "Tocás como si estuviera lleno. Profesional, aunque las gradas hablen solas.",
          log: "tocó igual con el estadio medio vacío." },
        { texto: "Cancelar", desc: "La humillación no es un show.",
          multMoney: 0.1, multFans: 0, extraPop: -3, extraLegado: -3, energia: -5,
          flavor: "Cancelás y la noticia corre: tu nombre no convocó. Difícil de explicar después.",
          log: "canceló por el estadio medio vacío." }
      ]
    },

    huelga_transporte: {
      titulo: "Huelga de transporte",
      bueno: false,
      texto: function (ga) {
        return "Una huelga general paraliza " + ga.venue.ciudad + ". El aeropuerto, los trenes y el metro no funcionan y tu equipo no llega a " + ga.venue.nombre + ".";
      },
      opciones: [
        { texto: "Mover todo por tierra", desc: "Combis, taxis y voluntad.",
          multMoney: 0.5, multFans: 0.6, costoExtra: 200, energia: -12,
          flavor: "Alquilás combis y llegás a las corridas. La fecha sale, agotada pero sale.",
          log: "movió todo por tierra en la huelga.",
          riesgo: { prob: 0.3, multMoney: 0.25, multFans: 0.3, extraPop: -2, energia: -12,
            flavor: "Los caminos colapsan y llegan tarde: el show se achica a una versión de emergencia.",
            log: "la huelga dejó un show de emergencia." } },
        { texto: "Reprogramar", desc: "La ciudad vuelve y vos también.",
          multMoney: 0.4, multFans: 0.45, energia: -8,
          flavor: "La fecha se corre. La huelga termina y el show vuelve.",
          log: "reprogramó la fecha por la huelga." },
        { texto: "Cancelar", desc: "No hay cómo llegar.",
          multMoney: 0.1, multFans: 0, extraPop: -2, energia: -5,
          flavor: "Cancelás. Sin transporte no hay fecha ni público.",
          log: "canceló la fecha por la huelga de transporte." }
      ]
    }
  },

  /* El lugar grande del exterior que toca esta gira */
  _elegirVenue: function (gira) {
    var pool = Under.DATA.GIRA_VENUES.filter(function (v) { return v.nivelMin <= gira.nivel; });
    return pool[Under.STATE.randInt(0, pool.length - 1)];
  },

  /* Lo que pasa la noche del show: 35% que salga muy bien,
     65% que algo se complique. La vida de ruta no es para cualquiera. */
  _elegirEscenario: function () {
    var buenos = [];
    var malos = [];
    for (var k in Under.GIRAS.ESCENARIOS) {
      var e = Under.GIRAS.ESCENARIOS[k];
      (e.bueno ? buenos : malos).push(e);
    }
    var pool = Math.random() < 0.35 ? buenos : malos;
    return pool[Under.STATE.randInt(0, pool.length - 1)];
  },

  /* Resuelve la fecha: aplica el multiplicador del escenario sobre
     la base comprometida al aceptar y deja el resultado registrado. */
  _resolverFecha: function (s, ga, cfg) {
    var bruto = Math.round(ga.brutoBase * cfg.multMoney);
    var neto = Math.round((bruto - ga.costo) * ga.manager);
    if (cfg.costoExtra) neto -= Under.SYSTEMS.efectivoEscala(s, cfg.costoExtra);
    var fans = Math.round(ga.fansBase * cfg.multFans);

    var e = {
      money: neto,
      fans: fans,
      popularity: Math.round(ga.gira.popularidad * cfg.multMoney) + (cfg.extraPop || 0),
      _energia: cfg.energia != null ? cfg.energia : -15,
      _legado: cfg.extraLegado || 0
    };
    if (cfg.extraHype) e._hype = cfg.extraHype;
    if (cfg.extraRel) e._relaciones = cfg.extraRel;

    if (!s.giras) s.giras = [];
    s.giras.push({
      año: s.año, nombre: ga.gira.nombre, venue: ga.venue.nombre, pais: ga.venue.pais,
      capacidad: ga.venue.capacidad, costo: ga.costo, bruto: bruto, neto: neto, fans: fans
    });
    s.giraActiva = null;
    Under.GIRAS._fechaPendiente = null;
    return e;
  },

  _textoFecha: function (ga, efectos) {
    return "Recaudaste " + Under.UI.fmtDinero(efectos.money) + " y sumaste " +
      Under.UI.fmtExacto(efectos.fans) + " fans nuevos en " + ga.venue.nombre + ".";
  },

  /* Arma las opciones del escenario con el compromiso de la gira */
  _opcionesFecha: function (ga, esc) {
    return esc.opciones.map(function (o) {
      var opt = {
        texto: o.texto,
        desc: o.desc,
        efectos: function (s) { return Under.GIRAS._resolverFecha(s, ga, o); },
        resultado: function (s, efectos) {
          return o.flavor + "\n\n" + Under.GIRAS._textoFecha(ga, efectos);
        },
        log: "La fecha en " + ga.venue.nombre + " (" + ga.venue.ciudad + ", " + ga.venue.pais + "): " + o.log
      };
      if (o.riesgo) {
        opt.riesgo = o.riesgo.prob;
        opt.riesgoEfectos = function (s) { return Under.GIRAS._resolverFecha(s, ga, o.riesgo); };
        opt.riesgoResultado = function (s, efectos) {
          return o.riesgo.flavor + "\n\n" + Under.GIRAS._textoFecha(ga, efectos);
        };
        opt.riesgoLog = "La fecha en " + ga.venue.nombre + " (" + ga.venue.ciudad + ", " + ga.venue.pais + "): " + o.riesgo.log;
      }
      return opt;
    });
  },

  crearEventoFecha: function (state) {
    if (Under.GIRAS._fechaPendiente) return Under.GIRAS._fechaPendiente;
    var ga = state.giraActiva;
    if (!ga) return null;
    var esc = ga.escenario;
    var ev = {
      id: "gira_fecha",
      recurrente: true,
      importante: true,
      titulo: esc.titulo + " · " + ga.venue.nombre,
      texto: esc.texto(ga),
      opciones: Under.GIRAS._opcionesFecha(ga, esc)
    };
    Under.GIRAS._fechaPendiente = ev;
    return ev;
  }
};

/* ============================================================
   UNDER — ESTADIOS GRANDES (FASE 5)
   Cuando tu público ya es gigante (600.000 fans o más) los
   estadios de 50.000+ de capacidad te abren las puertas.
   ============================================================ */

Under.ESTADIOS = {

  _pendiente: null,

  /* El estadio que tu público puede llenar: con 600.000 fans o
     más, cualquiera de los grandes (todos piden mínimo 600k). */
  _mejorOfrecible: function (state) {
    var fama = state.stats && state.stats.fans;
    var pool = Under.DATA.ESTADIOS.filter(function (e) { return fama >= e.fansMin; });
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  crearEventoEstadio: function (state) {
    if (Under.ESTADIOS._pendiente) return Under.ESTADIOS._pendiente;

    var est = Under.ESTADIOS._mejorOfrecible(state);
    if (!est) return null;

    var opciones = [];

    opciones.push({
      texto: "🎫 Tocar en " + est.nombre,
      desc: "Un estadio de " + est.capacidad + " personas, con tu nombre en el cartel.",
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, est.costo);
        var bruto = Math.round(est.base * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        var neto = bruto - costo;
        var fans = Under.SYSTEMS.fansEscala(s, est.fans);

        if (!s.estadios) s.estadios = [];
        s.estadios.push({ id: est.id, año: s.año, nombre: est.nombre, capacidad: est.capacidad, costo: costo, bruto: bruto, neto: neto, fans: fans });
        s.totalEstadios = (s.totalEstadios || 0) + 1;
        s.flags.estadioEsteAnio = true;

        Under.ESTADIOS._pendiente = null;
        return { money: neto, fans: fans, popularity: est.popularidad, _energia: -25, _legado: 8 };
      },
      resultado: function (s, efectos) {
        return "Llenás " + est.nombre + " (" + Under.UI.fmtExacto(est.capacidad) + " de capacidad). Entre el público están " + Under.DATA.publico(2) + ", y el fotógrafo de undercba filma la noche que pasó a la historia.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
      },
      log: "Tocó en " + est.nombre + "."
    });

    opciones.push({
      texto: "🎤 Llevar invitados",
      desc: "Sumás nombres al cartel y repartís el peso.",
      efectos: function (s) {
        var costo = Under.SYSTEMS.efectivoEscala(s, est.costo);
        var bruto = Math.round(est.base * 0.6 * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
        var neto = bruto - costo;
        var fans = Math.round(Under.SYSTEMS.fansEscala(s, est.fans) * 0.6);

        if (!s.estadios) s.estadios = [];
        s.estadios.push({ id: est.id, año: s.año, nombre: est.nombre, capacidad: est.capacidad, costo: costo, bruto: bruto, neto: neto, fans: fans, invitados: true });
        s.totalEstadios = (s.totalEstadios || 0) + 1;
        s.flags.estadioEsteAnio = true;

        Under.ESTADIOS._pendiente = null;
        return { money: neto, fans: fans, popularity: 5, _energia: -20, _legado: 5 };
      },
      resultado: function (s, efectos) {
        return "Subís al escenario de " + est.nombre + " con invitados. La noche es una fiesta colectiva y tu nombre es el que llenó.\n\nGanás " + Under.UI.fmtDinero(efectos.money) + " y sumás " + Under.UI.fmtExacto(efectos.fans) + " fans nuevos.";
      },
      log: "Tocó en " + est.nombre + " con invitados."
    });

    opciones.push({
      texto: "Dejarlo para otro momento",
      desc: "Un estadio también puede esperar.",
      efectos: function (s) {
        s.flags.estadioEsteAnio = true;
        Under.ESTADIOS._pendiente = null;
        return {};
      },
      log: "Dejó pasar una fecha de estadio.",
      resultado: "Decidís que todavía no. El estadio te va a esperar, y lo sabés."
    });

    var ev = {
      id: "estadio",
      recurrente: true,
      importante: true,
      titulo: "Un estadio te abre las puertas",
      texto: "Con " + Under.UI.fmtExacto(state.stats.fans) + " de fans, " + est.nombre + " (" + est.ciudad + ", " + est.capacidad + " de capacidad) te ofrece una fecha.\n\nUn estadio de verdad. ¿Lo llenás?",
      opciones: opciones
    };

    Under.ESTADIOS._pendiente = ev;
    return ev;
  }
};
