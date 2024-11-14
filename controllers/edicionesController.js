const db = require('../utils/db');

const getEdiciones = (req, res) => {
    db.query(
        `SELECT
            e.id_edicion,
            e.nombre,
            CONCAT(e.nombre, ' ', e.temporada) AS nombre_temporada,
            e.temporada,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F'), 0),
                ' / ',
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion), 0)
            ) AS partidos,
            IFNULL((SELECT COUNT(*) FROM planteles pl WHERE pl.id_edicion = e.id_edicion), 0) AS jugadores,
            IFNULL((SELECT COUNT(*) FROM temporadas t WHERE t.id_edicion = e.id_edicion), 0) AS equipos,
            IFNULL((SELECT COUNT(*) FROM categorias c WHERE c.id_edicion = e.id_edicion), 0) AS categorias,
            CASE
                WHEN (SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F') = 0 THEN 'SIN EMPEZAR'
                WHEN (SELECT COUNT(*) FROM partidos p WHERE p.id_edicion = e.id_edicion AND p.estado = 'F') > 0 THEN 'JUGANDO'
                ELSE 'SIN EMPEZAR'
            END AS estado,
            e.cantidad_eventuales,
            e.partidos_eventuales,
            e.apercibimientos,
            e.puntos_descuento
        FROM 
            ediciones e
        ORDER BY
            e.temporada DESC, e.id_edicion DESC;`,
        (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearEdicion = (req, res) => {
    const { nombre, temporada, cantidad_eventuales, partidos_eventuales, apercibimientos, puntos_descuento } = req.body;
    db.query(
        `INSERT INTO 
        ediciones(id_torneo, nombre, temporada, cantidad_eventuales, partidos_eventuales, apercibimientos, puntos_descuento) 
        VALUES (1, ?, ?, ?, ?, ?, ?)`, [nombre, temporada, cantidad_eventuales, partidos_eventuales, apercibimientos, puntos_descuento], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Edición registrada con éxito');
    });
};

const actualizarEdicion = (req, res) => {
    const { nombre, temporada, cantidad_eventuales, partidos_eventuales, apercibimientos, puntos_descuento, id_edicion } = req.body;
    
    // Validar que id_usuario esté presente
    if (!id_edicion) {
        return res.status(400).send('ID de edicion es requerido');
    }
    // Construir la consulta SQL
    const sql = `
        UPDATE ediciones
        SET 
            nombre = ?, 
            temporada = ?, 
            cantidad_eventuales = ?, 
            partidos_eventuales = ?, 
            apercibimientos = ?,
            puntos_descuento = ?
        WHERE id_edicion = ?
    `;

    // Ejecutar la consulta
    db.query(sql, [nombre, temporada, cantidad_eventuales, partidos_eventuales, apercibimientos, puntos_descuento, id_edicion], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Edicion actualizada exitosamente');
    });
};

const eliminarEdicion = (req, res) => {
    const { id } = req.body;
    console.log(id);
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM ediciones WHERE id_edicion = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

module.exports = {
    getEdiciones,
    crearEdicion,
    actualizarEdicion,
    eliminarEdicion
};