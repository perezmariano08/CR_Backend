const db = require("../utils/db");

const getJugadores = (req, res) => {
  db.query(
    `SELECT 
        j.id_jugador, 
        j.dni, 
        j.nombre, 
        j.apellido, 
        j.posicion, 
        j.id_equipo,
        j.img,
        j.sancionado,
        j.email,
        j.eventual
        FROM jugadores AS j
        LEFT JOIN equipos AS e ON e.id_equipo = j.id_equipo
        ORDER BY 
          j.apellido`,
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const deleteJugador = (req, res) => {
  const { id } = req.body;

  // Sentencia SQL para eliminar el año por ID
  const sql = "DELETE FROM jugadores WHERE id_jugador = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando el jugador:", err);
      return res.status(500).send("Error eliminando el jugador");
    }
    res.status(200).send("Jugador eliminado correctamente");
  });
};

const updateJugador = (req, res) => {
  const {
    dni,
    nombre,
    apellido,
    posicion,
    id_equipo,
    id_jugador,
    jugador_eventual,
  } = req.body;

  // Validar que id_jugador esté presente
  if (!id_jugador) {
    return res.status(400).send("ID de jugador es requerido");
  }

  // Construir la consulta para obtener el valor actual de eventual en la tabla planteles
  const sqlCheckEventual = `
        SELECT eventual FROM planteles
        WHERE id_jugador = ? AND id_equipo = ?
    `;

  db.query(sqlCheckEventual, [id_jugador, id_equipo], (err, result) => {
    if (err) {
      return res.status(500).send("Error interno del servidor");
    }

    // Verificar si el jugador existe en la tabla planteles
    if (result.length === 0) {
      return res.status(404).send("Jugador no encontrado en planteles");
    }

    // Extraer el valor actual de eventual
    const currentEventual = result[0].eventual;

    // Solo actualizar si el valor de eventual ha cambiado
    if (currentEventual !== jugador_eventual) {
      const sqlUpdateEventual = `
                UPDATE planteles
                SET eventual = ?
                WHERE id_jugador = ? AND id_equipo = ?
            `;

      db.query(
        sqlUpdateEventual,
        [jugador_eventual, id_jugador, id_equipo],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .send("Error actualizando eventual en planteles");
          }
          // Luego de actualizar `eventual`, ahora actualizamos al jugador
          updateJugadorInfo();
        }
      );
    } else {
      // Si no hubo cambios en `eventual`, actualizamos al jugador directamente
      updateJugadorInfo();
    }
  });

  // Función para actualizar los datos del jugador en la tabla jugadores
  const updateJugadorInfo = () => {
    const sqlUpdateJugador = `
            UPDATE jugadores
            SET 
                dni = ?, 
                nombre = ?, 
                apellido = ?, 
                posicion = ?, 
                id_equipo = ?
            WHERE id_jugador = ?
        `;

    db.query(
      sqlUpdateJugador,
      [dni, nombre, apellido, posicion, id_equipo, id_jugador],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .send("Error actualizando jugador en la tabla jugadores");
        }

        // Mandar una única respuesta final
        res.send("Jugador actualizado exitosamente");
      }
    );
  };
};

