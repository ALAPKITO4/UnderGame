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

  /* Un escenario de la escena al azar (rotación de nombres para
     que los toques no se sientan en el mismo lugar de siempre). */
  _escenario: function () {
    var list = Under.DATA.ESCENARIOS;
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
      "En " + esc3.nombre + " arman un toque entre amigos. Entrada a la gorra y mucho ruido."
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
      "Hay una batalla de freestyle en una plaza y te anotaron sin preguntarte.",
      "Un cypher improvisado en la puerta de un estudio. Todos esperan que sueltes la mejor barra.",
      "Un conocido te desafía a un duelo de rimas en un evento callejero."
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
        resultado: "Batallás y la rompés. La plaza estalla y te anotan como el que no se achica.",
        log: "Ganó una batalla de freestyle.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_freestyle");
          return { popularity: -2, fans: -Under.SYSTEMS.fansEscala(s, 100), _energia: -10 };
        },
        riesgoResultado: "Batallás y te quedás en blanco. La plaza lo vio todo, y el video corre por los grupos.",
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
          Under.MISIONES.sumar(s, "colega", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
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

  /* ---------- Una sala te ofrece una fecha fija ---------- */
  crearEventoSala: function (state) {
    var esc = Under.UNDER._escenario();
    var esc2 = Under.UNDER._escenario();
    return Under.UNDER._crear("under_sala", "Una sala te ofrece una fecha", [
      "En " + esc.nombre + " quieren darte una fecha fija al mes. Poco caché, pero un lugar con nombre para hacerte el dueño.",
      "Un ciclo de residencias arranca en " + esc2.nombre + " y te ofrecen el jueves de cada mes.",
      "El dueño de " + esc.nombre + " vio tu último toque y te invita a tocar una vez por mes, sin bajarte del escenario."
    ], [
      {
        texto: "Tomar la residencia",
        desc: "Un lugar fijo donde crecer y que te conozcan.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_sala");
          Under.MISIONES.sumar(s, "salas", 1);
          Under.MISIONES.sumar(s, "artistas", 1);
          return { money: Under.SYSTEMS.efectivoEscala(s, 150), fans: Under.SYSTEMS.fansEscala(s, 450), popularity: 3, _energia: -15 };
        },
        resultado: "Mes a mes vas a " + esc.nombre + " y la sala empieza a llenarse con tu nombre. Un lugar propio en la escena.",
        log: "Consiguió una fecha fija mensual en una sala de la escena."
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
        resultado: "Negociás y te llevás un porcentaje de la barra. La sala acepta a regañadientes, pero la fecha es tuya.",
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
        log: "Dejó pasar una fecha fija en una sala."
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
      "Kilpatay escuchó tu tema y no se quedó callado: te ofrece grabar en La OBS, con un sonido profesional.",
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

  /* ---------- Kilpatay y el estudio grande ---------- */
  crearEventoEstudioGrande: function (state) {
    return Under.UNDER._crear("under_estudio_grande", "Kilpatay te abre un estudio grande", [
      "Kilpatay, el productor con el que laburaste años atrás, ahora trabaja en un estudio grande. Te recomienda grabar una sesión ahí.",
      "El estudio grande donde labura Kilpatay tiene un hueco en la agenda, y él te propone para esa sesión. La recomendación pesa.",
      "Kilpatay no se olvidó de vos: ahora está en un estudio grande y te empuja para que grabes una sesión de verdad."
    ], [
      {
        texto: "Agarrar la sesión",
        desc: "Un sonido de otro nivel y contactos de la industria.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          Under.MISIONES.sumar(s, "ensayo", 1);
          return { money: -Under.SYSTEMS.efectivoEscala(s, 80), talent: 2, fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 3, _energia: -10 };
        },
        resultado: "Grabás una sesión en el estudio grande. El sonido te queda de otro planeta y los ingenieros se acuerdan de tu nombre.",
        log: "Grabó una sesión en el estudio grande recomendado por Kilpatay."
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
        log: "Grabó una sesión extendida en el estudio grande.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          return { popularity: -1, money: -Under.SYSTEMS.efectivoEscala(s, 120) };
        },
        riesgoResultado: "El pedido extra enfría la recomendación. La sesión se achica y Kilpatay queda medio en evidencia.",
        riesgoLog: "Se pasó de exigencia y perdió la sesión en el estudio grande."
      },
      {
        texto: "Agradecerle a Kilpatay y pasar",
        desc: "No querés saltar etapas.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_estudio_grande");
          return { _relaciones: 2 };
        },
        resultado: "Le agradecés a Kilpatay y dejás pasar la sesión. Él entiende: 'cuando estés listo, el estudio sigue acá'.",
        log: "Agradeció la recomendación de Kilpatay y dejó pasar la sesión."
      }
    ]);
  },

  /* ---------- Tu video en Cayo se viraliza ---------- */
  crearEventoViralCayo: function (state) {
    return Under.UNDER._crear("under_viral_cayo", "Tu video en Cayo se viraliza", [
      "Un video tuyo cantando en Cayo Makensi se hizo viral en redes. En dos días tiene miles de visitas. Nadie sabe qué va a pasar.",
      "Alguien grabó tu toque en Cayo Makensi y el video explotó. En dos días son miles de visitas y la escena entera lo está viendo.",
      "Un video tuyo cantando en Cayo no para de sumar vistas. En dos días ya son miles, y el revuelo llega más lejos de lo que imaginabas."
    ], [
      {
        texto: "Montarte en la ola",
        desc: "Publicás seguido mientras el video crece.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_cayo");
          Under.MISIONES.sumar(s, "contenido", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4, _energia: -8 };
        },
        resultado: "Aprovechás el momento: subís contenido, respondés comentarios, y el video te lleva una audiencia que ayer no existía.",
        log: "Se montó en la ola de su video viral en Cayo."
      },
      {
        texto: "Dejarlo que crezca solo",
        desc: "No forzar nada.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_cayo");
          return { fans: Under.SYSTEMS.fansEscala(s, 600), popularity: 2 };
        },
        resultado: "No tocás nada. El video sigue sumando y tu nombre queda en el aire, esperando el próximo paso.",
        log: "Dejó que su video viral creciera solo."
      },
      {
        texto: "No darle bola",
        desc: "El ruido no te mueve.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_viral_cayo");
          return {};
        },
        resultado: "No le das importancia. El video pasa, y tu carrera sigue su propio ritmo.",
        log: "Ignoró la viralización de su video en Cayo."
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

  /* ---------- WTF IVO te bardea en hongo TV ---------- */
  crearEventoIvo: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu último tema";
    return Under.UNDER._crear("under_ivo", "WTF IVO te bardea en hongo TV", [
      "Un rival aparece: WTF IVO. En un stream con hongo TV dice que «" + tema + "» es un clon de 'lune a lune'. La gente empieza a elegir bando.",
      "WTF IVO, un npc de la escena, largó en un stream de hongo TV que tu tema «" + tema + "» es un clon de 'lune a lune'. Tu nombre empieza a sonar pegado al suyo.",
      "En hongo TV, WTF IVO tira que «" + tema + "» es una copia de 'lune a lune'. Los comentarios se dividen y vos quedás en el medio del bardo."
    ], [
      {
        texto: "Responder con un tema",
        desc: "Una diss que deje el asunto cerrado.",
        riesgo: 0.5,
        efectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { talent: 1, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 900), _energia: -8 };
        },
        resultado: "La diss apunta directo a IVO. La escena se prende, el clip circula y tu nombre queda una plaza arriba del suyo.",
        log: "Respondió a WTF IVO con una diss contundente.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { popularity: -3, fans: -Under.SYSTEMS.fansEscala(s, 150), _energia: -8 };
        },
        riesgoResultado: "La diss te sale floja y hongo TV la repite con IVO comentándola en vivo. La risa es de ellos.",
        riesgoLog: "Su diss contra WTF IVO salió mal."
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
        log: "Enfrentó a WTF IVO en su stream.",
        riesgoEfectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return { popularity: -2, _energia: -8 };
        },
        riesgoResultado: "En el vivo te enredás con las palabras y IVO te corta el audio. El clip queda mal para vos.",
        riesgoLog: "Perdió el ida y vuelta con WTF IVO en el stream."
      },
      {
        texto: "Ignorarlo",
        desc: "El clon de quién, decís.",
        efectos: function (s) {
          Under.UNDER._limpiar("under_ivo");
          return {};
        },
        resultado: "No respondés. El clip se apaga solo y tu nombre queda limpio, aunque IVO se queda con la última palabra.",
        log: "Ignoró la provocación de WTF IVO."
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
          Under.MISIONES.sumar(s, "taller", 1);
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
    return Under.UNDER._crear("under_ensayo", "El ensayo que te forma", [
      "Un amigo con un estudio chico te propone ensayar una vez por semana: juntar canciones y afinarlas de verdad.",
      "Un productor de tu zona te deja su sala dos horas por semana a cambio de que lo ayudes con sus proyectos.",
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
  }
};
