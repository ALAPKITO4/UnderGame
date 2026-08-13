/* ============================================================
   UNDER — EVENTOS MAINSTREAM (PRIORIDAD 12)
   A partir de nivel 4 la carrera empieza a tocar el circuito
   grande: radios, TV, streamers, festivales, sponsors, etc.
   Cada escenario dispara un contador nuevo en state.contadores,
   que después alimenta misiones de la sección "mainstream".
   ============================================================ */

window.Under = window.Under || {};

Under.MAINSTREAM = {

  _pendiente: null,

  /* Cada escenario: counter = clave en state.contadores que aumenta, */
  /* titulo = título del evento, texto = cuerpo,                      */
  /* rec = efectos de aceptar, resultado = texto de resultado,        */
  /* log = texto para el historial.                                   */
  _escenarios: [
    { id: "wrapped", counter: "wrapped",
      titulo: "Spotify Wrapped",
      texto: "Spotify te nombra en el Wrapped Argentina de este año. Tu tema entra al listado de los más escuchados del país y la gente te descubre en el resumen del año.",
      rec: { fans: 12000, popularity: 5, money: 3000 },
      resultado: "Tu nombre aparece en el Wrapped de miles de personas. La escena te mira distinto.",
      log: "Apareció en el Wrapped Argentina."
    },
    { id: "radio_pop", counter: "radio_entre",
      titulo: "Pasás por la Radio Pop",
      texto: "La Radio Pop te invita a una entrevista en vivo. Es el horario central del mediodía, con oyentes de toda la ciudad.",
      rec: { fans: 6000, popularity: 4 },
      resultado: "Pasás por la Radio Pop. La audiencia te conoce y los pedidos de tus temas crecen.",
      log: "Entrevista en Radio Pop."
    },
    { id: "radio_rockpop", counter: "radio_entre",
      titulo: "Rock & Pop en vivo",
      texto: "La Rock & Pop te quiere como invitado en su programa de la mañana. Es la radio que escucha la escena del under porteño.",
      rec: { fans: 5500, popularity: 4 },
      resultado: "Pasás por la Rock & Pop. Los pibes de la escena te miran con respeto.",
      log: "Entrevista en Radio Rock & Pop."
    },
    { id: "radio_aspen", counter: "radio_entre",
      titulo: "Radio Aspen",
      texto: "La Aspen te entrevista. Es la radio del segmento ABC1; el público que escucha tu tema en el auto de vuelta del trabajo.",
      rec: { fans: 7000, popularity: 5 },
      resultado: "Pasás por Aspen. El nombre cruza la frontera del under y aparece en otro nicho.",
      log: "Entrevista en Radio Aspen."
    },
    { id: "podcast_mpm", counter: "streamer",
      titulo: "PM Podcast",
      texto: "José María Listorti te quiere en PM. La entrevista es descontracturada: una hora y media para que te muestres tal como sos.",
      rec: { fans: 8000, popularity: 4 },
      resultado: "Pasás por PM. La gente del streaming te conoce y empiezan a nombrarte en otros podcasts.",
      log: "Pasó por PM Podcast."
    },
    { id: "pdp", counter: "tv_show",
      titulo: "PH Podemos Hablar",
      texto: "Andy Kusnetzoff te invita a PH. Vas a contar tu historia de la escena, frente a un público grande y a figuras del espectáculo.",
      rec: { fans: 12000, popularity: 3 },
      resultado: "Pasás por PH. La audiencia masiva te ve, y muchos descubren tu música.",
      log: "Pasó por PH."
    },
    { id: "streamer_migue", counter: "streamer",
      titulo: "Migue Granados",
      texto: "Migue Granados te quiere en La Misa. Su público es enorme y combina humor con complicidad: el lugar perfecto para mostrar quién sos.",
      rec: { fans: 18000, popularity: 5 },
      resultado: "Pasás por La Misa con Migue. Tu nombre corre entre los streamings y la radio.",
      log: "Pasó por La Misa con Migue Granados."
    },
    { id: "streamer_occhiato", counter: "streamer",
      titulo: "Nico Occhiato",
      texto: "Nico Occhiato te quiere en Luzu. Es uno de los streamings más vistos del país.",
      rec: { fans: 20000, popularity: 5 },
      resultado: "Pasás por Luzu. Tu cara y tu música llegan a oyentes que nunca pisaron la escena.",
      log: "Pasó por Luzu TV con Nico Occhiato."
    },
    { id: "streamer_coscu", counter: "streamer",
      titulo: "Coscu Army",
      texto: "Coscu te quiere como invitado en su stream. La Army te recibe con memes y barra brava digital.",
      rec: { fans: 25000, popularity: 6 },
      resultado: "Pasás por Coscu. La Army te adopta y viraliza tus temas.",
      log: "Pasó por el stream de Coscu."
    },
    { id: "streamer_momo", counter: "streamer",
      titulo: "Momo",
      texto: "Momo te quiere en su stream. Es uno de los creadores fuertes del momento: el alcance es real.",
      rec: { fans: 22000, popularity: 5 },
      resultado: "Pasás por el stream de Momo. Tu nombre se instala en un público nuevo.",
      log: "Pasó por el stream de Momo."
    },
    { id: "streamer_grego", counter: "streamer",
      titulo: "Grego Rossello",
      texto: "Grego te quiere en su podcast. El tono es canchero y el público, enorme.",
      rec: { fans: 15000, popularity: 4 },
      resultado: "Pasás por el podcast de Grego. Tus temas se viralizan en los clips.",
      log: "Pasó por el podcast de Grego Rossello."
    },
    { id: "streamer_luquitas", counter: "streamer",
      titulo: "Luquitas Rodríguez",
      texto: "Luquitas te entrevista en su YouTube. La conversación es honesta y el público es fiel.",
      rec: { fans: 12000, popularity: 4 },
      resultado: "Pasás por el canal de Luquitas. La gente te conoce después del video.",
      log: "Pasó por el canal de Luquitas Rodríguez."
    },
    { id: "tv_showmatch", counter: "tv_show",
      titulo: "Showmatch",
      texto: "La producción de Showmatch te quiere para un segmento musical. Es la TV más vista del país.",
      rec: { fans: 22000, popularity: 6, _relaciones: -3 },
      resultado: "Vas a Showmatch. Tu nombre suena en cada casa y algunos dicen que te vendiste. La plata, igual, entra.",
      log: "Salió en Showmatch."
    },
    { id: "tv_bendita", counter: "tv_show",
      titulo: "Bendita",
      texto: "Bendita te quiere en su segmento. Es la TV de chimentos: aparecés y te hacen meme.",
      rec: { fans: 14000, popularity: 4 },
      resultado: "Vas a Bendita. La gente del barrio te conoce y los memes del segmento corren.",
      log: "Pasó por Bendita."
    },
    { id: "festival_local", counter: "fest",
      titulo: "Festival local",
      texto: "El Festival de la Zona te ofrece un slot. Es chico, pero el público del barrio te quiere.",
      rec: { fans: 8000, popularity: 3, money: 1500 },
      resultado: "Tocás en el festival local. La gente del barrio te reconoce.",
      log: "Tocó en un festival local."
    },
    { id: "cosquin", counter: "fest",
      titulo: "Cosquín Rock",
      texto: "Te invitan al Cosquín Rock. Es el festival más importante del rock/pop argentino. Tocar ahí es un sello.",
      rec: { fans: 28000, popularity: 6, money: 8000 },
      resultado: "Tocás en Cosquín Rock. Tus temas se corean y la prensa te nombra.",
      log: "Tocó en Cosquín Rock."
    },
    { id: "lollapalooza", counter: "fest",
      titulo: "Lollapalooza Argentina",
      texto: "El festival Lollapalooza Argentina te quiere en su line-up. Tocar el Lolla es pisar el escenario grande del país.",
      rec: { fans: 35000, popularity: 7, money: 12000 },
      resultado: "Tocás en el Lolla. Tu nombre cruza el ámbito under y aparece en todos los titulares.",
      log: "Tocó en Lollapalooza."
    },
    { id: "personal_fest", counter: "fest",
      titulo: "Personal Fest",
      texto: "El Personal Fest te asigna un escenario. Es más chico que el Lolla, pero el público es fiel.",
      rec: { fans: 22000, popularity: 5, money: 6000 },
      resultado: "Tocás en Personal Fest. La gente te descubre en vivo.",
      log: "Tocó en Personal Fest."
    },
    { id: "primavera", counter: "fest",
      titulo: "Primavera Sound",
      texto: "Primavera Sound Buenos Aires te quiere en su line-up. Es el festival internacional que más mira la prensa.",
      rec: { fans: 38000, popularity: 7, money: 12000 },
      resultado: "Tocás en Primavera. La prensa internacional te nombra.",
      log: "Tocó en Primavera Sound."
    },
    { id: "gran_rex", counter: "show_arena",
      titulo: "Gran Rex",
      texto: "El Gran Rex te ofrece una fecha. Es uno de los teatros más emblemáticos de Buenos Aires.",
      rec: { fans: 28000, popularity: 6, money: 18000 },
      resultado: "Llenás el Gran Rex. La noche sale redonda y la gente cuenta cómo fue.",
      log: "Llenó el Gran Rex."
    },
    { id: "obras", counter: "show_arena",
      titulo: "Teatro Obras",
      texto: "El Teatro Obras —la catedral del rock y la escena— te programa en la sala principal.",
      rec: { fans: 15000, popularity: 4, money: 12000 },
      resultado: "Tocás en Obras. La gente del under te aplaude en el escenario que era su templo.",
      log: "Tocó en el Teatro Obras."
    },
    { id: "movistar", counter: "show_arena",
      titulo: "Movistar Arena",
      texto: "El Movistar Arena de Buenos Aires te programa en su calendario. Son 15 mil personas.",
      rec: { fans: 40000, popularity: 7, money: 25000 },
      resultado: "Tocás en el Movistar Arena. La multitud te recibe y los críticos del diario lo cubren.",
      log: "Tocó en el Movistar Arena."
    },
    { id: "estadio_ar", counter: "show_estadio_ar",
      titulo: "Estadio argentino",
      texto: "Te ofrecen una fecha en un estadio grande del país. Monumental, Kempes, Bombonera, La Plata o Cilindro: son 50 mil personas.",
      rec: { fans: 80000, popularity: 8, money: 60000 },
      resultado: "Tocás en el estadio. La fecha es profesional y la gente te aclama. La escena te mira desde abajo.",
      log: "Tocó en un estadio argentino."
    },
    { id: "sponsor_ind", counter: "sponsor",
      titulo: "Sponsor de ropa urbana",
      texto: "Una marca de ropa urbana te quiere como imagen de la temporada. Ferias, jingle, foto en la vidriera.",
      rec: { money: 25000, popularity: 4 },
      resultado: "Firmás con la marca. Tu cara aparece en la vidriera de la calle Florida.",
      log: "Firmó campaña con una marca de ropa."
    },
    { id: "sponsor_cerveza", counter: "sponsor",
      titulo: "Anuncio de cerveza",
      texto: "Una cervecera te contrata para una campaña de las fiestas. Es plata grande, pero el público te mira raro.",
      rec: { money: 40000, popularity: 4 },
      resultado: "Sos la cara de la campaña. La gente del under se divide, el público masivo te conoce.",
      log: "Campaña de cerveza para las fiestas."
    },
    { id: "sponsor_reloj", counter: "sponsor",
      titulo: "Sponsor de un reloj de lujo",
      texto: "Una marca de relojes de lujo te quiere en su próxima campaña. Es plata real y prensa internacional.",
      rec: { money: 60000, popularity: 5 },
      resultado: "Sos la cara de la marca. La prensa gira tu nombre en un nicho nuevo.",
      log: "Campaña de un reloj de lujo."
    },
    { id: "sponsor_iphone", counter: "sponsor",
      titulo: "Campaña de marca tech",
      texto: "Una marca de tecnología te quiere como imagen de su lanzamiento en Latam. Es un aviso internacional.",
      rec: { money: 45000, popularity: 5 },
      resultado: "Tu cara aparece en la campaña regional. La escena te toma foto con el producto.",
      log: "Campaña de una marca tech."
    },
    { id: "libro", counter: "libro",
      titulo: "Escribís un libro",
      texto: "Una editorial te propone escribir un libro sobre tus años de la escena. Cuesta tiempo, pero te posiciona distinto.",
      rec: { fans: 18000, popularity: 3, _relaciones: 2 },
      resultado: "El libro sale. La crítica habla de vos y la gente del under te lee.",
      log: "Publicó un libro sobre su carrera."
    },
    { id: "moda", counter: "moda",
      titulo: "Pasarela de la moda",
      texto: "Te invitan a la Pasarela de la Moda porteña. Vas a desfilar y a estar en la primera fila.",
      rec: { fans: 20000, popularity: 5 },
      resultado: "Pasás por la pasarela. Tu cara mezcla la moda con la música y la gente te mira distinto.",
      log: "Pasó por la Pasarela de la Moda."
    },
    { id: "biopic", counter: "biopic",
      titulo: "Netflix biopic",
      texto: "Tu historia le interesa a Netflix. Quieren hacer una serie sobre tus años del under.",
      rec: { fans: 45000, popularity: 8, money: 30000 },
      resultado: "Anuncian la serie. La prensa te mira y la escena empieza a discutir quién te va a interpretar.",
      log: "Anunciaron un biopic suyo en Netflix."
    },
    { id: "actuacion", counter: "actuacion",
      titulo: "Papel en una serie",
      texto: "Una serie de TV te ofrece un papel como vos mismo. Es una aparición, no un protagónico, pero suma.",
      rec: { fans: 25000, popularity: 5 },
      resultado: "Saliste en la serie. La gente del under te mira con un guiño cómplice.",
      log: "Tuvo un papel en una serie."
    },
    { id: "press_int", counter: "press_int",
      titulo: "Prensa internacional",
      texto: "Rolling Stone Latam, Billboard o The Clinic te quieren hacer una nota. La prensa te cruza las fronteras.",
      rec: { fans: 18000, popularity: 4, _legado: 5 },
      resultado: "Salís en la revista. La prensa internacional te nombra y la escena te cita.",
      log: "Nota en prensa internacional."
    },
    { id: "mtv", counter: "mtv",
      titulo: "MTV Latinoamérica",
      texto: "MTV Latam te quiere en su cobertura. Te hacen una nota y te pasan clips del tema en rotación.",
      rec: { fans: 18000, popularity: 5 },
      resultado: "MTV te nombra. Tus clips pasan en la programación del cable.",
      log: "Salió en MTV Latam."
    },
    { id: "billboard", counter: "billboard",
      titulo: "Billboard Latin",
      texto: "Billboard Latin te incluye en su radar de la nueva ola. La mención cambia el tipo de puerta que se te abre.",
      rec: { fans: 25000, popularity: 6, _legado: 8 },
      resultado: "Billboard te nombra. La industria te empieza a mirar de otra manera.",
      log: "Nombrado en Billboard Latin."
    },
    { id: "vegas", counter: "vegas",
      titulo: "Las Vegas",
      texto: "Te invitan a una residencia corta en Las Vegas. Son funciones de prueba en un venue del Strip.",
      rec: { fans: 15000, popularity: 3, money: 22000 },
      resultado: "Te subís al escenario de Las Vegas. La prensa gringa y la argentina te cubren.",
      log: "Residencia corta en Las Vegas."
    },
    { id: "olimpia", counter: "olimpia",
      titulo: "Apertura de un partido",
      texto: "El fútbol te quiere cantar la apertura de un partido importante. La cancha llena te escucha.",
      rec: { fans: 50000, popularity: 7 },
      resultado: "Cantás en la cancha. El pueblo te alumbra y las fotos aparecen en todos lados.",
      log: "Cantó en la apertura de un partido."
    },
    { id: "rugby", counter: "rugby",
      titulo: "Himno en cancha de los Pumas",
      texto: "La UAR te invita a cantar el himno en un test match de los Pumas. La pantalla grande mira.",
      rec: { fans: 28000, popularity: 5 },
      resultado: "Cantás el himno. El estadio entero te aplaude y tu cara aparece en la transmisión.",
      log: "Cantó el himno en un partido de los Pumas."
    },
    { id: "fan_messi", counter: "fan_messi",
      titulo: "Messi te cita en una historia",
      texto: "Messi sube una historia escuchando tu tema. La imagen da la vuelta al mundo en horas.",
      rec: { fans: 60000, popularity: 8 },
      resultado: "Messi te nombra. Tu tema se dispara en streams y tu nombre cruza el mundo.",
      log: "Messi subió una historia con su tema."
    },
    { id: "university", counter: "charla",
      titulo: "Charla en una universidad",
      texto: "La cátedra de Música Popular de una universidad te invita a dar una charla. Vas a contar tu ruta.",
      rec: { fans: 8000, popularity: 2, _legado: 8 },
      resultado: "Dás la charla. La comunidad universitaria te mira con respeto y empezás a aparecer en papers.",
      log: "Dio una charla en una universidad."
    },
    { id: "teatro", counter: "teatro",
      titulo: "Show íntimo en un teatro",
      texto: "Un teatro independiente te ofrece una fecha íntima. Tocar en una sala chica después de llenar el Lolla es volver a empezar.",
      rec: { fans: 12000, popularity: 3, money: 8000 },
      resultado: "Hacés el show íntimo. La gente te siente cerca y la noche queda registrada.",
      log: "Hizo un show íntimo en un teatro."
    }
  ],

  /* Devuelve el evento mainstream activo, eligiendo un escenario
     al azar. Si ya hay un escenario pendiente, lo devuelve. */
  crear: function (s) {
    if (this._pendiente) return this._pendiente;
    var esc = this._escenarios[Math.floor(Math.random() * this._escenarios.length)];
    var rec = esc.rec || {};
    var ev = {
      id: "mainstream_evento",
      recurrente: true,
      importante: false,
      titulo: esc.titulo,
      texto: esc.texto,
      opciones: [
        {
          texto: "Aceptar",
          desc: "Decís que sí.",
          efectos: function (state) {
            state.flags.msmEsteAnio = true;
            state.flags[esc.id] = true;
            Under.MISIONES.sumar(state, esc.counter, 1);
            Under.MAINSTREAM._pendiente = null;
            return rec;
          },
          resultado: esc.resultado,
          log: "Aceptó: " + esc.titulo + "."
        },
        {
          texto: "Rechazar",
          desc: "Decís que no esta vez.",
          efectos: function (state) {
            state.flags.msmEsteAnio = true;
            Under.MAINSTREAM._pendiente = null;
            return {};
          },
          resultado: "Le decís que no. La escena te lo bancará o te lo cobrará, depende del día.",
          log: "Rechazó: " + esc.titulo + "."
        }
      ]
    };
    this._pendiente = ev;
    return ev;
  }
};
