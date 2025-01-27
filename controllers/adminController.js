const { query } = require("express");
const db = require("../utils/db");

const crearCategoria = (req, res) => {
  const { nombre, descripcion } = req.body;
  db.query(
    "INSERT INTO categorias(nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Categoria registrada con éxito");
    }
  );
};

const getCategorias = (req, res) => {
  db.query(
    `
        SELECT
            c.id_categoria,
            c.id_edicion, 
            c.nombre AS nombre,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_categoria = c.id_categoria AND p.estado = 'F'), 0),
                ' / ',
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_categoria = c.id_categoria), 0)
            ) AS partidos,
            IFNULL((SELECT COUNT(*) FROM equipos e WHERE e.id_categoria = c.id_categoria), 0) AS equipos,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria), 0),
                ' ',
                IFNULL(
                    CASE 
                        WHEN c.genero = 'F' THEN 
                            CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria) = 1 THEN 'jugadora' ELSE 'jugadoras' END
                        ELSE 
                            CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria) = 1 THEN 'jugador' ELSE 'jugadores' END
                    END,
                    ''
                )
            ) AS jugadores,
            CASE
                WHEN EXISTS (SELECT 1 FROM partidos p WHERE p.id_categoria = c.id_categoria AND p.estado = 'F') THEN 'JUGANDO'
                ELSE 'SIN INICIAR'
            END AS estado
        FROM 
            categorias c
        ORDER BY 
            c.id_categoria DESC`,
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const deleteCategoria = (req, res) => {
  const { id } = req.body;

  // Sentencia SQL para eliminar el año por ID
  const sql = "DELETE FROM categorias WHERE id_categoria = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando la categoria:", err);
      return res.status(500).send("Error eliminando la categoria");
    }
    res.status(200).send("Categoria eliminada correctamente");
  });
};

const crearTorneo = (req, res) => {
  const { nombre, descripcion } = req.body;
  db.query(
    "INSERT INTO torneos(nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Torneo registrado con éxito");
    }
  );
};

const getTorneos = (req, res) => {
  db.query("SELECT * FROM torneos", (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.send(result);
  });
};

const deleteTorneo = (req, res) => {
  const { id } = req.body;

  const sql = "DELETE FROM torneos WHERE id_torneo = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando el torneo:", err);
      return res.status(500).send("Error eliminando el torneo");
    }
    res.status(200).send("Torneo eliminado correctamente");
  });
};

const crearSede = (req, res) => {
  const { nombre, descripcion } = req.body;
  db.query(
    "INSERT INTO sedes(nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Sede registrada con éxito");
    }
  );
};

const getSedes = (req, res) => {
  db.query("SELECT * FROM sedes", (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.send(result);
  });
};

const deleteSede = (req, res) => {
  const { id } = req.body;

  const sql = "DELETE FROM sedes WHERE id_sede = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando la sede:", err);
      return res.status(500).send("Error eliminando la sede");
    }
    res.status(200).send("Sede eliminada correctamente");
  });
};

const crearAnio = (req, res) => {
  const { año, descripcion } = req.body;
  db.query(
    "INSERT INTO años(año, descripcion) VALUES (?, ?)",
    [año, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Año registrado con éxito");
    }
  );
};

const importarAnio = (req, res) => {
  const años = req.body;
  if (!Array.isArray(años)) {
    return res.status(400).send("Invalid data format");
  }

  // Construye el query para insertar múltiples registros
  const values = años.map(({ año, descripcion }) => [año, descripcion]);
  const query = "INSERT INTO años (año, descripcion) VALUES ?";

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .send("Error al insertar datos en la base de datos");
    }
    res.status(200).send("Datos importados correctamente");
  });
};

const deleteAnio = (req, res) => {
  const { id } = req.body;

  // Sentencia SQL para eliminar el año por ID
  const sql = "DELETE FROM años WHERE id_año = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando el año:", err);
      return res.status(500).send("Error eliminando el año");
    }
    res.status(200).send("Año eliminado correctamente");
  });
};

const getAnios = (req, res) => {
  db.query("SELECT * FROM años ORDER BY año DESC", (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.send(result);
  });
};

const getRoles = (req, res) => {
  db.query("SELECT * FROM roles", (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.send(result);
  });
};

const crearTemporada = (req, res) => {
  const { año, sede, categoria, torneo, division, descripcion } = req.body;
  db.query(
    "INSERT INTO temporadas(id_torneo, id_categoria, id_año, id_sede, id_division, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
    [torneo, categoria, año, sede, division, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Temporada registrada con éxito");
    }
  );
};