const importarJugadores = async (req, res) => {
  const jugadores = req.body;
  if (!Array.isArray(jugadores)) {
    return res.status(400).send("Invalid data format");
  }

  const getOrCreateTeamId = async (equipo) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id_equipo FROM equipos WHERE nombre = ?",
        [equipo],
        (err, result) => {
          if (err) {
            console.error("Error al buscar el equipo:", err);
            return reject(err);
          }
          if (result.length > 0) {
            resolve(result[0].id_equipo);
          } else {
            db.query(
              "INSERT INTO equipos (nombre) VALUES (?)",
              [equipo],
              (err, result) => {
                if (err) {
                  console.error("Error al crear el equipo:", err);
                  return reject(err);
                }
                resolve(result.insertId);
              }
            );
          }
        }
      );
    });
  };

  try {
    const values = await Promise.all(
      jugadores.map(async (jugador) => {
        const id_equipo = await getOrCreateTeamId(jugador.equipo);
        return [
          jugador.dni,
          jugador.nombre,
          jugador.apellido,
          jugador.posicion,
          id_equipo,
        ];
      })
    );

    const query =
      "INSERT INTO jugadores (dni, nombre, apellido, posicion, id_equipo) VALUES ?";

    db.query(query, [values], (err, result) => {
      if (err) {
        console.error("Error al insertar jugadores:", err);
        return res
          .status(500)
          .send("Error al insertar datos en la base de datos");
      }
      res.status(200).send("Datos importados correctamente");
    });
  } catch (error) {
    console.error("Error durante la importación:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const crearJugador = (req, res) => {
  const {
    apellido,
    dni,
    id_categoria,
    id_edicion,
    id_equipo,
    nombre,
    posicion,
  } = req.body;

  const valores = [
    dni,
    nombre,
    apellido,
    posicion,
    id_equipo,
    id_edicion,
    id_categoria,
  ];

  db.query(
    "CALL sp_crear_jugador(?, ?, ?, ?, ?, ?, ?)",
    valores,
    (err, result) => {
      if (err) {
        if (err.sqlState === "45000") {
          return res.status(400).json({ mensaje: err.sqlMessage });
        }
        console.error("Error al crear el jugador:", err);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
      }
      res.status(200).json({ mensaje: "Jugador creado exitosamente" });
    }
  );
};

const agregarJugadorPlantel = (req, res) => {
  const { id_jugador, id_equipo, id_categoria, id_edicion } = req.body;

  const query = `
  INSERT INTO planteles (id_jugador, id_equipo, id_categoria, id_edicion)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE 
      id_jugador = VALUES(id_jugador)
`;

  // Pasa los valores como un array
  const values = [id_jugador, id_equipo, id_categoria, id_edicion];

  db.query(query, values, (err, result) => {
    if (err) {
      if (err.sqlState === "45000") {
        return res.status(400).send(err.sqlMessage);
      }
      console.error("Error al crear el jugador:", err);
      return res.status(500).send("Error interno del servidor");
    }
    res.status(200).send("Jugador creado exitosamente");
  });
};

const eliminarJugadorPlantel = (req, res) => {
  const { id_jugador, id_equipo, id_edicion, id_categoria } = req.body;

  // Sentencia SQL para eliminar el jugador de la tabla planteles
  const deletePlantelSQL = `
        DELETE FROM planteles 
        WHERE id_jugador = ? 
        AND id_equipo = ? 
        AND id_edicion = ? 
        AND id_categoria = ?`;

  db.query(
    deletePlantelSQL,
    [id_jugador, id_equipo, id_edicion, id_categoria],
    (err, result) => {
      if (err) {
        console.error("Error eliminando el jugador del plantel:", err);
        return res
          .status(500)
          .json({ mensaje: "Error eliminando el jugador del plantel" });
      }
      res
        .status(200)
        .json({ mensaje: "Jugador eliminado del plantel correctamente" });
    }
  );
};

// ESTO ES POR EQUIPO, PARA TRAER J.E. DE CADA EQUIPO Y FACILITAR LA INFORMACION
const verificarJugadorEventual = (req, res) => {
  const { dni, id_categoria, id_equipo } = req.query;

  const encontrarJugador = `
    SELECT 
        p.id_jugador,
        p.id_categoria,
        p.id_equipo,
        j.dni,
        e.nombre
    FROM
        planteles AS p
        INNER JOIN jugadores as j ON p.id_jugador = j.id_jugador
        INNER JOIN equipos as e ON p.id_equipo = e.id_equipo
    WHERE
        p.id_equipo != ?
        AND j.dni = ?
        AND p.id_categoria = ?;`;

  db.query(encontrarJugador, [dni, id_categoria, id_equipo], (err, result) => {
    if (err) {
      console.error("Error verificando el jugador eventual:", err);
      return res.status(500).send("Error verificando el jugador eventual");
    }

    if (result.length > 0) {
      // Se encontró un jugador con ese DNI en la categoría especificada
      res.status(200).json({ found: true, jugador: result[0] });
    } else {
      // No se encontró un jugador
      res.status(200).json({ found: false });
    }
  });
};

const verificarCategoriaJugadorEventual = (req, res) => {
  const { dni, id_categoria, id_equipo } = req.query;

  const encontrarJugador = `
    SELECT 
        p.id_jugador,
        p.id_categoria,
        p.id_equipo,
        j.id_jugador,
        j.dni,
        j.nombre,
        j.apellido
    FROM
        planteles AS p
        INNER JOIN jugadores as j ON p.id_jugador = j.id_jugador
    WHERE
        j.dni = ?`;

  db.query(encontrarJugador, [dni], (err, result) => {
    if (err) {
      console.error("Error verificando el jugador eventual:", err);
      return res.status(500).send("Error verificando el jugador eventual");
    }

    if (result.length > 0) {
      // Verificamos si alguna coincidencia pertenece a la categoría actual
      const matchCategory = result.some(
        (jugador) => Number(jugador.id_categoria) === Number(id_categoria)
      );

      // Si alguna coincide, verificamos si también pertenece al equipo actual
      const matchEquipo = result.some(
        (jugador) =>
          Number(jugador.id_categoria) === Number(id_categoria) &&
          Number(jugador.id_equipo) === Number(id_equipo)
      );

      // Construir la respuesta JSON completa
      const response = {
        found: true,
        matchCategory,
        jugador: result[0],
      };

      if (matchEquipo) {
        response.message = "El jugador ya pertenece al equipo";
      }

      return res.status(200).json(response);
    } else {
      // No se encontró un jugador con el DNI especificado
      return res.status(200).json({ found: false });
    }
  });
};

const getJugadoresDestacados = (req, res) => {
  const { id_categoria, jornada } = req.query;

  db.query(
    `SELECT 
    jd.id_partido,
    jd.id_equipo,
    jd.id_jugador,
    jd.id_categoria,
    jd.dt,
    jd.posicion,
    p.jornada
FROM 
    jugadores_destacados jd
JOIN 
    partidos p
ON 
    jd.id_partido = p.id_partido
ORDER BY 
    p.jornada ASC, jd.posicion ASC;
`,
    [id_categoria, jornada],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const actualizarJugadorDestacado = (req, res) => {
  const { id_partido, jornada, id_equipo, id_jugador, posicion } = req.body;

  // Validaciones de datos
  if (!jornada || !id_equipo || !id_jugador || !posicion) {
    return res.status(400).json({
      error:
        "Faltan datos obligatorios (jornada, id_equipo, id_jugador, posicion)",
    });
  }

  if (
    typeof jornada !== "number" ||
    typeof id_equipo !== "number" ||
    typeof id_jugador !== "number"
  ) {
    return res.status(400).json({
      error: "Los campos jornada, id_equipo e id_jugador deben ser números",
    });
  }

  // Verificamos si el jugador ya está destacado en la jornada actual
  const checkQuery = `
      SELECT *
      FROM jugadores_destacados AS jd
      INNER JOIN partidos AS p ON p.id_partido = jd.id_partido AND p.jornada = ?
      WHERE jd.id_equipo = ?
      AND jd.id_jugador = ?
    `;

  db.query(checkQuery, [jornada, id_equipo, id_jugador], (err, result) => {
    if (err) {
      return res.status(500).json({
        error:
          "Error al verificar si el jugador está destacado en esta jornada",
        details: err,
      });
    }

    if (result.length > 0) {
      // Si el jugador ya está destacado, actualizamos la posición y el campo dt
      const updateQuery = `
          UPDATE jugadores_destacados AS jd
          INNER JOIN partidos AS p ON p.id_partido = jd.id_partido
          SET jd.posicion = ?, jd.dt = 'S'
          WHERE jd.id_jugador = ?
          AND jd.id_equipo = ?
          AND p.jornada = ?
          AND p.id_categoria = jd.id_categoria;
        `;

      db.query(
        updateQuery,
        [posicion, id_jugador, id_equipo, jornada],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error: "Error al actualizar el jugador destacado",
              details: err,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              error:
                "No se encontró el jugador destacado con los datos proporcionados",
            });
          }

          res
            .status(200)
            .json({ message: "Jugador destacado actualizado correctamente", status: 200 });
        }
      );
    } else {
      // Si el jugador NO está en la tabla para la jornada actual, lo insertamos sin id_partido (NULL)
      const insertQuery = `
          INSERT INTO jugadores_destacados (id_partido, id_equipo, id_jugador, posicion, dt, id_categoria)
          SELECT ?, ?, ?, ?, 'S', p.id_categoria
          FROM partidos AS p
          WHERE p.jornada = ?
          LIMIT 1
        `;

      db.query(
        insertQuery,
        [id_partido, id_equipo, id_jugador, posicion, jornada, jornada],
        (err, insertResult) => {
          if (err) {
            return res.status(500).json({
              error: "Error al insertar el nuevo jugador destacado",
              details: err,
            });
          }

          res
            .status(201)
            .json({ message: "Jugador destacado actualizado correctamente" });
        }
      );
    }
  });
};

