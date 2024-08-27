const db = require('../utils/db');

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
        j.eventual
        FROM jugadores AS j
        LEFT JOIN equipos AS e ON e.id_equipo = j.id_equipo
        ORDER BY 
            j.apellido`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const deleteJugador = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM jugadores WHERE id_jugador = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando el jugador:', err);
            return res.status(500).send('Error eliminando el jugador');
        }
        res.status(200).send('Jugador eliminado correctamente');
    });
};

const updateJugador = (req, res) => {
    const { dni, nombre, apellido, posicion, id_equipo, id_jugador} = req.body;

    // Validar que id_usuario esté presente
    if (!id_jugador) {
        return res.status(400).send('ID de jugador es requerido');
    }
    // Construir la consulta SQL
    const sql = `
        UPDATE jugadores
        SET 
            dni = ?, 
            nombre = ?, 
            apellido = ?, 
            posicion = ?, 
            id_equipo = ?
        WHERE id_jugador = ?
    `;

    // Ejecutar la consulta
    db.query(sql, [dni, nombre, apellido, posicion, id_equipo, id_jugador], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Usuario actualizado exitosamente');
    });
};

const importarJugadores = async (req, res) => {
    const jugadores = req.body;
    if (!Array.isArray(jugadores)) {
        return res.status(400).send('Invalid data format');
    }

    const getOrCreateTeamId = async (equipo) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id_equipo FROM equipos WHERE nombre = ?', [equipo], (err, result) => {
                if (err) {
                    console.error('Error al buscar el equipo:', err);
                    return reject(err);
                }
                if (result.length > 0) {
                    resolve(result[0].id_equipo);
                } else {
                    db.query('INSERT INTO equipos (nombre) VALUES (?)', [equipo], (err, result) => {
                        if (err) {
                            console.error('Error al crear el equipo:', err);
                            return reject(err);
                        }
                        resolve(result.insertId);
                    });
                }
            });
        });
    };

    try {
        const values = await Promise.all(jugadores.map(async (jugador) => {
            const id_equipo = await getOrCreateTeamId(jugador.equipo);
            return [jugador.dni, jugador.nombre, jugador.apellido, jugador.posicion, id_equipo];
        }));

        const query = 'INSERT INTO jugadores (dni, nombre, apellido, posicion, id_equipo) VALUES ?';

        db.query(query, [values], (err, result) => {
            if (err) {
                console.error('Error al insertar jugadores:', err);
                return res.status(500).send('Error al insertar datos en la base de datos');
            }
            res.status(200).send('Datos importados correctamente');
        });
    } catch (error) {
        console.error('Error durante la importación:', error);
        res.status(500).send('Error interno del servidor');
    }
};

const crearJugador = (req, res) => {
    const { dni, nombre, apellido, posicion, id_equipo, id_edicion, id_categoria, sancionado = 'N', eventual = 'N' } = req.body;

    db.query('CALL sp_crear_jugador(?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [dni, nombre, apellido, posicion, id_equipo, id_edicion, id_categoria, sancionado, eventual],
        (err, result) => {
            if (err) {
                if (err.sqlState === '45000') {
                    return res.status(400).send(err.sqlMessage);
                }
                console.error("Error al crear el jugador:", err);
                return res.status(500).send("Error interno del servidor");
            }
            res.status(200).send("Jugador creado exitosamente");
        }
    );
}

const agregarJugadorPlantel = (req, res) => {
    const { id_jugador, id_equipo, id_categoria, id_edicion } = req.body;

    // Construye la consulta SQL con los marcadores de posición
    const query = 'INSERT INTO planteles (id_jugador, id_equipo, id_categoria, id_edicion) VALUES (?, ?, ?, ?)';

    // Pasa los valores como un array
    const values = [id_jugador, id_equipo, id_categoria, id_edicion];

    db.query(query, values, (err, result) => {
        if (err) {
            if (err.sqlState === '45000') {
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
    
    
    db.query(deletePlantelSQL, [id_jugador, id_equipo, id_edicion, id_categoria], (err, result) => {
        if (err) {
            console.error('Error eliminando el jugador del plantel:', err);
            return res.status(500).send('Error eliminando el jugador del plantel');
        }
        res.status(200).send('Jugador eliminado del plantel correctamente');
    });
};

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
        AND p.id_categoria = ?;`
    
    db.query(encontrarJugador, [dni, id_categoria, id_equipo], (err, result) => {
        if (err) {
            console.error('Error verificando el jugador eventual:', err);
            return res.status(500).send('Error verificando el jugador eventual');
        }
        
        if (result.length > 0) {
            // Se encontró un jugador con ese DNI en la categoría especificada
            res.status(200).json({ found: true, jugador: result[0] });
        } else {
            // No se encontró un jugador
            res.status(200).json({ found: false });
        }
    });
}



module.exports = {
    getJugadores,
    deleteJugador,
    updateJugador,
    importarJugadores,
    crearJugador,
    eliminarJugadorPlantel,
    agregarJugadorPlantel,
    verificarJugadorEventual
};