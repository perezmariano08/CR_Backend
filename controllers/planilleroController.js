const db = require("../utils/db");

const firmaJugador = (req, res) => {
  const { idPartido, idJugador, dorsal } = req.body;

  if (!idPartido || !idJugador || !dorsal) {
    return res.status(400).send("Faltan datos necesarios");
  }

  const query = `
        INSERT INTO formaciones (id_partido, id_jugador, dorsal)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE dorsal = VALUES(dorsal)
    `;

  db.query(query, [idPartido, idJugador, dorsal], (err, result) => {
    if (err) {
      console.error("Error al insertar el dorsal en la base de datos:", err);
      return res.status(500).send("Error al guardar el dorsal");
    }

    // Emitir el evento de dorsal asignado a través de WebSocket
    const dorsalData = { idPartido, idJugador, dorsal };
    if (req.io && typeof req.io.emit === "function") {
      req.io.emit("dorsalAsignado", dorsalData);
    } else {
      console.error("Socket.io no está disponible");
      return res.status(500).send("Error en el servidor de WebSocket");
    }

    res.status(200).send("Dorsal guardado correctamente");
  });
};

const borrarFirmaJugador = (req, res) => {
  const { idPartido, idJugador } = req.body;

  if (!idPartido || !idJugador) {
    return res.status(400).send("Faltan datos necesarios");
  }

  // Llamar al procedimiento almacenado
  const query = `CALL sp_borrar_firma_jugador(?, ?)`;

  db.query(query, [idJugador, idPartido], (err, result) => {
    if (err) {
      console.error("Error al ejecutar el procedimiento almacenado:", err);
      return res
        .status(500)
        .send("Error al borrar el dorsal y acciones del jugador");
    }

    // Emitir el evento de dorsal eliminado a través de WebSocket
    const dorsalData = { idPartido, idJugador };
    if (req.io && typeof req.io.emit === "function") {
      req.io.emit("dorsalEliminado", dorsalData);
    } else {
      console.error("Socket.io no está disponible");
      return res.status(500).send("Error en el servidor de WebSocket");
    }

    res.status(200).send("Dorsal y acciones eliminados correctamente");
  });
};

