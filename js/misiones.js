/* ============================================================
   UNDER — SISTEMA DE MISIONES (POOL GRANDE + ROTACIÓN)
   Un pool de 200+ misiones repartidas en 10 secciones temáticas.
   Cada carrera NO muestra todo: se elige un subconjunto activo
   (~2 por sección) acorde a la etapa de la carrera (nivel 1-8).
   Al completarse una misión se repone desde el pool sin repetir
   las ya usadas: en una misma carrera casi nunca repetís la
   misma misión, y cada carrera vive un camino distinto.

   Progreso: cada misión lee un contador del estado
   (state.contadores) o una estadística global (fans, giras,
   shows en lugares del under, premios…). Al completarse aplica su recompensa,
   la registra en el historial y avisa con un toast.

   Contadores: los eventos los incrementan con
   Under.MISIONES.sumar(state, "clave", n).
   ============================================================ */

window.Under = window.Under || {};

Under.MISIONES = (function () {

  var DEFS = [];

  function m(id, seccion, etapaMin, etapaMax, icono, titulo, desc, meta, prog, rec, texto, requiere) {
    var def = {
      id: id,
      seccion: seccion,
      etapaMin: etapaMin,
      etapaMax: etapaMax,
      icono: icono,
      titulo: titulo,
      desc: desc,
      meta: meta,
      recompensa: rec,
      recompensaTexto: texto
    };
    if (typeof prog === "function") def.actual = prog;
    else if (typeof prog === "string") def.contador = prog;
    /* Condición para aparecer: decisiones previas (Under.MISIONES._decidio),
       contadores o cualquier lectura del estado. Sin requiere, siempre
       es elegible dentro de su sección y etapa. */
    if (typeof requiere === "function") def.requiere = requiere;
    DEFS.push(def);
    return def;
  }

  /* ============================================================
     SECCIÓN 1 — GRIND BAJO TIERRA (etapa 1-6)
     ============================================================ */
  m("m_grind", "grind", 1, 3, "🎛️", "La escena te conoce", "Tomá 10 decisiones del underground", 10, "grind",
    { talent: 2, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: La escena te conoce. +2 talento, +3 popularidad y +3 vida personal.");
  m("m_grind_20", "grind", 1, 4, "🎛️", "El circuito te adopta", "Tomá 20 decisiones del underground", 20, "grind",
    { popularity: 4, talent: 2, money: 1500 },
    "🎯 Misión completada: El circuito te adopta. Ya sos parte del paisaje del under.");
  m("m_grind_40", "grind", 2, 5, "🎛️", "Sangre de escena", "Tomá 40 decisiones del underground", 40, "grind",
    { popularity: 5, talent: 3, money: 4000 },
    "🎯 Misión completada: Sangre de escena. El under te cuenta como uno de los suyos.");
  m("m_grind_45", "grind", 3, 6, "🌑", "Hecho en el under", "Tomá 45 decisiones del underground", 45, "grind",
    { talent: 4, popularity: 4, money: 6000 },
    "🎯 Misión completada: Hecho en el under. Tu sonido se crio en las sombras y se nota.");
  m("m_under_insignia", "grind", 1, 2, "🪙", "Primer paso en el under", "Tomá 5 decisiones del underground", 5, "grind",
    { popularity: 2, talent: 1, _relaciones: 2 },
    "🎯 Misión completada: Primer paso en el under. La escena empieza a escuchar tu nombre.");
  m("m_toques", "grind", 1, 3, "🎤", "Cara a cara", "Tocá en 3 toques de la escena", 3, "toques",
    { fans: 2500, popularity: 4, _energia: 5 },
    "🎯 Misión completada: Cara a cara. El público de los bares ya canta tus temas.");
  m("m_toques_5", "grind", 1, 4, "🎤", "Vivir el bar", "Tocá en 5 toques de la escena", 5, "toques",
    { fans: 6000, popularity: 3, money: 1000 },
    "🎯 Misión completada: Vivir el bar. Los sonidistas ya te guardan el buen cable.");
  m("m_toques_8", "grind", 2, 5, "🎤", "El circuito te espera", "Tocá en 8 toques de la escena", 8, "toques",
    { fans: 15000, popularity: 5, _energia: 8 },
    "🎯 Misión completada: El circuito te espera. Ya te llaman de todos los bares de la zona.");
  m("m_toques_12", "grind", 3, 6, "🎤", "Leyenda de los bares", "Tocá en 12 toques de la escena", 12, "toques",
    { fans: 25000, popularity: 5, _energia: 10 },
    "🎯 Misión completada: Leyenda de los bares. Cada escenario chico de la zona te conoce.");
  m("m_aire", "grind", 1, 3, "📻", "Salir al aire", "Dá 2 entrevistas en radios de la escena", 2, "radio",
    { fans: 1500, popularity: 3 },
    "🎯 Misión completada: Salir al aire. Tu voz ya suena en la radio de tu barrio.");
  m("m_aire_4", "grind", 1, 4, "📻", "La voz que suena", "Dá 4 entrevistas en radios de la escena", 4, "radio",
    { fans: 5000, popularity: 4, money: 500 },
    "🎯 Misión completada: La voz que suena. Los oyentes te reconocen al otro lado del teléfono.");
  m("m_radio_referente", "grind", 2, 5, "📻", "La voz de la escena", "Dá 6 entrevistas en radios de la escena", 6, "radio",
    { fans: 10000, popularity: 5, money: 1500 },
    "🎯 Misión completada: La voz de la escena. Las radios locales te llaman antes que a nadie.");
  m("m_maqueta", "grind", 1, 2, "💽", "Algo para repartir", "Grabá tu primera maqueta", 1, "maqueta",
    { fans: 2000, popularity: 3, talent: 1 },
    "🎯 Misión completada: Algo para repartir. Tu maqueta corre por los bares de la zona.");
  m("m_maqueta_2", "grind", 2, 4, "💽", "Siempre algo nuevo", "Grabá 2 maquetas", 2, "maqueta",
    { fans: 6000, popularity: 4, money: 800 },
    "🎯 Misión completada: Siempre algo nuevo. La escena espera tu próximo cassette.");
  m("m_freestyle", "grind", 1, 3, "🔥", "La Sobre es tuya", "Ganá una batalla de freestyle", 1, "freestyle",
    { talent: 2, popularity: 4, fans: 3000 },
    "🎯 Misión completada: La Sobre es tuya. Tu barra corre de boca en boca.");
  m("m_freestyle_3", "grind", 1, 4, "🔥", "Rima con hambre", "Ganá 3 batallas de freestyle", 3, "freestyle",
    { talent: 3, popularity: 5, fans: 8000 },
    "🎯 Misión completada: Rima con hambre. En La Sobre ya discuten quién te puede ganar.");
  m("m_freestyle_6", "grind", 2, 5, "🔥", "Rey de La Sobre", "Ganá 6 batallas de freestyle", 6, "freestyle",
    { talent: 4, popularity: 5, fans: 15000 },
    "🎯 Misión completada: Rey de La Sobre. Los combos de tu ciudad se bajan de la pelea.");
  m("m_circuito", "grind", 1, 4, "🎯", "De toque en toque", "Viví 10 momentos entre toques, radios y batallas", 10,
    function (s) {
      var c = s.contadores || {};
      return Math.min(c.grind || 0, (c.toques || 0) + (c.radio || 0) + (c.freestyle || 0));
    },
    { talent: 2, popularity: 3, fans: 4000 },
    "🎯 Misión completada: De toque en toque. El under te vio por todos lados a la vez.");
  m("m_microfono", "grind", 1, 3, "🎙️", "Todo por el micro", "Viví 8 momentos con el micrófono en la mano", 8,
    function (s) {
      var c = s.contadores || {};
      return (c.toques || 0) + (c.radio || 0) + (c.freestyle || 0) + (c.maqueta || 0);
    },
    { popularity: 3, fans: 3000, _energia: 5 },
    "🎯 Misión completada: Todo por el micro. Vivís para el escenario.");
  m("m_doble_escena", "grind", 2, 4, "⚔️", "Bar y La Sobre", "Ganá 4 batallas y tocá 4 veces en bares", 4,
    function (s) {
      var c = s.contadores || {};
      return Math.min(c.toques || 0, c.freestyle || 0);
    },
    { talent: 3, popularity: 4, fans: 6000 },
    "🎯 Misión completada: Bar y La Sobre. Dueño de los dos escenarios del under.");
  m("m_sobre_3", "grind", 1, 3, "🏞️", "La plaza te vio", "Viví 3 momentos en La Sobre", 3, "sobre",
    { popularity: 3, _relaciones: 3, fans: 1500 },
    "🎯 Misión completada: La plaza te vio. Ya sos parte del paisaje de La Sobre.");
  m("m_sobre_8", "grind", 2, 4, "🏞️", "Cara de La Sobre", "Viví 8 momentos en La Sobre", 8, "sobre",
    { talent: 2, popularity: 4, fans: 5000 },
    "🎯 Misión completada: Cara de La Sobre. En la plaza ya te saludan por tu nombre.");
  m("m_sobre_15", "grind", 2, 5, "🏞️", "Sangre de la plaza", "Viví 15 momentos en La Sobre", 15, "sobre",
    { popularity: 5, talent: 2, money: 2000 },
    "🎯 Misión completada: Sangre de la plaza. La Sobre te cuenta entre los suyos.");
  m("m_sobre_25", "grind", 3, 6, "🏞️", "Referente de La Sobre", "Viví 25 momentos en La Sobre", 25, "sobre",
    { popularity: 6, talent: 3, fans: 12000 },
    "🎯 Misión completada: Referente de La Sobre. Los pibes de la plaza esperan tu próxima movida.");
  m("m_sobre_40", "grind", 3, 7, "🏞️", "Dueño de La Sobre", "Viví 40 momentos en La Sobre", 40, "sobre",
    { popularity: 7, talent: 3, money: 5000 },
    "🎯 Misión completada: Dueño de La Sobre. La plaza entera para cuando llegás.");

  /* La plaza te vio: momentos con Marti, Agus y Lucio. El artista
     todavía es chico y su vida pasa por la plaza, los mates y las
     fechas que arma el organizador. */
  m("m_marti_2", "grind", 1, 3, "👯", "Un mate con Marti", "Compartí 2 momentos con Marti", 2, "marti",
    { _relaciones: 5, popularity: 2 },
    "🎯 Misión completada: Un mate con Marti. Ella te cuenta todo lo que se mueve en la escena.");
  m("m_marti_4", "grind", 1, 4, "👯", "Marti te hace la segunda", "Compartí 4 momentos con Marti", 4, "marti",
    { _relaciones: 6, fans: 3000, popularity: 3 },
    "🎯 Misión completada: Marti te hace la segunda. Tu amiga te mete en todos los círculos.");
  m("m_marti_6", "grind", 2, 5, "👯", "Marti y vos, de la plaza", "Compartí 6 momentos con Marti", 6, "marti",
    { _relaciones: 8, fans: 6000, popularity: 4 },
    "🎯 Misión completada: Marti y vos, de la plaza. En la escena ya saben que van juntos.");
  m("m_agus_2", "grind", 1, 3, "🍕", "Con Agus en la plaza", "Compartí 2 momentos con Agus", 2, "agus",
    { _relaciones: 4, popularity: 1 },
    "🎯 Misión completada: Con Agus en la plaza. El barrio te ve con los pibes.");
  m("m_agus_4", "grind", 2, 4, "🍕", "La dupla de La Sobre", "Compartí 4 momentos con Agus", 4, "agus",
    { _relaciones: 5, fans: 2000, popularity: 2 },
    "🎯 Misión completada: La dupla de La Sobre. Marti, Agus y vos, siempre en la plaza.");
  m("m_lucio_2", "grind", 1, 3, "📞", "Lucio te llama", "Tocá en 2 fechas que consigue Lucio", 2, "lucio",
    { fans: 2500, popularity: 3, money: 800 },
    "🎯 Misión completada: Lucio te llama. El organizador ya cuenta con vos.");
  m("m_lucio_5", "grind", 2, 4, "📞", "El pibe de Lucio", "Tocá en 5 fechas que consigue Lucio", 5, "lucio",
    { fans: 8000, popularity: 4, money: 2000 },
    "🎯 Misión completada: El pibe de Lucio. Cuando algo se mueve, Lucio piensa en vos.");
  m("m_lucio_8", "grind", 2, 5, "📞", "La agenda de Lucio", "Tocá en 8 fechas que consigue Lucio", 8, "lucio",
    { fans: 15000, popularity: 5, money: 4000 },
    "🎯 Misión completada: La agenda de Lucio. Estás en el mapa de la escena.");

  /* La escena que filma, barde y reparte: Burger, CRO, Blake,
     Naty vintage y los domingos de La Sobre. */
  m("m_grind_burger_3", "grind", 1, 4, "🍔", "Burger hunter", "Filmá 3 videos con Burger", 3, "burger",
    { fans: 4000, popularity: 3, money: 1000 },
    "🎯 Misión completada: Burger hunter. Cada video tuyo sale más crudo y más visto.");
  m("m_grind_cro_2", "grind", 2, 5, "🔥", "El respeto de CRO", "Medite 2 veces con CRO en la escena", 2, "cro",
    { talent: 2, popularity: 4, fans: 4000 },
    "🎯 Misión completada: El respeto de CRO. El veterano del rap ya te tiene en la mira.");
  m("m_grind_blake_4", "grind", 1, 4, "📱", "Blake te muestra", "Viví 4 momentos de contenido con Blake", 4, "blake",
    { fans: 3500, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Blake te muestra. El contenido que armás con Blake hace crecer tu nombre.");
  m("m_grind_jingle_3", "grind", 2, 5, "🎙️", "Jingle de barrio", "Componé 3 temas para publicidad con Naty vintage", 3, "naty",
    { money: 2500, popularity: 2, talent: 1 },
    "🎯 Misión completada: Jingle de barrio. Naty vintage ya te recomienda a todas las marcas.");
  m("m_grind_domingo_4", "grind", 1, 4, "🏞️", "Domingos en La Sobre", "Viví 4 domingos en La Sobre", 4, "sobre_domingo",
    { fans: 3000, _relaciones: 3, popularity: 2 },
    "🎯 Misión completada: Domingos en La Sobre. El barrio ya te espera cada domingo.");
  m("m_grind_ciclos_4", "grind", 1, 5, "🎪", "El ciclo te quiere", "Participá en 4 ciclos del barrio", 4, "ciclos",
    { fans: 5000, popularity: 3, _relaciones: 2 },
    "🎯 Misión completada: El ciclo te quiere. Los ciclos de la zona te reservan fecha.");
  m("m_grind_telonero_5", "grind", 2, 6, "🎤", "Siempre primero", "Abrí 5 shows de artistas más grandes", 5, "telonero",
    { fans: 9000, popularity: 4, money: 2000 },
    "🎯 Misión completada: Siempre primero. Abrir shows ya te sale de memoria.");
  m("m_grind_feria_5", "grind", 2, 5, "🧺", "El puesto que no para", "Vendé 5 veces en ferias del barrio", 5, "feria",
    { money: 1500, fans: 3000, _relaciones: 2 },
    "🎯 Misión completada: El puesto que no para. Tu nombre corre por todos los puestos.");

  /* Las decisiones te siguen (PRIORIDAD 10): las relaciones que
     elegiste construir en el under maduran con el tiempo. Estas
     misiones solo aparecen si ya forjaste esa dupla (requiere) y
     profundizan la misma historia con los mismos nombres. */
  m("m_grind_burger_6", "grind", 3, 6, "🍔", "Burger hunter: la película", "Profundizá la dupla con Burger hunter", 6, "burger",
    { fans: 6000, popularity: 3, money: 2000 },
    "🎯 Misión completada: Burger hunter: la película. Tu historia y la de Burger ya son una sola.", function (s) {
      return (s.contadores || {}).burger >= 3;
    });
  m("m_grind_cro_4", "grind", 3, 6, "🔥", "La posta de CRO", "Seguí ganando el respeto de CRO", 4, "cro",
    { talent: 2, popularity: 4, fans: 5000 },
    "🎯 Misión completada: La posta de CRO. El veterano ya te pasa la posta del micrófono.", function (s) {
      return (s.contadores || {}).cro >= 2;
    });
  m("m_grind_blake_8", "grind", 3, 6, "📱", "El canal de Blake", "Profundizá la alianza con Blake", 8, "blake",
    { fans: 6000, popularity: 4, _relaciones: 4 },
    "🎯 Misión completada: El canal de Blake. Tu nombre ya es parte de su contenido.", function (s) {
      return (s.contadores || {}).blake >= 4;
    });
  m("m_grind_naty_6", "grind", 3, 6, "🎙️", "La agencia de Naty vintage", "Componé más jingles con Naty vintage", 6, "naty",
    { money: 4000, popularity: 2, talent: 2 },
    "🎯 Misión completada: La agencia de Naty vintage. Tu sonido ya es parte de la publicidad del barrio.", function (s) {
      return (s.contadores || {}).naty >= 3;
    });
  m("m_grind_domingo_8", "grind", 3, 6, "🏞️", "Los domingos son sagrados", "Seguí haciendo propios los domingos de La Sobre", 8, "sobre_domingo",
    { fans: 5000, _relaciones: 4, popularity: 3 },
    "🎯 Misión completada: Los domingos son sagrados. La Sobre sin tu domingo ya no es La Sobre.", function (s) {
      return (s.contadores || {}).sobre_domingo >= 4;
    });

  /* ============================================================
     SECCIÓN 2 — HACER MÚSICA (etapa 1-8)
     ============================================================ */
  m("m_temas_3", "musica", 1, 3, "🎵", "Empezar a sonar", "Lanzá 3 temas", 3, function (s) { return s.lanzamientos; },
    { fans: 1500, popularity: 2 },
    "🎯 Misión completada: Empezar a sonar. Tres temas y un nombre que se repite.");
  m("m_temas_8", "musica", 2, 5, "🎵", "Constante", "Lanzá 8 temas", 8, function (s) { return s.lanzamientos; },
    { fans: 8000, popularity: 4, money: 2000 },
    "🎯 Misión completada: Constante. La disciplina se convierte en catálogo.");
  m("m_temas_10", "musica", 2, 5, "💿", "Carrera larga", "Lanzá 10 temas", 10, function (s) { return s.lanzamientos; },
    { popularity: 4, money: 3000, talent: 1 },
    "🎯 Misión completada: Carrera larga. Diez temas y el relato ya es tuyo.");
  m("m_temas_15", "musica", 3, 6, "💿", "Máquina de escribir", "Lanzá 15 temas", 15, function (s) { return s.lanzamientos; },
    { fans: 20000, popularity: 5, money: 8000 },
    "🎯 Misión completada: Máquina de escribir. Quince temas y no hay freno.");
  m("m_temas_20", "musica", 4, 7, "💿", "Colección completa", "Lanzá 20 temas", 20, function (s) { return s.lanzamientos; },
    { fans: 40000, popularity: 6, money: 15000 },
    "🎯 Misión completada: Colección completa. Veinte temas para elegir el mejor setlist.");
  m("m_temas_25", "musica", 5, 7, "💿", "Discografía respetable", "Lanzá 25 temas", 25, function (s) { return s.lanzamientos; },
    { popularity: 5, money: 20000, talent: 2 },
    "🎯 Misión completada: Discografía respetable. El catálogo ya habla solo.");
  m("m_proyecto", "musica", 2, 4, "💽", "Tener algo propio", "Editá tu primer proyecto", 1, function (s) { return s.totalAlbums; },
    { popularity: 4, money: 3000, talent: 1 },
    "🎯 Misión completada: Tener algo propio. Tu primer proyecto ya está en la calle.");
  m("m_proyectos_2", "musica", 3, 5, "💽", "Volver a concebir", "Editá 2 proyectos", 2, function (s) { return s.totalAlbums; },
    { popularity: 4, money: 5000, fans: 8000 },
    "🎯 Misión completada: Volver a concebir. Segundo proyecto y la idea crece.");
  m("m_proyectos_3", "musica", 4, 6, "💽", "Trilogía", "Editá 3 proyectos", 3, function (s) { return s.totalAlbums; },
    { popularity: 5, money: 10000, talent: 2 },
    "🎯 Misión completada: Trilogía. Tres obras y una identidad clara.");
  m("m_proyectos_4", "musica", 5, 7, "💽", "La obra completa", "Editá 4 proyectos", 4, function (s) { return s.totalAlbums; },
    { fans: 30000, popularity: 6, money: 18000 },
    "🎯 Misión completada: La obra completa. Tu música ya es una discografía en serio.");
  m("m_hit", "musica", 3, 6, "🔥", "Un tema que explota", "Sacá un tema que se vuelva un hit", 1,
    function (s) { return s.flags.tuvoHit ? 1 : 0; },
    { fans: 15000, popularity: 5, money: 5000 },
    "🎯 Misión completada: Un tema que explota. Todo el mundo tararea una frase tuya.");
  m("m_viral", "musica", 4, 7, "⚡", "El boca en boca", "Sacá un tema viral", 1,
    function (s) { return s.flags.tuvoViral ? 1 : 0; },
    { fans: 40000, popularity: 7, money: 12000 },
    "🎯 Misión completada: El boca en boca. Tu tema explota solo en cada red.");
  m("m_global", "musica", 6, 8, "🌍", "Llegar a todo el mundo", "Sacá un hit global", 1,
    function (s) { return s.flags.tuvoGlobal ? 1 : 0; },
    { fans: 100000, popularity: 8, money: 30000 },
    "🎯 Misión completada: Llegar a todo el mundo. Tu música cruza el planeta.");
  m("m_critica", "musica", 3, 6, "🎚️", "El aplauso de los críticos", "Sacá un tema con crítica alta", 1,
    function (s) { return s.flags.tuvoCritica ? 1 : 0; },
    { talent: 3, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: El aplauso de los críticos. Los entendidos te toman en serio.");
  m("m_millon", "musica", 4, 7, "🎧", "Sonar en grande", "Pasá el millón de reproducciones", 1000000,
    function (s) { return s.totalReproducciones; },
    { fans: 30000, money: 15000, popularity: 5 },
    "🎯 Misión completada: Sonar en grande. Más de un millón de personas escucharon tu música.");
  m("m_repros_5m", "musica", 5, 8, "🎧", "Millones te escuchan", "Pasá los 5 millones de reproducciones", 5000000,
    function (s) { return s.totalReproducciones; },
    { fans: 50000, money: 20000, popularity: 5 },
    "🎯 Misión completada: Millones te escuchan. Tu música ya vive sola.");
  m("m_repros_50m", "musica", 6, 8, "🎧", "La banda sonora", "Pasá los 50 millones de reproducciones", 50000000,
    function (s) { return s.totalReproducciones; },
    { fans: 100000, money: 40000, popularity: 6 },
    "🎯 Misión completada: La banda sonora. Tu música es parte de millones de días.");
  m("m_resurgio", "musica", 5, 8, "📼", "Volver a sonar", "Lográ que un tema viejo resurgue", 1,
    function (s) { return (s.discografia || []).filter(function (d) { return d.resurgio; }).length; },
    { fans: 20000, popularity: 4, _relaciones: 3 },
    "🎯 Misión completada: Volver a sonar. Un tema del pasado vuelve a la vida.");
  m("m_tier_alto", "musica", 4, 7, "🏅", "Éxitos de colección", "Sacá 3 temas de tier alto (hit, viral, global o culto)", 3,
    function (s) {
      return (s.discografia || []).filter(function (d) {
        return d.tier === "hit" || d.tier === "viral" || d.tier === "global" || d.tier === "cult";
      }).length;
    },
    { popularity: 6, money: 20000, fans: 30000 },
    "🎯 Misión completada: Éxitos de colección. Tu catálogo está lleno de momentos.");
  (function () {
    Under.DATA.PROYECTOS.forEach(function (p) {
      m("m_proy_" + p.id, "musica", p.nivelMin, p.nivelMin + 3, "💽", "Concebir un " + p.nombre, "Editá un " + p.nombre.toLowerCase(), 1,
        function (pid) { return function (s) { return (s.albums || []).filter(function (a) { return a.tipo === pid; }).length; }; }(p.id),
        { popularity: 4, money: p.id === "album" ? 5000 : 2000, talent: p.id === "album" ? 2 : 1 },
        "🎯 Misión completada: Concebir un " + p.nombre.toLowerCase() + ". La obra se completó.");
    });
  })();
  m("m_musica_sesiones_4", "musica", 1, 4, "🎚️", "El oficio del estudio", "Grabá 4 sesiones de estudio", 4, "sesion",
    { talent: 2, popularity: 3, money: 1200 },
    "🎯 Misión completada: El oficio del estudio. El micro ya te conoce como a un habitué.");
  m("m_musica_sesiones_10", "musica", 3, 6, "🎛️", "El que vive en el estudio", "Grabá 10 sesiones de estudio", 10, "sesion",
    { talent: 3, popularity: 4, money: 4000 },
    "🎯 Misión completada: El que vive en el estudio. Los ingenieros te guardan tu horario.");
  m("m_musica_letras_6", "musica", 2, 5, "✍️", "Pluma que no para", "Escribí 6 letras nuevas", 6, "letras",
    { talent: 3, popularity: 2, _relaciones: 2 },
    "🎯 Misión completada: Pluma que no para. Las frases se te caen de los bolsillos.");
  m("m_musica_demo_3", "musica", 2, 5, "📼", "De demo a tema", "Convertí 3 demos en temas", 3, "demo",
    { fans: 6000, popularity: 3, money: 1500 },
    "🎯 Misión completada: De demo a tema. Ningún pedacito de tu sonido queda en la carpeta.");
  m("m_musica_productor_2", "musica", 3, 6, "🎧", "Oído por oído", "Grabá 2 temas con productores de la escena", 2, "productor_estudio",
    { talent: 2, _relaciones: 4, popularity: 3 },
    "🎯 Misión completada: Oído por oído. Los productores del under ya hablan bien de vos.");

  /* ============================================================
     SECCIÓN 3 — GIRAS Y ESCENARIOS (etapa 1-8)
     ============================================================ */
  m("m_gira_1", "escena", 2, 4, "🎪", "Primera gira", "Hacé 1 gira", 1, function (s) { return s.totalGiras; },
    { fans: 3000, money: 2000, popularity: 2 },
    "🎯 Misión completada: Primera gira. Tu música sale de gira por primera vez.");
  m("m_giras_3", "escena", 3, 5, "🎪", "La carretera", function (s) {
    return "Hacé 3 giras. En la primera fila ya están " + Under.DATA.publico(2) + ".";
  }, 3, function (s) { return s.totalGiras; },
    { fans: 15000, money: 5000, popularity: 3 },
    "🎯 Misión completada: La carretera. Tres giras y el país ya conoce tu show.");
  m("m_giras_5", "escena", 4, 6, "🎪", "Rodando sin parar", "Hacé 5 giras", 5, function (s) { return s.totalGiras; },
    { fans: 30000, money: 10000, popularity: 4 },
    "🎯 Misión completada: Rodando sin parar. La ruta ya es tu casa.");
  m("m_giras_6", "escena", 4, 7, "🎪", "Vida de ruta", "Hacé 6 giras", 6, function (s) { return s.totalGiras; },
    { fans: 40000, money: 12000, popularity: 4 },
    "🎯 Misión completada: Vida de ruta. Los camerinos se te hacen conocidos.");
  m("m_giras_8", "escena", 5, 7, "🎪", "La ruta te conoce", "Hacé 8 giras", 8, function (s) { return s.totalGiras; },
    { fans: 60000, money: 18000, popularity: 5 },
    "🎯 Misión completada: La ruta te conoce. Ocho giras y ninguna ciudad te queda chica.");
  m("m_fest_1", "escena", 1, 4, "🎪", "Una noche grande", "Tocá en 1 show en un lugar del under", 1, function (s) { return s.totalFestivales; },
    { fans: 2000, popularity: 4, _legado: 2 },
    "🎯 Misión completada: Una noche grande. Tocaste en un lugar del under lleno.");
  m("m_fest_3", "escena", 3, 6, "🎪", "El circuito de la escena", function (s) {
    return "Tocá en 3 shows en lugares del under. " + Under.DATA.publico(2) + " ya te siguen a todos lados.";
  }, 3, function (s) { return s.totalFestivales; },
    { fans: 15000, popularity: 5, _legado: 5 },
    "🎯 Misión completada: El circuito de la escena. Tu nombre ya está en los carteles de los lugares.");
  m("m_fest_5", "escena", 4, 7, "🎪", "Cartel habitual", function (s) {
    return "Tocá en 5 shows en lugares del under. El fotógrafo de undercba ya te reserva lugar en la tapa.";
  }, 5, function (s) { return s.totalFestivales; },
    { fans: 30000, popularity: 6, _legado: 8 },
    "🎯 Misión completada: Cartel habitual. Los lugares de la escena te reservan fecha sin preguntar.");
  m("m_fest_8", "escena", 6, 8, "🎪", "Tocar en serio", "Tocá en 8 shows en lugares del under", 8, function (s) { return s.totalFestivales; },
    { fans: 60000, popularity: 7, _legado: 10 },
    "🎯 Misión completada: Tocar en serio. Ocho shows en el under y sos de los más pedidos.");
  m("m_vivo_5", "escena", 3, 6, "🎤", "Vivir el escenario", "Sumá 5 shows entre giras y fechas del under", 5,
    function (s) { return (s.totalGiras || 0) + (s.totalFestivales || 0); },
    { fans: 15000, popularity: 4, money: 5000 },
    "🎯 Misión completada: Vivir el escenario. Cinco noches que valen oro.");
  m("m_vivo_10", "escena", 4, 7, "🎤", "Nacido para el vivo", function (s) {
    return "Sumá 10 shows entre giras y fechas del under. " + Under.DATA.publico(2) + " ya saben tu setlist de memoria.";
  }, 10,
    function (s) { return (s.totalGiras || 0) + (s.totalFestivales || 0); },
    { money: 9000, popularity: 8, _relaciones: 5 },
    "🎯 Misión completada: Nacido para el vivo. Diez shows y el escenario ya es tu casa."),
  m("m_vivo_15", "escena", 5, 8, "🎤", "El show no para", function (s) {
    return "Sumá 15 shows entre giras y fechas del under. " + Under.DATA.publico(2) + " te siguen de fecha en fecha.";
  }, 15,
    function (s) { return (s.totalGiras || 0) + (s.totalFestivales || 0); },
    { fans: 70000, popularity: 6, money: 20000 },
    "🎯 Misión completada: El show no para. Quince shows y el escenario te necesita.");
  (function () {
    Under.DATA.GIRAS.forEach(function (g) {
      m("m_gira_" + g.id, "escena", g.nivel, 8, "🎪", "Concretar: " + g.nombre, "Hacé " + g.nombre.toLowerCase(), 1,
        function (gn) { return function (s) { return (s.giras || []).filter(function (x) { return x.nombre === gn; }).length; }; }(g.nombre),
        { fans: Math.round(g.fans * 0.5), money: Math.round(g.base * 0.3), popularity: g.popularidad },
        "🎯 Misión completada: " + g.nombre + ". Un hito en tu carrera en vivo.");
    });
    Under.DATA.LUGARES.forEach(function (l) {
      m("m_show_" + l.nombre.replace(/[^a-z0-9]/gi, "_").toLowerCase(), "escena", l.nivel, 8, "🎤", "Tocar en " + l.nombre, "Tocá en " + l.nombre.toLowerCase(), 1,
        function (ln) { return function (s) { return (s.festivales || []).filter(function (x) { return x.id === ln; }).length; }; }(l.nombre),
        { fans: 2000 * (l.nivel + 1), popularity: 3 + l.nivel, _legado: 2 + l.nivel },
        "🎯 Misión completada: Tocaste en " + l.nombre + ". Una noche para el recuerdo.");
    });
  })();

  /* ============================================================
     SECCIÓN 4 — SELLO E INDUSTRIA (etapa 2-8)
     ============================================================ */
  m("m_sello", "industria", 3, 6, "🏢", "El respaldo", "Firmá con un sello", 1,
    function (s) { return s.sello ? 1 : 0; },
    { money: 5000, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: El respaldo. Un sello cree en tu proyecto.");
  m("m_sello_pequeno", "industria", 3, 5, "🏢", "Primer contrato", "Firmá con un sello chico", 1,
    function (s) { return s.sello && s.sello.tipo === "pequeno" ? 1 : 0; },
    { money: 3000, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Primer contrato. Tu primera firma con la industria.");
  m("m_sello_medio", "industria", 4, 7, "🏢", "Subir de categoría", "Firmá con un sello medio", 1,
    function (s) { return s.sello && s.sello.tipo === "medio" ? 1 : 0; },
    { money: 8000, popularity: 4, _relaciones: 4 },
    "🎯 Misión completada: Subir de categoría. La industria ya te mira en serio.");
  m("m_sello_grande", "industria", 6, 8, "🏢", "El respaldo gigante", "Firmá con un sello grande", 1,
    function (s) { return s.sello && s.sello.tipo === "grande" ? 1 : 0; },
    { money: 20000, popularity: 6, _relaciones: 5 },
    "🎯 Misión completada: El respaldo gigante. Los más grandes apostaron por vos.");
  m("m_sello_renovar", "industria", 4, 7, "📝", "Renegociar a tu favor", "Renegociá tu contrato con el sello", 1,
    function (s) { return s.flags.tuvoRenegociacion ? 1 : 0; },
    { money: 10000, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Renegociar a tu favor. Ahora el contrato te conviene.");
  m("m_clausula", "industria", 5, 8, "⚖️", "La cláusula", "Sumá una cláusula a tu contrato", 1,
    function (s) { return s.flags.tuvoClausula ? 1 : 0; },
    { money: 8000, popularity: 4, _relaciones: 2 },
    "🎯 Misión completada: La cláusula. Aprendiste a leer la letra chica.");
  m("m_sello_estable", "industria", 4, 7, "🏢", "Relación larga", "Mantené tu sello 3 años seguidos", 1,
    function (s) { return s.sello && s.año - s.sello.año >= 3 ? 1 : 0; },
    { money: 15000, popularity: 4, _relaciones: 6 },
    "🎯 Misión completada: Relación larga. Tres años con la misma casa y seguís creciendo.");
  m("m_plataforma", "industria", 2, 6, "🎧", "Elegir cómo llegar", "Definí tu estrategia de plataformas", 1,
    function (s) { return s.plataforma ? 1 : 0; },
    { fans: 5000, money: 2000, popularity: 2 },
    "🎯 Misión completada: Elegir cómo llegar. Definiste cómo te escucha el mundo.");
  m("m_credito", "industria", 4, 8, "💳", "Pedir un crédito", "Pedí un crédito para crecer", 1,
    function (s) { return s.flags.tuvoCredito ? 1 : 0; },
    { money: 3000, popularity: 2, _relaciones: 2 },
    "🎯 Misión completada: Pedir un crédito. La plata prestada también es una apuesta.");
  m("m_credito_chico", "industria", 3, 6, "💳", "Crédito chico", "Pedí un crédito chico", 1,
    function (s) { return (s.deudas || []).some(function (d) { return d.id === "micro"; }) ? 1 : 0; },
    { money: 2000, popularity: 2, _relaciones: 2 },
    "🎯 Misión completada: Crédito chico. Un empujón sin hipotecar tu futuro.");
  m("m_credito_fuerte", "industria", 4, 7, "💳", "Apuesta fuerte", "Pedí un crédito fuerte", 1,
    function (s) { return (s.deudas || []).some(function (d) { return d.id === "fuerte"; }) ? 1 : 0; },
    { money: 5000, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Apuesta fuerte. Jugaste en grande con la plata prestada.");
  m("m_saldar_deudas", "industria", 5, 8, "✅", "Quedar libre", "Saldá todas tus deudas", 1,
    function (s) { return s.flags.deudasSaldadas ? 1 : 0; },
    { money: 5000, popularity: 2, _relaciones: 5 },
    "🎯 Misión completada: Quedar libre. Dormís sin números rojos en la cabeza.");
  m("m_catalogo", "industria", 6, 8, "📼", "Vender el catálogo", "Vendé tu catálogo", 1,
    function (s) { return s.flags.tuvoVentaCatalogo ? 1 : 0; },
    { money: 30000, _relaciones: 3, popularity: 3 },
    "🎯 Misión completada: Vender el catálogo. Tu música quedó en buenas manos.");
  m("m_quiebra", "industria", 5, 8, "🧗", "Volver de la quiebra", "Sobreviví a una quiebra", 1,
    function (s) { return s.flags.superoQuiebra ? 1 : 0; },
    { popularity: 5, _relaciones: 5, money: 5000 },
    "🎯 Misión completada: Volver de la quiebra. Saliste del hueco y seguís acá.");
  m("m_adelanto_invertido", "industria", 4, 7, "💼", "Hacer rendir el adelanto", "Firmá con sello e invertí plata", 1,
    function (s) { return s.sello && s.inversiones.length >= 1 ? 1 : 0; },
    { money: 8000, _relaciones: 3, popularity: 2 },
    "🎯 Misión completada: Hacer rendir el adelanto. La plata del sello trabaja para vos.");
  m("m_independencia", "industria", 5, 8, "🚀", "Independiente y firme", "Crece hasta nivel 5 sin sello", 1,
    function (s) { return !s.sello && Under.STATE.nivelCarrera(s).nivel >= 5 ? 1 : 0; },
    { popularity: 4, _relaciones: 5, money: 10000 },
    "🎯 Misión completada: Independiente y firme. Llegaste lejos con tus propias reglas.");
  (function () {
    Under.DATA.PLATAFORMAS.forEach(function (pl) {
      m("m_plataforma_" + pl.id, "industria", pl.nivelMin, 8, pl.emoji, "Elegir: " + pl.nombre, "Elegí la estrategia de " + pl.nombre.toLowerCase(), 1,
        function (pid) { return function (s) { return s.plataforma && s.plataforma.id === pid ? 1 : 0; }; }(pl.id),
        { fans: 5000, money: 1500, popularity: 2 },
        "🎯 Misión completada: Estrategia de " + pl.nombre.toLowerCase() + " elegida.");
    });
  })();

  /* ============================================================
     SECCIÓN 5 — LA RED Y COLABORACIONES (etapa 2-8)
     ============================================================ */
  m("m_colab_1", "red", 3, 5, "🤝", "Primera colaboración", "Hacé 1 colaboración", 1, function (s) { return s.totalColabs; },
    { fans: 5000, popularity: 3, talent: 1 },
    "🎯 Misión completada: Primera colaboración. Dos nombres, una canción.");
  m("m_colabs_3", "red", 4, 6, "🤝", "El under se junta", "Hacé 3 colaboraciones", 3, function (s) { return s.totalColabs; },
    { fans: 15000, popularity: 4, money: 3000 },
    "🎯 Misión completada: El under se junta. Tres collabs y la escena se conecta.");
  m("m_colabs_5", "red", 4, 7, "🤝", "Red de artistas", "Hacé 5 colaboraciones", 5, function (s) { return s.totalColabs; },
    { fans: 30000, popularity: 5, money: 6000 },
    "🎯 Misión completada: Red de artistas. Cinco voces distintas ya son parte de la tuya.");
  m("m_colabs_8", "red", 5, 8, "🤝", "La escena te busca", "Hacé 8 colaboraciones", 8, function (s) { return s.totalColabs; },
    { fans: 60000, popularity: 6, money: 12000 },
    "🎯 Misión completada: La escena te busca. Ocho collabs y tu agenda no descansa.");
  m("m_colab_emergente", "red", 3, 4, "🌱", "Apostar al futuro", "Colaborá con un artista emergente", 1,
    function (s) { return (s.colaboraciones || []).filter(function (c) { return c.tipo === "emergente"; }).length; },
    { fans: 4000, _relaciones: 4, popularity: 2 },
    "🎯 Misión completada: Apostar al futuro. Ayudaste a crecer a alguien y creciste vos.");
  m("m_colab_estrella", "red", 5, 7, "⭐", "Con los grandes", "Colaborá con una estrella", 1,
    function (s) { return (s.colaboraciones || []).filter(function (c) { return c.tipo === "estrella"; }).length; },
    { fans: 25000, popularity: 6, money: 8000 },
    "🎯 Misión completada: Con los grandes. Compartiste micrófono con una estrella.");
  m("m_red_3", "red", 2, 5, "🕸️", "Primeros aliados", "Tené 3 contactos activos en tu red", 3,
    function (s) { return (s.red || []).filter(function (c) { return c.activo; }).length; },
    { _relaciones: 5, popularity: 2, money: 1000 },
    "🎯 Misión completada: Primeros aliados. Ya tenés quién te abra puertas.");
  m("m_red_6", "red", 3, 6, "🕸️", "Una red que crece", "Tené 6 contactos activos en tu red", 6,
    function (s) { return (s.red || []).filter(function (c) { return c.activo; }).length; },
    { _relaciones: 6, popularity: 3, money: 3000 },
    "🎯 Misión completada: Una red que crece. Seis contactos que te cubren la espalda.");
  m("m_red_productor", "red", 3, 6, "🎛️", "Productores que te bancan", "Tené 2 productores en tu red", 2,
    function (s) { return (s.red || []).filter(function (c) { return c.rol === "productor" && c.activo; }).length; },
    { talent: 3, popularity: 3, _relaciones: 5 },
    "🎯 Misión completada: Productores que te bancan. Tu sonido tiene padrino.");
  m("m_red_colega", "red", 2, 5, "🤜", "Colegas de ruta", "Tené 3 colegas en tu red", 3,
    function (s) { return (s.red || []).filter(function (c) { return c.rol === "colega" && c.activo; }).length; },
    { _relaciones: 6, popularity: 3, talent: 2 },
    "🎯 Misión completada: Colegas de ruta. La escena te trata como par.");
  m("m_equipo_1", "red", 2, 4, "🛠️", "Nunca solo", "Contratá a 1 persona para tu equipo", 1, function (s) { return s.equipo.length; },
    { _relaciones: 5, money: 1500, popularity: 2 },
    "🎯 Misión completada: Nunca solo. La primera persona que trabaja para vos.");
  m("m_equipo_2", "red", 3, 5, "🛠️", "Un equipo que te cubre", "Contratá 2 personas para tu equipo", 2, function (s) { return s.equipo.length; },
    { money: 3000, _relaciones: 5, talent: 1 },
    "🎯 Misión completada: Un equipo que te cubre. Ya no estás solo en la ruta.");
  m("m_equipo_4", "red", 4, 7, "🛠️", "La estructura completa", "Contratá 4 personas para tu equipo", 4, function (s) { return s.equipo.length; },
    { money: 8000, _relaciones: 6, popularity: 3 },
    "🎯 Misión completada: La estructura completa. Tu carrera ya camina sola.");
  m("m_rival", "red", 2, 5, "😤", "Un rival te mira", "Cruzate con un rival", 1,
    function (s) { return (s.rivales || []).length; },
    { popularity: 3, talent: 2, _relaciones: 2 },
    "🎯 Misión completada: Un rival te mira. El beef también alimenta la fama.");
  m("m_rival_superar", "red", 3, 6, "🕊️", "Enterrar el hacha", "Reconciliate con un rival", 1,
    function (s) { return (s.rivales || []).some(function (r) { return !!r.reconciliado; }) ? 1 : 0; },
    { _relaciones: 6, popularity: 3, fans: 10000 },
    "🎯 Misión completada: Enterrar el hacha. Convertiste un enemigo en respeto.");
  m("m_memoria_buena", "red", 3, 7, "💾", "Lo que la escena recuerda", "Viví 3 momentos que la escena recuerde bien", 3,
    function (s) { return (s.memorias || []).filter(function (x) { return x.tono === "buena"; }).length; },
    { popularity: 4, _relaciones: 5, money: 3000 },
    "🎯 Misión completada: Lo que la escena recuerda. Tu nombre se cuenta bien.");
  (function () {
    Under.DATA.EQUIPO.forEach(function (r) {
      m("m_equipo_" + r.id, "red", r.nivelMin, 7, r.emoji, "Contratar: " + r.nombre, "Contratá a tu " + r.nombre.toLowerCase(), 1,
        function (rid) { return function (s) { return (s.equipo || []).filter(function (x) { return x.id === rid; }).length; }; }(r.id),
        { _relaciones: 4, money: 1500, popularity: 2 },
        "🎯 Misión completada: " + r.nombre + " contratado. Tu equipo suma músculo.");
    });
  })();

  /* ============================================================
     SECCIÓN 6 — EL PÚBLICO (etapa 1-8)
     ============================================================ */
  m("m_fans_50k", "publico", 3, 6, "👥", "Cincuenta mil", "Llegá a 50.000 fans", 50000, function (s) { return s.stats.fans; },
    { popularity: 4, money: 4000, _relaciones: 2 },
    "🎯 Misión completada: Cincuenta mil. Cincuenta mil personas te siguen.");
  m("m_fans_250k", "publico", 4, 7, "👥", "Los números grandes", "Llegá a 250.000 fans", 250000, function (s) { return s.stats.fans; },
    { popularity: 5, money: 8000, fans: 10000 },
    "🎯 Misión completada: Los números grandes. Un cuarto de millón te escucha.");
  m("m_fans_1m", "publico", 6, 8, "👥", "El millón de fans", "Llegá al millón de fans", 1000000, function (s) { return s.stats.fans; },
    { popularity: 6, money: 20000, _relaciones: 3 },
    "🎯 Misión completada: El millón de fans. Un millón de personas te siguen.");
  m("m_fans_2m", "publico", 7, 8, "👥", "Marea humana", "Llegá a los 2 millones de fans", 2000000, function (s) { return s.stats.fans; },
    { popularity: 7, money: 30000, fans: 50000 },
    "🎯 Misión completada: Marea humana. Dos millones de personas no se equivocan.");
  m("m_fandom", "publico", 1, 4, "💜", "Un público con vida propia", "Viví 3 momentos de fandom", 3, "fandom",
    { fans: 3000, popularity: 3, _relaciones: 4 },
    "🎯 Misión completada: Un público con vida propia. Tus fans ya son parte de la historia.");
  m("m_fandom_8", "publico", 2, 5, "💜", "La comunidad", "Viví 8 momentos de fandom", 8, "fandom",
    { fans: 8000, popularity: 4, _relaciones: 5 },
    "🎯 Misión completada: La comunidad. Tus fans se organizan y se quieren.");
  m("m_fandom_15", "publico", 3, 6, "💜", "Familia de fans", "Viví 15 momentos de fandom", 15, "fandom",
    { fans: 20000, popularity: 5, _relaciones: 6 },
    "🎯 Misión completada: Familia de fans. Tu público es una comunidad en serio.");
  m("m_fieles_1k", "publico", 2, 5, "🤝", "Los que se quedan", "Tené 1.000 fans fieles", 1000, function (s) { return s.fansFieles || 0; },
    { fans: 5000, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: Los que se quedan. Mil personas que no te van a soltar.");
  m("m_fieles_10k", "publico", 4, 7, "🤝", "Una base fiel", "Tené 10.000 fans fieles", 10000, function (s) { return s.fansFieles || 0; },
    { fans: 15000, _relaciones: 6, popularity: 4 },
    "🎯 Misión completada: Una base fiel. Diez mil corazones bancándote.");
  m("m_fieles_50k", "publico", 6, 8, "🤝", "Núcleo duro", "Tené 50.000 fans fieles", 50000, function (s) { return s.fansFieles || 0; },
    { fans: 40000, _relaciones: 7, popularity: 5 },
    "🎯 Misión completada: Núcleo duro. Cincuenta mil personas te defienden a muerte.");
  m("m_hardcore_500", "publico", 3, 6, "🎯", "Los más fanáticos", "Tené 500 fans hardcore", 500, function (s) { return s.fansHardcore || 0; },
    { fans: 8000, popularity: 4, _relaciones: 5 },
    "🎯 Misión completada: Los más fanáticos. Quinientos fans que viajan a tus shows.");
  m("m_hardcore_5k", "publico", 5, 8, "🎯", "Ejército propio", "Tené 5.000 fans hardcore", 5000, function (s) { return s.fansHardcore || 0; },
    { fans: 30000, popularity: 6, _relaciones: 6 },
    "🎯 Misión completada: Ejército propio. Cinco mil fans que harían lo que sea.");
  m("m_hype", "publico", 2, 5, "🔥", "El momento de moda", "Viví un momento de hype", 1,
    function (s) { return s.flags.hypeVivido ? 1 : 0; },
    { fans: 6000, popularity: 4, money: 2000 },
    "🎯 Misión completada: El momento de moda. Tu nombre estuvo en boca de todos.");
  m("m_hype_70", "publico", 3, 6, "🔥", "En llamas", "Llevá tu hype a 70", 70, function (s) { return s.hype; },
    { fans: 10000, popularity: 5, _energia: 5 },
    "🎯 Misión completada: En llamas. El mundo entero habla de vos.");
  m("m_hype_sostenido", "publico", 2, 5, "🌡️", "Mantener el calor", "Llevá tu hype a 45", 45, function (s) { return s.hype; },
    { fans: 4000, popularity: 3, money: 1500 },
    "🎯 Misión completada: Mantener el calor. El ruido alrededor de tu nombre no para.");
  m("m_haters_100", "publico", 3, 6, "💢", "Los que te odian", "Acumulá 100 haters", 100, function (s) { return s.haters || 0; },
    { popularity: 3, money: 2000, _relaciones: 2 },
    "🎯 Misión completada: Los que te odian. Si te odian cien, es que importás.");
  m("m_haters_500", "publico", 5, 8, "💢", "Polémica y fama", "Acumulá 500 haters", 500, function (s) { return s.haters || 0; },
    { popularity: 4, money: 5000, fans: 10000 },
    "🎯 Misión completada: Polémica y fama. Quinientos haters y una fila de fans.");
  m("m_rehabilitar", "publico", 4, 7, "🕊️", "Reconciliar tu imagen", "Bajá los haters a 300 con buena reputación", 1,
    function (s) { return (s.haters || 0) <= 300 && s.reputacion >= 60 ? 1 : 0; },
    { popularity: 4, _relaciones: 5, fans: 8000 },
    "🎯 Misión completada: Reconciliar tu imagen. La gente volvió a quererte.");
  m("m_base_solida", "publico", 3, 6, "🏗️", "Cimientos firmes", "Construí una base de 20.000 fans con fieles", 20000,
    function (s) { return Math.min(s.stats.fans, (s.fansFieles || 0) * 20); },
    { fans: 8000, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: Cimientos firmes. Tu éxito ya no depende de un momento.");
  m("m_publico_estable", "publico", 5, 8, "⚖️", "Fama con respeto", "Tené 50.000 fans y pocos haters", 1,
    function (s) { return s.stats.fans >= 50000 && (s.haters || 0) <= 500 ? 1 : 0; },
    { popularity: 5, _relaciones: 5, money: 8000 },
    "🎯 Misión completada: Fama con respeto. Creces sin quemarte.");
  m("m_armonia", "publico", 4, 7, "💞", "Amor sobre el ruido", "Que tus fieles superen 5 veces a tus hardcore", 1,
    function (s) { return (s.fansFieles || 0) >= (s.fansHardcore || 0) * 5 ? 1 : 0; },
    { _relaciones: 6, popularity: 3, fans: 10000 },
    "🎯 Misión completada: Amor sobre el ruido. Tu público es sano y te quiere.");

  /* ============================================================
     SECCIÓN 7 — VIDA Y BIENESTAR (etapa 1-8)
     ============================================================ */
  m("m_puertas", "vida", 1, 4, "🚪", "La música abre puertas", "Viví 3 momentos fuera de la música", 3, "puertas",
    { money: 2000, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: La música abre puertas. Tu nombre ya trasciende los escenarios.");
  m("m_puertas_5", "vida", 2, 5, "🚪", "Más allá del escenario", "Viví 5 momentos fuera de la música", 5, "puertas",
    { money: 4000, popularity: 4, _relaciones: 4 },
    "🎯 Misión completada: Más allá del escenario. Tu vida tiene otras historias.");
  m("m_puertas_8", "vida", 3, 6, "🚪", "Una vida con varias puertas", "Viví 8 momentos fuera de la música", 8, "puertas",
    { money: 8000, popularity: 4, _relaciones: 6 },
    "🎯 Misión completada: Una vida con varias puertas. La música te abrió todo.");
  m("m_vida_bien", "vida", 2, 6, "💚", "Bien con los tuyos", "Llevá tu vida personal a 70", 70, function (s) { return s.relaciones; },
    { _relaciones: 4, money: 2000, popularity: 2 },
    "🎯 Misión completada: Bien con los tuyos. La gente que querés está cerca.");
  m("m_vida_fuerte", "vida", 4, 7, "💚", "Rodeado de amor", "Llevá tu vida personal a 85", 85, function (s) { return s.relaciones; },
    { _relaciones: 6, money: 5000, popularity: 3 },
    "🎯 Misión completada: Rodeado de amor. Tu vida personal es un refugio.");
  m("m_energia_60", "vida", 1, 4, "⚡", "Cuerpo que responde", "Mantené tu energía en 60", 60, function (s) { return s.energia; },
    { _energia: 5, popularity: 2, money: 1000 },
    "🎯 Misión completada: Cuerpo que responde. Dormís, comés bien y el cuerpo te lo agradece.");
  m("m_energia_80", "vida", 3, 6, "⚡", "Descansado y firme", "Mantené tu energía en 80", 80, function (s) { return s.energia; },
    { _energia: 8, popularity: 3, money: 2000 },
    "🎯 Misión completada: Descansado y firme. Tu cuerpo aguanta todo el show.");
  m("m_escandalo_1", "vida", 3, 6, "⚠️", "Aguantar la tormenta", "Superá 1 escándalo", 1, function (s) { return s.totalEscandalos; },
    { popularity: 3, _relaciones: 4, money: 2000 },
    "🎯 Misión completada: Aguantar la tormenta. Saliste entero del ojo del huracán.");
  m("m_escandalos_3", "vida", 4, 7, "⚠️", "Salir entero", "Superá 3 escándalos", 3, function (s) { return s.totalEscandalos; },
    { popularity: 5, _relaciones: 5, money: 5000 },
    "🎯 Misión completada: Salir entero. Tres tormentas y seguís en pie.");
  m("m_escandalo_leve", "vida", 2, 5, "🌫️", "Polémica chica", "Superá una polémica leve", 1,
    function (s) { return (s.escandalos || []).filter(function (e) { return e.gravedad === "leve"; }).length; },
    { popularity: 2, _relaciones: 3, money: 1000 },
    "🎯 Misión completada: Polémica chica. La tormenta pasó sin dejar marca.");
  m("m_escandalo_grave", "vida", 4, 6, "🌪️", "Controversia seria", "Superá una controversia grave", 1,
    function (s) { return (s.escandalos || []).filter(function (e) { return e.gravedad === "grave"; }).length; },
    { popularity: 4, _relaciones: 4, money: 3000 },
    "🎯 Misión completada: Controversia seria. Saliste de una que podía terminar mal.");
  m("m_escandalo_crisis", "vida", 6, 8, "🌀", "La crisis mayor", "Superá una crisis mayor", 1,
    function (s) { return (s.escandalos || []).filter(function (e) { return e.gravedad === "crisis"; }).length; },
    { popularity: 5, _relaciones: 5, money: 6000 },
    "🎯 Misión completada: La crisis mayor. Sobreviviste a lo peor.");
  m("m_inv_1", "vida", 3, 5, "📈", "Hacer rendir la plata", "Hacé 1 inversión", 1, function (s) { return s.totalInversiones; },
    { money: 3000, _relaciones: 2, popularity: 2 },
    "🎯 Misión completada: Hacer rendir la plata. Tu dinero trabaja mientras dormís.");
  m("m_inv_2", "vida", 4, 6, "📈", "Pensar en el futuro", "Hacé 2 inversiones", 2, function (s) { return s.totalInversiones; },
    { money: 6000, _relaciones: 3, popularity: 2 },
    "🎯 Misión completada: Pensar en el futuro. Dos apuestas que generan solas.");
  m("m_inv_3", "vida", 5, 7, "📈", "Portfolio propio", "Hacé 3 inversiones", 3, function (s) { return s.totalInversiones; },
    { money: 10000, _relaciones: 4, popularity: 3 },
    "🎯 Misión completada: Portfolio propio. Tu carrera ya no depende solo de los shows.");
  m("m_equilibrio", "vida", 2, 5, "⚖️", "El equilibrio", "Mantené energía y vida personal en 50", 1,
    function (s) { return s.energia >= 50 && s.relaciones >= 50 ? 1 : 0; },
    { _energia: 5, _relaciones: 5, popularity: 2 },
    "🎯 Misión completada: El equilibrio. Cuerpo, gente y música en armonía.");
  m("m_vida_plena", "vida", 5, 8, "🌈", "Vida plena", "Mantené energía y vida personal en 75", 1,
    function (s) { return s.energia >= 75 && s.relaciones >= 75 ? 1 : 0; },
    { _energia: 8, _relaciones: 8, money: 5000 },
    "🎯 Misión completada: Vida plena. Lo lograste todo sin romperte.");
  (function () {
    Under.DATA.INVERSIONES.forEach(function (inv) {
      m("m_inv_" + inv.id, "vida", inv.nivelMin, inv.nivelMin + 3, inv.emoji, "Invertir en " + inv.nombre, "Invertí en " + inv.nombre.toLowerCase(), 1,
        function (iid) { return function (s) { return (s.inversiones || []).filter(function (x) { return x.id === iid; }).length; }; }(inv.id),
        { money: 2000, _relaciones: 2, popularity: 2 },
        "🎯 Misión completada: Inversión en " + inv.nombre + " realizada.");
    });
  })();

  /* ============================================================
     SECCIÓN 8 — SALIR AL MUNDO (etapa 3-8)
     ============================================================ */
  m("m_mercado_1", "internacional", 3, 5, "🌎", "Primera frontera", "Conquistá 1 mercado", 1, function (s) { return s.mercados.length; },
    { fans: 5000, popularity: 4, money: 2000 },
    "🎯 Misión completada: Primera frontera. Tu música cruzó la primera frontera.");
  m("m_mercado_2", "internacional", 4, 6, "🌎", "Dos regiones", "Conquistá 2 mercados", 2, function (s) { return s.mercados.length; },
    { fans: 12000, popularity: 5, money: 5000 },
    "🎯 Misión completada: Dos regiones. Dos públicos nuevos te escuchan.");
  m("m_mercados_3", "internacional", 5, 7, "🌎", "El mundo se abre", "Conquistá 3 mercados", 3, function (s) { return s.mercados.length; },
    { fans: 25000, popularity: 6, money: 10000 },
    "🎯 Misión completada: El mundo se abre. Tres regiones y tu música ya es global.");
  m("m_mercados_4", "internacional", 6, 8, "🌎", "El mapa completo", "Conquistá 4 mercados", 4, function (s) { return s.mercados.length; },
    { fans: 50000, popularity: 7, money: 20000 },
    "🎯 Misión completada: El mapa completo. Tocás todos los rincones del planeta.");
  m("m_fama_mundial", "internacional", 7, 8, "🌍", "Fama mundial", "Alcanzá el nivel 8 de carrera", 8,
    function (s) { return Under.STATE.nivelCarrera(s).nivel; },
    { popularity: 8, money: 30000, _relaciones: 3 },
    "🎯 Misión completada: Fama mundial. El mundo entero te escucha.");
  m("m_pico", "internacional", 6, 8, "🏔️", "La cima", "Alcanzá el nivel 7 de carrera", 7,
    function (s) { return Under.STATE.nivelCarrera(s).nivel; },
    { popularity: 6, money: 15000, _relaciones: 2 },
    "🎯 Misión completada: La cima. Estás donde muy pocos llegan.");
  m("m_reputacion_70", "internacional", 5, 7, "🤝", "Nombre respetado", "Llevá tu reputación a 70", 70, function (s) { return s.reputacion; },
    { popularity: 4, _relaciones: 5, money: 5000 },
    "🎯 Misión completada: Nombre respetado. La escena mundial te toma en serio.");
  m("m_reputacion_85", "internacional", 6, 8, "👑", "Leyenda respetada", "Llevá tu reputación a 85", 85, function (s) { return s.reputacion; },
    { popularity: 5, _relaciones: 6, money: 12000 },
    "🎯 Misión completada: Leyenda respetada. Tu palabra pesa en toda la industria.");
  m("m_legado_40", "internacional", 5, 8, "📜", "Dejar huella", "Acumulá 40 de legado", 40, function (s) { return s.legado; },
    { popularity: 4, _relaciones: 3, money: 5000 },
    "🎯 Misión completada: Dejar huella. Ya hay algo que va a quedar.");
  m("m_legado_80", "internacional", 6, 8, "📜", "Historia grande", "Acumulá 80 de legado", 80, function (s) { return s.legado; },
    { popularity: 5, money: 12000, _relaciones: 4 },
    "🎯 Misión completada: Historia grande. Tu nombre ya es parte de la historia.");
  m("m_legado_100", "internacional", 7, 8, "📜", "Inmortal", "Acumulá 100 de legado", 100, function (s) { return s.legado; },
    { popularity: 6, money: 20000, _relaciones: 5 },
    "🎯 Misión completada: Inmortal. Tu legado va a sobrevivirte.");
  m("m_mundo_gira", "internacional", 7, 8, "🌍", "Dar la vuelta al mundo", "Hacé una gira mundial", 1,
    function (s) { return s.flags.tuvoGiraMundial ? 1 : 0; },
    { fans: 60000, popularity: 7, money: 20000 },
    "🎯 Misión completada: Dar la vuelta al mundo. Tu show dio la vuelta al planeta.");
  m("m_exterior", "internacional", 5, 7, "🧭", "Estrategia global", "Conquistá 2 mercados y definí tu plataforma", 1,
    function (s) { return s.mercados.length >= 2 && s.plataforma ? 1 : 0; },
    { popularity: 4, money: 8000, fans: 10000 },
    "🎯 Misión completada: Estrategia global. Tu música ya tiene plan de mundo.");
  m("m_oceano", "internacional", 6, 8, "🚢", "Cruzar el océano", "Conquistá 2 mercados y hacé una gira internacional", 1,
    function (s) {
      return s.mercados.length >= 2 &&
        (s.giras || []).some(function (g) { return g.nombre === "Gira internacional" || g.nombre === "Gira mundial"; }) ? 1 : 0;
    },
    { fans: 30000, popularity: 5, money: 12000 },
    "🎯 Misión completada: Cruzar el océano. Tu música vive en otros continentes.");
  m("m_cumbre", "internacional", 7, 8, "🏆", "La cima del mundo", "Nivel 8 con 3 mercados conquistados", 1,
    function (s) { return Under.STATE.nivelCarrera(s).nivel >= 8 && s.mercados.length >= 3 ? 1 : 0; },
    { popularity: 8, money: 25000, _relaciones: 4 },
    "🎯 Misión completada: La cima del mundo. Nivel máximo y el planeta en la palma.");
  m("m_fronteras", "internacional", 5, 8, "🎧", "Sonar en todos lados", "Pasá los 25 millones de reproducciones", 25000000,
    function (s) { return s.totalReproducciones; },
    { fans: 40000, popularity: 5, money: 15000 },
    "🎯 Misión completada: Sonar en todos lados. Tu música no tiene fronteras.");
  (function () {
    Under.DATA.MERCADOS.forEach(function (mk) {
      m("m_mercado_" + mk.id, "internacional", mk.nivelMin, 8, mk.emoji, "Conquistar " + mk.nombre, "Conquistá el mercado de " + mk.nombre.toLowerCase(), 1,
        function (mid) { return function (s) { return (s.mercados || []).filter(function (x) { return x.id === mid; }).length; }; }(mk.id),
        { fans: Math.round(mk.fans * 0.5), popularity: mk.popularidad, money: Math.round(mk.costo * 0.3) },
        "🎯 Misión completada: Conquistaste " + mk.nombre + ".");
    });
  })();

  /* La escena va con vos (PRIORIDAD 10): cuando sos mainstream,
     la gente que elegiste construir en el under crece a tu lado.
     Cada una solo aparece si forjaste esa relación antes (requiere)
     y celebra lo que sembraste de decisiones. */
  m("m_main_burger_estadio", "internacional", 5, 8, "🍔", "Burger hunter va al estadio", "Hacé 3 giras con Burger hunter de cámara", 3,
    function (s) { return (s.giras || []).length; },
    { fans: 25000, popularity: 5, money: 8000 },
    "🎯 Misión completada: Burger hunter va al estadio. Tu cámara siempre estuvo: ahora filma países enteros.",
    function (s) {
      return (s.flags.salioDelUnderground && (s.contadores || {}).burger >= 3);
    });
  m("m_main_cro_abre", "internacional", 5, 8, "🔥", "CRO te abre la escena grande", "Hacé 3 colaboraciones en la etapa grande", 3,
    function (s) { return s.totalColabs; },
    { fans: 20000, popularity: 4, money: 10000 },
    "🎯 Misión completada: CRO te abre la escena grande. El que te desafió de pibe ahora te presenta en el cartel.",
    function (s) {
      return (s.flags.salioDelUnderground && (s.contadores || {}).cro >= 2);
    });
  m("m_main_blake_programa", "internacional", 5, 8, "📱", "Blake te entrevista", "Ganá 2 premios con Blake cubriéndote", 2,
    function (s) { return s.totalPremios; },
    { fans: 30000, popularity: 6, _relaciones: 4 },
    "🎯 Misión completada: Blake te entrevista. El que usaba tu tema en sus videos hoy te recibe como estrella.",
    function (s) {
      return (s.flags.salioDelUnderground && (s.contadores || {}).blake >= 4);
    });
  m("m_main_naty_campana", "internacional", 5, 8, "🎙️", "La campaña de Naty vintage", "Pasá 10 millones de reproducciones con la campaña grande", 10000000,
    function (s) { return s.totalReproducciones; },
    { fans: 35000, popularity: 5, money: 15000 },
    "🎯 Misión completada: La campaña de Naty vintage. Del jingle del barrio a tu cara en la campaña nacional.",
    function (s) {
      return (s.flags.salioDelUnderground && (s.contadores || {}).naty >= 3);
    });
  m("m_main_sobre_homenaje", "internacional", 5, 8, "🏞️", "La Sobre te homenajea", "Acumulá 60 de legado para que la plaza te nombre", 60,
    function (s) { return s.legado; },
    { _relaciones: 6, popularity: 4, money: 10000 },
    "🎯 Misión completada: La Sobre te homenajea. El barrio que te vio empezar te devuelve la plaza con tu nombre.",
    function (s) {
      return (s.flags.salioDelUnderground && (s.contadores || {}).sobre_domingo >= 4);
    });

  /* ============================================================
     SECCIÓN 9 — CRISIS Y REINVENCIÓN (etapa 3-8)
     ============================================================ */
  m("m_tocar_fondo", "crisis", 3, 6, "🌑", "Tocar fondo", "Viví una crisis de carrera", 1,
    function (s) { return s.flags.estuvoEnCrisis ? 1 : 0; },
    { popularity: 3, _relaciones: 3, money: 2000 },
    "🎯 Misión completada: Tocar fondo. Viste el hueco y seguiste contándolo.");
  m("m_salir_fondo", "crisis", 4, 7, "🌅", "Volver de abajo", "Superá una crisis de carrera", 1,
    function (s) { return s.flags.superoCrisis ? 1 : 0; },
    { popularity: 5, _relaciones: 5, money: 5000 },
    "🎯 Misión completada: Volver de abajo. Saliste del fondo y estás más fuerte.");
  m("m_anios_crisis", "crisis", 4, 7, "⏳", "Aguantar el temporal", "Sobreviví 2 años en crisis", 2,
    function (s) { return s.aniosEnCrisis; },
    { popularity: 4, _relaciones: 4, money: 3000 },
    "🎯 Misión completada: Aguantar el temporal. Dos años abajo y sin rendirte.");
  m("m_rebote", "crisis", 5, 7, "🚀", "El rebote", "Superá la crisis y volvé con momentum", 1,
    function (s) { return s.flags.superoCrisis && s.momentum >= 50 ? 1 : 0; },
    { popularity: 5, fans: 15000, money: 8000 },
    "🎯 Misión completada: El rebote. Saliste del fondo en llamas.");
  m("m_reinvencion_1", "crisis", 4, 7, "🔄", "Renacer", "Reinventate 1 vez", 1, function (s) { return s.reinvenciones; },
    { talent: 3, popularity: 4, _relaciones: 3 },
    "🎯 Misión completada: Renacer. Cambiaste de piel y seguiste siendo vos.");
  m("m_reinvenciones_2", "crisis", 5, 7, "🔄", "Segunda piel", "Reinventate 2 veces", 2, function (s) { return s.reinvenciones; },
    { talent: 4, popularity: 5, _relaciones: 4 },
    "🎯 Misión completada: Segunda piel. Te reinventás cuando hace falta.");
  m("m_reinvenciones_3", "crisis", 6, 8, "🦎", "Cada década, otra vez", "Reinventate 3 veces", 3, function (s) { return s.reinvenciones; },
    { talent: 5, popularity: 6, _relaciones: 5 },
    "🎯 Misión completada: Cada década, otra vez. Siempre encontrás un sonido nuevo.");
  m("m_evolucion", "crisis", 5, 8, "🌱", "Evolucionar", "Viví un momento de evolución artística", 1,
    function (s) { return s.flags.tuvoEvolucion ? 1 : 0; },
    { talent: 3, popularity: 4, _relaciones: 3 },
    "🎯 Misión completada: Evolucionar. Tu música dio un salto adelante.");
  m("m_documental_1", "crisis", 6, 8, "🎬", "Tu historia en pantalla", "Que cuenten tu historia en un documental", 1,
    function (s) { return s.documentales; },
    { popularity: 5, _relaciones: 4, money: 8000 },
    "🎯 Misión completada: Tu historia en pantalla. Alguien contó tu carrera en serio.");
  m("m_documentales_2", "crisis", 7, 8, "🎬", "Retratado dos veces", "Que cuenten tu historia en 2 documentales", 2,
    function (s) { return s.documentales; },
    { popularity: 6, _relaciones: 5, money: 15000 },
    "🎯 Misión completada: Retratado dos veces. Tu vida vale dos películas.");
  m("m_legado_30", "crisis", 5, 8, "📜", "Algo que contar", "Acumulá 30 de legado", 30, function (s) { return s.legado; },
    { popularity: 3, _relaciones: 3, money: 3000 },
    "🎯 Misión completada: Algo que contar. Tu carrera ya tiene capítulos.");
  m("m_legado_120", "crisis", 7, 8, "🏛️", "Leyenda", "Acumulá 120 de legado", 120, function (s) { return s.legado; },
    { popularity: 7, money: 25000, _relaciones: 5 },
    "🎯 Misión completada: Leyenda. Tu nombre ya es mito.");
  m("m_vuelta", "crisis", 5, 8, "🌄", "Volver y seguir", "Superá la crisis y seguí lanzando (10 temas)", 1,
    function (s) { return s.flags.superoCrisis && s.lanzamientos >= 10 ? 1 : 0; },
    { fans: 20000, popularity: 5, money: 8000 },
    "🎯 Misión completada: Volver y seguir. El fondo quedó atrás y el estudio sigue.");
  m("m_perseverar", "crisis", 5, 8, "💪", "La constancia", "Viví una crisis y seguí lanzando (8 temas)", 1,
    function (s) { return s.flags.estuvoEnCrisis && s.lanzamientos >= 8 ? 1 : 0; },
    { fans: 15000, popularity: 4, money: 6000 },
    "🎯 Misión completada: La constancia. Ni la crisis paró tu música.");
  m("m_cenizas", "crisis", 6, 8, "🦅", "Renacer de las cenizas", "Superá la crisis y volvé con 100.000 fans", 1,
    function (s) { return s.flags.superoCrisis && s.stats.fans >= 100000 ? 1 : 0; },
    { fans: 30000, popularity: 6, money: 10000 },
    "🎯 Misión completada: Renacer de las cenizas. Volviste más grande que antes.");
  m("m_veterano", "crisis", 4, 7, "🎓", "Veterano", "Llevá tu madurez artística a 75", 75, function (s) { return s.experiencia; },
    { talent: 3, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Veterano. Ya no sos el mismo de los primeros años.");
  m("m_madurez", "crisis", 5, 8, "🧠", "Madurez artística", "Llevá tu madurez artística a 90", 90, function (s) { return s.experiencia; },
    { talent: 4, popularity: 3, _relaciones: 4 },
    "🎯 Misión completada: Madurez artística. Tu oficio ya es sabiduría.");
  m("m_recuperar_energia", "crisis", 6, 8, "⚡", "Recuperado", "Sobreviví una crisis y recuperá tu energía", 1,
    function (s) { return s.flags.estuvoEnCrisis && s.energia >= 70 ? 1 : 0; },
    { _energia: 8, popularity: 3, _relaciones: 3 },
    "🎯 Misión completada: Recuperado. Después del fondo, volvió la fuerza.");
  m("m_carrera_larga", "crisis", 6, 8, "🕰️", "Carrera larga", "Llegá al año 15 de carrera", 15, function (s) { return s.año; },
    { popularity: 4, money: 10000, _relaciones: 4 },
    "🎯 Misión completada: Carrera larga. Quince años y seguís vigente.");
  m("m_perdurar", "crisis", 7, 8, "🏛️", "Seguir en pie", "Llegá al año 20 de carrera", 20, function (s) { return s.año; },
    { popularity: 5, money: 20000, _relaciones: 5 },
    "🎯 Misión completada: Seguir en pie. Veinte años y la historia no termina.");

  /* ============================================================
     SECCIÓN 10 — HITOS DE LA CARRERA (etapa 1-8)
     ============================================================ */
  m("m_fama", "hitos", 1, 4, "🌱", "Primer público", "Llegá a 10.000 fans", 10000, function (s) { return s.stats.fans; },
    { money: 3000, popularity: 4, _relaciones: 3 },
    "🎯 Misión completada: Primer público. 10.000 personas te escuchan.");
  m("m_fans_100k", "hitos", 4, 6, "🚀", "Los primeros cien mil", "Llegá a 100.000 fans", 100000, function (s) { return s.stats.fans; },
    { popularity: 5, money: 6000, _relaciones: 2 },
    "🎯 Misión completada: Los primeros cien mil. Tu nombre ya es masivo.");
  m("m_fans_500k", "hitos", 5, 7, "🚀", "Medio millón", "Llegá a 500.000 fans", 500000, function (s) { return s.stats.fans; },
    { popularity: 6, money: 12000, fans: 10000 },
    "🎯 Misión completada: Medio millón. Quinientas mil personas te siguen.");
  m("m_fans_5m", "hitos", 7, 8, "🌊", "Cinco millones", "Llegá a 5 millones de fans", 5000000, function (s) { return s.stats.fans; },
    { popularity: 7, money: 30000, _relaciones: 3 },
    "🎯 Misión completada: Cinco millones. Una multitud lleva tu nombre.");
  m("m_discografia", "hitos", 1, 4, "💿", "No parar", "Lanzá 5 temas", 5, function (s) { return s.lanzamientos; },
    { talent: 1, popularity: 2, money: 1500 },
    "🎯 Misión completada: No parar. Cinco temas y la disciplina se nota.");
  m("m_premio_1", "hitos", 3, 6, "🏆", "El reconocimiento", "Ganá 1 premio", 1, function (s) { return s.totalPremios; },
    { fans: 10000, money: 8000, popularity: 4 },
    "🎯 Misión completada: El reconocimiento. Tu nombre ya está entre los premiados.");
  m("m_premios_3", "hitos", 4, 7, "🏆", "Cosecha de premios", "Ganá 3 premios", 3, function (s) { return s.totalPremios; },
    { fans: 25000, money: 15000, popularity: 5 },
    "🎯 Misión completada: Cosecha de premios. La vitrina se llena.");
  m("m_premios_5", "hitos", 5, 8, "🏆", "Vitrina llena", "Ganá 5 premios", 5, function (s) { return s.totalPremios; },
    { fans: 40000, money: 25000, popularity: 6 },
    "🎯 Misión completada: Vitrina llena. Cinco premios y el peso de la fama.");
  m("m_nivel_4", "hitos", 3, 5, "📈", "Salir del under", "Alcanzá el nivel 4 de carrera", 4,
    function (s) { return Under.STATE.nivelCarrera(s).nivel; },
    { popularity: 4, money: 3000, _relaciones: 3 },
    "🎯 Misión completada: Salir del under. La industria ya te mira.");
  m("m_nivel_6", "hitos", 5, 7, "📈", "Estrella internacional", "Alcanzá el nivel 6 de carrera", 6,
    function (s) { return Under.STATE.nivelCarrera(s).nivel; },
    { popularity: 5, money: 10000, _relaciones: 3 },
    "🎯 Misión completada: Estrella internacional. Tu nombre cruza fronteras.");
  m("m_salir_under", "hitos", 3, 5, "🌅", "Dejó el underground", "Salí del underground", 1,
    function (s) { return s.flags.salioDelUnderground ? 1 : 0; },
    { popularity: 5, fans: 10000, money: 5000 },
    "🎯 Misión completada: Dejó el underground. El under te llora y la industria te recibe.");
  m("m_repros_100m", "hitos", 7, 8, "🎧", "Cien millones de reproducciones", "Pasá los 100 millones de reproducciones", 100000000,
    function (s) { return s.totalReproducciones; },
    { fans: 60000, money: 30000, popularity: 6 },
    "🎯 Misión completada: Cien millones. Tu música vive en un siglo de oídos.");
  m("m_repros_500m", "hitos", 8, 8, "🎧", "Medio billón", "Pasá los 500 millones de reproducciones", 500000000,
    function (s) { return s.totalReproducciones; },
    { fans: 100000, money: 50000, popularity: 7 },
    "🎯 Misión completada: Medio billón. Tu música ya es parte del mundo.");
  m("m_decadas", "hitos", 5, 8, "🎲", "Trescientas decisiones", "Tomá 300 decisiones en tu carrera", 300,
    function (s) { return s.decisionesTomadas; },
    { popularity: 4, money: 10000, _relaciones: 3 },
    "🎯 Misión completada: Trescientas decisiones. Cada una te trajo hasta acá.");
  (function () {
    Under.DATA.PREMIOS.forEach(function (p) {
      m("m_premio_" + p.id, "hitos", p.nivelMin, 8, "🏆", "Ganar: " + p.nombre, "Ganá el premio " + p.nombre.toLowerCase(), 1,
        function (pid) { return function (s) { return (s.premios || []).filter(function (x) { return x.id === pid; }).length; }; }(p.id),
        { fans: Math.round(p.fans * 0.5), money: Math.round(p.premio * 0.5), popularity: p.popularidad },
        "🎯 Misión completada: Ganaste " + p.nombre + ".");
    });
  })();

  /* ============================================================
     LOTE 2 — MÁS MISIONES (caras nuevas de cada sección)
     ============================================================ */
  /* Grind: la constancia del under */
  m("m2_grind_60", "grind", 2, 6, "🎛️", "Sangre en las tablas", "Tomá 60 decisiones del underground", 60, "grind",
    { popularity: 5, talent: 4, money: 8000 },
    "🎯 Misión completada: Sangre en las tablas. Cada bar de la zona te reconoce.");
  m("m2_grind_90", "grind", 3, 7, "🎛️", "El under te late", "Tomá 90 decisiones del underground", 90, "grind",
    { popularity: 6, talent: 5, money: 12000 },
    "🎯 Misión completada: El under te late. Tu nombre es parte del paisaje.");
  m("m2_toques_15", "grind", 3, 6, "🎤", "Dueño de la noche", "Tocá en 15 toques de la escena", 15, "toques",
    { fans: 30000, popularity: 5, _energia: 8 },
    "🎯 Misión completada: Dueño de la noche. Los bares pelean por tu fecha.");
  m("m2_radio_8", "grind", 3, 6, "📻", "La voz que no se calla", "Dá 8 entrevistas en radios de la escena", 8, "radio",
    { fans: 12000, popularity: 5, money: 2500 },
    "🎯 Misión completada: La voz que no se calla. Tu historia ya se cuenta sola.");
  m("m2_maqueta_3", "grind", 3, 5, "💽", "Cinta tras cinta", "Grabá 3 maquetas", 3, "maqueta",
    { fans: 10000, popularity: 4, money: 1500 },
    "🎯 Misión completada: Cinta tras cinta. Tu material corre de mano en mano.");
  m("m2_freestyle_10", "grind", 3, 6, "🔥", "Sin techo", "Ganá 10 batallas de freestyle", 10, "freestyle",
    { talent: 4, popularity: 6, fans: 20000 },
    "🎯 Misión completada: Sin techo. En La Sobre ya no te quieren enfrentar.");

  /* Música: catálogo que crece */
  m("m2_temas_30", "musica", 5, 8, "💿", "Tres décadas de temas", "Lanzá 30 temas", 30, function (s) { return s.lanzamientos; },
    { popularity: 5, money: 25000, talent: 2 },
    "🎯 Misión completada: Tres décadas de temas. Tu catálogo ya es un archivo.");
  m("m2_temas_40", "musica", 6, 8, "💿", "Máquina imparable", "Lanzá 40 temas", 40, function (s) { return s.lanzamientos; },
    { popularity: 6, money: 30000, fans: 40000 },
    "🎯 Misión completada: Máquina imparable. No hay año sin música tuya.");
  m("m2_albums_5", "musica", 6, 8, "💽", "La obra mayor", "Editá 5 proyectos", 5, function (s) { return s.totalAlbums; },
    { fans: 50000, popularity: 6, money: 25000 },
    "🎯 Misión completada: La obra mayor. Cinco proyectos que se sostienen solos.");
  m("m2_repros_200m", "musica", 7, 8, "🎧", "Doscientos millones", "Pasá los 200 millones de reproducciones", 200000000,
    function (s) { return s.totalReproducciones; },
    { fans: 80000, money: 35000, popularity: 6 },
    "🎯 Misión completada: Doscientos millones. Tu música ya es parte del aire.");
  m("m2_critica_alta", "musica", 5, 8, "🎚️", "El respeto de los entendidos", "Sacá 3 temas con crítica alta", 3,
    function (s) { return (s.discografia || []).filter(function (d) { return d.critica >= 4.5; }).length; },
    { talent: 3, popularity: 4, _relaciones: 4 },
    "🎯 Misión completada: El respeto de los entendidos. Tu sonido ya es referencia.");
  m("m2_triple_hito", "musica", 7, 8, "🏅", "Los tres grandes", "Lográ un hit, un viral y un global", 1,
    function (s) { return s.flags.tuvoHit && s.flags.tuvoViral && s.flags.tuvoGlobal ? 1 : 0; },
    { popularity: 8, money: 40000, fans: 60000 },
    "🎯 Misión completada: Los tres grandes. Tu música vive en todas las ligas.");

  /* Escena: el vivo se agiganta */
  m("m2_giras_10", "escena", 6, 8, "🎪", "Una década de ruta", "Hacé 10 giras", 10, function (s) { return s.totalGiras; },
    { fans: 70000, money: 25000, popularity: 5 },
    "🎯 Misión completada: Una década de ruta. La carretera es tu casa.");
  m("m2_fest_10", "escena", 7, 8, "🎪", "Rey de la escena", "Tocá en 10 shows en lugares del under", 10, function (s) { return s.totalFestivales; },
    { fans: 80000, popularity: 7, _legado: 10 },
    "🎯 Misión completada: Rey de la escena. Todos los lugares del under te quieren.");
  m("m2_vivo_20", "escena", 6, 8, "🎤", "Nacido para el escenario", "Sumá 20 shows entre giras y fechas del under", 20,
    function (s) { return (s.totalGiras || 0) + (s.totalFestivales || 0); },
    { fans: 60000, popularity: 6, money: 25000 },
    "🎯 Misión completada: Nacido para el escenario. Veinte noches y pedís más.");

  /* Industria: el negocio de tu carrera */
  m("m2_sello_menor", "industria", 4, 7, "🏢", "Contrato a tu favor", "Firmá con menos de 30% de retención", 1,
    function (s) { return s.sello && s.sello.retencion <= 0.3 ? 1 : 0; },
    { money: 12000, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: Contrato a tu favor. Aprendiste a leer la letra chica.");
  m("m2_sello_largo", "industria", 5, 8, "🏢", "Casa de años", "Mantené tu sello 5 años seguidos", 1,
    function (s) { return s.sello && s.año - s.sello.año >= 5 ? 1 : 0; },
    { money: 20000, popularity: 4, _relaciones: 6 },
    "🎯 Misión completada: Casa de años. Cinco años con la misma gente y creciendo.");
  m("m2_independencia_6", "industria", 6, 8, "🚀", "Rey de tu propio camino", "Crece hasta nivel 6 sin sello", 1,
    function (s) { return !s.sello && Under.STATE.nivelCarrera(s).nivel >= 6 ? 1 : 0; },
    { popularity: 5, _relaciones: 6, money: 15000 },
    "🎯 Misión completada: Rey de tu propio camino. Nivel alto con tus reglas.");

  /* Red: alianzas y escena */
  m("m2_colabs_12", "red", 6, 8, "🤝", "Tejido de voces", "Hacé 12 colaboraciones", 12, function (s) { return s.totalColabs; },
    { fans: 70000, popularity: 6, money: 15000 },
    "🎯 Misión completada: Tejido de voces. Media industria ya pasó por tus temas.");
  m("m2_red_9", "red", 5, 8, "🕸️", "Nudo de contactos", "Tené 9 contactos activos en tu red", 9,
    function (s) { return (s.red || []).filter(function (c) { return c.activo; }).length; },
    { _relaciones: 7, popularity: 4, money: 5000 },
    "🎯 Misión completada: Nudo de contactos. Todo el mundo te abre una puerta.");
  m("m2_red_culto", "red", 4, 7, "🎯", "Los raros te respetan", "Tené un contacto de culto en tu red", 1,
    function (s) { return (s.red || []).some(function (c) { return c.rol === "culto" && c.activo; }) ? 1 : 0; },
    { talent: 3, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: Los raros te respetan. La escena de culto te bancó.");
  m("m2_memoria_buena_6", "red", 5, 8, "💾", "Cuentos que quedan", "Viví 6 momentos que la escena recuerde bien", 6,
    function (s) { return (s.memorias || []).filter(function (x) { return x.tono === "buena"; }).length; },
    { popularity: 5, _relaciones: 6, money: 5000 },
    "🎯 Misión completada: Cuentos que quedan. Tu historia se cuenta con orgullo.");
  m("m2_memoria_mala", "red", 2, 5, "🕯️", "Sobrevivir al chisme", "Viví un momento que la escena recuerde mal", 1,
    function (s) { return (s.memorias || []).filter(function (x) { return x.tono === "mala"; }).length; },
    { popularity: 3, _relaciones: 3, money: 2000 },
    "🎯 Misión completada: Sobrevivir al chisme. Lo malo también se aprende.");

  /* Público: multitudes y fama */
  m("m2_fans_750k", "publico", 5, 7, "👥", "Tres cuartos de millón", "Llegá a 750.000 fans", 750000, function (s) { return s.stats.fans; },
    { popularity: 5, money: 15000, fans: 15000 },
    "🎯 Misión completada: Tres cuartos de millón. Tu nombre ya es una marca.");
  m("m2_fans_3m", "publico", 7, 8, "👥", "Marea de millones", "Llegá a 3 millones de fans", 3000000, function (s) { return s.stats.fans; },
    { popularity: 7, money: 35000, fans: 50000 },
    "🎯 Misión completada: Marea de millones. Tres millones de personas te siguen.");
  m("m2_fieles_100k", "publico", 7, 8, "🤝", "Cien mil que nunca se van", "Tené 100.000 fans fieles", 100000, function (s) { return s.fansFieles || 0; },
    { fans: 50000, _relaciones: 7, popularity: 5 },
    "🎯 Misión completada: Cien mil que nunca se van. Tu base es una familia.");
  m("m2_hype_90", "publico", 5, 8, "🔥", "Apagando el mundo", "Llevá tu hype a 90", 90, function (s) { return s.hype; },
    { fans: 25000, popularity: 6, money: 10000 },
    "🎯 Misión completada: Apagando el mundo. El planeta solo habla de vos.");
  m("m2_haters_1000", "publico", 6, 8, "💢", "Mil que te odian", "Acumulá 1.000 haters", 1000, function (s) { return s.haters || 0; },
    { popularity: 5, money: 8000, fans: 15000 },
    "🎯 Misión completada: Mil que te odian. Si te odian mil, importás de verdad.");
  m("m2_reputacion_60", "publico", 3, 6, "🤝", "La escena te respeta", "Llevá tu reputación a 60", 60, function (s) { return s.reputacion; },
    { popularity: 4, _relaciones: 5, money: 4000 },
    "🎯 Misión completada: La escena te respeta. Tu palabra empieza a pesar.");

  /* Vida: bienestar y dinero que trabaja */
  m("m2_energia_90", "vida", 4, 7, "⚡", "Rendimiento total", "Mantené tu energía en 90", 90, function (s) { return s.energia; },
    { _energia: 10, popularity: 3, money: 3000 },
    "🎯 Misión completada: Rendimiento total. Tu cuerpo aguanta lo que venga.");
  m("m2_relaciones_60", "vida", 2, 5, "💚", "Rodeado de los tuyos", "Llevá tu vida personal a 60", 60, function (s) { return s.relaciones; },
    { _relaciones: 6, money: 2500, popularity: 2 },
    "🎯 Misión completada: Rodeado de los tuyos. Tu gente está cerca.");
  m("m2_escandalo_leve_3", "vida", 3, 6, "🌫️", "Tormentas chicas", "Superá 3 polémicas leves", 3,
    function (s) { return (s.escandalos || []).filter(function (e) { return e.gravedad === "leve"; }).length; },
    { popularity: 3, _relaciones: 4, money: 3000 },
    "🎯 Misión completada: Tormentas chicas. Las polémicas te resbalan.");
  m("m2_inv_4", "vida", 6, 8, "📈", "Imperio de inversiones", "Hacé 4 inversiones", 4, function (s) { return s.totalInversiones; },
    { money: 15000, _relaciones: 4, popularity: 3 },
    "🎯 Misión completada: Imperio de inversiones. Tu plata trabaja en serio.");
  m("m2_balance_60", "vida", 3, 6, "⚖️", "Vida en equilibrio", "Mantené energía y vida personal en 60", 1,
    function (s) { return s.energia >= 60 && s.relaciones >= 60 ? 1 : 0; },
    { _energia: 6, _relaciones: 6, money: 3000 },
    "🎯 Misión completada: Vida en equilibrio. Cuerpo y corazón en paz.");

  /* Internacional: el mundo entero */
  m("m2_reputacion_90", "internacional", 7, 8, "👑", "Palabra pesada", "Llevá tu reputación a 90", 90, function (s) { return s.reputacion; },
    { popularity: 6, _relaciones: 7, money: 20000 },
    "🎯 Misión completada: Palabra pesada. Tu opinión mueve la industria.");
  m("m2_legado_150", "internacional", 7, 8, "📜", "Un siglo de nombre", "Acumulá 150 de legado", 150, function (s) { return s.legado; },
    { popularity: 7, money: 30000, _relaciones: 5 },
    "🎯 Misión completada: Un siglo de nombre. Tu legado ya es historia.");
  m("m2_global_4m", "internacional", 7, 8, "🌍", "El mapa completo", "Nivel 8 con 4 mercados conquistados", 1,
    function (s) { return Under.STATE.nivelCarrera(s).nivel >= 8 && s.mercados.length >= 4 ? 1 : 0; },
    { popularity: 8, money: 40000, _relaciones: 5 },
    "🎯 Misión completada: El mapa completo. No queda rincón sin tu música.");
  m("m2_exterior_fama", "internacional", 5, 7, "🌎", "Fama que cruza", "Nivel 6 con 2 mercados conquistados", 1,
    function (s) { return Under.STATE.nivelCarrera(s).nivel >= 6 && s.mercados.length >= 2 ? 1 : 0; },
    { fans: 30000, popularity: 5, money: 12000 },
    "🎯 Misión completada: Fama que cruza. Tu nombre ya no tiene fronteras.");

  /* Crisis: resistencia y renacer */
  m("m2_anios_crisis_3", "crisis", 5, 8, "⏳", "El año más duro", "Sobreviví 3 años en crisis", 3, function (s) { return s.aniosEnCrisis; },
    { popularity: 5, _relaciones: 5, money: 5000 },
    "🎯 Misión completada: El año más duro. Tres años abajo y seguís en pie.");
  m("m2_vuelta_20", "crisis", 6, 8, "🌄", "Volver y escribir", "Superá la crisis y seguí lanzando (20 temas)", 1,
    function (s) { return s.flags.superoCrisis && s.lanzamientos >= 20 ? 1 : 0; },
    { fans: 30000, popularity: 5, money: 12000 },
    "🎯 Misión completada: Volver y escribir. El estudio nunca se apagó.");
  m("m2_estabilidad_5", "crisis", 6, 8, "🛡️", "Cinco años sin caer", "Llegá al año 8 sin crisis", 1,
    function (s) { return !s.flags.estuvoEnCrisis && s.año >= 8 ? 1 : 0; },
    { popularity: 5, _relaciones: 5, money: 10000 },
    "🎯 Misión completada: Cinco años sin caer. Tu carrera es una roca.");
  m("m2_documental_3", "crisis", 8, 8, "🎬", "Tu historia vale tres", "Que cuenten tu historia en 3 documentales", 3, function (s) { return s.documentales; },
    { popularity: 7, _relaciones: 6, money: 25000 },
    "🎯 Misión completada: Tu historia vale tres. Tu vida ya es serie.");
  m("m2_legado_60", "crisis", 6, 8, "📜", "Huella profunda", "Acumulá 60 de legado", 60, function (s) { return s.legado; },
    { popularity: 5, money: 15000, _relaciones: 4 },
    "🎯 Misión completada: Huella profunda. Tu nombre dejó marca para siempre.");

  /* Hitos: números que marcan la carrera */
  m("m2_premios_7", "hitos", 7, 8, "🏆", "Ganar en serio", "Ganá 7 premios", 7, function (s) { return s.totalPremios; },
    { fans: 50000, money: 30000, popularity: 6 },
    "🎯 Misión completada: Ganar en serio. La vitrina ya no tiene lugar.");
  m("m2_nivel_7", "hitos", 6, 8, "📈", "Superestrella", "Alcanzá el nivel 7 de carrera", 7,
    function (s) { return Under.STATE.nivelCarrera(s).nivel; },
    { popularity: 6, money: 25000, _relaciones: 4 },
    "🎯 Misión completada: Superestrella. Rompés récords en todo el mundo.");
  m("m2_decadas_500", "hitos", 6, 8, "🎲", "Quinientas decisiones", "Tomá 500 decisiones en tu carrera", 500,
    function (s) { return s.decisionesTomadas; },
    { popularity: 5, money: 20000, _relaciones: 4 },
    "🎯 Misión completada: Quinientas decisiones. Cada una te trajo hasta acá.");
  m("m2_legado_200", "hitos", 8, 8, "🏛️", "Dos siglos de legado", "Acumulá 200 de legado", 200, function (s) { return s.legado; },
    { popularity: 8, money: 50000, _relaciones: 6 },
    "🎯 Misión completada: Dos siglos de legado. Ya sos inmortal.");
  m("m2_carrera_completa", "hitos", 8, 8, "🎓", "La carrera completa", "Llegá al año 25 de carrera", 25, function (s) { return s.año; },
    { popularity: 8, money: 60000, _relaciones: 7 },
    "🎯 Misión completada: La carrera completa. Veinticinco años y una leyenda.");

  /* ============================================================
     LOTE 3 — EL UNDER, MÁS VIVO (caras nuevas del bajo tierra)
     Misiones que miden la vida real del underground: ensayos,
     cyphers, teloneros, ferias, talleres, movidas de barrio y
     todo lo que pasa cuando todavía nadie te conoce.
     ============================================================ */
  /* Grind: la constancia del under */
  m("m3_grind_30", "grind", 1, 4, "🌑", "La cara del under", "Tomá 30 decisiones del underground", 30, "grind",
    { talent: 3, popularity: 3, money: 2500 },
    "🎯 Misión completada: La cara del under. Todo el circuito bajo tierra te ubica.");
  m("m3_grind_75", "grind", 3, 6, "🌑", "La vida bajo tierra", "Tomá 75 decisiones del underground", 75, "grind",
    { talent: 5, popularity: 5, money: 9000 },
    "🎯 Misión completada: La vida bajo tierra. El under te late en la sangre.");
  m("m3_toques_15", "grind", 2, 5, "🎤", "El dueño del viernes", "Tocá en 15 toques de la escena", 15, "toques",
    { fans: 20000, popularity: 5, money: 2000 },
    "🎯 Misión completada: El dueño del viernes. Los bares pelean por tu fecha.");
  m("m3_radio_10", "grind", 2, 5, "📻", "La voz que se repite", "Dá 10 entrevistas en radios de la escena", 10, "radio",
    { fans: 15000, popularity: 5, money: 3000 },
    "🎯 Misión completada: La voz que se repite. Ya te reconocen por el teléfono.");
  m("m3_freestyle_12", "grind", 2, 5, "🔥", "Sin rival en La Sobre", "Ganá 12 batallas de freestyle", 12, "freestyle",
    { talent: 4, popularity: 6, fans: 18000 },
    "🎯 Misión completada: Sin rival en La Sobre. Ya nadie quiere subir a medirse con vos.");
  m("m3_maqueta_4", "grind", 2, 4, "💽", "Cintas que vuelan", "Grabá 4 maquetas", 4, "maqueta",
    { fans: 12000, popularity: 4, money: 2000 },
    "🎯 Misión completada: Cintas que vuelan. Tu material viaja de mano en mano.");
  m("m3_cypher_4", "grind", 1, 4, "🌀", "La sesión de la escena", "Sumate a 4 cyphers", 4, "cypher",
    { talent: 3, popularity: 4, fans: 8000 },
    "🎯 Misión completada: La sesión de la escena. Tu verso ya se espera en cada ronda.");
  m("m3_telonero_3", "grind", 2, 5, "🎪", "El que abre la noche", "Abrí 3 shows de artistas más grandes", 3, "telonero",
    { fans: 15000, popularity: 5, money: 1500 },
    "🎯 Misión completada: El que abre la noche. Ya te eligen para calentar el escenario.");
  m("m3_ensayo_8", "grind", 1, 4, "🎹", "La disciplina del estudio", "Ensayá en serio 8 veces", 8, "ensayo",
    { talent: 4, popularity: 2, _energia: 6 },
    "🎯 Misión completada: La disciplina del estudio. El sonido se hace repitiendo.");

  /* Escena: el vivo del under */
  m("m3_fiesta_3", "escena", 1, 4, "🎉", "Noches que pagan", "Tocá en 3 fiestas privadas", 3, "fiesta",
    { money: 3500, fans: 3000, _energia: 5 },
    "🎯 Misión completada: Noches que pagan. La plata en mano del under también existe.");
  m("m3_banda_4", "escena", 2, 5, "🎸", "Músico de confianza", "Tocá 4 veces como músico de sesión", 4, "banda",
    { talent: 4, money: 2500, _relaciones: 4 },
    "🎯 Misión completada: Músico de confianza. Todos te llaman cuando necesitan a alguien serio.");
  m("m3_vivo_25", "escena", 3, 6, "🎤", "Veinticinco noches en vivo", "Sumá 25 shows entre toques, teloneros, fiestas y giras", 25,
    function (s) {
      var c = s.contadores || {};
      return (c.toques || 0) + (c.telonero || 0) + (c.fiesta || 0) + (s.totalGiras || 0);
    },
    { fans: 25000, popularity: 5, money: 6000 },
    "🎯 Misión completada: Veinticinco noches en vivo. El escenario es tu casa.");

  /* Red: la red del under */
  m("m3_colega_4", "red", 1, 4, "🤝", "Cantar con los tuyos", "Grabá 4 temas con Killpay, tu colega del under", 4, "colega",
    { talent: 3, popularity: 3, fans: 6000 },
    "🎯 Misión completada: Cantar con los tuyos. Killpay y vos hacen sonar a la escena.");
  m("m3_referente_2", "red", 1, 4, "🧓", "Sabiduría de viejo", "Aprendé de 2 referentes de la escena", 2, "referente",
    { talent: 4, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: Sabiduría de viejo. Los veteranos te anotan en su radar.");
  m("m3_taller_3", "red", 1, 4, "📚", "El maestro del barrio", "Dá 3 talleres en tu zona", 3, "taller",
    { talent: 3, _relaciones: 6, fans: 4000 },
    "🎯 Misión completada: El maestro del barrio. Enseñar también te formó a vos.");
  m("m3_movida_2", "red", 2, 5, "🚩", "Dos movidas tuyas", "Que 2 movidas adopten tus temas", 2, "movida",
    { fans: 12000, popularity: 5, _relaciones: 5 },
    "🎯 Misión completada: Dos movidas tuyas. Tu música ya es bandera.");
  m("m3_contenido_4", "red", 1, 4, "📱", "La máquina de contenido", "Colaborá 4 veces con creadores", 4, "contenido",
    { fans: 8000, popularity: 4, money: 1000 },
    "🎯 Misión completada: La máquina de contenido. Tu música ya vive en los reels.");
  m("m3_feria_3", "red", 1, 4, "🧺", "El que vende en la feria", "Vendé 3 veces en ferias del barrio", 3, "feria",
    { money: 2500, fans: 3000, _relaciones: 4 },
    "🎯 Misión completada: El que vende en la feria. Tu nombre corre por los puestos.");
  m("m3_barrio_3", "red", 1, 4, "🏘️", "Himno del barrio", "Que el barrio haga suyos 3 temas tuyos", 3, "barrio",
    { fans: 15000, popularity: 4, _relaciones: 5 },
    "🎯 Misión completada: Himno del barrio. Tres temas que ya no son tuyos: son de la zona.");

  /* Público: el under que se entera */
  m("m3_fans_25k", "publico", 1, 4, "👥", "Veinticinco mil oídos", "Llegá a 25.000 fans", 25000, function (s) { return s.stats.fans; },
    { popularity: 3, money: 2500, fans: 2000 },
    "🎯 Misión completada: Veinticinco mil oídos. Hay gente que espera tu próximo tema.");
  m("m3_fans_100k", "publico", 3, 6, "👥", "Cien mil que te siguen", "Llegá a 100.000 fans", 100000, function (s) { return s.stats.fans; },
    { popularity: 5, money: 8000, fans: 5000 },
    "🎯 Misión completada: Cien mil que te siguen. Tu nombre ya pesa en la escena.");
  m("m3_fieles_20k", "publico", 3, 6, "🤝", "La base que no se va", "Tené 20.000 fans fieles", 20000, function (s) { return s.fansFieles || 0; },
    { fans: 15000, _relaciones: 5, popularity: 3 },
    "🎯 Misión completada: La base que no se va. Esos no se bajan nunca.");
  m("m3_hype_45", "publico", 2, 5, "🔥", "Prender la mecha", "Llevá tu hype a 45", 45, function (s) { return s.hype; },
    { fans: 8000, popularity: 4, money: 3000 },
    "🎯 Misión completada: Prender la mecha. La escena empieza a hablar de vos.");
  m("m3_haters_60", "publico", 2, 5, "💢", "Ya te odian un poco", "Acumulá 60 haters", 60, function (s) { return s.haters || 0; },
    { popularity: 4, fans: 6000, money: 2000 },
    "🎯 Misión completada: Ya te odian un poco. Si te odian, es que importás.");

  /* Vida: el under también desgasta */
  m("m3_energia_80", "vida", 2, 5, "⚡", "Motor bien aceitado", "Mantené tu energía en 80", 80, function (s) { return s.energia; },
    { _energia: 10, popularity: 2, money: 2000 },
    "🎯 Misión completada: Motor bien aceitado. El ritmo del under no te quiebra.");
  m("m3_agotado", "vida", 2, 5, "🛏️", "Sobrevivir a la pausa", "Pasá por un agotamiento y volvé", 1,
    function (s) { return s.flags.agotado ? 1 : 0; },
    { _energia: 8, _relaciones: 4, money: 2000 },
    "🎯 Misión completada: Sobrevivir a la pausa. El cuerpo te frenó, pero volviste.");
  m("m3_relaciones_45", "vida", 1, 4, "💚", "Los tuyos cerca", "Llevá tu vida personal a 45", 45, function (s) { return s.relaciones; },
    { _relaciones: 5, _energia: 5, money: 1500 },
    "🎯 Misión completada: Los tuyos cerca. No todo es el escenario.");

  /* Música: el catálogo del under */
  m("m3_temas_15", "musica", 3, 6, "💿", "Quince y sumando", "Lanzá 15 temas", 15, function (s) { return s.lanzamientos; },
    { popularity: 4, money: 6000, talent: 1 },
    "🎯 Misión completada: Quince y sumando. Tu catálogo ya tiene cuerpo.");
  m("m3_repros_1m", "musica", 4, 6, "🎧", "El primer millón", "Pasá el millón de reproducciones", 1000000,
    function (s) { return s.totalReproducciones; },
    { fans: 20000, popularity: 5, money: 8000 },
    "🎯 Misión completada: El primer millón. Tu música ya se escuchó en serio.");

  /* ============================================================
     LOTE 4 — ROTACIÓN Y ESCENAS NUEVAS (salas, ciclos, artistas)
     ============================================================ */
  /* Grind: las salas de la escena */
  m("m4_salas_6", "grind", 1, 4, "🎟️", "Dueño de la sala", "Tocá en 6 salas de la escena", 6, "salas",
    { fans: 12000, popularity: 5, money: 3000, _energia: 8 },
    "🎯 Misión completada: Dueño de la sala. La escena ya sabe cómo suena tu nombre en las salas.");
  m("m4_salas_12", "grind", 3, 6, "🎟️", "La casa es tuya", "Tocá en 12 salas de la escena", 12, "salas",
    { fans: 25000, popularity: 5, money: 8000, _energia: 10 },
    "🎯 Misión completada: La casa es tuya. Hay salas que te piden volver apenas terminás de tocar.");
  m("m4_ciclos_2", "grind", 1, 4, "🎪", "Parte del circuito", "Participá en 2 ciclos del barrio", 2, "ciclos",
    { fans: 8000, popularity: 4, _relaciones: 4 },
    "🎯 Misión completada: Parte del circuito. Los ciclos te empiezan a llamar para la próxima edición.");

  /* Escena: más escenarios, más fechas */
  m("m4_ciclos_5", "escena", 2, 5, "🎪", "Reina del ciclo", "Participá en 5 ciclos del barrio", 5, "ciclos",
    { fans: 20000, popularity: 5, money: 5000, _energia: 8 },
    "🎯 Misión completada: Reina del ciclo. La escena ya te pone al frente del cartel.");

  /* Red: los artistas nuevos que te cruzás bajo tierra */
  m("m4_artistas_8", "red", 1, 4, "🤝", "Cara nueva por semana", "Conocé 8 artistas de la escena", 8, "artistas",
    { _relaciones: 5, talent: 2, fans: 6000 },
    "🎯 Misión completada: Cara nueva por semana. Tu agenda del under está llena de nombres.");
  m("m4_artistas_20", "red", 3, 6, "🤝", "El que conoce a todos", "Conocé 20 artistas de la escena", 20, "artistas",
    { _relaciones: 6, talent: 3, fans: 15000 },
    "🎯 Misión completada: El que conoce a todos. Si se arma algo en el under, tu nombre suena.");

  /* Público: la base y el contenido */
  m("m4_contenido_8", "publico", 1, 4, "📱", "Cara en los reels", "Publicá 8 contenidos con la escena", 8, "contenido",
    { fans: 12000, popularity: 4, money: 2000 },
    "🎯 Misión completada: Cara en los reels. Tu nombre ya aparece en los feed de la zona.");
  m("m4_fieles_40k", "publico", 3, 6, "🤝", "La base crece", "Tené 40.000 fans fieles", 40000, function (s) { return s.fansFieles || 0; },
    { fans: 25000, _relaciones: 5, popularity: 4 },
    "🎯 Misión completada: La base crece. Los fieles ya son una multitud que no se va.");

  /* Vida: el under te exige pero vos seguís */
  m("m4_relaciones_70", "vida", 2, 6, "💚", "Casa llena de los tuyos", "Llevá tu vida personal a 70", 70, function (s) { return s.relaciones; },
    { _relaciones: 6, _energia: 8, money: 3000 },
    "🎯 Misión completada: Casa llena de los tuyos. El éxito no se llevó a nadie.");
  m("m4_energia_90", "vida", 3, 6, "⚡", "Imparable", "Mantené tu energía en 90", 90, function (s) { return s.energia; },
    { _energia: 12, popularity: 3, money: 3000 },
    "🎯 Misión completada: Imparable. Ni el grind ni la fama te doblan.");

  /* Música: el catálogo sigue creciendo */
  m("m4_temas_25", "musica", 5, 8, "💿", "Veinticinco joyas", "Lanzá 25 temas", 25, function (s) { return s.lanzamientos; },
    { popularity: 4, money: 9000, talent: 2 },
    "🎯 Misión completada: Veinticinco joyas. Tu catálogo ya pesa en cualquier conversación.");
  m("m4_repros_5m", "musica", 5, 8, "🎧", "Cinco millones", "Pasá los cinco millones de reproducciones", 5000000,
    function (s) { return s.totalReproducciones; },
    { fans: 40000, popularity: 6, money: 12000 },
    "🎯 Misión completada: Cinco millones. Tu música ya dio la vuelta al mundo más de una vez.");

  /* ============================================================
     METADATOS DE SECCIONES (nombre + tope de misiones activas)
     ============================================================ */
  var SECCIONES = {
    grind:         { nombre: "🌑 Grind bajo tierra",            cap: 3 },
    musica:        { nombre: "🎵 Hacer música",                 cap: 3 },
    escena:        { nombre: "🎪 Giras y escenarios",           cap: 3 },
    industria:     { nombre: "🏢 Sello e industria",            cap: 3 },
    red:           { nombre: "🕸️ La red y colaboraciones",      cap: 3 },
    publico:       { nombre: "💜 El público",                   cap: 3 },
    vida:          { nombre: "💛 Vida y bienestar",             cap: 3 },
    internacional: { nombre: "🌎 Salir al mundo",               cap: 3 },
    crisis:        { nombre: "🔄 Crisis y reinvención",         cap: 3 },
    hitos:         { nombre: "🏆 Hitos de la carrera",          cap: 3 }
  };

  function _def(id) {
    for (var i = 0; i < DEFS.length; i++) {
      if (DEFS[i].id === id) return DEFS[i];
    }
    return null;
  }

  /* ¿La misión puede aparecer en la etapa actual (nivel 1-8)?
     El año 1 arranca en nivel 0 (CAREER_LEVELS[0]): se lo trata
     como etapa 1 para que la primera mano ya ofrezca misiones
     del under y no aparezca vacía hasta subir de nivel. */
  function _elegible(def, state) {
    var nivel = Under.STATE.nivelCarrera(state).nivel;
    if (nivel < 1) nivel = 1;
    /* Los primeros 3 años son SOLO del under: nada de sellos,
       internacional ni crisis hasta que la carrera cruce esa puerta. */
    if (state.año <= 3 &&
        (def.seccion === "industria" || def.seccion === "internacional" || def.seccion === "crisis")) {
      return false;
    }
    if (def.requiere && !def.requiere(state)) return false;
    if (def.etapaMin && nivel < def.etapaMin) return false;
    if (def.etapaMax && nivel > def.etapaMax) return false;
    return true;
  }

  /* Candidatas para una sección: sin usar esta carrera, sin repetir */
  function _candidatas(state, seccion) {
    return DEFS.filter(function (def) {
      if (def.seccion !== seccion) return false;
      if (state.misiones[def.id]) return false;
      if ((state.misionesUsadas || {})[def.id]) return false;
      return Under.MISIONES._elegible(def, state);
    });
  }

  /* Asegura que cada sección tenga hasta "cap" misiones activas */
  function _mantenerActivas(state) {
    if (!state.barajaMisiones) state.barajaMisiones = _crearBaraja();
    var secs = Object.keys(SECCIONES);
    var dibujo = false;
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i];
      var cap = SECCIONES[sec].cap;
      var activas = 0;
      for (var id in state.misiones) {
        if (state.misiones[id].completada) continue;
        var d = Under.MISIONES._def(id);
        if (d && d.seccion === sec) activas++;
      }
      while (activas < cap) {
        var cand = Under.MISIONES._candidatas(state, sec);
        if (!cand.length) break;
        /* En orden de baraja: la candidata que esté más arriba en la
           baraja de esta partida. Así la mano depende de la baraja,
           no de un sorteo por misión. */
        var mejor = cand[0], mejorIdx = Under.MISIONES._indiceEnBaraja(state, cand[0].id);
        for (var j = 1; j < cand.length; j++) {
          var idx = Under.MISIONES._indiceEnBaraja(state, cand[j].id);
          if (idx < mejorIdx) { mejor = cand[j]; mejorIdx = idx; }
        }
        state.misiones[mejor.id] = { completada: false, activaDesde: state.año };
        state.misionesUsadas[mejor.id] = true;
        activas++;
        dibujo = true;
      }
    }
    if (dibujo) Under.MISIONES._registrarVistas(state);
  }

  /* Rota misiones que llevan años clavadas: si una misión activa
     no se completó después de 3 años y va a menos de la mitad de
     su meta, se cambia por otra que todavía no apareció en esta
     carrera. Así la lista siempre ofrece algo nuevo y las misiones
     no se repiten ni se estancan. */
  function rotar(state) {
    if (!state.misiones) return;
    var cambio = false;
    for (var id in state.misiones) {
      var mis = state.misiones[id];
      if (mis.completada) continue;
      var def = Under.MISIONES._def(id);
      if (!def) { delete state.misiones[id]; cambio = true; continue; }
      var anios = state.año - (mis.activaDesde || state.año);
      if (anios < 3) continue;
      var prog = Under.MISIONES._progreso(def, state);
      if (prog >= def.meta * 0.5) continue;
      var cand = Under.MISIONES._candidatas(state, def.seccion);
      if (!cand.length) continue;
      state.misionesUsadas[id] = true;
      delete state.misiones[id];
      cambio = true;
    }
    if (cambio) Under.MISIONES._mantenerActivas(state);
  }

  /* ---- Rotación entre partidas ----
     La baraja de cada partida se arma con las misiones barajadas,
     pero las que ya se ofrecieron en partidas recientes se mandan
     al fondo: así cada carrera arranca con una mano distinta y
     no te tocan siempre las mismas en los primeros años. */
  var RECENTS_KEY = "under_mision_recents";
  var RECENTS_MAX = 40;

  function _leerRecents() {
    try {
      if (typeof localStorage === "undefined") return [];
      var raw = localStorage.getItem(RECENTS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function _guardarRecents(lista) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(RECENTS_KEY, JSON.stringify(lista));
    } catch (e) {}
  }

  /* Registra las misiones que esta partida está ofreciendo como
     "vistas recientes", para que la próxima carrera arranque con
     otras. Se llama cuando la mano se dibuja (año 1 o al reponer). */
  function _registrarVistas(state) {
    var vistas = _leerRecents();
    Under.MISIONES._activas(state).forEach(function (def) {
      if (vistas.indexOf(def.id) === -1) vistas.push(def.id);
    });
    _guardarRecents(vistas.slice(-RECENTS_MAX));
  }

  /* Fisher-Yates con Math.random (el smoke test siembra el PRNG por
     partida, así la baraja es estable partida a partida). */
  function _barajar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Baraja de esta partida: frescas primero, recientes al fondo. */
  function _crearBaraja() {
    var recents = _leerRecents();
    var frescas = [], recientes = [];
    for (var i = 0; i < DEFS.length; i++) {
      var id = DEFS[i].id;
      if (recents.indexOf(id) !== -1) recientes.push(id);
      else frescas.push(id);
    }
    return _barajar(frescas).concat(_barajar(recientes));
  }

  function _indiceEnBaraja(state, id) {
    var b = state.barajaMisiones || [];
    for (var i = 0; i < b.length; i++) {
      if (b[i] === id) return i;
    }
    return Infinity;
  }

  /* Crea el estado de misiones de una partida nueva */
  function _inicializar(state) {
    state.misiones = {};
    state.contadores = {};
    state.misionesUsadas = {};
    state.misionesRotadas = true;
    state.barajaMisiones = _crearBaraja();
    Under.MISIONES._mantenerActivas(state);
  }

  /* Progreso actual de una misión */
  function _progreso(def, state) {
    if (def.actual) return def.actual(state);
    return (state.contadores || {})[def.contador] || 0;
  }

  /* Incrementa un contador y revisa misiones */
  function sumar(state, clave, n) {
    if (!state.contadores) state.contadores = {};
    state.contadores[clave] = (state.contadores[clave] || 0) + (n || 1);
    Under.MISIONES.chequear(state);
  }

  /* Revisa las misiones activas y completa las que corresponda.
     Al completarse una, se repone otra desde el pool sin repetir. */
  function chequear(state) {
    if (!state.misiones) return;
    var huboCompletada = false;
    for (var id in state.misiones) {
      var mis = state.misiones[id];
      if (mis.completada) continue;
      var def = Under.MISIONES._def(id);
      if (!def) { delete state.misiones[id]; continue; }
      if (Under.MISIONES._progreso(def, state) < def.meta) continue;

      mis.completada = true;
      mis.año = state.año;
      if (def.recompensa) Under.SYSTEMS.aplicarEfectos(state, def.recompensa);
      state.historial.push({ año: state.año, texto: def.recompensaTexto });
      if (Under.UI && Under.UI.toast) {
        (function (d) {
          setTimeout(function () {
            Under.UI.toast(d.icono + " Misión completada: " + d.titulo);
          }, 600);
        })(def);
      }
      huboCompletada = true;
    }
    /* Si se completó alguna, se repone; y si la mano quedó vacía
       (años 1 donde la carrera todavía está en nivel 0), se dibuja
       la primera mano en cuanto haya misiones elegibles. */
    if (huboCompletada || Under.MISIONES._activas(state).length === 0) {
      Under.MISIONES._mantenerActivas(state);
    }
  }

  /* Misiones activas (no completadas), en orden de aparición */
  function _activas(state) {
    if (!state.misiones) return [];
    var res = [];
    for (var id in state.misiones) {
      var def = Under.MISIONES._def(id);
      if (def && !state.misiones[id].completada) res.push(def);
    }
    return res;
  }

  /* ---------- Diario de decisiones (PRIORIDAD 10) ----------
     Las opciones elegidas se guardan en state.decisiones cuando
     se resuelve una decisión (systems.ejecutarDecision). Estos
     helpers permiten que las misiones se abran o progresen según
     lo que el jugador decidió en el pasado. */
  function _decidio(state, id, opcion) {
    var ds = (state && state.decisiones) || [];
    for (var i = 0; i < ds.length; i++) {
      if (ds[i].id === id && (opcion === undefined || ds[i].opcion === opcion)) return true;
    }
    return false;
  }

  function _decisiones(state, id) {
    var ds = (state && state.decisiones) || [];
    var n = 0;
    for (var i = 0; i < ds.length; i++) {
      if (ds[i].id === id) n++;
    }
    return n;
  }

  return {
    DEFS: DEFS,
    SECCIONES: SECCIONES,
    _inicializar: _inicializar,
    _mantenerActivas: _mantenerActivas,
    _candidatas: _candidatas,
    _elegible: _elegible,
    _def: _def,
    _progreso: _progreso,
    _activas: _activas,
    _indiceEnBaraja: _indiceEnBaraja,
    _crearBaraja: _crearBaraja,
    _registrarVistas: _registrarVistas,
    rotar: rotar,
    sumar: sumar,
    chequear: chequear,
    _decidio: _decidio,
    _decisiones: _decisiones
  };
})();
