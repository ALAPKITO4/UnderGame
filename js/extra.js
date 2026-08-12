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
    return Under.EXTRA._crear("gen_rap", "Un veterano del rap te desafía", [
      "Un MC histórico de tu ciudad te bardeó en vivo y te cita para un duelo de rimas.",
      "En un cypher con leyendas, el más viejo te mira y te dice que sueltes tu mejor barra.",
      "Un veterano del rap local quiere probar si los nuevos tienen hambre. Arrancó por vos."
    ], [
      {
        texto: "Aceptar el duelo",
        desc: "Todo el respeto se gana en la plaza.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          if (Math.random() < 0.5) {
            return { talent: 2, popularity: 4, fans: Under.SYSTEMS.fansEscala(s, 800), _energia: -10 };
          }
          return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -10 };
        },
        resultado: "El duelo es histórico. Cuando ganás, la escena entera lo repite; cuando perdés, perdiste contra una leyenda.",
        log: "Aceptó un duelo de rimas con un veterano del rap."
      },
      {
        texto: "Freestylear con respeto",
        desc: "Mostrar el respeto también es arte.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          return { popularity: 2, talent: 1, fans: Under.SYSTEMS.fansEscala(s, 300) };
        },
        resultado: "Le dedicás tu mejor barra como homenaje. El veterano asiente: te ganaste su respeto.",
        log: "Dedicó un freestyle con respeto a un veterano del rap."
      },
      {
        texto: "Declinar",
        desc: "Su tiempo pasó. El tuyo todavía no llegó.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_rap");
          return { talent: 1 };
        },
        resultado: "No vas. El veterano sigue su camino y la escena no lo olvida del todo.",
        log: "Declinó un duelo con un veterano del rap."
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

  /* ---------- Pop: un productor quiere un himno ---------- */
  crearEventoGeneroPop: function (state) {
    var p = Under.DATA.escena({ grupo: "los amigos" });
    return Under.EXTRA._crear("gen_pop", "Un productor pop te quiere", [
      p.nombre + ", de Los Amigos, quiere que tu tema sea el himno del verano.",
      "Una discográfica chica te propone un videoclip con coreografía completa.",
      "Un estudio de pop te ofrece producir tu próximo tema para sonar en todas las radios."
    ], [
      {
        texto: "Aceptar el sonido pop",
        desc: "Masivo, pegadizo… y un poco menos tuyo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_pop");
          return { money: Under.SYSTEMS.dineroEscala(s, 600), popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 1500), talent: -1 };
        },
        resultado: "El tema sale con ese sonido redondo y masivo. Suena en todos lados, aunque sientas que algo quedó de más.",
        log: "Grabó un tema con sonido pop masivo."
      },
      {
        texto: "Pop con tu esencia",
        desc: "El gancho comercial sin perder tu marca.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_pop");
          return { popularity: 2, talent: 2, fans: Under.SYSTEMS.fansEscala(s, 700) };
        },
        resultado: "Negociás con " + p.nombre + ": pegadizo, pero con tu sonido adentro. El productor queda conforme y vos también.",
        log: "Hizo pop con su esencia intacta."
      },
      {
        texto: "Rechazar",
        desc: "Tu música no se moldea.",
        efectos: function (s) {
          Under.EXTRA._limpiar("gen_pop");
          return { talent: 1 };
        },
        resultado: "Decís que no. " + p.nombre + " busca a otro y tu sonido queda a salvo.",
        log: "Rechazó al productor pop."
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
      "Un director de cine te pide un tema para una escena de su película: " + p.nombre + " habló bien de vos."
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
    return Under.EXTRA._crear("extra_videojuego", "Un videojuego te quiere", [
      "Un estudio indie de videojuegos quiere tu tema para la banda sonora de su juego.",
      "Un juego con culto de fans te ofrece incluir tu canción en su menú principal.",
      "Un desarrollador de tu país quiere tu música de fondo para un nivel completo."
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
    return Under.EXTRA._crear("extra_publicidad", "Una publicidad te llama", [
      "Una marca local quiere un jingle para su publicidad de radio y tele.",
      "Una empresa de barrio te pide una canción corta para su campaña.",
      "Un spot institucional necesita música original y pensaron en vos."
    ], [
      {
        texto: "Componer el jingle",
        desc: "Poco glamour, plata segura y oficio.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_publicidad");
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

  /* ---------- Un reality te quiere ---------- */
  crearEventoReality: function (state) {
    return Under.EXTRA._crear("extra_reality", "Un reality te quiere", [
      "Un reality de cocina te quiere como participante famoso de la temporada.",
      "Un programa de convivencia te ofrece entrar una semana para dar rating.",
      "Un reality de competencia musical te propone ser parte del panel de jurados."
    ], [
      {
        texto: "Participar",
        desc: "Exposición masiva a cambio de un poco de ridículo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 1200), _energia: -12, talent: -1 };
        },
        resultado: "Participás y el público se encariña (o se burla). De cualquier forma, todos hablan de vos.",
        log: "Participó en un reality."
      },
      {
        texto: "Una sola aparición",
        desc: "El rating sin el costo completo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 400) };
        },
        resultado: "Aparecés una noche, decís tu frase y te vas. Alcanza para que te recuerden.",
        log: "Hizo una sola aparición en un reality."
      },
      {
        texto: "Rechazar",
        desc: "Tu música no necesita ese reflector.",
        efectos: function (s) {
          Under.EXTRA._limpiar("extra_reality");
          return { talent: 1 };
        },
        resultado: "Decís que no. El reality busca a otro famoso y tu carrera sigue su curso.",
        log: "Rechazó participar en un reality."
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

  /* ---------- Un hater te persigue ---------- */
  crearEventoFanHater: function (state) {
    return Under.EXTRA._crear("fan_hater", "Un hater te persigue", [
      "Hay un tipo que se dedica a comentar mal cada cosa que publicás.",
      "Un video tuyo se llena de comentarios negativos de la misma gente.",
      "Un hater te hizo una cuenta parodia que acumula seguidores."
    ], [
      {
        texto: "Ignorarlo",
        desc: "El hater vive del aire que le das.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_hater");
          return { _relaciones: 2 };
        },
        resultado: "No le das pelota. El hater se cansa y el fandom termina defendiéndote solo.",
        log: "Ignoró a un hater persistente."
      },
      {
        texto: "Responder con gracia",
        desc: "Una respuesta con humor desarma todo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("fan_hater");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 300), _energia: -5 };
        },
        resultado: "Le respondés con un chiste y hasta sus seguidores se ríen. El hater queda expuesto.",
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
      "Te ofrecen un escenario improvisado en La Sobre, el lugar más crudo de la escena, para un domingo.",
      "La Sobre quiere música en vivo y piensan en vos: el lugar donde el under es under de verdad.",
      "La Sobre arma un evento y te da el horario central. Ahí no hay escenario: hay hueco entre la gente."
    ], [
      {
        texto: "Tocar el domingo",
        desc: "El barrio entero pasa por La Sobre.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_plaza");
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
    return Under.EXTRA._crear("under_video", "Un video con Burger", [
      "Burger, el filmmaker de fruittyaudiovisual, te propone grabar un video casero para tu próximo tema.",
      "Burger te ofrece filmar un videoclip low cost en el barrio, con cámara de teléfono y ojo de cine.",
      "Fruitty audiovisual quiere un video crudo para uno de tus temas nuevos, con Burger en la cámara."
    ], [
      {
        texto: "Grabar el video",
        desc: "Poco presupuesto, mucha calle.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_video");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 60), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _energia: -8 };
        },
        resultado: "El video de Burger sale crudo y real. Tu barrio se convierte en el set y la gente lo siente propio.",
        log: "Grabó un video casero con Burger."
      },
      {
        texto: "Video minimalista",
        desc: "Una toma, vos y el micrófono.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_video");
          return { fans: Under.SYSTEMS.fansEscala(s, 250), talent: 1 };
        },
        resultado: "Burger filma una sola toma, sin cortes. La crudeza hace el resto y el tema gana fuerza.",
        log: "Filmó un video minimalista con Burger."
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
    return Under.EXTRA._crear("under_estudio", "El estudio de la escena", [
      "En Undersc te ofrecen una sesión barata para probar sonido nuevo.",
      "Un productor local te invita a una tarde de estudio en Undersc para experimentar.",
      "Undersc, el espacio de la escena, tiene un hueco en la agenda y te lo ofrecen."
    ], [
      {
        texto: "Grabar un tema",
        desc: "Aprovechás el hueco para material nuevo.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 80), talent: 1, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Grabás un tema nuevo en Undersc en una tarde. El resultado crudo, honesto y listo para el mundo.",
        log: "Grabó un tema en Undersc."
      },
      {
        texto: "Probar sonido nuevo",
        desc: "Experimentar también es aprender.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return { talent: 2, _energia: -5 };
        },
        resultado: "Pasás la tarde en Undersc probando sonidos que no conocías. Tu música se ensancha un poco más.",
        log: "Experimentó con sonido nuevo en Undersc."
      },
      {
        texto: "No ir",
        desc: "El estudio puede esperar.",
        efectos: function (s) {
          Under.EXTRA._limpiar("under_estudio");
          return {};
        },
        resultado: "No vas. El hueco de Undersc se lo dan a otro y la tarde pasa sin tu sonido.",
        log: "No fue al estudio de Undersc."
      }
    ]);
  }
};