const resetearPosicionesYDT = (req, res) => {
  const { jornada } = req.query;

  if (!jornada) {
    return res.status(400).json({ error: "La jornada es obligatoria" });
  }

  if (isNaN(jornada)) {
    return res.status(400).json({ error: "La jornada debe ser un número" });
  }

  const query = `
        UPDATE jugadores_destacados AS jd
        INNER JOIN partidos AS p ON p.id_partido = jd.id_partido
        SET jd.posicion = NULL, jd.dt = 'N'
        WHERE p.jornada = ?
        AND p.id_categoria = jd.id_categoria;
    `;

  db.query(query, [jornada], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al resetear posiciones y DT", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error:
          "No se encontraron jugadores destacados para la jornada proporcionada",
      });
    }

    res
      .status(200)
      .json({ message: "Posiciones y DT reseteados correctamente" });
  });
};

const traerJugadoresPorCategoria = (req, res) => {
  const { id_categoria, jornada } = req.query;

  const query = `
SELECT
    pl.id_equipo,
    j.id_jugador,
    j.nombre,
    j.apellido
FROM jugadores AS j
INNER JOIN planteles AS pl
    ON pl.id_jugador = j.id_jugador
    AND pl.id_categoria = ? -- Filtra por categoría
LEFT JOIN jugadores_destacados AS jd
    ON j.id_jugador = jd.id_jugador
LEFT JOIN formaciones AS f
    ON f.id_jugador = j.id_jugador
LEFT JOIN partidos AS p
    ON p.id_partido = f.id_partido
    AND p.jornada = ? -- Filtra por jornada solo en partidos
WHERE j.estado = 'A'
    AND pl.sancionado = 'N'
    AND jd.id_jugador IS NULL -- Excluye los jugadores destacados
ORDER BY j.apellido, j.nombre;
    `;

  db.query(query, [id_categoria, jornada], (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.status(200).send(result);
  });
};

