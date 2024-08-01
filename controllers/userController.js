const db = require('../utils/db');

const getUsers = (req, res) => {
    db.query(`SELECT
                u.id_usuario,
                u.dni,
                u.nombre,
                u.apellido,
                DATE_FORMAT(u.nacimiento, '%d/%m/%Y') AS nacimiento,
                u.telefono,
                u.email,
                r.nombre,
                u.fecha_creacion,
                u.fecha_actualizacion,
                u.img
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

const getPartidos = (req, res) => {
    db.query(
        `SELECT
            p.id_partido,
            divisiones.nombre as division,
            torneos.nombre as torneo,
            años.año as año,
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
            p.id_planillero,
            j.nombre AS jugador_destacado
        FROM 
            partidos p
        INNER JOIN 
            temporadas t ON p.id_temporada = t.id_temporada
        INNER JOIN 
            equipos e1 ON p.id_equipoLocal = e1.id_equipo
        INNER JOIN 
            equipos e2 ON p.id_equipoVisita = e2.id_equipo
        INNER JOIN
            divisiones ON divisiones.id_division = t.id_division
        INNER JOIN
            torneos ON torneos.id_torneo = t.id_torneo
        INNER JOIN
            años ON años.id_año = t.id_año
        LEFT JOIN 
            usuarios u ON p.id_planillero = u.id_usuario
        LEFT JOIN 
            jugadores j ON p.id_jugador_destacado = j.id_jugador`
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
        INNER JOIN equipos AS e ON e.id_equipo = j.id_equipo;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const updatePartido = (req, res) => {
    const { goles_local, goles_visita, descripcion, estado, id_jugador_destacado, id_partido} = req.body;
    console.log('Request received:', req.body);

    if (!id_partido) {
        return res.status(400).send('ID de partido es requerido');
    }

    const sql = `
        UPDATE partidos
        SET 
            goles_local = ?, 
            goles_visita = ?, 
            descripcion = ?,
            estado = ?,
            id_jugador_destacado = ?
        WHERE id_partido = ?
    `;

    db.query(sql, [goles_local, goles_visita, descripcion, estado, id_jugador_destacado, id_partido], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Partido actualizado exitosamente');
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

    const values = rojas.map(({ id_partido, id_jugador, minuto, descripcion = '', motivo, estado = 'A', fechas = 1 }) => {
        if (!id_partido || !id_jugador || !minuto || !motivo) {
            return res.status(400).send('Missing required fields');
        }
        return [id_partido, id_jugador, minuto, descripcion, motivo, estado, fechas];
    });

    if (values.some(value => value instanceof Error)) {
        return; // Return early if there were validation errors
    }

    const query = `
        INSERT INTO expulsados
        (id_partido, id_jugador, minuto, descripcion, motivo, estado, fechas) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting red cards:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Rojas registradas con éxito');
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

const insertarJugadoresEventuales = (req, res) => {
    const jugadores = req.body;

    if (!Array.isArray(jugadores)) {
        return res.status(400).send('Bad request: Expected an array of eventual players');
    }

    // Map the jugadores array to the required format
    const values = jugadores.map(({ id_jugador, dni, nombre, apellido, id_equipo, eventual, sancionado }) => 
        [id_jugador, dni, nombre, apellido, id_equipo, eventual, sancionado]
    );

    // Ensure there is data to insert
    if (values.length === 0) {
        return res.status(400).send('No data to insert');
    }

    const query = `
        INSERT INTO jugadores
        (id_jugador, dni, nombre, apellido, id_equipo, eventual, sancionado) 
        VALUES ?;
    `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error inserting eventual players:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Jugadores registrados con éxito');
    });
};

const partidosJugadorEventual = (req, res) => {
    db.query(
        `SELECT 
            j.id_jugador, 
            j.dni, j.nombre, 
            j.apellido, 
            j.id_equipo, 
            j.sancionado 
            FROM 
            jugadores AS j 
            INNER JOIN formaciones as f ON f.id_jugador = j.id_jugador 
            INNER JOIN partidos as p ON p.id_partido = f.id_partido 
            WHERE j.eventual = 'S';`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
}

module.exports = {
    getUsers,
    getRoles,
    getPartidos,
    getEquipos,
    getJugadores,
    updatePartido,
    crearFormaciones,
    crearGoles,
    crearAsistencias,
    crearRojas,
    crearAmarillas,
    insertarJugadoresEventuales,
    partidosJugadorEventual
};