//!AGREGAR DISTINCION POR CATEGORIA
const insertarAccion = (req, res) => {
  const {
    idPartido,
    isLocalTeam,
    idJugador,
    nombreJugador,
    dorsal,
    accion,
    minuto,
    detail,
    tipoExpulsion
  } = req.body;
  let motivo = tipoExpulsion;

  let query;
  let params;

  let updateQuery;
  let updateParams;

  // Obtener el id_categoria del partido
  const getIdCategoriaQuery = `SELECT id_categoria FROM partidos WHERE id_partido = ?`;

  db.query(getIdCategoriaQuery, [idPartido], (err, results) => {
    if (err) {
      console.error("Error al obtener id_categoria:", err);
      return res.status(500).send("Error interno al obtener id_categoria");
    }

    if (results.length === 0) {
      return res.status(404).send("Partido no encontrado");
    }

    const idCategoria = results[0].id_categoria;

    if (accion === "Gol") {
      const penal = detail.penal === "si" ? "S" : "N";
      const enContra = detail.enContra === "si" ? "S" : "N";
    
      // Insertar el gol en la tabla de goles
      query = `INSERT INTO goles (id_partido, id_jugador, minuto, penal, en_contra) VALUES (?, ?, ?, ?, ?)`;
      params = [idPartido, idJugador, minuto, penal, enContra];
    
      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Error al insertar el gol:", err);
          return res.status(500).send("Error al registrar gol");
        }
    
        const idGol = result.insertId; // Obtener el ID del gol insertado
    
        // Actualizar los goles en la tabla formaciones
        updateQuery = `UPDATE formaciones SET goles = goles + 1 WHERE id_partido = ? AND id_jugador = ?`;
        updateParams = [idPartido, idJugador];
    
        db.query(updateQuery, updateParams, (err) => {
          if (err) {
            console.error("Error al actualizar goles en formaciones:", err);
            return res.status(500).send("Error al actualizar goles en formaciones");
          }
    
          // Llamar a la función para actualizar los goles del equipo en la tabla partidos
          actualizarGolesPartido(idPartido, isLocalTeam, enContra);
    
          // Preparar los datos para el socket
          const actionData = {
            tipo: accion,
            minuto: parseInt(minuto),
            id_jugador: idJugador,
            id_equipo: isLocalTeam,
            nombre: nombreJugador.split(" ")[0], // Primer nombre
            apellido: nombreJugador.split(" ")[1] || "", // Apellido
            penal: penal,
            en_contra: enContra,
            id_accion: idGol, // ID del gol insertado
            id_partido: idPartido
          };
    
          // Emitir el evento solo una vez después de insertar gol y actualizar formaciones
          if (!req.io || typeof req.io.emit !== "function") {
            console.error("Socket.io no está disponible");
            return res.status(500).send("Error en el servidor de WebSocket");
          }
    
          req.io.emit("nuevaAccion", actionData);
    
          // Si hay asistencia, insertarla
          if (detail.withAssist) {
            const insertarAsistencia = `INSERT INTO asistencias (id_partido, id_jugador, minuto) VALUES (?, ?, ?)`;
            db.query(insertarAsistencia, [idPartido, detail.idAsistente, minuto], (err) => {
              if (err) {
                console.error("Error al registrar asistencia:", err);
                return res.status(500).send("Error al registrar asistencia");
              }
              res.send("Acción registrada y goles actualizados exitosamente");
            });
          } else {
            res.send("Acción registrada y goles actualizados exitosamente");
          }
        });
      });
    
      return;
      
    } else if (accion === "Amarilla") {
      query = `INSERT INTO amonestados (id_partido, id_jugador, minuto) VALUES (?, ?, ?)`;
      params = [idPartido, idJugador, minuto];

      // Primero, actualiza la cantidad de amarillas en formaciones
      updateQuery = `UPDATE formaciones SET amarillas = amarillas + 1 WHERE id_partido = ? AND id_jugador = ?`;
      updateParams = [idPartido, idJugador];

      db.query(updateQuery, updateParams, (err) => {
        if (err) {
          console.error("Error al actualizar formaciones:", err);
          return res.status(500).send("Error al actualizar formaciones");
        }

        // Luego, verifica si el jugador tiene dos amarillas
        const checkDoubleYellowQuery = `SELECT amarillas FROM formaciones WHERE id_partido = ? AND id_jugador = ?`;
        db.query(
          checkDoubleYellowQuery,
          [idPartido, idJugador],
          (err, results) => {
            if (err) {
              console.error("Error al verificar amarillas:", err);
              return res
                .status(500)
                .send("Error interno al verificar amarillas");
            }

            if (results[0].amarillas >= 2) {
              motivo = "Doble amarilla";
              const descripcion = "";
              const insertExpulsionQuery = `
                            INSERT INTO expulsados (id_partido, id_jugador, minuto, descripcion, motivo, estado, fechas, fechas_restantes, multa)
                            VALUES (?, ?, ?, ?, ?, 'A', 1, 1, 'N')
                        `;
              db.query(
                insertExpulsionQuery,
                [idPartido, idJugador, minuto, descripcion, motivo],
                (err) => {
                  if (err) {
                    console.error("Error al registrar expulsión:", err);
                    return res.status(500).send("Error al registrar expulsión");
                  }
                }
              );

              // Actualizar el estado de sancionado en la tabla planteles
              const updateSancionadoQuery = `
                            UPDATE planteles 
                            SET sancionado = 'S' 
                            WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?
                        `;
              const idEquipo = isLocalTeam; // Este es el id del equipo local
              db.query(
                updateSancionadoQuery,
                [idJugador, idEquipo, idCategoria],
                (err) => {
                  if (err) {
                    console.error("Error al actualizar sancionado:", err);
                    return res.status(500).send("Error al actualizar sanción");
                  }
                }
              );

              // Emitir WebSocket después de la expulsión
              const expulsionData = {
                idPartido,
                idJugador,
                accion: "Expulsión",
                minuto,
              };
              req.io.emit("expulsión", expulsionData);
            }
          }
        );
      });
    } else if (accion === "Roja") {
      const descripcion = ""; // Descripción vacía

      // Crear la expulsión en la tabla expulsados
      query = `
                INSERT INTO expulsados (id_partido, id_jugador, minuto, descripcion, motivo, estado, fechas, fechas_restantes, multa)
                VALUES (?, ?, ?, ?, ?, 'A', 1, 1, 'N')
            `;
      params = [idPartido, idJugador, minuto, descripcion, motivo];

      // Actualizar el estado de sancionado en la tabla planteles
      const updateSancionadoQuery = `
                UPDATE planteles 
                SET sancionado = 'S' 
                WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?
            `;
      const idEquipo = isLocalTeam; // Este es el id del equipo local
      db.query(
        updateSancionadoQuery,
        [idJugador, idEquipo, idCategoria],
        (err) => {
          if (err) {
            console.error("Error al actualizar sancionado:", err);
            return res.status(500).send("Error al actualizar sanción");
          }
        }
      );

      // Incrementar la tarjeta roja en la tabla formaciones
      const updateRedCardQuery = `
                UPDATE formaciones 
                SET rojas = rojas + 1 
                WHERE id_partido = ? AND id_jugador = ?
            `;
      db.query(updateRedCardQuery, [idPartido, idJugador], (err) => {
        if (err) {
          console.error("Error al actualizar tarjetas rojas:", err);
          return res.status(500).send("Error al actualizar tarjetas rojas");
        }
      });

      // Emitir WebSocket después de la inserción
      const expulsionData = {
        idPartido,
        idJugador,
        accion,
        minuto,
      };
      req.io.emit("expulsión", expulsionData);
    }

  // Aquí debes definir el idAccion que obtienes después de la inserción
  let idAccion; // Asegúrate de que idAccion esté asignado correctamente después de la inserción en la base de datos.

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).send("Error interno del servidor");
    }

    // Aquí obtienes el id de la acción insertada
    idAccion = result.insertId; // Asegúrate de que tu consulta de inserción esté configurada para devolver el id.

  // Supongamos que nombreJugador tiene el formato "Nombre Apellido"
  const [nombre, apellido] = nombreJugador.split(" ");

  // Ahora mapeamos los datos para cumplir con la estructura requerida
  const actionData = {
    tipo: accion, // Mapeamos el campo acción
    minuto: parseInt(minuto), // Convertimos a entero si es necesario
    id_jugador: idJugador,
    id_equipo: isLocalTeam, // Asumiendo que isLocalTeam es el id del equipo
    nombre: nombre, // Primer parte del nombre
    apellido: apellido || "", // Segunda parte del nombre o vacío si no hay
    descripcion: detail.descripcion || null, // Si tienes algún detalle de descripción, colócalo aquí
    motivo: tipoExpulsion || null, // Cambia esto si necesitas algún otro motivo
    penal: detail.penal || "N", // Asumimos que "N" es el valor por defecto
    en_contra: detail.enContra || "N", // Lo mismo aquí
    id_accion: idAccion, // Aquí agregas el id de la acción
    id_partido: idPartido // Agregamos el id del partido
  };

    if (!req.io || typeof req.io.emit !== "function") {
      console.error("Socket.io no está disponible");
      return res.status(500).send("Error en el servidor de WebSocket");
    }

    req.io.emit("nuevaAccion", actionData);
    res.send("Acción registrada y agregada exitosamente");
  });
  });
};

