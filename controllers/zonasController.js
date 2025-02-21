const db = require('../utils/db');

const crearZona = (req, res) => {
    const {	id_categoria, nombre, tipo_zona, cantidad_equipos } = req.body;
    db.query(`INSERT INTO 
        zonas(id_categoria, nombre, tipo_zona, cantidad_equipos) 
        VALUES (?, ?, ?, ?)`, [id_categoria, nombre, tipo_zona, cantidad_equipos], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Categoria registrada con éxito');
    });
};

const crearZonaVacantesPartidos = (req, res) => {
    const { 
        id_categoria, nombre, cantidad_equipos, id_etapa, fase, 
        tipo_zona, id_edicion, campeon 
    } = req.body;

    if (tipo_zona === 'todos-contra-todos') {
        // Insertar en la tabla zonas
        db.query(`INSERT INTO 
            zonas(id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa, campeon, terminada) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa, campeon, 'N'], (err, result) => {
            
            if (err) return res.status(500).json({mensaje: 'Error interno del servidor'});
            
            // Obtener el id_zona recién insertado
            const id_zona = result.insertId;
    
            // Insertar en la tabla temporadas, crear registros según la cantidad de equipos
            const temporadasInserts = [];
            for (let vacante = 1; vacante <= cantidad_equipos; vacante++) {
                temporadasInserts.push([
                    id_categoria,  // id_categoria
                    null,           // id_equipo (null)
                    id_edicion,              // id_edicion
                    id_zona,        // id_zona
                    vacante,        // vacante (1 a cantidad_equipos)
                    null,           // pos_zona_previa
                    0,              // apercibimientos
                    'N'             // ventaja (valor por defecto)
                ]);
            }
    
            // Insertar múltiples registros en la tabla temporadas
            db.query(`INSERT INTO temporadas (id_categoria, id_equipo, id_edicion, id_zona, vacante, pos_zona_previa, apercibimientos, ventaja) 
                    VALUES ?`, [temporadasInserts], (err, result) => {
                if (err) return res.status(500).json({mensaje: 'Error interno al insertar en temporadas'})
                return res.status(200).json({mensaje: 'Zona registrada con éxito'});
            });
        });
    }
    
    if (tipo_zona === 'eliminacion-directa' || tipo_zona === 'eliminacion-directa-ida-vuelta') {
        // Buscar la zona de la fase anterior
        db.query(`SELECT id_zona FROM zonas WHERE id_categoria = ? AND fase = ? ORDER BY id_zona DESC LIMIT 1`, 
        [id_categoria, fase - 1], 
        (err, resultZona) => {
            if (err) return res.status(500).json({mensaje: 'Error al obtener la zona de la fase anterior'});
    
            const zonaAnteriorId = resultZona[0]?.id_zona;
    
            // Si no se encuentra zona anterior, es la jornada 1
            if (!zonaAnteriorId) {
                const nuevaJornada = 1; // Es la jornada 1 si no hay zona anterior
    
                // Llamar al procedimiento almacenado con la nueva jornada 1
                db.query(`CALL sp_crear_vacantes_partidos_zonas(?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [id_categoria, nombre, cantidad_equipos, id_etapa, fase, tipo_zona, nuevaJornada, id_edicion, campeon], 
                    (err, result) => {
                        if (err) return res.status(500).json({mensaje: 'Error interno del servidor'});
                        return res.send('Zona de vacantes y partidos registrada con éxito');
                });
            } else {
                // Si hay zona anterior, obtener la jornada máxima de los partidos en esa zona
                db.query(`SELECT MAX(jornada) AS maxJornada FROM partidos WHERE id_zona = ?`, 
                [zonaAnteriorId], 
                (err, resultJornada) => {
                    if (err) return res.status(500).json({mensaje: 'Error al obtener la jornada máxima de la zona anterior'});
                    
                    const maxJornada = resultJornada[0]?.maxJornada || 0;
                    const nuevaJornada = maxJornada + 1;
    
                    // Llamar al procedimiento almacenado con la nueva jornada calculada
                    db.query(`CALL sp_crear_vacantes_partidos_zonas(?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                        [id_categoria, nombre, cantidad_equipos, id_etapa, fase, tipo_zona, nuevaJornada, id_edicion, campeon], 
                        (err, result) => {
                            if (err) return res.status(500).json({mensaje: 'Error interno del servidor'});
                            return res.status(200).json({mensaje: 'Zona de vacantes y partidos registrada con éxito'});
                    });
                });
            }
        });
    }
    
};

const eliminarZona = (req, res) => {
    const { id } = req.body;

    // Primero obtenemos la información sobre la zona a eliminar
    const getZonaSql = 'SELECT id_categoria, tipo_zona FROM zonas WHERE id_zona = ?';
    
    db.query(getZonaSql, [id], (err, result) => {
        if (err) {
            console.error('Error obteniendo la zona:', err);
            return res.status(500).json({ mensaje: 'Error obteniendo la zona', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'Zona no encontrada' });
        }

        const zona = result[0];

        // Función para eliminar todos los registros relacionados con la zona
        const eliminarRegistrosRelacionados = (idZona) => {
            const deleteFormacionesSql = 'DELETE FROM formaciones WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
            const deleteGolesSql = 'DELETE FROM goles WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
            const deleteExpulsadosSql = 'DELETE FROM expulsados WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
            const deleteAmonestadosSql = 'DELETE FROM amonestados WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
            const deleteAsistenciasSql = 'DELETE FROM asistencias WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
            const deleteJugadoresDestacados = 'DELETE FROM jugadores_destacados WHERE id_partido IN (SELECT id_partido FROM partidos WHERE id_zona = ?)';
        
            // Realizamos las eliminaciones en las tablas relacionadas
            db.query(deleteFormacionesSql, [idZona], (err) => {
                if (err) {
                    console.error('Error eliminando formaciones:', err);
                    return res.status(500).json({ mensaje: 'Error eliminando formaciones', error: err });
                }
        
                db.query(deleteGolesSql, [idZona], (err) => {
                    if (err) {
                        console.error('Error eliminando goles:', err);
                        return res.status(500).json({ mensaje: 'Error eliminando goles', error: err });
                    }
        
                    db.query(deleteExpulsadosSql, [idZona], (err) => {
                        if (err) {
                            console.error('Error eliminando expulsados:', err);
                            return res.status(500).json({ mensaje: 'Error eliminando expulsados', error: err });
                        }
        
                        db.query(deleteAmonestadosSql, [idZona], (err) => {
                            if (err) {
                                console.error('Error eliminando amonestados:', err);
                                return res.status(500).json({ mensaje: 'Error eliminando amonestados', error: err });
                            }
        
                            db.query(deleteAsistenciasSql, [idZona], (err) => {
                                if (err) {
                                    console.error('Error eliminando asistencias:', err);
                                    return res.status(500).json({ mensaje: 'Error eliminando asistencias', error: err });
                                }
        
                                // Eliminamos los registros de jugadores destacados
                                db.query(deleteJugadoresDestacados, [idZona], (err) => {
                                    if (err) {
                                        console.error('Error eliminando jugadores destacados:', err);
                                        return res.status(500).json({ mensaje: 'Error eliminando jugadores destacados', error: err });
                                    }
        
                                    // Ahora que hemos eliminado los registros en las tablas relacionadas, eliminamos los partidos
                                    const deletePartidosSql = 'DELETE FROM partidos WHERE id_zona = ?';
                                    db.query(deletePartidosSql, [idZona], (err) => {
                                        if (err) {
                                            console.error('Error eliminando partidos:', err);
                                            return res.status(500).json({ mensaje: 'Error eliminando partidos', error: err });
                                        }
        
                                        // Paso 1.3: Eliminar registros en la tabla temporadas
                                        const deleteTemporadasSql = 'DELETE FROM temporadas WHERE id_categoria = ? AND id_zona = ?';
                                        db.query(deleteTemporadasSql, [zona.id_categoria, idZona], (err) => {
                                            if (err) {
                                                console.error('Error eliminando temporadas:', err);
                                                return res.status(500).json({ mensaje: 'Error eliminando temporadas', error: err });
                                            }
        
                                            // Paso 1.4: Eliminar la zona en la tabla zonas
                                            const deleteZonaSql = 'DELETE FROM zonas WHERE id_zona = ?';
                                            db.query(deleteZonaSql, [idZona], (err) => {
                                                if (err) {
                                                    console.error('Error eliminando la zona:', err);
                                                    return res.status(500).json({ mensaje: 'Error eliminando la zona', error: err });
                                                }
                                                return res.status(200).json({ mensaje: 'Zona eliminada correctamente' });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        };
        

        // Ejecutar la eliminación de registros relacionados y eliminación de la zona
        eliminarRegistrosRelacionados(id);
    });
};

const getEtapas = (req, res) => {
    const sql = `SELECT * FROM etapas`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo las etapas:', err);
            return res.status(500).send('Error obteniendo las etapas');
        }
        return res.status(200).json(result);
    });
};

const actualizarZona = (req, res) => {
    const { id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos, tipo, campeon, id_equipo_campeon, terminada } = req.body;

    if (!id_zona || !nombre_zona || !tipo_zona || !etapa || !cantidad_equipos || !tipo || !campeon) {
        return res.status(400).send('Faltan datos');
    }

    let sql = '';
    let params = [];
    let successMessage = '';
    let errorMessage = '';

    switch (tipo) {
        case 'igual':
            sql = `UPDATE zonas SET nombre = ?, tipo_zona = ?, id_etapa = ?, campeon = ?, id_equipo_campeon = ?, terminada = ? WHERE id_zona = ?`;
            params = [nombre_zona, tipo_zona, etapa, campeon, id_equipo_campeon, terminada, id_zona];
            successMessage = 'Zona actualizada correctamente.';
            errorMessage = 'Error al actualizar la zona.';
            break;
        case 'menor':
            sql = `CALL sp_eliminar_vacantes_menor(?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos, campeon, terminada, id_equipo_campeon];
            successMessage = 'Vacantes eliminadas correctamente.';
            errorMessage = 'Error al eliminar vacantes.';
            break;
        case 'mayor':
            sql = 'CALL sp_agregar_vacantes_mayor(?, ?, ?, ?, ?, ?, ?, ?)';
            params = [id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos, campeon, terminada, id_equipo_campeon];
            successMessage = 'Vacantes agregadas correctamente.';
            errorMessage = 'Error al agregar vacantes.';
            break;
        default:
            return res.status(400).json({ mensaje: 'Tipo de operación inválido.' });
    }

    // Ejecutar la consulta principal
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ mensaje: errorMessage });
        }

        // Si la zona está marcada como terminada, ejecutar sp_actualizar_vacantes_posiciones
        if (terminada === 'S') {
            const spSql = 'CALL sp_actualizar_vacantes_posiciones(?)';
            db.query(spSql, [id_zona], (spErr, spResult) => {
                if (spErr) {
                    console.error('Error ejecutando sp_actualizar_vacantes_posiciones:', spErr);
                    return res.status(500).json({ mensaje: 'Error al actualizar vacantes y posiciones.' });
                }

                // Responder con éxito si ambas operaciones fueron exitosas
                res.status(200).send({ mensaje: successMessage + ' Vacantes y posiciones actualizadas correctamente.' });
            });
        } else {
            // Si no está terminada, responder solo con la operación inicial
            res.status(200).send({ mensaje: successMessage });
        }
    });
};

