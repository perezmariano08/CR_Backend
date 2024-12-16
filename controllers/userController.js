const db = require('../utils/db');

const getUsers = (req, res) => {
    db.query(`SELECT
                u.id_usuario,
                u.dni,
                CONCAT(UPPER(u.apellido), ', ', u.nombre) AS usuario,
                u.nombre,
                u.apellido,
                DATE_FORMAT(u.nacimiento, '%d/%m/%Y') AS nacimiento,
                u.telefono,
                u.email,
                r.nombre,
                u.fecha_creacion,
                u.fecha_actualizacion,
                u.img,
                u.id_rol,
                u.estado
            FROM usuarios as u
            INNER JOIN roles AS r ON r.id_rol = u.id_rol;`, (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getRoles = (req, res) => {
    db.query('SELECT * FROM roles', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

// !TRAER NOMBRES DE ZONA Y CATEGORIA
const getPartidos = (req, res) => {
    db.query(
        `SELECT
            p.id_partido,
            p.id_edicion,
            p.id_categoria,
            p.id_zona,
            DAY(p.dia) AS dia_numero,
            MONTH(p.dia) AS mes,
            CASE
                WHEN DAYNAME(p.dia) = 'Monday' THEN 'Lunes'
                WHEN DAYNAME(p.dia) = 'Tuesday' THEN 'Martes'
                WHEN DAYNAME(p.dia) = 'Wednesday' THEN 'Miércoles'
                WHEN DAYNAME(p.dia) = 'Thursday' THEN 'Jueves'
                WHEN DAYNAME(p.dia) = 'Friday' THEN 'Viernes'
                WHEN DAYNAME(p.dia) = 'Saturday' THEN 'Sábado'
                WHEN DAYNAME(p.dia) = 'Sunday' THEN 'Domingo'
            END AS dia_nombre,
            YEAR(p.dia) AS año,
            p.id_equipoLocal,
            p.id_equipoVisita,
            p.estado,
            p.jornada,
            p.susp,
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
            CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
            c.nombre AS nombre_categoria,
            p.id_planillero,
            j.id_jugador AS jugador_destacado
        FROM 
            partidos p
        INNER JOIN 
            categorias c ON p.id_categoria = c.id_categoria
        INNER JOIN 
            equipos e1 ON p.id_equipoLocal = e1.id_equipo
        INNER JOIN 
            equipos e2 ON p.id_equipoVisita = e2.id_equipo
        INNER JOIN
            zonas ON zonas.id_categoria = c.id_categoria
        INNER JOIN
			ediciones AS e ON e.id_edicion = p.id_edicion
        LEFT JOIN 
            usuarios u ON p.id_planillero = u.id_usuario
        LEFT JOIN 
            jugadores j ON p.id_jugador_destacado = j.id_jugador;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getEquipos = (req, res) => {
    db.query(
        `SELECT
            e.id_equipo,
            e.nombre,
            e.img,
            c.nombre AS categoria,
            e.descripcion,
            d.nombre AS division,
            e.id_temporada
        FROM equipos AS e
        INNER JOIN categorias AS c ON c.id_categoria = e.id_categoria
        LEFT JOIN divisiones AS d ON d.id_division = e.id_division
        ORDER BY e.nombre`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

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

const crearFormaciones = (req, res) => {
    const formaciones = req.body;

    if (!Array.isArray(formaciones)) {
        return res.status(400).send('Bad request: Expected an array of formations');
    }

    const values = formaciones.map(({ id_partido, id_jugador, dorsal, goles, asistencias, amarillas, rojas }) => 
        [id_partido, id_jugador, dorsal, goles, asistencias, amarillas, rojas]
    );

    const query = `
        INSERT INTO formaciones
        (id_partido, id_jugador, dorsal, goles, asistencias, amarillas, rojas) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting formations:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Formaciones registradas con éxito');
    });
};

const crearGoles = (req, res) => {
    const goles = req.body;

    if (!Array.isArray(goles)) {
        return res.status(400).send('Bad request: Expected an array of goals');
    }

    const values = goles.map(({ id_partido, id_jugador, minuto, penal, en_contra }) => 
        [id_partido, id_jugador, minuto, penal, en_contra]
    );

    const query = `
        INSERT INTO goles
        (id_partido, id_jugador, minuto, penal, en_contra) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting goals:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Goles registrados con éxito');
    });
};

const crearAsistencias = (req, res) => {
    const asistencias = req.body;

    if (!Array.isArray(asistencias)) {
        return res.status(400).send('Bad request: Expected an array of assists');
    }

    const values = asistencias.map(({ id_partido, id_jugador, minuto }) => 
        [id_partido, id_jugador, minuto]
    );

    const query = `
        INSERT INTO asistencias
        (id_partido, id_jugador, minuto) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting assists:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Asistencias registradas con éxito');
    });
};

const crearRojas = (req, res) => {
    const rojas = req.body;

    if (!Array.isArray(rojas)) {
        return res.status(400).send('Bad request: Expected an array of red cards');
    }

    if (!rojas || rojas.length === 0) {
        return res.status(400).send('No hay expulsiones para agregar');
    }

    const idPartido = rojas[0].id_partido;

    // Consulta para obtener la categoría del partido
    const partidoQuery = `SELECT id_categoria FROM partidos WHERE id_partido = ?`;

    db.query(partidoQuery, [idPartido], (err, partidoData) => {
        if (err) {
            console.error('Error en la consulta de partidos:', err);
            return res.status(500).send('Error en la base de datos');
        }

        if (!partidoData || partidoData.length === 0) {
            return res.status(404).send('Partido no encontrado');
        }

        const idCategoria = partidoData[0].id_categoria;

        // Query para insertar las expulsiones
        const expulsionInsertQuery = `
            INSERT INTO expulsados (id_partido, id_jugador, minuto, descripcion, motivo, estado, fechas, fechas_restantes, multa)
            VALUES (?, ?, ?, ?, ?, 'A', 1, 1, 'N')
        `;

        rojas.forEach((roja) => {
            const { id_partido, id_jugador, minuto, descripcion, motivo } = roja;

            db.query(expulsionInsertQuery, [id_partido, id_jugador, minuto, descripcion || '', motivo], (err) => {
                if (err) {
                    console.error('Error al insertar expulsión:', err);
                    return res.status(500).send('Error al registrar expulsión');
                }

                // Actualizar la columna 'sancionado' en la tabla 'planteles'
                const updateSancionadoQuery = `
                    UPDATE planteles 
                    SET sancionado = 'S' 
                    WHERE id_jugador = ? AND id_categoria = ?
                `;

                db.query(updateSancionadoQuery, [id_jugador, idCategoria], (err) => {
                    if (err) {
                        console.error('Error al actualizar sancionado:', err);
                        return res.status(500).send('Error al actualizar sanción');
                    }
                });
            });
        });

        res.send('Expulsiones y sanciones registradas exitosamente');
    });
};

const crearAmarillas = (req, res) => {
    const amarillas = req.body;

    if (!Array.isArray(amarillas)) {
        return res.status(400).send('Bad request: Expected an array of yellow cards');
    }

    const values = amarillas.map(({ id_partido, id_jugador, minuto }) => 
        [id_partido, id_jugador, minuto]
    );

    const query = `
        INSERT INTO amonestados
        (id_partido, id_jugador, minuto) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting yellow cards:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Amarillas registradas con éxito');
    });
};

// !CORROBORAR
const insertarJugadoresEventuales = (req, res) => {
    const jugadores = req.body;

    if (!Array.isArray(jugadores)) {
        return res.status(400).send('Bad request: Expected an array of eventual players');
    }

    const promises = jugadores.map(({ id_jugador, dni, nombre, apellido, posicion, id_equipo, id_edicion, id_categoria, eventual, sancionado }) => {
        return new Promise((resolve, reject) => {
            // Consulta para verificar si el jugador ya existe
            const selectQuery = `
                SELECT id_jugador FROM jugadores WHERE dni = ? LIMIT 1;
            `;

            db.query(selectQuery, [dni], (err, selectResult) => {
                if (err) {
                    console.error('Error checking for existing player:', err);
                    return reject(err);
                }

                if (selectResult.length > 0) {
                    const existingJugadorId = selectResult[0].id_jugador;
                    
                    // Si el jugador ya existe, agregarlo a la tabla planteles
                    const insertPlantelQuery = `
                        INSERT INTO planteles (id_equipo, id_jugador, id_edicion, id_categoria, eventual, sancionado) 
                        VALUES (?, ?, ?, ?, ?, ?);
                    `;
                    
                    db.query(insertPlantelQuery, [id_equipo, existingJugadorId, id_edicion, id_categoria, eventual, sancionado], (err, plantelResult) => {
                        if (err) {
                            console.error('Error inserting into planteles:', err);
                            return reject(err);
                        }
                        resolve(`Player with DNI ${dni} added to planteles.`);
                    });
                } else {
                    // Si no existe, procedemos a la inserción
                    const insertQuery = `
                        CALL sp_crear_jugador_eventual(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    `;
                    db.query(insertQuery, [id_jugador, dni, nombre, apellido, posicion, id_equipo, id_edicion, id_categoria, eventual, sancionado], (err, insertResult) => {
                        if (err) {
                            console.error('Error inserting eventual player:', err);
                            return reject(err);
                        }
                        resolve(insertResult);
                    });
                }
            });
        });
    });

    Promise.all(promises)
        .then((results) => {
            res.send('Jugadores registrados con éxito');
        })
        .catch(err => {
            console.error('Error during Promise.all:', err);
            res.status(500).send('Internal server error');
        });
};

const partidosJugadorEventual = (req, res) => {
    const { id_categoria } = req.query
    db.query(
        `SELECT DISTINCT
            j.id_jugador, 
            j.dni, j.nombre, 
            j.apellido, 
            pl.id_equipo, 
            pl.sancionado 
            FROM 
            jugadores AS j 
            INNER JOIN formaciones as f ON f.id_jugador = j.id_jugador 
            INNER JOIN partidos as p ON p.id_partido = f.id_partido
            INNER JOIN planteles AS pl ON j.id_jugador = pl.id_jugador
            WHERE pl.eventual = 'S' AND pl.id_categoria = ${id_categoria};`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
}

const crearJugador = (req, res) => {
    const { dni, nombre, apellido, posicion, id_equipo } = req.body;
    console.log(dni, nombre, apellido, posicion, id_equipo);
    db.query('INSERT INTO jugadores(dni, nombre, apellido, posicion, id_equipo) VALUES (?, ?, ?, ?, ?);', 
        [dni, nombre, apellido, posicion, id_equipo],
        (err, result) => {
            if (err) {
                if (err.sqlState === '45000') {
                    return res.status(400).send(err.sqlMessage);
                }
                console.error("Error al insertar el jugador en la tabla jugadores:", err);
                return res.status(500).send("Error interno del servidor");
            }
            res.status(200).send("Jugador creado exitosamente");
        }
    );
}

const getCategorias = (req, res) => {
    db.query('SELECT * FROM categorias', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const insertarJugadoresDestacados = (req, res) => {
    const dreamTeam = req.body;

    if (!Array.isArray(dreamTeam)) {
        return res.status(400).send('Bad request: Expected an array of dreamTeam');
    }

    const values = dreamTeam.map(({ id_partido, id_equipo, id_jugador, id_categoria }) => 
        [id_partido, id_equipo, id_jugador, id_categoria]
    );

    const query = `
        INSERT INTO jugadores_destacados
        (id_partido, id_equipo, id_jugador, id_categoria) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting dreamteam:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('DreamTeam registrado con éxito');
    });
};

const armarDreamteam = (req, res) => {
    const { id_categoria, fecha } = req.body;

    if (!id_categoria || !fecha) {
        return res.status(400).send('Faltan datos necesarios');
    }

    const query = `call sp_dreamteam(?, ?)`;

    db.query(query, [fecha, id_categoria], (err, result) => {
        if (err) {
            console.error('Error armando dreamteam:', err);
            return res.status(500).send('Internal server error');
        }
        res.send(result[0]);
    });
}

module.exports = {
    getUsers,
    getRoles,
    getPartidos,
    getEquipos,
    getJugadores,
    crearFormaciones,
    crearGoles,
    crearAsistencias,
    crearRojas,
    crearAmarillas,
    insertarJugadoresEventuales,
    partidosJugadorEventual,
    crearJugador,
    getCategorias,
    insertarJugadoresDestacados,
    armarDreamteam
};