//!AGREGAR DISTINCION POR CATEGORIA
const eliminarAccion = (req, res) => {
  const {
    id_accion,
    id_equipo,
    id_jugador,
    dorsal,
    tipo,
    minuto,
    nombre,
    apellido,
    descripcion,
    motivo,
    penal,
    en_contra
  } = req.body;

  // Obtener el id_categoria del partido
  const {id_partido: idPartido} = req.query; // Asumiendo que el ID del partido viene en los parámetros de la ruta

  let query;
  let params;

  // Variable para las consultas de actualización
  let updateQuery;
  let updateParams;

  const getIdCategoriaQuery = `SELECT id_categoria FROM partidos WHERE id_partido = ?`;

  db.query(getIdCategoriaQuery, [idPartido], (err, results) => {
    if (err) {
      console.error("Error al obtener id_categoria:", err);
      return res.status(500).send("Error interno al obtener id_categoria");
    }

    if (results.length === 0) {
      return res.status(404).send("Partido no encontrado");
    }

    const idCategoria = results[0].id_categoria;

    if (tipo === "Gol") {
      // Determinar si el gol fue en contra antes de eliminarlo
      const verificarGolEnContraQuery = `SELECT en_contra FROM goles WHERE id_partido = ? AND id_jugador = ? AND id_gol = ?`;
      db.query(verificarGolEnContraQuery, [idPartido, id_jugador, id_accion], (err, results) => {
        if (err) {
          console.error("Error al verificar si el gol fue en contra:", err);
          return res.status(500).send("Error interno al verificar si el gol fue en contra");
        }

        if (results.length === 0) {
          console.error("Gol no encontrado para verificar");
          return res.status(404).send("Gol no encontrado");
        }

        const enContra = results[0].en_contra;

        // Lógica para disminuir goles antes de eliminar el gol
        disminuirGoles(idPartido, id_equipo, enContra, () => {
          // Ahora que hemos actualizado los goles, procedemos a eliminar el gol
          const eliminarGolQuery = `DELETE FROM goles WHERE id_partido = ? AND id_jugador = ? AND id_gol = ?`;
          db.query(eliminarGolQuery, [idPartido, id_jugador, id_accion], (err) => {
            if (err) {
              console.error("Error al eliminar el gol:", err);
              return res.status(500).send("Error interno al eliminar el gol");
            }

            // Aseguramos que los goles no queden en -1 en la tabla formaciones
            const updateQuery = `UPDATE formaciones SET goles = GREATEST(goles - 1, 0) WHERE id_partido = ? AND id_jugador = ?`;
            const updateParams = [idPartido, id_jugador];

            db.query(updateQuery, updateParams, (err) => {
              if (err) {
                console.error("Error al actualizar formaciones:", err);
                return res.status(500).send("Error al actualizar formaciones");
              }

              // Emitir evento WebSocket
              const actionData = {
                tipo,
                minuto: parseInt(minuto),
                id_jugador,
                id_equipo,
                dorsal,
                id_accion,
                nombre,
                apellido,
                descripcion,
                motivo,
                penal,
                en_contra,
              };

              req.io.emit("eliminarAccion", actionData);
              res.send("Acción eliminada exitosamente");
            });
          });
        });
      });
      return; // Evitar ejecución adicional
    } else if (tipo === "Amarilla") {
      query = `DELETE FROM amonestados WHERE id_partido = ? AND id_jugador = ? AND id_amonestacion = ?`;
      params = [idPartido, id_jugador, id_accion];

      // Aseguramos que las amarillas no queden en -1
      updateQuery = `UPDATE formaciones SET amarillas = GREATEST(amarillas - 1, 0) WHERE id_partido = ? AND id_jugador = ?`;
      updateParams = [idPartido, id_jugador];

      // Ejecutar la consulta de eliminación primero
      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta de eliminación:", err);
          return res.status(500).send("Error interno del servidor");
        }

        // Ejecutar la consulta de actualización de amarillas
        db.query(updateQuery, updateParams, (err) => {
          if (err) {
            console.error("Error al actualizar formaciones:", err);
            return res.status(500).send("Error al actualizar formaciones");
          }

          // Verificamos si hay más de una amarilla después de la actualización
          const checkDoubleYellowQuery = `SELECT amarillas FROM formaciones WHERE id_partido = ? AND id_jugador = ?`;
          db.query(checkDoubleYellowQuery, [idPartido, id_jugador], (err, results) => {
            if (err) {
              console.error("Error al verificar amarillas:", err);
              return res.status(500).send("Error interno al verificar amarillas");
            }

            if (results[0].amarillas <= 2) {
              const deleteExpulsionQuery = `DELETE FROM expulsados WHERE id_partido = ? AND id_jugador = ?`;
              db.query(deleteExpulsionQuery, [idPartido, id_jugador], (err) => {
                if (err) {
                  console.error("Error al eliminar expulsión:", err);
                  return res.status(500).send("Error al eliminar expulsión");
                }
              });

              const updateSancionadoQuery = `
                UPDATE planteles 
                SET sancionado = 'N' 
                WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?`;
              db.query(updateSancionadoQuery, [id_jugador, id_equipo, idCategoria], (err) => {
                if (err) {
                  console.error("Error al actualizar sancionado:", err);
                  return res.status(500).send("Error al actualizar sanción");
                }
              });

              // Emitir WebSocket después de la eliminación
              const expulsionData = {
                idPartido,
                id_jugador,
                tipo,
                minuto,
              };
              req.io.emit("eliminarExpulsión", expulsionData);
            }

            // Datos de la acción para emitir
            const actionData = {
              tipo, // "Gol", "Amarilla", etc.
              minuto: parseInt(minuto), // Convertimos a entero si es necesario
              id_jugador,
              id_equipo,
              nombre,
              apellido,
              descripcion,
              motivo,
              penal,
              en_contra,
              id_accion, // ID de la acción a eliminar
            };

            req.io.emit("eliminarAccion", actionData); // Emitir acción de eliminación
            res.send("Acción eliminada exitosamente");
          });
        });
      });

      return; // Salir de la función para evitar ejecución adicional
    } else if (tipo === "Roja") {
      query = `DELETE FROM expulsados WHERE id_partido = ? AND id_jugador = ? AND id_expulsion = ?`;
      params = [idPartido, id_jugador, id_accion];

      // Aseguramos que las rojas no queden en -1
      updateQuery = `UPDATE formaciones SET rojas = GREATEST(rojas - 1, 0) WHERE id_partido = ? AND id_jugador = ?`;
      updateParams = [idPartido, id_jugador];

      const updateSancionadoQuery = `
        UPDATE planteles 
        SET sancionado = 'N' 
        WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ?`;

      db.query(updateSancionadoQuery, [id_jugador, id_equipo, idCategoria], (err) => {
        if (err) {
          console.error("Error al actualizar sancionado:", err);
          return res.status(500).send("Error al actualizar sanción");
        }

        // Emitir WebSocket después de la eliminación
        const expulsionData = {
          idPartido,
          id_jugador,
          tipo,
          minuto,
        };

        req.io.emit("eliminarExpulsión", expulsionData);
        
      });
    }

    // Ejecutar la consulta de eliminación
    db.query(query, params, (err) => {
      if (err) {
        console.error("Error al ejecutar la consulta de eliminación:", err);
        return res.status(500).send("Error interno del servidor");
      }

      // Ejecutar la consulta de actualización, si se requiere
      if (updateQuery && updateParams) {
        db.query(updateQuery, updateParams, (err) => {
          if (err) {
            console.error("Error al actualizar formaciones:", err);
            return res.status(500).send("Error al actualizar formaciones");
          }
        });
      }

      // Datos de la acción para emitir
      const actionData = {
        tipo,
        minuto: parseInt(minuto),
        id_jugador,
        id_equipo,
        dorsal,
        id_accion,
        nombre,
        apellido,
        descripcion,
        motivo,
        penal,
        en_contra,
      };

      req.io.emit("eliminarAccion", actionData); // Emitir acción de eliminación
      res.send("Acción eliminada exitosamente");
    });
  });
};