//! VERIFICAR ACTUALIZACION EN AMBAS ZONAS
const vaciarVacante = (req, res) => {
    const { id_zona, vacante, tipo_zona } = req.body;

    if (!id_zona || vacante === undefined || !tipo_zona) {
        return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    const sqlTemporadas = 'UPDATE temporadas SET id_equipo = NULL, pos_zona_previa = NULL, id_zona_previa = NULL WHERE id_zona = ? AND vacante = ?';
    const paramsTemporadas = [id_zona, vacante];

    db.query(sqlTemporadas, paramsTemporadas, (err) => {
        if (err) {
            console.error('Error vaciando vacante en temporadas:', err);
            return res.status(500).json({ mensaje: 'Error vaciando vacante en temporadas' });
        }

        if (tipo_zona !== 'todos-contra-todos' && tipo_zona !== 'todos-contra-todos-ida-vuelta') {
            const sqlPartidos = `
                SELECT id_partido, vacante_local, vacante_visita
                FROM partidos
                WHERE id_zona = ? AND (vacante_local = ? OR vacante_visita = ?)
            `;
            const paramsPartidos = [id_zona, vacante, vacante];

            db.query(sqlPartidos, paramsPartidos, (err, rows) => {
                if (err) {
                    console.error('Error buscando partidos:', err);
                    return res.status(500).json({ mensaje: 'Error buscando partidos' });
                }

                if (rows.length === 0) {
                    return res.status(404).json({ mensaje: 'No se encontraron partidos con esa vacante en la zona indicada' });
                }

                // Actualizar todos los partidos afectados
                const updatePromises = rows.map((partido) => {
                    const sqlUpdate = `
                        UPDATE partidos
                        SET 
                            id_equipoLocal = CASE WHEN vacante_local = ? THEN NULL ELSE id_equipoLocal END,
                            id_equipoVisita = CASE WHEN vacante_visita = ? THEN NULL ELSE id_equipoVisita END,
                            res_partido_previo_local = CASE WHEN vacante_local = ? THEN NULL ELSE res_partido_previo_local END,
                            res_partido_previo_visita = CASE WHEN vacante_visita = ? THEN NULL ELSE res_partido_previo_visita END,
                            id_partido_previo_local = CASE WHEN vacante_local = ? THEN NULL ELSE id_partido_previo_local END,
                            id_partido_previo_visita = CASE WHEN vacante_visita = ? THEN NULL ELSE id_partido_previo_visita END
                        WHERE id_partido = ?
                    `;
                    const paramsUpdate = [
                        vacante, vacante, // Vaciar local y visitante
                        vacante, vacante, // Vaciar resultados previos
                        vacante, vacante, // Vaciar IDs de partidos previos
                        partido.id_partido // ID del partido a actualizar
                    ];

                    return new Promise((resolve, reject) => {
                        db.query(sqlUpdate, paramsUpdate, (err) => {
                            if (err) {
                                console.error(`Error actualizando partido ${partido.id_partido}:`, err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                // Ejecutar todas las actualizaciones en paralelo
                Promise.all(updatePromises)
                    .then(() => {
                        res.status(200).json({ mensaje: 'Vacante vaciada correctamente en todos los partidos' });
                    })
                    .catch(() => {
                        res.status(500).json({ mensaje: 'Error vaciando vacantes en partidos' });
                    });
            });
        } else {
            res.status(200).json({ mensaje: 'Vacante vaciada correctamente' });
        }
    });
};

const eliminarVacante = (req, res) => {
    const { id_zona, vacante, tipo_zona } = req.body;

    if (!id_zona || !vacante || !tipo_zona) {
        return res.status(400).json({ mensaje: 'Faltan datos' });
    }

}

module.exports = {
    crearZona,
    crearZonaVacantesPartidos,
    eliminarZona,
    getEtapas,
    actualizarZona,
    vaciarVacante,
    eliminarVacante
};