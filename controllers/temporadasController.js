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

module.exports = {
    getPosicionesTemporada
};