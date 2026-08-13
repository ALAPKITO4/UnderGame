/* ============================================================
   UNDER — LA VIDA ALREDEDOR DE LA MÚSICA (GRAN ACTUALIZACIÓN)
   Eventos que no son solo tocar y grabar:
   - Por género: cada género tiene su propio momento grande.
   - Fuera de la música: series, videojuegos, publicidades,
     realities y la vida que corre en paralelo al micrófono.
   - Fandom: el público como personaje propio, entre el amor
     y los haters.
   - Más misiones del under: casas, plazas, videos caseros,
     fanzines y el estudio de la escena.

   Mismo patrón que UNDER y GRANDE: recurrentes, importantes: false
   y cacheados por id para que el texto no cambie entre renders.
   ============================================================ */

window.Under = window.Under || {};

Under.EXTRA = {

  _pendientes: {},

  _limpiar: function (id) {
    Under.EXTRA._pendientes[id] = null;
  },

  _crear: function (id, titulo, textos, opciones) {
    if (Under.EXTRA._pendientes[id]) return Under.EXTRA._pendientes[id];

    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: false,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };

    Under.EXTRA._pendientes[id] = ev;
    return ev;
  },

  /* ============================================================
     EVENTOS POR GÉNERO
     ============================================================ */

  /* ---------- Rap: un veterano te desafía ---------- */
  crearEventoGeneroRap: function (state) {
    return Under.EXTRA._crear("gen_rap", "CRO te desafía", [
      "CRO, un MC histórico de tu ciudad, te bardeó en vivo y te cita para un duelo de rimas.",
      "En un cypher con leyendas, CRO te mira y te dice que sueltes tu mejor barra.",
      "CRO, veterano del rap local, quiere probar si los nuevos tienen hambre. Arrancó por vos."
    ], [
      {
        texto: "Aceptar el duelo",
        desc: "Todo el respeto se gana en La Sobre.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          Under.MISIONES.sumar(s, "cro", 1);
          if (Math.random() < 0.5) {
            return { talent: 2, popularity: 4, fans: Under.SYSTEMS.fansEscala(s, 800), _energia: -10 };
          }
          return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -10 };
        },
        resultado: "El duelo con CRO es histórico. Cuando ganás, la escena entera lo repite; cuando perdés, perdiste contra una leyenda.",
        log: "Aceptó un duelo de rimas con CRO."
      },
      {
        texto: "Freestylear con respeto",
        desc: "Mostrar el respeto también es arte.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          Under.MISIONES.sumar(s, "cro", 1);
          return { popularity: 2, talent: 1, fans: Under.SYSTEMS.fansEscala(s, 300) };
        },
        resultado: "Le dedicás a CRO tu mejor barra como homenaje. CRO asiente: te ganaste su respeto.",
        log: "Dedicó un freestyle con respeto a CRO."
      },
      {
        texto: "Declinar",
        desc: "Su tiempo pasó. El tuyo todavía no llegó.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          return { talent: 1 };
        },
        resultado: "No vas. CRO sigue su camino y la escena no lo olvida del todo.",
        log: "Declinó un duelo con CRO."
      }
    ]);
  },

  /* ---------- Rock: una banda de culto te invita ---------- */
  crearEventoGeneroRock: function (state) {
    return Under.EXTRA._crear("gen_rock", "Una banda de culto te invita", [
      "Una banda legendaria del rock local te ofrece abrir su fecha en un club mítico.",
      "Una banda de culto de tu ciudad te invita a su sala de ensayo para una jam.",
      "Un ciclo del under te ubica en el escenario chico, el de los de verdad."
    ], [
      {
        texto: "Abrir su fecha",
        desc: "Su público es tu mejor escuela.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rock");
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 4, _energia: -15 };
        },
        resultado: "Abrís su fecha y el club vibra con tu sonido. La banda de culto te suma a su circuito.",
        log: "Abró la fecha de una banda de culto del rock."
      },
      {
        texto: "Grabar en su estudio",
        desc: "Su sala tiene historia. Que se escuche.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rock");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 120), talent: 3, fans: Under.SYSTEMS.fansEscala(s, 400) };
        },
        resultado: "Grabás en su estudio, entre paredes que escucharon a los grandes. El sonido te queda en la sangre.",
        log: "Grabó en el estudio de una banda de culto."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Esa escena no es tuya todavía.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rock");
          return {};
        },
        resultado: "No vas. La fecha la abre otro y el circuito sigue sin tu nombre.",
        log: "Dejó pasar la invitación de una banda de culto."
      }
    ]);
  },

  /* ---------- Urban: un productor internacional ---------- */
  crearEventoGeneroUrban: function (state) {
    var p = Under.DATA.escena({ grupo: "family racks" });
    return Under.EXTRA._crear("gen_urban", "Un productor urbano te busca", [
      p.nombre + ", de Family Racks, te ofrece un beat para un tema de reggaetón.",
      "Una sesión urbana con artistas consagrados quiere sumar tu voz.",
      "Un sello urbano te ofrece grabar con " + p.nombre + ", de Family Racks, que suena en todo el continente."
    ], [
      {
        texto: "Grabar el tema urbano",
        desc: "El beat lo pide todo: plata, exposición y tu sonido.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_urban");
          return { money: Under.SYSTEMS.dineroEscala(s, 800), fans: Under.SYSTEMS.fansEscala(s, 2000), popularity: 5, talent: -1 };
        },
        resultado: "El tema sale y suena en cada calle. " + p.nombre + " te escribe para la próxima, y esa llamada vale oro.",
        log: "Grabó con un productor urbano internacional."
      },
      {
        texto: "El beat con tu estilo",
        desc: "Su base, tus barras, tu verdad.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_urban");
          return { talent: 2, popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 800) };
        },
        resultado: "Usás su beat pero le metés tu flow. " + p.nombre + " se sorprende: te toma en serio.",
        log: "Grabó un beat urbano con su estilo propio."
      },
      {
        texto: "Dejarlo pasar",
        desc: "El sonido del continente puede esperar.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_urban");
          return {};
        },
        resultado: "No vas a la sesión. " + p.nombre + " arma el tema con otro y la oportunidad se va con él.",
        log: "Dejó pasar la sesión con un productor urbano."
      }
    ]);
  },

  /* ============================================================
     FUERA DE LA MÚSICA
     ============================================================ */

  /* ---------- Tu tema entra en una serie ---------- */
  crearEventoSerie: function (state) {
    var p = Under.DATA.escena();
    return Under.EXTRA._crear("extra_serie", "Tu tema entra en una serie", [
      p.nombre + ", de la escena, te consigue el oído de un productor de streaming: quiere usar tu tema en una escena clave de una serie.",
      "Una serie de tu país quiere tu canción para los créditos de su temporada, y " + p.nombre + " te pasó el dato.",
      "Un proyecto de la facu de cine te pide un tema para la escena central de su corto: " + p.nombre + " habló bien de vos."
    ], [
      {
        texto: "Ceder el tema",
        desc: "Tu música suena en millones de pantallas.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_serie");
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3 };
        },
        resultado: "Tu tema suena en la escena justa. La gente pausa la serie para buscar de quién es esa canción.",
        log: "Cedió un tema para una serie."
      },
      {
        texto: "Negociar los derechos",
        desc: "Menos difusión, pero mejor contrato.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_serie");
          return { money: Under.SYSTEMS.efectivoEscala(s, 400), fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 1 };
        },
        resultado: "Cobrás mejor y el tema suena igual, aunque con menos empuje de la producción.",
        log: "Negoció los derechos de un tema para una serie."
      },
      {
        texto: "Decir que no",
        desc: "Tu música tiene otro destino.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_serie");
          return { talent: 1 };
        },
        resultado: "No lo soltás. La serie usa otro tema y el tuyo espera su momento.",
        log: "No cedió un tema para una serie."
      }
    ]);
  },

  /* ---------- Un videojuego quiere tu música ---------- */
  crearEventoVideojuego: function (state) {
    return Under.EXTRA._crear("extra_videojuego", "Pq la sprite se llama lean?", [
      "goujys te hizo la oferta: quiere tu tema para la banda sonora de su videojuego.",
      "goujys, que está armando un juego con culto de fans, te ofrece incluir tu canción en su menú principal.",
      "goujys te escribió por el desarrollo de su videojuego y quiere tu música de fondo para un nivel completo."
    ], [
      {
        texto: "Cederlo al juego",
        desc: "El público gamer descubre tu nombre.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_videojuego");
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 2, _relaciones: 3 };
        },
        resultado: "Tu tema se vuelve parte del juego. Los gamers te agradecen en cada video de su comunidad.",
        log: "Cedió su música para un videojuego."
      },
      {
        texto: "Cobrar por él",
        desc: "La plata también es parte de la carrera.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_videojuego");
          return { money: Under.SYSTEMS.efectivoEscala(s, 300), fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Cobrás una cifra honesta y el tema entra igual. Justo y sano.",
        log: "Cobró por su música para un videojuego."
      },
      {
        texto: "No",
        desc: "Tu música no es un power-up.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_videojuego");
          return {};
        },
        resultado: "No cedés. El estudio usa otra cosa y la comunidad nunca te conoce.",
        log: "No cedió música para un videojuego."
      }
    ]);
  },

  /* ---------- Música para una publicidad ---------- */
  crearEventoPublicidad: function (state) {
    return Under.EXTRA._crear("extra_publicidad", "Naty vintage te llama", [
      "Naty vintage te llama: una marca local quiere un jingle para su publicidad de radio y tele.",
      "Naty vintage te contacta por una empresa de barrio que te pide una canción corta para su campaña.",
      "Naty vintage te ofrece un spot institucional que necesita música original y pensaron en vos."
    ], [
      {
        texto: "Componer el jingle",
        desc: "Poco glamour, plata segura y oficio.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_publicidad");
          Under.MISIONES.sumar(s, "naty", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 250), talent: 1 };
        },
        resultado: "Escribís un jingle que se repite hasta en el ascensor. La marca paga y el oficio suma.",
        log: "Compuso un jingle para una publicidad."
      },
      {
        texto: "Adaptar un tema viejo",
        desc: "Un tema tuyo, recortado para el spot.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_publicidad");
          Under.MISIONES.sumar(s, "naty", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 150) };
        },
        resultado: "Recortás un tema y queda perfecto para el spot. Cobrás y un puñado de gente te descubre.",
        log: "Adaptó un tema para una publicidad."
      },
      {
        texto: "No prestar tu música",
        desc: "Los jingles no son tu lenguaje.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_publicidad");
          return { talent: 1 };
        },
        resultado: "Decís que no. La marca contrata a otro y tu catálogo queda intacto.",
        log: "No prestó su música para una publicidad."
      }
    ]);
  },

  /* ---------- Streamers te invitan a un Discord ---------- */
  crearEventoReality: function (state) {
    return Under.EXTRA._crear("extra_reality", "Un Discord con streamers", [
      "Unos streamers que viste varias veces en La Sobre te invitan a una noche de Discord con ellos y su comunidad.",
      "Los pibes que streamean, a los que cruzás seguido en La Sobre, te invitan a sumarte a un Discord en vivo y a charlar de música.",
      "Un grupo de streamers de la escena (los viste rondando La Sobre) te invita a pasar una noche en su Discord, con tu música de fondo."
    ], [
      {
        texto: "Sumarte al Discord",
        desc: "Su comunidad se entera de quién sos, en vivo y sin filtros.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { popularity: 4, fans: Under.SYSTEMS.fansEscala(s, 900), _relaciones: 3, _energia: -8 };
        },
        resultado: "Pasás la noche en el Discord con los streamers: reaccionan a tus temas, se ríen con vos y te invitan a volver. Su comunidad te adopta.",
        log: "Se sumó a un Discord con streamers de la escena."
      },
      {
        texto: "Pasarte un rato",
        desc: "Aparecés, saludás y te vas.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 350), _relaciones: 1 };
        },
        resultado: "Entrás al Discord, saludás, dejas caer una anécdota de La Sobre y te vas. Alcanza para que te tengan presente.",
        log: "Se pasó un rato por un Discord de streamers."
      },
      {
        texto: "No ir",
        desc: "Tu música no necesita ese reflector.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { talent: 1 };
        },
        resultado: "Decís que no. Los streamers buscan a otro y la noche transcurre sin vos.",
        log: "Rechazó unirse a un Discord de streamers."
      }
    ]);
  },

  /* ============================================================
     FANDOM: EL PÚBLICO COMO PERSONAJE
     ============================================================ */

  /* ---------- Se forma tu club de fans ---------- */
  crearEventoFanClub: function (state) {
    var p = Under.DATA.escena({ rol: "público activo" });
    return Under.EXTRA._crear("fan_club", "Nace tu club de fans", [
      p.nombre + " y un grupo de fans arman un club en tu honor, con página y todo.",
      "Tu comunidad crece hasta que " + p.nombre + " propone organizar un club oficial.",
      p.nombre + " creó un fandom tuyo con memes y remeras desde la primera fila."
    ], [
      {
        texto: "Abrazarlo",
        desc: "Un club de fans es una segunda casa.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_club");
          return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _relaciones: 3 };
        },
        resultado: "Saludás al club con un post. Sus miembros lo comparten hasta en sueños: te sentís parte de algo.",
        log: "Abrazó el nacimiento de su club de fans."
      },
      {
        texto: "Darles contenido exclusivo",
        desc: "Detrás de escena para los que te bancan.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_club");
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 2, _energia: -5 };
        },
        resultado: "Les das material exclusivo y el club explota. Lo que compartís se multiplica solo.",
        log: "Dio contenido exclusivo a su club de fans."
      },
      {
        texto: "Mantener distancia",
        desc: "Tu música habla por vos.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_club");
          return {};
        },
        resultado: "No te metés en el fandom. El club crece igual, aunque sin tu bendición.",
        log: "Mantuvo distancia de su club de fans."
      }
    ]);
  },

  /* ---------- Ferrocbaa te persigue ---------- */
  crearEventoFanHater: function (state) {
    return Under.EXTRA._crear("fan_hater", "Ferrocbaa te persigue", [
      "Ferrocbaa — ferro, para los suyos — se dedica a comentar mal cada cosa que publicás.",
      "Un video tuyo se llena de comentarios negativos de Ferrocbaa y su gente.",
      "Ferrocbaa te hizo una cuenta parodia que acumula seguidores. Te persigue desde que pisaste el under."
    ], [
      {
        texto: "Ignorarlo",
        desc: "El hater vive del aire que le das.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_hater");
          return { _relaciones: 2 };
        },
        resultado: "No le das pelota. Ferrocbaa se cansa y el fandom termina defendiéndote solo.",
        log: "Ignoró a un hater persistente."
      },
      {
        texto: "Responder con gracia",
        desc: "Una respuesta con humor desarma todo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_hater");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 300), _energia: -5 };
        },
        resultado: "Le respondés con un chiste y hasta los seguidores de la parodia se ríen. Ferrocbaa queda expuesto.",
        log: "Respondió con gracia a un hater."
      },
      {
        texto: "Bardearlo de vuelta",
        desc: "Bajarte al barro puede salir caro.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_hater");
          if (Math.random() < 0.5) {
            return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
          }
          return { popularity: -3, fans: -Under.SYSTEMS.fansEscala(s, 200), _relaciones: -2 };
        },
        resultado: "Te ensuciás las manos. A veces la gente se ríe con vos; a veces el que queda mal sos vos.",
        log: "Se bardeó con un hater en redes."
      }
    ]);
  },

  /* ---------- Un fan se tatúa tu logo ---------- */
  crearEventoFanTatuaje: function (state) {
    var p = Under.DATA.escena({ rol: "público activo" });
    return Under.EXTRA._crear("fan_tatuaje", "Un fan se tatúa tu logo", [
      p.nombre + ", de tu público activo, se tatúa tu logo en el brazo y el video se vuelve viral en tu comunidad.",
      p.nombre + " muestra en redes el tatuaje de la letra de tu tema favorito.",
      p.nombre + " se tatuó tu firma y te escribe para que lo veas."
    ], [
      {
        texto: "Celebrarlo",
        desc: "Esa tinta también es tuya.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_tatuaje");
          return { fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2, _relaciones: 4 };
        },
        resultado: "Lo compartís y el fan llora de emoción. Esa tinta queda para siempre, y vos también.",
        log: "Celebró a un fan que se tatúo su logo."
      },
      {
        texto: "Compartirlo en redes",
        desc: "El momento vale oro.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_tatuaje");
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 3 };
        },
        resultado: "El post explota en tu comunidad. La gente que se tatuó algo tuyo sale a mostrarlo.",
        log: "Compartió el tatuaje de un fan en redes."
      },
      {
        texto: "Aprovecharlo para merch",
        desc: "La tinta se convierte en remeras.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_tatuaje");
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Lanzás merch con ese diseño. Unos lo ven oportunista; otros, brillante.",
        log: "Lanzó merch inspirada en el tatuaje de un fan."
      }
    ]);
  },

  /* ============================================================
     MÁS MISIONES DEL UNDER
     ============================================================ */

  /* ---------- Casa Babylon abre sus puertas ---------- */
  crearEventoCasa: function (state) {
    return Under.EXTRA._crear("under_casa", "Casa Babylon abre sus puertas", [
      "En Casa Babylon arman un toque íntimo y te invitan a tocar: público en el piso, vos al frente.",
      "Casa Babylon organiza un living show: un espacio de la escena con el público a dos metros.",
      "El ciclo de 'toques de living' recorre las casas de la zona, y Casa Babylon te anota para el próximo."
    ], [
      {
        texto: "Tocar la casa",
        desc: "Cero escenario, todo verdad.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_casa");
          return { fans: Under.SYSTEMS.fansEscala(s, 200), popularity: 2, _energia: -8 };
        },
        resultado: "Tocás en Casa Babylon a dos metros de la gente. Cada suspiro se escucha y cada barra queda grabada a fuego.",
        log: "Tocó en Casa Babylon."
      },
      {
        texto: "Grabar la sesión en vivo",
        desc: "Esa intimidad también se comparte.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_casa");
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 400), _energia: -8 };
        },
        resultado: "Grabás la sesión cruda en Casa Babylon. La publicación se comparte en la escena y el living se llena de nuevo.",
        log: "Grabó una sesión en vivo en Casa Babylon."
      },
      {
        texto: "No ir",
        desc: "Tu tiempo vale.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_casa");
          return {};
        },
        resultado: "No vas. Casa Babylon se llena igual con otro artista y la oportunidad se esfuma.",
        log: "No fue a un toque en Casa Babylon."
      }
    ]);
  },

  /* ---------- Un toque en La Sobre ---------- */
  crearEventoPlaza: function (state) {
    return Under.EXTRA._crear("under_plaza", "Un toque en La Sobre", [
      "Lucio te ofrece un escenario improvisado en La Sobre, el lugar más crudo de la escena, para un domingo.",
      "Lucio arma música en vivo en La Sobre y piensa en vos: el lugar donde el under es under de verdad.",
      "Lucio arma un evento en La Sobre y te da el horario central. Ahí no hay escenario: hay hueco entre la gente."
    ], [
      {
        texto: "Tocar el domingo",
        desc: "El barrio entero pasa por La Sobre.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_plaza");
          Under.MISIONES.sumar(s, "sobre", 1);
          Under.MISIONES.sumar(s, "lucio", 1);
          Under.MISIONES.sumar(s, "sobre_domingo", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 350), popularity: 3, _energia: -8 };
        },
        resultado: "Tocás en La Sobre con los pibes sentados alrededor. Las familias se quedan a escuchar y el barrio te adopta.",
        log: "Tocó un domingo en La Sobre."
      },
      {
        texto: "Vender merch ahí",
        desc: "El domingo también es feria.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_plaza");
          Under.MISIONES.sumar(s, "sobre", 1);
          Under.MISIONES.sumar(s, "sobre_domingo", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 120), fans: Under.SYSTEMS.fansEscala(s, 200), _energia: -10 };
        },
        resultado: "Tocás en La Sobre y vendés remeras desde una valija. El barrio compra y tu nombre queda sonando.",
        log: "Tocó y vendió merch en La Sobre."
      },
      {
        texto: "Dejarlo pasar",
        desc: "La Sobre no es tu escenario.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_plaza");
          return {};
        },
        resultado: "No vas. Otro artista ocupa tu lugar en La Sobre y el domingo transcurre igual.",
        log: "Dejó pasar un toque en La Sobre."
      }
    ]);
  },

  /* ---------- Un video con Burger ---------- */
  crearEventoVideo: function (state) {
    return Under.EXTRA._crear("under_video", "Burger hunter", [
      "Burger, el cazador de tomas de fruittyaudiovisual, te propone grabar un video casero para tu próximo tema.",
      "Burger hunter no descansa: te ofrece filmar un videoclip low cost en el barrio, con cámara de teléfono y ojo de cine.",
      "Fruitty audiovisual quiere un video crudo para uno de tus temas nuevos, y Burger hunter está en la cámara."
    ], [
      {
        texto: "Grabar el video",
        desc: "Poco presupuesto, mucha calle.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_video");
          Under.MISIONES.sumar(s, "burger", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 60), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _energia: -8 };
        },
        resultado: "El video de Burger hunter sale crudo y real. Tu barrio se convierte en el set y la gente lo siente propio.",
        log: "Grabó un video casero con Burger hunter."
      },
      {
        texto: "Video minimalista",
        desc: "Una toma, vos y el micrófono.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_video");
          Under.MISIONES.sumar(s, "burger", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 250), talent: 1 };
        },
        resultado: "Burger hunter filma una sola toma, sin cortes. La crudeza hace el resto y el tema gana fuerza.",
        log: "Filmó un video minimalista con Burger hunter."
      },
      {
        texto: "Postergarlo",
        desc: "El video puede esperar.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_video");
          return { talent: 1 };
        },
        resultado: "Lo dejás para más adelante. La canción sigue sola, sin su imagen.",
        log: "Postergó grabar un video casero."
      }
    ]);
  },

  /* ---------- El fotógrafo de undercba ---------- */
  crearEventoFanzine: function (state) {
    return Under.EXTRA._crear("under_fanzine", "Un fanzine de la escena", [
      "El fotógrafo de undercba te quiere en una nota con sesión de fotos para el fanzine de la escena.",
      "Un blog local de undercba quiere una entrevista escrita para su sección de artistas nuevos.",
      "El fotógrafo de undercba te dedica una página completa del fanzine con su cámara."
    ], [
      {
        texto: "Dar la nota",
        desc: "Tu historia contada para la escena.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_fanzine");
          return { fans: Under.SYSTEMS.fansEscala(s, 200), popularity: 1, _relaciones: 3 };
        },
        resultado: "La nota sale y el fanzine vuela por los bares. La escena te lee y te ubica.",
        log: "Dio una nota para un fanzine de la escena."
      },
      {
        texto: "Sesión de fotos para la tapa",
        desc: "Tu cara en la tapa del under.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_fanzine");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 350), _energia: -5 };
        },
        resultado: "Saldás en la tapa con la cámara del fotógrafo de undercba. El fanzine se cuelga en los locales de la zona.",
        log: "Hizo una sesión de fotos con el fotógrafo de undercba."
      },
      {
        texto: "Dejarlo pasar",
        desc: "El papel no es lo tuyo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_fanzine");
          return {};
        },
        resultado: "No das la nota. El fanzine sale con otro artista y tu página queda en blanco.",
        log: "Dejó pasar una nota en un fanzine."
      }
    ]);
  },

  /* ---------- El estudio de la escena ---------- */
  crearEventoEstudio: function (state) {
    var est = Under.DATA.estudio();
    return Under.EXTRA._crear("under_estudio", "El estudio de la escena", [
      "En " + est + " te ofrecen una sesión barata para probar sonido nuevo.",
      "Un productor local te invita a una tarde de estudio en " + est + " para experimentar.",
      est + ", el estudio de la escena, tiene un hueco en la agenda y te lo ofrecen."
    ], [
      {
        texto: "Grabar un tema",
        desc: "Aprovechás el hueco para material nuevo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 80), talent: 1, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Grabás un tema nuevo en " + est + " en una tarde. El resultado crudo, honesto y listo para el mundo.",
        log: "Grabó un tema en " + est + "."
      },
      {
        texto: "Probar sonido nuevo",
        desc: "Experimentar también es aprender.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return { talent: 2, _energia: -5 };
        },
        resultado: "Pasás la tarde en " + est + " probando sonidos que no conocías. Tu música se ensancha un poco más.",
        log: "Experimentó con sonido nuevo en " + est + "."
      },
      {
        texto: "No ir",
        desc: "El estudio puede esperar.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return {};
        },
        resultado: "No vas. El hueco en " + est + " se lo dan a otro y la tarde pasa sin tu sonido.",
        log: "No fue al estudio " + est + "."
      }
    ]);
  },

  /* ============================================================
     HACER MÚSICA: el oficio de escribir, grabar y producir
     ============================================================ */

  /* ---------- Una letra que no sale ---------- */
  crearEventoEscribirLetras: function (state) {
    return Under.EXTRA._crear("extra_letras", "Una letra que no sale", [
      "Llevás tres horas en la mesa y la hoja sigue en blanco. La letra del próximo tema no sale.",
      "La barra te ronda la cabeza pero no aterriza en el papel. Escribir también es laburar.",
      "El estribillo se resiste y el demo ya suena. Necesitás una decisión antes de que se enfríe."
    ], [
      {
        texto: "Escribir desde el barrio",
        desc: "Lo que ves en La Sobre, sin vueltas.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_letras");
          Under.MISIONES.sumar(s, "letras", 1);
          return { talent: 2 };
        },
        resultado: "Escribís desde lo que ves en La Sobre, sin vueltas. La letra sale cruda y tuya.",
        log: "Escribió una letra desde el barrio."
      },
      {
        texto: "Escribir con Agus",
        desc: "Entre los dos, la letra se arma sola.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_letras");
          Under.MISIONES.sumar(s, "letras", 1);
          Under.MISIONES.sumar(s, "agus", 1);
          return { talent: 1, _relaciones: 2 };
        },
        resultado: "Agus te tira frases y entre los dos la letra se arma sola. La hoja deja de estar en blanco.",
        log: "Escribió una letra con Agus."
      },
      {
        texto: "Dejarlo para mañana",
        desc: "No todo se fuerza.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_letras");
          return { talent: 1 };
        },
        resultado: "No la forzás. Mañana la hoja ya no va a estar tan en blanco.",
        log: "Dejó una letra para después."
      }
    ]);
  },

  /* ---------- Una demo que vuelve ---------- */
  crearEventoDemoVieja: function (state) {
    return Under.EXTRA._crear("extra_demo", "Una demo que vuelve", [
      "Revolviendo la carpeta de demos encontrás una grabación de tus comienzos. Todavía tiene algo.",
      "Un amigo te manda un audio viejo que grabaron juntos en el estudio de la escena.",
      "La carpeta 'demos' tiene un tema que nunca terminaste. Hoy suena mejor de lo que recordabas."
    ], [
      {
        texto: "Convertirla en tema",
        desc: "Pulirla y meterla al catálogo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_demo");
          Under.MISIONES.sumar(s, "demo", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 80), talent: 1, fans: Under.SYSTEMS.fansEscala(s, 400) };
        },
        resultado: "La pulís, la grabás en serio y entra al catálogo. Ese pedacito de tu comienzo se merecía la luz.",
        log: "Convirtió una demo vieja en tema."
      },
      {
        texto: "Reversionarla",
        desc: "Mismo corazón, otro arreglo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_demo");
          Under.MISIONES.sumar(s, "demo", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Le cambiás el arreglo entero. La demo vieja renace con tu sonido de ahora y nadie la reconoce.",
        log: "Reversionó una demo vieja."
      },
      {
        texto: "Dejarla en la carpeta",
        desc: "El pasado no hace falta tocarlo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_demo");
          return { talent: 1 };
        },
        resultado: "Sigue guardada. A veces el pasado no hace falta tocarlo.",
        log: "Guardó una demo vieja sin tocar."
      }
    ]);
  },

  /* ---------- Una sesión con un productor de la escena ---------- */
  crearEventoSesionProductor: function (state) {
    return Under.EXTRA._crear("extra_producir", "Una sesión con un productor de la escena", [
      "Un productor de la escena te propone una sesión para darle forma a tu próximo tema.",
      "Uno de los beats que te encanta es de un productor local que quiere laburar con vos.",
      "Kilpatay te deja una tarde en La OBS para producir juntos lo que estás armando."
    ], [
      {
        texto: "Grabar con él",
        desc: "Su oído + tu idea = el tema.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_producir");
          Under.MISIONES.sumar(s, "productor_estudio", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 100), talent: 2 };
        },
        resultado: "La sesión vuela y el tema sale con otro cuerpo. Los productores del under te abren la puerta.",
        log: "Grabó una sesión con un productor de la escena."
      },
      {
        texto: "Mostrarle tus demos",
        desc: "Que elija con vos qué pulir.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_producir");
          Under.MISIONES.sumar(s, "productor_estudio", 1);
          Under.MISIONES.sumar(s, "colega", 1);
          return { _relaciones: 3, talent: 1 };
        },
        resultado: "Le pasás todo lo que tenés. Él elige qué pulir y te devuelve la lista armada. Quedó en deuda con vos, y eso en la escena vale plata.",
        log: "Mostró sus demos a un productor de la escena."
      },
      {
        texto: "No ir",
        desc: "Preferís tu manera de laburar.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_producir");
          return { talent: 1 };
        },
        resultado: "Preferís tu manera de laburar. La sesión se pierde y el tema espera.",
        log: "No fue a una sesión con un productor de la escena."
      }
    ]);
  },

  /* ---------- Jam en el estudio ---------- */
  crearEventoJamEstudio: function (state) {
    return Under.EXTRA._crear("extra_jam_estudio", "Jam en el estudio", [
      "Alguien arma una jam en un estudio del under y faltan voces. Te llaman.",
      "Una sesión de ida y vuelta: músicos de la escena, un estudio prestado y ganas de sonar.",
      "La jam de los martes en el estudio de la zona te abre un hueco esta semana."
    ], [
      {
        texto: "Sumarte",
        desc: "Improvisar con la escena te suelta la mano.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_jam_estudio");
          Under.MISIONES.sumar(s, "sesion", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 1, _energia: -6 };
        },
        resultado: "Improvisás con la banda de la escena. De esa noche sale un groove que se te queda en la cabeza.",
        log: "Se sumó a una jam en el estudio."
      },
      {
        texto: "Grabar lo que sale",
        desc: "Le das record y te llevás el audio.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_jam_estudio");
          Under.MISIONES.sumar(s, "sesion", 1);
          return { talent: 2 };
        },
        resultado: "Le das record, improvisás y te llevás el audio entero. Entre todo ese ruido seguro hay un tema.",
        log: "Grabó una jam en el estudio."
      },
      {
        texto: "Dejarlo pasar",
        desc: "El martes te pilla justo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_jam_estudio");
          return { talent: 1 };
        },
        resultado: "El martes te pilla justo. La jam sigue sin vos y la escena lo entiende.",
        log: "Dejó pasar una jam en el estudio."
      }
    ]);
  }
};