const getTemporadas = (req, res) => {
  db.query(
    `SELECT 
        id_temporada, 
        torneos.nombre AS torneo, 
        categorias.nombre AS categoria, 
        años.año, 
        sedes.nombre AS sede, 
        divisiones.nombre AS division,
        temporadas.descripcion,
        CONCAT(divisiones.nombre, ' - ', torneos.nombre, ' ', años.año) AS nombre_temporada
            FROM temporadas 
            INNER JOIN torneos ON temporadas.id_torneo = torneos.id_torneo 
            INNER JOIN categorias ON temporadas.id_categoria = categorias.id_categoria 
            INNER JOIN años ON temporadas.id_año = años.id_año 
            INNER JOIN sedes ON temporadas.id_sede = sedes.id_sede
            INNER JOIN divisiones ON temporadas.id_division = divisiones.id_division`,
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const deleteTemporada = (req, res) => {
  const { id } = req.body;

  // Sentencia SQL para eliminar el año por ID
  const sql = "DELETE FROM temporadas WHERE id_temporada = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando la temporada:", err);
      return res.status(500).send("Error eliminando la temporada");
    }
    res.status(200).send("Temporada eliminado correctamente");
  });
};

const crearEquipo = (req, res) => {
  const { nombre, img, categoria, division, descripcion } = req.body;
  db.query(
    "INSERT INTO equipos(nombre, id_categoria, id_division, descripcion, img) VALUES (?, ?, ?, ?, ?)",
    [nombre, categoria, division, descripcion, img],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Temporada registrada con éxito");
    }
  );
};

const getDivisiones = (req, res) => {
  db.query("SELECT * FROM divisiones", (err, result) => {
    if (err) return res.status(500).send("Error interno del servidor");
    res.send(result);
  });
};

const crearDivision = (req, res) => {
  const { nombre, descripcion } = req.body;
  db.query(
    "INSERT INTO divisiones(nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Categoria registrada con éxito");
    }
  );
};

const getUsuarios = (req, res) => {
  db.query(
    `SELECT 
    usuarios.id_usuario, 
    usuarios.dni, 
    CONCAT(UPPER(usuarios.apellido), ', ', usuarios.nombre) AS usuario, 
    usuarios.telefono, 
    usuarios.id_rol, 
    equipos.id_equipo, 
    usuarios.email,
    usuarios.estado,
    usuarios.img,
    usuarios.nombre,
    usuarios.apellido,
    DATE_FORMAT(usuarios.nacimiento, '%d/%m/%Y') AS nacimiento,
    usuarios.fecha_creacion,
    usuarios.fecha_actualizacion
FROM 
    usuarios 
LEFT JOIN 
    roles ON roles.id_rol = usuarios.id_rol 
LEFT JOIN 
    equipos ON equipos.id_equipo = usuarios.id_equipo;`,
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const deleteUsuario = (req, res) => {
  const { id } = req.body;

  // Sentencia SQL para eliminar el año por ID
  const sql = "DELETE FROM usuarios WHERE id_usuario = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando el usuario:", err);
      return res.status(500).send("Error eliminando el usuario");
    }
    res.status(200).send("Usuario eliminado correctamente");
  });
};

const updateUsuario = (req, res) => {
  const {
    dni,
    nombre,
    apellido,
    nacimiento,
    email,
    telefono,
    id_rol,
    id_equipo,
    estado,
    img,
    id_usuario,
  } = req.body;
  const fecha_actualizacion = new Date(); // Obtener la fecha actual

  // Validar que id_usuario esté presente
  if (!id_usuario) {
    return res.status(400).send("ID de usuario es requerido");
  }
  // Construir la consulta SQL
  const sql = `
        UPDATE usuarios
        SET 
            dni = ?, 
            nombre = ?, 
            apellido = ?, 
            nacimiento = ?, 
            email = ?, 
            telefono = ?, 
            id_rol = ?, 
            id_equipo = ?,
            estado = ?,
            img = ?,
            fecha_actualizacion = ?
        WHERE id_usuario = ?;
    `;

  // Ejecutar la consulta
  db.query(
    sql,
    [
      dni,
      nombre,
      apellido,
      nacimiento,
      email,
      telefono,
      id_rol,
      id_equipo,
      estado,
      img,
      fecha_actualizacion,
      id_usuario,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).send("Error interno del servidor");
      }
      res.send("Usuario actualizado exitosamente");
    }
  );
};

