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
        LEFT JOIN equipos AS e ON e.id_equipo = j.id_equipo;`
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

module.exports = {
    getJugadores,
    deleteJugador,
    updateJugador,
    importarJugadores
};