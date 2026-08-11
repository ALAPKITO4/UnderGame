/* ============================================================
   UNDER — LA VIDA UNDERGROUND (FASE 6)
   Misiones recurrentes de la escena bajo tierra: toques en
   bares, radios comunitarias, cyphers, rivales, filtraciones…
   Son decisiones chicas y variadas que llenan los años de
   grind: dan poco, pero dan todos los años.

   Cada evento tiene varias variantes de texto para que la
   escena no se sienta repetitiva. Casi todos son importantes: false
   (no muestran popup: se notan en las estadísticas).
   ============================================================ */

window.Under = window.Under || {};

Under.UNDER = {

  _pendientes: {},

  _limpiar: function (id) {
    Under.UNDER._pendientes[id] = null;
  },

  /* Factory común: cachea el evento por id para que el texto
     elegido no cambie entre renders y resuelve al decidir. */
  _crear: function (id, titulo, textos, opciones) {
    if (Under.UNDER._pendientes[id]) return Under.UNDER._pendientes[id];

    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: false,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };

    Under.UNDER._pendientes[id] = ev;
    return ev;
  },

  /* ---------- Tocar en un bar de la escena ---------- */
  crearEventoCiudad: function (state) {
    return Under.UNDER._crear("under_ciudad", "Un toque en la escena", [
      "Un bar del bajo te ofrece un viernes. Poca gente, cero escenario: un rincón con dos parlantes y una puerta que no cierra del todo.",
      "Un ciclo de artistas nuevos arranca en un local del centro. Te ofrecen la primera fecha.",
      "Una casa de la escena arma un toque entre amigos. Entrada a la gorra y mucho ruido."
    ], [
      {
        texto: "Aceptar el toque",
        desc: "Poco caché, pero cada oído nuevo cuenta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciudad");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 120), fans: Under.SYSTEMS.fansEscala(s, 150), popularity: 2, _energia: -10 };
        },
        resultado: "Tocás para un puñado de gente. No cambia el mundo, pero cada persona que miró ahora sabe tu nombre.",
        log: "Tocó en un bar de la escena."
      },
      {
        texto: "Ceder la fecha a un amigo",
        desc: "Quedás bien en la escena y guardás energía.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciudad");
          return { talent: 1, _energia: 5 };
        },
        resultado: "Le pasás la fecha a un amigo que la necesita más. La escena lo anota.",
        log: "Cedió su fecha de bar a un amigo."
      },
      {
        texto: "Exigir que paguen más",
        desc: "Un riesgo: puede salir bien… o dejar una puerta cerrada.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciudad");
          if (Math.random() < 0.5) return { money: Under.SYSTEMS.efectivoEscala(s, 260), popularity: -1, _energia: -10 };
          return { money: Under.SYSTEMS.efectivoEscala(s, 80), popularity: -2, _energia: -10 };
        },
        resultado: "Pedís más plata. A veces te la dan, a veces el dueño te descarta del circuito.",
        log: "Negoció el caché de un toque de bar."
      }
    ]);
  },

  /* ---------- Radio comunitaria / podcast de la escena ---------- */
  crearEventoRadio: function (state) {
    return Under.UNDER._crear("under_radio", "Una radio de la escena", [
      "Una radio comunitaria de tu barrio quiere pasar tu música y te invita a su estudio.",
      "Un podcast de la escena local te llama para una entrevista de una hora.",
      "Un programa de radio universitaria arma un especial de artistas nuevos."
    ], [
      {
        texto: "Dar la entrevista",
        desc: "Contás tu historia y la gente te conoce un poco más.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_radio");
          Under.MISIONES.sumar(s, "radio", 1);
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 400) };
        },
        resultado: "La entrevista sale y un puñado de oyentes te escribe. Los medios chicos también suman.",
        log: "Dio una entrevista en una radio de la escena."
      },
      {
        texto: "Tocar en vivo al aire",
        desc: "Más exposición, más cansancio.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_radio");
          Under.MISIONES.sumar(s, "radio", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 3, talent: 1, _energia: -10 };
        },
        resultado: "Tocás un tema en vivo al aire. Suena crudo y honesto, y a la gente le llega.",
        log: "Tocó en vivo en una radio de la escena."
      },
      {
        texto: "No ir",
        desc: "Guardás tu tiempo para otra cosa.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_radio");
          return { popularity: -1 };
        },
        resultado: "No vas. El conductor lo menciona de pasada, sin rencor.",
        log: "No fue a una radio de la escena."
      }
    ]);
  },

  /* ---------- Un creador de contenido te menciona ---------- */
  crearEventoInfluencer: function (state) {
    return Under.UNDER._crear("under_influencer", "Un creador te mencionó", [
      "Un creador de tu ciudad usó tu tema en un video que viene sumando vistas.",
      "Un tiktoker con 20.000 seguidores te pidió una canción para su próximo reel.",
      "Un streamer con audiencia local quiere tu música de fondo para sus directos."
    ], [
      {
        texto: "Colaborar en contenido",
        desc: "Un video juntos: su público te descubre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_influencer");
          return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _energia: -5 };
        },
        resultado: "El contenido sale y su gente se pasa a la tuya. Cada creador que te nombró, suma.",
        log: "Colaboró con un creador de contenido."
      },
      {
        texto: "Agradecer el gesto",
        desc: "Un gracias sincero y nada más.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_influencer");
          return { fans: Under.SYSTEMS.fansEscala(s, 150), popularity: 1 };
        },
        resultado: "Le agradecés públicamente. Pequeño gesto, pequeño empujón.",
        log: "Agradeció a un creador que usó su música."
      },
      {
        texto: "No responder",
        desc: "No tenés tiempo para eso.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_influencer");
          return {};
        },
        resultado: "No respondés. La oportunidad se diluye sola.",
        log: "No respondió a un creador."
      }
    ]);
  },

  /* ---------- Un rival de otra escena te bardea ---------- */
  crearEventoRival: function (state) {
    return Under.UNDER._crear("under_rival", "Un rival te bardea", [
      "Un artista de otra escena te bardea en redes por tu último tema.",
      "En un programa de radio, un rapero de otra zona dice que tu música es una copia.",
      "Un video que se burla de tu forma de cantar se comparte en tu ciudad."
    ], [
      {
        texto: "Responder con un tema",
        desc: "Una diss track: puede hacerte leyenda… o quemarte.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_rival");
          if (Math.random() < 0.5) {
            return { talent: 1, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 700), _energia: -8 };
          }
          return { popularity: -3, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -8 };
        },
        resultado: "Respondés con un tema cargado. La escena se divide: unos te aplauden, otros te descartan.",
        log: "Respondió con un tema a su rival."
      },
      {
        texto: "Responder con altura",
        desc: "Le contestás en serio y sin bajar el nivel.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_rival");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Respondés con una frase medida. Hasta tu rival tiene que admitir que quedaste bien.",
        log: "Respondió con altura a un rival."
      },
      {
        texto: "Ignorarlo",
        desc: "El ruido se apaga solo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_rival");
          return {};
        },
        resultado: "No le das pelota. En una semana nadie lo recuerda.",
        log: "Ignoró la provocación de un rival."
      }
    ]);
  },

  /* ---------- Batalla de freestyle ---------- */
  crearEventoFreestyle: function (state) {
    return Under.UNDER._crear("under_freestyle", "Batalla de freestyle", [
      "Hay una batalla de freestyle en una plaza y te anotaron sin preguntarte.",
      "Un cypher improvisado en la puerta de un estudio. Todos esperan que sueltes la mejor barra.",
      "Un conocido te desafía a un duelo de rimas en un evento callejero."
    ], [
      {
        texto: "Batallar",
        desc: "Todo o nada: puede relanzarte la noche… o dejarte en ridículo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          if (Math.random() < 0.5) {
            Under.MISIONES.sumar(s, "freestyle", 1);
            return { talent: 2, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 400), _energia: -10 };
          }
          return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 100), _energia: -10 };
        },
        resultado: "Batallás. Cuando estás arriba, sos fuego; cuando no, la plaza lo sabe igual.",
        log: "Participó de una batalla de freestyle."
      },
      {
        texto: "Tirar una barra y retirarte",
        desc: "Un gesto, sin arriesgar la noche.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          return { popularity: 1, talent: 1 };
        },
        resultado: "Solás una barra afilada y te vas antes de que te toque el turno. Deja intriga.",
        log: "Improvisó una barra y se retiró."
      },
      {
        texto: "No participar",
        desc: "El escenario callejero no es lo tuyo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          return {};
        },
        resultado: "No participás. Algunos lo leen como miedo, otros como criterio.",
        log: "No participó de una batalla de freestyle."
      }
    ]);
  },

  /* ---------- Cypher de la escena ---------- */
  crearEventoCypher: function (state) {
    return Under.UNDER._crear("under_cypher", "Un cypher de la escena", [
      "Te invitan a un cypher grabado con seis artistas de la escena.",
      "Una colectiva urbana arma una sesión colaborativa y querés entrar."
    ], [
      {
        texto: "Sumarte al cypher",
        desc: "Tu verso queda grabado con los de la escena.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cypher");
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 3, _energia: -8 };
        },
        resultado: "Tu parte del cypher es la más repetida. La escena te suma a su círculo.",
        log: "Se sumó a un cypher de la escena."
      },
      {
        texto: "Producir el cypher",
        desc: "Pagás el estudio y ponés tu nombre en los créditos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cypher");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 100), fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, talent: 1, _energia: -8 };
        },
        resultado: "Producís la sesión. Tu nombre corre por la escena como el que la hizo posible.",
        log: "Produjo un cypher de la escena."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Tu verso puede esperar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cypher");
          return {};
        },
        resultado: "No entrás. La sesión sale sin vos, y nadie se acuerda en dos semanas.",
        log: "Dejó pasar un cypher de la escena."
      }
    ]);
  },

  /* ---------- Telonero de un artista más grande ---------- */
  crearEventoTelonero: function (state) {
    return Under.UNDER._crear("under_telonero", "Te ofrecen el telonero", [
      "Un artista más grande de tu ciudad te elige para abrir su show.",
      "Una banda de gira nacional para en tu provincia y te ofrecen la apertura.",
      "Un evento con cabeza de cartel te ubica en la apertura, antes del plato fuerte."
    ], [
      {
        texto: "Abrir el show",
        desc: "Su público te ve por primera vez. Una paliza, pero enorme.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_telonero");
          return { money: Under.SYSTEMS.efectivoEscala(s, 100), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 4, _energia: -15 };
        },
        resultado: "Abrís su show y su gente te recibe mejor de lo que esperabas. Salís del escenario con una fecha más en la lista.",
        log: "Abrió un show de un artista más grande."
      },
      {
        texto: "Pedir más plata",
        desc: "Ajustás el contrato. Puede cerrarse… o no.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_telonero");
          return { money: Under.SYSTEMS.efectivoEscala(s, 220), fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _energia: -15 };
        },
        resultado: "Pedís más y lo conseguís a medias. Tocás bien, pero el cabeza de cartel te mira distinto.",
        log: "Negoció su participación como telonero."
      },
      {
        texto: "Rechazar",
        desc: "Preferís tu propio escenario este año.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_telonero");
          return {};
        },
        resultado: "Decís que no. La oportunidad se la dan a otro, y el que abre se hace un nombre.",
        log: "Rechazó ser telonero de un artista más grande."
      }
    ]);
  },

  /* ---------- Un DJ quiere un remix ---------- */
  crearEventoRemix: function (state) {
    return Under.UNDER._crear("under_remix", "Te piden un remix", [
      "Un DJ de la escena quiere un remix de tu último tema para sus sets.",
      "Un productor de electrónica te propone llevar una de tus canciones a la pista.",
      "Un canal de reels musicales quiere usar tu tema de fondo en sus edits."
    ], [
      {
        texto: "Cedérselo gratis",
        desc: "Su pista lo toca en cada fecha: difusión pura.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_remix");
          return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2 };
        },
        resultado: "Lo cedés. El remix suena en sus sets y una parte de su público va a buscarte.",
        log: "Cedió un tema para un remix."
      },
      {
        texto: "Cobrarlo",
        desc: "Menos difusión, pero plata en mano.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_remix");
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 250), popularity: 1 };
        },
        resultado: "Cobrás una cifra chica y el remix sale igual. Justo a medias.",
        log: "Cobró por un remix de su tema."
      },
      {
        texto: "Negarse",
        desc: "Tu tema queda en tus manos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_remix");
          return {};
        },
        resultado: "Te negás. El DJ usa otra cosa, y la oportunidad se va con él.",
        log: "No cedió su tema para un remix."
      }
    ]);
  },

  /* ---------- Se filtra una maqueta ---------- */
  crearEventoFiltracion: function (state) {
    return Under.UNDER._crear("under_filtracion", "Una maqueta filtrada", [
      "Se filtra una maqueta vieja tuya que nunca terminaste.",
      "Alguien sube una demo de tus inicios a internet.",
      "Una versión descartada de tu último tema aparece en un foro."
    ], [
      {
        texto: "Reclamarla como tuya",
        desc: "La publicás oficial, aunque no era tu mejor versión.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_filtracion");
          return { money: Under.SYSTEMS.efectivoEscala(s, 80), fans: Under.SYSTEMS.fansEscala(s, 300), talent: -1 };
        },
        resultado: "La reclamás y la publicás. Unos la aman por cruda; vos sabés que estaba verde.",
        log: "Reclamó una maqueta filtrada."
      },
      {
        texto: "Pedir que la bajen",
        desc: "Tu material inacabado no es para mostrar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_filtracion");
          return { popularity: -1 };
        },
        resultado: "La hacés bajar. La gente que ya la escuchó te acusa de esconder cosas.",
        log: "Pidió que bajen una maqueta filtrada."
      },
      {
        texto: "Convertirla en un lanzamiento cuidado",
        desc: "Gastás en arreglarla y la relanzás hecha y derecha.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_filtracion");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _energia: -10 };
        },
        resultado: "La entrás al estudio, la terminás como correspondía y la relanzás. La historia termina bien.",
        log: "Convirtió una filtración en un lanzamiento cuidado."
      }
    ]);
  },

  /* ---------- Un barrio hace suyo un tema ---------- */
  crearEventoZona: function (state) {
    return Under.UNDER._crear("under_zona", "Tu tema es del barrio", [
      "Un tema tuyo se volvió el himno no oficial de un barrio.",
      "Los chicos de una zona hacen un baile con tu canción y lo suben a redes."
    ], [
      {
        texto: "Abrazarlo",
        desc: "Dejás que sea de ellos. Eso construye una base real.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zona");
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3 };
        },
        resultado: "Lo abrazás y hasta subís un video bailando el paso. La zona te hace suyo para siempre.",
        log: "Abrazó el fenómeno de un tema en su barrio."
      },
      {
        texto: "Capitalizarlo con merch",
        desc: "El momento rinde plata si lo apurás.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zona");
          return { money: Under.SYSTEMS.efectivoEscala(s, 200), fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 1 };
        },
        resultado: "Vendés stickers y remeras con el paso de moda. Algunos lo celebran, otros lo leen como oportunismo.",
        log: "Capitalizó con merch el fenómeno de un tema."
      },
      {
        texto: "Dejarlo ser",
        desc: "No tocar nada: la ola pasa sola.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zona");
          return {};
        },
        resultado: "No hacés nada. El tema hizo su vida y el barrio lo sigue cantando igual.",
        log: "Dejó que un tema hiciera su vida en el barrio."
      }
    ]);
  },

  /* ---------- Grabar tu primera maqueta ---------- */
  crearEventoMaqueta: function (state) {
    return Under.UNDER._crear("under_maqueta", "Una maqueta en puerta", [
      "Un productor de la escena te propone grabar tu primera maqueta, con 5 temas.",
      "Te invitan a una sesión colectiva para grabar un compilado de la escena.",
      "Un estudio de barrio te ofrece un paquete barato para grabar tus temas."
    ], [
      {
        texto: "Grabar la maqueta",
        desc: "Un clásico: material físico para repartir.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_maqueta");
          Under.MISIONES.sumar(s, "maqueta", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 120), talent: 2, fans: Under.SYSTEMS.fansEscala(s, 300), _energia: -12 };
        },
        resultado: "Grabás tu maqueta. La repartís en bares y eventos, y la escena empieza a repetir tu nombre.",
        log: "Grabó su primera maqueta."
      },
      {
        texto: "Graban un demo rápido",
        desc: "Una sola canción, sin gastar demasiado.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_maqueta");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 50), talent: 1, fans: Under.SYSTEMS.fansEscala(s, 120) };
        },
        resultado: "Grabás un demo de un solo tema. Alcanza para dejar de decir que no tenés nada.",
        log: "Grabó un demo rápido."
      },
      {
        texto: "Esperar a tener más material",
        desc: "Mejor pocas pero buenas.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_maqueta");
          return { talent: 1 };
        },
        resultado: "Preferís juntar más temas. La escena espera y el estudio queda con la puerta abierta.",
        log: "Postergó grabar su maqueta."
      }
    ]);
  },

  /* ---------- Un colega te propone grabar juntos ---------- */
  crearEventoColega: function (state) {
    return Under.UNDER._crear("under_colega", "Un colega de la escena", [
      "Un artista de tu misma camada te propone grabar un tema juntos, sin plata de por medio.",
      "Un MC de tu ciudad quiere que compartan un verso en un tema suyo.",
      "Una productora local te ofrece grabar un tema conjunto para su sello chico."
    ], [
      {
        texto: "Grabar juntos",
        desc: "Sumar voces suma oídos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2, _energia: -8 };
        },
        resultado: "El tema sale y la escena lo repite. Tu nombre suena al lado del de otro, y eso se nota.",
        log: "Grabó un tema con un colega de la escena."
      },
      {
        texto: "Producir el tema",
        desc: "Pagás el estudio y ponés tu firma.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 100), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2 };
        },
        resultado: "Producís la sesión y tu nombre entra en los créditos. En la escena, el que produce manda.",
        log: "Produjo un tema de un colega."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Tu voz primero.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          return {};
        },
        resultado: "No te sumás. El colega sigue con lo suyo y la oportunidad se disuelve.",
        log: "Dejó pasar un tema con un colega."
      }
    ]);
  },

  /* ---------- Backstage: conocer a un referente ---------- */
  crearEventoReferente: function (state) {
    return Under.UNDER._crear("under_referente", "Un referente te habla", [
      "En un toque, un referente de la escena se acerca a hablar con vos después de tu show.",
      "Un veterano del under te para en la calle y te dice que tu último tema no es lo tuyo.",
      "Un productor que hizo historia en tu ciudad te invita a tomar un café y te aconseja."
    ], [
      {
        texto: "Escuchar y tomar nota",
        desc: "Los consejos de los viejos pesan.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          return { talent: 2, popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Escuchás cada palabra. Algunas duelen, pero la mayoría sirven. El referente te anota en su radar.",
        log: "Escuchó los consejos de un referente."
      },
      {
        texto: "Discutir tu punto",
        desc: "Tu música, tu criterio.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          if (Math.random() < 0.5) return { talent: 2, popularity: 3 };
          return { popularity: -2 };
        },
        resultado: "Defendés tu sonido con argumentos. A veces convence, a veces queda como el nuevo insolente.",
        log: "Discutió su punto con un referente."
      },
      {
        texto: "Pedirle una colaboración",
        desc: "Aprovechar el momento, aunque sea atrevido.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          if (Math.random() < 0.4) return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 5, talent: 1 };
          return { popularity: -1 };
        },
        resultado: "Le pedís grabar algo juntos. A veces te dice que sí y tu nombre explota en la escena; a veces te mira y cambia de tema.",
        log: "Le pidió una colaboración a un referente."
      }
    ]);
  },

  /* ---------- Una zanja creativa ---------- */
  crearEventoBloqueo: function (state) {
    return Under.UNDER._crear("under_bloqueo", "La página en blanco", [
      "Hace semanas que no sale una línea. El estudio te queda grande.",
      "Todos tus temas nuevos te suenan igual. Perdiste la chispa.",
      "Escuchás tus primeras grabaciones y sentís que ya no sabés componer."
    ], [
      {
        texto: "Forzar la escritura",
        desc: "Escribís mal, pero escribís.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_bloqueo");
          if (Math.random() < 0.5) return { talent: 2, _energia: -10 };
          return { talent: -1, _energia: -10 };
        },
        resultado: "Forzás la escritura hasta que algo sale. La mayoría es basura, pero una línea vale la pena.",
        log: "Forzó la escritura durante un bloqueo."
      },
      {
        texto: "Cambiar el entorno",
        desc: "Grabás en otro lado, con otra gente.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_bloqueo");
          return { talent: 2, money: -Under.SYSTEMS.efectivoEscala(s, 60), _energia: -5 };
        },
        resultado: "Cambiás de ambiente y el aire nuevo destraba algo adentro tuyo.",
        log: "Cambió de entorno para salir del bloqueo."
      },
      {
        texto: "Descansar la cabeza",
        desc: "El bloqueo también se cura con tiempo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_bloqueo");
          return { _energia: 10 };
        },
        resultado: "No escribís nada por un tiempo. Cuando volvés, el material sale solo.",
        log: "Descansó para superar un bloqueo creativo."
      }
    ]);
  },

  /* ---------- Un viejo de la escena te advierte ---------- */
  crearEventoAdvertencia: function (state) {
    return Under.UNDER._crear("under_advertencia", "La advertencia de un viejo", [
      "Un veterano del under te dice que no te apures: 'Acá los que saltan rápido, caen rápido'.",
      "Alguien que estuvo a punto de ser grande te cuenta cómo lo quemaron las ganas de fama.",
      "Un músico de tu barrio que se fue a la fama y volvió te advierte sobre lo que te espera."
    ], [
      {
        texto: "Tomarlo en serio",
        desc: "Aprender de los que ya cayeron.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_advertencia");
          return { talent: 1, popularity: 2 };
        },
        resultado: "Escuchás la historia y la guardás. Crecés sin dejar de mirar el piso.",
        log: "Atendió la advertencia de un veterano."
      },
      {
        texto: "Seguir tu instinto",
        desc: "Tu camino es otro.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_advertencia");
          return { popularity: 3, talent: -1 };
        },
        resultado: "Agradecés el consejo y seguís a tu manera. El viejo te mira y sonríe, como quien ya vio esta película.",
        log: "Siguió su instinto pese a la advertencia."
      },
      {
        texto: "Pedirle un consejo puntual",
        desc: "Un dato concreto vale más que mil sermones.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_advertencia");
          return { talent: 2 };
        },
        resultado: "Le sacás un consejo concreto para tu próximo paso. Vale oro y te ahorra años.",
        log: "Pidió un consejo puntual a un veterano."
      }
    ]);
  },

  /* ---------- Una feria del barrio ---------- */
  crearEventoFeria: function (state) {
    return Under.UNDER._crear("under_feria", "Una feria del barrio", [
      "En la feria comunitaria del barrio te ofrecen un puesto para vender tu material.",
      "Un mercadillo de discos y fanzines te deja un lugar para tus maquetas y stickers.",
      "Una feria cultural de tu zona te da un espacio para mostrar tu música en vivo."
    ], [
      {
        texto: "Ir a vender",
        desc: "Poca plata, pero contacto cara a cara.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_feria");
          return { money: Under.SYSTEMS.efectivoEscala(s, 180), fans: Under.SYSTEMS.fansEscala(s, 200), _energia: -8 };
        },
        resultado: "Vendés algunas maquetas y te llevás charlas que valen más que la plata.",
        log: "Vendió su material en una feria del barrio."
      },
      {
        texto: "Regalar demos",
        desc: "Hoy regalás, mañana te devuelven.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_feria");
          return { fans: Under.SYSTEMS.fansEscala(s, 400), _relaciones: 3 };
        },
        resultado: "Repartís demos gratis. Un montón de manos nuevas con tu nombre y tu sonido.",
        log: "Regaló demos en una feria del barrio."
      },
      {
        texto: "Quedarte en el estudio",
        desc: "Tu tiempo es para la música.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_feria");
          return { talent: 1 };
        },
        resultado: "No vas. La feria sigue sin vos y el estudio te lo agradece.",
        log: "Prefirió el estudio antes que una feria del barrio."
      }
    ]);
  },

  /* ---------- Un taller en el centro cultural ---------- */
  crearEventoEscuela: function (state) {
    return Under.UNDER._crear("under_escuela", "Un taller en el barrio", [
      "Un centro cultural del barrio te invita a dar un taller de escritura de rimas.",
      "Una organización comunitaria te pide una charla sobre la escena local.",
      "Un grupo de pibes de tu zona quiere que les enseñes a componer."
    ], [
      {
        texto: "Dar el taller",
        desc: "Enseñar también te forma a vos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          return { talent: 2, _relaciones: 4, fans: Under.SYSTEMS.fansEscala(s, 250), _energia: -8 };
        },
        resultado: "El taller se llena y los pibes salen escribiendo cosas que te sorprenden. La zona te quiere un poco más.",
        log: "Dio un taller de escritura en el barrio."
      },
      {
        texto: "Grabar con los pibes",
        desc: "Producción colectiva: más laburo, más magia.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 400), money: -Under.SYSTEMS.efectivoEscala(s, 50), _energia: -10 };
        },
        resultado: "Grabás con el grupo un tema colectivo. El resultado se comparte por la zona y tu nombre entra en las casas.",
        log: "Grabó un tema colectivo con pibes del barrio."
      },
      {
        texto: "No poder ir",
        desc: "Tu agenda no te deja.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          return {};
        },
        resultado: "No vas. La organización lo entiende, pero la puerta queda un poco más fría.",
        log: "No pudo dar un taller en el barrio."
      }
    ]);
  },

  /* ---------- Una fiesta privada te paga ---------- */
  crearEventoFiesta: function (state) {
    return Under.UNDER._crear("under_fiesta", "Una fiesta privada te llama", [
      "Una fiesta privada te ofrece un caché en mano por tocar tres horas.",
      "Un evento de fin de año de una empresa quiere música en vivo para sus empleados.",
      "Una cumpleaños de un personaje de la zona quiere que le pongas la música."
    ], [
      {
        texto: "Tocar la fiesta",
        desc: "Caché seguro, aunque la noche se alarga.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fiesta");
          return { money: Under.SYSTEMS.efectivoEscala(s, 350), fans: Under.SYSTEMS.fansEscala(s, 300), _energia: -12 };
        },
        resultado: "Tocás la fiesta y cobrás en mano. La gente pide otra, pero la noche tiene límite.",
        log: "Tocó en una fiesta privada."
      },
      {
        texto: "Pedir más plata",
        desc: "Un riesgo: puede salir bien… o no.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fiesta");
          if (Math.random() < 0.5) return { money: Under.SYSTEMS.efectivoEscala(s, 600), _energia: -12 };
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), popularity: -1, _energia: -12 };
        },
        resultado: "Pedís más. A veces ceden y sale redondo; a veces te descartan y quedás en el molde.",
        log: "Negoció el caché de una fiesta privada."
      },
      {
        texto: "Dejarla pasar",
        desc: "Tu noche vale más que la plata.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fiesta");
          return {};
        },
        resultado: "No vas. La fiesta busca a otro y tu noche queda libre.",
        log: "Dejó pasar una fiesta privada."
      }
    ]);
  },

  /* ---------- Te piden la banda en vivo ---------- */
  crearEventoBanda: function (state) {
    return Under.UNDER._crear("under_banda", "Te piden la banda en vivo", [
      "Un artista del under te pide que lo acompañes con una banda en vivo para su fecha.",
      "Un productor necesita músicos para el show de un cantante local y piensa en vos.",
      "Una banda de tu ciudad quiere sumarte como voz invitada en una gira chica."
    ], [
      {
        texto: "Sumarte",
        desc: "Otra escuela: tocar para otro también enseña.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_banda");
          return { money: Under.SYSTEMS.efectivoEscala(s, 250), talent: 2, _energia: -12 };
        },
        resultado: "Te sumás y la fecha sale perfecta. Aprendés más de lo que esperabas y la escena te anota como músico serio.",
        log: "Se sumó como músico a un show de otro artista."
      },
      {
        texto: "Proponer tu propio set",
        desc: "Ya que estás, que te escuchen a vos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_banda");
          return { talent: 1, popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Negociás: tocás para él y al final abrís vos. El público se queda con las dos cosas.",
        log: "Abrió su propio set en la fecha de otro artista."
      },
      {
        texto: "Declinar",
        desc: "Tu música primero.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_banda");
          return {};
        },
        resultado: "Decís que no. Otro ocupa tu lugar y la fecha sale igual.",
        log: "Declinó tocar para otro artista."
      }
    ]);
  },

  /* ---------- Tu tema se vuelve un grito ---------- */
  crearEventoManifiesto: function (state) {
    return Under.UNDER._crear("under_manifiesto", "Tu tema es un grito", [
      "Un tema tuyo se convirtió en el himno de una movida barrial que está creciendo.",
      "Una causa local adoptó una canción tuya y la cantan en cada encuentro.",
      "Los pibes de una zona usan tu tema como bandera para una pelea que los une."
    ], [
      {
        texto: "Abrazarlo como propio",
        desc: "Que tu música sea de la gente.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_manifiesto");
          return { fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _relaciones: 4 };
        },
        resultado: "Lo abrazás y hasta le dedicás una historia a la movida. Tu tema se vuelve algo más grande que una canción.",
        log: "Abrazó el himno que se volvió su tema en el barrio."
      },
      {
        texto: "Sumarte a la movida",
        desc: "Estar adentro, con todo lo que implica.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_manifiesto");
          if (Math.random() < 0.5) {
            return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4, _relaciones: 4, _energia: -10 };
          }
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: -2, _energia: -10 };
        },
        resultado: "Te sumás de lleno. Tu nombre crece con la movida, aunque el fuego a veces quema.",
        log: "Se sumó a la movida que adoptó su tema."
      },
      {
        texto: "Mantener distancia",
        desc: "Tu música, tu política, por separado.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_manifiesto");
          return { popularity: -1 };
        },
        resultado: "No te metés. La movida sigue cantando tu tema igual, pero vos quedás del lado de afuera.",
        log: "Mantuvo distancia de la movida que adoptó su tema."
      }
    ]);
  }
};
