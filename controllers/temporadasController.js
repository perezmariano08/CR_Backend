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
        c.genero AS genero,
        z.tipo_zona,
        z.cantidad_equipos,
        z.fase,
        z.id_etapa,
        et.nombre AS nombre_etapa -- Agrega el nombre de la etapa
    FROM
        categorias AS c
        INNER JOIN ediciones AS e ON e.id_edicion = c.id_edicion
        INNER JOIN zonas AS z ON z.id_categoria = c.id_categoria
        INNER JOIN etapas AS et ON et.id_etapa = z.id_etapa -- Asegúrate de que esta relación sea correcta
    ORDER BY
        3;
    `, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getTemporadas = (req, res) => {
    db.query(`
    SELECT
        t.id_zona, 
        t.id_edicion, 
        t.id_categoria, 
        t.id_equipo, 
        e.nombre AS nombre_equipo,
        t.vacante,
        t.apercibimientos,
        (SELECT COUNT(*)
            FROM planteles p
            INNER JOIN jugadores j ON p.id_jugador = j.id_jugador
            WHERE p.id_equipo = t.id_equipo
            AND j.dni IS NOT NULL
            AND p.eventual = 'N') AS jugadores_con_dni,
        (SELECT COUNT(*)
            FROM planteles p
            INNER JOIN jugadores j ON p.id_jugador = j.id_jugador
            WHERE p.id_equipo = t.id_equipo
            AND j.dni IS NULL
            AND p.eventual = 'N') AS jugadores_sin_dni
    FROM 
        temporadas t
        INNER JOIN equipos e ON e.id_equipo = t.id_equipo;
`, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const InsertarEquipoTemporada = (req, res) => {
    const { id_categoria, id_edicion, id_zona, id_equipo, vacante } = req.body;
    const query = `
        INSERT INTO 
        temporadas(id_categoria, id_edicion, id_zona, id_equipo, vacante) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        id_zona = VALUES(id_zona), 
        vacante = VALUES(vacante)
    `;

    db.query(query, [id_categoria, id_edicion, id_zona, id_equipo, vacante], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Edición registrada o actualizada con éxito');
    });
};

const eliminarEquipoTemporada = (req, res) => {
    const { id_equipo, id_categoria, id_edicion } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM temporadas WHERE id_equipo = ? AND id_categoria = ? AND id_edicion = ?';

    db.query(sql, [id_equipo, id_categoria, id_edicion], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

module.exports = {
    getPosicionesTemporada,
    getEstadisticasCategoria,
    getZonas,
    getTemporadas,
    InsertarEquipoTemporada,
    eliminarEquipoTemporada
};