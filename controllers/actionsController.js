const db = require("../utils/db");

const insertarGol = (req, res) => {
  const { id_partido, id_jugador, id_equipo, action, detail, minute } = req.body;

  if (!id_partido || !id_jugador || !id_equipo || !action || detail === undefined || !minute) {
      return res.status(400).json({ mensaje: 'Faltan datos necesarios' });
  }

  db.query(
      `CALL sp_insertar_gol(?, ?, ?, ?, ?, ?)`,
      [id_partido, id_jugador, id_equipo, action, detail, minute],
      (error) => {
          if (error) {
              console.error(error);
              return res.status(500).json({ mensaje: 'Error interno del servidor' });
          }

          // Emitir el evento del socket después de que la operación termine
          req.io.emit('insertar-gol', { id_partido, id_jugador, id_equipo, action, detail, minute });

          res.status(200).json({ mensaje: 'Gol registrado exitosamente' });
      }
  );
};

const insertarAmarilla = async (req, res) => {
    const { id_partido, id_jugador, id_equipo, action, minute } = req.body;

    if (!id_partido || !id_jugador || !id_equipo || !action || !minute) {
        return res.status(400).json({mensaje: 'Faltan datos necesarios'});
    }

    db.query(`CALL sp_insertar_amarilla(?, ?, ?, ?)`, [
        id_partido,
        id_jugador,
        id_equipo,
        minute
    ], (err) => {
      if (err) {
        console.error("Error al ejecutar la consulta de inserción:", err);
        return res.status(500).json({mensaje: 'Error al registrar la amarilla'});
      }
      
      req.io.emit('insertar-amarilla', { id_partido, id_jugador, id_equipo, action, minute });
      
      res.status(200).json({mensaje: 'Amarilla registrada exitosamente'});

      // Contar amarillas 
      const sql = 'SELECT amarillas FROM formaciones WHERE id_partido = ? AND id_jugador = ?'
      db.query(sql, [id_partido, id_jugador], (err, results) => {
        if (err) {
          console.error("Error al obtener la cantidad de amarillas:", err);
          return res.status(500).json({mensaje: 'Error al obtener la cantidad de amarillas'});
        }
        const amarillas = results[0].amarillas;
        if (amarillas == 2) { 
          req.io.emit('insertar-roja', { id_partido, id_jugador, id_equipo, action, minute });
          return;
        }
      })
    });
}

const insertarRoja = (req, res) => {
  const { id_partido, id_jugador, id_equipo, action, minute, detail } = req.body;

  if (!id_partido || !id_jugador || !id_equipo || !action || !minute || detail === undefined) {
      return res.status(400).json({ mensaje: 'Faltan datos necesarios' });
  }

  db.query(
      `CALL sp_insertar_roja(?, ?, ?, ?, ?)`,
      [id_partido, id_jugador, id_equipo, detail, minute],
      (error) => {
          if (error) {
              console.error(error);
              return res.status(500).json({ mensaje: 'Error al registrar la roja' });
          }

          // Emitir el evento del socket después de que la operación termine
          req.io.emit('insertar-roja', { id_partido, id_jugador, id_equipo, action, detail, minute });

          res.status(200).json({ mensaje: 'Roja registrada exitosamente' });
      }
  );
};

