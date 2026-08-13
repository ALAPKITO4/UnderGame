/* ============================================================
   UNDER — LA VIDA DEL ARTISTA GRANDE (GRAN ACTUALIZACIÓN)
   Misiones exclusivas para cuando ya saliste del underground:
   televisión, marcas, colabos con leyendas, presión del sello,
   rumores de tabloides y la tentación del mainstream.

   Aparecen una vez que el jugador cruzó el umbral (nivel 4+).
   Son decisiones chicas de la cima: suman, pero a veces
   cuestan cara en imagen o energía.
   ============================================================ */

window.Under = window.Under || {};

Under.GRANDE = {

  _pendientes: {},

  _limpiar: function (id) {
    Under.GRANDE._pendientes[id] = null;
  },

  _crear: function (id, titulo, textos, opciones) {
    if (Under.GRANDE._pendientes[id]) return Under.GRANDE._pendientes[id];

    var texto = textos[Under.STATE.randInt(0, textos.length - 1)];
    var ev = {
      id: id,
      recurrente: true,
      importante: false,
      titulo: titulo,
      texto: texto,
      opciones: opciones
    };

    Under.GRANDE._pendientes[id] = ev;
    return ev;
  },

  /* ---------- Televisión nacional ---------- */
  crearEventoTV: function (state) {
    return Under.GRANDE._crear("grande_tv", "Un programa de televisión", [
      "Un programa de televisión nacional quiere que cantes en vivo en horario central.",
      "El programa de la mañana te invita a dar una entrevista con playback y todo.",
      "Un reality de talentos te propone aparecer como jurado invitado una noche."
    ], [
      {
        texto: "Aceptar el programa",
        desc: "La tele masiva te mete en todas las casas.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_tv");
          return { fans: Under.SYSTEMS.fansEscala(s, 2500), popularity: 5, _energia: -10, money: Under.SYSTEMS.efectivoEscala(s, 400) };
        },
        resultado: "Salís en horario central. La gente que no te conocía ahora sabe tu nombre.",
        log: "Se presentó en un programa de televisión nacional."
      },
      {
        texto: "Pedir una cachetada de guion",
        desc: "Controlás la entrevista a cambio de menos exposición.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_tv");
          return { fans: Under.SYSTEMS.fansEscala(s, 900), popularity: 2 };
        },
        resultado: "Negociás el guion. Sale prolijo, sin sorpresas, sin chispa.",
        log: "Fue a la tele con un guion controlado."
      },
      {
        texto: "Declinar",
        desc: "La tele no es tu lugar.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_tv");
          return { popularity: -1 };
        },
        resultado: "No vas. El programa usa a otro y tu ausencia se nota menos de lo que creías.",
        log: "Declinó una invitación a la televisión."
      }
    ]);
  },

  /* ---------- Una marca quiere tu rostro ---------- */
  crearEventoMarca: function (state) {
    return Under.GRANDE._crear("grande_marca", "Nike y Adidas te quieren", [
      "Adidas te ofrece ser la cara de su próxima campaña deportiva.",
      "Nike quiere tu imagen para el verano, con una cifra seria.",
      "Adidas o Nike, una de las dos: te piden una canción para su publicidad global."
    ], [
      {
        texto: "Firmar la campaña",
        desc: "Mucha plata y mucha exposición… con el costo de siempre.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_marca");
          return { money: Under.SYSTEMS.dineroEscala(s, 1500), fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 4, talent: -1 };
        },
        resultado: "Firmás. La plata entra y tu cara está en todos lados. Los puristas te acusan de venderte.",
        log: "Firmó una campaña de una marca grande."
      },
      {
        texto: "Negociar una campaña honesta",
        desc: "Tu imagen, pero en tus términos.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_marca");
          return { money: Under.SYSTEMS.dineroEscala(s, 800), fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 2 };
        },
        resultado: "Negociás una versión más chica y fiel a tu imagen. Cobrás bien y no manchás nada.",
        log: "Negoció una campaña de marca a su medida."
      },
      {
        texto: "Rechazar",
        desc: "Tu música no es un producto.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_marca");
          return { talent: 1 };
        },
        resultado: "Decís que no. La marca elige a otro y nadie se acuerda en un mes.",
        log: "Rechazó una campaña de una marca grande."
      }
    ]);
  },

  /* ---------- Colabo con una leyenda ---------- */
  crearEventoLeyenda: function (state) {
    var p = { nombre: "Tukone" };
    return Under.GRANDE._crear("grande_leyenda", "Una leyenda te busca", [
      p.nombre + ", una leyenda de la escena, quiere grabarte un verso para tu próximo tema.",
      "Tukone, una leyenda de otra generación, te invita a compartir escenario en su despedida.",
      p.nombre + " te ofrece una sesión en su estudio para un tema conjunto: un productor que hizo historia."
    ], [
      {
        texto: "Aceptar el homenaje",
        desc: "Su nombre al lado del tuyo: prestigio eterno.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_leyenda");
          return { fans: Under.SYSTEMS.fansEscala(s, 2000), popularity: 6, talent: 2, _energia: -10 };
        },
        resultado: "Compartís créditos con una leyenda. Ese verso queda en tu discografía para siempre.",
        log: "Colaboró con una leyenda del género."
      },
      {
        texto: "Grabar, pero ponerle condiciones",
        desc: "La leyenda cede, pero algo se rompe en el camino.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_leyenda");
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3 };
        },
        resultado: "La leyenda acepta tus condiciones a regañadientes. El tema sale, pero el ambiente queda frío.",
        log: "Colaboró con una leyenda con condiciones."
      },
      {
        texto: "Declinar con respeto",
        desc: "Su mundo y el tuyo no se cruzan todavía.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_leyenda");
          return { talent: 1 };
        },
        resultado: "Le decís que no con el mayor respeto. La leyenda lo entiende, y la puerta queda abierta.",
        log: "Declinó colaborar con una leyenda."
      }
    ]);
  },

  /* ---------- Un estadio te invita ---------- */
  crearEventoEstadio: function (state) {
    return Under.GRANDE._crear("grande_estadio", "Una fecha en el Monumental", [
      "El estadio de River, el Monumental, te ofrece la fecha de apertura de su temporada.",
      "Una fecha gigante en River te ubica en el escenario principal del Monumental, antes del headliner.",
      "Te proponen un show único en el Monumental de River, con producción completa."
    ], [
      {
        texto: "Aceptar el desafío",
        desc: "Escenario grande, público enorme, riesgo enorme.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_estadio");
          return { money: Under.SYSTEMS.dineroEscala(s, 1200), fans: Under.SYSTEMS.fansEscala(s, 3000), popularity: 6, _energia: -20, _legado: 2 };
        },
        resultado: "Subís al escenario del Monumental, que parece un país. La gente corea tus temas y entendés por qué estás ahí.",
        log: "Tocó en el estadio de River (El Monumental)."
      },
      {
        texto: "Llevar invitados",
        desc: "Sumás nombres al cartel y repartís el peso.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_estadio");
          return { money: Under.SYSTEMS.dineroEscala(s, 700), fans: Under.SYSTEMS.fansEscala(s, 2000), popularity: 4, _energia: -15 };
        },
        resultado: "El cartel suma nombres y la noche en el Monumental es una fiesta colectiva. Tu nombre, igual, es el que llenó.",
        log: "Tocó en el Monumental con invitados."
      },
      {
        texto: "Dejarlo para más adelante",
        desc: "Ese escenario todavía puede esperar.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_estadio");
          return {};
        },
        resultado: "Decís que todavía no. La fecha se la dan a otro, y la revancha en River queda anotada.",
        log: "Dejó pasar una fecha de estadio."
      }
    ]);
  },

  /* ---------- Un medio internacional te entrevista ---------- */
  crearEventoPrensaGrande: function (state) {
    var tema = (state.ultimoLanzamiento && state.ultimoLanzamiento.nombre) || "tu última canción";
    return Under.GRANDE._crear("grande_prensa", "Lolo Morales te espera en su stream", [
      "Lolo Morales te espera para una charla en su stream de Kick sobre «" + tema + "» y el under.",
      "Lolo Morales te invita a su stream de Kick a hablar sobre tu última canción y el under de donde saliste.",
      "Un periodista famoso te espera para una charla en profundidad: Lolo Morales te abre su canal de Kick para hablar de tu música."
    ], [
      {
        texto: "Ser 100% honesto",
        desc: "La verdad genera titulares.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_prensa");
          return { popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 1500), talent: 1 };
        },
        resultado: "Hablaste sin filtro. Las frases viajan por el mundo y tu público te quiere más real.",
        log: "Dio una entrevista internacional honesta."
      },
      {
        texto: "Cuidar cada palabra",
        desc: "Nada polémico, nada memorable.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_prensa");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 500) };
        },
        resultado: "Respondés con respuestas medidas. La nota sale prolija y se olvida en una semana.",
        log: "Dio una entrevista internacional cuidada."
      },
      {
        texto: "Usarla para el arte",
        desc: "La charla se vuelve parte de tu historia.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_prensa");
          return { talent: 2, popularity: 3, _legado: 1 };
        },
        resultado: "Convertís la entrevista en un manifiesto. Lo que dijiste se estudia y se cita.",
        log: "Usó una entrevista internacional para su arte."
      }
    ]);
  },

  /* ---------- El sello te presiona ---------- */
  crearEventoSelloPresion: function (state) {
    return Under.GRANDE._crear("grande_sello", "El sello te presiona", [
      "Tu sello quiere un tema más comercial para el verano, ya.",
      "Los ejecutivos te piden un cambio de sonido para sonar en las radios.",
      "El sello quiere adelantar el disco aunque sientas que no está listo."
    ], [
      {
        texto: "Ceder a la presión",
        desc: "El sello sabe lo que vende. O eso dicen.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_sello");
          return { money: Under.SYSTEMS.dineroEscala(s, 600), popularity: 4, talent: -2, _energia: -5 };
        },
        resultado: "Hacés lo que piden. Entra en la radio, pero sentís que dejaste algo tuyo en el camino.",
        log: "Cedió ante la presión de su sello."
      },
      {
        texto: "Negociar un plazo",
        desc: "Más tiempo, un poco de ceder.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_sello");
          return { talent: 1, popularity: 1 };
        },
        resultado: "Negociás un plazo y les mostrás un avance. Quedan conformes y vos ganás aire.",
        log: "Negoció un plazo con su sello."
      },
      {
        texto: "Plantarse",
        desc: "Tu música, tus tiempos.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_sello");
          return { talent: 2, popularity: -2 };
        },
        resultado: "Te plantás. El sello bufonea, pero respeta al artista que defiende su obra.",
        log: "Se plantó ante la presión del sello."
      }
    ]);
  },

  /* ---------- Rumores de tabloides ---------- */
  crearEventoRumores: function (state) {
    return Under.GRANDE._crear("grande_rumores", "Los tabloides hablan de vos", [
      "Un tabloide inventa un romance entre vos y otra estrella del momento.",
      "Se dice que cobraste una cifra millonaria por un evento y tus fans se indignan.",
      "Un rumor de una pelea en el backstage empieza a circular en los medios."
    ], [
      {
        texto: "Desmentirlo con gracia",
        desc: "Un tweet elegante y se acaba.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_rumores");
          return { popularity: 2, fans: Under.SYSTEMS.fansEscala(s, 300) };
        },
        resultado: "Lo desmentís con humor. La gente se ríe y el rumor muere en dos días.",
        log: "Desmintió un rumor con gracia."
      },
      {
        texto: "Aprovechar el ruido",
        desc: "Que hablen: todo es promoción.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_rumores");
          return { popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 1200), _relaciones: -5 };
        },
        resultado: "No lo desmentís del todo. El rumor crece y la gente habla de vos. También tu gente cercana se pregunta si perdiste el norte.",
        log: "Aprovechó un rumor para promocionarse."
      },
      {
        texto: "Ignorarlo",
        desc: "El ruido pasa solo.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_rumores");
          return {};
        },
        resultado: "No le das pelota. El rumor se diluye y la gente se olvida.",
        log: "Ignoró un rumor de los tabloides."
      }
    ]);
  },

  /* ---------- Un artista nuevo te admira ---------- */
  crearEventoProtector: function (state) {
    return Under.GRANDE._crear("grande_protector", "Blake te admira", [
      "Blake, un artista joven de tu ciudad, te dice que tu música lo salvó y te manda su demo.",
      "Blake, un artista emergente, te pide que escuches su primer material.",
      "Blake, un chico de la escena, te escribe pidiéndote un consejo para grabar."
    ], [
      {
        texto: "Escucharlo y ayudarlo",
        desc: "El under que te hizo a vos.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_protector");
          Under.MISIONES.sumar(s, "blake", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 400), popularity: 2, talent: 1 };
        },
        resultado: "Escuchás a Blake y le das consejos de verdad. La escena te recuerda de dónde saliste.",
        log: "Ayudó a Blake, un artista nuevo."
      },
      {
        texto: "Darle una oportunidad en vivo",
        desc: "Lo sumás de telonero.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_protector");
          Under.MISIONES.sumar(s, "blake", 1);
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 3, _energia: -8 };
        },
        resultado: "Le das a Blake una fecha de telonero. Su gente te lo agradece para siempre y la escena lo celebra.",
        log: "Le dio una fecha de telonero a Blake."
      },
      {
        texto: "No tener tiempo",
        desc: "Tu agenda no perdona.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_protector");
          return { popularity: -1 };
        },
        resultado: "No le respondés a Blake. La puerta de la escena se enfría un poco con vos.",
        log: "No ayudó a Blake, un artista nuevo."
      }
    ]);
  },

  /* ---------- Una docuserie sobre vos ---------- */
  crearEventoDocuserie: function (state) {
    return Under.GRANDE._crear("grande_docuserie", "Una docuserie sobre vos", [
      "Una plataforma de streaming quiere una docuserie sobre tu carrera, con cámara en el estudio.",
      "Un canal te propone documentar tu vida durante un año entero para una serie.",
      "Un director de cine quiere contar tu ascenso desde el under hasta acá."
    ], [
      {
        texto: "Aceptar el proyecto",
        desc: "Tu historia contada por otros: un riesgo y un hito.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_docuserie");
          return { _legado: 3, popularity: 5, fans: Under.SYSTEMS.fansEscala(s, 2000), _energia: -10 };
        },
        resultado: "Las cámaras te siguen todo el año. La serie sale y tu historia queda grabada para siempre.",
        log: "Participó de una docuserie sobre su carrera."
      },
      {
        texto: "Controlar todo el proceso",
        desc: "Tu versión de la historia, con menos exposición.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_docuserie");
          return { _legado: 2, popularity: 2 };
        },
        resultado: "Supervisás cada corte. La serie sale prolija, sin sorpresas y con tu versión de los hechos.",
        log: "Hizo una docuserie bajo su control."
      },
      {
        texto: "Decir que no",
        desc: "Tu vida no es un guion.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_docuserie");
          return { talent: 1 };
        },
        resultado: "Rechazás. La historia la vas a contar vos, cuando quieras.",
        log: "Rechazó una docuserie sobre su carrera."
      }
    ]);
  },

  /* ---------- Tu banda en vivo ---------- */
  crearEventoBanda: function (state) {
    var p = Under.DATA.escena({ grupo: "los amigos" });
    return Under.GRANDE._crear("grande_banda", "Tu banda en vivo", [
      "Tu equipo te propone armar una banda estable para las fechas grandes.",
      "Los ensayos con una banda nueva cambian el sonido en vivo de tu gira.",
      p.nombre + ", de Los Amigos, arma un grupo de músicos fijos para tu próximo tour."
    ], [
      {
        texto: "Armar la banda",
        desc: "Química de escenario, a cambio de guita y energía.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_banda");
          return { talent: 2, fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 3, money: -Under.SYSTEMS.efectivoEscala(s, 200), _energia: -12 };
        },
        resultado: "La banda se arma y el show en vivo sube de nivel. Los músicos te dan una base que el solo no tiene.",
        log: "Armó una banda estable para sus shows."
      },
      {
        texto: "Solo músicos de sesión",
        desc: "Profesionales, sin ataduras.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_banda");
          return { fans: Under.SYSTEMS.fansEscala(s, 700), popularity: 1, money: -Under.SYSTEMS.efectivoEscala(s, 100) };
        },
        resultado: "Contratás sesionistas por fecha. Suena bien, pero la química es otra cosa.",
        log: "Usó músicos de sesión en sus shows."
      },
      {
        texto: "Seguir solo",
        desc: "Tu nombre y tu micrófono, como siempre.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_banda");
          return { talent: 1 };
        },
        resultado: "Preferís el escenario despejado. La banda se la ofrecen a otro.",
        log: "Siguió tocando sin banda en vivo."
      }
    ]);
  },

  /* ---------- Un ciclo acústico en teatro ---------- */
  crearEventoTeatro: function (state) {
    return Under.GRANDE._crear("grande_teatro", "Un ciclo acústico en teatro", [
      "Un teatro histórico te ofrece un ciclo acústico, sin banda, sin luces, sin red.",
      "Te invitan a un formato íntimo en un teatro con tus canciones a solas.",
      "Un ciclo de artistas de tu género arma noches acústicas y te reservan una."
    ], [
      {
        texto: "Aceptar el formato",
        desc: "Vos, tu voz y mil personas en silencio.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_teatro");
          return { talent: 3, popularity: 4, _legado: 2, fans: Under.SYSTEMS.fansEscala(s, 1200), _energia: -10 };
        },
        resultado: "Cantás sin banda y sin autotune. El silencio del teatro te escucha. Esa noche pasa a tu historia.",
        log: "Hizo un ciclo acústico en un teatro."
      },
      {
        texto: "Con invitados sorpresa",
        desc: "Sumás nombres para abrir el formato.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_teatro");
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 3, _energia: -12 };
        },
        resultado: "Llevás invitados y la noche se vuelve una fiesta íntima. Menos intimidad, más ruido bueno.",
        log: "Hizo un acústico en teatro con invitados."
      },
      {
        texto: "Dejarlo pasar",
        desc: "Ese formato no es para vos todavía.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_teatro");
          return {};
        },
        resultado: "No vas. El teatro elige a otro y el ciclo sigue sin tu nombre.",
        log: "Dejó pasar un ciclo acústico en teatro."
      }
    ]);
  },

  /* ---------- El challenge del momento ---------- */
  crearEventoViral: function (state) {
    return Under.GRANDE._crear("grande_viral", "El momento viral", [
      "Un challenge musical explota en tu país y todos quieren que participes.",
      "Un ritmo nuevo se vuelve viral y tu sello te pide que lo aproveches.",
      "Una red social arma una tendencia con tu música y te invita a sumarte."
    ], [
      {
        texto: "Sumarte al challenge",
        desc: "Montar la ola: puede ser gigante o quedarte en la orilla.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_viral");
          if (Math.random() < 0.6) {
            return { fans: Under.SYSTEMS.fansEscala(s, 3000), popularity: 6, _energia: -8 };
          }
          return { fans: Under.SYSTEMS.fansEscala(s, 800), popularity: 2, _energia: -8 };
        },
        resultado: "Participás del challenge. A veces el video explota y te llega gente de todos lados; a veces se hunde en el feed.",
        log: "Se sumó al challenge musical del momento."
      },
      {
        texto: "Hacer tu propia versión",
        desc: "La tendencia con tu sello.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_viral");
          return { fans: Under.SYSTEMS.fansEscala(s, 1500), popularity: 3, talent: 1 };
        },
        resultado: "Hacés tu versión del momento, con tu sonido. Los que la copian te copian a vos.",
        log: "Hizo su propia versión del momento viral."
      },
      {
        texto: "Ignorar el momento",
        desc: "No corrés detrás de cada tendencia.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_viral");
          return { talent: 1 };
        },
        resultado: "Dejás pasar el momento. La tendencia muere en dos semanas y nadie se acuerda de quién se sumó.",
        log: "Ignoró el momento viral."
      }
    ]);
  },

  /* ---------- El verano te reclama ---------- */
  crearEventoVerano: function (state) {
    var p = Under.DATA.escena({ rol: "admin" });
    return Under.GRANDE._crear("grande_verano", "El verano te reclama", [
      "Te proponen una gira de verano por las playas y ciudades turísticas.",
      "Los lugares del under arman el circuito de verano y quieren que lo encabeces.",
      p.nombre + " arma un tour de temporada alta y te ofrece la cabeza de cartel."
    ], [
      {
        texto: "Tour de verano",
        desc: "Muchas fechas, mucha plata, mucho sol en la cara.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_verano");
          return { money: Under.SYSTEMS.dineroEscala(s, 1500), fans: Under.SYSTEMS.fansEscala(s, 2500), popularity: 4, _energia: -15 };
        },
        resultado: "El tour de verano es un éxito. Tu nombre suena en cada playa y el cuerpo lo paga en otoño.",
        log: "Hizo un tour de verano."
      },
      {
        texto: "Un solo show estelar",
        desc: "Menos fechas, una noche enorme.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_verano");
          return { money: Under.SYSTEMS.dineroEscala(s, 800), fans: Under.SYSTEMS.fansEscala(s, 1200), popularity: 2 };
        },
        resultado: "Elegís una sola fecha y la llenás. Una noche grande, sin quemarte la temporada.",
        log: "Hizo un show estelar de verano."
      },
      {
        texto: "Descansar en temporada baja",
        desc: "El verano puede esperar.",
        efectos: function (s) {
          Under.GRANDE._limpiar("grande_verano");
          return { _energia: 12 };
        },
        resultado: "Te tomás el verano libre. Cuando vuelven las fechas, volvés entero.",
        log: "Descansó durante la temporada alta."
      }
    ]);
  }
};
