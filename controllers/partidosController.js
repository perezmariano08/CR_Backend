const db = require('../utils/db');
const { esPartidoVuelta } = require('./helpers/partidosHelpers');

const getPartidos = (req, res) => {
    db.query(
            `SELECT
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
        ediciones e ON p.id_edicion = e.id_edicion;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getIncidenciasPartido = (req, res) => {
    const { id_partido } = req.query;

    db.query('CALL sp_partidos_incidencias(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const getFormacionesPartido = (req, res) => {
    const { id_partido } = req.query;


    // Luego, obtiene las formaciones del partido
    db.query('CALL sp_partidos_formaciones(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado de formaciones:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
};

const crearPartido = (req, res) => {
    const { id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero, id_edicion, id_categoria, id_zona, interzonal, ventaja_deportiva } = req.body;

    if (!id_equipoLocal || !id_equipoVisita || !id_categoria || !id_edicion || !id_zona) {
        return res.status(400).json({mensaje: 'Faltan datos importantes'});
    }

    db.query(`
        INSERT INTO partidos(
            id_equipoLocal, 
            id_equipoVisita, 
            jornada, 
            dia, 
            hora, 
            cancha, 
            arbitro, 
            id_planillero,
            id_edicion,
            id_categoria,
            id_zona,
            interzonal,
            ventaja_deportiva
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero, id_edicion, id_categoria, id_zona, interzonal, ventaja_deportiva], (err, result) => {
        if (err) {
            console.error("Error al ejecutar la consulta SQL:", err);
            return res.status(500).json({mensaje: 'Error al interno en el servidor al intentar crear el partido'});
        }

        return res.status(200).json({mensaje: 'Partido creado con éxito'});

    });
};

const importarPartidos = (req, res) => {
    const partidos = req.body;
    if (!Array.isArray(partidos)) {
        return res.status(400).send('Invalid data format');
    }

    // Construye el query para insertar múltiples registros
    const values = partidos.map(({ id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion }) => [id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion]);
    const query = 'INSERT INTO partidos (id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion) VALUES ?';

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al insertar datos en la base de datos');
        }
        res.status(200).send('Datos importados correctamente');
    });
};

const getPlantelesPartido = (req, res) => {
    const { id_partido } = req.query;


    // Luego, obtiene las formaciones del partido
    db.query('CALL sp_get_planteles(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado de planteles:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
};

const updatePartido = async (req, res) => {
    const { 
        id_equipoLocal, 
        id_equipoVisita, 
        goles_local,
        goles_visita,
        pen_local,
        pen_visita,
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero, 
        id_edicion, 
        id_categoria, 
        id_zona,
        estado, 
        id_partido,
        ventaja_deportiva,
        actualizar_partido
    } = req.body;

    // Validar que id_partido esté presente
    if (!id_partido) {
        return res.status(400).json({mensaje: 'ID de partido es requerido'});
    }

    // Construir la consulta SQL para actualizar el partido
    const sql = `
        UPDATE partidos
        SET 
            id_equipoLocal = ?, 
            id_equipoVisita = ?, 
            goles_local = ?,
            goles_visita = ?,
            pen_local = ?,
            pen_visita = ?,
            jornada = ?, 
            dia = ?, 
            hora = ?,
            cancha = ?,
            arbitro = ?,
            id_planillero = ?,
            id_edicion = ?, 
            id_categoria = ?, 
            id_zona = ?,
            estado = ?,
            ventaja_deportiva = ?
        WHERE id_partido = ?
    `;

    // Ejecutar la consulta para actualizar el partido
    try {
        const updateResult = await new Promise((resolve, reject) => {
            db.query(sql, [
                id_equipoLocal, 
                id_equipoVisita, 
                goles_local,
                goles_visita,
                pen_local,
                pen_visita,
                jornada, 
                dia, 
                hora, 
                cancha, 
                arbitro, 
                id_planillero, 
                id_edicion, 
                id_categoria, 
                id_zona, 
                estado,
                ventaja_deportiva,
                id_partido 
            ], (err, result) => {
                if (err) {
                    reject('Error al actualizar el partido: ' + err);
                } else {
                    resolve(result);
                }
            });
        });

        // Si `actualizar_partido` es verdadero, ejecutar el procedimiento almacenado
        if (actualizar_partido) {
            const isVuelta = await esPartidoVuelta(id_partido, id_zona, db);

            if (isVuelta) {
                const spQuery = `CALL sp_actualizar_vacante_partido_ida_vuelta(?)`;
                await new Promise((resolve, reject) => {
                    db.query(spQuery, [id_partido], (spErr, spResult) => {
                        if (spErr) {
                            reject('Error al ejecutar sp_actualizar_vacante_partido_ida_vuelta: ' + spErr);
                        } else {
                            resolve(spResult);
                        }
                    });
                });
                return res.status(200).json({mensaje: 'Partido actualizado con éxito y procedimiento almacenado ejecutado para vuelta'});
            } else {
                const spQuery = `CALL sp_actualizar_partido_vacante(?)`;
                
                await new Promise((resolve, reject) => {
                    db.query(spQuery, [id_partido], (spErr, spResult) => {
                        if (spErr) {
                            reject('Error al ejecutar sp_actualizar_partido_vacante: ' + spErr);
                        } else {
                            resolve(spResult);
                        }
                    });
                });
                return res.status(200).json({mensaje: 'Partido actualizado con éxito y procedimiento almacenado ejecutado'});
            }
        } else {
            return res.status(200).json({mensaje: 'Partido actualizado con éxito'});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({mensaje: 'Error interno del servidor'});
    }
};

const deletePartido = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM partidos WHERE id_partido = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando el partido:', err);
            return res.status(500).json({mensaje: 'Hubo un error al intentar eliminar el partido'});
        }
        return res.status(200).json({mensaje: 'Partido eliminado con éxito'});
    });
};