const actualizarGol = async (req, res) => {
  const { id_accion, minute } = req.body;

  if (!id_accion || !minute) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_action = id_accion.split('-')[1]; 

  if (!id_action) {
    return res.status(400).json({ mensaje: "Formato de id_accion incorrecto" });
  }

  const sql = `
    UPDATE goles
    SET minuto = ?
    WHERE id_gol = ?
  `;

  db.query(sql, [minute, id_action], (err, result) => {
    if (err) {
      console.error("Error al actualizar el gol:", err);
      return res.status(500).json({ mensaje: "Error al actualizar el gol" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Gol no encontrado" });
    }
    req.io.emit('actualizar-gol', { id_accion, minute });
    return res.status(200).json({ mensaje: "Gol actualizado correctamente" });
  });
};

const actualizarAmarilla = async (req, res) => {
  const { id_accion, minute } = req.body;

  if (!id_accion || !minute) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_action = id_accion.split('-')[1]; // Asegurar que el formato sea correcto

  if (!id_action) {
    return res.status(400).json({ mensaje: "Formato de id_accion incorrecto" });
  }

  const sql = `
    UPDATE amonestados
    SET minuto = ?
    WHERE id_amonestacion = ?
  `;

  db.query(sql, [minute, id_action], (err, result) => {
    if (err) {
      console.error("Error al actualizar la amarilla:", err);
      return res.status(500).json({ mensaje: "Error al actualizar la amarilla" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Amarilla no encontrada" });
    }
    req.io.emit('actualizar-amarilla', { id_accion, minute });
    return res.status(200).json({ mensaje: "Amarilla actualizada correctamente" });
  });
};

const actualizarRoja = async (req, res) => {
  const { id_accion, minute } = req.body;

  if (!id_accion || !minute) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_action = id_accion.split('-')[1];

  if (!id_action) {
    return res.status(400).json({ mensaje: "Formato de id_accion incorrecto" });
  }

  const sql = `
    UPDATE expulsados
    SET minuto = ?
    WHERE id_expulsion = ?
  `;

  db.query(sql, [minute, id_action], (err, result) => {
    if (err) {
      console.error("Error al actualizar la roja:", err);
      return res.status(500).json({ mensaje: "Error al actualizar la roja" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Roja no encontrada" });
    }
    req.io.emit('actualizar-roja', { id_accion, minute });
    return res.status(200).json({ mensaje: "Roja actualizada correctamente" });
  });
};

const eliminarGol = async (req, res) => {
  const { id_partido, id_accion, id_equipo } = req.query;

  if (!id_partido || !id_accion || !id_equipo) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_gol = id_accion.split('-')[1];

  db.query('CALL sp_eliminar_gol(?, ?, ?)', [id_partido, id_gol, id_equipo], (err) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al eliminar el gol' });
    }
    req.io.emit('eliminar-gol', { id_partido, id_accion, id_equipo });
    return res.status(200).json({ mensaje: 'Gol eliminado con éxito' });
  });
};

const eliminarAmarilla = async (req, res) => {
  const { id_partido, id_accion: id_action, id_equipo, id_jugador } = req.query;

  if (!id_partido || !id_action || !id_equipo || !id_jugador) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_accion = id_action.split('-')[1];

  const query = `DELETE FROM amonestados WHERE id_partido = ? AND id_jugador = ? AND id_amonestacion = ?`;
  const params = [id_partido, id_jugador, id_accion];

  const updateQuery = `UPDATE formaciones SET amarillas = GREATEST(amarillas - 1, 0) WHERE id_partido = ? AND id_jugador = ?`;
  const updateParams = [id_partido, id_jugador];

  db.query(query, params, (err) => {
    if (err) {
      console.error("Error al ejecutar la consulta de eliminación:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    db.query(updateQuery, updateParams, (err) => {
      if (err) {
        console.error("Error al actualizar formaciones:", err);
        return res.status(500).json({ mensaje: "Error al actualizar formaciones" });
      }

      const checkDoubleYellowQuery = `SELECT amarillas FROM formaciones WHERE id_partido = ? AND id_jugador = ?`;
      db.query(checkDoubleYellowQuery, [id_partido, id_jugador], (err, results) => {
        if (err) {
          console.error("Error al verificar amarillas:", err);
          return res.status(500).json({ mensaje: "Error interno al verificar amarillas" });
        }

        if (results[0].amarillas <= 2) {
          const deleteExpulsionQuery = `DELETE FROM expulsados WHERE id_partido = ? AND id_jugador = ?`;
          db.query(deleteExpulsionQuery, [id_partido, id_jugador], (err) => {
            if (err) {
              console.error("Error al eliminar expulsión:", err);
              return res.status(500).json({ mensaje: "Error al eliminar expulsión" });
            }
          });

          db.query('SELECT id_categoria FROM partidos WHERE id_partido = ?', [id_partido], (err, results) => {
            if (err) {
              console.error("Error al obtener id_categoria:", err);
              return res.status(500).json({ mensaje: "Error al obtener id_categoria" });
            }

            const idCategoria = results[0].id_categoria;

            const updateSancionadoQuery = `
              UPDATE planteles 
              SET sancionado = 'N' 
              WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?`;
            db.query(updateSancionadoQuery, [id_jugador, id_equipo, idCategoria], (err) => {
              if (err) {
                console.error("Error al actualizar sancionado:", err);
                return res.status(500).json({ mensaje: "Error al actualizar sanción" });
              }
            });

            req.io.emit("eliminar-expulsion", { id_partido, id_jugador, id_action });
          });
        }
        req.io.emit("eliminar-amarilla", { id_partido, id_action, id_equipo });
        res.json({ mensaje: "Acción eliminada exitosamente" });
      });
    });
  });
};

const eliminarRoja = async (req, res) => {
  const { id_partido, id_accion, id_jugador, id_equipo } = req.query;

  if (!id_partido || !id_accion || !id_jugador || !id_equipo) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  const id_action = id_accion.split('-')[1];

  // Obtener id_categoria
  const getCategoriaQuery = `SELECT id_categoria FROM partidos WHERE id_partido = ?`;
  db.query(getCategoriaQuery, [id_partido], (err, results) => {
    if (err) {
      console.error("Error al obtener id_categoria:", err);
      return res.status(500).json({ mensaje: "Error al obtener la categoría del partido" });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró la categoría para el partido especificado" });
    }

    const id_categoria = results[0].id_categoria;

    // Eliminar expulsión
    const deleteQuery = `DELETE FROM expulsados WHERE id_partido = ? AND id_jugador = ? AND id_expulsion = ?`;
    const deleteParams = [id_partido, id_jugador, id_action];

    db.query(deleteQuery, deleteParams, (err) => {
      if (err) {
        console.error("Error al ejecutar la consulta de eliminación:", err);
        return res.status(500).json({ mensaje: "Error interno al eliminar la expulsión" });
      }

      // Actualizar conteo de rojas
      const updateRojasQuery = `UPDATE formaciones SET rojas = GREATEST(rojas - 1, 0) WHERE id_partido = ? AND id_jugador = ?`;
      const updateRojasParams = [id_partido, id_jugador];

      db.query(updateRojasQuery, updateRojasParams, (err) => {
        if (err) {
          console.error("Error al actualizar formaciones:", err);
          return res.status(500).json({ mensaje: "Error al actualizar el conteo de tarjetas rojas" });
        }

        // Actualizar estado de sanción
        const updateSancionadoQuery = `
          UPDATE planteles 
          SET sancionado = 'N' 
          WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?`;
        const updateSancionadoParams = [id_jugador, id_equipo, id_categoria];

        db.query(updateSancionadoQuery, updateSancionadoParams, (err) => {
          if (err) {
            console.error("Error al actualizar el estado de sanción:", err);
            return res.status(500).json({ mensaje: "Error al actualizar el estado de sanción" });
          }

          req.io.emit("eliminar-expulsion", { id_partido, id_jugador, id_action });
          return res.status(200).json({ mensaje: "Expulsión eliminada exitosamente" });
        });
      });
    });
  });
};

const insertarJugadorDestacado = async (req, res) => {
  const { id_categoria, id_partido, id_equipo, id_jugador } = req.body;

  if (!id_jugador || !id_equipo || !id_partido || !id_categoria) {
      return res.status(400).json({ error: "Faltan datos del jugador, id_partido o id_categoria." });
  }

  try {
      const insertQuery = `
          INSERT INTO jugadores_destacados (id_partido, id_equipo, id_jugador, id_categoria, dt)
          VALUES (?, ?, ?, ?, ?);`;

      db.query(insertQuery, [
          id_partido,
          id_equipo,
          id_jugador,
          id_categoria,
          'N',
      ], (error) => {
          if (error) {
              if (error.code === 'ER_DUP_ENTRY') {
                  return res.status(409).json({ error: "El jugador ya está destacado en este partido." });
              }
              console.error("Error al insertar el jugador destacado:", error);
              return res.status(500).json({ error: "Error al insertar el jugador destacado." });
          }

          // Recuperar información del jugador agregado
          const selectQuery = `
              SELECT
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
                  equipos AS e ON jd.id_equipo = e.id_equipo
              WHERE 
                  jd.id_partido = ? AND jd.id_jugador = ?
              LIMIT 1;`;

          db.query(selectQuery, [id_partido, id_jugador], (error, result) => {
              if (error) {
                  console.error("Error al recuperar el jugador destacado:", error);
                  return res.status(500).json({ error: "Error al recuperar el jugador destacado." });
              }

              if (result.length === 0) {
                  return res.status(404).json({ error: "Jugador destacado no encontrado después de insertar." });
              }

              req.io.emit('insertar-jugador-destacado', result[0]);

              res.status(201).json({ message: "Jugador destacado insertado correctamente.", jugador: result[0] });
          });
      });
  } catch (error) {
      console.error("Error general al insertar el jugador destacado:", error);
      res.status(500).json({ error: "Error inesperado al insertar el jugador destacado." });
  }
};

const eliminarJugadorDestacado = async (req, res) => {
  const { id_partido, id_categoria, id_jugador } = req.query;

  if (!id_jugador || !id_partido || !id_categoria) {
      return res
          .status(400)
          .json({ error: "Faltan datos del jugador, id_partido o id_categoria." });
  }

  try {
      // Eliminar el jugador destacado
      const deleteQuery = `
          DELETE FROM jugadores_destacados 
          WHERE id_partido = ? AND id_jugador = ? AND id_categoria = ?`;

      await db.query(deleteQuery, [id_partido, id_jugador, id_categoria]);

      req.io.emit('eliminar-jugador-destacado', { id_partido, id_jugador });

      res.status(200).json({ message: "Jugador destacado eliminado correctamente." });
  } catch (error) {
      console.error("Error al eliminar el jugador destacado:", error);
      res.status(500).json({ error: "Error al eliminar el jugador destacado." });
  }
};

const borrarFirmaJugador = (req, res) => {
    const { id_partido, id_jugador } = req.query;
  
    if (!id_partido || !id_jugador) {
      return res.status(400).send("Faltan datos necesarios");
    }
  
    // Llamar al procedimiento almacenado
    const query = `CALL sp_borrar_firma_jugador(?, ?)`;
  
    db.query(query, [id_jugador, id_partido], (err, result) => {
      if (err) {
        console.error("Error al ejecutar el procedimiento almacenado:", err);
        return res
          .status(500)
          .json({mensaje: "Error al borrar el dorsal del jugador"});
      }
  
      res.status(200).json({mensaje: "Dorsal eliminado correctamente"});
    });
};

module.exports = {
    insertarGol,
    insertarAmarilla,
    insertarRoja,
    actualizarGol,
    actualizarAmarilla,
    actualizarRoja,
    eliminarGol,
    eliminarAmarilla,
    eliminarRoja,
    insertarJugadorDestacado,
    eliminarJugadorDestacado,
    borrarFirmaJugador
};