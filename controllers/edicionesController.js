const db = require('../utils/db');


const getEdiciones = (req, res) => {
    db.query(
        `SELECT
            e.id_edicion,
            CONCAT(e.nombre, ' ', e.temporada) AS nombre,
            e.temporada,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F'), 0),
                ' / ',
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion), 0)
            ) AS partidos,
            IFNULL((SELECT COUNT(*) FROM jugadores j WHERE j.id_edicion = e.id_edicion), 0) AS jugadores,
            IFNULL((SELECT COUNT(*) FROM equipos eq WHERE eq.id_edicion = e.id_edicion), 0) AS equipos,
            IFNULL((SELECT COUNT(*) FROM categorias c WHERE c.id_edicion = e.id_edicion), 0) AS categorias,
            CASE
                WHEN (SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F') = 0 THEN 'SIN EMPEZAR'
                WHEN (SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F') > 0 THEN 'JUGANDO'
                ELSE 'SIN EMPEZAR'
            END AS estado
        FROM 
            ediciones e
        ORDER BY
            e.temporada DESC, e.id_edicion DESC`,
        (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearEdicion = (req, res) => {
    const { id_torneo = 7, nombre, temporada, puntos_victoria, puntos_empate, puntos_derrota } = req.body;
    db.query(
        `INSERT INTO 
        ediciones(nombre, temporada, puntos_victoria, puntos_empate, puntos_derrota) 
        VALUES (?, ?, ?, ?, ?)`, [nombre, temporada, puntos_victoria, puntos_empate, puntos_derrota], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Edición registrada con éxito');
    });
};

module.exports = {
    getEdiciones,
    crearEdicion
};