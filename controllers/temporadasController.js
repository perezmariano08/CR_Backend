const db = require('../utils/db');

const getPosicionesTemporada = (req, res) => {
    const { id_temporada } = req.query;

    db.query('CALL sp_posiciones_temporada(?)', [id_temporada], (err, result) => {
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

const getEstadisticasTemporada = (req, res) => {
    const { id_temporada, estadistica } = req.query;

    db.query('CALL sp_estadisticas_temporada(?,?)', [estadistica, id_temporada], (err, result) => {
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

const getTemporadas = (req, res) => {
    db.query(`SELECT 
        id_temporada, 
        torneos.nombre AS torneo, 
        categorias.nombre AS categoria, 
        años.año, 
        sedes.nombre AS sede, 
        divisiones.nombre AS division,
        temporadas.descripcion,
        CONCAT(divisiones.nombre, ' - ', torneos.nombre, ' ', años.año) AS nombre_temporada
            FROM temporadas 
            INNER JOIN torneos ON temporadas.id_torneo = torneos.id_torneo 
            INNER JOIN categorias ON temporadas.id_categoria = categorias.id_categoria 
            INNER JOIN años ON temporadas.id_año = años.id_año 
            INNER JOIN sedes ON temporadas.id_sede = sedes.id_sede
            INNER JOIN divisiones ON temporadas.id_division = divisiones.id_division`, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

module.exports = {
    getPosicionesTemporada,
    getEstadisticasTemporada,
    getTemporadas
};