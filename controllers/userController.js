const db = require('../utils/db');

const getUsers = (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
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
            c.nombre as categoria,
            e.descripcion
        FROM equipos as e
        INNER JOIN categorias as c ON c.id_categoria = e.id_categoria`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getJugadores = (req, res) => {
    db.query(
        `SELECT 
        jugadores.id_jugador, 
        jugadores.dni, 
        jugadores.nombre as jugador, 
        jugadores.posicion as posicion, 
        equipos.nombre as equipo,
        jugadores.img
        FROM jugadores 
        INNER JOIN equipos ON equipos.id_equipo = jugadores.id_equipo;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

module.exports = {
    getUsers,
    getRoles,
    getEquipos,
    getPartidos,
    getJugadores
};