const getPartidosCategoria = (req, res) => {
    const { id_categoria } = req.query;

    const query = `
    SELECT 
        CONCAT(r.resultado, '-' ,p.id_partido) AS id_partido,
        p.id_zona,
        p.vacante_local,
        p.vacante_visita,
        p.res_partido_previo_local,
        p.res_partido_previo_visita,
        p.id_partido_previo_local,
        p.id_partido_previo_visita,
        r.resultado,
        p.id_partido,
        CAST(
            CONCAT(
                CASE WHEN r.resultado = 'G' THEN 'Ganador' ELSE 'Perdedor' END,
                ' ', 
                CHAR(64 + z.fase), 
                p.vacante_local, 
                '-', 
                CHAR(64 + z.fase), 
                p.vacante_visita
            ) AS CHAR
        ) AS nombre_fase
    FROM 
        partidos AS p
    INNER JOIN 
        zonas AS z ON p.id_zona = z.id_zona
    CROSS JOIN 
        (SELECT 'G' AS resultado UNION ALL SELECT 'P') AS r
    WHERE 
        p.id_categoria = ?
    ORDER BY 
        r.resultado ASC, -- Primero ganadores ('G') y luego perdedores ('P')
        p.id_partido;
`;

    db.query(query, [id_categoria], (err, result) => {
        if (err) {
            console.error('Error al obtener los partidos de la zona:', err);
            return res.status(500).send('Error interno del servidor');
        }

        // Devuelve los datos
        res.status(200).json(result);
    });
};

const getPartidosZona = (req, res) => {
    const { id_zona } = req.query;

    const query = `
    SELECT 
        CONCAT(r.resultado, '-' ,p.id_partido) AS id_partido,
        CAST(
            CONCAT(
                CASE WHEN r.resultado = 'G' THEN 'Ganador' ELSE 'Perdedor' END,
                ' ', 
                CHAR(64 + z.fase), 
                p.vacante_local, 
                '-', 
                CHAR(64 + z.fase), 
                p.vacante_visita
            ) AS CHAR
        ) AS nombre_fase
    FROM 
        partidos AS p
    INNER JOIN 
        zonas AS z ON p.id_zona = z.id_zona
    CROSS JOIN 
        (SELECT 'G' AS resultado UNION ALL SELECT 'P') AS r
    WHERE 
        p.id_zona = ?
        AND (
            z.tipo_zona != 'eliminacion-directa-ida-vuelta' -- Trae todos los partidos si la zona no es ida y vuelta
            OR p.id_partido_previo_local IS NOT NULL -- Solo trae partidos de vuelta
        )
    ORDER BY 
        r.resultado ASC, -- Primero ganadores ('G') y luego perdedores ('P')
        p.id_partido;
    `;

    db.query(query, [id_zona], (err, result) => {
        if (err) {
            console.error('Error al obtener los partidos de la zona:', err);
            return res.status(500).send('Error interno del servidor');
        }

        // Devuelve los datos
        res.status(200).json(result);
    });
};

