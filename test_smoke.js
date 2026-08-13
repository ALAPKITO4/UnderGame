/* ============================================================
   UNDER — SMOKE TEST (Node)
   Juega carreras completas de forma automática y verifica que
   no haya errores, que el juego llegue al final y que los
   datos queden consistentes (stats, lanzamientos, discografía).
   ============================================================ */

/* ---- Shims de navegador ---- */
global.window = global;
global.localStorage = (function () {
  var store = {};
  return {
    getItem: function (k) { return store.hasOwnProperty(k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  };
})();

function makeEl() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    disabled: false,
    style: { setProperty: function () {}, removeProperty: function () {} },
    classList: { add: function () {}, remove: function () {} },
    addEventListener: function () {},
    setAttribute: function () {},
    getAttribute: function () { return null; }
  };
}

var appEl = makeEl();
global.document = {
  getElementById: function (id) { return id === "app" ? appEl : makeEl(); },
  body: { style: { setProperty: function () {}, removeProperty: function () {} } },
  addEventListener: function () {}
};

/* ---- Carga de scripts en orden ---- */
var fs = require("fs");
var path = require("path");
var root = __dirname;
 ["js/data.js", "js/state.js", "js/publico.js", "js/systems.js", "js/music.js",
  "js/sello.js", "js/giras.js", "js/colabs.js", "js/premios.js",
  "js/albumes.js", "js/escandalos.js", "js/equipo.js", "js/vida.js",
  "js/inversiones.js", "js/retiro.js",
  "js/plataformas.js", "js/mercados.js", "js/festivales.js", "js/legado.js", "js/economia.js",
  "js/underground.js", "js/grande.js", "js/rivales.js",
  "js/misiones.js", "js/extra.js", "js/memoria.js", "js/canciones.js", "js/generos.js", "js/contexto.js", "js/relaciones.js", "js/contratos.js", "js/crisis.js", "js/biografia.js",
  "js/ui.js", "js/main.js"].forEach(function (f) {
  eval(fs.readFileSync(path.join(root, f), "utf8"));
});

/* ---- Utilidades de test ---- */
var totalGames = 0;
var failures = [];
var statsF3 = { giras: 0, colabs: 0, premios: 0, sellos: 0, giraMundial: 0 };
var statsPremios = { nominaciones: 0, ganados: 0, perdidos: 0 };
var statsF4 = { albums: 0, escandalos: 0, inversiones: 0, equipo: 0 };
var statsF5 = { festivales: 0, mercados: 0, reinvenciones: 0, creditos: 0, catologos: 0, documentales: 0 };
var statsF8 = { renegociaciones: 0, clausulas: 0 };
var statsF6 = { salio: 0, niveles: [], underEventos: 0 };
var statsRivales = { encontrados: 0, duelos: 0, reconciliados: 0, colabs: 0 };
var statsMisiones = { completadas: 0 };

/* PRNG determinista: cada partida usa una semilla fija distinta,
   así el test es estable y reproducible (sin flakes por azar). */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var semilla = 0;
function sembrar() {
  semilla = (semilla * 1103515245 + 12345) & 0x7fffffff;
  Math.random = mulberry32(semilla);
}

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

