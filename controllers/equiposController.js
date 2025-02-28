const db = require('../utils/db');

const getEquipos = (req, res) => {
    db.query(
        `SELECT
    e.id_equipo,
    e.nombre,
    e.img,
    e.id_categoria,
    CONCAT(
        IFNULL((SELECT COUNT(*) 
                FROM planteles p 
                WHERE p.id_equipo = e.id_equipo 
                  AND p.id_categoria = e.id_categoria 
                  AND p.eventual = 'N'), 0),
        ' ',
        IFNULL(
            CASE 
                WHEN c.genero = 'F' THEN 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND p.eventual = 'N') = 1 
                        THEN 'jugadora' 
                        ELSE 'jugadoras' 
                    END
                ELSE 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND p.eventual = 'N') = 1 
                        THEN 'jugador' 
                        ELSE 'jugadores' 
                    END
            END,
            ''
        )
    ) AS jugadores,
    CONCAT(
        IFNULL((SELECT COUNT(*) 
                FROM planteles p 
                WHERE p.id_equipo = e.id_equipo 
                  AND p.id_categoria = e.id_categoria 
                  AND p.eventual = 'S'), 0),
        ' ',
        IFNULL(
            CASE 
                WHEN c.genero = 'F' THEN 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND p.eventual = 'S') = 1 
                        THEN 'jugadora' 
                        ELSE 'jugadoras' 
                    END
                ELSE 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND p.eventual = 'S') = 1 
                        THEN 'jugador' 
                        ELSE 'jugadores' 
                    END
            END,
            ''
        )
    ) AS jugadores_eventuales,
    CONCAT(
        IFNULL((SELECT COUNT(*) 
                FROM planteles p 
                LEFT JOIN jugadores j ON p.id_jugador = j.id_jugador
                WHERE p.id_equipo = e.id_equipo 
                  AND p.id_categoria = e.id_categoria 
                  AND j.dni IS NULL), 0),
        ' ',
        IFNULL(
            CASE 
                WHEN c.genero = 'F' THEN 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                LEFT JOIN jugadores j ON p.id_jugador = j.id_jugador
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND j.dni IS NULL) = 1 
                        THEN 'jugadora' 
                        ELSE 'jugadoras' 
                    END
                ELSE 
                    CASE WHEN (SELECT COUNT(*) 
                                FROM planteles p 
                                LEFT JOIN jugadores j ON p.id_jugador = j.id_jugador
                                WHERE p.id_equipo = e.id_equipo 
                                  AND p.id_categoria = e.id_categoria 
                                  AND j.dni IS NULL) = 1 
                        THEN 'jugador' 
                        ELSE 'jugadores' 
                    END
            END,
            ''
        )
    ) AS jugadores_sin_dni,
    z.id_zona,
    e.descripcion,
    CONCAT(c.nombre, ' ', z.nombre) AS nombre_categoria
FROM 
    equipos AS e
LEFT JOIN 
    categorias AS c ON c.id_categoria = e.id_categoria
LEFT JOIN 
    zonas AS z ON z.id_zona = e.id_zona
ORDER BY 
    e.nombre;
`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearEquipo = (req, res) => {
    const { nombre, id_categoria, id_edicion, id_zona, vacante } = req.body;
    console.log(nombre, id_categoria, id_edicion, id_zona, vacante);
    
    // Llamar al procedimiento almacenado con los parámetros correspondientes
    db.query(
        `CALL sp_crear_equipo(?, ?, ?, ?, ?)`, 
        [nombre, id_categoria, id_edicion, id_zona, vacante], 
        (err, result) => {
            if (err) {
                console.error('Error al ejecutar el procedimiento:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }
            res.status(200).json({ mensaje: 'Equipo registrado con éxito' });
        }
    );
};

const updateEquipo = (req, res) => {
    const { id_equipo, nombre, img } = req.body;

    // Validar que el id esté presente
    if (!id_equipo) {
        return res.status(400).send('ID de equipo es requerido');
    }

    // Construir la consulta SQL
    const sql = `
        UPDATE equipos
        SET 
            nombre = ?,
            img = ?
        WHERE id_equipo = ?;
    `;

    // Ejecutar la consulta
    db.query(sql, [nombre, img, id_equipo], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Equipo actualizado exitosamente');
    });
};

const getJugadoresEquipo = (req, res) => {
    const { id_equipo, id_categoria } = req.query;

    db.query('CALL sp_jugadores_equipo(?, ?)', [id_equipo, id_categoria], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron jugadores en el equipo especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const getParticipacionesEquipo = (req, res) => {
    const { id_equipo } = req.query;

    db.query('CALL sp_obtener_estadisticas_equipo_categoria(?)', [id_equipo], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron estadisticas.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}


const eliminarEquipo = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM equipos WHERE id_equipo = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

const actualizarCategoriaEquipo = (req, res) => {
    const { id_categoriaNueva, id_equipo } = req.body;

    // Validar que el id esté presente
    if (!id_equipo) {
        return res.status(400).send('ID de equipo es requerido');
    }

    // Construir la consulta SQL
    const sql = `
        UPDATE equipos
        SET 
            id_categoria = ?
        WHERE id_equipo = ?;
    `;

    // Ejecutar la consulta
    db.query(sql, [id_categoriaNueva, id_equipo ], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Equipo actualizado exitosamente');
    });
};

const actualizarApercibimientos = (req, res) => {
    const { id_categoria, id_equipo, id_zona, apercibimientos } = req.body;

    // Validar que el id esté presente
    if (!id_equipo) {
        return res.status(400).send('ID de equipo es requerido');
    }

    // Construir la consulta SQL
    const sql = `
        UPDATE temporadas
        SET 
            apercibimientos = ?
        WHERE id_equipo = ? AND id_categoria = ? AND id_zona = ?;
    `;

    // Ejecutar la consulta
    db.query(sql, [apercibimientos, id_equipo, id_categoria, id_zona], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }        
        res.send('Equipo actualizado exitosamente');
    });
};

module.exports = {
    getEquipos,
    crearEquipo,
    updateEquipo,
    actualizarCategoriaEquipo,
    getJugadoresEquipo,
    eliminarEquipo,
    actualizarApercibimientos,
    getParticipacionesEquipo
};
