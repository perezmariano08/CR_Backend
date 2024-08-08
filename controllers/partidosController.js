const db = require('../utils/db');

const getIncidenciasPartido = (req, res) => {
    const { id_partido } = req.query;

    db.query('CALL sp_partidos_incidencias(?)', [id_partido], (err, result) => {
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

const getFormacionesPartido = (req, res) => {
    const { id_partido } = req.query;


    // Luego, obtiene las formaciones del partido
    db.query('CALL sp_partidos_formaciones(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado de formaciones:", err);
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
};

const crearPartido = (req, res) => {
    const { id_temporada, id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero } = req.body;
    db.query(`
        INSERT INTO partidos
        (id_temporada, 
        id_equipoLocal, 
        id_equipoVisita, 
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [id_temporada, id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Temporada registrada con éxito');
    });
};


module.exports = {
    getIncidenciasPartido,
    getFormacionesPartido,
    crearPartido
};