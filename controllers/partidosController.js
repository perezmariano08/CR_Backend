const db = require('../utils/db');

const getIncidenciasPartido = (req, res) => {
    const { id_partido } = req.query;

    // Verifica que id_partido está siendo recibido
    console.log("ID Partido:", id_partido);

    db.query('CALL sp_partidos_incidencias(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Imprime el resultado completo para depuración
        console.log("Resultado del procedimiento almacenado:", result);

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Verifica el contenido de rows
        console.log("Datos de incidencias:", rows);

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const getFormacionesPartido = (req, res) => {
    const { id_partido } = req.query;

    // Verifica que id_partido está siendo recibido
    console.log("ID Partido:", id_partido);

    db.query('CALL sp_partidos_formaciones(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Imprime el resultado completo para depuración
        console.log("Resultado del procedimiento almacenado:", result);

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Verifica el contenido de rows
        console.log("Datos de incidencias:", rows);

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

module.exports = {
    getIncidenciasPartido,
    getFormacionesPartido
};