const db = require('../utils/db');

const getExpulsados = (req, res) => {
    db.query(
        `SELECT
            e.id_expulsion,
            e.id_jugador,
            eq.id_equipo,
            CONCAT(j.apellido, ', ' ,j.nombre)  as jugador,
            e.fechas as sancion,
            e.motivo,
            e.estado,
            j.sancionado
        FROM	
            expulsados as e
            INNER JOIN jugadores as j ON j.id_jugador = e.id_jugador
            INNER JOIN equipos as eq ON eq.id_equipo = e.id_jugador;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};


module.exports = {
    getExpulsados
};