const editarAccion = (req, res) => {
  const {
    id_accion, // ID de la acción que se va a editar
    id_partido,
    tipo, // Tipo de acción (Gol, Amarilla, Roja)
    minuto,
    id_jugador,
    id_equipo,
    nombre,
    apellido,
    descripcion,
    motivo,
    penal,
    en_contra,
    dorsal
  } = req.body;

  let query;

  // Determinar la consulta y los parámetros según el tipo de acción
  if (tipo === "Gol") {
    query = `UPDATE goles SET minuto = ? WHERE id_gol = ? AND id_partido = ?`;
  } else if (tipo === "Amarilla") {
    query = `UPDATE amonestados SET minuto = ? WHERE id_amonestacion = ? AND id_partido = ?`;
  } else if (tipo === "Roja") {
    query = `UPDATE expulsados SET minuto = ? WHERE id_expulsion = ? AND id_partido = ?`;
  } else {
    return res.status(400).send("Acción no válida");
  }

  // Establecer los parámetros
  const params = [minuto, id_accion, id_partido];

  // Ejecutar la consulta de actualización
  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta de actualización:", err);
      return res.status(500).send("Error interno del servidor");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Acción no encontrada");
    }

    // Emitir acción de edición a través de WebSocket con toda la información
    const actionData = {
      tipo,
      minuto,
      id_jugador,
      id_equipo,
      nombre,
      apellido,
      descripcion,
      motivo,
      penal,
      en_contra,
      id_accion,
      dorsal,
      id_partido
    };
    req.io.emit("editarAccion", actionData);

    res.send("Acción editada exitosamente");
  });
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
  const { idPartido } = req.body;

  if (!idPartido) {
      return res.status(400).send("Falta el id del partido");
  }

  // Consulta para obtener el estado actual del partido
  const queryEstado = `
      SELECT estado FROM partidos
      WHERE id_partido = ?
  `;

  db.query(queryEstado, [idPartido], (err, result) => {
      if (err) {
          console.error("Error al obtener el estado del partido:", err);
          return res.status(500).send("Error al obtener el estado del partido");
      }

      if (result.length === 0) {
          return res.status(404).send("Partido no encontrado");
      }

      let nuevoEstado;
      const estadoActual = result[0].estado;

      if (estadoActual === "P") {
          nuevoEstado = "C"; // Comenzar el partido
      } else if (estadoActual === "C") {
          nuevoEstado = "T"; // Terminar el partido
      } else if (estadoActual === "T") {
          nuevoEstado = "F"; // Finalizar el partido
      } else {
          return res.status(400).send("Estado del partido no válido para la transición");
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
      params.push(idPartido);

      db.query(queryUpdate, params, (err, result) => {
          if (err) {
              console.error("Error al actualizar el estado del partido:", err);
              return res.status(500).send("Error al actualizar el estado del partido");
          }

          // Emitir el nuevo estado del partido a través de WebSocket
          req.io.emit("estadoPartidoActualizado", { idPartido, nuevoEstado });

          res.status(200).send(`Estado del partido cambiado a ${nuevoEstado}`);
      });
  });
};

