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
                u.fecha_actualizacion
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
    const { goles_local, goles_visita, descripcion, estado, id_partido} = req.body;
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
            estado = ?
        WHERE id_partido = ?
    `;

    db.query(sql, [goles_local, goles_visita, descripcion, estado, id_partido], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Usuario actualizado exitosamente');
    });
};


module.exports = {
    getUsers,
    getRoles,
    getEquipos,
    getPartidos,
    getJugadores,
    updatePartido
};