function jugar(gen, per) {
  totalGames++;
  sembrar();
  var safety = 0;

  Under.MAIN.nuevaCarrera();
  Under.MAIN.form = { nombre: "Test" + totalGames, ciudad: "Medellín, Colombia", genero: gen, personalidad: per };
  Under.MAIN.empezar();

  /* Estructura del dashboard: solo 3 stats y sin stats secundarias */
  var dash = appEl.innerHTML;
  assert(dash.indexOf("stats-grid") !== -1, "Juego " + totalGames + ": sin stats-grid en dashboard");
  assert(dash.indexOf("secondary-stats") === -1, "Juego " + totalGames + ": quedaron stats secundarias");
  /* La decisión se ve arriba, sin bajar la página */
  var idxEvento = dash.indexOf('class="card evento"');
  var idxStats = dash.indexOf("stats-grid");
  if (idxEvento !== -1 && idxStats !== -1) {
    assert(idxEvento < idxStats,
      "Juego " + totalGames + ": la decisión debería mostrarse antes que las stats");
  }

  /* La música sale sola (Under.MUSIC.lanzarAutomatico desde el año 2),
     así que ya no es un evento que se ofrezca como decisión. */
  /* Cobertura determinista del documental: depende del azar del
     pool y con la lista de eventos grandes puede no salir nunca.
     Cuando la carrera califica (año 6+, nivel 5+), se agenda el
     evento una vez a través del hook _eventoForzado (que el flujo
     normal consume sin dejar pendientes colgados). */
  var docForzado = false;
  var creditoForzado = false;
  var evolucionForzada = false;

  while (Under.MAIN.fase !== "final" && safety < 6000) {
    safety++;
    var m = Under.MAIN;

    /* El juego pasa de un año al otro sin resumen intermedio */
    if (m.fase === "finAnio") {
      failures.push("Juego " + totalGames + ": quedó detenido en el resumen de fin de año");
      break;
    }

    if (m.overlay === "resultado") {
      /* Solo las decisiones importantes pueden mostrar resultado */
      m.continuarResultado();
      continue;
    }
    if (m.overlay === "hit") {
      /* El lanzamiento automático explotó: se salta la animación */
      m.continuarHit();
      continue;
    }

    var s = m.estado;
    if (!docForzado && !s.flags.tuvoDocumental && s.año >= 6 && Under.STATE.nivelCarrera(s).nivel >= 5) {
      Under.SYSTEMS._eventoForzado = "documental";
      docForzado = true;
    }
    /* El crédito (peso 1) también puede no salir nunca en el pool;
       cuando hay un crédito ofrecible, se agenda una vez. */
    if (!creditoForzado && !s.flags.tuvoCredito && !!Under.ECONOMIA._creditoOfrecible(s)) {
      Under.SYSTEMS._eventoForzado = "credito";
      creditoForzado = true;
    }
    /* La evolución (peso 1) tampoco puede depender del azar del
       pool; se agenda una vez cuando hay derecho a reinventarse. */
    if (!evolucionForzada && !s.flags.evolucionEsteAnio && (!s.ultimaReinvencion || s.año - s.ultimaReinvencion >= 3)) {
      Under.SYSTEMS._eventoForzado = "evolucion";
      evolucionForzada = true;
    }
    var ev = s.eventoActualId ? Under.DATA.buscarEvento(s.eventoActualId, s) : null;
    if (!ev || !ev.opciones) {
      failures.push("Juego " + totalGames + ": sin evento disponible (fase=" + m.fase + " overlay=" + m.overlay + ")");
      break;
    }

    /* Fase 4: el dashboard quedó limpio (sin logros ni discografía) */
    assert(appEl.innerHTML.indexOf("discografia") === -1,
      "Juego " + totalGames + ": la discografía estorba el dashboard");
    assert(appEl.innerHTML.indexOf("logros-row") === -1,
      "Juego " + totalGames + ": los logros estorban el dashboard");

    var choices = [];
    for (var i = 0; i < ev.opciones.length; i++) {
      var o = ev.opciones[i];
      if (o.soloSi && !o.soloSi(s)) continue;
      choices.push(i);
    }
    if (choices.length === 0) {
      failures.push("Juego " + totalGames + ": no hay opciones habilitadas en " + ev.id);
      break;
    }

    var idx = choices[Math.floor(Math.random() * choices.length)];
    /* Aceptar siempre las oportunidades de Fase 3, 4 y 5 para cubrir sus caminos */
    if (["gira", "colab", "premio", "sello", "album", "equipo", "inversion",
         "plataforma", "mercado", "festival", "evolucion", "documental", "credito", "catalogo",
         "under_ciudad", "under_radio", "under_influencer", "under_rival",
         "under_freestyle", "under_cypher", "under_telonero", "under_remix",
         "under_filtracion", "under_zona", "under_maqueta", "under_colega",
         "under_referente", "under_bloqueo", "under_advertencia",
         "grande_tv", "grande_marca", "grande_leyenda", "grande_estadio",
         "grande_prensa", "grande_sello", "grande_rumores", "grande_protector",
         "rival_nuevo", "rival_duelo", "rival_reconciliar", "rival_colab",
         "under_feria", "under_escuela", "under_fiesta", "under_banda", "under_manifiesto",
         "grande_docuserie", "grande_banda", "grande_teatro", "grande_viral", "grande_verano",
         "gen_rap", "gen_rock", "gen_pop", "gen_urban",
         "gen2_rap", "gen2_rock", "gen2_pop", "gen2_urban",
         "extra_serie", "extra_videojuego", "extra_publicidad", "extra_reality",
         "extra_letras", "extra_demo", "extra_producir", "extra_jam_estudio",
         "fan_club", "fan_hater", "fan_tatuaje",
         "under_casa", "under_plaza", "under_video", "under_fanzine", "under_estudio",
         "under_ensayo", "under_resena", "under_equipo",
         "under_obs", "under_ig", "under_petalos", "under_coscu", "under_makensi",
         "under_massita", "under_estudio_grande", "under_viral_sobre", "under_cancion_anio", "under_ivo",
         "under_blake", "under_hongo_tv", "under_galperin", "under_fruity", "camino_carrera",
         "under_family_cypher", "under_kiwa", "under_marti", "under_club_paraguay", "under_990",
         "under_undersc", "under_la_sobre", "under_pascu", "main_ivinn", "main_pulmon", "main_drokerr",
         "under_lil_naue", "under_cero", "under_zell", "under_skydenn_gira",
         "under_doblef_catalogo", "under_doblef_circulo", "under_songwarts_jurado",
         "under_amigas_sobre", "under_lucio_paraguay", "under_agusfornite",
         "under_cantante_1k", "under_sprite_droga", "under_joda_cayo", "under_casa_3flip",
         "merch_barrio",
         "mem_productor", "mem_escena",
         "cat_revival", "cat_onehit",
         "ctx_reputacion_alta", "ctx_reputacion_baja", "ctx_momentum_alto",
         "ctx_momentum_bajo", "ctx_legado", "ctx_hype",
         "rel_productor", "rel_colega", "rel_aliado",
         "ctr_renegociar", "ctr_clausulas",
         "cris_fondo", "cris_rebote", "cris_evolucion",
         "tpl_colab_chica", "tpl_tema_radio"].indexOf(ev.id) !== -1) {
      idx = choices[0];
    }
    var eraImportante = !!ev.importante;
    m.elegir(idx);

    /* Verificar la regla del popup: solo si es importante */
    if (!eraImportante && m.overlay === "resultado") {
      failures.push("Juego " + totalGames + ": popup mostrado en evento no importante (" + ev.id + ")");
    }
  }

  /* ---- Verificaciones finales ---- */
  var s = Under.MAIN.estado;
  if (!s.terminada) {
    failures.push("Juego " + totalGames + ": no terminó la carrera (fase=" + Under.MAIN.fase + ")");
    return;
  }

  /* La música automática registró el último lanzamiento del año */
  assert(!!s.ultimoLanzamiento && typeof s.ultimoLanzamiento.nombre === "string" &&
    s.ultimoLanzamiento.nombre.length > 0,
    "Juego " + totalGames + ": nunca se registró un lanzamiento automático");

  var stats = s.stats;
  assert(!isNaN(stats.popularity) && !isNaN(stats.talent) && !isNaN(stats.fans) && !isNaN(stats.money),
    "Juego " + totalGames + ": alguna stat es NaN");

  var claves = Object.keys(stats).sort().join(",");
  assert(claves === "fans,money,popularity,talent",
    "Juego " + totalGames + ": stats incorrectas (" + claves + ")");

  assert(s.lanzamientos === s.discografia.length,
    "Juego " + totalGames + ": lanzamientos (" + s.lanzamientos + ") != discografia (" + s.discografia.length + ")");

  assert(s.lanzamientos > 0, "Juego " + totalGames + ": no hubo ningún lanzamiento");

  var reprosOk = 0;
  s.discografia.forEach(function (d) {
    assert(typeof d.nombre === "string" && d.nombre.length > 0, "Juego " + totalGames + ": tema sin nombre");
    assert(typeof d.tier === "string" && Under.DATA.TIERS[d.tier], "Juego " + totalGames + ": tier inválido (" + d.tier + ")");
    reprosOk += d.repros;
  });
  var albRepros = 0;
  s.albums.forEach(function (a) { albRepros += a.repros; });
  assert(reprosOk + albRepros === s.totalReproducciones,
    "Juego " + totalGames + ": totalReproducciones inconsistente");

  s.historial.forEach(function (h) {
    assert(typeof h.texto === "string", "Juego " + totalGames + ": entrada de historial no es string");
  });

  /* Guardado/recarga: el estado debe ser JSON limpio y seguir funcionando */
  var raw = JSON.stringify(s);
  var reload = JSON.parse(raw);
  assert(Under.STATE.nivelCarrera(reload).nivel >= 0 && !isNaN(Under.STATE.nivelCarrera(reload).puntaje),
    "Juego " + totalGames + ": nivelCarrera roto tras recargar");
  assert(Under.STATE.eraActual(reload).id, "Juego " + totalGames + ": eraActual roto tras recargar");

  /* Progresión anual (PRIORIDAD 1): experiencia, momento y etapa
     sobreviven a la recarga y se mantienen en rango. */
  assert(typeof reload.experiencia === "number" && reload.experiencia >= 0 && reload.experiencia <= 100,
    "Juego " + totalGames + ": experiencia inválida tras recargar (" + reload.experiencia + ")");
  assert(typeof reload.momentum === "number" && reload.momentum >= 0 && reload.momentum <= 100,
    "Juego " + totalGames + ": momentum inválido tras recargar (" + reload.momentum + ")");
  assert(!!Under.STATE.etapaActual(reload).nombre,
    "Juego " + totalGames + ": etapaActual roto tras recargar");
  s.trayectoria.forEach(function (t) {
    assert(typeof t.experiencia === "number" && !isNaN(t.experiencia) &&
      typeof t.momentum === "number" && !isNaN(t.momentum),
      "Juego " + totalGames + ": punto de trayectoria sin progresión");
  });

  /* El público (PRIORIDAD 3): hype en rango, haters, base
     segmentada y expectativas coherentes tras recargar. */
  assert(typeof reload.hype === "number" && reload.hype >= 0 && reload.hype <= 100,
    "Juego " + totalGames + ": hype inválido tras recargar (" + reload.hype + ")");
  assert(Array.isArray(reload.ultimosTiers) && reload.ultimosTiers.every(function (t) { return Under.DATA.TIERS[t]; }),
    "Juego " + totalGames + ": ultimosTiers inválido tras recargar");
  assert(typeof reload.haters === "number" && reload.haters >= 0,
    "Juego " + totalGames + ": haters inválido (" + reload.haters + ")");
  assert(typeof reload.fansFieles === "number" && reload.fansFieles >= 0,
    "Juego " + totalGames + ": fansFieles inválido (" + reload.fansFieles + ")");
  assert(typeof reload.fansHardcore === "number" && reload.fansHardcore >= 0,
    "Juego " + totalGames + ": fansHardcore inválido (" + reload.fansHardcore + ")");
  assert((reload.fansFieles || 0) + (reload.fansHardcore || 0) <= reload.stats.fans,
    "Juego " + totalGames + ": la base segmentada supera los fans totales");
  assert(typeof Under.PUBLICO.expectativa(reload) === "number" && !isNaN(Under.PUBLICO.expectativa(reload)),
    "Juego " + totalGames + ": expectativa rota tras recargar");
  assert(Under.PUBLICO.fidelidad(reload) >= 1 && Under.PUBLICO.haterFactor(reload) >= 0.6,
    "Juego " + totalGames + ": fidelidad/haterFactor fuera de rango");
  s.trayectoria.forEach(function (t) {
    assert(typeof t.hype === "number" && !isNaN(t.hype),
      "Juego " + totalGames + ": punto de trayectoria sin hype");
  });

  /* Canciones y éxito (PRIORIDAD 4): el catálogo tiene vida.
     Cada tema tiene un destino válido (o todavía sin definir),
     el factor de novedad se mantiene en rango y el total de
     reproducciones sigue siendo la suma exacta de la discografía
     (los clásicos crecen y los resurgimientos suman por ambos lados). */
  assert(typeof Under.CANCIONES.factorNovedad(reload) === "number" &&
    Under.CANCIONES.factorNovedad(reload) >= 0.5 && Under.CANCIONES.factorNovedad(reload) <= 1,
    "Juego " + totalGames + ": factorNovedad fuera de rango");
  s.discografia.forEach(function (d) {
    if (d.tipo !== undefined) {
      assert(d.tipo === "clasico" || d.tipo === "efimero" || d.tipo === "comun",
        "Juego " + totalGames + ": destino de tema inválido (" + d.tipo + ")");
    }
    if (d.resurgio !== undefined) {
      assert(typeof d.resurgio === "number" && d.resurgio >= 1,
        "Juego " + totalGames + ": resurgio inválido (" + d.resurgio + ")");
    }
    assert(typeof d.repros === "number" && d.repros >= 0,
      "Juego " + totalGames + ": tema con reproducciones inválidas");
  });

  /* Memoria de decisiones (PRIORIDAD 2): recuerdos con estructura
     coherente, reputación en rango y que sobreviven a la recarga. */
  assert(Array.isArray(s.memorias), "Juego " + totalGames + ": memorias no inicializadas");
  s.memorias.forEach(function (mem) {
    assert(typeof mem.id === "string" && mem.id.length > 0, "Juego " + totalGames + ": memoria sin id");
    assert(typeof mem.titulo === "string" && mem.titulo.length > 0, "Juego " + totalGames + ": memoria sin título");
    assert(typeof mem.tono === "string", "Juego " + totalGames + ": memoria sin tono");
    assert(typeof mem.año === "number" && mem.año >= 1, "Juego " + totalGames + ": memoria sin año");
  });
  assert(typeof s.reputacion === "number" && s.reputacion >= 0 && s.reputacion <= 100,
    "Juego " + totalGames + ": reputacion inválida (" + s.reputacion + ")");
  s.memorias.forEach(function (mem) {
    assert(Under.MEMORIA.recuerda(reload, mem.id),
      "Juego " + totalGames + ": recuerda() falla tras recargar (" + mem.id + ")");
  });

  /* Misiones: estructura coherente y que sobrevive a la recarga */
  assert(typeof s.misiones === "object" && typeof s.contadores === "object",
    "Juego " + totalGames + ": misiones/contadores no inicializados");
  assert(typeof s.misionesUsadas === "object",
    "Juego " + totalGames + ": misionesUsadas no inicializado (migración rota)");
  var activas = Under.MISIONES._activas(s);
  assert(Array.isArray(activas),
    "Juego " + totalGames + ": _activas roto tras recargar");
  var capPorSec = {};
  activas.forEach(function (def) {
    assert(!!Under.MISIONES._def(def.id),
      "Juego " + totalGames + ": _activas devuelve una misión desconocida (" + def.id + ")");
    var sec = def.seccion;
    capPorSec[sec] = (capPorSec[sec] || 0) + 1;
  });
  Object.keys(Under.MISIONES.SECCIONES).forEach(function (sec) {
    var cap = Under.MISIONES.SECCIONES[sec].cap || 1;
    assert((capPorSec[sec] || 0) <= cap,
      "Juego " + totalGames + ": la sección " + sec + " supera su cap de activas (" + (capPorSec[sec] || 0) + " > " + cap + ")");
  });
  /* Misiones por sección: mínimo 5 por sección, ids únicos y datos coherentes */
  var secCounts = {};
  var idsMisiones = {};
  Under.MISIONES.DEFS.forEach(function (def) {
    assert(typeof def.seccion === "string" && def.seccion.length > 0,
      "Juego " + totalGames + ": misión sin sección (" + def.id + ")");
    assert(!idsMisiones[def.id],
      "Juego " + totalGames + ": id de misión duplicado (" + def.id + ")");
    idsMisiones[def.id] = true;
    assert(typeof def.meta === "number" && def.meta > 0,
      "Juego " + totalGames + ": misión sin meta válida (" + def.id + ")");
    secCounts[def.seccion] = (secCounts[def.seccion] || 0) + 1;
  });
  Object.keys(Under.MISIONES.SECCIONES).forEach(function (sec) {
    assert((secCounts[sec] || 0) >= 5,
      "Juego " + totalGames + ": la sección " + sec + " tiene menos de 5 misiones (" + (secCounts[sec] || 0) + ")");
  });
  assert(Under.MISIONES.DEFS.length >= 200,
    "Juego " + totalGames + ": el pool de misiones no llega a 200 (" + Under.MISIONES.DEFS.length + ")");
  var completadas = Under.MISIONES.DEFS.filter(function (def) {
    return s.misiones[def.id] && s.misiones[def.id].completada;
  }).length;
  statsMisiones.completadas += completadas;

  /* Fase 6: el pico de nivel nunca puede ser menor al nivel actual y
     si el jugador salió del underground, el pico tiene que reflejarlo. */
  assert(s.maxNivel >= Under.STATE.nivelCarrera(s).nivel,
    "Juego " + totalGames + ": maxNivel (" + s.maxNivel + ") < nivel actual (" + Under.STATE.nivelCarrera(s).nivel + ")");
  if (s.flags.salioDelUnderground) {
    assert(s.maxNivel >= 4,
      "Juego " + totalGames + ": salioDelUnderground activo pero maxNivel (" + s.maxNivel + ") < 4");
  }

  /* Gráfico de trayectoria: un punto por año completado, siempre
     numérico y con el año correcto. */
  var trayEsperados = Math.min(Under.DATA.CONFIG.AÑOS_MAX, Math.max(0, s.año - 1));
  assert(s.trayectoria.length === trayEsperados,
    "Juego " + totalGames + ": trayectoria (" + s.trayectoria.length + ") != años completados (" + trayEsperados + ")");
  s.trayectoria.forEach(function (t) {
    assert(!!t.año && !isNaN(t.popularity) && !isNaN(t.fans) && !isNaN(t.money),
      "Juego " + totalGames + ": punto de trayectoria inválido");
  });

  /* Rivalidad persistente: estructura coherente */
  s.rivales.forEach(function (r) {
    assert(!!r.id && !!r.nombre && typeof r.nombre === "string", "Juego " + totalGames + ": rival sin datos");
    assert(typeof r.beef === "number" && r.beef >= 0 && r.beef <= 100,
      "Juego " + totalGames + ": rival con beef inválido (" + r.beef + ")");
    if (r.reconciliado) {
      assert(r.beef === 0, "Juego " + totalGames + ": rival reconciliado con beef (" + r.beef + ")");
    }
    if (r.colabo) {
      assert(r.reconciliado, "Juego " + totalGames + ": colaboró con un rival sin reconciliarse");
    }
  });
  if (s.rivales.length) statsRivales.encontrados++;
  statsRivales.duelos += s.rivales.filter(function (r) {
    return r.historial.some(function (h) { return h.tipo === "duelo"; });
  }).length;
  statsRivales.reconciliados += s.rivales.filter(function (r) { return r.reconciliado; }).length;
  statsRivales.colabs += s.rivales.filter(function (r) { return r.colabo; }).length;

  assert(Under.MUSIC._pendiente === null,
    "Juego " + totalGames + ": quedó un lanzamiento pendiente sin resolver");
  assert(Under.GIRAS._pendiente === null,
    "Juego " + totalGames + ": quedó una gira pendiente sin resolver");
  assert(Under.COLABS._pendiente === null,
    "Juego " + totalGames + ": quedó una colab pendiente sin resolver");
  assert(Under.PREMIOS._pendiente === null,
    "Juego " + totalGames + ": quedó un premio pendiente sin resolver");
  assert(Under.SELLO._pendiente === null,
    "Juego " + totalGames + ": quedó un sello pendiente sin resolver");
  assert(Under.ALBUMS._pendiente === null,
    "Juego " + totalGames + ": quedó un proyecto pendiente sin resolver");
  assert(Under.ESCANDALOS._pendiente === null,
    "Juego " + totalGames + ": quedó un escándalo pendiente sin resolver");
  assert(Under.EQUIPO._pendiente === null,
    "Juego " + totalGames + ": quedó un rol de equipo pendiente sin resolver");
  assert(Under.VIDA._pendiente === null,
    "Juego " + totalGames + ": quedó un evento de vida pendiente sin resolver");
  assert(Under.INVERSIONES._pendiente === null,
    "Juego " + totalGames + ": quedó una inversión pendiente sin resolver");
  assert(Under.PLATAFORMAS._pendiente === null,
    "Juego " + totalGames + ": quedó una plataforma pendiente sin resolver");
  assert(Under.MERCADOS._pendiente === null,
    "Juego " + totalGames + ": quedó un mercado pendiente sin resolver");
  assert(Under.FESTIVALES._pendiente === null,
    "Juego " + totalGames + ": quedó un festival pendiente sin resolver");
  assert(Under.LEGADO._pendienteEvol === null && Under.LEGADO._pendienteDoc === null,
    "Juego " + totalGames + ": quedó un evento de legado pendiente sin resolver");
  assert(Under.ECONOMIA._pendienteCredito === null && Under.ECONOMIA._pendienteCatalogo === null,
    "Juego " + totalGames + ": quedó un evento económico pendiente sin resolver");
  var pendUnd = Object.keys(Under.UNDER._pendientes);
  assert(pendUnd.every(function (id) { return Under.UNDER._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento underground pendiente sin resolver (" + pendUnd.join(", ") + ")");
  var pendGrande = Object.keys(Under.GRANDE._pendientes);
  assert(pendGrande.every(function (id) { return Under.GRANDE._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de artista grande pendiente sin resolver (" + pendGrande.join(", ") + ")");
  var pendRiv = Object.keys(Under.RIVALES._pendientes);
  assert(pendRiv.every(function (id) { return Under.RIVALES._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de rivales pendiente sin resolver (" + pendRiv.join(", ") + ")");
  var pendExtra = Object.keys(Under.EXTRA._pendientes);
  assert(pendExtra.every(function (id) { return Under.EXTRA._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento extra pendiente sin resolver (" + pendExtra.join(", ") + ")");
  var pendMem = Object.keys(Under.MEMORIA._pendientes);
  assert(pendMem.every(function (id) { return Under.MEMORIA._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de memoria pendiente sin resolver (" + pendMem.join(", ") + ")");
  var pendCan = Object.keys(Under.CANCIONES._pendientes);
  assert(pendCan.every(function (id) { return Under.CANCIONES._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de canciones pendiente sin resolver (" + pendCan.join(", ") + ")");
  var pendGen = Object.keys(Under.GENEROS._pendientes);
  assert(pendGen.every(function (id) { return Under.GENEROS._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de género pendiente sin resolver (" + pendGen.join(", ") + ")");

  /* Carreras por género (PRIORIDAD 5): el perfil del género es
     coherente, la identidad responde y sobrevive a la recarga. */
  assert(Under.GENEROS.criticaBonus(reload) >= -1 && Under.GENEROS.criticaBonus(reload) <= 1,
    "Juego " + totalGames + ": criticaBonus del género fuera de rango");
  assert(Under.GENEROS.comercial(reload) >= 0.8 && Under.GENEROS.comercial(reload) <= 1.3,
    "Juego " + totalGames + ": comercial del género fuera de rango");
  assert(Under.GENEROS.escena(reload) >= 0.8 && Under.GENEROS.escena(reload) <= 1.3,
    "Juego " + totalGames + ": escena del género fuera de rango");
  assert(Under.GENEROS.fidelidad(reload) >= 0.8 && Under.GENEROS.fidelidad(reload) <= 1.3,
    "Juego " + totalGames + ": fidelidad del género fuera de rango");
  var ident = Under.GENEROS.identidad(reload);
  assert(!!ident.icono && !!ident.texto, "Juego " + totalGames + ": identidad de género rota tras recargar");

  /* Eventos de contexto (PRIORIDAD 6): los pesos dinámicos son
     numéricos y no dejan pendientes colgados. */
  Under.DATA.DINAMICOS.forEach(function (d) {
    if (typeof d.peso === "function") {
      var p = d.peso(reload);
      assert(typeof p === "number" && !isNaN(p) && p >= 0 && p <= 10,
        "Juego " + totalGames + ": peso dinámico inválido en " + d.id + " (" + p + ")");
    }
  });
  var pendCtx = Object.keys(Under.CONTEXTO._pendientes);
  assert(pendCtx.every(function (id) { return Under.CONTEXTO._pendientes[id] === null; }),
    "Juego " + totalGames + ": quedó un evento de contexto pendiente sin resolver (" + pendCtx.join(", ") + ")");

  /* ---- Fase 3: consistencia de giras, colabs, premios y sello ---- */
  assert(s.totalGiras === s.giras.length,
    "Juego " + totalGames + ": totalGiras (" + s.totalGiras + ") != giras (" + s.giras.length + ")");
  assert(s.totalColabs === s.colaboraciones.length,
    "Juego " + totalGames + ": totalColabs (" + s.totalColabs + ") != colaboraciones (" + s.colaboraciones.length + ")");
  assert(s.totalPremios === s.premios.length,
    "Juego " + totalGames + ": totalPremios (" + s.totalPremios + ") != premios (" + s.premios.length + ")");
  s.nominaciones.forEach(function (n) {
    assert(!!n.id && !!n.nombre, "Juego " + totalGames + ": nominación sin datos");
    assert(typeof n.ganado === "boolean", "Juego " + totalGames + ": nominación sin estado ganado/perdido");
    if (n.ganado) {
      assert(s.premios.some(function (p) { return p.id === n.id; }),
        "Juego " + totalGames + ": nominación ganada sin premio registrado (" + n.id + ")");
    }
  });
  s.colaboraciones.forEach(function (c) {
    assert(typeof c.partner === "string" && c.partner.length > 0, "Juego " + totalGames + ": colab sin partner");
    assert(typeof c.nombre === "string" && c.nombre.indexOf("feat.") !== -1, "Juego " + totalGames + ": colab sin título con feat");
    assert(typeof c.tier === "string" && Under.DATA.TIERS[c.tier], "Juego " + totalGames + ": colab con tier inválido");
  });
  s.premios.forEach(function (p) {
    assert(!!p.id && Under.DATA.PREMIOS.some(function (x) { return x.id === p.id; }),
      "Juego " + totalGames + ": premio con id desconocido (" + p.id + ")");
    assert(typeof p.nombre === "string" && p.nombre.length > 0, "Juego " + totalGames + ": premio sin nombre");
  });
  if (s.sello) {
    assert(!!Under.DATA.SELLOS[s.sello.tipo], "Juego " + totalGames + ": sello con tipo inválido");
    assert(typeof s.sello.retencion === "number" && typeof s.sello.distribucion === "number",
      "Juego " + totalGames + ": sello sin retención/distribución");
    assert(typeof s.sello.vencimiento === "number" && s.sello.vencimiento >= s.sello.año,
      "Juego " + totalGames + ": sello sin vencimiento válido");
  }

  /* ---- Fase 4: proyectos, escándalos, equipo, inversiones y vida ---- */
  assert(s.totalAlbums === s.albums.length,
    "Juego " + totalGames + ": totalAlbums (" + s.totalAlbums + ") != albums (" + s.albums.length + ")");
  assert(s.totalEscandalos === s.escandalos.length,
    "Juego " + totalGames + ": totalEscandalos (" + s.totalEscandalos + ") != escandalos (" + s.escandalos.length + ")");
  assert(s.totalInversiones === s.inversiones.length,
    "Juego " + totalGames + ": totalInversiones (" + s.totalInversiones + ") != inversiones (" + s.inversiones.length + ")");
  assert(s.energia >= 0 && s.energia <= 100, "Juego " + totalGames + ": energía fuera de rango (" + s.energia + ")");
  assert(s.relaciones >= 0 && s.relaciones <= 100, "Juego " + totalGames + ": relaciones fuera de rango (" + s.relaciones + ")");

  s.albums.forEach(function (a) {
    assert(typeof a.nombre === "string" && a.nombre.length > 0, "Juego " + totalGames + ": proyecto sin nombre");
    assert(Under.DATA.PROYECTOS.some(function (p) { return p.id === a.tipo; }),
      "Juego " + totalGames + ": proyecto con tipo inválido (" + a.tipo + ")");
    assert(typeof a.repros === "number" && !isNaN(a.repros), "Juego " + totalGames + ": proyecto sin reproducciones");
  });
  s.escandalos.forEach(function (e) {
    assert(!!Under.DATA.ESCANDALOS[e.id], "Juego " + totalGames + ": escándalo con id desconocido (" + e.id + ")");
    assert(typeof e.resolucion === "string" && e.resolucion.length > 0, "Juego " + totalGames + ": escándalo sin resolución");
  });
  s.inversiones.forEach(function (i) {
    assert(Under.DATA.INVERSIONES.some(function (x) { return x.id === i.id; }),
      "Juego " + totalGames + ": inversión con id desconocido (" + i.id + ")");
    assert(typeof i.costo === "number" && i.costo > 0, "Juego " + totalGames + ": inversión sin costo");
  });
  s.equipo.forEach(function (e2) {
    assert(Under.DATA.EQUIPO.some(function (x) { return x.id === e2.id; }),
      "Juego " + totalGames + ": equipo con id desconocido (" + e2.id + ")");
  });

  /* ---- Prioridad 7: la red de contactos queda consistente ---- */
  assert(Array.isArray(s.red), "Juego " + totalGames + ": sin red de contactos");
  s.red.forEach(function (c) {
    assert(typeof c.id === "string" && c.id.length > 0, "Juego " + totalGames + ": contacto sin id");
    assert(typeof c.nombre === "string" && c.nombre.length > 0, "Juego " + totalGames + ": contacto sin nombre");
    assert(c.vinculo >= 0 && c.vinculo <= 100, "Juego " + totalGames + ": vínculo fuera de rango (" + c.vinculo + ")");
    assert(typeof c.activo === "boolean", "Juego " + totalGames + ": contacto sin estado activo");
  });

  /* La pantalla final muestra el resumen completo (logros y discografía) */
  var finalHtml = appEl.innerHTML;
  assert(finalHtml.indexOf("Discografía") !== -1,
    "Juego " + totalGames + ": la pantalla final no muestra la discografía completa");
  assert(finalHtml.indexOf("logros-row") !== -1,
    "Juego " + totalGames + ": la pantalla final no muestra los logros");

  /* Prioridad 10: la biografía y el legado final se muestran */
  assert(finalHtml.indexOf("bio-card") !== -1,
    "Juego " + totalGames + ": la pantalla final no muestra la biografía");
  assert(finalHtml.indexOf("Legado:") !== -1,
    "Juego " + totalGames + ": la pantalla final no muestra el legado");
  var bio = Under.BIOGRAFIA.generar(s);
  assert(!!bio.rango && !!bio.rango.nombre && !!bio.parrafo,
    "Juego " + totalGames + ": la biografía generada está incompleta");
  assert(typeof bio.parrafo === "string" && bio.parrafo.length > 40,
    "Juego " + totalGames + ": la biografía es demasiado corta");

  statsF3.giras += s.totalGiras;
  statsF3.colabs += s.totalColabs;
  statsF3.premios += s.totalPremios;
  if (s.sello) statsF3.sellos++;
  if (s.flags.tuvoGiraMundial) statsF3.giraMundial++;

  statsPremios.nominaciones += s.nominaciones.length;
  s.nominaciones.forEach(function (n) {
    if (n.ganado) statsPremios.ganados++; else statsPremios.perdidos++;
  });

  statsF4.albums += s.totalAlbums;
  statsF4.escandalos += s.totalEscandalos;
  statsF4.inversiones += s.totalInversiones;
  statsF4.equipo += s.equipo.length;

  /* ---- Fase 5: plataformas, mercados, festivales, legado y economía ---- */
  assert(s.totalFestivales === s.festivales.length,
    "Juego " + totalGames + ": totalFestivales (" + s.totalFestivales + ") != festivales (" + s.festivales.length + ")");
  assert(s.legado >= 0 && !isNaN(s.legado), "Juego " + totalGames + ": legado inválido (" + s.legado + ")");
  if (s.plataforma) {
    assert(Under.DATA.PLATAFORMAS.some(function (p) { return p.id === s.plataforma.id; }),
      "Juego " + totalGames + ": estrategia de plataforma desconocida (" + s.plataforma.id + ")");
  }
  s.mercados.forEach(function (m) {
    assert(Under.DATA.MERCADOS.some(function (x) { return x.id === m.id; }),
      "Juego " + totalGames + ": mercado con id desconocido (" + m.id + ")");
  });
  s.festivales.forEach(function (f) {
    assert(Under.DATA.LUGARES.some(function (x) { return x.nombre === f.id; }),
      "Juego " + totalGames + ": show con lugar desconocido (" + f.id + ")");
    assert(typeof f.neto === "number" && !isNaN(f.neto), "Juego " + totalGames + ": show sin neto numérico");
  });
  s.deudas.forEach(function (d) {
    assert(typeof d.cuota === "number" && d.cuota > 0, "Juego " + totalGames + ": deuda sin cuota válida");
    assert(d.restante >= 1, "Juego " + totalGames + ": deuda con restante inválido");
  });

  statsF5.festivales += s.totalFestivales;
  statsF5.mercados += s.mercados.length;
  statsF5.reinvenciones += s.reinvenciones;
  statsF5.creditos += s.flags.tuvoCredito ? 1 : 0;
  statsF5.catologos += s.flags.tuvoVentaCatalogo ? 1 : 0;
  statsF5.documentales += s.documentales;

  /* Prioridad 8: contratos y economía */
  statsF8.renegociaciones += s.flags.tuvoRenegociacion ? 1 : 0;
  statsF8.clausulas += s.flags.tuvoClausula ? 1 : 0;

  /* Fase 6: ¿cuántas partidas logran salir del underground? */
  statsF6.salio += s.flags.salioDelUnderground ? 1 : 0;
  statsF6.niveles.push(s.maxNivel);
  statsF6.underEventos += s.historial.filter(function (h) {
    return h.texto.indexOf("toque de bar") !== -1 || h.texto.indexOf("radio de la escena") !== -1 ||
      h.texto.indexOf("creador de contenido") !== -1 || h.texto.indexOf("rival") !== -1 ||
      h.texto.indexOf("freestyle") !== -1 || h.texto.indexOf("cypher") !== -1 ||
      h.texto.indexOf("telonero") !== -1 || h.texto.indexOf("remix") !== -1 ||
      h.texto.indexOf("maqueta") !== -1 || h.texto.indexOf("barrio") !== -1;
  }).length;
}

/* ---- Retiro temprano: terminar la carrera antes del año 25 ---- */
function jugarRetiro() {
  sembrar();
  Under.MAIN.nuevaCarrera();
  Under.MAIN.form = { nombre: "RetiroTest", ciudad: "Buenos Aires, Argentina", genero: "pop", personalidad: "estrategico" };
  Under.MAIN.empezar();
  var safety = 0;

  while (Under.MAIN.fase !== "final" && safety < 3000) {
    safety++;
    var m = Under.MAIN;
    if (m.overlay === "resultado") { m.continuarResultado(); continue; }
    if (m.overlay === "hit") { m.continuarHit(); continue; }

    var s = m.estado;
    if (s.año >= 4) {
      m.confirmarRetiro();
      m.reiniciar();
      break;
    }

    var ev = s.eventoActualId ? Under.DATA.buscarEvento(s.eventoActualId, s) : null;
    if (!ev || !ev.opciones) break;
    var choices = [];
    for (var i = 0; i < ev.opciones.length; i++) {
      var o = ev.opciones[i];
      if (o.soloSi && !o.soloSi(s)) continue;
      choices.push(i);
    }
    if (choices.length === 0) break;
    m.elegir(choices[Math.floor(Math.random() * choices.length)]);
  }

  var s = Under.MAIN.estado;
  assert(s.retirado === true, "Retiro: no quedó marcado retirado");
  assert(s.añoRetiro !== null && s.añoRetiro >= 1, "Retiro: sin año de retiro");
  assert(!!s.resultadoFinal && !!s.resultadoFinal.tipo, "Retiro: sin resultadoFinal.tipo");
  assert(Under.MAIN.fase === "final", "Retiro: no llegó a la pantalla final");

  console.log("Retiro OK → " + s.resultadoFinal.titulo + " (año " + s.añoRetiro + ")");
}

/* ---- Crisis y recuperación: una carrera que toca fondo y vuelve.
   El estado de la carrera (PRIORIDAD 9) depende de condiciones que
   una partida exitosa no alcanza sola, así que se fuerza una baja
   de momentum para cubrir el fondo, el rebote y la evolución. ---- */
function jugarCrisis() {
  sembrar();
  Under.MAIN.nuevaCarrera();
  Under.MAIN.form = { nombre: "CrisisTest", ciudad: "Medellín, Colombia", genero: "rap", personalidad: "artistico" };
  Under.MAIN.empezar();
  var safety = 0;
  var bajoForzado = false;

  while (Under.MAIN.fase !== "final" && safety < 3000) {
    safety++;
    var m = Under.MAIN;
    if (m.overlay === "resultado") { m.continuarResultado(); continue; }
    if (m.overlay === "hit") { m.continuarHit(); continue; }

    var s = m.estado;
    /* Años 3 a 5: se mantiene el fondo para que la crisis ocurra,
       se cuente por año y dé lugar al rebote. El under ahora da
       más decisiones por año y sin esto la carrera escaparía sola. */
    if (s.año >= 3 && s.año <= 5) {
      s.momentum = Math.min(s.momentum, 15);
      s.stats.popularity = Under.STATE.clamp(s.stats.popularity, 0, 35);
    }
    /* Año 3: se fuerza el fondo para que la crisis pueda ocurrir */
    if (!bajoForzado && s.año >= 3) {
      Under.SYSTEMS._eventoForzado = "cris_fondo";
      bajoForzado = true;
    }

    var ev = s.eventoActualId ? Under.DATA.buscarEvento(s.eventoActualId, s) : null;
    if (!ev || !ev.opciones) break;
    var choices = [];
    for (var i = 0; i < ev.opciones.length; i++) {
      var o = ev.opciones[i];
      if (o.soloSi && !o.soloSi(s)) continue;
      choices.push(i);
    }
    if (choices.length === 0) break;
    m.elegir(choices[Math.floor(Math.random() * choices.length)]);
  }

  var s2 = Under.MAIN.estado;
  assert(s2.flags.estuvoEnCrisis === true, "Crisis: nunca tocó fondo");
  assert(s2.aniosEnCrisis >= 1, "Crisis: sin conteo de años en crisis");
  console.log("Crisis OK → años en crisis: " + s2.aniosEnCrisis +
    " · superó la crisis: " + (s2.flags.superoCrisis ? "sí" : "no"));
}

/* ---- Hook de test: fuerzo una nominación perdida para cubrir de
   forma determinista el camino "nominado y no ganó". El contador
   arranca en 1 tras la primera "Asistir a la ceremonia", así la
   segunda nominación por esa vía se pierde sí o sí. ---- */
Under.PREMIOS._forzarDerrota = 1;

/* ---- Correr varias partidas ---- */
var combinaciones = [
  ["rap", "estrategico"],
  ["urban", "ambicioso"],
  ["pop", "carismatico"],
  ["rock", "artistico"],
  ["rap", "independiente"],
  ["pop", "estrategico"],
  ["urban", "carismatico"],
  ["rock", "ambicioso"]
];
combinaciones.forEach(function (c) { jugar(c[0], c[1]); });
jugarRetiro();
jugarCrisis();

/* ---- Resultado ---- */
console.log("Partidas completadas: " + totalGames);
console.log("Fase 3 acumulado → giras: " + statsF3.giras + " · colabs: " + statsF3.colabs +
  " · premios: " + statsF3.premios + " · partidas con sello: " + statsF3.sellos +
  " · giras mundiales: " + statsF3.giraMundial);
console.log("Premios → nominaciones: " + statsPremios.nominaciones +
  " · ganados: " + statsPremios.ganados + " · perdidos: " + statsPremios.perdidos);
console.log("Fase 4 acumulado → proyectos: " + statsF4.albums + " · escándalos: " + statsF4.escandalos +
  " · inversiones: " + statsF4.inversiones + " · miembros de equipo: " + statsF4.equipo);
console.log("Fase 5 acumulado → shows en lugares del under: " + statsF5.festivales + " · mercados: " + statsF5.mercados +
  " · reinvenciones: " + statsF5.reinvenciones + " · documentales: " + statsF5.documentales +
  " · créditos: " + statsF5.creditos + " · venta de catálogo: " + statsF5.catologos);
var promedioNivel = statsF6.niveles.reduce(function (a, b) { return a + b; }, 0) / statsF6.niveles.length;
console.log("Fase 6 acumulado → salieron del underground: " + statsF6.salio + "/" + statsF6.niveles.length +
  " · pico de nivel promedio: " + promedioNivel.toFixed(1) +
  " · eventos underground vividos: " + statsF6.underEventos);
console.log("Rivales → encontrados: " + statsRivales.encontrados + " · duelos: " + statsRivales.duelos +
  " · reconciliados: " + statsRivales.reconciliados + " · colabs: " + statsRivales.colabs);
console.log("Misiones → completadas en total: " + statsMisiones.completadas);

assert(statsF3.giras >= 1, "Ninguna partida llegó a hacer una gira");
assert(statsF3.colabs >= 1, "Ninguna partida llegó a hacer una colaboración");
assert(statsF3.premios >= 1, "Ninguna partida llegó a ganar un premio");
assert(statsPremios.nominaciones >= statsPremios.ganados, "Nominaciones menores a premios ganados");
assert(statsPremios.perdidos >= 1, "Ninguna partida perdió una nominación");
assert(statsF3.sellos >= 1, "Ninguna partida firmó con un sello");

assert(statsF4.albums >= 1, "Ninguna partida hizo un proyecto");
assert(statsF4.escandalos >= 1, "Ninguna partida sufrió un escándalo");
assert(statsF4.inversiones >= 1, "Ninguna partida invirtió");
assert(statsF4.equipo >= 1, "Ninguna partida contrató equipo");

assert(statsF5.festivales >= 1, "Ninguna partida tocó en un lugar del under");
assert(statsF5.mercados >= 1, "Ninguna partida conquistó un mercado");
assert(statsF5.reinvenciones >= 1, "Ninguna partida se reinventó");
assert(statsF5.documentales >= 1, "Ninguna partida hizo un documental");
assert(statsF5.creditos >= 1, "Ninguna partida pidió un crédito");
assert(statsRivales.encontrados >= 1, "Ninguna partida encontró un rival");
assert(statsMisiones.completadas >= 1, "Ninguna partida completó una misión");

/* Prioridad 8: la renegociación y las cláusulas tienen cobertura */
assert(statsF8.renegociaciones + statsF8.clausulas >= 1,
  "Ninguna partida vivió una renegociación o una cláusula");

if (failures.length === 0) {
  console.log("SMOKE TEST OK ✔");
} else {
  console.log("SMOKE TEST FALLÓ: " + failures.length + " problema(s)");
  failures.forEach(function (f) { console.log("  ✘ " + f); });
  process.exit(1);
}