const guardarVacantePlayOff = (req, res) => {
    const {id_categoria, id_edicion, id_zona, id_zona_previa, posicion_previa, id_partido, id_partido_previo, vacante, resultado} = req.body;

    // si la zona a actualizar es todos contra todos, damos la posicion previa que obtendra la vacante
    if (posicion_previa) {
        const sql = `
            UPDATE temporadas
            SET pos_zona_previa = ?, id_zona_previa = ?
            WHERE id_zona = ? AND id_categoria = ? AND id_edicion = ? AND vacante = ?
        `;

        db.query(sql, [posicion_previa, id_zona_previa, id_zona, id_categoria, id_edicion, vacante], (err, result) => {
            if (err) {
                console.error('Error al guardar el vacante:', err);
                return res.status(500).json({mensaje: 'Error interno del servidor'});
            }
            res.status(200).send({mensaje: 'Vacante guardada con éxito'});
        });
    } else {
        // si no, se guarda el cruce del partido previo y la vacante
        const query = `CALL sp_agregar_enfrentamiento_vacante(?, ?, ?, ?)`;
    
        db.query(query, [id_partido, id_partido_previo, vacante, resultado], (err, result) => {
            if (err) {
                console.error('Error al guardar el vacante:', err);
                return res.status(500).json({mensaje: 'Error interno del servidor'});
            }
            res.status(200).send({mensaje: 'Vacante guardada con éxito'});
        });
    }
}

const actualizarPartidoVacante = (req, res) => {
    const { id_partido } = req.body;

    // Paso 1: Obtener el id_zona del partido
    const getIdZonaQuery = 'SELECT id_zona FROM partidos WHERE id_partido = ?';

    db.query(getIdZonaQuery, [id_partido], (err, result) => {
        if (err) {
            console.error('Error al obtener id_zona:', err);
            return res.status(500).json({ message: 'Error al obtener la zona del partido' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Partido no encontrado' });
        }

        const id_zona = result[0].id_zona;

        // Paso 2: Verificar el tipo de zona (eliminación directa o ida-vuelta)
        const getZoneTypeQuery = 'SELECT tipo_zona FROM zonas WHERE id_zona = ?';

        db.query(getZoneTypeQuery, [id_zona], (err, results) => {
            if (err) {
                console.error('Error al obtener el tipo de zona:', err);
                return res.status(500).json({ message: 'Error al obtener el tipo de zona' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Zona no encontrada' });
            }

            const tipoZona = results[0].tipo_zona.trim();

            if (tipoZona === 'eliminacion-directa') {
                // Si es una zona de eliminación directa, ejecutamos el SP correspondiente
                console.log('Zona es de tipo "eliminacion-directa"');

                const queryDirecta = 'CALL sp_actualizar_partido_vacante(?)';

                db.query(queryDirecta, [id_partido], (err, result) => {
                    if (err) {
                        console.error('Error al ejecutar SP de eliminación directa:', err);
                        return res.status(500).json({ message: 'Error al ejecutar el SP de eliminación directa' });
                    }
                    res.json({ message: 'Partido de eliminación directa actualizado con éxito' });
                });

            } else {
                // Si no es eliminación directa, verificamos si es un partido ida-vuelta
                console.log('La zona no es "eliminacion-directa", verificando ida-vuelta');

                esPartidoVuelta(id_partido, id_zona, db)
                    .then((isReturnMatch) => {
                        if (isReturnMatch) {
                            // Si es un partido de vuelta, ejecutamos el SP de ida-vuelta
                            console.log('Es un partido de vuelta, ejecutando SP de ida-vuelta');

                            const queryIdaVuelta = 'CALL sp_actualizar_vacante_partido_ida_vuelta(?)';

                            db.query(queryIdaVuelta, [id_partido], (err, result) => {
                                if (err) {
                                    console.error('Error al ejecutar SP de ida-vuelta:', err);
                                    return res.status(500).json({ message: 'Error al ejecutar el SP de ida-vuelta' });
                                }
                                res.json({ message: 'Partido de ida-vuelta actualizado con éxito' });
                            });
                        } else {
                            // Si no es ida-vuelta, devolvemos un mensaje indicando que no es válido
                            res.status(400).json({ message: 'El partido no es de ida-vuelta' });
                        }
                    })
                    .catch((err) => {
                        console.error('Error al verificar si es partido de vuelta:', err);
                        return res.status(500).json({ message: 'Error al verificar si es partido de vuelta' });
                    });
            }
        });
    });
};

module.exports = {
    getPartidos,
    getIncidenciasPartido,
    getFormacionesPartido,
    crearPartido,
    importarPartidos,
    getPlantelesPartido,
    updatePartido,
    deletePartido,
    getPartidosZona,
    guardarVacantePlayOff,
    getPartidosCategoria,
    actualizarPartidoVacante
};