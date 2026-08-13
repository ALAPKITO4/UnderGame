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

  /* Un escenario de la escena al azar. Los lugares reales que pasó
     la amiga (LUGARES) salen más seguido que los genéricos, así el
     under se siente de Córdoba de verdad. */
  _escenario: function () {
    var list = Math.random() < 0.6 ? Under.DATA.LUGARES : Under.DATA.ESCENARIOS;
    return list[Under.STATE.randInt(0, list.length - 1)];
  },

  /* Un artista de la escena al azar. */
  _artista: function () {
    var list = Under.DATA.ARTISTAS_ESCENA;
    return list[Under.STATE.randInt(0, list.length - 1)];
  },

  /* La cuenta de la escena local: para Córdoba es @cba_underground
     (la real del under cordobés); para otras ciudades se adapta
     con una versión corta del nombre elegido. */
  _cuentaIg: function (state) {
    var c = ((state.artista && state.artista.ciudad) || "").split(",")[0].toLowerCase().trim();
    c = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
    var n = c.split(" ")[0] || "zona";
    var full = c.replace(/\s+/g, "");
    if (full.indexOf("ciudaddemexico") === 0) return "@cdmx_underground";
    if (full.indexOf("ciudaddepanama") === 0) return "@pty_underground";
    if (n.indexOf("cordob") === 0) return "@cba_underground";
    if (n.indexOf("buenos") === 0) return "@bsas_underground";
    if (n.indexOf("rosario") === 0) return "@rosario_underground";
    if (n.indexOf("bogota") === 0) return "@bogota_underground";
    if (n.indexOf("medellin") === 0) return "@mede_underground";
    if (n.indexOf("lima") === 0) return "@lima_underground";
    if (n.indexOf("santiago") === 0) return "@stgo_underground";
    if (n.indexOf("montevideo") === 0) return "@monte_underground";
    if (n.indexOf("quito") === 0) return "@quito_underground";
    if (n.indexOf("caracas") === 0) return "@caracas_underground";
    if (n.indexOf("sao") === 0) return "@sp_underground";
    if (n.indexOf("madrid") === 0) return "@madriz_underground";
    return "@" + (n.slice(0, 3) || "zona") + "_underground";
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
    var esc = Under.UNDER._escenario();
    var esc2 = Under.UNDER._escenario();
    var esc3 = Under.UNDER._escenario();
    return Under.UNDER._crear("under_ciudad", "Un toque en la escena", [
      "Un bar del bajo te ofrece un viernes en " + esc.nombre + ". Poca gente, cero escenario: un rincón con dos parlantes y una puerta que no cierra del todo.",
      "Un ciclo de artistas nuevos arranca en " + esc2.nombre + ". Te ofrecen la primera fecha.",
      "En " + esc3.nombre + " arman un toque entre amigos. Entrada a la gorra y mucho ruido.",
      "Los amigos con la 3flip te ofrecen tu primera fecha."
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
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciudad");
          return { money: Under.SYSTEMS.efectivoEscala(s, 260), popularity: -1, _energia: -10 };
        },
        resultado: "Pedís más plata y te la dan. El dueño queda seco, pero te anota para la próxima.",
        log: "Negoció y consiguió un mejor caché en un toque de bar.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ciudad");
          return { money: Under.SYSTEMS.efectivoEscala(s, 80), popularity: -2, _energia: -10 };
        },
        riesgoResultado: "Pedís más y el dueño te descarta del circuito. Esa puerta se cerró.",
        riesgoLog: "Exigió más caché y lo descartaron del bar."
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
          Under.MISIONES.sumar(s, "contenido", 1);
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
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_rival");
          return { talent: 1, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 700), _energia: -8 };
        },
        resultado: "La diss es letal. La escena la repite por todos lados y tu nombre gana una plaza.",
        log: "Respondió con un tema contundente a su rival.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_rival");
          return { popularity: -3, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -8 };
        },
        riesgoResultado: "La diss te sale floja. Te la devuelven al toque y la escena se ríe de los dos.",
        riesgoLog: "Su diss track le salió mal y perdió crédito."
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
      "Hay una batalla de freestyle en La Sobre y te anotaron sin preguntarte.",
      "Un cypher improvisado en La Sobre. Todos esperan que sueltes la mejor barra.",
      "Un conocido te desafía a un duelo de rimas en una joda de La Sobre."
    ], [
      {
        texto: "Batallar",
        desc: "Todo o nada: puede relanzarte la noche… o dejarte en ridículo.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          Under.MISIONES.sumar(s, "freestyle", 1);
          return { talent: 2, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 400), _energia: -10 };
        },
        resultado: "Batallás y la rompés. La Sobre estalla y te anotan como el que no se achica.",
        log: "Ganó una batalla de freestyle.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 100), _energia: -10 };
        },
        riesgoResultado: "Batallás y te quedás en blanco. La Sobre lo vio todo, y el video corre por los grupos.",
        riesgoLog: "Perdió una batalla de freestyle."
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
        desc: "El escenario de La Sobre no es lo tuyo.",
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
      "Te invitan a un cypher grabado en La Sobre con seis artistas de la escena.",
      "Una colectiva urbana arma una sesión colaborativa en La Sobre y querés entrar."
    ], [
      {
        texto: "Sumarte al cypher",
        desc: "Tu verso queda grabado con los de la escena.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cypher");
          Under.MISIONES.sumar(s, "cypher", 1);
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
          Under.MISIONES.sumar(s, "telonero", 1);
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
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_remix", "Te piden un remix", [
      nombre + ", un DJ de la escena, quiere un remix de tu último tema para sus sets.",
      nombre + " te propone llevar una de tus canciones a la pista.",
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
        resultado: "Te negás. " + nombre + " usa otra cosa, y la oportunidad se va con él.",
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
          Under.MISIONES.sumar(s, "barrio", 1);
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
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_maqueta", "Una maqueta en puerta", [
      nombre + ", un productor de la escena, te propone grabar tu primera maqueta, con 5 temas.",
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
      "Ghosfe, un artista de tu misma camada, te propone grabar un tema juntos, sin plata de por medio.",
      "Caupiii, un MC de tu ciudad, quiere que compartan un verso en un tema suyo.",
      "Ghosfe y Caupiii te ofrecen grabar un tema conjunto para la escena."
    ], [
      {
        texto: "Grabar juntos",
        desc: "Sumar voces suma oídos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          Under.MISIONES.sumar(s, "colega", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2, _energia: -8 };
        },
        resultado: "El tema con Ghosfe y Caupiii sale y la escena lo repite. Tu nombre suena al lado del de ellos, y eso se nota.",
        log: "Grabó un tema con Ghosfe y Caupiii."
      },
      {
        texto: "Producir el tema",
        desc: "Pagás el estudio y ponés tu firma.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 100), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2 };
        },
        resultado: "Producís la sesión y tu nombre entra en los créditos. En la escena, el que produce manda.",
        log: "Produjo un tema de Ghosfe y Caupiii."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Tu voz primero.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_colega");
          return {};
        },
        resultado: "No te sumás. Ghosfe y Caupiii siguen con lo suyo y la oportunidad se disuelve.",
        log: "Dejó pasar un tema con Ghosfe y Caupiii."
      }
    ]);
  },

  /* ---------- Una sala te da una fecha suelta ---------- */
  crearEventoSala: function (state) {
    var esc = Under.UNDER._escenario();
    var esc2 = Under.UNDER._escenario();
    return Under.UNDER._crear("under_sala", "Una sala te da una fecha", [
      "En " + esc.nombre + " te ofrecen una fecha suelta. Poco caché, pero un lugar con nombre para que te conozcan.",
      "Un ciclo de la escena arranca en " + esc2.nombre + " y te dan un hueco en la grilla para una noche.",
      "El dueño de " + esc.nombre + " vio tu último toque y te invita a tocar una noche en su lugar."
    ], [
      {
        texto: "Tomar la fecha",
        desc: "Una noche en un lugar con nombre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sala");
          Under.MISIONES.sumar(s, "salas", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 450), popularity: 3, _energia: -15 };
        },
        resultado: "Tocás una noche en " + esc.nombre + " y la sala se llena con tu nombre. Un lugar con nombre en la escena.",
        log: "Tocó una noche en una sala de la escena."
      },
      {
        texto: "Negociar un porcentaje de la barra",
        desc: "Más plata, más riesgo de quedar afuera.",
        riesgo: 0.3,
        efectos: function (s) {
          Under.UNDER._limpiar("under_sala");
          Under.MISIONES.sumar(s, "salas", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 300), popularity: 2, _energia: -15 };
        },
        resultado: "Negociás y te llevás un porcentaje de la barra. La sala acepta a regañadientes, pero esa noche es tuya.",
        log: "Negoció un porcentaje de barra en una sala.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_sala");
          return { money: Under.SYSTEMS.efectivoEscala(s, 80), popularity: -2, _energia: -10 };
        },
        riesgoResultado: "Pedís demasiado y la sala elige a otro. Esa puerta se cerró antes de abrirse.",
        riesgoLog: "Perdió la fecha de sala por negociar demasiado."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Tu tiempo es tuyo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sala");
          return {};
        },
        resultado: "Lo dejás pasar. Otra noche, otro lugar, otra historia.",
        log: "Dejó pasar una fecha suelta en una sala."
      }
    ]);
  },

  /* ---------- Un ciclo de tu barrio ---------- */
  crearEventoCiclo: function (state) {
    var esc = Under.UNDER._escenario();
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_ciclo", "Un ciclo de tu barrio", [
      "Tres fechas seguidas en el ciclo del barrio. La escena entera va a mirar.",
      "El ciclo 'Nuevas Sangres' arma un line-up de 3 noches en " + esc.nombre + ".",
      "Un ciclo de artistas nuevos te invita a cerrar la segunda noche, con " + nombre + " abriendo."
    ], [
      {
        texto: "Sumarte al ciclo",
        desc: "Tres noches para hacerte un nombre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciclo");
          Under.MISIONES.sumar(s, "ciclos", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 4, _energia: -12 };
        },
        resultado: "Tocás las tres noches y para la última ya hay gente que va a verte a vos. El ciclo te adopta.",
        log: "Participó de un ciclo de su barrio."
      },
      {
        texto: "Aportar a la organización",
        desc: "Quedás bien con la escena y conocés gente.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciclo");
          Under.MISIONES.sumar(s, "artistas", 1);
          return { _relaciones: 3, popularity: 1, money: -Under.SYSTEMS.efectivoEscala(s, 40) };
        },
        resultado: "Ayudás a coordinar fechas y sonido. La escena te anota como alguien que suma, no solo que toca.",
        log: "Aportó a la organización de un ciclo."
      },
      {
        texto: "No sumarte",
        desc: "Tu energía tiene otros destinos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ciclo");
          return {};
        },
        resultado: "No te sumás. El ciclo sigue sin vos, y la escena también.",
        log: "No participó de un ciclo del barrio."
      }
    ]);
  },

  /* ---------- Kilpatay y La OBS ---------- */
  crearEventoObs: function (state) {
    return Under.UNDER._crear("under_obs", "Kilpatay te abre La OBS", [
      "Kilpatay escuchó tu tema y no se quedó callado: te ofrece grabar en La OBS, el estudio de Los Amigos, con un sonido profesional.",
      "El estudio La OBS te abre sus puertas de noche. Kilpatay escuchó tu tema y quiere grabarte con un sonido profesional.",
      "Kilpatay te escribe: 'La OBS es tuya esta noche'. Estudio de verdad, con ingeniero de sonido y todo."
    ], [
      {
        texto: "Grabar en La OBS",
        desc: "Un sonido profesional le cambia el peso a tus temas.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_obs");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 600), _energia: -8 };
        },
        resultado: "Grabás en La OBS. Cuando escuchás el tema terminado entendés la diferencia: esto suena a disco.",
        log: "Grabó en La OBS con sonido profesional."
      },
      {
        texto: "Pedirle que te produzca un tema completo",
        desc: "Kilpatay no produce a cualquiera.",
        riesgo: 0.4,
        efectos: function (s) {
          Under.UNDER._limpiar("under_obs");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { talent: 3, fans: Under.SYSTEMS.fansEscala(s, 900), _energia: -10 };
        },
        resultado: "Kilpatay acepta y te produce el tema de punta a punta. El resultado vale la jugada.",
        log: "Consiguió que Kilpatay le produzca un tema en La OBS.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_obs");
          return { popularity: -1, _energia: -10 };
        },
        riesgoResultado: "Kilpatay pone condiciones y la cosa se enfría. Quedás grabando solo, con la puerta medio cerrada.",
        riesgoLog: "Falló en conseguir la producción de Kilpatay."
      },
      {
        texto: "Agradecer y pasar",
        desc: "Todavía no estás listo para ese estudio.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_obs");
          return {};
        },
        resultado: "Agradecés el gesto y lo guardás. La OBS puede esperar su momento.",
        log: "Dejó pasar la oportunidad de grabar en La OBS."
      }
    ]);
  },

  /* ---------- Tu tema en la cuenta de la escena ---------- */
  crearEventoIg: function (state) {
    var cuenta = Under.UNDER._cuentaIg(state);
    return Under.UNDER._crear("under_ig", "Tu tema en la escena", [
      "Los de " + cuenta + " publicaron tu tema para la difusión. Unos cientos de personas que no te conocían lo escucharon en el día.",
      cuenta + " subió tu tema a sus historias y te etiquetó. Los comentarios empiezan a llegar.",
      "Tu tema apareció en " + cuenta + ", la cuenta de la escena local. Tu nombre empieza a sonar entre los que no te conocen."
    ], [
      {
        texto: "Agradecer y dejar que fluya",
        desc: "La difusión hace su trabajo sola.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ig");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 3 };
        },
        resultado: "La publicación se llena de comentarios. Gente que no sabía que existías ahora escucha tu tema.",
        log: "Su tema fue difundido por la cuenta de la escena."
      },
      {
        texto: "Responder cada comentario",
        desc: "El público nuevo te ve cercano.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ig");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, _energia: -8, _relaciones: 2 };
        },
        resultado: "Respondés hasta los comentarios medio ácidos. La gente del under lo nota y te respeta.",
        log: "Respondió a su público en la cuenta de la escena."
      },
      {
        texto: "Subir un adelanto mientras calienta",
        desc: "Aprovechás el momento para mostrar lo que viene.",
        riesgo: 0.3,
        efectos: function (s) {
          Under.UNDER._limpiar("under_ig");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1000), popularity: 3 };
        },
        resultado: "El adelanto explota de la mano de la publicación. La escena pide la fecha.",
        log: "Aprovechó la difusión para subir un adelanto.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ig");
          return { popularity: -2 };
        },
        riesgoResultado: "El adelanto no convence y lo comparan con el tema publicado. Bajón de momento.",
        riesgoLog: "El adelanto publicado tras la difusión quedó flojo."
      }
    ]);
  },

  /* ---------- Telonero en Pétalos del Sol ---------- */
  crearEventoPetalos: function (state) {
    return Under.UNDER._crear("under_petalos", "Telonero en Pétalos del Sol", [
      "En Pétalos del Sol, un lugar chico pero con nombre, te ofrecen tocar como telonero un viernes con La Family Racks de cabeza de fecha. Es tu primer escenario real frente a gente que no te conoce.",
      "La Family Racks llena Pétalos del Sol los viernes y busca telonero. Lugar chico, gente que no te conoce: la primera prueba de verdad.",
      "Pétalos del Sol te abre la puerta: tocás de telonero antes de La Family Racks. Lugar chico, pero es tu primer escenario real."
    ], [
      {
        texto: "Aceptar y tocar sin red",
        desc: "Gente que no te conoce: la prueba real.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_petalos");
          Under.MISIONES.sumar(s, "telonero", 1);
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, _energia: -15 };
        },
        resultado: "Subís y hay un silencio que no conocés: nadie está obligado a aplaudirte. Para cuando terminás, una parte de esa gente ya te buscó en redes.",
        log: "Fue telonero de La Family Racks en Pétalos del Sol."
      },
      {
        texto: "Conocer a La Family Racks antes",
        desc: "Ganarte su respaldo antes de subir.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_petalos");
          Under.MISIONES.sumar(s, "artistas", 1);
          return { _relaciones: 4, talent: 1 };
        },
        resultado: "Compartís unas birras con La Family Racks antes de la fecha. La escena te anota y ellos te tiran consejos de verdad.",
        log: "Conoció a La Family Racks y ganó su respaldo."
      },
      {
        texto: "Dejarlo pasar",
        desc: "No es tu momento todavía.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_petalos");
          return {};
        },
        resultado: "Dejás pasar el viernes. El escenario de verdad espera.",
        log: "Dejó pasar el telonero en Pétalos del Sol."
      }
    ]);
  },

  /* ---------- La reseña de Coscu ---------- */
  crearEventoCoscu: function (state) {
    return Under.UNDER._crear("under_coscu", "La reseña de Coscu", [
      "Coscu hace una muy buena reseña sobre tu tema: la mitad es elogio sincero, la otra mitad es crítica fuerte. Su público lo mira todo.",
      "En su stream, Coscu pone tu tema y lo desmenuza: arranca elogiando de verdad y después te deja en evidencia con una crítica fuerte.",
      "Coscu subió una reseña de tu tema. La mitad es sincero elogio; la otra mitad es un análisis que no perdona nada."
    ], [
      {
        texto: "Tomar la crítica como material",
        desc: "El elogio te confirma; la crítica te mejora.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_coscu");
          Under.MISIONES.sumar(s, "resena", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3 };
        },
        resultado: "Escuchás la reseña dos veces. La crítica duele, pero tiene razón en un par de puntos. Volvés al estudio con eso en la cabeza.",
        log: "Aprovechó la reseña de Coscu para mejorar."
      },
      {
        texto: "Responderle en vivo",
        desc: "Puede salir muy bien… o muy mal.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_coscu");
          Under.MISIONES.sumar(s, "resena", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4 };
        },
        resultado: "Le respondés con una buena historia y la gente lo celebra. Hasta el mismo Coscu te lo reconoce.",
        log: "Le respondió a Coscu y salió bien.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_coscu");
          return { popularity: -3 };
        },
        riesgoResultado: "La respuesta queda chica y la gente la viraliza en tu contra. El clip te persigue un rato.",
        riesgoLog: "Su respuesta a la reseña de Coscu salió mal."
      },
      {
        texto: "No darle bolilla",
        desc: "Ni el elogio ni la crítica te mueven.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_coscu");
          return {};
        },
        resultado: "No respondés nada. La reseña queda ahí, hablando sola por su público.",
        log: "Ignoró la reseña de Coscu."
      }
    ]);
  },

  /* ---------- Una noche en Cayo Makensi ---------- */
  crearEventoMakensi: function (state) {
    return Under.UNDER._crear("under_makensi", "Una noche en Cayo Makensi", [
      "En Larrañaga 67, Cayo Makensi: esta noche toca un artista muy conocido y alabado por todos. Hay tres teloneros, y Lucio y Benja trajeron un puñado de gente que no te conoce. A último momento te avisan que hay lugar en la fecha.",
      "Te avisan a último momento: quedó lugar en la fecha de Cayo Makensi, Larrañaga 67. Un artista muy conocido toca esta noche, con tres teloneros; Lucio y Benja llevan un puñado de gente que no te conoce.",
      "Cayo Makensi, Larrañaga 67: el show de esta noche es de un artista alabado por todos. Tres teloneros, un lugar libre a último momento, y Lucio y Benja con su gente, que no te conoce."
    ], [
      {
        texto: "Aceptar y tocar esa misma noche",
        desc: "Un escenario real, aunque nadie sepa quién sos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_makensi");
          Under.MISIONES.sumar(s, "telonero", 1);
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 3, _energia: -18 };
        },
        resultado: "Subís entre tres teloneros y el headliner que todos alaban. Lucio y Benja están adelante con su gente. Tocás sin red, y cuando terminás, algunos que no te conocían se van hablando de vos.",
        log: "Tocó a último momento en Cayo Makensi."
      },
      {
        texto: "Quedarte a ver el show del headliner",
        desc: "Aprendés mirando a un grande.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_makensi");
          return { talent: 2, _relaciones: 2 };
        },
        resultado: "Te quedás entre el público y estudiás cada movimiento del headliner. Salís de Cayo Makensi con otra idea de lo que es un show.",
        log: "Fue a ver al headliner en Cayo Makensi."
      },
      {
        texto: "Dejarlo pasar",
        desc: "A último momento, sin prepararte, no.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_makensi");
          return {};
        },
        resultado: "Dejás pasar la fecha. Cayo Makensi va a seguir estando en Larrañaga 67.",
        log: "Dejó pasar la fecha de Cayo Makensi."
      }
    ]);
  },

  /* ---------- Émile y Massita quieren un 50/50 ---------- */
  crearEventoMassita: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_massita", "Émile y Massita proponen un 50/50", [
      "Émile y Massita, artistas emergentes de tu ciudad con más seguidores que vos, escucharon tu sonido y proponen un remix de «" + tema + "». Quieren un 50/50.",
      "Émile y Massita quieren llevar «" + tema + "» a su estilo y proponen un remix a medias, 50/50. Son emergentes, pero ya tienen más seguidores que vos.",
      "A Émile y Massita les gusta tu tema «" + tema + "» y te tiran un 50/50 para remixarlo. Tienen su propia gente y creen que el cruce les sirve a los dos."
    ], [
      {
        texto: "Hacer el remix 50/50",
        desc: "Su público te conoce de arriba.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_massita");
          Under.MISIONES.sumar(s, "colega", 1);
          Under.MISIONES.sumar(s, "contenido", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, _energia: -8 };
        },
        resultado: "Grabás con Émile y Massita. El remix junta a sus seguidores con los tuyos y los dos nombres salen ganando.",
        log: "Hizo un remix 50/50 con Émile y Massita."
      },
      {
        texto: "Pedir 60/40 a tu favor",
        desc: "El tema es tuyo y la base también.",
        riesgo: 0.35,
        efectos: function (s) {
          Under.UNDER._limpiar("under_massita");
          Under.MISIONES.sumar(s, "colega", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 250), fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _energia: -8 };
        },
        resultado: "Aceptan el 60/40 a regañadientes. El remix sale y a vos te toca la parte grande.",
        log: "Negoció 60/40 en el remix con Émile y Massita.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_massita");
          return { popularity: -2 };
        },
        riesgoResultado: "Te quedás con el 50/50 en la mano… no: se cae. Émile y Massita lo hacen con otro y el remix suena sin vos.",
        riesgoLog: "Se cayó el remix con Émile y Massita por la negociación."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Ese remix no va con tu sonido.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_massita");
          return {};
        },
        resultado: "Lo dejás pasar. Émile y Massita buscan a otro, pero tu tema sigue siendo tuyo.",
        log: "Dejó pasar el remix con Émile y Massita."
      }
    ]);
  },

  /* ---------- Kilpatay y Traslacortina ---------- */
  crearEventoEstudioGrande: function (state) {
    return Under.UNDER._crear("under_estudio_grande", "Kilpatay te abre Traslacortina", [
      "Kilpatay, el productor con el que laburaste años atrás, ahora trabaja en Traslacortina Studio — donde se grabó «Wanda Nara» de Duki y Neo. Te recomienda grabar una sesión ahí.",
      "Traslacortina Studio, el estudio donde labura Kilpatay, tiene un hueco en la agenda, y él te propone para esa sesión. La recomendación pesa.",
      "Kilpatay no se olvidó de vos: ahora está en Traslacortina y te empuja para que grabes una sesión de verdad."
    ], [
      {
        texto: "Agarrar la sesión",
        desc: "Un sonido de otro nivel y contactos de la industria.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 80), talent: 2, fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _energia: -10 };
        },
        resultado: "Grabás una sesión en Traslacortina. El sonido te queda de otro planeta y los ingenieros se acuerdan de tu nombre.",
        log: "Grabó una sesión en Traslacortina recomendado por Kilpatay."
      },
      {
        texto: "Pedir una sesión con más horas",
        desc: "Más horas, más sonido… y más costo.",
        riesgo: 0.3,
        efectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 180), talent: 3, fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 3, _energia: -12 };
        },
        resultado: "Conseguís más horas y la sesión sale redonda. Kilpatay te la anota como la que te puso en otro nivel.",
        log: "Grabó una sesión extendida en Traslacortina.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          return { popularity: -1, money: -Under.SYSTEMS.efectivoEscala(s, 120) };
        },
        riesgoResultado: "El pedido extra enfría la recomendación. La sesión se achica y Kilpatay queda medio en evidencia.",
        riesgoLog: "Se pasó de exigencia y perdió la sesión en Traslacortina."
      },
      {
        texto: "Agradecerle a Kilpatay y pasar",
        desc: "No querés saltar etapas.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          return { _relaciones: 2 };
        },
        resultado: "Le agradecés a Kilpatay y dejás pasar la sesión. Él entiende: 'cuando estés listo, Traslacortina sigue acá'.",
        log: "Agradeció la recomendación de Kilpatay y dejó pasar la sesión."
      }
    ]);
  },

  /* ---------- Tu video en La Sobre se viraliza ---------- */
  crearEventoViralSobre: function (state) {
    return Under.UNDER._crear("under_viral_sobre", "Tu video en La Sobre se viraliza", [
      "Un video tuyo tirando rimas en La Sobre se hizo viral en redes. En dos días tiene miles de visitas. Nadie sabe qué va a pasar.",
      "Alguien grabó tus rimas en La Sobre y el video explotó. En dos días son miles de visitas y la escena entera lo está viendo.",
      "Un video tuyo tirando rimas en La Sobre no para de sumar vistas. En dos días ya son miles, y el revuelo llega más lejos de lo que imaginabas."
    ], [
      {
        texto: "Montarte en la ola",
        desc: "Publicás seguido mientras el video crece.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_sobre");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4, _energia: -8 };
        },
        resultado: "Aprovechás el momento: subís contenido, respondés comentarios, y el video te lleva una audiencia que ayer no existía.",
        log: "Se montó en la ola de su video viral en La Sobre."
      },
      {
        texto: "Dejarlo que crezca solo",
        desc: "No forzar nada.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_sobre");
          return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2 };
        },
        resultado: "No tocás nada. El video sigue sumando y tu nombre queda en el aire, esperando el próximo paso.",
        log: "Dejó que su video viral creciera solo."
      },
      {
        texto: "No darle bola",
        desc: "El ruido no te mueve.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_sobre");
          return {};
        },
        resultado: "No le das importancia. El video pasa, y tu carrera sigue su propio ritmo.",
        log: "Ignoró la viralización de su video en La Sobre."
      }
    ]);
  },

  /* ---------- Nominación a la canción del año ---------- */
  crearEventoCancionAnio: function (state) {
    var cuenta = Under.UNDER._cuentaIg(state);
    return Under.UNDER._crear("under_cancion_anio", "Nominación a la canción del año", [
      "Los de " + cuenta + " se les dio por nominarte a la canción del año. El stream es en unos meses y tu agenda está llena. Ganar no está asegurado: la categoría está dura.",
      cuenta + " te nominó a la canción del año. El stream es en unos meses, tu agenda está llena y la categoría está durísima. Ganar no está asegurado.",
      "Llegó la nominación: los de " + cuenta + " te meten en la terna a la canción del año. El stream es en unos meses y tu agenda no te deja ni respirar."
    ], [
      {
        texto: "Despejar la agenda para el stream",
        desc: "Vas con todo a la terna. La categoría está dura.",
        riesgo: 0.45,
        efectos: function (s) {
          Under.UNDER._limpiar("under_cancion_anio");
          return { money: Under.SYSTEMS.efectivoEscala(s, 500), fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 5, _energia: -12 };
        },
        resultado: "Reacomodás todo y llegás al stream con un show preparado. La ganás por poco y " + cuenta + " te celebra como el suyo.",
        log: "Ganó la canción del año en el stream de la escena.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_cancion_anio");
          return { popularity: -2, _energia: -12 };
        },
        riesgoResultado: "Reacomodás tu agenda, vas con todo y perdés por poco. La categoría estaba dura, y tu nombre queda pegado a la terna.",
        riesgoLog: "Perdió la canción del año por poco."
      },
      {
        texto: "Ir al stream sin despejar nada",
        desc: "Si ganás, ganás; si no, tu agenda sigue intacta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cancion_anio");
          return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _energia: -5 };
        },
        resultado: "Pasás por el stream entre compromiso y compromiso. No ganás, pero los de " + cuenta + " se acuerdan de que fuiste.",
        log: "Fue al stream de la canción del año sin despejar agenda."
      },
      {
        texto: "Declinar la nominación",
        desc: "Tu agenda está llena y ganar no está asegurado.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cancion_anio");
          return { popularity: -1 };
        },
        resultado: "Declinás con un mensaje elegante. Los de " + cuenta + " lo toman con respeto, aunque se nota que esperaban otra cosa.",
        log: "Declinó la nominación a la canción del año."
      }
    ]);
  },

  /* ---------- Ivinn (ex WTF IVO) te bardea en hongo TV ---------- */
  crearEventoIvo: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_ivo", "Ivinn te bardea en hongo TV", [
      "Un rival aparece: Ivinn, el creador del under de Sierras Chicas. En un stream con hongo TV dice que «" + tema + "» es un clon de 'lune a lune'. La gente empieza a elegir bando.",
      "Ivinn, el creador del under de Sierras Chicas, largó en un stream de hongo TV que tu tema «" + tema + "» es un clon de 'lune a lune'. Tu nombre empieza a sonar pegado al suyo.",
      "En hongo TV, Ivinn tira que «" + tema + "» es una copia de 'lune a lune'. Los comentarios se dividen y vos quedás en el medio del bardo."
    ], [
      {
        texto: "Responder con un tema",
        desc: "Una diss que deje el asunto cerrado.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { talent: 1, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 900), _energia: -8 };
        },
        resultado: "La diss apunta directo a Ivinn. La escena se prende, el clip circula y tu nombre queda una plaza arriba del suyo.",
        log: "Respondió a Ivinn con una diss contundente.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { popularity: -3, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -8 };
        },
        riesgoResultado: "La diss te sale floja y hongo TV la repite con Ivinn comentándola en vivo. La risa es de ellos.",
        riesgoLog: "Su diss contra Ivinn salió mal."
      },
      {
        texto: "Enfrentarlo en el mismo stream",
        desc: "Lo buscás en su propio terreno.",
        riesgo: 0.4,
        efectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { popularity: 4, fans: Under.SYSTEMS.fansEscala(s, 500), _energia: -8 };
        },
        resultado: "Entrás al stream y se arma el bardo en vivo. La gente elige bando y vos ganás la mitad de la pelea.",
        log: "Enfrentó a Ivinn en su stream.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { popularity: -2, _energia: -8 };
        },
        riesgoResultado: "En el vivo te enredás con las palabras y Ivinn te corta el audio. El clip queda mal para vos.",
        riesgoLog: "Perdió el ida y vuelta con Ivinn en el stream."
      },
      {
        texto: "Ignorarlo",
        desc: "El clon de quién, decís.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return {};
        },
        resultado: "No respondés. El clip se apaga solo y tu nombre queda limpio, aunque Ivinn se queda con la última palabra.",
        log: "Ignoró la provocación de Ivinn."
      }
    ]);
  },

  /* ---------- Blake quiere comprar tu catálogo ---------- */
  crearEventoBlake: function (state) {
    return Under.UNDER._crear("under_blake", "Blake quiere comprar tu catálogo", [
      "Blake, el productor que te compra los beats desde que arrancaste, te llama de madrugada: quiere quedarse con TODO tu catálogo de una. La cifra que te tira nunca la viste escrita así de grande.",
      "Blake te junta en el estudio y te pone el trato en la mesa: se queda con tus type-beats y todo el material que grabaste hasta ahora. Paga bien, y hoy mismo.",
      "El trato de Blake llega sin avisar: compra tu catálogo completo con un número adelante. Muy buena plata… pero todo lo que es tuyo deja de serlo."
    ], [
      {
        texto: "Vender el catálogo",
        desc: "Mucha plata ahora, aunque tu material quede en sus manos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_blake");
          return { money: Under.SYSTEMS.dineroEscala(s, 4000), popularity: 1 };
        },
        resultado: "Firmás y la plata entra al toque. Blake se queda con tu catálogo y vos arrancás de cero, pero con los bolsillos llenos.",
        log: "Vendió su catálogo de beats a Blake."
      },
      {
        texto: "Negociar la mitad",
        desc: "Vender los beats, quedarte con tus temas.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_blake");
          return { money: Under.SYSTEMS.dineroEscala(s, 1800), talent: 1 };
        },
        resultado: "Blake se lleva los beats y una parte del material, pero tus temas siguen siendo tuyos. La plata entra y el catálogo queda a medias.",
        log: "Negoció con Blake y se quedó con su música."
      },
      {
        texto: "No vender",
        desc: "Tu material no se toca.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_blake");
          return { talent: 1 };
        },
        resultado: "Le decís que no. Blake se va masticando bronca, pero tu catálogo sigue siendo tuyo y la escena lo anota.",
        log: "No vendió su catálogo a Blake."
      }
    ]);
  },

  /* ---------- hongo TV se suma al equipo ---------- */
  crearEventoHongoTv: function (state) {
    return Under.UNDER._crear("under_hongo_tv", "hongo TV se suma al equipo", [
      "hongo TV, el que arma los streams de la escena, te propone laburar juntos: te consigue fechas nuevas en serio, te arma el bolo y te muestra en su canal. A cambio pide un corte de cada gira.",
      "hongo TV quiere entrar a tu equipo: consigue fechas que nadie te conseguía y te da pantalla en el stream del under. Pide su parte de cada gira.",
      "Después del bardo con Ivinn, hongo TV te busca para aliarse: más fechas, más pantalla, más plata. Pero quiere su porcentaje en cada gira."
    ], [
      {
        texto: "Sumarlo al equipo",
        desc: "hongo TV consigue fechas y +20% de fans en cada gira.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_hongo_tv");
          s.flags.hongoTvEquipo = true;
          return { _relaciones: 3 };
        },
        resultado: "hongo TV se suma. Desde ahora te llegan fechas que antes no llegaban y cada gira te trae más gente de la que esperabas.",
        log: "Sumó a hongo TV a su equipo."
      },
      {
        texto: "Pedirle mejores condiciones",
        desc: "Entra, pero con tu palabra por encima.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_hongo_tv");
          s.flags.hongoTvEquipo = true;
          return { popularity: 1 };
        },
        resultado: "Negociás hasta el último punto y hongo TV acepta. Se suma con condiciones claras y te promueve sin meter presión.",
        log: "Sumó a hongo TV a su equipo con condiciones negociadas."
      },
      {
        texto: "No sumarlo",
        desc: "Tu carrera se arma sin intermediarios.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_hongo_tv");
          return {};
        },
        resultado: "Le decís que no. hongo TV sigue con sus streams y vos seguís armando tu camino, sin repartir porcentajes.",
        log: "No sumó a hongo TV a su equipo."
      }
    ]);
  },

  /* ---------- Pulmón quiere regrabar «Galperin» ---------- */
  crearEventoGalperin: function (state) {
    return Under.UNDER._crear("under_galperin", "Pulmón propone regrabar «Galperin»", [
      "Tu amiga te pasa el mensaje de Pulmón: «LARECONCHADETUTIA». Su tema «Galperin» está re pegado en la escena y te propone regrabarlo juntos.",
      "Pulmón te busca por la amiga: «Galperin» está explotando y cree que el tema queda mejor con los dos. Quiere regrabarlo a dúo.",
      "La amiga te manda el texto de Pulmón: dice que «Galperin» se merece tu parte. El tema está re pegado y la propuesta es regrabarlo juntos."
    ], [
      {
        texto: "Regrabarlo juntos",
        desc: "Un tema que ya suena, ahora con tu nombre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_galperin");
          var est = { calidad: 6, viral: 0, texto: "regrabación de «Galperin» con Pulmón" };
          var L = Under.MUSIC._calcular(s, "Galperin (feat. Pulmón)", est);
          L.repros = Math.round(L.repros * 1.4);
          L.fans = Math.round(L.fans * 1.4);
          L.dinero = Math.round(L.dinero * 0.7);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({
            año: s.año, nombre: L.nombre, partner: "Pulmón", tipo: "igual",
            tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero
          });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_pulmon", "Pulmón", "colega", 35);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "Grabás «" + L.nombre + "» con Pulmón.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] + "\n\n" +
            L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Regrabó «Galperin» junto a Pulmón."
      },
      {
        texto: "Aceptar cobrando un buen pago",
        desc: "Tu parte vale plata y lo sabés.",
        riesgo: 0.3,
        efectos: function (s) {
          Under.UNDER._limpiar("under_galperin");
          var est = { calidad: 6, viral: 0, texto: "regrabación de «Galperin» con Pulmón" };
          var L = Under.MUSIC._calcular(s, "Galperin (feat. Pulmón)", est);
          L.repros = Math.round(L.repros * 1.3);
          L.fans = Math.round(L.fans * 1.3);
          L.dinero = Math.round(L.dinero);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({
            año: s.año, nombre: L.nombre, partner: "Pulmón", tipo: "igual",
            tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero
          });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_pulmon", "Pulmón", "colega", 25);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "Le ponés precio a tu parte y Pulmón acepta a regañadientes.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Cobró caro su parte de «Galperin» con Pulmón.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_galperin");
          return { popularity: -1 };
        },
        riesgoResultado: "Pedís demasiado y Pulmón lo hace solo. El tema explota igual, pero sin tu nombre.",
        riesgoLog: "Perdió el regrabado con Pulmón por cobrar demasiado."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Ese tema es de él; el tuyo lo hacés vos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_galperin");
          return {};
        },
        resultado: "Le decís que no. «Galperin» sigue sonando solo y vos seguís con lo tuyo.",
        log: "Dejó pasar el regrabado de «Galperin» con Pulmón."
      }
    ]);
  },

  /* ---------- Fruity audiovisual quiere tu tema ---------- */
  crearEventoFruity: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_fruity", "Fruity audiovisual quiere tu tema", [
      "Tu amiga te pasa el mensaje de Emile: Fruity audiovisual, el sello de la facu donde labura Burger de filmmaker, quiere licenciar «" + tema + "» para una escena clave de un corto. Pagan por usarla, pero la ceden a una película que no conocés.",
      "Emile y Burger, los de Fruity audiovisual, te escriben por la amiga: necesitan «" + tema + "» para la escena central de su corto de la facu. Hay plata de por medio y el material queda en manos que no conocés.",
      "El estudio de la facu, Fruity audiovisual (Emile con Burger en la cámara), quiere usar «" + tema + "» en una escena clave de un corto. Pagan, pero la ceden para una película que no viste."
    ], [
      {
        texto: "Licenciar el tema",
        desc: "Plata ahora y tu música en una pantalla.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fruity");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 700), fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2 };
        },
        resultado: "Firmás la licencia. Tu tema suena en el corto y la plata entra al toque.",
        log: "Licenció su tema para el corto de Fruity audiovisual."
      },
      {
        texto: "Pedir ver el corto antes",
        desc: "Controlás dónde queda tu música.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fruity");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 550), fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 2, talent: 1 };
        },
        resultado: "Te muestran el corto antes de firmar. La escena te convence y el trato queda en mejores términos.",
        log: "Vio el corto de Fruity antes de licenciar su tema."
      },
      {
        texto: "No licenciarlo",
        desc: "Tu música no sale de tus manos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_fruity");
          return {};
        },
        resultado: "Le decís que no. El corto busca otro tema y el tuyo sigue siendo tuyo.",
        log: "Rechazó licenciar su tema a Fruity audiovisual."
      }
    ]);
  },

  /* ---------- La bifurcación: mainstream o leyenda del under ----------
     Misión obligatoria y siempre presente: en cuanto la carrera cruza
     al nivel 4 (la industria te mira), hay que elegir camino. Cada
     opción ramifica el resto de la carrera (PRIORIDAD 10). */
  crearEventoCamino: function (state) {
    var id = "camino_carrera";
    if (Under.UNDER._pendientes[id]) return Under.UNDER._pendientes[id];

    var textos = [
      "Ya no sos un secreto. Los números crecieron, llegaron llamadas de sellos y tu nombre aparece donde antes no estaba. La escena que te vio crecer te mira: saben que este cruce define todo.",
      "Estás en la puerta grande. Unos dicen que te vas con los grandes, otros apuestan a que te quedás. La fama golpea una vez, y la escena quiere saber de qué lado la vas a mirar.",
      "El under ya no te alcanza… o quizás te alcanza más que nunca. Todos los que te bancaron desde el bar de la esquina miran esta decisión: mainstream o leyenda del under."
    ];
    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];

    var ev = {
      id: id,
      recurrente: false,
      importante: true,
      titulo: "Mainstream o leyenda del under",
      texto: texto + "\n\nElegí un camino: no hay vuelta atrás.",
      opciones: [
        {
          texto: "Volverte mainstream",
          desc: "Seguís creciendo fuerte, pero la escena que te crió queda atrás y el foco trae polémicas.",
          efectos: function (s) {
            Under.UNDER._limpiar(id);
            s.flags.camino = "mainstream";
            s.flags.abandonoElUnder = true;
            /* La escena que te vio crecer no te lo perdona del todo. */
            s.reputacion = Math.max(0, (s.reputacion || 50) - 10);
            return { popularity: 6, fans: Under.SYSTEMS.fansEscala(s, 4000), money: Under.SYSTEMS.dineroEscala(s, 2500), _relaciones: -8, _hype: 20 };
          },
          resultado: "Elegís el mainstream. Tu nombre empieza a sonar en todos lados, pero el bar de la esquina ya no es tu casa. Crecer de verdad duele: cada oído nuevo te aleja de los que te bancaron desde el principio.",
          log: "Eligió el camino mainstream y dejó el under atrás."
        },
        {
          texto: "Seguir siendo under",
          desc: "Crecés más lento y no llegás tan lejos, pero la escena te ama y te apoya en todo.",
          efectos: function (s) {
            Under.UNDER._limpiar(id);
            s.flags.camino = "under";
            s.flags.sigueEnElUnder = true;
            s.flags.salioDelUnderground = false;
            /* La escena te ama: tu nombre vale oro abajo. */
            s.reputacion = Math.min(100, (s.reputacion || 50) + 10);
            return { popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 3000), _relaciones: 8, _hype: 10 };
          },
          resultado: "Te quedás en el under. No vas a llenar estadios ni salir en todos lados, pero cada persona que te escucha te lo devuelve con creces: te quieren, te esperan y te bancan hasta el final. La escena te va a nombrar como uno de los suyos para siempre.",
          log: "Eligió quedarse en el under y se volvió leyenda de la escena."
        }
      ]
    };

    Under.UNDER._pendientes[id] = ev;
    return ev;
  },

  /* ---------- Backstage: conocer a un referente ---------- */
  crearEventoReferente: function (state) {
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_referente", "Un referente te habla", [
      "En un toque, " + nombre + ", un referente de la escena, se acerca a hablar con vos después de tu show.",
      nombre + ", un veterano del under, te para en la calle y te dice que tu último tema no es lo tuyo.",
      nombre + ", que hizo historia en tu ciudad, te invita a tomar un café y te aconseja."
    ], [
      {
        texto: "Escuchar y tomar nota",
        desc: "Los consejos de los viejos pesan.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          Under.MISIONES.sumar(s, "referente", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { talent: 2, popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "Escuchás cada palabra. Algunas duelen, pero la mayoría sirven. El referente te anota en su radar.",
        log: "Escuchó los consejos de un referente."
      },
      {
        texto: "Discutir tu punto",
        desc: "Tu música, tu criterio.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          return { talent: 2, popularity: 3 };
        },
        resultado: "Defendés tu sonido con argumentos y el referente te termina respetando más.",
        log: "Defendió su sonido y ganó el respeto de un referente.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          return { popularity: -2 };
        },
        riesgoResultado: "Te enredás en el debate y quedás como el nuevo insolente de la escena.",
        riesgoLog: "Discutió con un referente y quedó mal parado."
      },
      {
        texto: "Pedirle una colaboración",
        desc: "Aprovechar el momento, aunque sea atrevido.",
        riesgo: 0.4,
        efectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 5, talent: 1 };
        },
        resultado: "Te dice que sí. Tu nombre explota en la escena de la mano del veterano.",
        log: "Consiguió una colaboración con un referente.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_referente");
          return { popularity: -1 };
        },
        riesgoResultado: "Te mira y cambia de tema. Queda claro que pediste demasiado, demasiado pronto.",
        riesgoLog: "Le pidió una colaboración a un referente y le negaron."
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
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_bloqueo");
          return { talent: 2, _energia: -10 };
        },
        resultado: "Forzás la escritura y entre la basura aparece una línea que vale la pena.",
        log: "Forzó la escritura y destrabó el bloqueo.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_bloqueo");
          return { talent: -1, _energia: -10 };
        },
        riesgoResultado: "Forzás la escritura y todo sale peor. Te alejás del teclado con más bronca que antes.",
        riesgoLog: "Forzó la escritura y salió con menos chispa."
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
          Under.MISIONES.sumar(s, "feria", 1);
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

  /* ---------- Un taller en Cayo Makensi ---------- */
  crearEventoEscuela: function (state) {
    return Under.UNDER._crear("under_escuela", "Un taller en Cayo Makensi", [
      "En Cayo Makensi arman un taller y te invitan a dar una charla sobre Fuego Live.",
      "Te piden una charla sobre Fuego Live en un taller que se arma en Cayo Makensi.",
      "En Cayo Makensi te esperan para un taller: una charla sobre Fuego Live frente a los pibes de la escena."
    ], [
      {
        texto: "Dar el taller",
        desc: "Enseñar también te forma a vos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          Under.MISIONES.sumar(s, "taller", 1);
          return { talent: 2, _relaciones: 4, fans: Under.SYSTEMS.fansEscala(s, 250), _energia: -8 };
        },
        resultado: "La charla sobre Fuego Live en Cayo Makensi se llena. Los pibes repiten tus frases: tu conocimiento ya no es solo tuyo.",
        log: "Dio una charla sobre Fuego Live en Cayo Makensi."
      },
      {
        texto: "Grabar con los pibes",
        desc: "Producción colectiva: más laburo, más magia.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 400), money: -Under.SYSTEMS.efectivoEscala(s, 50), _energia: -10 };
        },
        resultado: "Grabás con el grupo un tema colectivo en Cayo Makensi. El resultado se comparte por la zona y tu nombre entra en las casas.",
        log: "Grabó un tema colectivo con pibes en Cayo Makensi."
      },
      {
        texto: "No poder ir",
        desc: "Tu agenda no te deja.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_escuela");
          return {};
        },
        resultado: "No vas. La organización lo entiende, pero la puerta de Cayo Makensi queda un poco más fría.",
        log: "No pudo dar el taller en Cayo Makensi."
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
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_fiesta");
          Under.MISIONES.sumar(s, "fiesta", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 600), _energia: -12 };
        },
        resultado: "Pedís más y ceden. La noche sale redonda y el bolsillo lo nota.",
        log: "Negoció y consiguió mejor caché en una fiesta privada.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_fiesta");
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), popularity: -1, _energia: -12 };
        },
        riesgoResultado: "Pedís más y te descartan. La fiesta busca a otro y quedás en el molde.",
        riesgoLog: "Exigió más plata en una fiesta y lo descartaron."
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
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_banda", "Te piden la banda en vivo", [
      nombre + ", un artista del under, te pide que lo acompañes con una banda en vivo para su fecha.",
      nombre + " necesita músicos para el show de un cantante local y piensa en vos.",
      "Una banda de tu ciudad quiere sumarte como voz invitada en una gira chica."
    ], [
      {
        texto: "Sumarte",
        desc: "Otra escuela: tocar para otro también enseña.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_banda");
          Under.MISIONES.sumar(s, "banda", 1);
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
          Under.MISIONES.sumar(s, "movida", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _relaciones: 4 };
        },
        resultado: "Lo abrazás y hasta le dedicás una historia a la movida. Tu tema se vuelve algo más grande que una canción.",
        log: "Abrazó el himno que se volvió su tema en el barrio."
      },
      {
        texto: "Sumarte a la movida",
        desc: "Estar adentro, con todo lo que implica. Un riesgo real.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_manifiesto");
          Under.MISIONES.sumar(s, "movida", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1800), popularity: 5, _relaciones: 4, _energia: -10 };
        },
        resultado: "Te sumás de lleno y la movida te lleva en hombros. Tu nombre crece con ellos.",
        log: "Se sumó de lleno a la movida que adoptó su tema.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_manifiesto");
          return { fans: Under.SYSTEMS.fansEscala(s, 400), popularity: -3, _energia: -12, _relaciones: -2 };
        },
        riesgoResultado: "Te sumás y el fuego te quema: la movida se parte y tu nombre queda pegado a un lado de la pelea.",
        riesgoLog: "La movida a la que se sumó terminó quemándolo."
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
  },

  /* ---------- Ensayar en serio ---------- */
  crearEventoEnsayo: function (state) {
    var nombre = Under.UNDER._artista();
    return Under.UNDER._crear("under_ensayo", "El ensayo que te forma", [
      nombre + ", un amigo con un estudio chico, te propone ensayar una vez por semana: juntar canciones y afinarlas de verdad.",
      nombre + " te deja su sala dos horas por semana a cambio de que lo ayudes con sus proyectos.",
      "Encontrás un espacio de ensayo barato en tu barrio. Solo, con el micrófono y las ideas."
    ], [
      {
        texto: "Entrenar cada semana",
        desc: "Constancia: el sonido se hace repitiendo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ensayo");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 120), _energia: -8 };
        },
        resultado: "Semana tras semana el material se afina. Lo que antes no salía, ahora sale sin pensarlo.",
        log: "Ensayó todas las semanas del año."
      },
      {
        texto: "Ensayo colectivo",
        desc: "Con otra gente aprendés más, aunque la agenda se complica.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ensayo");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { talent: 2, _relaciones: 4, fans: Under.SYSTEMS.fansEscala(s, 150), _energia: -10 };
        },
        resultado: "El ensayo con otros te destraba cosas que solo no ves. La escena te empieza a contar como serio.",
        log: "Ensayó en colectivo con otros artistas de la escena."
      },
      {
        texto: "Improvisar sin rutina",
        desc: "Tu talento no depende de horarios.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ensayo");
          return { talent: 1 };
        },
        resultado: "No te atás a ninguna sala. Tu música sale cuando sale, sin calendario.",
        log: "Prefirió no fijar rutina de ensayo."
      }
    ]);
  },

  /* ---------- Un medio de la zona te reseña ---------- */
  crearEventoResena: function (state) {
    return Under.UNDER._crear("under_resena", "Una reseña de la zona", [
      "Un fanzine de la zona quiere reseñar tu último lanzamiento.",
      "Un blog musical local prepara una crítica de tu maqueta.",
      "Un programa de radio arma una sección donde analizan tu sonido."
    ], [
      {
        texto: "Abrirte a la reseña",
        desc: "Si te leen bien, explota; si te leen mal, la escena lo repite igual. Un riesgo.",
        riesgo: 0.45,
        efectos: function (s) {
          Under.UNDER._limpiar("under_resena");
          Under.MISIONES.sumar(s, "resena", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 4, money: Under.SYSTEMS.efectivoEscala(s, 80) };
        },
        resultado: "La reseña es brillante. La escena te lee con otros ojos y te busca para escucharte.",
        log: "Recibió una reseña brillante de la zona.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_resena");
          Under.MISIONES.sumar(s, "resena", 1);
          return { popularity: -2, talent: 1, fans: -Under.SYSTEMS.fansEscala(s, 100) };
        },
        riesgoResultado: "La reseña te descose. Algunos la comparten para burlarse. Duele, pero te deja más duro.",
        riesgoLog: "Una reseña negativa corrió por la escena."
      },
      {
        texto: "Dar el material y pedir feedback",
        desc: "Buscás que te marquen, aunque no se publique nada.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_resena");
          return { talent: 2, _relaciones: 2 };
        },
        resultado: "La devolución que te dan en privado vale más que cualquier crítica publicada. Tomás nota.",
        log: "Pidió feedback a un medio de la zona."
      },
      {
        texto: "Evitarla",
        desc: "Prefiero que no hablen de mí a que hablen mal.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_resena");
          return { popularity: -1 };
        },
        resultado: "No entregás nada. El medio reseña a otro y tu nombre ni aparece.",
        log: "Evitó una reseña de la zona."
      }
    ]);
  },

  /* ---------- Equipo que cambia el sonido ---------- */
  crearEventoEquipo: function (state) {
    return Under.UNDER._crear("under_equipo", "Equipo que cambia el sonido", [
      "Un micro y una interfaz de segunda mano están en venta baratos. Podrían cambiar tu sonido casero.",
      "Te ofrecen un teclado y un monitor para tu estudio de habitación.",
      "Un técnico de la zona vende parlantes usados para escuchar tus mezclas de verdad."
    ], [
      {
        texto: "Comprar el equipo",
        desc: "Invertir en sonido: sale caro, pero se nota.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_equipo");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 200), talent: 2, fans: Under.SYSTEMS.fansEscala(s, 150) };
        },
        resultado: "Comprás el equipo y el sonido cambia de nivel. Tus mezclas ya no suenan a teléfono.",
        log: "Compró equipo para su estudio casero."
      },
      {
        texto: "Comprarlo sin verificar",
        desc: "El precio es buenísimo. Sospechosamente buenísimo…",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_equipo");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 90), talent: 2, fans: Under.SYSTEMS.fansEscala(s, 200) };
        },
        resultado: "El equipo funciona de diez. Pagaste la mitad y suena el doble.",
        log: "Consiguió buen equipo a precio de ganga.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_equipo");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 220), talent: -1, _energia: -5 };
        },
        riesgoResultado: "Te estafaron: el equipo está quemado y no te devuelven la plata. Aprendiste la lección cara.",
        riesgoLog: "Perdió plata comprando equipo en mal estado."
      },
      {
        texto: "No gastar",
        desc: "Tu sonido actual alcanza.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_equipo");
          return {};
        },
        resultado: "No comprás. Seguís con lo que tenés y la calidad se mantiene donde está.",
        log: "No compró equipo nuevo."
      }
    ]);
  },

  /* ============================================================
     LA ESCENA REAL (PRIORIDAD 10): eventos con los nombres y los
     lugares que pasó la amiga. Alternan y respetan los roles.
     ============================================================ */

  /* ---------- Family Racks arma un cypher ---------- */
  crearEventoFamilyCypher: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_family_cypher", "Un cypher de Family Racks", [
      "Drokerr, EssKiff, gk, Ghosfe, Vlempiree y Caupiii, toda Family Racks, arman un cypher y te quieren adentro. Una sola sesión, todos al frente del mic.",
      "Family Racks junta a la camada nueva para un cypher y te reservan un lugar. Drokerr dice que «" + tema + "» tiene el flow para bancarlo.",
      "El cypher de Family Racks se arma y tu nombre está en la lista: EssKiff lo propuso después de escucharte."
    ], [
      {
        texto: "Sumarte al cypher",
        desc: "Tu parte circula con el nombre de la familia.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_family_cypher");
          Under.MISIONES.sumar(s, "colega", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, _energia: -8 };
        },
        resultado: "La sesión sale al primer take. Family Racks te difunde con ellos y la escena te asocia a la familia.",
        log: "Participó del cypher de Family Racks."
      },
      {
        texto: "Grabar tu parte solo",
        desc: "Tu verso viaja, pero no la sesión.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_family_cypher");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2 };
        },
        resultado: "Mandás tu parte grabada y la meten igual. Queda bien, aunque sin la química de la sesión.",
        log: "Grabó su parte del cypher de Family Racks a distancia."
      },
      {
        texto: "Declinar",
        desc: "Tu sonido primero.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_family_cypher");
          return {};
        },
        resultado: "Dejás pasar el cypher. Family Racks sigue con lo suyo y tu parte se queda en tu cabeza.",
        log: "Declinó el cypher de Family Racks."
      }
    ]);
  },

  /* ---------- Kiwa El Distinto y una fecha de undercba ---------- */
  crearEventoKiwa: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_kiwa", "Kiwa El Distinto te quiere en el cartel", [
      "Kiwa El Distinto, admin de undercba, escuchó «" + tema + "» y te quiere en la fecha grande de undercba. Un lugar con nombre y la escena entera mirando.",
      "undercba arma una fecha fuerte y Kiwa El Distinto te reserva un lugar. Dice que tu sonido es distinto y que eso se nota.",
      "Kiwa El Distinto te escribe: te sumás al cartel de undercba. Es una fecha que la escena no se pierde."
    ], [
      {
        texto: "Aceptar la fecha",
        desc: "La escena entera te ve.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_kiwa");
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 1000), popularity: 3, _energia: -12 };
        },
        resultado: "Tocás en la fecha de undercba y Kiwa te presenta en persona. La escena te anota: no sos uno más.",
        log: "Tocó en una fecha de undercba invitado por Kiwa El Distinto."
      },
      {
        texto: "Pedir el lugar central",
        desc: "El riesgo de exigir con nombre propio.",
        riesgo: 0.4,
        efectos: function (s) {
          Under.UNDER._limpiar("under_kiwa");
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 2, _energia: -12 };
        },
        resultado: "Kiwa te da un mejor horario. La fecha sale y tu nombre queda arriba en el flyer.",
        log: "Consiguió un horario central en la fecha de undercba.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_kiwa");
          return { popularity: -2 };
        },
        riesgoResultado: "Kiwa lo toma a mal y te deja fuera del cartel. La fecha de undercba sale sin vos.",
        riesgoLog: "Perdió su lugar en la fecha de undercba por exigir."
      },
      {
        texto: "Dejarlo pasar",
        desc: "undercba puede esperar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_kiwa");
          return {};
        },
        resultado: "Le decís que no. Kiwa busca a otro y la fecha de undercba sale igual.",
        log: "Dejó pasar la fecha de undercba."
      }
    ]);
  },

  /* ---------- Marti, la amiga, te mete en la escena ---------- */
  crearEventoMarti: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_marti", "Marti te mete en la movida", [
      "Marti, tu amiga, no para de insistirte: «" + tema + "» tiene que sonar en la escena. Ya le habló a los de undercba y les gustó.",
      "Marti te manda capturas: pasó «" + tema + "» en la juntada de undercba y la mitad preguntó quién sos.",
      "Marti te busca con una fecha en la mano: te consiguió un lugar en el ciclo que organizan los del under, y dice que va a estar todo el grupo."
    ], [
      {
        texto: "Ir con todo",
        desc: "Marti lo armó: no la dejás en banda.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_marti");
          Under.MISIONES.sumar(s, "toques", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 3, _relaciones: 3, _energia: -10 };
        },
        resultado: "Vas y tocás para el grupo de Marti. Ella te presenta a todos y la fecha se siente como de la familia.",
        log: "Tocó en la fecha que le consiguió Marti."
      },
      {
        texto: "Grabarle un agradecimiento",
        desc: "Mostrar el gesto en tus redes.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_marti");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 300), popularity: 2, _relaciones: 4 };
        },
        resultado: "Grabás un video agradeciéndole a Marti y a los que la bancan. El gesto circula y tu nombre gana la buena fama.",
        log: "Agradeció a Marti en público por su apoyo."
      },
      {
        texto: "Esquivar el momento",
        desc: "No querés ese empujón todavía.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_marti");
          return { _relaciones: -1 };
        },
        resultado: "Le decís que no por ahora. Marti lo entiende, aunque se nota que esperaba otra cosa.",
        log: "No aprovechó el empujón que le consiguió Marti."
      }
    ]);
  },

  /* ---------- Club Paraguay: la cima del under ---------- */
  crearEventoClubParaguay: function (state) {
    return Under.UNDER._crear("under_club_paraguay", "Una fecha en Club Paraguay", [
      "Club Paraguay, la cima del under, te ofrece una fecha. Ahí se juega de verdad: el lugar donde la escena se pone seria.",
      "Los de Club Paraguay vieron tu último toque y te quieren en su cartel. Es el mejor lugar del under y lo sabés.",
      "Una fecha en Club Paraguay: el lugar con más nombre de la escena. Te la ofrecen y no podés creerlo."
    ], [
      {
        texto: "Tocar en Club Paraguay",
        desc: "El lugar que todo el under quiere.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_club_paraguay");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 250), fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 5, _energia: -15 };
        },
        resultado: "Tocás en Club Paraguay y la fecha se siente grande. La escena entera habla de tu show al día siguiente.",
        log: "Tocó en Club Paraguay."
      },
      {
        texto: "Invitar a un colega a abrir",
        desc: "Sumar a un amigo: la escena se lo agradece.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_club_paraguay");
          Under.MISIONES.sumar(s, "artistas", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1000), popularity: 3, _relaciones: 4, _energia: -15 };
        },
        resultado: "Le das la apertura a un colega y la fecha sale redonda. En Club Paraguay, el que reparte, crece.",
        log: "Dio la apertura de su fecha en Club Paraguay a un colega."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Todavía no estás listo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_club_paraguay");
          return {};
        },
        resultado: "Dejás pasar la fecha. Club Paraguay va a estar, y vos también, cuando toque.",
        log: "Dejó pasar la fecha de Club Paraguay."
      }
    ]);
  },

  /* ---------- 990 Club ---------- */
  crearEvento990: function (state) {
    return Under.UNDER._crear("under_990", "Una noche en el 990 Club", [
      "El 990 Club arma una fecha de artistas nuevos y te quieren en el line-up.",
      "990 Club te ofrece una noche para presentar tu material. Un lugar con buena gente y buen sonido.",
      "Los del 990 Club te anotaron en su fecha de artistas nuevos. La escena de los nuevos pasa por ahí."
    ], [
      {
        texto: "Tocar en el 990",
        desc: "Público nuevo, lugar con nombre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_990");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _energia: -12 };
        },
        resultado: "La fecha del 990 sale bien: el público nuevo te descubre y el lugar te invita a volver.",
        log: "Tocó en el 990 Club."
      },
      {
        texto: "Pedir una fecha propia",
        desc: "Que esa noche sea tuya.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_990");
          Under.MISIONES.sumar(s, "salas", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 300), fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _energia: -18 };
        },
        resultado: "Negociás una fecha propia en el 990. Tu nombre empieza a llenar el lugar de a poco.",
        log: "Consiguió una fecha propia en el 990 Club."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Otra noche, otro lugar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_990");
          return {};
        },
        resultado: "Dejás pasar la noche. El 990 busca a otro y la fecha sale sin tu nombre.",
        log: "Dejó pasar la fecha del 990 Club."
      }
    ]);
  },

  /* ---------- Undersc: el espacio de la escena ---------- */
  crearEventoUndersc: function (state) {
    return Under.UNDER._crear("under_undersc", "Una fecha en Undersc", [
      "Undersc, el espacio del under, te ofrece una fecha para presentar tu sonido.",
      "Te ofrecen el escenario de Undersc para una fecha doble con otro artista de tu camada.",
      "Undersc quiere tu música en su ciclo. Un lugar chico pero con la escena mirando."
    ], [
      {
        texto: "Tocar en Undersc",
        desc: "El espacio de la escena te conoce.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_undersc");
          Under.MISIONES.sumar(s, "toques", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 3, _energia: -12 };
        },
        resultado: "Tocás en Undersc y la fecha se siente como en casa. La escena te ubica en su mapa.",
        log: "Tocó en Undersc."
      },
      {
        texto: "Fecha doble con un colega",
        desc: "Dos nombres, el doble de público.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_undersc");
          Under.MISIONES.sumar(s, "colega", 1);
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _energia: -14 };
        },
        resultado: "Armás una fecha doble en Undersc. Los públicos se cruzan y los dos salen ganando.",
        log: "Hizo una fecha doble en Undersc con un colega."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Undersc sigue abierto.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_undersc");
          return {};
        },
        resultado: "Dejás pasar la fecha. Undersc sigue y tu momento va a llegar.",
        log: "Dejó pasar la fecha de Undersc."
      }
    ]);
  },

  /* ---------- La Sobre: el lugar más crudo ---------- */
  crearEventoLaSobre: function (state) {
    return Under.UNDER._crear("under_la_sobre", "La Sobre te abre el sótano", [
      "La Sobre, el lugar más crudo del under, te abre una noche. Ahí no hay escenario ni red: es la prueba de los de verdad.",
      "Te ofrecen una fecha en La Sobre: el antro donde el under se mide sin vueltas.",
      "La Sobre te quiere en su cartel. El lugar más básico de la escena, y por eso el más respetado."
    ], [
      {
        texto: "Tocar en La Sobre",
        desc: "Sin red, sin vueltas: la prueba real.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_la_sobre");
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 3, _energia: -14 };
        },
        resultado: "Tocás en La Sobre a un metro de la gente. Los puristas del under lo registran: bancaste la fecha más difícil.",
        log: "Tocó en La Sobre."
      },
      {
        texto: "Grabar la sesión cruda",
        desc: "Esa noche también se comparte.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_la_sobre");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, _energia: -14 };
        },
        resultado: "Grabás la noche en La Sobre y la subís. La crudeza se comparte sola: la escena valora a quien bancó la Sobre.",
        log: "Grabó su sesión en La Sobre."
      },
      {
        texto: "Declinar",
        desc: "Ese sótano puede esperar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_la_sobre");
          return {};
        },
        resultado: "Dejás pasar La Sobre. El lugar más crudo espera a quien esté listo.",
        log: "Declinó tocar en La Sobre."
      }
    ]);
  },

  /* ---------- Pascu te propone una fecha de Los Amigos ---------- */
  crearEventoPascu: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_pascu", "Pascu y Los Amigos te invitan", [
      "Pascu, de Los Amigos, escuchó «" + tema + "» y quiere que compartas fecha con ellos.",
      "Los Amigos arman un toque y Pascu te reserva un lugar en el cartel.",
      "Pascu te propone una fecha conjunta: su público conoce a Los Amigos, y quiere que te escuchen a vos."
    ], [
      {
        texto: "Compartir la fecha",
        desc: "El público de Los Amigos te adopta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_pascu");
          Under.MISIONES.sumar(s, "colega", 1);
          Under.MISIONES.sumar(s, "toques", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _relaciones: 3, _energia: -12 };
        },
        resultado: "Compartís fecha con Los Amigos y Pascu te presenta en persona. Su gente se queda a escucharte.",
        log: "Compartió fecha con Pascu y Los Amigos."
      },
      {
        texto: "Grabar algo juntos antes",
        desc: "La química primero, el escenario después.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_pascu");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2, _energia: -8 };
        },
        resultado: "Grabás un tema con Pascu y Los Amigos. La fecha queda para después, con la química ya hecha.",
        log: "Grabó un tema con Pascu y Los Amigos."
      },
      {
        texto: "Declinar",
        desc: "Tu camino, tu ritmo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_pascu");
          return {};
        },
        resultado: "Dejás pasar la fecha. Los Amigos siguen y la puerta queda abierta.",
        log: "Declinó la fecha con Pascu y Los Amigos."
      }
    ]);
  },

  /* ---------- MAINFLOW: Ivinn cruza las Sierras Chicas ---------- */
  crearEventoMainIvinn: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("main_ivinn", "Ivinn propone cruzar las sierras", [
      "Ivinn, el creador del under de Sierras Chicas, te propone un tema cruzando las dos escenas: la suya y la tuya. Ya no es el bardero de hongo TV: es un nombre que creció con el under.",
      "Ivinn te busca para una colab entre Sierras Chicas y tu ciudad. Los dos salieron del under y los dos saben lo que cuesta.",
      "Ivinn propone regrabar «" + tema + "» llevándolo a su sonido de las sierras. Dice que el cruce puede sonar en todos lados."
    ], [
      {
        texto: "Grabar la colab",
        desc: "Dos under que crecieron, un tema que cruza.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_ivinn");
          var est = { calidad: 5, viral: 0, texto: "colab con Ivinn cruzando las sierras" };
          var L = Under.MUSIC._calcular(s, "Sierras y cemento (feat. Ivinn)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "Ivinn", tipo: "igual", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_ivinn", "Ivinn", "colega", 30);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "El tema de las sierras y el cemento sale redondo.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con Ivinn cruzando Sierras Chicas y su ciudad."
      },
      {
        texto: "Sumar una fecha juntos",
        desc: "Tu ciudad y las sierras en un solo show.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_ivinn");
          return { fans: Under.SYSTEMS.fansEscala(s, 2500), popularity: 3, money: Under.SYSTEMS.efectivoEscala(s, 400), _energia: -12 };
        },
        resultado: "Hacen una fecha juntos a mitad de camino entre las dos escenas. La gente de los dos lados aparece.",
        log: "Hizo una fecha junto a Ivinn cruzando las escenas."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Tu nombre ya no necesita cruces.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_ivinn");
          return {};
        },
        resultado: "Le decís que no. Ivinn lo respeta: los dos saben que el under tiene códigos.",
        log: "Declinó la propuesta de Ivinn."
      }
    ]);
  },

  /* ---------- Pulmon1312 te suma a su fecha ---------- */
  crearEventoMainPulmon: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("main_pulmon", "Pulmon1312 te suma a la fecha", [
      "Pulmon1312, artista y DJ de Los Amigos OBS, quiere que cantes «" + tema + "» en su fecha. El bolo se arma con los de siempre, ahora en serio.",
      "Pulmon1312 te convoca para su fecha como artista invitado y después te deja la pista: quiere que cantes y que la gente baile.",
      "La fecha de Pulmon1312 arma un line-up de lujo y tu nombre está en la lista. Los Amigos OBS te reciben en su casa."
    ], [
      {
        texto: "Cantar en la fecha de Pulmon",
        desc: "Su público + el tuyo = fecha grande.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_pulmon");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 500), fans: Under.SYSTEMS.fansEscala(s, 2000), popularity: 4, _energia: -12 };
        },
        resultado: "Cantás en la fecha de Pulmon1312 y la pista explota. Después él te sube al DJ set: tu música y la suya en la misma noche.",
        log: "Cantó en la fecha de Pulmon1312."
      },
      {
        texto: "Grabar algo con él antes",
        desc: "La colab suena antes que el show.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_pulmon");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { talent: 1, fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _energia: -8 };
        },
        resultado: "Grabás un tema con Pulmon1312 en el estudio de Los Amigos. El cruce queda para la historia de la escena.",
        log: "Grabó un tema con Pulmon1312."
      },
      {
        texto: "Declinar",
        desc: "Tu agenda no da más.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_pulmon");
          return {};
        },
        resultado: "Le decís que no por ahora. Pulmon lo entiende: los tiempos del under se respetan.",
        log: "Declinó la fecha de Pulmon1312."
      }
    ]);
  },

  /* ---------- Drokerr entra en la industria ---------- */
  crearEventoMainDrokerr: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("main_drokerr", "Drokerr cruzó la puerta grande", [
      "Drokerr, de Family Racks, firmó con un sello y no se olvidó de vos: te llama para un proyecto grande con su gente.",
      "Family Racks dio el salto y Drokerr quiere llevarte en la ola. Te propone un tema con toda la familia, pero en serio.",
      "Drokerr te escribe desde la oficina del sello: «" + tema + "» sonó en la reunión y quieren que Family Racks y vos hagan algo juntos."
    ], [
      {
        texto: "Subirte a la ola de Drokerr",
        desc: "La familia entró a la industria y vos con ellos.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_drokerr");
          var est = { calidad: 5, viral: 2, texto: "proyecto con Drokerr y Family Racks" };
          var L = Under.MUSIC._calcular(s, "Family (feat. Drokerr)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "Drokerr", tipo: "igual", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_drokerr", "Drokerr", "colega", 30);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "El proyecto con Drokerr y Family Racks sale a la luz.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Hizo un proyecto con Drokerr y Family Racks."
      },
      {
        texto: "Cobrar tu parte adelantada",
        desc: "Plata ya, aunque la familia quede a medias.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_drokerr");
          return { money: Under.SYSTEMS.dineroEscala(s, 1200), popularity: 2, _energia: -6 };
        },
        resultado: "Cobrás adelantado y el proyecto sale igual. La familia lo acepta, aunque el gesto queda anotado.",
        log: "Cobró adelantado su parte del proyecto de Drokerr."
      },
      {
        texto: "Mantener distancia",
        desc: "La familia se fue; tu camino sigue siendo tuyo.",
        efectos: function (s) {
          Under.UNDER._limpiar("main_drokerr");
          return { talent: 1 };
        },
        resultado: "Le decís que no. Family Racks siguió su rumbo y vos el tuyo, con respeto.",
        log: "Declinó el proyecto de Drokerr y Family Racks."
      }
    ]);
  },

  /* ---------- Lil Nahue (20k+ fans): el puente del under ---------- */
  crearEventoLilNaue: function (state) {
    return Under.UNDER._crear("under_lil_naue", "Lil Nahue quiere tu oído", [
      "Lil Nahue, que ya es nombre en el under, te escribe: «Pasate por mi casa, tengo un beat que necesita tu voz».",
      "Lil Nahue armó una sesión en su estudio y te convida la mitad: quiere que su sonido y el tuyo se crucen.",
      "El under habla de vos en los pasillos y Lil Nahue quiere aprovechar el momento: un tema a medias, 50/50."
    ], [
      {
        texto: "Grabar el tema con Lil Nahue",
        desc: "Su flow callejero + tu sonido.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lil_naue");
          var est = { calidad: 4, viral: 0, texto: "colab con Lil Nahue" };
          var L = Under.MUSIC._calcular(s, "Puente 20 (feat. Lil Nahue)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "Lil Nahue", tipo: "igual", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_lil_naue", "Lil Nahue", "colega", 30);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "El tema de los dos suena en los parlantes del under antes que en cualquier lado.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con Lil Nahue."
      },
      {
        texto: "Aceptar una fecha en su circuito",
        desc: "Sin grabar: su público te ve en vivo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lil_naue");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 400), fans: Under.SYSTEMS.fansEscala(s, 1800), popularity: 3, _energia: -12 };
        },
        resultado: "Compartís fecha con Lil Nahue y su gente queda con tu nombre en la boca. El under suma un cruce más.",
        log: "Compartió fecha con Lil Nahue."
      },
      {
        texto: "Declinar",
        desc: "Todavía no, aunque la puerta queda abierta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lil_naue");
          return {};
        },
        resultado: "Le decís que no por ahora. Lil Nahue asiente: en el under los tiempos se respetan.",
        log: "Declinó la propuesta de Lil Nahue."
      }
    ]);
  },

  /* ---------- cero (50k+ fans): el top del under ---------- */
  crearEventoCero: function (state) {
    return Under.UNDER._crear("under_cero", "cero te abre su círculo", [
      "cero es de lo más arriba que tiene el under: poca prensa, mucho nombre. Y te busca a vos.",
      "cero rara vez labura con alguien. Que te llame es un mensaje: «me gusta cómo se mueve tu sonido».",
      "En el under todos hablan de cero en voz baja. Ahora te escribe a vos para una sesión."
    ], [
      {
        texto: "Grabar con cero",
        desc: "Un top del under te elige. Eso se paga.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cero");
          var est = { calidad: 6, viral: 0, texto: "colab con cero" };
          var L = Under.MUSIC._calcular(s, "Círculo (feat. cero)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "cero", tipo: "igual", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_cero", "cero", "culto", 35);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "La sesión con cero es de las que se cuentan. El tema vuela por el under entero.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con cero."
      },
      {
        texto: "Pedir una fecha juntos",
        desc: "Su círculo + tu público, en el mismo boliche.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cero");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 800), fans: Under.SYSTEMS.fansEscala(s, 3000), popularity: 4, _energia: -12 };
        },
        resultado: "Armás una fecha con cero y el boliche queda chico. La escena entera habla de esa noche.",
        log: "Hizo una fecha con cero."
      },
      {
        texto: "No entrar a su círculo",
        desc: "cero se mueve raro y preferís distancia.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cero");
          return { talent: 1 };
        },
        resultado: "Le das las gracias y seguís tu rumbo. cero respeta la distancia: son códigos.",
        log: "Declinó la propuesta de cero."
      }
    ]);
  },

  /* ---------- zell (200k+ fans): el mejor artista del under ---------- */
  crearEventoZell: function (state) {
    return Under.UNDER._crear("under_zell", "zell te convoca", [
      "zell es, para la escena, el mejor artista del under. Un llamado suyo no es una propuesta: es una carta de presentación.",
      "zell viene de tocar en los lugares más chicos y llenarlos a todos. Quiere hacer algo con vos: un tema, un vivo, algo que quede.",
      "El que manda en el under bajo tierra es zell, y te pide una sesión. La escena va a mirar qué hacés."
    ], [
      {
        texto: "Grabar el tema con zell",
        desc: "El mejor del under poniendo su nombre al lado del tuyo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zell");
          var est = { calidad: 8, viral: 1, texto: "colab con zell" };
          var L = Under.MUSIC._calcular(s, "Zell (feat. tu nombre)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "zell", tipo: "estrella", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_zell", "zell", "estrella", 40);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "zell sale del caparazón para grabar con vos. El tema se corre de boca en boca antes de publicarse.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con zell, el mejor del under."
      },
      {
        texto: "Hacer un vivo juntos",
        desc: "Un show que la escena va a contar años.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zell");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 1200), fans: Under.SYSTEMS.fansEscala(s, 5000), popularity: 5, _energia: -14, _legado: 2 };
        },
        resultado: "Hacen un vivo de los que se cuentan por década. Hasta el que no estaba, dice que estuvo.",
        log: "Hizo un vivo con zell."
      },
      {
        texto: "Declinar con respeto",
        desc: "zell entiende que los caminos a veces no se cruzan.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_zell");
          return { talent: 1, popularity: -1 };
        },
        resultado: "Le decís que no con respeto. zell asiente y la escena anota que tuviste coraje para decir que no.",
        log: "Declinó la propuesta de zell."
      }
    ]);
  },

  /* ---------- Oedta y la gira por el under ---------- */
  crearEventoOedtaGira: function (state) {
    return Under.UNDER._crear("under_oepta_gira", "La gira con Oedta", [
      "Oedta, de la escena, arma una gira por los lugares del under y te quiere de la partida.",
      "Oedta te propone salir de gira juntos: fechas chicas, público de verdad, el under de punta a punta.",
      "Oedta dice que tu vivo engancha con el suyo. Te ofrece una gira por el under, sin vueltas."
    ], [
      {
        texto: "Salir de gira con Oedta",
        desc: "Fechas chicas por el under, de punta a punta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_oepta_gira");
          var costo = Under.SYSTEMS.efectivoEscala(s, 300);
          var bruto = Math.round(2000 * Under.SYSTEMS.escala(s) * (0.85 + Math.random() * 0.3));
          var neto = Math.round(bruto - costo);
          var fans = Math.round(Under.SYSTEMS.fansEscala(s, 2000));
          s.giras.push({ año: s.año, nombre: "Gira con Oedta", costo: costo, bruto: bruto, neto: neto, fans: fans });
          s.totalGiras += 1;
          return { money: neto, fans: fans, popularity: 3, _energia: -14 };
        },
        resultado: "La gira con Oedta recorre el under de punta a punta. En cada fecha, " + Under.DATA.publico(2) + " repite: los shows se cuentan de boca en boca.",
        log: "Hizo una gira del under con Oedta."
      },
      {
        texto: "Solo una fecha juntos",
        desc: "Menos compromiso: un bolo con Oedta.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_oepta_gira");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 350), fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 2, _energia: -8 };
        },
        resultado: "Una noche con Oedta en el mismo cartel. Su público te escucha y el tuyo descubre algo nuevo.",
        log: "Compartió una fecha con Oedta."
      },
      {
        texto: "Declinar",
        desc: "La gira queda para otra temporada.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_oepta_gira");
          return { _relaciones: 2 };
        },
        resultado: "Le decís que este año no. Oedta asiente y te deja la puerta abierta: «cuando quieras, el under nos espera».",
        log: "Declinó la gira con Oedta."
      }
    ]);
  },

  /* ---------- Los de Doble F y tu catálogo ---------- */
  crearEventoDobleFCatalogo: function (state) {
    return Under.UNDER._crear("under_doblef_catalogo", "Los de Doble F y tu catálogo", [
      "Los de Doble F te pasan un informe de tu catálogo: qué temas aguantan, cuáles mueren en las playlists y a qué hora te escucha tu gente.",
      "Conocen tu catálogo como nadie. Te muestran cómo se comporta cada tema y qué está tirando tu carrera.",
      "Los de Doble F hacen una lectura fina de tu música: dónde estás fuerte y dónde perdés gente."
    ], [
      {
        texto: "Escuchar la lectura completa",
        desc: "Saber cómo se comporta tu catálogo es plata y tiempo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_catalogo");
          return { talent: 2, popularity: 1, _energia: -5 };
        },
        resultado: "Escuchás la lectura completa. Ahora sabés qué temas bancar y cuáles dejar descansar. Doble F tiene razón en cada línea.",
        log: "Escuchó el análisis de su catálogo hecho por Doble F."
      },
      {
        texto: "Pedirles que laburen tu próximo lanzamiento",
        desc: "Su ojo puesto en tu música.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_catalogo");
          return { money: -Under.SYSTEMS.efectivoEscala(s, 120), talent: 1, fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 2, _energia: -6 };
        },
        resultado: "Los de Doble F meten mano en tu próximo lanzamiento. El tema sale más afilado y la escena lo nota.",
        log: "Laburó su próximo lanzamiento con Doble F."
      },
      {
        texto: "Agradecer y seguir",
        desc: "El informe queda en tu cabeza.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_catalogo");
          return { talent: 1 };
        },
        resultado: "Agradecés el gesto. Algo de esa lectura se te queda para siempre.",
        log: "Agradeció el análisis de Doble F."
      }
    ]);
  },

  /* ---------- La puerta de Doble F ---------- */
  crearEventoDobleFCirculo: function (state) {
    return Under.UNDER._crear("under_doblef_circulo", "La puerta de Doble F", [
      "Los de Doble F te invitaron a su círculo. Está puerta vale más que cualquier promoción: adentro se hacen las cosas que después todo el under repite.",
      "El círculo de Doble F no se abre para cualquiera. Te abren la puerta y te dicen: «entrá cuando quieras».",
      "Los de Doble F te hicieron un lugar en su círculo. Dicen que esa puerta vale más que cualquier promoción."
    ], [
      {
        texto: "Entrar al círculo",
        desc: "Estar adentro es otra liga.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_circulo");
          return { popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 1500), _relaciones: 5 };
        },
        resultado: "Estás adentro. Las puertas que se te abren desde el círculo de Doble F no se compran con plata.",
        log: "Entró al círculo de Doble F."
      },
      {
        texto: "Pedir tiempo",
        desc: "Querés pensarlo bien.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_circulo");
          return { _relaciones: 2 };
        },
        resultado: "Pedís un tiempo. Doble F asiente: las puertas que se abren de verdad esperan.",
        log: "Pidió tiempo antes de entrar al círculo de Doble F."
      },
      {
        texto: "Quedarte afuera",
        desc: "Tu camino no pasa por ahí.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_doblef_circulo");
          return { talent: 1 };
        },
        resultado: "Agradecés el gesto y te quedás afuera. A veces la distancia también es una decisión.",
        log: "Declinó entrar al círculo de Doble F."
      }
    ]);
  },

  /* ---------- Songwarts y el panel de jurados ---------- */
  crearEventoSongwarts: function (state) {
    return Under.UNDER._crear("under_songwarts_jurado", "Songwarts te convoca como jurado", [
      "Songwarts, el canal que arma la competencia de canciones del under, te propone formar parte del panel de jurados.",
      "Songwarts arma el certamen de la temporada y te quiere en el jurado: la escena va a escuchar tu palabra.",
      "El panel de jurados de Songwarts tiene un lugar para vos. Tu voto pesa en el futuro de los que recién arrancan."
    ], [
      {
        texto: "Aceptar ser jurado",
        desc: "Tu voto define el certamen.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_songwarts_jurado");
          return { popularity: 3, fans: Under.SYSTEMS.fansEscala(s, 1000), talent: 1, _energia: -8 };
        },
        resultado: "Te sentás en el panel de Songwarts. Tu voto define el certamen y la escena empieza a mirarte distinto.",
        log: "Fue jurado de Songwarts."
      },
      {
        texto: "Ser jurado sin dar notas altas",
        desc: "La posta antes que los aplausos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_songwarts_jurado");
          return { popularity: 2, _energia: -6 };
        },
        resultado: "Vas de jurado y no regalás notas. Algunos te critican, pero la escena respeta que no te dejes comprar.",
        log: "Fue jurado estricto de Songwarts."
      },
      {
        texto: "Declinar el asiento",
        desc: "Tu música primero.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_songwarts_jurado");
          return {};
        },
        resultado: "Dejás el asiento. Songwarts busca otro jurado y la competencia sigue sin tu voto.",
        log: "Declinó ser jurado de Songwarts."
      }
    ]);
  },

  /* ---------- Marti y Agus invitan un martes a La Sobre ---------- */
  crearEventoAmigasSobre: function (state) {
    return Under.UNDER._crear("under_amigas_sobre", "Un martes en La Sobre", [
      "Marti y Agus te invitan un martes a la noche a La Sobre. Mañana te despertás temprano, pero la anécdota va a ser muy buena.",
      "Marti y Agus arman plan para el martes a la noche en La Sobre y te suman. Mañana te despertás temprano, aunque la anécdota lo vale."
    ], [
      {
        texto: "Ir",
        desc: "La anécdota va a ser muy buena.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_amigas_sobre");
          return { popularity: 1, fans: Under.SYSTEMS.fansEscala(s, 150), _relaciones: 4, _energia: -6 };
        },
        resultado: "Vas a La Sobre con Marti y Agus. La anécdota es tan buena como prometían: te despertás temprano igual, con la noche entera en la cabeza.",
        log: "Fue un martes a La Sobre con Marti y Agus."
      },
      {
        texto: "Quedarte escribiendo",
        desc: "La escena espera; el tema no.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_amigas_sobre");
          return { talent: 1, _energia: 2 };
        },
        resultado: "Te quedás escribiendo. Marti y Agus te cuentan la anécdota al día siguiente y no parece inventada.",
        log: "Se quedó escribiendo un martes a la noche."
      },
      {
        texto: "Pasar a saludar y volver",
        desc: "Quedás, pero sin quemar la noche.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_amigas_sobre");
          return { _relaciones: 2, _energia: -2 };
        },
        resultado: "Pasás por La Sobre, saludás a todo el mundo y te vas temprano. La anécdota te llega entera igual.",
        log: "Pasó a saludar por La Sobre un martes."
      }
    ]);
  },

  /* ---------- Lucio consigue la fecha en Club Paraguay (40k+ fans) ---------- */
  crearEventoLucioParaguay: function (state) {
    return Under.UNDER._crear("under_lucio_paraguay", "Club Paraguay, la noche que viene", [
      "Lucio Fuego mueve sus contactos y te consigue una fecha en Club Paraguay. Más de mil personas cantando tus temas y los pogos no paran. Hay un antes y un después de esa noche.",
      "Lucio te abre la puerta de Club Paraguay. Mil personas coreando y pogo en serio: esa noche marca un antes y un después en la escena."
    ], [
      {
        texto: "Tocar",
        desc: "La fecha grande del under.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lucio_paraguay");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 1200), fans: Under.SYSTEMS.fansEscala(s, 4000), popularity: 5, _energia: -15 };
        },
        resultado: "Tocás en Club Paraguay con más de mil personas cantando de memoria. Los pogos sacuden el lugar entero. Esa noche queda en la historia de la escena.",
        log: "Tocó en Club Paraguay con fecha de Lucio Fuego."
      },
      {
        texto: "Tocar y grabar todo",
        desc: "La noche queda grabada para siempre.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lucio_paraguay");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 1000), fans: Under.SYSTEMS.fansEscala(s, 5000), popularity: 6, _energia: -18, _hype: 15 };
        },
        resultado: "Tocás con mil personas cantando y lo grabás todo. Los videos de los pogos vuelan por la escena: ese show se convierte en tu carta de presentación.",
        log: "Tocó y grabó su noche en Club Paraguay."
      },
      {
        texto: "Dejarla pasar",
        desc: "La puerta queda abierta para otro momento.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_lucio_paraguay");
          return {};
        },
        resultado: "Le agradecés a Lucio pero dejás la fecha. Club Paraguay va a volver a estar cuando sea el momento.",
        log: "Dejó pasar la fecha que le consiguió Lucio en Club Paraguay."
      }
    ]);
  },

  /* ---------- Agusfornite propone una canción (30k+ fans) ---------- */
  crearEventoAgusfornite: function (state) {
    return Under.UNDER._crear("under_agusfornite", "Agusfornite te propone una canción", [
      "Agusfornite te escribe: «hagamos una canción juntos, vos y yo». Su producción y tu voz pueden ser algo grande en la escena.",
      "Agusfornite quiere armar un tema con vos: su beat, tu sonido. La propuesta queda sobre la mesa y la escena lo va a mirar."
    ], [
      {
        texto: "Grabar con Agusfornite",
        desc: "Su producción + tu voz.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_agusfornite");
          var est = { calidad: 5, viral: 1, texto: "colab con Agusfornite" };
          var L = Under.MUSIC._calcular(s, "La pista (feat. Agusfornite)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "Agusfornite", tipo: "igual", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          if (Under.RELACIONES) Under.RELACIONES.agregar(s, "red_agusfornite", "Agusfornite", "colega", 30);
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "El tema con Agusfornite suena en los parlantes de la escena antes que en ningún lado.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con Agusfornite."
      },
      {
        texto: "Pedirle beats para tus temas",
        desc: "Su producción al servicio de tu sonido.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_agusfornite");
          return { talent: 2, money: -Under.SYSTEMS.efectivoEscala(s, 100), _energia: -5 };
        },
        resultado: "Le comprás unos beats a Agusfornite para tus próximos temas. Buena madera para tu sonido.",
        log: "Compró beats de Agusfornite."
      },
      {
        texto: "Declinar",
        desc: "No por ahora.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_agusfornite");
          return {};
        },
        resultado: "Le decís que no por ahora. Agusfornite entiende: los tiempos en la escena se respetan.",
        log: "Declinó la propuesta de Agusfornite."
      }
    ]);
  },

  /* ---------- Un cantante de 1.000 oyentes ofrece colaboración ---------- */
  crearEventoCantante1k: function (state) {
    return Under.UNDER._crear("under_cantante_1k", "Un cantante de mil oyentes", [
      "En La Sobre se te acerca un cantante con mil oyentes mensuales. Le gusta tu música y te propone una colaboración: él pone su parte, vos la tuya.",
      "Un pibe de mil oyentes mensuales te espera a la salida de La Sobre. Quiere grabar algo con vos y te deja la propuesta en la mano."
    ], [
      {
        texto: "Aceptar la colaboración",
        desc: "El que recién arranca puede sorprender.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cantante_1k");
          var est = { calidad: 3, viral: 0, texto: "colab con un cantante de mil oyentes" };
          var L = Under.MUSIC._calcular(s, "Todavía (feat. el que recién arranca)", est);
          Under.MUSIC._registrar(s, L, est, 0);
          s.colaboraciones.push({ año: s.año, nombre: L.nombre, partner: "Un cantante de mil oyentes", tipo: "emergente", tier: L.tier, repros: L.repros, fans: L.fans, dinero: L.dinero });
          s.totalColabs += 1;
          s.flags.colabEsteAnio = true;
          return { fans: L.fans, popularity: L.popularidad, talent: L.talento, money: L.dinero, _energia: -10, _lanzamiento: L };
        },
        resultado: function (s, efectos) {
          var L = efectos._lanzamiento;
          return "El tema con el cantante de mil oyentes sale mejor de lo que nadie esperaba.\n\n" + Under.MUSIC.TIER_FLAVOR[L.tier] +
            "\n\n" + L.tierIcono + " " + L.tierNombre + " · " + Under.UI.fmtExacto(L.repros) + " reproducciones.";
        },
        log: "Colaboró con un cantante de mil oyentes."
      },
      {
        texto: "Proponerle una fecha juntos",
        desc: "Su gente + la tuya, en el mismo lugar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cantante_1k");
          Under.MISIONES.sumar(s, "toques", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 300), fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 3, _energia: -10 };
        },
        resultado: "Compartís fecha con el cantante de mil oyentes y su gente se queda. La Sobre junta dos públicos en una noche.",
        log: "Compartió fecha con un cantante de mil oyentes."
      },
      {
        texto: "Rechazar la propuesta",
        desc: "Tu agenda no da para todo.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_cantante_1k");
          return {};
        },
        resultado: "Le decís que no por ahora. Sigue siendo un cantante de mil oyentes, pero te vio a vos.",
        log: "Rechazó la colaboración del cantante de mil oyentes."
      }
    ]);
  },

  /* ---------- La bebida dulce con sprite ---------- */
  crearEventoSpriteDroga: function (state) {
    return Under.UNDER._crear("under_sprite_droga", "La bebida de la joda", [
      "Unos chicos de la escena te invitan una bebida con sprite, bien dulce. «Es la mejor del under», te dicen, y todos te miran esperando que la tomes.",
      "En una joda te ofrecen una bebida con sprite que está raramente dulce. Te dicen que es lo mejor que vas a probar en tu vida."
    ], [
      {
        texto: "La tomás",
        desc: "Es dulce. Todos te miran.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sprite_droga");
          s.flags.proboLaMezcla = true;
          return { _energia: -20, talent: -1, _relaciones: 1 };
        },
        resultado: "La tomás y en un rato el piso se mueve. Recién al día siguiente entendés bien qué era lo que tenías en la mano. Tu cuerpo lo sintió.",
        log: "Tomó una bebida dulce de la que después se arrepintió."
      },
      {
        texto: "La dejás",
        desc: "No la tomás y punto.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sprite_droga");
          s.flags.aguantoLaPresion = true;
          return { _energia: 2, talent: 1 };
        },
        resultado: "La dejás. Te insisten un rato pero no aflojás. A la mañana siguiente, los que la tomaron no pueden decir lo mismo.",
        log: "No tomó la bebida dulce que le ofrecieron."
      },
      {
        texto: "Preguntás qué es",
        desc: "Querés saber antes de meterte.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sprite_droga");
          s.flags.laAmenazaron = true;
          return { _energia: -10, _relaciones: -6 };
        },
        resultado: "Preguntás qué tiene adentro y el clima se congela. Te dicen que no es para vos y te amenazan con que no hables del tema. Salís de la joda con el estómago apretado.",
        log: "Preguntó qué era la bebida y lo amenazaron."
      }
    ]);
  },

  /* ---------- Joda en Cayo: te reconocen ---------- */
  crearEventoJodaCayo: function (state) {
    return Under.UNDER._crear("under_joda_cayo", "Te reconocen en la joda", [
      "En una joda en Cayo Makensi, unos pibes te reconocen y te piden una foto y una firma.",
      "Unos pibes te cruzan en la joda de Cayo Makensi. Se dan cuenta de quién sos y se te acercan a pedirte una foto y una firma."
    ], [
      {
        texto: "Aceptás",
        desc: "Fotos y firma, un ratito.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_joda_cayo");
          return { fans: Under.SYSTEMS.fansEscala(s, 500), popularity: 3, _relaciones: 2, _energia: -5 };
        },
        resultado: "Firmás y te sacás las fotos. Los pibes se van contentos y tu nombre sigue dando vueltas por Cayo Makensi.",
        log: "Se sacó fotos y firmó autógrafos en una joda de Cayo."
      },
      {
        texto: "Rechazás",
        desc: "Preferís pasar desapercibido.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_joda_cayo");
          return { _relaciones: -3, _energia: 2 };
        },
        resultado: "Preferís no llamar la atención esta noche. Los pibes se van un poco decepcionados, pero vos guardás la noche.",
        log: "Rechazó pedirles fotos en una joda de Cayo."
      },
      {
        texto: "Pasás toda la noche con ellos",
        desc: "La joda se va a contar.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_joda_cayo");
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 5, _relaciones: 5, _energia: -18 };
        },
        resultado: "Te quedás hasta que cierra. Se arma una joda que se cuenta en la escena, y los pibes se van diciendo que sos de verdad.",
        log: "Pasó toda la noche con pibes que lo reconocieron en Cayo."
      }
    ]);
  },

  /* ---------- La 3flip en Casa Babylon ---------- */
  crearEventoCasa3Flip: function (state) {
    return Under.UNDER._crear("under_casa_3flip", "La 3flip en Casa Babylon", [
      "En Casa Babylon arman la 3flip con los amigos: micrófonos abiertos, parlantes prestados y toda la escena dando vueltas. Te tiran para que vayas.",
      "Casa Babylon arma la 3flip, la joda que junta a los amigos del under. Te invitan a estar del lado de adentro.",
      "La 3flip se arma en Casa Babylon y tu nombre está en la lista. Los amigos arman la noche y vos no podés faltar."
    ], [
      {
        texto: "Ir",
        desc: "La escena se junta y tu nombre está.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_casa_3flip");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 300), _relaciones: 3, _energia: -6 };
        },
        resultado: "Vas a la 3flip en Casa Babylon. Los amigos te reciben, el mic abre y la escena te ve de cerca. Quedás en la foto de la noche.",
        log: "Fue a la 3flip en Casa Babylon."
      },
      {
        texto: "Llevar un tema para la 3flip",
        desc: "Vas con material: la joda se hace tuya.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_casa_3flip");
          return { popularity: 3, talent: 1, fans: Under.SYSTEMS.fansEscala(s, 450), _relaciones: 2, _energia: -9 };
        },
        resultado: "Llevás un tema para la 3flip y suena a todo lo que da. Los amigos lo piden de nuevo antes de que termine la noche.",
        log: "Llevó un tema a la 3flip en Casa Babylon."
      },
      {
        texto: "No ir",
        desc: "La 3flip se arma igual sin vos.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_casa_3flip");
          return { _energia: 3 };
        },
        resultado: "No vas. La 3flip se arma igual en Casa Babylon, pero los amigos guardan el asiento para la próxima.",
        log: "No fue a la 3flip en Casa Babylon."
      }
    ]);
  }
};
