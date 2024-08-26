const db = require('../utils/db');

const getPlanteles = (req, res) => {
    db.query(
        `SELECT 
            CONCAT(UPPER(j.apellido), ', ', j.nombre) AS jugador,
            p.id_equipo,
            e.nombre AS equipo,
            p.id_categoria,
            c.nombre as nombre_categoria,
            p.id_edicion,
            CONCAT(ed.nombre, ' ', ed.temporada) as edicion,
            p.eventual,
            j.id_jugador, 
            j.dni, 
            j.nombre as nombre_jugador, 
            j.apellido, 
            j.posicion, 
            j.img,
            j.sancionado
        FROM 
            planteles p
        INNER JOIN 
            jugadores j ON p.id_jugador = j.id_jugador
        INNER JOIN 
            equipos e ON p.id_equipo = e.id_equipo
        INNER JOIN 
            ediciones ed ON p.id_edicion = ed.id_edicion
        INNER JOIN 
            categorias c ON p.id_categoria = c.id_categoria
        ORDER BY
            j.apellido`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};


module.exports = {
    getPlanteles
};