const insertarJugadorDestacado = async (req, res) => {
  const { id_jugador, id_equipo } = req.body; 
  const { id_categoria, id_partido } = req.query;

  if (!id_jugador || !id_equipo || !id_partido || !id_categoria) {
    return res.status(400).json({ error: "Faltan datos del jugador, id_partido o id_categoria." });
  }

  try {
    const insertQuery = 
      `INSERT INTO jugadores_destacados (id_partido, id_equipo, id_jugador, id_categoria, dt, posicion)
      VALUES (?, ?, ?, ?, ?, ?);`;

    const posicion = "Posición no especificada"; 

    await db.query(insertQuery, [
      id_partido,
      id_equipo,
      id_jugador,
      id_categoria,
      'N',
      posicion,
    ]);

    req.io.emit('jugadoresDestacadosActualizados', id_partido);

    res.status(201).json({ message: "Jugador destacado insertado correctamente." });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "El jugador ya está destacado en este partido." });
    }
    console.error("Error al insertar el jugador destacado:", error);
    res.status(500).json({ error: "Error al insertar el jugador destacado." });
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
    const deleteQuery = `
            DELETE FROM jugadores_destacados 
            WHERE id_partido = ? AND id_jugador = ? AND id_categoria = ?`;

    await db.query(deleteQuery, [id_partido, id_jugador, id_categoria]);

    // Consulta para obtener todos los jugadores destacados actualizados
    const selectQuery = 
      `SELECT * FROM jugadores_destacados WHERE id_partido = ?;`;

    const jugadoresDestacados = await db.query(selectQuery, [id_partido]);

    const results = Array.isArray(jugadoresDestacados) ? jugadoresDestacados : jugadoresDestacados[0] || [];

    req.io.emit('jugadoresDestacadosActualizados', results);

    res.status(200).json({ message: "Jugador destacado eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el jugador destacado:", error);
    res.status(500).json({ error: "Error al eliminar el jugador destacado." });
  }
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

    const informacion = [id_partido, id_jugador]

    req.io.emit('mvpActualizado', informacion)

    res.status(200).json({
      message: "Se agrego correctamente el mvp al partido",
      status: 200,
    });
  } catch (error) {
    console.error("Error al insertar mvp en el partido", error); // Log para el error específico
    res.status(500).json({ error: "Error al insertar mvp en el partido" });
  }
};

