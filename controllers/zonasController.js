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
        tipo_zona, id_edicion 
    } = req.body;

    if (tipo_zona === 'todos-contra-todos') {
        // Insertar en la tabla zonas
        db.query(`INSERT INTO 
            zonas(id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa) 
            VALUES (?, ?, ?, ?, ?, ?)`, [id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa], (err, result) => {
            
            if (err) return res.status(500).send('Error interno del servidor');
            
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
                if (err) return res.status(500).send('Error interno al insertar en temporadas');
                return res.send('Categoria registrada con éxito');
            });
        });
    }
    
    if (tipo_zona === 'eliminacion-directa') {
        // Buscar la zona de la fase anterior
        db.query(`SELECT id_zona FROM zonas WHERE id_categoria = ? AND fase = ? ORDER BY id_zona DESC LIMIT 1`, 
        [id_categoria, fase - 1], 
        (err, resultZona) => {
            if (err) return res.status(500).send('Error al obtener la zona de la fase anterior');

            const zonaAnteriorId = resultZona[0]?.id_zona;
            if (!zonaAnteriorId) return res.status(404).send('Zona anterior no encontrada');

            // Obtener la jornada más alta de los partidos en esa zona anterior
            db.query(`SELECT MAX(jornada) AS maxJornada FROM partidos WHERE id_zona = ?`, 
            [zonaAnteriorId], 
            (err, resultJornada) => {
                if (err) return res.status(500).send('Error al obtener la jornada máxima de la zona anterior');
                
                const maxJornada = resultJornada[0]?.maxJornada || 0;
                const nuevaJornada = maxJornada + 1;

                // Llamar al procedimiento almacenado con la nueva jornada calculada
                db.query(`CALL sp_crear_vacantes_partidos_zonas(?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [id_categoria, nombre, cantidad_equipos, id_etapa, fase, tipo_zona, nuevaJornada, id_edicion], 
                    (err, result) => {
                        if (err) return res.status(500).send('Error interno del servidor');
                        return res.send('Zona de vacantes y partidos registrada con éxito');
                });
            });
        });
    }
};

const eliminarZona = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM zonas WHERE id_zona = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
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

    const { id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos, tipo } = req.body;

    if (!id_zona || !nombre_zona || !tipo_zona || !etapa || !cantidad_equipos || !tipo) {
        return res.status(400).send('Faltan datos');
    }

    let sql = '';
    let params = [];
    let successMessage = '';
    let errorMessage = '';

    switch (tipo) {
        case 'igual':
            sql = `UPDATE zonas SET nombre = ?, tipo_zona = ?, id_etapa = ? WHERE id_zona = ?`;
            params = [nombre_zona, tipo_zona, etapa, id_zona];
            successMessage = 'Zona actualizada correctamente.';
            errorMessage = 'Error al actualizar la zona.';
            break;
        case 'menor':
            sql = `CALL sp_eliminar_vacantes_menor(?, ?, ?, ?, ?)`;
            params = [id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos];
            successMessage = 'Vacantes eliminadas correctamente.';
            errorMessage = 'Error al eliminar vacantes.';
            break;
        case 'mayor':
            sql = 'CALL sp_agregar_vacantes_mayor(?, ?, ?, ?, ?)';
            params = [id_zona, nombre_zona, tipo_zona, etapa, cantidad_equipos];
            successMessage = 'Vacantes agregadas correctamente.';
            errorMessage = 'Error al agregar vacantes.';
            break;
        default:
            return res.status(400).send('Tipo de operación inválido.');
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).send({ mensaje: errorMessage });
        }

        res.status(200).send({ mensaje: successMessage });
    });

};

const vaciarVacante = (req, res) => {
    const { id_zona, vacante, tipo_zona } = req.body;

    if (!id_zona || vacante === undefined || !tipo_zona) {
        return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    const sqlTemporadas = 'UPDATE temporadas SET id_equipo = NULL WHERE id_zona = ? AND vacante = ?';
    const paramsTemporadas = [id_zona, vacante];

    db.query(sqlTemporadas, paramsTemporadas, (err, result) => {
        if (err) {
            console.error('Error vaciando vacante en temporadas:', err);
            return res.status(500).json({ mensaje: 'Error vaciando vacante en temporadas' });
        }

        // Continuar solo si no es 'todos-contra-todos' o 'todos-contra-todos-ida-vuelta'
        if (tipo_zona !== 'todos-contra-todos' && tipo_zona !== 'todos-contra-todos-ida-vuelta') {

            // Paso 2: Actualizar la tabla partidos
            const sqlPartidoActual = 'SELECT id_equipoLocal, id_equipoVisita, vacante_local, vacante_visita, id_partido_previo_local, id_partido_previo_visita, res_partido_previo_local, res_partido_previo_visita FROM partidos WHERE id_zona = ? AND (vacante_local = ? OR vacante_visita = ?)';
            const paramsPartido = [id_zona, vacante, vacante];

            db.query(sqlPartidoActual, paramsPartido, (err, rows) => {
                if (err) {
                    console.error('Error buscando partido:', err);
                    return res.status(500).json({ mensaje: 'Error buscando partido' });
                }

                if (rows.length === 0) {
                    return res.status(404).json({ mensaje: 'No se encontró partido con esa vacante en la zona indicada' });
                }

                const partido = rows[0];

                let sqlUpdatePartido;
                if (vacante === partido.vacante_local) {
                    // Limpiar el id_equipoLocal y las columnas de partido previo
                    sqlUpdatePartido = 'UPDATE partidos SET id_equipoLocal = NULL, res_partido_previo_local = NULL, id_partido_previo_local = NULL WHERE id_zona = ? AND vacante_local = ?';
                } else if (vacante === partido.vacante_visita) {
                    // Limpiar el id_equipoVisita y las columnas de partido previo
                    sqlUpdatePartido = 'UPDATE partidos SET id_equipoVisita = NULL, res_partido_previo_visita = NULL, id_partido_previo_visita = NULL WHERE id_zona = ? AND vacante_visita = ?';
                }

                db.query(sqlUpdatePartido, paramsPartido, (err, result) => {
                    if (err) {
                        console.error('Error actualizando partido:', err);
                        return res.status(500).json({ mensaje: 'Error actualizando partido' });
                    }

                    // Paso 3: Limpiar res_partido_previo_local o visitante y id_partido_previo_local o visitante
                    const columnaRes = vacante === partido.vacante_local ? 'res_partido_previo_local' : 'res_partido_previo_visita';
                    const columnaIdPartidoPrevio = vacante === partido.vacante_local ? 'id_partido_previo_local' : 'id_partido_previo_visita';
                    const idPartidoPrevio = partido[columnaIdPartidoPrevio];
                    const resultadoPrevio = partido[columnaRes];

                    // Paso 4: Eliminar las columnas correspondientes del partido anterior
                    if (idPartidoPrevio) {
                        let sqlEliminarPartidoPosterior = '';
                        if (resultadoPrevio === 'G') {
                            sqlEliminarPartidoPosterior = 'UPDATE partidos SET id_partido_posterior_ganador = NULL WHERE id_partido = ?';
                        } else if (resultadoPrevio === 'P') {
                            sqlEliminarPartidoPosterior = 'UPDATE partidos SET id_partido_posterior_perdedor = NULL WHERE id_partido = ?';
                        }

                        if (sqlEliminarPartidoPosterior) {
                            db.query(sqlEliminarPartidoPosterior, [idPartidoPrevio], (err, result) => {
                                if (err) {
                                    console.error('Error eliminando partido posterior:', err);
                                    return res.status(500).json({ mensaje: 'Error eliminando partido posterior' });
                                }

                                // Finalmente, enviar la respuesta de éxito
                                res.status(200).json({ mensaje: 'Vacante vaciada correctamente' });
                            });
                        } else {
                            res.status(200).json({ mensaje: 'Vacante vaciada correctamente' });
                        }
                    } else {
                        // Si no se encuentra partido previo, continuar
                        res.status(200).json({ mensaje: 'Vacante vaciada correctamente' });
                    }
                });
            });

        } else {
            // Si es 'todos-contra-todos' o 'todos-contra-todos-ida-vuelta', solo devolver éxito
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