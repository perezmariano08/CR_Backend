const db = require('../utils/db');

const getPosicionesTemporada = (req, res) => {
    const { id_zona } = req.query;

    db.query('CALL sp_posiciones_zona(?)', [id_zona], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const getEstadisticasCategoria = (req, res) => {
    const { id_categoria, estadistica } = req.query;

    db.query('CALL sp_estadisticas_categoria(?,?)', [id_categoria, estadistica], (err, result) => {
            if (err) {
                console.error("Error al ejecutar el procedimiento almacenado:", err);
                if (err.sqlState === '45000') {
                    return res.status(400).send(err.sqlMessage);
                }
                return res.status(500).send("Error interno del servidor");
            }

            // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
            if (!result || result.length === 0) {
                return res.status(404).send("No se encontraron goleadores para la temporada especificada.");
            }

            // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
            const [rows] = result;

            // Devuelve los datos
            res.status(200).json(rows);
        });
}

const getZonas = (req, res) => {
    db.query(`SELECT
        z.id_zona,
        c.id_categoria,
        CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
        c.nombre AS nombre_categoria,
        z.nombre AS nombre_zona,
        c.genero AS genero
    FROM
        categorias AS c
        INNER JOIN ediciones AS e ON e.id_edicion = c.id_edicion
        INNER JOIN zonas AS z ON z.id_categoria = c.id_categoria
    ORDER BY 3`, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

module.exports = {
    getPosicionesTemporada,
    getEstadisticasCategoria,
    getZonas
};