const traerDreamTeamFecha = (req, res) => {
  const { id_categoria, jornada } = req.query;

  if (!id_categoria || !jornada) {
    return res.status(400).json({ mensaje: "Falta parámetros" });
  }

  const sql = `
    SELECT jd.id_jugador,
    jd.id_partido,
    j.nombre,
    j.apellido,
    jd.id_equipo,
    jd.posicion
    FROM
    jugadores_destacados AS jd
    INNER JOIN jugadores AS j ON j.id_jugador = jd.id_jugador
    INNER JOIN partidos AS p ON p.id_partido = jd.id_partido
    INNER JOIN categorias AS c ON c.id_categoria = p.id_categoria
    WHERE c.id_categoria = ?
    AND p.jornada = ?
    AND jd.dt = 'S'
  `;

  db.query(sql, [id_categoria, jornada], (err, result) => {
    if (err)
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    res.status(200).send(result);
  });
};

const eliminarJugadorDt = (req, res) => {

  const { id_partido, id_jugador, id_equipo } = req.body;

  if (!id_partido || !id_jugador || !id_equipo) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }

  const sql = `
    UPDATE jugadores_destacados AS jd
    SET dt = 'N', posicion = NULL
    WHERE id_partido = ?
    AND id_jugador = ?
    AND id_equipo = ?
  `;

  db.query(sql, [id_partido, id_jugador, id_equipo], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    res.status(200).json({ mensaje: "Jugador eliminado del dreamteam", status: 200 });
  });
};

module.exports = {
  getJugadores,
  deleteJugador,
  updateJugador,
  importarJugadores,
  crearJugador,
  eliminarJugadorPlantel,
  agregarJugadorPlantel,
  verificarJugadorEventual,
  verificarCategoriaJugadorEventual,
  getJugadoresDestacados,
  actualizarJugadorDestacado,
  resetearPosicionesYDT,
  traerJugadoresPorCategoria,
  traerDreamTeamFecha,
  eliminarJugadorDt,
};