const crearJugador = (req, res) => {
  const { dni, nombre, apellido, posicion, id_equipo } = req.body;
  console.log(dni, nombre, apellido, posicion, id_equipo);
  db.query(
    "CALL sp_crear_jugador(?, ?, ?, ?, ?)",
    [dni, nombre, apellido, posicion, id_equipo],
    (err, result) => {
      if (err) {
        if (err.sqlState === "45000") {
          return res.status(400).send(err.sqlMessage);
        }
        console.error(
          "Error al insertar el jugador en la tabla jugadores:",
          err
        );
        return res.status(500).send("Error interno del servidor");
      }
      res.status(200).send("Jugador creado exitosamente");
    }
  );
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

const crearPartido = (req, res) => {
  const {
    id_temporada,
    id_equipoLocal,
    id_equipoVisita,
    jornada,
    dia,
    hora,
    cancha,
    arbitro,
    id_planillero,
  } = req.body;
  db.query(
    `
        INSERT INTO partidos
        (id_temporada, 
        id_equipoLocal, 
        id_equipoVisita, 
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id_temporada,
      id_equipoLocal,
      id_equipoVisita,
      jornada,
      dia,
      hora,
      cancha,
      arbitro,
      id_planillero,
    ],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send("Temporada registrada con éxito");
    }
  );
};

const updatePartido = (req, res) => {
  const { goles_local, goles_visita, descripcion, id_partido } = req.body;
  console.log("Request received:", req.body);

  if (!id_partido) {
    return res.status(400).send("ID de partido es requerido");
  }

  const sql = `
        UPDATE partidos
        SET 
            goles_local = ?, 
            goles_visita = ?, 
            descripcion = ?
        WHERE id_partido = ?
    `;

  db.query(
    sql,
    [goles_local, goles_visita, descripcion, id_partido],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error interno del servidor");
      }
      res.send("Usuario actualizado exitosamente");
    }
  );
};

const crearExpulsion = async (req, res) => {
  const { id_jugador, id_equipo, id_edicion, id_categoria } = req.body;

  try {
    const sql = `
            SELECT COUNT(*) as expulsiones_activas 
            FROM expulsados e
            JOIN partidos p ON e.id_partido = p.id_partido
            WHERE e.id_jugador = ? 
                AND p.id_categoria = ?
                AND e.estado = 'A'
        `;

    // Primera consulta: Verificar si el jugador ya tiene una expulsión activa
    db.query(sql, [id_jugador, id_categoria], (err, result) => {
      if (err) {
        return res.status(500).send("Error interno del servidor");
      }

      const { expulsiones_activas } = result[0];
      if (expulsiones_activas > 0) {
        // Si hay una expulsión activa, terminamos aquí.
        return res
          .status(400)
          .send("El jugador ya tiene una expulsión activa en la categoría");
      }

      // Si no hay expulsión activa, llamamos al procedimiento almacenado
      db.query(
        `CALL sp_crear_expulsion(?, ?, ?, ?);`,
        [id_jugador, id_equipo, id_edicion, id_categoria],
        (err, results) => {
          if (err) {
            console.error(
              "Error al ejecutar el procedimiento almacenado:",
              err
            );
            if (
              err.code === "ER_SIGNAL_EXCEPTION" ||
              err.sqlState === "45000"
            ) {
              // Error lanzado desde el procedimiento almacenado con SIGNAL
              return res
                .status(400)
                .send({
                  error:
                    err.sqlMessage || "Error en el procedimiento almacenado",
                });
            } else {
              return res.status(500).send("Error al registrar la expulsión");
            }
          }

          // Expulsión registrada exitosamente
          res.status(201).send("Expulsión registrada exitosamente");
        }
      );
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error al procesar la solicitud");
  }
};

const borrarExpulsion = async (req, res) => {
  const { id_expulsion, id_categoria, id_jugador } = req.body;

  // Verificar que todos los datos excluyentes están presentes
  if (!id_expulsion || !id_categoria || !id_jugador) {
    return res.status(400).send("Faltan datos excluyentes");
  }

  // Consulta SQL para encontrar la expulsión activa o inactiva en la misma categoría y jugador
  const sqlBuscar = `
        SELECT * 
        FROM expulsados 
        WHERE id_expulsion = ? 
            AND id_jugador = ? 
            AND estado IN ('A', 'I') 
            AND id_partido IN (
            SELECT id_partido 
            FROM partidos 
            WHERE id_categoria = ?
        )
    `;

  db.query(
    sqlBuscar,
    [id_expulsion, id_jugador, id_categoria],
    (err, result) => {
      if (err) {
        return res.status(500).send("Error al buscar la expulsión");
      }

      if (result.length === 0) {
        return res
          .status(404)
          .send(
            "No se encontró una expulsión activa o inactiva para el jugador en esta categoría"
          );
      }

      // Expulsión encontrada, proceder a eliminarla
      const sqlBorrar = `
            DELETE FROM expulsados 
            WHERE id_expulsion = ?
        `;

      db.query(sqlBorrar, [id_expulsion], (err) => {
        if (err) {
          return res.status(500).send("Error al eliminar la expulsión");
        }

        // Actualizar el estado del jugador en la tabla 'planteles'
        const sqlUpdate = `
                UPDATE planteles
                SET sancionado = 'N'
                WHERE id_jugador = ?
                AND id_categoria = ?
            `;

        db.query(sqlUpdate, [id_jugador, id_categoria], (err) => {
          if (err) {
            return res
              .status(500)
              .send("Error al actualizar el estado del jugador");
          }

          // Solo enviar la respuesta al final de todas las operaciones
          return res
            .status(200)
            .send("Expulsión eliminada y estado actualizado correctamente");
        });
      });
    }
  );
};

const actualizarExpulsion = async (req, res) => {
  const { id_expulsion, fechas, fechas_restantes, multa } = req.body;

  if (
    !id_expulsion ||
    typeof fechas !== "number" ||
    typeof fechas_restantes !== "number" ||
    !multa
  ) {
    return res.status(400).send("Falta información excluyente");
  }

  const sqlSelect = `
        SELECT id_partido, id_jugador
        FROM expulsados
        WHERE id_expulsion = ?
    `;

  db.query(sqlSelect, [id_expulsion], (err, result) => {
    if (err || result.length === 0) {
      return res
        .status(400)
        .send("Error al encontrar la expulsión o no existe");
    }

    const { id_partido, id_jugador } = result[0];

    if (fechas_restantes === 0) {
      // Obtener el id_categoria del partido
      const sqlCategoria = `
                SELECT id_categoria
                FROM partidos
                WHERE id_partido = ?
            `;

      db.query(sqlCategoria, [id_partido], (err, result) => {
        if (err || result.length === 0) {
          return res
            .status(400)
            .send("Error al encontrar la categoría del partido");
        }

        const id_categoria = result[0].id_categoria;

        // Actualizar el campo sancionado en planteles
        const sqlUpdatePlanteles = `
                    UPDATE planteles
                    SET sancionado = 'N'
                    WHERE id_jugador = ? AND id_categoria = ?
                `;

        db.query(sqlUpdatePlanteles, [id_jugador, id_categoria], (err) => {
          if (err) {
            return res
              .status(400)
              .send("Error al actualizar el estado de sanción en planteles");
          }

          // Actualizar la expulsión a inactiva
          const sqlUpdateExpulsion = `
                        UPDATE expulsados
                        SET estado = 'I', fechas_restantes = 0
                        WHERE id_expulsion = ?
                    `;

          db.query(sqlUpdateExpulsion, [id_expulsion], (err) => {
            if (err) {
              return res.status(400).send("Error al actualizar la expulsión");
            }
            return res.send(
              "Expulsión actualizada a inactiva y sanción eliminada"
            );
          });
        });
      });
    } else {
      // Actualizar la expulsión con los datos recibidos
      const sqlUpdateExpulsion = `
                UPDATE expulsados
                SET fechas = ?, fechas_restantes = ?, multa = ?, estado = 'A'
                WHERE id_expulsion = ?
            `;

      db.query(
        sqlUpdateExpulsion,
        [fechas, fechas_restantes, multa, id_expulsion],
        (err) => {
          if (err) {
            return res.status(400).send("Error al actualizar la expulsión");
          }
          return res.send("Expulsión actualizada correctamente");
        }
      );
    }
  });
};

const getFases = (req, res) => {
  const { id_categoria } = req.query;


  db.query(
    "SELECT * FROM fases WHERE id_categoria = ?",
    [id_categoria],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const createFase = (req, res) => {
  const { id_categoria, numero_fase } = req.body;
  console.log(id_categoria, numero_fase);
  
  if (!id_categoria || !numero_fase) {
    return res.status(400).json({ mensaje: "Faltan datos para crear la fase" });
  }

  db.query(
    "INSERT INTO fases (id_categoria, numero_fase) VALUES (?, ?)",
    [parseInt(id_categoria), parseInt(numero_fase)],
    (err, result) => {
      if (err) return res.status(500).send("Error interno del servidor");
      res.send(result);
    }
  );
};

const getPartidoZona = (req, res) => {
    const { id_zona, vacante } = req.query;

    // Consultar partidos por id_zona
    db.query(
        "SELECT * FROM partidos WHERE id_zona = ?",
        [id_zona],
        (err, partidos) => {
            if (err) return res.status(500).send("Error interno del servidor");

            // Filtrar partidos según vacante_local o vacante_visita
            const partidosFiltrados = partidos.filter(partido => 
                partido.vacante_local == vacante || partido.vacante_visita == vacante
            );

            if (partidosFiltrados.length > 0) {
                return res.json(partidosFiltrados);
            } else {
                return res.status(404).send("No se encontraron partidos con la vacante especificada");
            }
        }
    );
};

const checkEquipoPlantel = (req, res) => {
  const { id_equipo, id_edicion } = req.query;
  console.log(id_equipo, id_edicion);
  
  if (!id_edicion || !id_equipo) {
    return res.status(500).json({ mensaje: 'Faltan datos importantes' });
  }

  // Verificar si el equipo ya tiene un plantel en la edición actual
  const checkPlantelActualSql = `
    SELECT 
      COUNT(p.id_jugador) AS total_jugadores
    FROM 
      planteles p
    WHERE 
      p.id_equipo = ? AND p.id_edicion = ?;
  `;

  const paramsActual = [id_equipo, id_edicion];

  db.query(checkPlantelActualSql, paramsActual, (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error en la consulta de la base de datos." });
    }

    if (result[0]?.total_jugadores > 0) {
      // Si el equipo ya tiene plantel en la edición actual
      return res.status(400).json({ mensaje: "El equipo ya tiene un plantel en esta edición." });
    }

    // Si no tiene plantel en la edición actual, buscar planteles en otras ediciones
    const checkPlantelOtrasEdicionesSql = `
      SELECT 
        p.id_edicion,
        p.id_categoria,
        COUNT(p.id_jugador) AS total_jugadores,
        CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion
      FROM 
        planteles p
      INNER JOIN
        ediciones e ON p.id_edicion = e.id_edicion
      WHERE 
        p.id_equipo = ? AND p.id_edicion != ?
      GROUP BY 
        p.id_edicion;
    `;

    const paramsOtrasEdiciones = [id_equipo, id_edicion];

    db.query(checkPlantelOtrasEdicionesSql, paramsOtrasEdiciones, (err, result) => {
      if (err) {
        return res.status(500).json({ mensaje: "Error en la consulta de la base de datos." });
      }

      if (result.length === 0) {
        return res.status(404).json({ mensaje: "No se encontraron planteles en otras ediciones." });
      }

      return res.status(200).json({ data: result });
    });
  });
};

const copiarPlantelesTemporada = async (req, res) => {
  const {id_equipo, id_categoria_previo, id_categoria, id_edicion} = req.body;

  if (!id_equipo || !id_categoria_previo || !id_categoria || !id_edicion) {
    return res.status(400).json({ mensaje: "Faltan datos importantes" });
  }

  const sql = `
    CALL sp_copiar_planteles_temporada(?, ?, ?, ?);
  `;

  const params = [id_equipo, id_categoria_previo, id_categoria, id_edicion];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error al copiar planteles temporada:", err);
      return res.status(500).json({ mensaje: "Error al copiar planteles" });
    }

    return res.status(200).json({ mensaje: "Planteles copiados correctamente" });
  });

}

const eliminarFase = async (req, res) => {
  const { id } = req.body;
  const { id_categoria, numero_fase } = id;

  if (!id_categoria || !numero_fase) {
    return res.status(400).json({ mensaje: "Faltan datos para eliminar la fase" });
  }

  const sql = `DELETE FROM fases WHERE id_categoria = ? AND numero_fase = ?`;
  db.query(sql, [id_categoria, numero_fase], (err, result) => {
    if (err) {
      console.error("Error al eliminar fase:", err);
      return res.status(500).json({ mensaje: "Error al eliminar fase" });
    }

    return res.status(200).json({ mensaje: "Fase eliminada correctamente" });
  });

}

module.exports = {
  crearCategoria,
  getCategorias,
  deleteCategoria,

  crearTorneo,
  getTorneos,
  deleteTorneo,

  crearSede,
  getSedes,
  deleteSede,

  crearAnio,
  importarAnio,
  deleteAnio,
  getAnios,

  crearTemporada,
  getTemporadas,
  deleteTemporada,

  crearEquipo,

  getDivisiones,
  crearDivision,

  getRoles,
  getUsuarios,
  updateUsuario,
  deleteUsuario,

  crearPartido,
  updatePartido,
  crearJugador,
  importarJugadores,
  deleteJugador,

  crearExpulsion,
  borrarExpulsion,
  actualizarExpulsion,

  getFases,
  createFase,
  getPartidoZona,

  checkEquipoPlantel,
  copiarPlantelesTemporada,
  eliminarFase
};