const crearJugadorEventual = async (req, res) => {
  const { id_partido, id_equipo, nombre, apellido, dni, dorsal, estado, eventual } = req.body;

  try {
    // 1. Verificar si el jugador ya existe en la tabla jugadores
    db.query(
      `SELECT id_jugador FROM jugadores WHERE dni = ?`, 
      [dni], 
      (error, jugadores) => {
        if (error) {
          console.error('Error al consultar el jugador:', error);
          return res.status(500).json({ success: false, message: 'Error al consultar el jugador' });
        }

        let id_jugador;

        if (jugadores.length > 0) {
          // Jugador ya existe, obtener su id
          id_jugador = jugadores[0].id_jugador;
        } else {
          // Jugador no existe, crear uno nuevo
          db.query(
            `INSERT INTO jugadores (dni, nombre, apellido, estado) VALUES (?, ?, ?, ?)`, 
            [dni, nombre, apellido, estado], 
            (error, resultadoJugador) => {
              if (error) {
                console.error('Error al insertar el jugador:', error);
                return res.status(500).json({ success: false, message: 'Error al insertar el jugador' });
              }
              id_jugador = resultadoJugador.insertId; // Obtener el ID del jugador recién creado
            }
          );
        }

        // 2. Obtener id_categoria e id_edicion de la tabla partidos
        db.query(
          `SELECT id_categoria, id_edicion FROM partidos WHERE id_partido = ?`, 
          [id_partido], 
          (error, partido) => {
            if (error) {
              console.error('Error al consultar el partido:', error);
              return res.status(500).json({ success: false, message: 'Error al consultar el partido' });
            }

            // Verifica si el partido existe
            if (!partido.length) {
              return res.status(404).json({ success: false, message: 'Partido no encontrado' });
            }

            const { id_categoria, id_edicion } = partido[0];

            // 3. Verificar si el jugador ya existe en la tabla planteles para el mismo equipo
            db.query(
              `SELECT * FROM planteles WHERE id_jugador = ? AND id_equipo = ? AND id_categoria = ? AND id_edicion = ?`, 
              [id_jugador, id_equipo, id_categoria, id_edicion], 
              (error, planteles) => {
                if (error) {
                  console.error('Error al consultar en planteles:', error);
                  return res.status(500).json({ success: false, message: 'Error al consultar en planteles' });
                }

                if (planteles.length > 0) {
                  return res.status(409).json({ success: false, message: 'El jugador ya está registrado en este equipo' });
                }

                // 4. Insertar el jugador en la tabla planteles
                db.query(
                  `INSERT INTO planteles (id_equipo, id_jugador, id_edicion, id_categoria, eventual, sancionado) 
                  VALUES (?, ?, ?, ?, ?, ?)`, 
                  [id_equipo, id_jugador, id_edicion, id_categoria, eventual, 'N'], 
                  (error) => {
                    if (error) {
                      console.error('Error al insertar en planteles:', error);
                      return res.status(500).json({ success: false, message: 'Error al insertar en planteles' });
                    }

                    // 5. Verificar si el jugador ya existe en la tabla formaciones para el mismo partido
                    db.query(
                      `SELECT * FROM formaciones WHERE id_partido = ? AND id_jugador = ?`, 
                      [id_partido, id_jugador], 
                      (error, formaciones) => {
                        if (error) {
                          console.error('Error al consultar en formaciones:', error);
                          return res.status(500).json({ success: false, message: 'Error al consultar en formaciones' });
                        }

                        if (formaciones.length > 0) {
                          return res.status(409).json({ success: false, message: 'El jugador ya está registrado en este partido' });
                        }

                        // 6. Insertar en la tabla formaciones
                        db.query(
                          `INSERT INTO formaciones (id_partido, id_jugador, dorsal) 
                          VALUES (?, ?, ?)`,
                          [id_partido, id_jugador, dorsal], 
                          (error) => {
                            if (error) {
                              console.error('Error al insertar en formaciones:', error);
                              return res.status(500).json({ success: false, message: 'Error al insertar en formaciones' });
                            }

                            // Emitir un evento de creación de jugador eventual
                            req.io.emit('jugadorEventualCreado', {
                              id_jugador,
                              id_equipo,
                              nombre,
                              apellido,
                              dorsal
                            });

                            // Responder con éxito
                            return res.status(201).json({ success: true, message: 'Jugador eventual creado exitosamente' });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error inesperado:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//----------------------------------------------------------------------------------//

// Función para actualizar los goles del partido
const actualizarGolesPartido = (idPartido, isLocalTeam, enContra) => {
  return new Promise((resolve, reject) => {
      const queryGoles = `SELECT id_equipoLocal, id_equipoVisita, goles_local, goles_visita FROM partidos WHERE id_partido = ?`;

      db.query(queryGoles, [idPartido], (err, results) => {
          if (err) {
              console.error("Error al obtener los equipos del partido:", err);
              return reject(err);
          }

          if (results.length === 0) {
              console.error("Partido no encontrado");
              return reject("Partido no encontrado");
          }

          const { id_equipoLocal, id_equipoVisita, goles_local, goles_visita } = results[0];

          let updateGolesQuery;
          let golesActualizados;

          // Verificar si el gol es en contra y actualizar los goles
          if (enContra === 'S') {
              // Gol en contra, sumar al equipo contrario
              if (isLocalTeam === id_equipoLocal) {
                  golesActualizados = goles_visita + 1; // Sumar al visitante
                  updateGolesQuery = `UPDATE partidos SET goles_visita = ? WHERE id_partido = ?`;
              } else {
                  golesActualizados = goles_local + 1; // Sumar al local
                  updateGolesQuery = `UPDATE partidos SET goles_local = ? WHERE id_partido = ?`;
              }
          } else {
              // Gol normal, sumar al equipo que anotó
              if (isLocalTeam === id_equipoLocal) {
                  golesActualizados = goles_local + 1; // Sumar al local
                  updateGolesQuery = `UPDATE partidos SET goles_local = ? WHERE id_partido = ?`;
              } else {
                  golesActualizados = goles_visita + 1; // Sumar al visitante
                  updateGolesQuery = `UPDATE partidos SET goles_visita = ? WHERE id_partido = ?`;
              }
          }

          db.query(updateGolesQuery, [golesActualizados, idPartido], (err) => {
              if (err) {
                  console.error("Error al actualizar los goles del partido:", err);
                  return reject("Error al actualizar los goles del partido");
              }
              resolve();
          });
      });
  });
};

// Modifica la función disminuirGoles para aceptar un callback
const disminuirGoles = (idPartido, isLocalTeam, enContra, callback) => {
  const queryGoles = `
      SELECT id_equipoLocal, id_equipoVisita, goles_local, goles_visita 
      FROM partidos 
      WHERE id_partido = ?
  `;

  db.query(queryGoles, [idPartido], (err, results) => {
    if (err) {
      console.error("Error al obtener los equipos del partido:", err);
      return callback(err); // Llamar el callback con error
    }

    if (results.length === 0) {
      console.error("Partido no encontrado");
      return callback(new Error("Partido no encontrado"));
    }

    const { id_equipoLocal, goles_local, goles_visita } = results[0];

    let updateGolesQuery;
    let golesActualizados;

    // Lógica para actualizar los goles según el tipo de gol
    if (enContra === 'S') {
      if (isLocalTeam === id_equipoLocal) {
        golesActualizados = Math.max(goles_visita - 1, 0);
        updateGolesQuery = `UPDATE partidos SET goles_visita = ? WHERE id_partido = ?`;
      } else {
        golesActualizados = Math.max(goles_local - 1, 0);
        updateGolesQuery = `UPDATE partidos SET goles_local = ? WHERE id_partido = ?`;
      }
    } else {
      if (isLocalTeam === id_equipoLocal) {
        golesActualizados = Math.max(goles_local - 1, 0);
        updateGolesQuery = `UPDATE partidos SET goles_local = ? WHERE id_partido = ?`;
      } else {
        golesActualizados = Math.max(goles_visita - 1, 0);
        updateGolesQuery = `UPDATE partidos SET goles_visita = ? WHERE id_partido = ?`;
      }
    }

    db.query(updateGolesQuery, [golesActualizados, idPartido], (err) => {
      if (err) {
        console.error("Error al actualizar los goles:", err);
        return callback(err); // Llamar el callback con error
      }

      console.log("Goles disminuidos correctamente");
      callback(); // Llamar el callback sin errores
    });
  });
};

module.exports = {
  insertarAccion,
  firmaJugador,
  borrarFirmaJugador,
  actualizarEstadoPartido,
  eliminarAccion,
  verificarJugadores,
  insertarJugadorDestacado,
  eliminarJugadorDestacado,
  updateMvpPartido,
  crearJugadorEventual,
  editarAccion
};
