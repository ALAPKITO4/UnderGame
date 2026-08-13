/* ============================================================
   UNDER — DATOS DEL JUEGO (v2)
   Todo el contenido es configurable por objetos.
   Para agregar un género/personalidad/evento/logro nuevo,
   basta con agregar un objeto acá. No hace falta tocar el motor.

   SOLO EXISTEN 3 ESTADÍSTICAS VISIBLES:
   - Popularidad (0-100) → muestra cuántos fans tiene el artista
   - Talento (0-100)
   - Dinero
   ============================================================ */

window.Under = window.Under || {};

Under.DATA = {

  CONFIG: {
    SAVE_KEY: "under_carrera_save_v1",
    SAVE_VERSION: 4,
    AÑOS_MAX: 25,
    EDAD_INICIAL: 18,
    DINERO_INICIAL: 400,
    REGALIA: 0.004, /* dinero por reproducción */

    /* ---- Progresión anual (PRIORIDAD 1) ----
       La madurez artística crece haciendo cosas y con los años.
       El momentum es la inercia de la fama: se carga cuando tu
       popularidad sube y se desinfla solo si no la alimentás. */
    EXPERIENCIA_POR_DECISION: 1.5,
    EXPERIENCIA_POR_ANIO: 5,
    /* Mientras estás bajo tierra (PRIORIDAD 10), cada salto de
       popularidad rinde menos: la fama de la escena se gana de a
       poco, año a año. 1 = sin freno. */
    UNDER_POP_FACTOR: 1,
    /* Bajo tierra, la música no cruza fronteras: un tema del under
       rara vez supera este techo de reproducciones, y el tier
       global es una excepción casi imposible (1 en 100 por defecto).
       Si te quedás en el under no te va a seguir yendo excelente. */
    UNDER_REPROS_TECHO: 2000000,
    UNDER_GLOBAL_CHANCE: 0.01,
    MOMENTUM_INICIAL: 5,
    MOMENTUM_DECAY: 6,     /* inercia que se pierde cada año */
    MOMENTUM_FRIO: 20,     /* por debajo: el nombre se enfría */
    MOMENTUM_IMPULSO: 55,  /* por encima: hay momento a favor */

    /* ---- Memoria de decisiones (PRIORIDAD 2) ----
       La reputación en la escena empieza neutra y se construye
       (o se quema) con cada decisión que la gente recuerda. */
    REPUTACION_INICIAL: 45,

    /* ---- El público (PRIORIDAD 3) ----
       El hype es el ruido transitorio: sube con los éxitos y se
       apaga solo (la popularidad queda, el hype vuela). Las
       expectativas del público salen de los últimos lanzamientos:
       defraudarlas baja hype y reputación; superarlas lo enciende.
       Los fans se segmentan por dentro (fieles/hardcore) y los
       haters crecen con las polémicas y frenan el crecimiento. */
    HYPE_INICIAL: 0,
    HYPE_DECAY: 0.6,          /* % del hype que queda tras cada año */
    HYPE_FRIO: 15,            /* por debajo: los casuales se empiezan a ir */
    HYPE_PENA: 12,            /* hype que se pierde al defraudar expectativas */
    HYPE_PENA_SUBIDO: 8,      /* extra si el hype estaba por las nubes */
    HYPE_UMBRAL_BUENO: 10,    /* superar esto da hype */
    HYPE_UMBRAL_MALO: -10,    /* quedar debajo de esto decepciona */
    EXPECTATIVA_DEFAULT: 30,  /* expectativa del público sin historial */
    FIDELIDAD_CASUAL: 0.06,   /* % de casuales que se vuelven fieles/año */
    FIDELIDAD_HARDCORE: 0.03, /* % de fieles que se vuelven hardcore/año */
    HATERS_CAP: 0.5           /* máx. haters vs fans (50%) */
  },

  /* ---------- Géneros musicales ----------
     stats: modificadores a las estadísticas iniciales.
     ventaja/desventaja: texto que se muestra al crear el artista.
     Ningún género es objetivamente mejor que otro.

     perfil (PRIORIDAD 5): cada género es una carrera distinta.
       critica   → bonus a la crítica de tus temas (respeto artístico).
       comercial → cómo convierte oídos: más = más fans por tema.
       escena    → cuánto aprendés laburando el under y qué tan
                   fiel es la base que construís.
       pico      → dónde está el techo natural de la escena.
     Ningún género es mejor: comercial paga rápido y escena paga
     hondo. */
  GENRES: {
    urban: {
      id: "urban",
      nombre: "Reggaetón / Urbano",
      emoji: "🔊",
      color: "#f59e0b",
      ventaja: "Crece rápido en plataformas y playlists.",
      desventaja: "Cuesta que te tomen en serio como artista.",
      stats: { popularity: 5, fans: 100 },
      perfil: { critica: -0.25, comercial: 1.18, escena: 0.9, fidelidad: 0.92, pico: "Masivo", afinidad: "El baile y el hook" }
    },
    rap: {
      id: "rap",
      nombre: "Rap / Trap",
      emoji: "🎤",
      color: "#a855f7",
      ventaja: "Base de talento fuerte para componer.",
      desventaja: "Cuesta llegar al público masivo al principio.",
      stats: { talent: 3, popularity: -3 },
      perfil: { critica: 0.35, comercial: 0.92, escena: 1.15, fidelidad: 1.22, pico: "Culto", afinidad: "La palabra y la calle" }
    },
    rock: {
      id: "rock",
      nombre: "Rock / Indie",
      emoji: "🎸",
      color: "#ef4444",
      ventaja: "Gran base de talento musical.",
      desventaja: "El camino comercial es más lento.",
      stats: { talent: 5, popularity: -4 },
      perfil: { critica: 0.45, comercial: 0.95, escena: 1.2, fidelidad: 1.28, pico: "Fiel", afinidad: "El instrumento y el vivo" }
    },
    pop: {
      id: "pop",
      nombre: "Pop / Electrónica",
      emoji: "✨",
      color: "#22d3ee",
      ventaja: "Gran facilidad para el éxito comercial.",
      desventaja: "Pocas plata para arrancar es un problema menor: tu fuerza es la imagen.",
      stats: { popularity: 6, money: 100 },
      perfil: { critica: -0.1, comercial: 1.12, escena: 0.95, fidelidad: 0.98, pico: "Comercial", afinidad: "La imagen y el radio" }
    }
  },

  /* ---------- Personalidades ---------- */
  PERSONALITIES: {
    ambicioso: {
      id: "ambicioso",
      nombre: "Ambicioso",
      emoji: "🚀",
      desc: "Perseguís el éxito grande y asumís riesgos.",
      stats: { popularity: 3, money: 100 }
    },
    artistico: {
      id: "artistico",
      nombre: "Artístico",
      emoji: "🎨",
      desc: "Tu música es lo primero. Respeto antes que números.",
      stats: { talent: 4, popularity: -2 }
    },
    estrategico: {
      id: "estrategico",
      nombre: "Estratégico",
      emoji: "🧠",
      desc: "Pensás cada movimiento como un negocio.",
      stats: { money: 150, popularity: 1 }
    },
    carismatico: {
      id: "carismatico",
      nombre: "Carismático",
      emoji: "🌟",
      desc: "Tu personalidad abre puertas donde el talento no llega.",
      stats: { popularity: 4 }
    },
    independiente: {
      id: "independiente",
      nombre: "Independiente",
      emoji: "🛠️",
      desc: "Hacés todo a tu manera, sin ataduras.",
      stats: { talent: 2, money: 50 }
    }
  },

  /* ---------- Niveles de carrera (FASE 6) ----------
     Salir del underground es MUY difícil: los niveles 0 a 3
     son toda la escena bajo tierra (chicos y algunos medianos).
     Cruzar al nivel 4 significa que ya sos un artista grande:
     se cruza en promedio recién entre el año 6 y el 8 de escena.
     El nivel se calcula combinando popularidad + fans (state.js). */
  CAREER_LEVELS: [
    { nivel: 0, puntaje: 0,   nombre: "Desconocido",              desc: "Nadie conoce tu nombre todavía." },
    { nivel: 1, puntaje: 10,  nombre: "Promesa local",            desc: "En tu barrio ya hablan de vos." },
    { nivel: 2, puntaje: 26,  nombre: "Underground",              desc: "Estás adentro. La escena te conoce." },
    { nivel: 3, puntaje: 48,  nombre: "Referente del underground", desc: "Los grandes del under te respetan. Todavía no saliste." },
    { nivel: 4, puntaje: 62,  nombre: "Artista grande",           desc: "Saliste del underground. La industria te mira." },
    { nivel: 5, puntaje: 74,  nombre: "Estrella nacional",        desc: "Tu país conoce tu nombre." },
    { nivel: 6, puntaje: 84,  nombre: "Estrella internacional",   desc: "Tu nombre cruza fronteras." },
    { nivel: 7, puntaje: 91,  nombre: "Superestrella",            desc: "Rompés récords en todo el mundo." },
    { nivel: 8, puntaje: 96,  nombre: "Fama mundial",             desc: "El mundo entero te escucha." }
  ],

  /* ---------- Eras de la carrera ---------- */
  ERAS: [
    { id: "comienzos",     nombre: "Comienzos",     texto: "El momento de demostrar de qué estás hecho.",            añoMin: 1,  añoMax: 3  },
    { id: "ascenso",       nombre: "Ascenso",       texto: "Las oportunidades grandes empiezan a tocar la puerta.",   añoMin: 4,  añoMax: 7  },
    { id: "consolidacion", nombre: "Consolidación", texto: "Ya tenés una identidad y una audiencia que te sigue.",     añoMin: 8,  añoMax: 12 },
    { id: "cima",          nombre: "Cima",          texto: "Podés alcanzar tu techo. Cuidado con la caída.",          añoMin: 13, añoMax: 17 },
    { id: "legado",        nombre: "Legado",        texto: "Lo que hagas ahora define cómo te van a recordar.",       añoMin: 18, añoMax: 25 }
  ],

  /* ---------- La escena real (PRIORIDAD 10) ----------
     Los nombres de la escena under de Córdoba que trae la amiga:
     artistas, admins, público y audiovisual. Los eventos usan
     estos nombres (alternando) para que cada misión no diga
     siempre «un productor» sino una persona concreta. */
  ESCENA: [
    { nombre: "Marti",          rol: "admin",              grupo: "undercba" },
    { nombre: "Fabrizio",       rol: "admin",              grupo: "undercba" },
    { nombre: "Benja Fuego",    rol: "admin",              grupo: "undercba" },
    { nombre: "Lucio Fuego",    rol: "admin",              grupo: "undercba" },
    { nombre: "Kiwa El Distinto", rol: "admin",            grupo: "undercba" },
    { nombre: "Drokerr",        rol: "artista",            grupo: "family racks" },
    { nombre: "EssKiff",        rol: "artista",            grupo: "family racks" },
    { nombre: "gk",             rol: "artista",            grupo: "family racks" },
    { nombre: "Ghosfe",         rol: "artista",            grupo: "family racks" },
    { nombre: "Vlempiree",      rol: "artista",            grupo: "family racks" },
    { nombre: "Caupiii",        rol: "artista",            grupo: "family racks" },
    { nombre: "Emile",          rol: "artista",            grupo: "los amigos y fruittyaudiovisual" },
    { nombre: "Pascu",          rol: "artista",            grupo: "los amigos" },
    { nombre: "Pulmon1312",     rol: "artista y DJ",       grupo: "los amigos OBS" },
    { nombre: "Tuconeone",      rol: "artista",            grupo: "los amigos" },
    { nombre: "Ivinn",          rol: "creador del under de Sierras Chicas", grupo: null },
    { nombre: "Burger",         rol: "filmmaker",          grupo: "fruittyaudiovisual" },
    { nombre: "Genaa",          rol: "público activo",     grupo: null },
    { nombre: "roro",           rol: "público activo",     grupo: null },
    { nombre: "Agus",           rol: "público activo",     grupo: null },
    { nombre: "Skydenn",         rol: "artista",            grupo: null },
    { nombre: "Los de Doble F", rol: "colectivo",          grupo: "doble f" },
    /* Los grandes del under (PRIORIDAD 10): mientras más te va,
       más te cruzás con ellos. fansMin marca el piso para que
       aparezcan en la escena. */
    { nombre: "Lil Nahue",      rol: "artista",            grupo: null, fansMin: 20000 },
    { nombre: "cero",           rol: "artista",            grupo: null, fansMin: 50000 },
    { nombre: "zell",           rol: "artista",            grupo: null, fansMin: 200000 }
  ],

  /* ---------- Lugares del under (PRIORIDAD 10) ----------
     De mejor a peor según la escena: Club Paraguay es la cima
     del under y La Sobre el lugar más crudo. */
  LUGARES: [
    { nombre: "Club Paraguay",   nivel: 4 },
    { nombre: "Cayo Makensi",    nivel: 3 },
    { nombre: "990 Club",        nivel: 3 },
    { nombre: "Undersc",         nivel: 2 },
    { nombre: "Pétalos del Sol", nivel: 2 },
    { nombre: "Casa Babylon",    nivel: 1 },
    { nombre: "La Sobre",        nivel: 0 }
  ],

  /* Elige una persona de la escena. Puede filtrarse por grupo o rol
     y alterna para no repetir el último nombre usado. Si pasás
     state, los grandes del under (Lil Nahue, cero, zell) solo
     aparecen cuando tu fama llegó a su piso. */
  escena: function (opts) {
    opts = opts || {};
    var fama = opts.state ? (opts.state.stats && opts.state.stats.fans) || 0 : 0;
    var filtrados = Under.DATA.ESCENA.filter(function (p) {
      if (opts.grupo && (!p.grupo || p.grupo.indexOf(opts.grupo) !== 0)) return false;
      if (opts.rol && p.rol !== opts.rol) return false;
      if (p.fansMin && fama < p.fansMin) return false;
      return true;
    });
    if (!filtrados.length) filtrados = Under.DATA.ESCENA;
    var pool = filtrados.slice();
    if (pool.length > 1 && Under.DATA._escenaUltimo) {
      pool = pool.filter(function (p) { return p.nombre !== Under.DATA._escenaUltimo; });
    }
    var p = pool[Math.floor(Math.random() * pool.length)];
    Under.DATA._escenaUltimo = p.nombre;
    return p;
  },

  /* Un lugar del under según el rango (nivel mínimo). */
  lugar: function (minNivel) {
    var pool = Under.DATA.LUGARES.filter(function (l) { return l.nivel >= (minNivel || 0); });
    if (!pool.length) pool = Under.DATA.LUGARES;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* Un estudio de grabación de la escena, al azar. */
  estudio: function () {
    var pool = Under.DATA.ESCENARIOS.filter(function (e) { return e.tipo === "estudio"; });
    return pool[Math.floor(Math.random() * pool.length)].nombre;
  },

  /* Un par de nombres del público activo de la escena, para que los
     shows se sientan de verdad (PRIORIDAD 10). Devuelve algo como
     "Genaa y roro". */
  publico: function (n) {
    n = n || 2;
    var pool = Under.DATA.ESCENA.filter(function (p) { return p.rol === "público activo"; });
    var eligio = [];
    var intentos = 0;
    while (eligio.length < n && intentos < 12) {
      var p = pool[Math.floor(Math.random() * pool.length)];
      intentos++;
      if (eligio.indexOf(p.nombre) === -1) eligio.push(p.nombre);
    }
    if (eligio.length === 1) return eligio[0];
    return eligio.slice(0, eligio.length - 1).join(", ") + " y " + eligio[eligio.length - 1];
  },

  /* ---------- Etapas de la carrera (PRIORIDAD 1) ----------
     La madurez artística (experiencia) marca la etapa: con los
     años y las decisiones el artista deja de ser un novato.
     Las etapas son el "cómo" de la progresión anual: el mismo
     movimiento significa distinto en un debutante que en un
     veterano (lo usa music._calcular y la interfaz). */
  ETAPAS: [
    { id: "debutante",      nombre: "Debutante",      exp: 0  },
    { id: "en_crecimiento", nombre: "En crecimiento", exp: 25 },
    { id: "asentado",       nombre: "Asentado",       exp: 50 },
    { id: "veterano",       nombre: "Veterano",       exp: 75 },
    { id: "leyenda_viva",   nombre: "Leyenda viva",   exp: 90 }
  ],

  CIUDADES: [
    "Tu ciudad",
    "Buenos Aires, Argentina",
    "Córdoba, Argentina",
    "Rosario, Argentina",
    "Ciudad de México",
    "Bogotá, Colombia",
    "Medellín, Colombia",
    "Lima, Perú",
    "Santiago, Chile",
    "Montevideo, Uruguay",
    "Quito, Ecuador",
    "Caracas, Venezuela",
    "Ciudad de Panamá",
    "San Juan, Puerto Rico",
    "São Paulo, Brasil",
    "Madrid, España"
  ],

  /* ---------- Rivales persistentes ----------
     Nombres de la escena para los rivales de la rivalidad
     larga. Se evita repetir dentro de la misma carrera. */
  RIVAL_NAMES: [
    { nombre: "Kruel", apodo: "El Krue" },
    { nombre: "La Titán", apodo: "Titán" },
    { nombre: "Zeta MC", apodo: "Zeta" },
    { nombre: "Vándalo", apodo: "Vando" },
    { nombre: "Rey Grillo", apodo: "El Grillo" },
    { nombre: "Maléfica", apodo: "Mali" },
    { nombre: "El Fantasma", apodo: "Fantasma" },
    { nombre: "Sable", apodo: "Sabre" },
    { nombre: "Nina Roja", apodo: "Nina" },
    { nombre: "Pelusa Stone", apodo: "Pelusa" },
    { nombre: "Doble Filo", apodo: "Doble" },
    { nombre: "Caronte", apodo: "Caro" },
    { nombre: "Turbina", apodo: "Turbo" },
    { nombre: "Maga Negra", apodo: "Maga" },
    { nombre: "Sínica", apodo: "Sini" },
    { nombre: "Yunque", apodo: "Yunke" }
  ],

  /* ---------- Escenarios del under ----------
     Locales, salas y rincones donde se toca bajo tierra. Cada
     evento puede elegir uno al azar para que la escena cambie
     de nombre de partida en partida y no se sienta repetida.
     capacidad 0 = al aire libre / sin boletería. */
  ESCENARIOS: [
    { nombre: "Bar El Gato Tuerto",   tipo: "bar",      capacidad: 60 },
    { nombre: "La Fábrica Abandonada", tipo: "galpón",  capacidad: 200 },
    { nombre: "Club Sur",             tipo: "club",     capacidad: 90 },
    { nombre: "Centro Cultural Del Ancla", tipo: "centro", capacidad: 150 },
    { nombre: "Plaza del Ferrocarril", tipo: "plaza",   capacidad: 0 },
    { nombre: "Cine Astral",          tipo: "cine",     capacidad: 120 },
    { nombre: "Estudio La Cabina",    tipo: "estudio",  capacidad: 30 },
    { nombre: "Patio de la Escuela Vieja", tipo: "patio", capacidad: 80 },
    { nombre: "Bar El Desvío",        tipo: "bar",      capacidad: 50 },
    { nombre: "Casa Roké",            tipo: "casa",     capacidad: 40 },
    { nombre: "Galpón de los Espejos", tipo: "galpón",  capacidad: 300 },
    { nombre: "Salón del Club Italiano", tipo: "salón", capacidad: 100 },
    { nombre: "Parada del Ómnibus 4", tipo: "espacio",  capacidad: 0 },
    { nombre: "Estudio Don Beats",    tipo: "estudio",  capacidad: 20 },
    { nombre: "Sanmaja Studio",       tipo: "estudio",  capacidad: 40 },
    { nombre: "Joma Studio",          tipo: "estudio",  capacidad: 30 },
    { nombre: "Traslacortina Studio", tipo: "estudio",  capacidad: 60 },
    { nombre: "Techo del Edificio Comunal", tipo: "azotea", capacidad: 60 },
    { nombre: "Bar La Bicicleta",     tipo: "bar",      capacidad: 70 }
  ],

  /* ---------- Artistas de la escena ----------
     Los nombres reales del under que pasó la amiga: colegas,
     referentes y caras nuevas de tu generación. Los eventos los
     usan para que la escena se sienta de verdad. */
  ARTISTAS_ESCENA: [
    "Marti", "Fabrizio", "Benja Fuego", "Lucio Fuego", "Kiwa El Distinto",
    "Drokerr", "EssKiff", "gk", "Ghosfe", "Vlempiree",
    "Caupiii", "Emile", "Pascu", "Pulmon1312", "Tuconeone",
    "Ivinn", "Burger", "Genaa", "Agus", "Agusfornite"
  ],

  /* ---------- Lanzamientos (FASE 2) ----------
     Estrategias de lanzamiento. costo se escala con el nivel.
     calidad → mejora la calidad del tema.
     viral   → mejora el potencial de difusión. */
  ESTRATEGIAS: [
    { id: "independiente", texto: "Lanzar independiente", frase: "de forma independiente", costo: 0,   calidad: 0,  viral: 0,  desc: "Sin gastar, todo para vos." },
    { id: "produccion",    texto: "Invertir en producción", frase: "con inversión en producción", costo: 400, calidad: 12, viral: 2,  desc: "Mejor sonido, mejor calidad." },
    { id: "promocion",     texto: "Campaña de promoción",  frase: "con una campaña de promoción", costo: 350, calidad: 1,  viral: 10, desc: "Más oídos, más ruido." },
    { id: "video",         texto: "Grabar videoclip",      frase: "con un videoclip a medida", costo: 700, calidad: 5,  viral: 14, desc: "Un video que se comparte solo." }
  ],

  /* Resultados posibles de un lanzamiento */
  TIERS: {
    fracaso: { nombre: "Fracaso",     icono: "💤" },
    normal:  { nombre: "Normal",      icono: "🙂" },
    exito:   { nombre: "Éxito",       icono: "👍" },
    hit:     { nombre: "HIT",         icono: "🔥" },
    viral:   { nombre: "VIRAL",       icono: "⚡" },
    cult:    { nombre: "CULT CLASSIC", icono: "🎯" },
    global:  { nombre: "HIT GLOBAL",  icono: "🌍" }
  },

  /* Datos numéricos por resultado (FASE 6: yields reducidos
     para que el crecimiento sea lento y realista). */
  TIER_DATA: {
    fracaso: { repros: 2500,     fans: 25,    popularidad: 0,  talento: 2 },
    normal:  { repros: 30000,    fans: 150,   popularidad: 1,  talento: 1 },
    exito:   { repros: 130000,   fans: 600,   popularidad: 2,  talento: 1 },
    hit:     { repros: 600000,   fans: 2500,  popularidad: 4,  talento: 1 },
    viral:   { repros: 1500000,  fans: 10000, popularidad: 8,  talento: 1 },
    cult:    { repros: 550000,   fans: 350,   popularidad: 1,  talento: 5 },
    global:  { repros: 16000000, fans: 25000, popularidad: 14, talento: 2 }
  },

  /* Nombres de canciones por género (se evita repetir seguidos) */
  SONG_NAMES: {
    urban: ["Perreo a la carta", "La que se viene", "Bajón y azúcar", "En la disco", "Gato libre", "Flow de medianoche", "Maldita fiesta", "Playa virtual", "Ven a bailar", "Ritmo de la calle", "Candelita", "Se nota", "La foto del DNI", "Bailando en el colectivo", "El otro martes", "Chicle bajo la silla", "Tarde de piletón", "Fiesta en la vereda", "El perreo del domingo", "Cero stock", "La vuelta al pan"],
    rap: ["Ley del silencio", "Barrio dormido", "Plomo en la rima", "Vendaval", "Sin escalas", "Tinta en las manos", "Medianoche gris", "Ritual", "Antimateria", "Deuda pendiente", "Fuego lento", "Papel mojado", "El pibe de la esquina", "Dos panchos y un feat", "Rima en la ronda", "La Sobre no duerme", "Barra de andén", "Cuaderno mojado", "El verso del bondi", "Media pila", "La calle no llama"],
    rock: ["Tormenta eléctrica", "Ciudad gris", "Noches de garaje", "Sirena rota", "Distorsión", "Laberinto", "Vía de escape", "Luna de hierro", "Incendio", "Bruma", "Adrenalina", "Última toma", "Garaje a oscuras", "El último cable", "Amplificador roto", "Batería de cocina", "Ensayo a las tres", "Cuerda floja", "El depto vacío", "Bajo tierra", "Púa prestada"],
    pop: ["Bombón digital", "Luna de neón", "Corazón en modo avión", "Gravity", "Velocidad", "Azúcar en los labios", "Verano eterno", "Satélite", "Frío polar", "Como ayer", "Brillo", "Hora dorada", "Verano y ananá", "Brillo de cámara", "Postal de la playa", "Corazón en 4K", "Melodía de ascensor", "El pop de la plaza", "Lentes de sol en invierno", "Domingo de radio", "Confeti barato"]
  },

  /* ---------- Sellos discográficos (FASE 3) ----------
     retencion: % de tus ingresos por música que te quedás.
     distribucion: multiplicador de reproducciones que aporta el sello.
     adelanto: plata que te dan al firmar (se escala con el nivel). */
  SELLOS: {
    pequeno: {
      retencion: 0.75, distribucion: 1.2, adelanto: 1000, duracion: 2,
      nombres: ["Sello Nexo", "Fábrica de Sueños", "La OBS de los Amigos", "Casa Fuego"]
    },
    medio: {
      retencion: 0.65, distribucion: 1.35, adelanto: 4000, duracion: 3,
      nombres: ["Gran Pulso", "Melodía Capital", "Sonido Global", "Estudio Norte"]
    },
    grande: {
      retencion: 0.55, distribucion: 1.5, adelanto: 12000, duracion: 4,
      nombres: ["Estelar Records", "Vía Láctea Music", "Titán Discos", "Aurora Global"]
    }
  },

  /* ---------- Giras (FASE 3) ----------
     nivel: mínimo de nivel de carrera para ofrecerla.
     costo: se escala con el nivel.
     base: recaudación bruta de referencia.
     precio: precio medio de entrada (para calcular fans). */
  GIRAS: [
    { id: "local",          nombre: "Gira local",          desc: "Una decena de fechas en tu ciudad y alrededores.", nivel: 1, costo: 200,   base: 1500,   precio: 12, fans: 500,   popularidad: 1 },
    { id: "nacional",       nombre: "Gira nacional",       desc: "Recorrés tu país con una producción cuidada.",    nivel: 3, costo: 1200,  base: 8000,   precio: 25, fans: 3000,  popularidad: 2 },
    { id: "regional",       nombre: "Gira regional",       desc: "Varias ciudades de tu región. Otro nivel.",       nivel: 5, costo: 4500,  base: 30000,  precio: 40, fans: 10000, popularidad: 3 },
    { id: "internacional",  nombre: "Gira internacional",  desc: "Cruzá el océano. Equipo grande, costos grandes.", nivel: 6, costo: 14000, base: 90000,  precio: 60, fans: 25000, popularidad: 4 },
    { id: "mundial",        nombre: "Gira mundial",        desc: "El planeta entero. Estadios y récords.",          nivel: 8, costo: 40000, base: 300000, precio: 90, fans: 50000, popularidad: 6 }
  ],

  /* ---------- Colaboraciones (FASE 3) ----------
     audiencia: multiplicador de reproducciones/fans del tema.
     retencion: % del dinero que te queda (el resto va al partner).
     calidad: aporte creativo del partner al tema. */
  PARTNERS: {
    emergente: {
      desc: "alguien emergente que te admira", calidad: 2, audiencia: 0.6, retencion: 0.6,
      nombres: ["Ela Corte", "Feroz", "Luna Raviol", "Tío Rico"]
    },
    igual: {
      desc: "un colega de tu mismo nivel", calidad: 4, audiencia: 1, retencion: 0.5,
      nombres: ["Camila Rey", "DVST", "Nico Perfil", "Ana Sur", "Balta Cero"]
    },
    estrella: {
      desc: "una estrella mucho más grande que vos", calidad: 8, audiencia: 2.2, retencion: 0.4,
      nombres: ["Rey Nube", "Skylar", "DJ Ultra", "Luzbel", "Malva Storm"]
    },
    culto: {
      desc: "una leyenda de culto, respetada pero poco masiva", calidad: 6, audiencia: 0.8, retencion: 0.5,
      nombres: ["El Viejo Mora", "Flora de Sal", "Kruger Lento", "Adela Bruma"]
    }
  },

  /* ---------- Premios (FASE 3) ----------
     Se ofrecen según nivel de carrera y no se repiten por categoría. */
  PREMIOS: [
    { id: "nuevo",       nombre: "Mejor Artista Nuevo",        nivelMin: 1, añoMin: 2, premio: 1500,  popularidad: 4,  fans: 1500 },
    { id: "cancion",     nombre: "Canción del Año",            nivelMin: 3, añoMin: 2, premio: 3000,  popularidad: 5,  fans: 3000 },
    { id: "nacional",    nombre: "Mejor Artista Underground", nivelMin: 4, añoMin: 3, premio: 4000,  popularidad: 5,  fans: 2500 },
    { id: "album",       nombre: "Álbum del Año",              nivelMin: 6, añoMin: 4, premio: 8000,  popularidad: 6,  fans: 5000 },
    { id: "latino",      nombre: "Mejor Artista Latino",       nivelMin: 6, añoMin: 5, premio: 10000, popularidad: 7,  fans: 4000 },
    { id: "trayectoria", nombre: "Premio a la Trayectoria",    nivelMin: 8, añoMin: 10, premio: 20000, popularidad: 6,  fans: 3000 },
    { id: "global",      nombre: "Mejor Artista Global",       nivelMin: 8, añoMin: 6, premio: 50000, popularidad: 10, fans: 15000 }
  ],

  /* ---------- Proyectos / álbumes (FASE 4) ----------
     Un proyecto es un EP o un álbum: inversión grande,
     resultado mayor que un single.
     base: multiplicador de reproducciones/fans/dinero vs un single.
     cortes: cantidad de cortes que se desprenden como singles.
     calidad: aporte artístico (va al cálculo del tema). */
  PROYECTOS: [
    { id: "ep",    nombre: "EP",             desc: "Entre 4 y 6 canciones. Un paso entre single y álbum.", nivelMin: 1, costo: 600,  base: 1.5, cortes: 1, calidad: 3, canciones: 5 },
    { id: "album", nombre: "Álbum completo", desc: "Más de 10 canciones. Meses de trabajo y el mayor impacto de tu carrera.", nivelMin: 4, costo: 3200, base: 3.8, cortes: 2, calidad: 6, canciones: 12 }
  ],

  /* Nombres de álbumes/proyectos (se evita repetir) */
  ALBUM_NAMES: [
    "Medianoche", "Ecos", "Raíces", "Norte", "Casa de cristal", "Piel", "El viaje",
    "Después de la tormenta", "Amanecer urbano", "Huella", "Fuego y sal", "Vértigo",
    "Las horas muertas", "Cimiento", "Bruma", "Punto de quiebre"
  ],

  /* ---------- Escándalos (FASE 4) ----------
     Gravedad: leve / grave / crisis. peso = veces en el pozo.
     popularidad/fans: daño base (el daño real lo define la respuesta). */
  ESCANDALOS: {
    leve: {
      id: "leve", nombre: "Polémica en redes", gravedad: "leve", nivelMin: 1, peso: 3, popularidad: -4, fans: -2500,
      textos: [
        "Un tweet viejo tuyo se vuelve viral y la gente lo lee con otros ojos.",
        "Se filtra una maqueta vieja que no querías publicar y tus fans se dividen.",
        "Una discusión en redes con otro artista se sale de control."
      ]
    },
    grave: {
      id: "grave", nombre: "Controversia seria", gravedad: "grave", nivelMin: 3, peso: 2, popularidad: -8, fans: -9000,
      textos: [
        "Kiwa arma una controversia seria: habla mal de vos en un documental y los titulares te apuntan.",
        "Kiwa arma la polémica y te cancelan la participación en una fecha del under.",
        "Kiwa te acusa de plagio y la industria debate el tema durante semanas."
      ]
    },
    crisis: {
      id: "crisis", nombre: "Crisis mayor", gravedad: "crisis", nivelMin: 6, peso: 1, popularidad: -14, fans: -30000,
      textos: [
        "Un reportaje investiga tu pasado y los titulares son demoledores.",
        "Una acusación grave sacude tu carrera de lleno.",
        "Tu sello cancela los planes tras una polémica enorme."
      ]
    }
  },

  /* ---------- Equipo (FASE 4) ----------
     costoAnual: se paga todos los años (se escala al contratar).
     Cada rol aporta un beneficio distinto. */
  EQUIPO: [
    { id: "manager", nombre: "Manager", emoji: "💼", nivelMin: 2, costoAnual: 700, desc: "Mejora tus negocios: +10% de dinero en lanzamientos, giras y colaboraciones." },
    { id: "agente",  nombre: "Agente", emoji: "🎫", nivelMin: 3, costoAnual: 600, desc: "Consigue mejores fechas: +20% de fans en cada gira." },
    { id: "prensa",  nombre: "Jefe de prensa", emoji: "📰", nivelMin: 3, costoAnual: 500, desc: "Cuida tu imagen: reduce el daño de los escándalos." },
    { id: "asesor",  nombre: "Asesor financiero", emoji: "📈", nivelMin: 4, costoAnual: 650, desc: "Mejora tus inversiones: más retorno y menos riesgo." },
    { id: "hongo",   nombre: "hongo TV", emoji: "📺", nivelMin: 2, costoAnual: 600, desc: "Consigue mejores fechas: +20% de fans en cada gira." }
  ],

  /* ---------- Inversiones (FASE 4) ----------
     Se compran una sola vez y generan ingresos pasivos cada año.
     retorno: % anual estimado. riesgo: probabilidad de un bache. */
  INVERSIONES: [
    { id: "propiedad", nombre: "Propiedad inmobiliaria", emoji: "🏠", nivelMin: 3, costo: 7000, retorno: 0.09, riesgo: 0.12, desc: "Alquileres estables y poca complicación." },
    { id: "marca",     nombre: "Tu propia marca", emoji: "🏪", nivelMin: 4, costo: 5500, retorno: 0.16, riesgo: 0.30, desc: "Un negocio con tu nombre. Vende fuerte, pero puede dar sustos." },
    { id: "catalogo",  nombre: "Derechos de tu catálogo", emoji: "📼", nivelMin: 5, costo: 9000, retorno: 0.13, riesgo: 0.20, desc: "Comprás los derechos de tu propia música: royalties para siempre." }
  ],

  /* ---------- Vida personal (FASE 4) ----------
     Eventos de vida que ponen en la balanza la carrera
     contra el bienestar (energía y relaciones). */
  VIDA: [
    { id: "pareja",  titulo: "Alguien importante", texto: "Conocés a alguien que te hace querer bajar un cambio. Llevan meses de mensajes y ahora te propone algo serio.\n\nTu agenda no perdona." },
    { id: "familia", titulo: "La familia te necesita", texto: "En tu casa hay un momento difícil. Tu familia te pide tiempo y presencia.\n\nLa gira puede esperar… ¿o no?" },
    { id: "salud",   titulo: "Tu cuerpo pide freno", texto: "Las giras, los estudios y las noches sin dormir empiezan a cobrar factura. Sentís el cansancio en los huesos." },
    { id: "amigos",  titulo: "Los de siempre", texto: "Tus amigos de antes te reclaman: no aparecés nunca. Planean un viaje de dos semanas sin teléfonos.\n\nSuena a una eternidad lejos del estudio." }
  ],

  /* ---------- Plataformas y streaming (FASE 5) ----------
     Estrategia de distribución. streamsMult/dineroMult: cómo
     multiplica tus reproducciones e ingresos el año siguiente. */
  PLATAFORMAS: [
    { id: "streaming",       nivelMin: 1, emoji: "🎧", nombre: "Playlists y streaming",     streamsMult: 1.35, dineroMult: 0.70, bono: 0,    desc: "Muchos streams, menos plata por cada uno." },
    { id: "directo",         nivelMin: 2, emoji: "💿", nombre: "Venta directa",             streamsMult: 0.75, dineroMult: 1.70, bono: 0,    desc: "Menos público, pero cada fan paga mejor." },
    { id: "exclusiva",       nivelMin: 4, emoji: "🔒", nombre: "Exclusiva con plataforma",  streamsMult: 0.90, dineroMult: 1.30, bono: 3000, desc: "Un pago grande ahora, algo menos de difusión." },
    { id: "multiplataforma", nivelMin: 6, emoji: "🌍", nombre: "Distribución total",        streamsMult: 1.15, dineroMult: 1.00, bono: 0,    desc: "Todo a la vez: el equilibrio perfecto." }
  ],

  /* ---------- Mercados internacionales (FASE 5) ----------
     Conquistar un mercado cuesta plata, suma fans y popularidad,
     y multiplica tus ingresos por streaming para siempre. */
  MERCADOS: [
    { id: "latam",     nombre: "Latinoamérica", emoji: "🌎", nivelMin: 2, costo: 1500,  fans: 2000,  popularidad: 5, desc: "Tu región natural: radios, boca en boca y fechas del under." },
    { id: "europa",    nombre: "Europa",         emoji: "🇪🇺", nivelMin: 4, costo: 6000,  fans: 4000,  popularidad: 6, desc: "Públicos que llenan fechas y pagan bien." },
    { id: "norteam",   nombre: "Norteamérica",   emoji: "🇺🇸", nivelMin: 6, costo: 15000, fans: 8000,  popularidad: 7, desc: "El mercado más grande del planeta." },
    { id: "asia",      nombre: "Asia",           emoji: "🌏", nivelMin: 8, costo: 30000, fans: 15000, popularidad: 8, desc: "Un continente entero de oídos nuevos." }
  ],

  /* ---------- Shows en el under (FASE 5) ----------
     No hay festivales: los shows se arman en los lugares de la
     escena (Under.FESTIVALES elige LUGARES según tu nivel).
     neto = bruto - costo. */

  /* ---------- Créditos y deudas (FASE 5) ----------
     Pedís plata ahora, la devolvés en cuotas con interés.
     Si no podés pagar, hay quiebra. */
  CREDITOS: [
    { id: "micro",        nombre: "Crédito chico",              monto: 2000,  interes: 0.15, años: 3 },
    { id: "fuerte",       nombre: "Crédito fuerte",             monto: 8000,  interes: 0.20, años: 5 },
    { id: "inversionista", nombre: "Crédito con inversionista", monto: 25000, interes: 0.30, años: 6 }
  ],

  /* ---------- Eventos dinámicos (FASE 2 + FASE 3 + FASE 4) ----------
     Se mezclan con las plantillas. peso = veces en el pozo.
     disponible: condición para que entre en el pozo este año. */
  DINAMICOS: [
    {
      id: "gira", peso: 2,
      disponible: function (s) { return !s.flags.giraEsteAnio && Under.STATE.nivelCarrera(s).nivel >= 1; },
      generar: function (s) { return Under.GIRAS.crearEventoGira(s); }
    },
    {
      id: "colab", peso: 2,
      disponible: function (s) { return !s.flags.colabEsteAnio && s.lanzamientos >= 1; },
      generar: function (s) { return Under.COLABS.crearEventoColab(s); }
    },
    {
      id: "premio", peso: 3,
      disponible: function (s) {
        return !s.flags.premioEsteAnio && s.año >= 2 && Under.STATE.nivelCarrera(s).nivel >= 1 && Under.PREMIOS.hayElegible(s);
      },
      generar: function (s) { return Under.PREMIOS.crearEventoPremio(s); }
    },
    {
      id: "sello", peso: 3,
      disponible: function (s) {
        if (s.año < 3) return false;
        if (s.flags.selloOfrecidoEsteAnio) return false;
        if (s.sello) return Under.SELLO.mejorTipo(s) !== s.sello.tipo;
        return true;
      },
      generar: function (s) { return Under.SELLO.crearEventoSello(s); }
    },
    /* Fase 4: proyectos, escándalos, equipo, vida personal e inversiones */
    {
      id: "album", peso: 2,
      disponible: function (s) {
        return !s.flags.albumEsteAnio && Under.STATE.nivelCarrera(s).nivel >= 1 && !!Under.ALBUMS._mejorOfrecible(s);
      },
      generar: function (s) { return Under.ALBUMS.crearEventoProyecto(s); }
    },
    {
      id: "escandalo", peso: function (s) {
        /* El foco del mainstream (PRIORIDAD 10) trae polémicas:
           la doble exposición hace que los escándalos lleguen
           más seguido para quien eligió ese camino. */
        return (s.flags && s.flags.camino === "mainstream") ? 4 : 2;
      },
      disponible: function (s) {
        return !s.flags.escandaloEsteAnio && s.año >= 2 && Under.STATE.nivelCarrera(s).nivel >= 1;
      },
      generar: function (s) { return Under.ESCANDALOS.crearEventoEscandalo(s); }
    },
    {
      id: "equipo", peso: 2,
      disponible: function (s) { return !s.flags.equipoOfrecidoEsteAnio && !!Under.EQUIPO._ofrecible(s); },
      generar: function (s) { return Under.EQUIPO.crearEventoEquipo(s); }
    },
    {
      id: "vida", peso: 2,
      disponible: function (s) { return !s.flags.vidaEsteAnio && s.año >= 2; },
      generar: function (s) { return Under.VIDA.crearEventoVida(s); }
    },
    {
      id: "inversion", peso: 2,
      disponible: function (s) { return !s.flags.inversionOfrecidaEsteAnio && !!Under.INVERSIONES._ofrecible(s); },
      generar: function (s) { return Under.INVERSIONES.crearEventoInversion(s); }
    },
    /* Fase 5: plataformas, mercados, shows, evolución, documental, créditos y catálogo */
    {
      id: "plataforma", peso: 2,
      disponible: function (s) { return !s.flags.plataformaEsteAnio && !!Under.PLATAFORMAS._mejorOfrecible(s); },
      generar: function (s) { return Under.PLATAFORMAS.crearEventoPlataforma(s); }
    },
    {
      id: "mercado", peso: 2,
      disponible: function (s) {
        return !s.flags.mercadoEsteAnio && Under.STATE.nivelCarrera(s).nivel >= 2 && !!Under.MERCADOS._mejorOfrecible(s);
      },
      generar: function (s) { return Under.MERCADOS.crearEventoMercado(s); }
    },
    {
      id: "festival", peso: 2,
      disponible: function (s) { return !s.flags.festivalEsteAnio && !!Under.FESTIVALES._mejorOfrecible(s); },
      generar: function (s) { return Under.FESTIVALES.crearEventoFestival(s); }
    },
    {
      id: "evolucion", peso: 1,
      disponible: function (s) {
        if (s.flags.evolucionEsteAnio) return false;
        return !s.ultimaReinvencion || s.año - s.ultimaReinvencion >= 3;
      },
      generar: function (s) { return Under.LEGADO.crearEventoEvolucion(s); }
    },
    {
      id: "documental", peso: 1,
      disponible: function (s) {
        return !s.flags.tuvoDocumental && s.año >= 6 && Under.STATE.nivelCarrera(s).nivel >= 5;
      },
      generar: function (s) { return Under.LEGADO.crearEventoDocumental(s); }
    },
    {
      id: "credito", peso: 1,
      disponible: function (s) {
        return !s.flags.creditoEsteAnio && !!Under.ECONOMIA._creditoOfrecible(s);
      },
      generar: function (s) { return Under.ECONOMIA.crearEventoCredito(s); }
    },
    {
      id: "catalogo", peso: 1,
      disponible: function (s) {
        return !s.vendioCatalogo && !s.flags.catalogoEsteAnio &&
          Under.STATE.nivelCarrera(s).nivel >= 6 && s.totalReproducciones >= 1000000;
      },
      generar: function (s) { return Under.ECONOMIA.crearEventoCatalogo(s); }
    },
    /* Fase 6: la vida underground. Misiones de la escena que
       llenan los años bajo tierra y hacen crecer despacio. */
    {
      id: "under_ciudad", peso: 2,
      disponible: function (s) { return Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoCiudad(s); }
    },
    {
      id: "under_radio", peso: 2,
      disponible: function (s) { return s.año >= 1; },
      generar: function (s) { return Under.UNDER.crearEventoRadio(s); }
    },
    {
      id: "under_influencer", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.UNDER.crearEventoInfluencer(s); }
    },
    {
      id: "under_rival", peso: 2,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoRival(s); }
    },
    {
      id: "under_freestyle", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3 && s.stats.talent >= 55;
      },
      generar: function (s) { return Under.UNDER.crearEventoFreestyle(s); }
    },
    {
      id: "under_cypher", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoCypher(s); }
    },
    {
      id: "under_telonero", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 2 && n >= 1 && n <= 4;
      },
      generar: function (s) { return Under.UNDER.crearEventoTelonero(s); }
    },
    {
      id: "under_remix", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.UNDER.crearEventoRemix(s); }
    },
    {
      id: "under_filtracion", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 2; },
      generar: function (s) { return Under.UNDER.crearEventoFiltracion(s); }
    },
    {
      id: "under_zona", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoZona(s); }
    },
    {
      id: "under_maqueta", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoMaqueta(s); }
    },
    {
      id: "under_colega", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoColega(s); }
    },
    {
      id: "under_referente", peso: 2,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoReferente(s); }
    },
    {
      id: "under_bloqueo", peso: 2,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoBloqueo(s); }
    },
    {
      id: "under_advertencia", peso: 2,
      disponible: function (s) { return s.año >= 3 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoAdvertencia(s); }
    },
    {
      id: "under_sala", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoSala(s); }
    },
    {
      id: "under_ciclo", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoCiclo(s); }
    },
    {
      id: "under_obs", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoObs(s); }
    },
    {
      id: "under_ig", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoIg(s); }
    },
    {
      id: "under_petalos", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.lanzamientos >= 1 && n >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoPetalos(s); }
    },
    {
      id: "under_coscu", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoCoscu(s); }
    },
    {
      id: "under_makensi", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoMakensi(s); }
    },
    {
      id: "under_massita", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoMassita(s); }
    },
    {
      id: "under_estudio_grande", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 3 && s.lanzamientos >= 1 && n >= 1 && n <= 4;
      },
      generar: function (s) { return Under.UNDER.crearEventoEstudioGrande(s); }
    },
    {
      id: "under_viral_sobre", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.lanzamientos >= 1 && n >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoViralSobre(s); }
    },
    {
      id: "under_cancion_anio", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 2 && s.lanzamientos >= 2 && n >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoCancionAnio(s); }
    },
    {
      id: "under_ivo", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoIvo(s); }
    },
    {
      id: "under_blake", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoBlake(s); }
    },
    {
      id: "under_hongo_tv", peso: 2,
      disponible: function (s) {
        return s.año >= 3 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3
          && !Under.EQUIPO.tiene(s, "hongo") && !(s.flags && s.flags.hongoTvEquipo);
      },
      generar: function (s) { return Under.UNDER.crearEventoHongoTv(s); }
    },
    {
      id: "under_galperin", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoGalperin(s); }
    },
    {
      id: "under_fruity", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoFruity(s); }
    },
    /* La escena real que trae la amiga (PRIORIDAD 10): Family Racks,
       Kiwa El Distinto, Marti, los lugares de verdad y Los Amigos. */
    {
      id: "under_family_cypher", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoFamilyCypher(s); }
    },
    {
      id: "under_kiwa", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoKiwa(s); }
    },
    {
      id: "under_marti", peso: 3,
      disponible: function (s) {
        return s.año >= 1 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoMarti(s); }
    },
    {
      id: "under_club_paraguay", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3
          && s.stats.fans >= 30000;
      },
      generar: function (s) { return Under.UNDER.crearEventoClubParaguay(s); }
    },
    {
      id: "under_990", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEvento990(s); }
    },
    {
      id: "under_undersc", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoUndersc(s); }
    },
    {
      id: "under_la_sobre", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoLaSobre(s); }
    },
    {
      id: "under_pascu", peso: 2,
      disponible: function (s) {
        return s.año >= 2 && s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoPascu(s); }
    },
    /* Los grandes del under (PRIORIDAD 10): Lil Nahue, cero y zell.
       Cuanto mejor te va (más fans), más se te abren. Están
       disponibles para el que se quedó en el under y para el
       que salió pero sigue manteniendo la escena cerca. */
    {
      id: "under_lil_naue", peso: 2,
      disponible: function (s) {
        return s.stats.fans >= 20000 && s.lanzamientos >= 1;
      },
      generar: function (s) { return Under.UNDER.crearEventoLilNaue(s); }
    },
    {
      id: "under_cero", peso: 2,
      disponible: function (s) {
        return s.stats.fans >= 50000 && s.lanzamientos >= 1;
      },
      generar: function (s) { return Under.UNDER.crearEventoCero(s); }
    },
    {
      id: "under_zell", peso: 2,
      disponible: function (s) {
        return s.stats.fans >= 200000 && s.lanzamientos >= 1;
      },
      generar: function (s) { return Under.UNDER.crearEventoZell(s); }
    },
    /* La gira del under con Skydenn y la puerta de Doble F: nombres
       de la escena que empujan tu carrera sin salir de ella. */
    {
      id: "under_skydenn_gira", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.UNDER.crearEventoSkydennGira(s); }
    },
    {
      id: "under_doblef_catalogo", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && s.año >= 2; },
      generar: function (s) { return Under.UNDER.crearEventoDobleFCatalogo(s); }
    },
    {
      id: "under_doblef_circulo", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && s.año >= 3; },
      generar: function (s) { return Under.UNDER.crearEventoDobleFCirculo(s); }
    },
    {
      id: "under_songwarts_jurado", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && s.año >= 2; },
      generar: function (s) { return Under.UNDER.crearEventoSongwarts(s); }
    },
    {
      id: "under_amigas_sobre", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 1 && s.lanzamientos >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoAmigasSobre(s); }
    },
    {
      id: "under_lucio_paraguay", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && s.stats.fans >= 30000;
      },
      generar: function (s) { return Under.UNDER.crearEventoLucioParaguay(s); }
    },
    {
      id: "under_agusfornite", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && s.stats.fans >= 30000;
      },
      generar: function (s) { return Under.UNDER.crearEventoAgusfornite(s); }
    },
    {
      id: "under_cantante_1k", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 1 && s.lanzamientos >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoCantante1k(s); }
    },
    {
      id: "under_sprite_droga", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 2 && s.lanzamientos >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoSpriteDroga(s); }
    },
    {
      id: "under_joda_cayo", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 2 && s.lanzamientos >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoJodaCayo(s); }
    },
    {
      id: "under_casa_3flip", peso: 2,
      disponible: function (s) {
        var n = Under.STATE.nivelCarrera(s).nivel;
        return s.año >= 1 && s.lanzamientos >= 1 && n <= 3;
      },
      generar: function (s) { return Under.UNDER.crearEventoCasa3Flip(s); }
    },
    /* Los nombres de la escena cuando ya saliste del underground:
       Ivinn, Pulmon1312 y Drokerr crecen con el mainstream. */
    {
      id: "main_ivinn", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 4; },
      generar: function (s) { return Under.UNDER.crearEventoMainIvinn(s); }
    },
    {
      id: "main_pulmon", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 4; },
      generar: function (s) { return Under.UNDER.crearEventoMainPulmon(s); }
    },
    {
      id: "main_drokerr", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 4; },
      generar: function (s) { return Under.UNDER.crearEventoMainDrokerr(s); }
    },
    /* La bifurcación de carrera: aparece SIEMPRE al cruzar al
       nivel 4 (la intercepta seleccionarEvento). Vive acá para
       que buscarEvento la resuelva en una recarga. */
    {
      id: "camino_carrera", peso: 1,
      disponible: function (s) {
        return !s.flags.camino && Under.STATE.nivelCarrera(s).nivel >= 4;
      },
      generar: function (s) { return Under.UNDER.crearEventoCamino(s); }
    },
    /* Gran actualización: misiones exclusivas para cuando ya
       saliste del underground (nivel 4+ alcanzado alguna vez). */
    {
      id: "grande_tv", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground; },
      generar: function (s) { return Under.GRANDE.crearEventoTV(s); }
    },
    {
      id: "grande_marca", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 4; },
      generar: function (s) { return Under.GRANDE.crearEventoMarca(s); }
    },
    {
      id: "grande_leyenda", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.lanzamientos >= 3; },
      generar: function (s) { return Under.GRANDE.crearEventoLeyenda(s); }
    },
    {
      id: "grande_estadio", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground; },
      generar: function (s) { return Under.GRANDE.crearEventoEstadio(s); }
    },
    {
      id: "grande_prensa", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 5; },
      generar: function (s) { return Under.GRANDE.crearEventoPrensaGrande(s); }
    },
    {
      id: "grande_sello", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && !!s.sello; },
      generar: function (s) { return Under.GRANDE.crearEventoSelloPresion(s); }
    },
    {
      id: "grande_rumores", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 4; },
      generar: function (s) { return Under.GRANDE.crearEventoRumores(s); }
    },
    {
      id: "grande_protector", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground; },
      generar: function (s) { return Under.GRANDE.crearEventoProtector(s); }
    },
    /* Rivalidad persistente: un hilo narrativo largo. El beef se
       enfría con los años (systems.iniciarAnio) y cada etapa tiene
       su evento. El rival nuevo aparece cuando no hay fuego activo. */
    {
      id: "rival_nuevo", peso: 3,
      disponible: function (s) {
        return s.año >= 2 && !s.flags.rivalEsteAnio && !Under.RIVALES._activo(s);
      },
      generar: function (s) { return Under.RIVALES.crearEventoNuevo(s); }
    },
    {
      id: "rival_duelo", peso: 3,
      disponible: function (s) {
        var r = Under.RIVALES._activo(s);
        return !!r && !s.flags.rivalEsteAnio && r.beef >= 40;
      },
      generar: function (s) { return Under.RIVALES.crearEventoDuelo(s); }
    },
    {
      id: "rival_reconciliar", peso: 3,
      disponible: function (s) {
        var r = Under.RIVALES._activo(s);
        return !!r && !s.flags.rivalEsteAnio && r.beef >= 45;
      },
      generar: function (s) { return Under.RIVALES.crearEventoReconciliar(s); }
    },
    {
      id: "rival_colab", peso: 3,
      disponible: function (s) {
        return !!Under.RIVALES._reconciliadoSinColab(s) && !s.flags.rivalEsteAnio;
      },
      generar: function (s) { return Under.RIVALES.crearEventoColab(s); }
    },
    /* Gran actualización 2: más misiones del underground y de la
       vida grande para que los años nunca se sientan vacíos. */
    {
      id: "under_feria", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoFeria(s); }
    },
    {
      id: "under_escuela", peso: 2,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoEscuela(s); }
    },
    {
      id: "under_fiesta", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoFiesta(s); }
    },
    {
      id: "under_banda", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoBanda(s); }
    },
    {
      id: "under_manifiesto", peso: 2,
      disponible: function (s) { return s.año >= 3 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoManifiesto(s); }
    },
    {
      id: "under_ensayo", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoEnsayo(s); }
    },
    {
      id: "under_resena", peso: 1,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoResena(s); }
    },
    {
      id: "under_equipo", peso: 1,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel <= 3; },
      generar: function (s) { return Under.UNDER.crearEventoEquipo(s); }
    },
    {
      id: "grande_docuserie", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 6; },
      generar: function (s) { return Under.GRANDE.crearEventoDocuserie(s); }
    },
    {
      id: "grande_banda", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground; },
      generar: function (s) { return Under.GRANDE.crearEventoBanda(s); }
    },
    {
      id: "grande_teatro", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground; },
      generar: function (s) { return Under.GRANDE.crearEventoTeatro(s); }
    },
    {
      id: "grande_viral", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.lanzamientos >= 1; },
      generar: function (s) { return Under.GRANDE.crearEventoViral(s); }
    },
    {
      id: "grande_verano", peso: 1,
      disponible: function (s) { return s.flags.salioDelUnderground && s.año >= 5; },
      generar: function (s) { return Under.GRANDE.crearEventoVerano(s); }
    },
    /* Gran actualización 3: más vida alrededor de la música.
       Eventos por género, fuera de la música, fandom y más
       misiones del underground. */
    {
      id: "gen_rap", peso: 2,
      disponible: function (s) { return s.artista.genero === "rap" && s.año >= 2; },
      generar: function (s) { return Under.EXTRA.crearEventoGeneroRap(s); }
    },
    {
      id: "gen_rock", peso: 2,
      disponible: function (s) { return s.artista.genero === "rock" && s.año >= 2; },
      generar: function (s) { return Under.EXTRA.crearEventoGeneroRock(s); }
    },
    {
      id: "gen_pop", peso: 2,
      disponible: function (s) { return s.artista.genero === "pop" && s.año >= 2; },
      generar: function (s) { return Under.EXTRA.crearEventoGeneroPop(s); }
    },
    {
      id: "gen_urban", peso: 2,
      disponible: function (s) { return s.artista.genero === "urban" && s.año >= 2; },
      generar: function (s) { return Under.EXTRA.crearEventoGeneroUrban(s); }
    },
    /* Carreras por género (PRIORIDAD 5): la segunda vuelta. Cuando
       la escena ya no te ve como promesa, cada género tiene su
       gran movimiento. Se apoya en js/generos.js. */
    {
      id: "gen2_rap", peso: 2,
      disponible: function (s) { return s.artista.genero === "rap" && s.año >= 5; },
      generar: function (s) { return Under.GENEROS.crearEventoGeneroRap2(s); }
    },
    {
      id: "gen2_rock", peso: 2,
      disponible: function (s) { return s.artista.genero === "rock" && s.año >= 5; },
      generar: function (s) { return Under.GENEROS.crearEventoGeneroRock2(s); }
    },
    {
      id: "gen2_pop", peso: 2,
      disponible: function (s) { return s.artista.genero === "pop" && s.año >= 5; },
      generar: function (s) { return Under.GENEROS.crearEventoGeneroPop2(s); }
    },
    {
      id: "gen2_urban", peso: 2,
      disponible: function (s) { return s.artista.genero === "urban" && s.año >= 5; },
      generar: function (s) { return Under.GENEROS.crearEventoGeneroUrban2(s); }
    },
    {
      id: "extra_serie", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.EXTRA.crearEventoSerie(s); }
    },
    {
      id: "extra_videojuego", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.EXTRA.crearEventoVideojuego(s); }
    },
    {
      id: "extra_publicidad", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.EXTRA.crearEventoPublicidad(s); }
    },
    {
      id: "extra_reality", peso: 2,
      disponible: function (s) { return s.año >= 2 && Under.STATE.nivelCarrera(s).nivel >= 1; },
      generar: function (s) { return Under.EXTRA.crearEventoReality(s); }
    },
    {
      id: "fan_club", peso: 2,
      disponible: function (s) { return s.stats.fans >= 500; },
      generar: function (s) { return Under.EXTRA.crearEventoFanClub(s); }
    },
    {
      id: "fan_hater", peso: 2,
      disponible: function (s) { return s.stats.fans >= 200; },
      generar: function (s) { return Under.EXTRA.crearEventoFanHater(s); }
    },
    {
      id: "fan_tatuaje", peso: 2,
      disponible: function (s) { return s.stats.fans >= 1000; },
      generar: function (s) { return Under.EXTRA.crearEventoFanTatuaje(s); }
    },
    {
      id: "under_casa", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.EXTRA.crearEventoCasa(s); }
    },
    {
      id: "under_plaza", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.EXTRA.crearEventoPlaza(s); }
    },
    {
      id: "under_video", peso: 2,
      disponible: function (s) {
        return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.EXTRA.crearEventoVideo(s); }
    },
    {
      id: "under_fanzine", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.EXTRA.crearEventoFanzine(s); }
    },
    {
      id: "under_estudio", peso: 2,
      disponible: function (s) {
        return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 3;
      },
      generar: function (s) { return Under.EXTRA.crearEventoEstudio(s); }
    },
    /* El oficio de hacer música: escribir, producir y jamear. */
    {
      id: "extra_letras", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1; },
      generar: function (s) { return Under.EXTRA.crearEventoEscribirLetras(s); }
    },
    {
      id: "extra_demo", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 2; },
      generar: function (s) { return Under.EXTRA.crearEventoDemoVieja(s); }
    },
    {
      id: "extra_producir", peso: 2,
      disponible: function (s) { return s.lanzamientos >= 1 && Under.STATE.nivelCarrera(s).nivel <= 4; },
      generar: function (s) { return Under.EXTRA.crearEventoSesionProductor(s); }
    },
    {
      id: "extra_jam_estudio", peso: 2,
      disponible: function (s) { return s.año >= 1 && Under.STATE.nivelCarrera(s).nivel <= 4; },
      generar: function (s) { return Under.EXTRA.crearEventoJamEstudio(s); }
    },
    /* Memoria de decisiones (PRIORIDAD 2): lo que hiciste años
       atrás vuelve. Tres hilos narrativos que reabren viejas
       cuentas cuando la escena ya cambió. */
    {
      id: "mem_productor", peso: 1,
      disponible: function (s) {
        return s.año >= 5 && s.año <= 8 && !s.flags.memProductorUsado &&
          !!Under.MEMORIA && Under.MEMORIA.recuerda(s, "rechazoProductor");
      },
      generar: function (s) { return Under.MEMORIA.crearEventoProductor(s); }
    },
    {
      id: "mem_escena", peso: 1,
      disponible: function (s) {
        if (!Under.MEMORIA) return false;
        if (s.flags.memEscenaEsteAnio) return false;
        if (Under.MEMORIA.cuantas(s) < 2) return false;
        if (s.ultimaMemEscena && s.año - s.ultimaMemEscena < 3) return false;
        return s.reputacion >= 55 || s.reputacion <= 40;
      },
      generar: function (s) { return Under.MEMORIA.crearEventoEscena(s); }
    },
    /* Canciones y éxito (PRIORIDAD 4): el catálogo tiene vida.
       Un tema viejo puede volver a sonar (resurgimiento) y un
       gran éxito seguido de flojos abre la duda del one-hit
       wonder. Ambos responden al historial de lanzamientos. */
    {
      id: "cat_revival", peso: 1,
      disponible: function (s) {
        if (!Under.CANCIONES) return false;
        if (s.flags.revivalEsteAnio) return false;
        if (s.flags.ultimoRevival && s.año - s.flags.ultimoRevival < 3) return false;
        if (s.stats.fans < 1500) return false;
        return !!Under.CANCIONES._candidatoRevival(s);
      },
      generar: function (s) { return Under.CANCIONES.crearEventoRevival(s); }
    },
    {
      id: "cat_onehit", peso: 1,
      disponible: function (s) {
        if (!Under.CANCIONES) return false;
        if (s.flags.oneHitUsado) return false;
        if (s.año < 3) return false;
        if (!Under.CANCIONES._ultimoHit(s)) return false;
        return Under.CANCIONES._flojosDesdeHit(s) >= 2;
      },
      generar: function (s) { return Under.CANCIONES.crearEventoOneHit(s); }
    },
    /* Eventos de contexto (PRIORIDAD 6): la disponibilidad lee el
       estado real y el peso es dinámico (función del estado), así
       el mismo pool se inclina según cómo vaya la carrera. */
    {
      id: "ctx_reputacion_alta", peso: function (s) { return s.reputacion >= 70 ? 3 : 0; },
      disponible: function (s) { return s.reputacion >= 70 && s.año >= 3; },
      generar: function (s) { return Under.CONTEXTO.crearEventoReputacionAlta(s); }
    },
    {
      id: "ctx_reputacion_baja", peso: function (s) { return s.reputacion <= 38 ? 3 : 0; },
      disponible: function (s) { return s.reputacion <= 38 && s.año >= 3; },
      generar: function (s) { return Under.CONTEXTO.crearEventoReputacionBaja(s); }
    },
    {
      id: "ctx_momentum_alto", peso: function (s) { return s.momentum >= 55 ? 3 : 0; },
      disponible: function (s) { return s.momentum >= 55; },
      generar: function (s) { return Under.CONTEXTO.crearEventoMomentumAlto(s); }
    },
    {
      id: "ctx_momentum_bajo", peso: function (s) { return s.momentum <= 18 ? 3 : 0; },
      disponible: function (s) { return s.momentum <= 18 && s.año >= 3; },
      generar: function (s) { return Under.CONTEXTO.crearEventoMomentumBajo(s); }
    },
    {
      id: "ctx_legado", peso: function (s) { return s.legado >= 35 ? 3 : 0; },
      disponible: function (s) { return s.legado >= 35 && s.año >= 8; },
      generar: function (s) { return Under.CONTEXTO.crearEventoLegado(s); }
    },
    {
      id: "ctx_hype", peso: function (s) { return (s.hype || 0) >= 55 ? 3 : 0; },
      disponible: function (s) { return (s.hype || 0) >= 55 && s.año >= 2; },
      generar: function (s) { return Under.CONTEXTO.crearEventoHype(s); }
    },
    /* Red de contactos (PRIORIDAD 7): la escena se mueve con
       personas. Los vínculos construidos (o descuidados) cambian
       qué se te ofrece y en qué condiciones. */
    {
      id: "rel_productor", peso: function (s) {
        var prod = Under.RELACIONES ? Under.RELACIONES.mejorVinculo(s, "productor") : null;
        return prod ? 3 : 2;
      },
      disponible: function (s) { return s.año >= 2 && !s.flags.relProductorEsteAnio; },
      generar: function (s) { return Under.RELACIONES.crearEventoProductor(s); }
    },
    {
      id: "rel_colega", peso: 2,
      disponible: function (s) { return s.año >= 2 && !s.flags.relColegaEsteAnio; },
      generar: function (s) { return Under.RELACIONES.crearEventoColega(s); }
    },
    {
      id: "rel_aliado", peso: function (s) {
        var aliado = Under.RELACIONES ? Under.RELACIONES.mejorVinculo(s, "aliado") : null;
        return aliado ? 3 : 2;
      },
      disponible: function (s) { return s.año >= 3 && !s.flags.relAliadoEsteAnio; },
      generar: function (s) { return Under.RELACIONES.crearEventoAliado(s); }
    },
    /* Contratos y economía (PRIORIDAD 8): la renegociación se
       ofrece fuerte cuando el contrato está por vencer; las
       cláusulas pueden caer en cualquier momento del contrato. */
    {
      id: "ctr_renegociar", peso: function (s) {
        return Under.CONTRATOS && Under.CONTRATOS.cercaDeVencer(s) ? 4 : 0;
      },
      disponible: function (s) {
        return !!s.sello && !s.flags.selloRenegociadoEsteAnio && Under.CONTRATOS.cercaDeVencer(s);
      },
      generar: function (s) { return Under.CONTRATOS.crearEventoRenegociar(s); }
    },
    {
      id: "ctr_clausulas", peso: 2,
      disponible: function (s) {
        return !!s.sello && s.año >= 2 && !s.flags.ctrClausulaEsteAnio && !s.sello.exclusivo;
      },
      generar: function (s) { return Under.CONTRATOS.crearEventoClausulas(s); }
    },
    /* Crisis, recuperación y evolución (PRIORIDAD 9): el estado
       real de la carrera decide qué te pasa. Tocar fondo pesa
       fuerte cuando el momentum y la popularidad se hunden; el
       rebote aparece cuando salís; la evolución es una opción
       natural en años estables. */
    {
      id: "cris_fondo", peso: function (s) {
        return (s.momentum <= 22 && s.stats.popularity <= 38 && s.año >= 3) ? 4 : 0;
      },
      disponible: function (s) {
        return s.año >= 3 && !s.flags.crisFondoEsteAnio &&
          s.momentum <= 22 && s.stats.popularity <= 38;
      },
      generar: function (s) { return Under.CRISIS.crearEventoFondo(s); }
    },
    {
      id: "cris_rebote", peso: function (s) {
        return (s.flags.estuvoEnCrisis && s.momentum >= 45 && !s.flags.crisReboteEsteAnio) ? 3 : 0;
      },
      disponible: function (s) {
        return s.año >= 3 && s.flags.estuvoEnCrisis && s.momentum >= 45 && !s.flags.crisReboteEsteAnio;
      },
      generar: function (s) { return Under.CRISIS.crearEventoRebote(s); }
    },
    {
      id: "cris_evolucion", peso: function (s) {
        var estable = !(s.momentum <= 22) && s.año >= 4;
        return estable && !s.flags.crisEvoEsteAnio ? 2 : 0;
      },
      disponible: function (s) {
        return s.año >= 4 && !s.flags.crisEvoEsteAnio &&
          !(s.momentum <= 22 && s.stats.popularity <= 38);
      },
      generar: function (s) { return Under.CRISIS.crearEventoEvolucion(s); }
    }
  ],

  /* ---------- Eventos guionados ----------
     Un evento aparece cuando:
       - la era y el rango de años coinciden con la carrera
       - las condiciones (flags / popularidad) se cumplen
       - todavía no fue usado

     prioridad 0 → hitos narrativos (aparecen primero)
     prioridad 1 → oportunidades
     prioridad 2 → color / azar

     importante: true → muestra el resultado de la decisión
     (el resto se ve en las estadísticas, sin popup)

     opciones:
       efectos   → objeto de stats o función(state)
       especial  → id de efecto especial (ej: "viral")
       flags     → flags que se activan al elegir
       resultado → texto o función(state, efectos)
       log       → texto para el historial  */
  EVENTS: [
    /* ================= AÑO 1 ================= */
    {
      id: "primer_tema",
      prioridad: 0,
      era: ["comienzos"],
      añoMin: 1, añoMax: 1,
      titulo: "Tu primer tema",
      texto: "Tenés 18 años y hace meses grabás canciones en tu habitación con lo que tenés: una compu vieja y un micrófono prestado.\n\nHoy por fin terminaste tu primer tema.\n\n¿Qué hacés?",
      opciones: [
        {
          texto: "Publicarlo ya, tal cual está",
          resultado: "Lo subís a todas las plataformas esa misma noche. No está perfecto, pero es tuyo. Toca alguna gente de tu barrio, y un par de desconocidos lo comparten.",
          efectos: { fans: 80, popularity: 4 },
          riesgo: 0.25,
          riesgoEfectos: { fans: 15, popularity: 1, talent: -1 },
          riesgoResultado: "Lo subís crudo esa misma noche. La mezcla no aguanta y el tema pasa sin pena ni gloria. Aprendés a la fuerza que publicar sin pulir puede salir caro.",
          riesgoLog: "Publicaste tu primer tema crudo y no la pegó.",
          flags: { primerTema: true, primeroCrudo: true },
          log: "Publicaste tu primer tema, crudo y directo."
        },
        {
          texto: "Pulirlo semanas hasta que suene bien",
          resultado: "Pasás semanas enteras rehaciendo la mezcla, googleando tutoriales, durmiendo cuatro horas. Cuando lo subís, suena mil veces mejor. El sacrificio se nota.",
          efectos: { money: -60, talent: 2, fans: 40, popularity: 2 },
          flags: { primerTema: true, primeroPulido: true },
          log: "Publicaste tu primer tema después de pulirlo semanas."
        },
        {
          texto: "Mostrárselo solo a tus amigos",
          resultado: "Lo escuchan un puñado de personas. Una amiga lo sube a su historia y genera charla. No llega lejos, pero los que lo escucharon lo guardaron.",
          efectos: { fans: 25, talent: 1, popularity: 1 },
          flags: { primerTema: true, primeroPrivado: true },
          log: "Mostraste tu primer tema solo a tus amigos."
        }
      ]
    },

    {
      id: "productor_local",
      prioridad: 1,
      era: ["comienzos"],
      añoMin: 1, añoMax: 2,
      condiciones: { flags: { primerTema: true } },
      titulo: "Un productor local te contactó",
      texto: function (s) {
        /* Nombre de la escena real: se guarda para que la memoria
           (años 5-8) hable de la misma persona. */
        if (!s.flags.productorNombre) s.flags.productorNombre = Under.DATA.escena({ rol: "artista" }).nombre;
        return s.flags.productorNombre + ", un productor de tu ciudad, escuchó tu tema. Te ofrece grabar en un estudio de verdad, con un sonido profesional.\n\nA cambio, quiere un porcentaje de tus canciones futuras.\n\n¿Qué hacés?";
      },
      opciones: [
        {
          texto: "Aceptar y grabar con él",
          resultado: function (s) {
            return "Entrás a un estudio por primera vez. Escuchás tu voz con un sonido que nunca habías logrado. Firmás el acuerdo con " + (s.flags.productorNombre || "el productor") + " y sentís que diste un paso.";
          },
          efectos: { money: -80, talent: 2, fans: 150, popularity: 3 },
          flags: { trabajoConProductor: true },
          log: "Aceptaste grabar con un productor local."
        },
        {
          texto: "Rechazar y seguir solo",
          resultado: "Preferís no ceder nada de tu música a nadie. Seguís grabando en tu habitación, con el control total.",
          efectos: { talent: 2, fans: 10 },
          flags: { rechazoProductor: true },
          log: "Rechazaste al productor local."
        },
        {
          texto: "Negociar un trato puntual",
          resultado: "Negociás durante semanas. Al final cede: grabás una sola canción, sin porcentaje. Cuesta más plata, pero te quedás limpio.",
          efectos: { money: -120, talent: 1, fans: 100, popularity: 2 },
          flags: { trabajoConProductor: true, tratoPuntual: true },
          log: "Negociaste un trato puntual con el productor."
        }
      ]
    },

    {
      id: "playlist_barrio",
      prioridad: 2,
      era: ["comienzos"],
      añoMin: 1, añoMax: 2,
      condiciones: { flags: { primerTema: true } },
      titulo: "Tu tema entró a una playlist",
      texto: "Unos meses después, un curador de playlists de música local agrega tu tema a una lista con 40.000 seguidores.\n\nLas reproducciones empiezan a crecer.",
      opciones: [
        {
          texto: "Dejarlo fluir natural",
          resultado: "No hacés nada y la playlist hace su magia. La gente descubre tu tema sola.",
          efectos: { fans: 400, popularity: 5 },
          flags: { playlist: true },
          log: "Tu tema entró en una playlist local y fluyó solo."
        },
        {
          texto: "Crear contenido para aprovecharlo",
          resultado: "Grabás videos tocando la canción, la mostrás en vivo, respondés comentarios. Cada vista se convierte en un seguidor.",
          efectos: { money: -50, fans: 600, popularity: 4 },
          flags: { playlist: true },
          log: "Aprovechaste la playlist generando contenido."
        },
        {
          texto: "Subir otro tema enseguida",
          resultado: "Apostás al calor del momento y subís un tema nuevo. No está tan pulido, pero la gente está escuchando.",
          efectos: { fans: 250, popularity: 3, talent: -1 },
          flags: { playlist: true, temaApresurado: true },
          log: "Subiste otro tema apurado por el momento."
        }
      ]
    },

    /* ================= AÑO 2 ================= */
    {
      id: "primer_concierto",
      prioridad: 0,
      era: ["comienzos"],
      añoMin: 2, añoMax: 3,
      titulo: "Tu primer concierto",
      texto: "Los de Family Racks te ofrecen tu primera fecha en Pétalos del Sol. Pagan poco, el lugar es chico, pero es tu primer escenario real frente a gente que no conocés.",
      opciones: [
        {
          texto: "Aceptar sin dudar",
          resultado: "Subís al escenario de Pétalos del Sol por primera vez, con Family Racks al lado. El miedo se va después de la primera canción. Al terminar, alguien te pide una foto.",
          efectos: { money: 80, fans: 200, popularity: 3 },
          log: "Dio su primer concierto en Pétalos del Sol con Family Racks."
        },
        {
          texto: "Pedir más plata",
          resultado: "Pedís un poco más y los de Family Racks se tensan. Al final aceptan, pero a regañadientes. Tocás ante un público chico y la historia queda un poco incómoda.",
          efectos: { money: 140, fans: 160, popularity: 2 },
          log: "Negociaste tu primer concierto."
        },
        {
          texto: "No estás listo todavía",
          resultado: "Lo dejas pasar. Preferís tener más material antes de subirte a un escenario.",
          efectos: { talent: 1, popularity: -1 },
          log: "Declinaste tu primer concierto."
        }
      ]
    },

    {
      id: "critica_coscu",
      prioridad: 1,
      era: ["comienzos"],
      añoMin: 2, añoMax: 3,
      titulo: "La crítica de Coscu",
      texto: "Coscu escucha tu tema en vivo en su stream y lo analiza: la mitad es elogio sincero; la otra mitad te critica fuerte. Todo su público lo está viendo.",
      opciones: [
        {
          texto: "Responder con altura",
          resultado: "Agradecés los elogios y aceptás las críticas en el chat del stream. Coscu te anota en el radar y la gente valora tu madurez.",
          efectos: { fans: 150, popularity: 3 },
          log: "Respondiste con altura a la crítica de Coscu."
        },
        {
          texto: "Bardearlo en redes",
          resultado: "Lo escrachás en una historia. La polémica genera ruido, pero parte de la gente se aleja.",
          efectos: { fans: -100, popularity: 2 },
          log: "Bardeó a Coscu en redes."
        },
        {
          texto: "Ignorarla y seguir trabajando",
          resultado: "No le das ni cinco de pelota. Seguís grabando, y con el tiempo la crítica de Coscu pierde peso.",
          efectos: { talent: 1, fans: 20 },
          log: "Ignoraste la crítica de Coscu."
        }
      ]
    },

    /* ================= AÑO 3 ================= */
    {
      id: "noche_escena",
      prioridad: 2,
      era: ["comienzos"],
      añoMin: 1, añoMax: 2,
      condiciones: { flags: { primerTema: true } },
      titulo: "Una noche en la escena",
      texto: "En un local del centro arman una noche de la escena: tres bandas, un puñado de artistas y mucha gente que todavía no te conoce.\n\nTe avisan a último momento que hay un espacio libre en el cartel.",
      opciones: [
        {
          texto: "Subir a improvisar",
          resultado: "Te subís sin red. Improvisás un tema suelto frente a desconocidos. La mitad de la sala ni te mira; la otra mitad se pega el nombre.",
          efectos: function (state) {
            if (Math.random() < 0.5) return { talent: 2, fans: Under.SYSTEMS.fansEscala(state, 150), popularity: 3 };
            return { popularity: -1, fans: -Under.SYSTEMS.fansEscala(state, 50) };
          },
          flags: { subioEscena: true },
          log: "Improvisó una noche en la escena local."
        },
        {
          texto: "Mirar y aprender",
          resultado: "No tocás. Mirás cómo se mueven los que ya tienen nombre en la escena y anotás todo lo que ellos hacen mal… y bien.",
          efectos: { talent: 1 },
          log: "Fue a mirar una noche de la escena."
        },
        {
          texto: "Vender tu merch casera",
          resultado: "Llevás unas remeras estampadas a mano y las vendés a los pocos que ya te conocen. Poca plata, pero es plata.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 40), fans: 30 }; },
          log: "Vendió su primer merch casera en una noche de escena."
        }
      ]
    },

    {
      id: "merch_barrio",
      prioridad: 2,
      era: ["comienzos", "ascenso"],
      añoMin: 2, añoMax: 4,
      condiciones: { flags: { primerTema: true } },
      titulo: "Tu primer merch",
      texto: "Unos chicos de fuego te preguntan si tenés remeras o stickers.\n\nNo tenés dudas. El momento parece pedir que arranques con la merca… digo, con el merch.",
      opciones: [
        {
          texto: "Hacer un tiraje chico",
          resultado: "Encargás un tiraje chico de remeras y stickers. Vuelan entre tus conocidos y en la próxima fecha alguien las usa.",
          efectos: function (state) { return { money: -Under.SYSTEMS.efectivoEscala(state, 80), fans: Under.SYSTEMS.fansEscala(state, 200), popularity: 1 }; },
          flags: { hizoMerch: true },
          log: "Hizo su primer tiraje de merch."
        },
        {
          texto: "Diseños digitales, sin costo",
          resultado: "Hacés stickers digitales y los regalás con tus historias. Casi gratis, casi nadie los usa, pero algo queda.",
          efectos: { money: -10, fans: 80 },
          flags: { hizoMerch: true },
          log: "Hizo merch digital sin costo."
        },
        {
          texto: "No por ahora",
          resultado: "Tu foco sigue siendo la música. El merch espera.",
          efectos: { talent: 1 },
          log: "Dejó pasar la chance de hacer merch."
        }
      ]
    },

    {
      id: "sello_pequeno",
      prioridad: 1,
      era: ["comienzos"],
      añoMin: 3, añoMax: 4,
      importante: true,
      titulo: "Un sello independiente te busca",
      texto: "Un sello chico e independiente se contacta. Ofrecen financiar tu próximo lanzamiento y distribuirlo en todas las plataformas, a cambio del 30% de tus ingresos.",
      opciones: [
        {
          texto: "Firmar el contrato",
          resultado: "Firmás. Te dan un adelanto de plata y tu próximo lanzamiento llega a todos lados. Pero ahora algo de tu música ya no es solo tuya.",
          efectos: function (state) {
            state.sello = Under.SELLO.crear("pequeno", state.año);
            return { money: 1500, fans: 2000, popularity: 6 };
          },
          flags: { selloPequeno: true },
          log: "Firmaste con un sello independiente."
        },
        {
          texto: "Seguir independiente",
          resultado: "Decidís que tu música sea solo tuya. Más difícil, más lento, pero 100% libre.",
          efectos: function (state) {
            state.sello = null;
            return { talent: 2, popularity: 2 };
          },
          flags: { independiente: true },
          log: "Seguiste independiente."
        },
        {
          texto: "Negociar un contrato de un solo disco",
          resultado: "Negociás un contrato acotado: un solo disco, sin atarte más allá. Ceden porque tu música les gusta.",
          efectos: function (state) {
            state.sello = Under.SELLO.crear("pequeno", state.año);
            return { money: 700, fans: 1000, popularity: 5 };
          },
          flags: { selloPequeno: true, contratoUnDisco: true },
          log: "Firmaste un contrato de un solo disco con el sello."
        }
      ]
    },

    /* ---------- Evento ENCADENADO: solo si trabajaste con el productor ---------- */
    {
      id: "productor_recomienda",
      prioridad: 1,
      era: ["ascenso"],
      añoMin: 3, añoMax: 5,
      condiciones: { flags: { trabajoConProductor: true } },
      importante: true,
      titulo: "Una recomendación que vale oro",
      texto: "Killpay, el productor con el que trabajaste años atrás, ahora labura con un estudio grande.\n\nTe recomienda para grabar una sesión ahí.",
      opciones: [
        {
          texto: "Aceptar la recomendación",
          resultado: "Grabás en un estudio de primer nivel gracias a Killpay. Los ingenieros quedan sorprendidos. Tu música entra en otra liga.",
          efectos: { money: -100, talent: 3, fans: 1500, popularity: 5 },
          flags: { estudioGrande: true },
          log: "Grabaste en un estudio grande gracias a la recomendación de Killpay."
        },
        {
          texto: "Agradecer pero seguir tu camino",
          resultado: "Agradecés el gesto de Killpay, pero preferís seguir grabando donde ya tenés confianza. Él respeta tu decisión.",
          efectos: { talent: 1 },
          log: "Declinaste la recomendación de Killpay."
        }
      ]
    },

    {
      id: "viral_clip",
      prioridad: 2,
      era: ["ascenso"],
      añoMin: 3, añoMax: 6,
      importante: true,
      titulo: "Un video tuyo se está compartiendo",
      texto: "Alguien grabó de cerca, con el celular, un video tuyo freestyleando en la ronda de La Sobre y se está compartiendo por los grupos. En dos días tiene miles de vistas y ya le suman memes.\n\nNadie sabe qué va a pasar.",
      opciones: [
        {
          texto: "Subirlo a tus plataformas",
          especial: "viral",
          efectos: {},
          resultado: function (state, efectos) {
            if (efectos.fans >= 4000) {
              return "Apostás al momento y lo subís a tus plataformas. El video explota: tus seguidores se triplican en semanas.";
            }
            return "Lo subís a tus plataformas. Pega, pero no explota como esperabas. Igual, más gente que ayer te está escuchando.";
          },
          log: "Aprovechaste un video viral en plataformas."
        },
        {
          texto: "Grabar una versión de estudio",
          resultado: "Entrás al estudio a grabar una versión cuidada del video. Sale bien, y la gente valora el esfuerzo.",
          efectos: { money: -200, talent: 1, fans: 1500, popularity: 7 },
          log: "Grabaste una versión de estudio del video viral."
        },
        {
          texto: "No darle bola",
          resultado: "No le das importancia. La ola pasa, pero un poco de gente quedó.",
          efectos: { fans: 100 },
          log: "Ignoraste un momento con potencial viral."
        }
      ]
    },

    /* ================= ERA CONSOLIDACIÓN ================= */
    {
      id: "conflicto_disco",
      prioridad: 0,
      era: ["consolidacion", "cima"],
      añoMin: 6, añoMax: 15,
      importante: true,
      titulo: "Un tropiezo en la carrera",
      texto: "Tu último trabajo no pegó. El público no lo escuchó, la crítica lo ignoró, y el hype que habías construido se está enfriando.",
      opciones: [
        {
          texto: "Lanzar algo comercial rápido",
          resultado: "Reaccionás con un single pensado para sumar números. Recuperás algo de terreno, pero los que te siguen por tu arte lo notan.",
          efectos: { popularity: 6, money: 400, talent: -2 },
          log: "Reaccionaste al tropiezo con algo comercial."
        },
        {
          texto: "Tomarte una pausa",
          resultado: "Desaparecés un tiempo. Cuando volvés, lo hacés con algo que te represente de verdad.",
          efectos: { talent: 2, popularity: -5, fans: -300 },
          log: "Te tomaste una pausa tras un tropiezo."
        },
        {
          texto: "Doblar la apuesta artística",
          resultado: "Hacés tu trabajo más personal hasta ahora. No suma números, pero el público que te entiende te defiende.",
          efectos: { talent: 3, popularity: -3, fans: -200 },
          log: "Doblaste la apuesta artística."
        }
      ]
    },

    {
      id: "oferta_publicidad",
      prioridad: 1,
      era: ["consolidacion", "cima", "legado"],
      añoMin: 7, añoMax: 22,
      importante: true,
      titulo: "Nike y Adidas te quieren",
      texto: "Nike y Adidas se pelean por tu cara: te ofrecen ser la imagen de la próxima campaña. Paga MUY bien.\n\nPero sabés que tu público va a hablar de 'vendido'.",
      opciones: [
        {
          texto: "Aceptar el contrato",
          resultado: "Cobrás una cifra que cambia tu vida. Las reproducciones y la visibilidad explotan, aunque algo de la escena te dé la espalda.",
          efectos: { money: 5000, fans: 5000, popularity: 8 },
          log: "Firmaste un contrato publicitario grande."
        },
        {
          texto: "Rechazar la oferta",
          resultado: "Lo dejás pasar. Tu público celebra que no te vendiste, y tu carrera sale intacta.",
          efectos: { popularity: 2, talent: 1 },
          log: "Rechazaste una oferta publicitaria."
        },
        {
          texto: "Negociar una campaña sutil",
          resultado: "Negociás para que la campaña sea más sutil y alineada a tu imagen. Cobrás bien, y el golpe a tu imagen es menor.",
          efectos: { money: 2500, fans: 2500, popularity: 5 },
          log: "Negociaste una campaña publicitaria sutil."
        }
      ]
    },

    /* ================= ERA LEGADO ================= */
    {
      id: "definir_legado",
      prioridad: 0,
      era: ["legado"],
      añoMin: 18, añoMax: 25,
      importante: true,
      titulo: "Tu historia se está escribiendo",
      texto: "Estás cumpliendo años de carrera. Un canal importante quiere documentar tu historia.\n\nAntes de la entrevista, te preguntás: ¿qué querés que digan de vos?",
      opciones: [
        {
          texto: "La música siempre primero",
          resultado: "Viviste por la música y la música te respondió. Tu carrera fue una obra, no una estadística.",
          efectos: { talent: 3, popularity: -2 },
          log: "Definió su legado: la música primero."
        },
        {
          texto: "El artista que llenó estadios",
          resultado: "Tu nombre es sinónimo de multitudes. La gente va a recordar la fiesta.",
          efectos: { popularity: 10, money: 3000, fans: 20000 },
          log: "Definió su legado: estadios llenos."
        },
        {
          texto: "Alguien que nunca dejó de ser auténtico",
          resultado: "Cada etapa de tu carrera fue real. Eso no se compra.",
          efectos: { talent: 2, popularity: 1 },
          log: "Definió su legado: autenticidad."
        }
      ]
    }
  ],

  /* ---------- Eventos genéricos ----------
     Se usan cuando no hay eventos guionados disponibles.
     efectos/log/resultado pueden ser funciones(state).
     Así la carrera funciona hasta el año 25 sin quedarse en seco. */
  TEMPLATES: [
    {
      id: "tpl_grabar",
      titulo: "Sesión de estudio",
      texto: "La carrera sigue. Este año tenés la chance de grabar una sesión nueva en condiciones.\n\n¿Cómo la encarás?",
      opciones: [
        {
          texto: "Grabar sin límites",
          resultado: "Metés horas y horas. El material queda fuerte, aunque la billetera lo siente.",
          efectos: function (state) { return { money: -Under.SYSTEMS.efectivoEscala(state, 300), talent: 2 }; },
          log: "Tuviste una sesión de estudio a full."
        },
        {
          texto: "Producir en casa",
          resultado: "Trabajás con lo que tenés, más tranquilo. Menos gasto, más control.",
          efectos: function (state) { return { money: -Under.SYSTEMS.efectivoEscala(state, 80), talent: 1 }; },
          log: "Produciste en casa."
        },
        {
          texto: "Grabar con un productor nuevo",
          resultado: function (state) {
            return "Sumás a " + Under.DATA.escena({ rol: "artista" }).nombre + ", un productor que te aporta otra mirada. El resultado sorprende.";
          },
          efectos: function (state) { return { money: -Under.SYSTEMS.efectivoEscala(state, 200), talent: 2, fans: Under.SYSTEMS.fansEscala(state, 300) }; },
          log: "Grabaste con un productor nuevo."
        }
      ]
    },
    {
      id: "tpl_prensa",
      titulo: "Una entrevista en un medio",
      texto: "Un medio de comunicación quiere entrevistarte.\n\n¿Cómo la jugás?",
      opciones: [
        {
          texto: "Ser frontal y honesto",
          resultado: "Tus respuestas se vuelven frases. La gente te conoce un poco más.",
          efectos: function (state) { return { popularity: 3, fans: Under.SYSTEMS.fansEscala(state, 800) }; },
          log: "Diste una entrevista frontal."
        },
        {
          texto: "Cuidar tu imagen",
          resultado: "Respondés con cuidado, sin dar notas polémicas. Sólido, pero un poco frío.",
          efectos: function (state) { return { popularity: 2, fans: Under.SYSTEMS.fansEscala(state, 400) }; },
          log: "Diste una entrevista cuidada."
        },
        {
          texto: "Cancelar la entrevista",
          resultado: "No tenés ganas de exponerte. El medio no lo toma bien.",
          efectos: function (state) { return { popularity: -1 }; },
          log: "Cancelaste una entrevista."
        }
      ]
    },
    {
      id: "tpl_redes",
      titulo: "Redes sociales",
      texto: "Tus redes están activas y el público interactúa.\n\n¿Qué hacés este año?",
      opciones: [
        {
          texto: "Publicar contenido constante",
          resultado: "Historias, detrás de escena, adelantos. Tu público te siente cerca.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 1200), popularity: 3, money: -Under.SYSTEMS.efectivoEscala(state, 60) }; },
          log: "Publicaste contenido constante en redes."
        },
        {
          texto: "Mostrar tu proceso creativo",
          resultado: "Compartís cómo componés. La escena valora lo artesanal.",
          efectos: function (state) { return { talent: 1, fans: Under.SYSTEMS.fansEscala(state, 500), popularity: 1 }; },
          log: "Mostraste tu proceso creativo."
        },
        {
          texto: "Desconectar un poco",
          resultado: "Apagás el teléfono y componés tranquilo. Tu música lo nota.",
          efectos: function (state) { return { talent: 2 }; },
          log: "Te desconectaste de las redes."
        }
      ]
    },
    {
      id: "tpl_concierto",
      titulo: "Una fecha en vivo",
      texto: "Te ofrecen tocar en un lugar acorde a tu carrera.\n\n¿Aceptás?",
      opciones: [
        {
          texto: "Aceptar la fecha",
          resultado: "El público va a verte. Sale bien y deja gente nueva.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 600), fans: Under.SYSTEMS.fansEscala(state, 2000), popularity: 3 }; },
          log: "Tocaste en una fecha en vivo."
        },
        {
          texto: "Negociar un caché mayor",
          resultado: "Pedís más y lo conseguís. Ajustado, pero pagaron.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 1100), fans: Under.SYSTEMS.fansEscala(state, 1400), popularity: 2 }; },
          log: "Negociaste el caché de una fecha."
        },
        {
          texto: "Dejar la fecha",
          resultado: "Preferís enfocarte en el estudio este año.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Dejaste pasar una fecha en vivo."
        }
      ]
    },
    {
      id: "tpl_socio",
      titulo: "Propuesta de la industria",
      texto: "Alguien de la industria te acerca una propuesta: una gira chica, una colaboración, un proyecto paralelo.\n\nTenés que decidir.",
      opciones: [
        {
          texto: "Sumarte al proyecto",
          resultado: "Te sumás y el proyecto avanza. Sumás contactos y experiencia.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 400), fans: Under.SYSTEMS.fansEscala(state, 800), popularity: 3 }; },
          log: "Te sumaste a un proyecto de la industria."
        },
        {
          texto: "Proponer tu propia idea",
          resultado: "Convertís la propuesta en algo tuyo. La industria te escucha.",
          efectos: function (state) { return { talent: 1, money: Under.SYSTEMS.dineroEscala(state, 150), popularity: 2 }; },
          log: "Propusiste tu propia idea a la industria."
        },
        {
          texto: "Declinar con elegancia",
          resultado: "No es tu momento. Lo decís con respeto y nadie se ofende.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Declinaste una propuesta de la industria."
        }
      ]
    },
    {
      id: "tpl_beats",
      titulo: "Alguien quiere tus beats",
      texto: function (state) {
        return Under.DATA.escena({ rol: "artista" }).nombre + ", un artista emergente de la escena, te escribe pidiendo comprarte beats o instrumentales que hiciste de más.\n\n¿Qué hacés?";
      },
      opciones: [
        {
          texto: "Venderlos",
          resultado: "Vendés un par de instrumentales. Plata rápida, aunque esa música ya no será tuya.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 150), _energia: -5 }; },
          log: "Vendió instrumentales propios."
        },
        {
          texto: "Guardarlos para tu próximo material",
          resultado: "Preferís reservarlos. En el estudio suenan cada vez mejor.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Reservó sus instrumentales para su material."
        },
        {
          texto: "Regalarle uno a un amigo",
          resultado: "Se lo regalás a un pibe con hambre. Queda en deuda, y en la escena eso vale plata.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 100), popularity: 1 }; },
          log: "Regaló un instrumental a un amigo de la escena."
        }
      ]
    },
    {
      id: "tpl_fan",
      titulo: "Un fan se hizo viral con tu música",
      texto: "Un fan filmó un video reaccionando a una de tus canciones y se está compartiendo de a poco.\n\nEl tipo te adora y no pide nada a cambio.",
      opciones: [
        {
          texto: "Recompensarlo públicamente",
          resultado: "Lo mencionás en tus redes y le mandás un mensaje. El video explota un poco más y la gente nota que sos de verdad.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 400), popularity: 2 }; },
          log: "Recompensó a un fan viral."
        },
        {
          texto: "Compartirlo y listo",
          resultado: "Lo reposteás con un gracias seco. Ayuda, aunque el gesto quedó a medias.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 150), popularity: 1 }; },
          log: "Compartió el video de un fan."
        },
        {
          texto: "Dejarlo pasar",
          resultado: "No le das pelota. El video muere solo y el fan se queda esperando.",
          efectos: { popularity: -1 },
          log: "Ignoró el video viral de un fan."
        }
      ]
    },
    {
      id: "tpl_reunion",
      titulo: "Una reunión de la industria",
      texto: "Un ejecutivo te invita a una reunión para 'conocer tu próximo proyecto'.\n\nSiempre es una reunión, nunca se sabe de qué.",
      opciones: [
        {
          texto: "Ir preparado",
          resultado: "Llevás maquetas, números y una idea clara. La reunión sale mejor de lo esperado.",
          efectos: function (state) { return { popularity: 2, money: Under.SYSTEMS.dineroEscala(state, 200), _energia: -5 }; },
          log: "Fue a una reunión de la industria bien preparado."
        },
        {
          texto: "Ir informal",
          resultado: "Vas sin nada preparado. La charla es distendida, pero se te escapan oportunidades.",
          efectos: function (state) { return { popularity: 1, money: Under.SYSTEMS.dineroEscala(state, 60) }; },
          log: "Fue a una reunión de la industria sin prepararse."
        },
        {
          texto: "Mandar a tu manager",
          resultado: "Tu gente habla por vos. A veces alcanza, a veces no.",
          efectos: function (state) {
            var tiene = Under.EQUIPO && Under.EQUIPO.tiene(state, "manager");
            return tiene ? { popularity: 2, money: Under.SYSTEMS.dineroEscala(state, 250) } : { popularity: -1 };
          },
          log: "Mandó a su representante a una reunión."
        }
      ]
    },
    {
      id: "tpl_sync",
      titulo: "Quieren tu música para una película",
      texto: "Una productora audiovisual quiere licenciar uno de tus temas para una escena clave.\n\nPagan por usar tu música, pero la ceden a una película que no conocés.",
      opciones: [
        {
          texto: "Aceptar la licencia",
          resultado: "La plata entra y tu tema suena en pantalla grande. La exposición vale lo que vale.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 500), fans: Under.SYSTEMS.fansEscala(state, 400), popularity: 2 }; },
          log: "Licenció un tema para una película."
        },
        {
          texto: "Pedir ver el guion",
          resultado: "Exigís leer el guion antes. Si no te gusta, lo rechazás; si te convence, cobrás más.",
          efectos: function (state) { return { money: Under.SYSTEMS.dineroEscala(state, 350), popularity: 1, talent: 1 }; },
          log: "Negoció la licencia de un tema para cine."
        },
        {
          texto: "Rechazar",
          resultado: "Tu música no se presta sin control. La oportunidad pasa de largo.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Rechazó licenciar un tema para cine."
        }
      ]
    },
    {
      id: "tpl_directo",
      titulo: "Un directo improvisado",
      texto: "Una radio o un streaming te pide que cantes en vivo, sin red, a pedido del público.",
      opciones: [
        {
          texto: "Aceptar el desafío",
          resultado: "Cantás en vivo con lo que sale. La espontaneidad le gana a la perfección.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 700), popularity: 3, _energia: -8 }; },
          log: "Hizo un directo improvisado."
        },
        {
          texto: "Preparar algo corto",
          resultado: "Ensayás un set breve y lo hacés bien. Menos magia, menos riesgo.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 350), popularity: 2 }; },
          log: "Hizo un directo corto y preparado."
        },
        {
          texto: "Declinar",
          resultado: "No te arriesgás. La gente se queda con las ganas.",
          efectos: function (state) { return { popularity: -1 }; },
          log: "Declinó un directo improvisado."
        }
      ]
    },
    {
      id: "tpl_cover",
      titulo: "Un tema para recordar",
      texto: "Se acerca una fecha especial para la música y un medio te propone grabar una versión de un clásico.",
      opciones: [
        {
          texto: "Grabar tu versión",
          resultado: "Hacés un cover con tu sello. Los puristas discuten, pero la gente lo escucha.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 600), popularity: 2, talent: 1, money: -Under.SYSTEMS.efectivoEscala(state, 100) }; },
          log: "Grabó una versión de un clásico."
        },
        {
          texto: "Hacerlo en vivo y nada más",
          resultado: "Lo tocás una sola vez, en vivo. Queda como un momento, no como un producto.",
          efectos: function (state) { return { fans: Under.SYSTEMS.fansEscala(state, 250), popularity: 1 }; },
          log: "Tocó un clásico en vivo, sin grabarlo."
        },
        {
          texto: "Negarse",
          resultado: "Los clásicos son sagrados para vos. La oferta se cae sola.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Se negó a versionar un clásico."
        }
      ]
    },
    {
      id: "tpl_colab_chica",
      titulo: "Un verso para un artista nuevo",
      texto: function (state) {
        return Under.DATA.escena({ rol: "artista" }).nombre + ", un artista emergente de la escena, te escribe para que le regales un verso en su tema. No tiene plata, pero tiene hambre y un público chico que te escucharía.";
      },
      opciones: [
        {
          texto: "Regalarle un verso",
          resultado: "Tu voz entra en su tema y su público descubre tu nombre. En la escena, eso se paga en favores.",
          efectos: function (state) { return { talent: 1, fans: Under.SYSTEMS.fansEscala(state, 300), popularity: 1, _relaciones: 2 }; },
          log: "Regaló un verso a un artista emergente."
        },
        {
          texto: "Cobrarle un precio simbólico",
          resultado: "Cobrás algo chico, justo para el estudio. El gesto se agradece igual.",
          efectos: function (state) { return { money: Under.SYSTEMS.efectivoEscala(state, 100), fans: Under.SYSTEMS.fansEscala(state, 150) }; },
          log: "Cobró un precio simbólico por un verso."
        },
        {
          texto: "Declinar",
          resultado: "Tu voz tiene que cuidarse. El artista busca a otro y el tema sale sin vos.",
          efectos: function (state) { return { talent: 1 }; },
          log: "Declinó dar un verso a un artista emergente."
        }
      ]
    },
    {
      id: "tpl_tema_radio",
      titulo: "Una canción para un segmento",
      texto: "La radio del Cosquín Rock te pide un tema breve para su cortina o su segmento semanal. Pagan poco, pero el tema suena todas las semanas.",
      opciones: [
        {
          texto: "Escribirlo",
          resultado: "Escribís un tema cortito hecho a medida. Cada semana suena y la gente lo asocia a vos.",
          efectos: function (state) { return { talent: 1, money: Under.SYSTEMS.efectivoEscala(state, 200), fans: Under.SYSTEMS.fansEscala(state, 200) }; },
          log: "Escribió una cortina para Radio Cosquín Rock."
        },
        {
          texto: "Adaptar un tema viejo",
          resultado: "Le cambiás el arreglo a un tema que ya existía. Menos laburo, menos magia.",
          efectos: function (state) { return { money: Under.SYSTEMS.efectivoEscala(state, 150), fans: Under.SYSTEMS.fansEscala(state, 100) }; },
          log: "Adaptó un tema viejo para un segmento de Radio Cosquín Rock."
        },
        {
          texto: "No",
          resultado: "Tu catálogo no se presta. La radio usa otra cosa y el tema queda para vos.",
          efectos: function (state) { return {}; },
          log: "No cedió un tema para un segmento de radio."
        }
      ]
    }
  ],

  /* ---------- Logros ---------- */
  LOGROS: [
    { id: "primer_tema",   icono: "🎵", nombre: "Primer lanzamiento",      check: function (s) { return !!s.flags.primerTema || s.lanzamientos >= 1; } },
    { id: "fans_1k",       icono: "👥", nombre: "1.000 fans",             check: function (s) { return s.stats.fans >= 1000; } },
    { id: "fans_100k",     icono: "🔥", nombre: "100.000 fans",           check: function (s) { return s.stats.fans >= 100000; } },
    { id: "fans_1m",       icono: "🚀", nombre: "1.000.000 de fans",      check: function (s) { return s.stats.fans >= 1000000; } },
    { id: "repro_1m",      icono: "🎧", nombre: "1 millón de reproducciones", check: function (s) { return s.totalReproducciones >= 1000000; } },
    { id: "repro_100m",    icono: "💿", nombre: "100 millones de reproducciones", check: function (s) { return s.totalReproducciones >= 100000000; } },
    { id: "primer_hit",    icono: "🔥", nombre: "Primer HIT",             check: function (s) { return !!s.flags.tuvoHit; } },
    { id: "primer_viral",  icono: "⚡", nombre: "Primer tema viral",      check: function (s) { return !!s.flags.tuvoViral; } },
    { id: "hit_global",    icono: "🌍", nombre: "Hit global",            check: function (s) { return !!s.flags.tuvoGlobal; } },
    { id: "decisiones_25", icono: "🧠", nombre: "25 decisiones tomadas",  check: function (s) { return s.decisionesTomadas >= 25; } },
    { id: "fama_mundial",  icono: "🌍", nombre: "Fama mundial",          check: function (s) { return Under.STATE.nivelCarrera(s).nivel >= 8; } },
    /* Fase 3 */
    { id: "primera_gira",  icono: "🎪", nombre: "Primera gira",          check: function (s) { return s.totalGiras >= 1; } },
    { id: "gira_mundial",  icono: "🌏", nombre: "Gira mundial exitosa",  check: function (s) { return !!s.flags.tuvoGiraMundial; } },
    { id: "primera_colab", icono: "🤝", nombre: "Primera colaboración",  check: function (s) { return s.totalColabs >= 1; } },
    { id: "primer_premio", icono: "🏆", nombre: "Primer premio",         check: function (s) { return s.totalPremios >= 1; } },
    { id: "premio_mayor",  icono: "👑", nombre: "Premio mayor",          check: function (s) { return !!s.flags.tuvoPremioMayor; } },
    { id: "con_sello",     icono: "🏢", nombre: "Bajo un sello",         check: function (s) { return !!s.sello; } },
    { id: "mejor_critica", icono: "✨", nombre: "Aclamado por la crítica", check: function (s) { return !!s.flags.tuvoCritica; } },
    /* Fase 4 */
    { id: "primer_album",     icono: "💿", nombre: "Primer proyecto",      check: function (s) { return s.totalAlbums >= 1; } },
    { id: "album_aclamado",   icono: "🏅", nombre: "Proyecto aclamado",    check: function (s) { return s.totalAlbums >= 1 && !!s.flags.tuvoCritica; } },
    { id: "supero_escandalo", icono: "⚠️", nombre: "Superó un escándalo",  check: function (s) { return s.totalEscandalos >= 1; } },
    { id: "equipo_completo",  icono: "🛠️", nombre: "Equipo completo",      check: function (s) { return s.equipo.length >= 4; } },
    { id: "primera_inversion", icono: "📈", nombre: "Primera inversión",    check: function (s) { return s.totalInversiones >= 1; } },
    { id: "vida_equilibrada", icono: "💚", nombre: "Vida equilibrada",     check: function (s) { return s.relaciones >= 70; } },
    { id: "retiro_cima",      icono: "👑", nombre: "Retiro en la cima",    check: function (s) { return !!s.retirado && !!s.resultadoFinal && s.resultadoFinal.tipo === "retiro_cima"; } },
    /* Fase 5: plataformas, mercados, shows del under, legado y economía */
    { id: "primer_show",         icono: "🎤", nombre: "Primer show en el under", check: function (s) { return s.totalFestivales >= 1; } },
    { id: "primer_mercado",     icono: "🌎", nombre: "Conquistó un mercado", check: function (s) { return s.mercados.length >= 1; } },
    { id: "mundo_conquistado",  icono: "🌏", nombre: "Mundo conquistado",    check: function (s) { return s.mercados.length >= 4; } },
    { id: "documental",         icono: "🎬", nombre: "Su historia se cuenta", check: function (s) { return s.documentales >= 1; } },
    { id: "reinvencion",        icono: "🔄", nombre: "Se reinventó",         check: function (s) { return s.reinvenciones >= 1; } },
    { id: "legado_culto",       icono: "👑", nombre: "Legado de culto",      check: function (s) { return s.legado >= 50; } },
    { id: "deudas_saldadas",    icono: "✅", nombre: "Saldó sus deudas",     check: function (s) { return !!s.flags.deudasSaldadas; } },
    { id: "vendio_catalogo",    icono: "📀", nombre: "Vendió su catálogo",   check: function (s) { return !!s.vendioCatalogo; } },
    { id: "sobrevivio_quiebra", icono: "🧯", nombre: "Sobrevivió a la quiebra", check: function (s) { return !!s.flags.superoQuiebra; } }
  ],

  /* ---------- Helpers de datos ---------- */
  buscarEvento: function (id, state) {
    state = state || (Under.MAIN && Under.MAIN.estado);
    for (var d = 0; d < Under.DATA.DINAMICOS.length; d++) {
      if (Under.DATA.DINAMICOS[d].id === id) {
        return Under.DATA.DINAMICOS[d].generar(state);
      }
    }
    for (var i = 0; i < Under.DATA.EVENTS.length; i++) {
      if (Under.DATA.EVENTS[i].id === id) return Under.DATA.EVENTS[i];
    }
    for (var j = 0; j < Under.DATA.TEMPLATES.length; j++) {
      if (Under.DATA.TEMPLATES[j].id === id) return Under.DATA.TEMPLATES[j];
    }
    return null;
  }
};
