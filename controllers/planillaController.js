const db = require("../utils/db");

const getPartidosPlanillero = (req, res) => {
  const { id_planillero } = req.query;
  const sql = `SELECT
    p.id_edicion,
    p.id_zona,
    p.id_categoria,
    p.id_partido,
    DAY(p.dia) AS dia_numero,
    MONTH(p.dia) AS mes,
    YEAR(p.dia) AS año,
    CASE
        WHEN DAYNAME(p.dia) = 'Monday' THEN 'Lunes'
        WHEN DAYNAME(p.dia) = 'Tuesday' THEN 'Martes'
        WHEN DAYNAME(p.dia) = 'Wednesday' THEN 'Miércoles'
        WHEN DAYNAME(p.dia) = 'Thursday' THEN 'Jueves'
        WHEN DAYNAME(p.dia) = 'Friday' THEN 'Viernes'
        WHEN DAYNAME(p.dia) = 'Saturday' THEN 'Sábado'
        WHEN DAYNAME(p.dia) = 'Sunday' THEN 'Domingo'
    END AS dia_nombre,
    p.id_equipoLocal,
    p.id_equipoVisita,
    p.estado,
    p.jornada,
    p.dia,
    p.hora,
    p.goles_local,
    p.goles_visita,
    p.pen_local,
    p.pen_visita,
    p.cancha,
    p.arbitro,
    p.destacado,
    p.descripcion,
    p.id_planillero,
    j.id_jugador AS jugador_destacado,
    c.nombre AS nombre_categoria,
    CONCAT(u.nombre, ' ', u.apellido) AS planillero,
    CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
    p.vacante_local,
    p.vacante_visita,
    p.id_partido_previo_local,
    p.id_partido_previo_visita,
    p.res_partido_previo_local,
    p.res_partido_previo_visita,
    p.id_partido_posterior_ganador,
    p.id_partido_posterior_perdedor,
    p.interzonal,
    p.ventaja_deportiva,
    ida,
    vuelta
FROM
    partidos p
LEFT JOIN
    equipos e1 ON p.id_equipoLocal = e1.id_equipo
LEFT JOIN
    equipos e2 ON p.id_equipoVisita = e2.id_equipo
LEFT JOIN
    usuarios u ON p.id_planillero = u.id_usuario
LEFT JOIN
    jugadores j ON p.id_jugador_destacado = j.id_jugador
LEFT JOIN
    categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN
    ediciones e ON p.id_edicion = e.id_edicion
WHERE id_planillero = ?`;
  db.query(sql, [id_planillero], (err, result) => {
    if (err) {
      console.error("Error al traer los partidos del planillero:", err);
      return res
        .status(500)
        .json({ mensaje: "Error al traer los partidos del planillero" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron partidos para el planillero" });
    }
    return res.status(200).json(result);
  });
};

const getPartidosPlanillados = (req, res) => {
  const { id_planillero, limite } = req.query;
  const sql = `SELECT
    p.id_edicion,
    p.id_zona,
    p.id_categoria,
    p.id_partido,
    DAY(p.dia) AS dia_numero,
    MONTH(p.dia) AS mes,
    YEAR(p.dia) AS año,
    CASE
        WHEN DAYNAME(p.dia) = 'Monday' THEN 'Lunes'
        WHEN DAYNAME(p.dia) = 'Tuesday' THEN 'Martes'
        WHEN DAYNAME(p.dia) = 'Wednesday' THEN 'Miércoles'
        WHEN DAYNAME(p.dia) = 'Thursday' THEN 'Jueves'
        WHEN DAYNAME(p.dia) = 'Friday' THEN 'Viernes'
        WHEN DAYNAME(p.dia) = 'Saturday' THEN 'Sábado'
        WHEN DAYNAME(p.dia) = 'Sunday' THEN 'Domingo'
    END AS dia_nombre,
    p.id_equipoLocal,
    p.id_equipoVisita,
    p.estado,
    p.jornada,
    p.dia,
    p.hora,
    p.goles_local,
    p.goles_visita,
    p.pen_local,
    p.pen_visita,
    p.cancha,
    p.arbitro,
    p.destacado,
    p.descripcion,
    p.id_planillero,
    j.id_jugador AS jugador_destacado,
    c.nombre AS nombre_categoria,
    CONCAT(u.nombre, ' ', u.apellido) AS planillero,
    CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
    p.vacante_local,
    p.vacante_visita,
    p.id_partido_previo_local,
    p.id_partido_previo_visita,
    p.res_partido_previo_local,
    p.res_partido_previo_visita,
    p.id_partido_posterior_ganador,
    p.id_partido_posterior_perdedor,
    p.interzonal,
    p.ventaja_deportiva,
    ida,
    vuelta
FROM
    partidos p
LEFT JOIN
    equipos e1 ON p.id_equipoLocal = e1.id_equipo
LEFT JOIN
    equipos e2 ON p.id_equipoVisita = e2.id_equipo
LEFT JOIN
    usuarios u ON p.id_planillero = u.id_usuario
LEFT JOIN
    jugadores j ON p.id_jugador_destacado = j.id_jugador
LEFT JOIN
    categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN
    ediciones e ON p.id_edicion = e.id_edicion
WHERE id_planillero = ?
  AND p.estado IN ('S', 'F')
LIMIT ?`;
  db.query(sql, [id_planillero, limite], (err, result) => {
    if (err) {
      console.error("Error al traer los partidos del planillero:", err);
      return res
        .status(500)
        .json({ mensaje: "Error al traer los partidos del planillero" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron partidos para el planillero" });
    }
    return res.status(200).json(result);
  });
};

const getPartidoIncidencias = (req, res) => {
  const { id_partido } = req.query;
  const sql = `
        CALL sp_partidos_incidencias(?)
    `;
  db.query(sql, [id_partido], (err, result) => {
    if (err) {
      console.error("Error al traer los incidencias del partido:", err);
      return res
        .status(500)
        .json({ mensaje: "Error al traer los incidencias del partido" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron incidencias para el partido" });
    }
    return res.status(200).json(result);
  });
};

const getPartidoFormaciones = (req, res) => {
  const { id_partido } = req.query;

  db.query("CALL sp_partidos_formaciones(?)", [id_partido], (err, result) => {
    if (err) {
      console.error(
        "Error al ejecutar el procedimiento almacenado de formaciones:",
        err
      );
      if (err.sqlState === "45000") {
        return res.status(400).send(err.sqlMessage);
      }
      return res.status(500).send("Error interno del servidor");
    }

    if (!result || result.length === 0) {
      return res
        .status(404)
        .send("No se encontraron incidencias para el partido especificado.");
    }
    const [rows] = result;

    res.status(200).json(rows);
  });
};

const firmaJugador = (req, res) => {
  const { id_partido, id_jugador, dorsal } = req.body;

  if (!id_partido || !id_jugador || !dorsal) {
    return res.status(400).send("Faltan datos necesarios");
  }

  const query = `
          INSERT INTO formaciones (id_partido, id_jugador, dorsal)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE dorsal = VALUES(dorsal)
      `;

  db.query(query, [id_partido, id_jugador, dorsal], (err, result) => {
    if (err) {
      console.error("Error al insertar el dorsal en la base de datos:", err);
      return res.status(500).send("Error al guardar el dorsal");
    }

    // Emitir el evento de dorsal asignado a través de WebSocket
    const dorsalData = { id_partido, id_jugador, dorsal };
    if (req.io && typeof req.io.emit === "function") {
      req.io.emit("dorsalAsignado", dorsalData);
    } else {
      console.error("Socket.io no está disponible");
      return res.status(500).send("Error en el servidor de WebSocket");
    }

    res.status(200).send("Dorsal guardado correctamente");
  });
};

const crearJugadorEventual = async (req, res) => {
  const {
    id_partido,
    id_equipo,
    nombre,
    apellido,
    dni,
    dorsal,
    estado,
    eventual,
  } = req.body;

  try {
    // Función auxiliar para ejecutar consultas SQL
    const query = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
    };

    // 1. Verificar si el jugador ya existe en la tabla jugadores
    let id_jugador;
    const jugadores = await query(
      `SELECT id_jugador FROM jugadores WHERE dni = ?`,
      [dni]
    );

    if (jugadores.length > 0) {
      // Jugador ya existe
      id_jugador = jugadores[0].id_jugador;
    } else {
      // Crear jugador nuevo y obtener su id
      const resultadoJugador = await query(
        `INSERT INTO jugadores (dni, nombre, apellido, estado) VALUES (?, ?, ?, ?)`,
        [dni, nombre, apellido, estado]
      );
      id_jugador = resultadoJugador.insertId; // ID del nuevo jugador
    }

    console.log("ID del jugador:", id_jugador);

    // 2. Obtener id_categoria e id_edicion de la tabla partidos
    const partido = await query(
      `SELECT id_categoria, id_edicion FROM partidos WHERE id_partido = ?`,
      [id_partido]
    );

    if (!partido.length) {
      return res
        .status(404)
        .json({ success: false, message: "Partido no encontrado" });
    }

    const { id_categoria, id_edicion } = partido[0];

    // 3. Verificar si el jugador ya está en planteles
    const planteles = await query(
      `SELECT * FROM planteles WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ? AND id_edicion = ?`,
      [id_jugador, id_equipo, id_categoria, id_edicion]
    );

    if (planteles.length > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message: "El jugador ya está registrado en este equipo",
        });
    }

    // 4. Insertar el jugador en la tabla planteles
    await query(
      `INSERT INTO planteles (id_equipo, id_jugador, id_edicion, id_categoria, eventual, sancionado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_equipo, id_jugador, id_edicion, id_categoria, eventual, "N"]
    );

    // 5. Verificar si el jugador ya está en formaciones
    const formaciones = await query(
      `SELECT * FROM formaciones WHERE id_partido = ? AND id_jugador = ?`,
      [id_partido, id_jugador]
    );

    if (formaciones.length > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message: "El jugador ya está registrado en este partido",
        });
    }

    // 6. Insertar en la tabla formaciones
    await query(
      `INSERT INTO formaciones (id_partido, id_jugador, dorsal) VALUES (?, ?, ?)`,
      [id_partido, id_jugador, dorsal]
    );

    // Emitir evento
    req.io.emit("jugadorEventualCreado", {
      id_jugador,
      id_equipo,
      nombre,
      apellido,
      dorsal,
    });

    // Responder con éxito
    return res
      .status(201)
      .json({ success: true, message: "Jugador eventual creado exitosamente" });
  } catch (error) {
    console.error("Error inesperado:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getEdicion = async (req, res) => {
  const { id_edicion } = req.query;

  if (!id_edicion) {
    return res.status(400).json({ mensaje: "Falta el id del edicion" });
  }

  const sql = `SELECT nombre, temporada, cantidad_eventuales, partidos_eventuales FROM ediciones WHERE id_edicion = ?`;
  db.query(sql, [id_edicion], (err, result) => {
    if (err) {
      console.error("Error al traer la edicion:", err);
      return res.status(500).json({ mensaje: "Error al traer la edicion" });
    }
    if (result.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró la edición" });
    }
    return res.status(200).json(result);
  });
};

const checkPartidosEventual = async (req, res) => {
  const { id_partido, dni } = req.query;
  console.log(id_partido, dni);

  if (!id_partido || !dni) {
    return res.status(400).json({ mensaje: "Faltan parámetros" });
  }

  const sql = `SELECT COUNT(DISTINCT p.id_partido) AS partidos_jugados
FROM formaciones f
JOIN partidos p ON f.id_partido = p.id_partido
WHERE f.id_jugador = (SELECT id_jugador FROM jugadores WHERE dni = ?)
  AND p.id_categoria = (SELECT id_categoria FROM partidos WHERE id_partido = ?)
  AND p.id_edicion = (SELECT id_edicion FROM partidos WHERE id_partido = ?)
  AND p.estado = 'F';
`;
  db.query(sql, [dni, id_partido, id_partido], (err, result) => {
    if (err) {
      console.error(
        "Error al ejecutar la consulta de checkPartidosEventual:",
        err
      );
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró la edición" });
    }
    return res.status(200).json(result[0]);
  });
};

const getJugadoresDestacados = (req, res) => {
  const { id_partido } = req.query;

  if (!id_partido) {
    return res.status(400).json({ mensaje: "Falta el id del partido" });
  }

  const sql = `SELECT
    jd.id_partido,
    jd.id_jugador,
    CONCAT(j.nombre, ' ', j.apellido, ' - ', e.nombre) AS nombre_completo,
    jd.id_jugador AS jugador_destacado,
    jd.posicion
FROM 
    jugadores_destacados AS jd
JOIN 
    jugadores AS j ON jd.id_jugador = j.id_jugador
JOIN 
    partidos AS p ON p.id_partido = jd.id_partido
JOIN
    equipos AS e ON jd.id_equipo = e.id_equipo
WHERE 
    p.id_partido = ?
ORDER BY 
    jd.posicion ASC;
`;
  db.query(sql, [id_partido], (err, result) => {
    if (err) {
      console.error("Error al traer los jugadores destacados:", err);
      return res
        .status(500)
        .json({ mensaje: "Error al traer los jugadores destacados" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron jugadores destacados" });
    }
    return res.status(200).json(result);
  });
};

const getJugadoresDream = (req, res) => {
  const { id_categoria, jornada } = req.query;

  if (!id_categoria || !jornada) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const sql = `SELECT 
    j.id_jugador,
    j.nombre,
    j.apellido,
    jd.id_equipo,
    p.jornada
FROM 
    jugadores_destacados AS jd
INNER JOIN 
    jugadores AS j ON jd.id_jugador = j.id_jugador
INNER JOIN 
    partidos AS p ON jd.id_partido = p.id_partido
WHERE 
    jd.id_categoria = ? 
    AND p.jornada = ?;
  `;
  db.query(sql, [id_categoria, jornada], (err, result) => {
    if (err) {
      console.error("Error obteniendo jugadores destacados:", err);
      return res
        .status(500)
        .json({ mensaje: "Error obteniendo jugadores destacados" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron jugadores destacados" });
    }
    return res.status(200).json(result);
  });
};

const updateMvpPartido = async (req, res) => {
  const { id_partido, id_jugador } = req.query;

  if (!id_partido) {
    return res.status(400).json({ error: "Faltan datos del partido" });
  }

  try {
    // 2. Eliminar jugador destacado en la tabla jugadores_destacados
    const updateQuery = `
            UPDATE partidos
            SET id_jugador_destacado = ?
            WHERE id_partido = ?`;

    await db.query(updateQuery, [id_jugador, id_partido]);

    const informacion = [id_partido, id_jugador];

    req.io.emit("mvpActualizado", informacion);

    res.status(200).json({
      message: "Se agrego correctamente el mvp al partido",
      status: 200,
    });
  } catch (error) {
    console.error("Error al insertar mvp en el partido", error); // Log para el error específico
    res.status(500).json({ error: "Error al insertar mvp en el partido" });
  }
};

const verificarJugadores = (req, res) => {
  const { id_partido } = req.query;

  if (!id_partido) {
    return res.status(400).send("Falta el id del partido");
  }

  // Consulta para obtener el estado del partido
  const queryEstado = `
        SELECT estado 
        FROM partidos 
        WHERE id_partido = ?
    `;

  db.query(queryEstado, [id_partido], (err, result) => {
    if (err) {
      console.error("Error al obtener el estado del partido:", err);
      return res.status(500).send("Error al obtener el estado del partido");
    }

    if (result.length === 0) {
      return res.status(404).send("Partido no encontrado");
    }

    const estadoPartido = result[0].estado;

    // Si el estado no es 'P', devolvemos que se puede comenzar
    if (estadoPartido !== "P") {
      return res.status(200).json({ sePuedeComenzar: true });
    }

    // Si el estado es 'P', procedemos a contar los jugadores
    const queryEquipos = `
            SELECT id_equipoLocal, id_equipoVisita 
            FROM partidos 
            WHERE id_partido = ?
        `;

    db.query(queryEquipos, [id_partido], (err, result) => {
      if (err) {
        console.error("Error al obtener los equipos del partido:", err);
        return res.status(500).send("Error al obtener los equipos del partido");
      }

      const { id_equipoLocal, id_equipoVisita } = result[0];

      // Consulta para contar los jugadores por equipo en el partido
      const queryJugadores = `
                SELECT
                    (SELECT COUNT(*) FROM formaciones WHERE id_partido = ? AND id_jugador IN (SELECT id_jugador FROM planteles WHERE id_equipo = ?)) AS jugadores_local,
                    (SELECT COUNT(*) FROM formaciones WHERE id_partido = ? AND id_jugador IN (SELECT id_jugador FROM planteles WHERE id_equipo = ?)) AS jugadores_visitante
            `;

      db.query(
        queryJugadores,
        [id_partido, id_equipoLocal, id_partido, id_equipoVisita],
        (err, result) => {
          if (err) {
            console.error("Error al verificar los jugadores:", err);
            return res.status(500).send("Error al verificar los jugadores");
          }

          const { jugadores_local, jugadores_visitante } = result[0];

          if (jugadores_local >= 5 && jugadores_visitante >= 5) {
            return res.status(200).json({ sePuedeComenzar: true });
          } else {
            return res.status(200).json({
              sePuedeComenzar: false,
              jugadores_local,
              jugadores_visitante,
            });
          }
        }
      );
    });
  });
};

const actualizarEstadoPartido = (req, res) => {
  const { id_partido } = req.body;

  if (!id_partido) {
    return res.status(400).json({ mensaje: "Falta el id del partido" });
  }

  // Consulta para obtener el estado actual del partido
  const queryEstado = `
      SELECT estado FROM partidos
      WHERE id_partido = ?
  `;

  db.query(queryEstado, [id_partido], (err, result) => {
    if (err) {
      console.error("Error al obtener el estado del partido:", err);
      return res
        .status(500)
        .json({ mensaje: "Error al obtener el estado del partido" });
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Partido no encontrado" });
    }

    let nuevoEstado;
    let palabra = "";
    const estadoActual = result[0].estado;

    if (estadoActual === "P") {
      nuevoEstado = "C"; // Comenzar el partido
      palabra = "Comenzado";
    } else if (estadoActual === "C") {
      nuevoEstado = "T"; // Terminar el partido
      palabra = "Terminado";
    } else if (estadoActual === "T") {
      nuevoEstado = "F"; // Finalizar el partido
      palabra = "Cargado";
    } else {
      return res
        .status(400)
        .json({ mensaje: "Estado del partido no válido para la transición" });
    }

    // Construir la consulta para actualizar el estado y los goles
    let queryUpdate = `
          UPDATE partidos
          SET estado = ?
      `;
    const params = [nuevoEstado];

    // Si el nuevo estado es "C", también se deben establecer los goles a 0
    if (nuevoEstado === "C") {
      queryUpdate += `,
          goles_local = 0,
          goles_visita = 0`;
    }

    queryUpdate += ` WHERE id_partido = ?`;
    params.push(id_partido);

    db.query(queryUpdate, params, (err, result) => {
      if (err) {
        console.error("Error al actualizar el estado del partido:", err);
        return res
          .status(500)
          .json({ mensaje: "Error al actualizar el estado del partido" });
      }

      // Emitir el nuevo estado del partido a través de WebSocket
      req.io.emit("nuevo-estado-partido", { id_partido, nuevoEstado });

      res.status(200).json({ mensaje: `Partido ${palabra} con éxito` });
    });
  });
};

const updatePartido = (req, res) => {
  const { data } = req.body;
  const {
    descripcion,
    id_partido,
    pen_local,
    pen_visita,
    goles_local,
    goles_visita,
  } = data;

  if (!id_partido) {
    return res.status(400).json({ mensaje: "Falta el id_partido" });
  }

  // Asigna null si penales son 0
  const penLocal = pen_local === 0 ? null : pen_local;
  const penVisita = pen_visita === 0 ? null : pen_visita;

  // Obtener la zona del partido
  const sqlZona = `
      SELECT p.id_zona, z.tipo_zona, z.campeon
      FROM partidos p
      JOIN zonas z ON p.id_zona = z.id_zona
      WHERE p.id_partido = ?
  `;

  db.query(sqlZona, [id_partido], (err, results) => {
    if (err) {
      console.error("Error al obtener la zona:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Partido no encontrado" });
    }

    const { id_zona, tipo_zona, campeon } = results[0];

    // **Actualizar el partido**
    const sqlUpdatePartido = `
          UPDATE partidos
          SET descripcion = ?, pen_local = ?, pen_visita = ?
          WHERE id_partido = ?
      `;

    db.query(
      sqlUpdatePartido,
      [descripcion, penLocal, penVisita, id_partido],
      (err, result) => {
        if (err) {
          console.error("Error al actualizar partido:", err);
          return res
            .status(500)
            .json({ mensaje: "Error interno del servidor" });
        }

        // **Verificar si hay que actualizar el campeón**
        if (tipo_zona === "eliminacion-directa" && campeon === "S") {
          let idEquipoGanador = null;

          if (goles_local > goles_visita) {
            idEquipoGanador = data.id_equipoLocal;
          } else if (goles_visita > goles_local) {
            idEquipoGanador = data.id_equipoVisita;
          } else if (penLocal !== null && penVisita !== null) {
            idEquipoGanador =
              penLocal > penVisita ? data.id_equipoLocal : data.id_equipoVisita;
          }

          if (idEquipoGanador) {
            const sqlUpdateZona = `
                      UPDATE zonas
                      SET id_equipo_campeon = ?
                      WHERE id_zona = ?
                  `;

            db.query(
              sqlUpdateZona,
              [idEquipoGanador, id_zona],
              (err, result) => {
                if (err) {
                  console.error("Error al actualizar campeón de zona:", err);
                  return res
                    .status(500)
                    .json({ mensaje: "Error al actualizar campeón" });
                }
                return res
                  .status(200)
                  .json({
                    mensaje: "Partido y campeón actualizados exitosamente",
                  });
              }
            );
          } else {
            return res
              .status(200)
              .json({
                mensaje: "Partido actualizado, pero no se determinó campeón",
              });
          }
        } else {
          return res
            .status(200)
            .json({ mensaje: "Partido actualizado exitosamente" });
        }
      }
    );
  });
};

const suspenderPartido = (req, res) => {
  const { goles_local, goles_visita, descripcion, estado, id_partido } =
    req.body;
  console.log("Request received:", req.body);

  if (!id_partido) {
    return res.status(400).json({ mensaje: "ID de partido es requerido" });
  }

  if (estado === "A") {
    const sql = `
      UPDATE partidos
      SET 
          estado = ?
      WHERE id_partido = ?
    `;
    db.query(sql, [estado, id_partido], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
      }

      req.io.emit("suspender-partido", { id_partido, estado });
      res.json({ mensaje: "Partido postergado exitosamente" });
    });
  } else {
    const sql = `
      UPDATE partidos
      SET 
          goles_local = ?, 
          goles_visita = ?, 
          descripcion = ?,
          estado = ?
      WHERE id_partido = ?
    `;
    db.query(
      sql,
      [goles_local, goles_visita, descripcion, estado, id_partido],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ mensaje: "Error interno del servidor" });
        }
        const nuevoEstado = estado;
        req.io.emit("nuevo-estado-partido", { id_partido, nuevoEstado });
        res.json({ mensaje: "Partido suspendido exitosamente" });
      }
    );
  }
};

module.exports = {
  getPartidosPlanillero,
  getPartidoIncidencias,
  getPartidoFormaciones,
  firmaJugador,
  crearJugadorEventual,
  getEdicion,
  checkPartidosEventual,
  getJugadoresDestacados,
  updateMvpPartido,
  verificarJugadores,
  actualizarEstadoPartido,
  updatePartido,
  suspenderPartido,
  getPartidosPlanillados,
  getJugadoresDream,
};
